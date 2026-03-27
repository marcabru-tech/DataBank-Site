# DataBank Site

Site institucional da startup **DataBank** — plataforma de analytics e inteligência de dados para startups e scale-ups.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Prisma** (SQLite) para persistência de leads
- **Pino** para logging estruturado
- **Jest + Testing Library** para testes unitários
- **Playwright** para testes end-to-end
- **Husky + lint-staged** para hooks de pre-commit

## Quick Start (PoC)

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and see the site.

In PoC mode (`PERSIST_LEADS` not set or `false`), the `/api/lead` endpoint returns a mock 200 OK without persisting data.

## MVP — Persistindo leads

```bash
# Configure o banco de dados
DATABASE_URL="file:./data/db.sqlite" pnpm prisma migrate dev --name init_leads

# Inicie com persistência ativada
PERSIST_LEADS=true DATABASE_URL="file:./data/db.sqlite" pnpm dev
```

## Variáveis de ambiente

| Variável        | Padrão  | Descrição                                     |
| --------------- | ------- | --------------------------------------------- |
| `DATABASE_URL`  | —       | URL do banco SQLite (ex.: `file:./db.sqlite`) |
| `LOG_LEVEL`     | `info`  | Nível de log do Pino                          |
| `PERSIST_LEADS` | `false` | Se `true`, salva leads no banco via Prisma    |

## Testes

### Unitários

```bash
pnpm test
```

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
