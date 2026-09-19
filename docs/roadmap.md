# Roadmap — Solyo

Consolida os "próximos passos" espalhados em `docs/dashboard-integrador.md`,
`docs/portal-cliente.md` e no checklist do `DESIGN.md` em uma sequência
priorizada. Cada item aponta para o doc com o detalhe/premissa original
quando existir.

## Estado atual

- Tokens, fontes e componentes base (`Button`, `StatusBadge`, `Input`,
  `KPICard`, `SolvoLogo`, `ClientTableRow`, `ClientCard`, `BarChart`, `Modal`).
- Login (`/login`, ver `docs/login.md`) — só visual, não autentica.
- Dashboard do integrador (`/dashboard`) responsivo (desktop + mobile) com
  dados mocados, incluindo o modal "Novo cliente" (mock, sem persistência —
  ver `docs/dashboard-integrador.md`).
- Portal do cliente (`/portal/[slug]`) responsivo com white-label mocado.
- Tudo sem autenticação real, sem API real, mas já publicado no Vercel.

## Fase 1 — Completar as telas do `DESIGN.md`

- [x] **Página de login** (layout §4.1) — `/login`, ver `docs/login.md`.
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

## Fase 2 — Tornar o dashboard funcional

- [ ] Busca, filtro e paginação reais na tabela de clientes (hoje são só
      visuais).
- [ ] Ação do menu "···" e submit real do modal "Novo cliente" (hoje sem
      handler/persistência).
- [ ] Rotas `/clientes`, `/portais`, `/configuracoes` — hoje os itens da
      Sidebar apontam para elas mas estão desabilitados por não existirem.

## Fase 3 — Dados reais e autenticação

- [ ] Definir o contrato de API (formato já esboçado nos tipos `Client`,
      `ClientPortalData`, `IntegratorTheme`).
- [ ] Autenticação do integrador + proteção de rota no grupo `(integrador)`
      (a UI de login existe em `/login`, mas não está ligada a sessão nenhuma;
      `/dashboard` continua público).
- [ ] Decidir se o portal do cliente final precisa de login — hoje o acesso é
      só "quem tem o link" (`docs/portal-cliente.md`).
- [ ] Substituir `mock-data.ts`, `mock-portal.ts` e `integrator-theme.ts` por
      chamadas reais.
- [ ] Middleware de resolução de white-label por domínio/subdomínio, se o
      produto optar por isso além de (ou em vez de) `/portal/[slug]`.

## Fase 4 — Produção

- [ ] Deploy contínuo (Vercel) com preview por PR.
- [ ] Testes automatizados dos componentes `ui/` e das páginas.
- [ ] Observabilidade (erros, analytics de uso do portal).
- [ ] Revisão de segurança do portal público (rate limiting, enumeração de
      slugs).

## Fase 5 — Produto (fora do escopo do `DESIGN.md` atual)

- [ ] Notificações quando a geração cair abaixo do esperado (o `alert` de
      `Client`/`ClientPortalData` já modela esse estado).
- [ ] Exportação de relatórios (PDF/CSV) para o integrador e para o cliente.
- [ ] Planos/faturamento do integrador na plataforma.
