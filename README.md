# DataBank Site — MVP Motor de Consentimento

Plataforma de **monetização de dados com consentimento explícito**, focada em conformidade com a LGPD e o Open Finance brasileiro.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Prisma** (SQLite) — modelos: Lead, User, Consent, ConsentLog, DataConnection
- **NextAuth v4** — autenticação com suporte a MFA (TOTP)
- **Pino** — logging estruturado de auditoria
- **Jest + Testing Library** — testes unitários (30 testes)
- **Playwright** — testes end-to-end
- **Husky + lint-staged** — hooks de pre-commit

## Funcionalidades do MVP

### Motor de Consentimento

- **`/dashboard/consent`** — Dashboard onde o usuário visualiza, revoga e exporta seus consentimentos
- **`components/consent-engine/ConsentCard`** — Card de consentimento com status e botão de revogação
- **`components/consent-engine/ConsentCheckIn`** — Fluxo de aceite granular por finalidade (não "aceite tudo")
- **`components/consent-engine/ConsentDashboard`** — Dashboard com filtros e exportação

### API de Consentimento (LGPD-compliant)

| Método  | Endpoint              | Descrição                                   |
| ------- | --------------------- | ------------------------------------------- |
| `GET`   | `/api/consent`        | Lista consentimentos do usuário autenticado |
| `POST`  | `/api/consent`        | Registra novo consentimento granular        |
| `PATCH` | `/api/consent/:id`    | Revoga consentimento ativo                  |
| `GET`   | `/api/consent/export` | Portabilidade de dados (Art. 18, V LGPD)    |

### Open Finance

| Método | Endpoint                    | Descrição                                    |
| ------ | --------------------------- | -------------------------------------------- |
| `POST` | `/api/open-finance/connect` | Inicia conexão de conta bancária             |
| `POST` | `/api/open-finance/webhook` | Recebe eventos do provedor (HMAC verificado) |

### Páginas

- **`/privacy`** — Centro de Privacidade dinâmico (bases legais, direitos, dados processados)
- **`/auth/signin`** — Login com suporte a MFA
- **`/dashboard/consent`** — Gerenciamento de consentimentos

## Quick Start (PoC)

```bash
pnpm install
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## MVP — Com banco de dados e autenticação

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# 2. Inicialize o banco de dados
DATABASE_URL="file:./data/db.sqlite" pnpm prisma migrate dev --name consent_engine_mvp

# 3. Inicie com persistência ativada
PERSIST_LEADS=true DATABASE_URL="file:./data/db.sqlite" pnpm dev
```

## Variáveis de ambiente

| Variável                      | Padrão  | Descrição                                                   |
| ----------------------------- | ------- | ----------------------------------------------------------- |
| `DATABASE_URL`                | —       | URL do banco SQLite (ex.: `file:./db.sqlite`)               |
| `NEXTAUTH_URL`                | —       | URL base da aplicação (ex.: `http://localhost:3000`)        |
| `NEXTAUTH_SECRET`             | —       | Segredo JWT para NextAuth (gere com `openssl rand -hex 32`) |
| `LOG_LEVEL`                   | `info`  | Nível de log do Pino                                        |
| `PERSIST_LEADS`               | `false` | Se `true`, salva leads no banco via Prisma                  |
| `OPEN_FINANCE_PROVIDER`       | —       | `pluggy` ou `belvo`                                         |
| `OPEN_FINANCE_CLIENT_ID`      | —       | Client ID do provedor Open Finance                          |
| `OPEN_FINANCE_CLIENT_SECRET`  | —       | Client Secret do provedor Open Finance                      |
| `OPEN_FINANCE_WEBHOOK_SECRET` | —       | Segredo HMAC para verificação de webhooks                   |
| `OPEN_FINANCE_MOCK`           | `false` | Se `true`, usa respostas mock (sem credenciais reais)       |

## Conformidade

Veja [COMPLIANCE.md](./COMPLIANCE.md) para detalhes sobre:

- Bases legais (Art. 7º e 10 LGPD)
- Arquitetura do Motor de Consentimento
- Direitos dos titulares (Art. 18 LGPD)
- Open Finance (Resolução Conjunta nº 1 BACEN/CMN)
- Roadmap de conformidade

## Testes

### Unitários (30 testes)

```bash
pnpm test
```

Cobertura dos componentes do Motor de Consentimento:

- `ConsentCard` — 10 testes
- `ConsentCheckIn` — 9 testes
- `ConsentDashboard` — 8 testes
- `CTAForm` — 3 testes

### End-to-end (Playwright)

```bash
pnpm playwright install --with-deps
pnpm test:e2e
```

## Docker

```bash
docker compose up --build
```

## CI

O workflow `.github/workflows/ci.yml` executa lint, testes unitários e testes e2e em cada push/PR.
