# Roadmap — Solyo

Consolida os "próximos passos" espalhados em `docs/dashboard-integrador.md`,
`docs/portal-cliente.md` e no checklist do `DESIGN.md` em uma sequência
priorizada. Cada item aponta para o doc com o detalhe/premissa original
quando existir.

## Estado atual

- Tokens, fontes e componentes base (`Button`, `StatusBadge`, `Input`,
  `KPICard`, `SolvoLogo`, `ClientTableRow`, `BarChart`).
- Dashboard do integrador (`/dashboard`) com dados mocados.
- Portal do cliente (`/portal/[slug]`) com white-label mocado.
- Tudo sem autenticação, sem API real, sem deploy.

## Fase 1 — Completar as telas do `DESIGN.md`

- [ ] **Página de login** (layout §4.1) — ainda não existe nenhuma rota
      `/login`; é a única tela descrita no design que falta implementar.
- [ ] **`<ClientCard>` mobile** (§4.4) — reaproveitar `mockClients`, ver
      `docs/dashboard-integrador.md`.
- [ ] **Layout mobile do dashboard** (grid de 3 KPIs, bottom nav de 4 abas).
- [ ] Layout mobile do portal — o `DESIGN.md` não especifica esse breakpoint
      explicitamente; validar com design antes de assumir o padrão do
      dashboard (anotado em `docs/portal-cliente.md`).

## Fase 2 — Tornar o dashboard funcional

- [ ] Busca, filtro e paginação reais na tabela de clientes (hoje são só
      visuais).
- [ ] Ação do menu "···" e do botão "+ Novo cliente" (hoje sem handler).
- [ ] Rotas `/clientes`, `/portais`, `/configuracoes` — hoje os itens da
      Sidebar apontam para elas mas estão desabilitados por não existirem.

## Fase 3 — Dados reais e autenticação

- [ ] Definir o contrato de API (formato já esboçado nos tipos `Client`,
      `ClientPortalData`, `IntegratorTheme`).
- [ ] Autenticação do integrador + proteção de rota no grupo `(integrador)`
      (hoje `/dashboard` é público).
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
