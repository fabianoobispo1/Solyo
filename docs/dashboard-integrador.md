# Dashboard do Integrador

Implementação do layout descrito em `DESIGN.md` §4.2 (Dashboard — Web) e
§4.4 (Mobile — Dashboard).

## Estrutura de arquivos

```
src/app/(integrador)/layout.tsx        # Sidebar/Topbar (desktop) + MobileHeader/BottomNav (mobile)
src/app/(integrador)/dashboard/page.tsx # KPI row + tabela (desktop) ou busca + ClientCard list (mobile)
src/components/layout/Sidebar.tsx       # Navegação lateral (220px) + rodapé do usuário — hidden < md
src/components/layout/Topbar.tsx        # Saudação + botão "Novo cliente" (68px) — hidden < md
src/components/layout/MobileHeader.tsx  # Logo + notificação + avatar (56px) — hidden >= md
src/components/layout/BottomNav.tsx     # 4 abas fixas no rodapé — hidden >= md
src/components/layout/nav-icons.tsx     # Ícones SVG compartilhados por Sidebar e BottomNav
src/components/ui/ClientTableRow.tsx    # Linha da tabela desktop (spec §3 <ClientTableRow>)
src/components/ui/ClientCard.tsx        # Card da lista mobile (spec §3 <ClientCard>)
src/components/ui/Modal.tsx             # Shell genérico de modal (overlay + rounded-modal)
src/components/dashboard/NewClientModal.tsx # Botão "+ Novo cliente" + modal de cadastro (Convex)
src/components/dashboard/EditClientModal.tsx # Modal de edição, aberto pelo "···" da tabela/card
src/lib/data/useClients.ts              # Hook: lista de clientes do tenant logado
src/lib/data/useKpis.ts                 # Hook: KPIs agregados do tenant logado
src/lib/data/useCurrentProfile.ts       # Hook: nome/e-mail do integrador logado (saudação)
src/lib/data/usePlantMutations.ts       # Hooks: criar/editar cliente
src/lib/mock-data.ts                    # Só os TIPOS (Client, DashboardKpis) — arrays não são mais usados aqui
src/lib/avatar.ts                       # Iniciais + gradiente determinístico por nome
src/lib/text.ts                         # normalizeForSearch — busca tolerante a acento
```

A rota pública `/` é a landing page do produto (ver `docs/home.md`); a
vitrine dos componentes base mudou pra `/kit`. O dashboard vive em
`/dashboard`, dentro do grupo de rotas `(integrador)`, protegido por login.

## Dados

Desde a integração com Convex (ver `docs/backend-convex.md`), esta página
usa `useClients()`/`useKpis()`, que chamam `convex/plants.ts::list`/`::kpis`
escopados ao tenant autenticado — **não** mais os arrays de
`src/lib/mock-data.ts`. Esse arquivo continua existindo só pelos *tipos*
(`Client`, `DashboardKpis`), que os hooks reais devolvem exatamente iguais
(por isso a UI não precisou mudar).

## Premissas assumidas nesta implementação

- **Autenticação é real.** `(integrador)/layout.tsx` é um Client Component
  que usa `useConvexAuth()` e redireciona pra `/login` se não autenticado
  (mesmo padrão do projeto de referência `zapeio`). Ver `docs/backend-convex.md`.
- **Dados vêm do Convex**, escopados ao tenant logado (`requireTenant` +
  `assertSameTenant` — isolamento coberto por testes, ver `docs/testing.md`).
- **Busca e filtro são reais, mas 100% client-side.** Filtram o array já
  carregado por `useClients()` (nome/cidade/usina para a busca — comparação
  tolerante a acento via `normalizeForSearch` em `src/lib/text.ts` — e um
  multi-select de `status` para o filtro), não fazem uma nova query no
  Convex. Funciona bem no volume atual; se a lista de clientes crescer
  muito, migrar pra filtro/busca no servidor (`convex/plants.ts::list`
  ganhando argumentos).
- **Paginação continua decorativa**, mas o rodapé mostra a contagem real
  (`Mostrando <filtrados> de <total>`) — os botões "Anterior"/"Próxima"
  seguem sem função porque tudo cabe numa página só neste volume de dados.
- **Navegação lateral parcial.** Apenas "Painel" (`/dashboard`) é um link
  funcional. "Clientes", "Portais" e "Configurações" aparecem no design mas
  suas rotas ainda não existem — foram renderizados como itens desabilitados
  (`aria-disabled`, sem `href`) em vez de linkar para páginas 404. Ao criar
  cada rota, trocar o item correspondente em `src/components/layout/Sidebar.tsx`
  de `<span>` para `<Link>` (remover a flag `disabled`).
