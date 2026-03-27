# COMPLIANCE.md — DataBank: Arquitetura Privacy-First

> Versão: 0.1.0 MVP | Atualizado em: 2026-03-27

---

## 1. Visão Geral

Este documento descreve a arquitetura de privacidade e conformidade do **DataBank**, uma fintech de monetização de dados com consentimento explícito, desenvolvida em conformidade com:

- **LGPD** — Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
- **Resolução Conjunta nº 1 BACEN/CMN** — Compartilhamento de dados no Open Finance brasileiro
- **Diretrizes da ANPD** — Autoridade Nacional de Proteção de Dados

---

## 2. Papéis de Privacidade (Art. 5º LGPD)

| Papel               | Entidade                       | Contato                       |
| ------------------- | ------------------------------ | ----------------------------- |
| **Controlador**     | DataBank Tecnologia Financeira | privacidade@databank.com.br   |
| **Operador**        | Provedores de infraestrutura   | (conforme contratos de dados) |
| **DPO/Encarregado** | A ser designado (Art. 41 LGPD) | privacidade@databank.com.br   |

---

## 3. Bases Legais Utilizadas (Art. 7º e 10 LGPD)

| Operação de Dados                             | Base Legal                           | Inciso           |
| --------------------------------------------- | ------------------------------------ | ---------------- |
| Autenticação e criação de conta               | Execução de contrato                 | Art. 7º, V       |
| Análise de crédito e score financeiro         | Consentimento explícito              | Art. 7º, II      |
| Compartilhamento com parceiros (Open Finance) | Consentimento + legítimo interesse   | Art. 7º, II e IX |
| Prevenção a fraudes (KYC)                     | Obrigação legal / interesse legítimo | Art. 7º, II e IX |
| Logs de auditoria                             | Obrigação legal (ANPD/BACEN)         | Art. 7º, II      |
| Dados comportamentais (personalização)        | Consentimento explícito              | Art. 7º, II      |

> ⚠️ **Regra geral**: todo processamento baseado em consentimento requer opt-in granular. O DataBank **nunca** utiliza "aceite único de tudo".

---

## 4. Motor de Consentimento (Consent Engine)

### 4.1 Modelo de Dados

```
Consent {
  id          CUID (imutável)
  userId      Referência ao usuário
  dataCategory  "financial" | "location" | "behavioral" | "identity"
  purpose     Finalidade específica e detalhada
  recipientId Identificador do receptor dos dados
  expiresAt   Data de expiração (nullable)
  status      "active" | "revoked" | "expired"
  grantedAt   Timestamp de concessão
  revokedAt   Timestamp de revogação
}

ConsentLog {
  id          CUID
  consentId   Referência ao consentimento
  action      "granted" | "revoked" | "updated" | "expired"
  actorIp     IP do agente
  metadata    JSON com contexto
  createdAt   Timestamp (imutável — append-only)
}
```

### 4.2 Princípios de Implementação

- **Granularidade**: cada finalidade tem seu próprio registro de consentimento. Não existe "aceite único".
- **Imutabilidade do log**: `ConsentLog` é append-only. Nenhum registro é deletado ou atualizado.
- **Revogabilidade**: o usuário pode revogar qualquer consentimento a qualquer momento via `/dashboard/consent` ou `PATCH /api/consent/:id`.
- **Portabilidade**: exportação completa via `GET /api/consent/export` em JSON legível por máquina (Art. 18, V LGPD).
- **Auditabilidade**: toda ação é registrada com timestamp, IP e metadata, permitindo resposta a requisições da ANPD.

---

## 5. Open Finance (Resolução Conjunta nº 1 BACEN/CMN)

### 5.1 Arquitetura

```
Usuário → Widget (Pluggy/Belvo) → DataBank API → DataConnection (DB)
                                       ↓
                                   Webhook → processamento assíncrono
```

### 5.2 Garantias

- O DataBank **não armazena credenciais bancárias** — toda autenticação é delegada ao provedor certificado (Pluggy ou Belvo).
- Os webhooks são verificados via assinatura HMAC-SHA256 antes de qualquer processamento.
- As conexões de dados têm status rastreável: `pending → connected → error | disconnected`.
- Cada conexão requer consentimento explícito prévio do usuário.

