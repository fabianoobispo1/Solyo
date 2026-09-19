# Roadmap — Solyo

Consolida os "próximos passos" espalhados em `docs/home.md`,
`docs/dashboard-integrador.md`, `docs/portal-cliente.md`,
`docs/backend-convex.md`, `docs/testing.md` e no checklist do `DESIGN.md` em
uma sequência priorizada. Cada item aponta para o doc com o
detalhe/premissa original quando existir.

## Estado atual

- Página inicial (`/`) — landing page real (hero, features, prévia do
  dashboard, CTA), ver `docs/home.md`. A antiga vitrine de componentes mudou
  pra `/kit`.
- Tokens, fontes e componentes base (`Button`, `StatusBadge`, `Input`,
  `KPICard`, `SolvoLogo`, `ClientTableRow`, `ClientCard`, `BarChart`, `Modal`).
- Login (`/login`) — **autentica de verdade** via Convex Auth (Password),
  só para o integrador. Criação de conta é por convite
  (`/convite/[token]`, gerado via CLI) — ver `docs/login.md` e
  `docs/backend-convex.md`.
- Dashboard do integrador (`/dashboard`) responsivo (desktop + mobile),
  **dados reais** via Convex (`useClients`/`useKpis`), protegido por login
  (redireciona pra `/login` se não autenticado). "Novo cliente" já persiste
  de verdade. Ver `docs/dashboard-integrador.md`.
- Portal do cliente real: **`/c/[token]`**, resolvido por um `portalToken`
  não-adivinhável, público (sem login), dados reais via Convex. A rota
  antiga `/portal/[slug]` continua existindo só como demo do conceito de
  white-label, 100% mock. Ver `docs/portal-cliente.md`.
- Backend Convex com isolamento entre tenants coberto por testes
  automatizados (Vitest + `convex-test`). Ver `docs/backend-convex.md` e
  `docs/testing.md`.
- Publicado no Vercel (`https://solyo-pearl.vercel.app`) já apontando para
  um deployment de **produção** do Convex (`fine-albatross-963`), com
  `JWT_PRIVATE_KEY`/`JWKS`/`SITE_URL` configurados e o tenant de
  demonstração "Aurora Solar" semeado lá. Login, dashboard e `/c/[token]`
  testados manualmente em produção. Ver `docs/backend-convex.md` para como
  repetir esse setup (ex: se o deployment for recriado).

## Fase 1 — Completar as telas do `DESIGN.md`

- [x] **Página de login** (layout §4.1) — `/login`, ver `docs/login.md`.
- [x] **Página inicial** (fora do `DESIGN.md`, adicionada pelo mesmo motivo
      que o login) — `/`, ver `docs/home.md`.
- [x] **Modal "Novo cliente"** — `NewClientModal` + `Modal` genérico, ver
      `docs/dashboard-integrador.md`.
- [x] **`<ClientCard>` mobile** (§4.4) — ver `docs/dashboard-integrador.md`.
- [x] **Layout mobile do dashboard** — `MobileHeader` + `BottomNav` + grid de
      3 KPIs, ver `docs/dashboard-integrador.md`. Não confirmado visualmente
      num viewport real de ~390px (limitação do ambiente de automação usado
      nesta etapa — verificado via build + inspeção do HTML).
- [x] Portal responsivo — sem layout mobile dedicado (o `DESIGN.md` não
      especifica um para o portal); ajustado com breakpoints na mesma página,
      ver premissa em `docs/portal-cliente.md`.

## Fase 2 — Dashboard funcional

- [x] Login real + proteção de rota no grupo `(integrador)`.
- [x] "Novo cliente" persiste de verdade (Convex).
- [x] Editar cliente — o "···" da tabela/card abre `EditClientModal`
      (`ownerName`/`city`/`capacityKwp`), ver `docs/dashboard-integrador.md`.
- [x] Busca (tolerante a acento) e filtro por status reais na tabela/cards
      — client-side por enquanto, ver `docs/dashboard-integrador.md`.
