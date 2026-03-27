# DataBank Site — MVP Motor de Consentimento

Plataforma de **monetização de dados com consentimento explícito**, focada em conformidade com a LGPD e o Open Finance brasileiro.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Prisma** (PostgreSQL) — modelos: Lead, User, Consent, ConsentLog, DataConnection
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

# 2. Inicialize o banco de dados (requer PostgreSQL acessível via DATABASE_URL)
pnpm prisma migrate dev --name consent_engine_mvp

# 3. Inicie com persistência ativada
PERSIST_LEADS=true pnpm dev
```

## Variáveis de ambiente

| Variável                      | Padrão  | Descrição                                                                                      |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                | —       | URL do banco PostgreSQL (ex.: `postgresql://user:password@host:5432/databank?sslmode=require`) |
| `NEXTAUTH_URL`                | —       | URL base da aplicação (ex.: `http://localhost:3000`)                                           |
| `NEXTAUTH_SECRET`             | —       | Segredo JWT para NextAuth (gere com `openssl rand -hex 32`)                                    |
| `LOG_LEVEL`                   | `info`  | Nível de log do Pino                                                                           |
| `PERSIST_LEADS`               | `false` | Se `true`, salva leads no banco via Prisma                                                     |
| `OPEN_FINANCE_PROVIDER`       | —       | `pluggy` ou `belvo`                                                                            |
| `OPEN_FINANCE_CLIENT_ID`      | —       | Client ID do provedor Open Finance                                                             |
| `OPEN_FINANCE_CLIENT_SECRET`  | —       | Client Secret do provedor Open Finance                                                         |
| `OPEN_FINANCE_WEBHOOK_SECRET` | —       | Segredo HMAC para verificação de webhooks                                                      |
| `OPEN_FINANCE_MOCK`           | `false` | Se `true`, usa respostas mock (sem credenciais reais)                                          |

## Deploy na Vercel (Neon ou Supabase)

### 1. Criar o banco de dados PostgreSQL

**Opção A — Neon (recomendado para Vercel):**

1. Acesse [neon.tech](https://neon.tech) e crie um projeto.
2. Copie a connection string no formato `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`.

**Opção B — Supabase:**

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Em **Settings → Database**, copie a URI de conexão do modo _Session_ (porta 5432).

### 2. Configurar variáveis na Vercel

No painel do seu projeto na Vercel (**Settings → Environment Variables**), adicione:

| Variável          | Valor                                                        |
| ----------------- | ------------------------------------------------------------ |
| `DATABASE_URL`    | Connection string PostgreSQL obtida no passo 1               |
| `NEXTAUTH_URL`    | URL do projeto na Vercel (ex.: `https://seu-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Saída de `openssl rand -hex 32`                              |

### 3. Executar as migrations em produção

Antes do primeiro deploy (ou ao modificar o schema), execute:

```bash
# Gera e aplica as migrations no banco remoto
DATABASE_URL="<sua-connection-string>" pnpm prisma migrate deploy
```

### 4. Deploy

```bash
# Via CLI da Vercel
vercel --prod
```

Ou conecte o repositório GitHub ao seu projeto na Vercel e cada push para `main` fará o deploy automaticamente.

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
# Sobe o banco PostgreSQL e a aplicação Next.js
docker compose up --build
```

O `docker-compose.yml` inclui um serviço `db` (PostgreSQL 16) e aguarda sua disponibilidade antes de iniciar a aplicação (`healthcheck`).

## CI

O workflow `.github/workflows/ci.yml` executa lint, testes unitários e testes e2e em cada push/PR.
