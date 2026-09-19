# Solyo

Painel do Integrador e Portal do Cliente Final para monitoramento de usinas
solares. Next.js (App Router) + TypeScript + Tailwind v4 no front, Convex +
Convex Auth no backend.

## Stack

- **Front:** Next.js 16, React 19, Tailwind CSS v4 — ver `DESIGN.md` para os
  tokens de design (cores, tipografia, componentes).
- **Backend:** Convex (banco + funções) e Convex Auth (login por e-mail/senha,
  só para o integrador) — ver `docs/backend-convex.md`.
- **Testes:** Vitest (+ `convex-test` para as funções do Convex) — ver
  `docs/testing.md`.
- **Deploy:** Vercel.

## Como rodar localmente

1. `npm install`
2. `npx convex dev` — deixe rodando num terminal; ele cuida do schema/funções
   e escreve as variáveis do Next em `.env.local`. Na primeira vez que rodar
   contra um deployment novo, siga o setup de env vars do Convex Auth em
   `docs/backend-convex.md` (senão o login falha).
3. Em outro terminal: `npm run dev`
4. `npx convex run seed:seedDemoTenant` (uma vez, é idempotente) para
   popular um tenant de demonstração — credenciais em
   `docs/backend-convex.md`.
5. Acesse `http://localhost:3000/login`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Next.js em modo desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run test` | Testes (Vitest, roda uma vez) |
| `npm run test:watch` | Testes em modo watch |
| `npx convex dev` | Backend Convex em modo desenvolvimento (watch) |

## Estrutura

```
src/app/            # Rotas (App Router) — home (/), login, (integrador)/dashboard, portal/, c/, kit
src/components/ui/  # Kit de componentes base do DESIGN.md — não mexer no visual sem checar lá
src/components/     # Composições específicas de cada superfície (layout/, dashboard/, portal/)
src/lib/data/       # Hooks que ligam as páginas ao Convex — ver docs/backend-convex.md
src/lib/            # Utilitários e os mocks originais (tipos ainda em uso, arrays só para a demo)
convex/             # Schema, auth, queries/mutations e testes do backend
docs/               # Premissas, decisões e roadmap de cada parte do produto
```

## Documentação

- `DESIGN.md` — tokens visuais e checklist de telas do design.
- `docs/roadmap.md` — estado atual e próximos passos, consolidado.
- `docs/home.md`, `docs/login.md`, `docs/dashboard-integrador.md`,
  `docs/portal-cliente.md` — premissas e decisões de cada tela.
- `docs/backend-convex.md` — modelagem, auth, isolamento entre tenants,
  setup de env vars.
- `docs/testing.md` — padrão de testes e o que ainda não está coberto.