- **Saudação da Topbar é estática**, não baseada em horário do dia (`Bom
  dia`/`Boa tarde`), para evitar prender o texto ao horário de build em uma
  página estática. Se a página passar a ser dinâmica (com dados de sessão),
  reavaliar.
- **"Ver portal" linka para `/c/[portalToken]`** (a rota pública real, ver
  `docs/portal-cliente.md`) — todo `plant` criado por este dashboard já tem
  um `portalToken`, então o link sempre fica ativo para clientes cadastrados
  por aqui.
- **O "···" da tabela/card abre `EditClientModal`** (`src/components/
  dashboard/EditClientModal.tsx`), que edita `ownerName`/`city`/`capacityKwp`
  via `useUpdatePlant` — mesmos três campos do "Novo cliente", por
  consistência visual. Não dá pra editar `name` (nome da usina), `status`
  nem `alert` por essa UI ainda, embora a mutation `plants.update` já
  suporte isso.
- **Ícones da sidebar são SVGs escritos à mão**, sem dependência de ícones
  externa, seguindo a mesma linha do `BarChart` inline citado no `DESIGN.md`
  (§4 "sem lib externa para o MVP").
- **Gradiente de avatar é determinístico por hash do nome** (`src/lib/avatar.ts`),
  não aleatório — o mesmo cliente sempre recebe a mesma cor entre renders.
- **O modal "Novo cliente" persiste de verdade** via `useCreatePlant()`
  (`convex/plants.ts::create`). Não valida além do `required` nativo do
  `<input>`. O formulário não coleta um nome de usina separado do nome do
  cliente — o campo `plants.name` recebe `Usina de ${ownerName}` como
  padrão (ver `docs/backend-convex.md`). `Modal`
  (`src/components/ui/Modal.tsx`) é o shell genérico (overlay, `Esc` fecha,
  clique fora fecha) reutilizável para outros modais futuros.
- **Mobile é a mesma rota `/dashboard`, não uma página separada.** A troca
  entre a composição desktop (Sidebar + Topbar + tabela) e a mobile
  (MobileHeader + BottomNav + `ClientCard` list) é só CSS — ambas as árvores
  são renderizadas no servidor e alternadas com `hidden`/`md:flex`/`md:hidden`
  do Tailwind (breakpoint `md` = 768px). Dá pra confirmar isso vendo o HTML:
  os dois blocos existem no documento em qualquer largura, só a visibilidade
  muda.
- **Busca mobile também é só visual** (mesmo padrão da busca desktop), e o
  botão "Copiar link" do `ClientCard` usa `navigator.clipboard` — só funciona
  em contexto seguro (HTTPS/localhost) e falha silenciosamente caso contrário.
- **Abas "Clientes", "Portais" e "Conta" do `BottomNav` estão desabilitadas**
  pelo mesmo motivo dos itens equivalentes da Sidebar (rotas ainda não
  existem); só "Painel" navega de verdade.
- **KPICard ganhou tipografia/padding responsivos** (`text-xl` → `sm:text-[34px]`)
  para caber em 3 colunas numa tela de 390px, conforme §4.4. Isso é a mesma
  instância do componente usada no desktop — não existe uma variante "KPICard
  mobile" separada.

## Próximos passos (fora do escopo desta etapa)

- [ ] Paginação de verdade (útil quando o volume de clientes crescer).
- [ ] Migrar busca/filtro pra query no servidor se o array de clientes
      ficar grande demais pra filtrar no client.
- [ ] Editar `name` (usina), `status` e `alert` pela UI — `EditClientModal`
      só cobre `ownerName`/`city`/`capacityKwp` hoje.
- [ ] Página `/clientes`, `/portais`, `/configuracoes`/`/conta` e ativar os
      links correspondentes na Sidebar e no BottomNav.
- [ ] Testes de componentes React (`ui/`) e de integração da página do
      dashboard — hoje a cobertura automatizada é do backend (Convex) e dos
      utilitários puros, ver `docs/testing.md`.
- [ ] Verificar visualmente em viewport real de ~390px (a verificação nesta
      etapa foi via build + inspeção do HTML server-rendered; o ambiente de
      automação usado não conseguiu forçar uma janela de navegador abaixo de
      ~800px de largura).

A rota `portal/[slug]` (layout 4.3), o `<BarChart>` inline e o white-label
mocado (`IntegratorTheme`) já foram implementados — ver
`docs/portal-cliente.md`. A rota pública real com dados do Convex é
`/c/[token]` — ver `docs/backend-convex.md`.