- [ ] Paginação de verdade (continua decorativa; o rodapé já mostra a
      contagem real filtrada).
- [ ] Rotas `/clientes`, `/portais`, `/configuracoes`/`/conta` — hoje os
      itens da Sidebar e do BottomNav apontam pra elas mas estão
      desabilitados por não existirem.

## Fase 3 — Dados reais e autenticação

- [x] Contrato de dados definido (`Client`, `DashboardKpis`,
      `ClientPortalData` em `src/lib/mock-data.ts`/`mock-portal.ts` — os
      hooks reais em `src/lib/data/` devolvem exatamente esses shapes).
- [x] Autenticação do integrador (Convex Auth, só e-mail/senha) + proteção
      de rota no grupo `(integrador)` + logout (menu da Sidebar).
- [x] Criação de conta de integrador via convite (`/convite/[token]`,
      gerado por CLI) — ver `docs/login.md`.
- [x] Portal do cliente final decidido como **sem login** — acesso via
      `portalToken` não-adivinhável em `/c/[token]`.
- [x] `mock-data.ts`/`mock-portal.ts` substituídos por Convex nas rotas
      reais (`/dashboard`, `/c/[token]`); os mocks continuam existindo só
      para alimentar a demo antiga `/portal/[slug]` e como tipos/fixtures.
- [ ] `integrator-theme.ts` (cor/logo por integrador) — não migrado; o
      schema atual não guarda isso por tenant. `/c/[token]` usa sempre o
      verde da Solyo. Decidir se isso entra no MVP ou fica só na demo.

## Fase 4 — Produção

- [ ] Deploy contínuo (Vercel) com preview por PR.
- [x] Testes automatizados do backend (Convex — isolamento entre tenants,
      cálculo de geração/economia), de utilitários puros (`src/lib`) e dos
      componentes apresentacionais de `src/components/ui/` (Vitest +
      Testing Library — Button, StatusBadge, Input, `Modal`, este último
      cobrindo o trap de foco/Tab/Escape). Ver `docs/testing.md`. 72 testes
      no total.
- [ ] Testes dos componentes que dependem do Convex
      (`src/components/dashboard/`) e E2E de fluxo completo (ex:
      Playwright) — lacuna consciente, ver `docs/testing.md`.
- [ ] Observabilidade (erros, analytics de uso do portal).
- [x] Revisão de segurança do portal público — login já tem rate limiting
      (nativo do Convex Auth) e tokens são inviáveis de enumerar (128 bits);
      decidido não investir em rate limiting por IP agora (exigiria migrar
      rotas públicas pra `httpAction`) até haver sinal real de abuso. Ver
      `docs/backend-convex.md`.
- [x] Deployment de produção do Convex publicado, com env vars e seed de
      demonstração — ver `docs/backend-convex.md`.
- [x] Deploy automático a cada push em `main` (`vercel git connect` ligado
      ao repositório do GitHub) — não precisa mais rodar `npx vercel --prod`
      manualmente.
- [x] Polish de qualidade: página 404 com a marca da Solyo (antes era a
      padrão do Next — inclusive pra link de portal/convite inválido, que
      caem em `notFound()`), favicon próprio (`src/app/icon.svg`, antes era
      o triângulo padrão do Next), `rel="noopener noreferrer"` nos links
      `target="_blank"`, e foco preso + devolvido corretamente no `Modal`
      (ver `docs/dashboard-integrador.md`).
- [ ] Trocar o tenant de demonstração por um processo real de onboarding de
      integrador (o seed foi pensado só pra popular o ambiente, não é como
      contas de produção de verdade serão criadas).

## Fase 5 — Produto (fora do escopo do `DESIGN.md` atual)

- [ ] Notificações quando a geração cair abaixo do esperado (o `alert` de
      `Client`/`ClientPortalData` já modela esse estado).
- [ ] Exportação de relatórios (PDF/CSV) para o integrador e para o cliente.
- [ ] Planos/faturamento do integrador na plataforma.