---

## 6. Autenticação e Segurança (GRC)

### 6.1 Autenticação

- **Provedor**: NextAuth v4 com estratégia JWT
- **MFA**: suporte a TOTP via campo `mfaSecret` no modelo `User`. Scaffold implementado; produção deve integrar `speakeasy` ou `otplib`.
- **Senhas**: hash com SHA-256 no scaffold MVP. **Produção deve usar bcrypt (custo ≥ 12) ou Argon2id**.
- **Sessões**: JWT com sub = userId, sem persistência de sessão no banco.

### 6.2 Controles de Segurança

| Controle                          | Status         | Detalhe                                  |
| --------------------------------- | -------------- | ---------------------------------------- |
| TLS em trânsito                   | ✅ Obrigatório | Configurado no load balancer / CDN       |
| Hash de senha                     | ⚠️ MVP         | SHA-256 → Argon2id em produção           |
| MFA                               | ✅ Scaffold    | TOTP; integração otplib pendente         |
| Rate limiting                     | 📋 Pendente    | Implementar no middleware Next.js        |
| Verificação de assinatura webhook | ✅ Impl.       | HMAC-SHA256                              |
| Logs de auditoria                 | ✅ Impl.       | Pino (estruturado) + ConsentLog (DB)     |
| Menor privilégio (API)            | ✅ Impl.       | Endpoints validam userId da sessão       |
| CORS                              | 📋 Pendente    | Configurar em next.config.js p/ produção |

---

## 7. Direitos dos Titulares (Art. 18 LGPD)

| Direito                       | Endpoint / Mecanismo                      | Status |
| ----------------------------- | ----------------------------------------- | ------ |
| Confirmação de tratamento     | `GET /api/consent`                        | ✅     |
| Acesso                        | `GET /api/consent` + `/dashboard/consent` | ✅     |
| Correção                      | Formulário de perfil (pendente)           | 📋     |
| Anonimização / Eliminação     | Rota de exclusão de conta (pendente)      | 📋     |
| **Portabilidade**             | `GET /api/consent/export`                 | ✅     |
| **Revogação**                 | `PATCH /api/consent/:id`                  | ✅     |
| Informação sobre partilha     | `/privacy` — Centro de Privacidade        | ✅     |
| Revisão de decisão automática | Formulário de contato DPO (pendente)      | 📋     |

---

## 8. Retenção de Dados

| Tipo de Dado               | Período de Retenção            | Base                                   |
| -------------------------- | ------------------------------ | -------------------------------------- |
| Logs de consentimento      | Indefinido (append-only)       | Obrigação regulatória ANPD             |
| Dados financeiros          | 5 anos após término de relação | BACEN Circular 3.978 / Resolução 4.658 |
| Dados de autenticação      | Sessão + 30 dias de log        | Políticas de segurança                 |
| Dados de marketing (leads) | 2 anos ou revogação            | Consentimento                          |

---

## 9. Notificação de Incidentes (Art. 48 LGPD)

Em caso de incidente de segurança com dados pessoais, o DataBank se compromete a:

1. Notificar a **ANPD** em até **72 horas** após a identificação (conforme prazo adotado por analogia ao GDPR e orientações da ANPD).
2. Notificar os **titulares afetados** quando houver risco relevante.
3. Documentar o incidente no **Registro de Incidentes** interno (procedimento a criar).

---

## 10. Próximos Passos (Roadmap de Conformidade)

- [ ] Designar DPO formal (Art. 41 LGPD)
- [ ] Completar RIPD (Relatório de Impacto à Proteção de Dados)
- [ ] Implementar bcrypt/Argon2id para senhas em produção
- [ ] Implementar rate limiting nas APIs
- [ ] Criar fluxo de exclusão de conta (Art. 18, VI LGPD)
- [ ] Configurar CORS restritivo em produção
- [ ] Integrar `otplib` para validação real de TOTP
- [ ] Audit externo de segurança antes do lançamento público
- [ ] Registrar DataBank como Instituição Participante do Open Finance (BACEN)

---

_Este documento é vivo e deve ser atualizado a cada release significativo._
