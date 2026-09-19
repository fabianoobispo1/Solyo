# Dashboard do Integrador

Implementação do layout descrito em `DESIGN.md` §4.2 (Dashboard — Web).

## Estrutura de arquivos

```
src/app/(integrador)/layout.tsx        # Sidebar + Topbar, envolve todas as rotas do grupo
src/app/(integrador)/dashboard/page.tsx # KPI row + tabela de clientes
src/components/layout/Sidebar.tsx       # Navegação lateral (220px) + rodapé do usuário
src/components/layout/Topbar.tsx        # Saudação + botão "Novo cliente" (68px)
src/components/ui/ClientTableRow.tsx    # Linha da tabela (spec §3 <ClientTableRow>)
src/components/ui/Modal.tsx             # Shell genérico de modal (overlay + rounded-modal)
src/components/dashboard/NewClientModal.tsx # Botão "+ Novo cliente" + modal de cadastro (mock)
src/lib/mock-data.ts                    # Dados mocados (clientes + KPIs agregados)
src/lib/avatar.ts                       # Iniciais + gradiente determinístico por nome
```

A rota pública `/` continua sendo a vitrine dos componentes base (`Button`,
`StatusBadge`, `Input`, `KPICard`, `SolvoLogo`); o dashboard vive em `/dashboard`
dentro do grupo de rotas `(integrador)`.

## Dados mocados

`src/lib/mock-data.ts` exporta `mockClients` (5 clientes fictícios cobrindo os
status `online`, `alert` e `offline`) e `mockDashboardKpis` (métricas agregadas
do topo do dashboard). Não há chamada de rede — os componentes de página
importam esses arrays diretamente.

## Premissas assumidas nesta implementação

- **Sem autenticação/autorização.** O grupo `(integrador)` não tem nenhum
  guard; qualquer um que acesse `/dashboard` vê o painel. Antes de produção é
  preciso um middleware/`layout` que verifique sessão e redirecione para login.
- **Sem fonte de dados real.** `mock-data.ts` substitui a futura camada de
  API/DB. O formato de `Client` foi desenhado para mapear 1:1 com o que a API
  deve retornar, mas nenhum contrato de API foi definido ainda.
- **Busca e filtro são apenas visuais.** O campo de busca e o botão "Filtrar"
  no cabeçalho da tabela não filtram `mockClients` — precisam de estado
  (client component) ou de query params + busca no servidor.
- **Paginação é decorativa.** Os botões "Anterior"/"Próxima" não paginam nada;
  o rodapé mostra "1–5 de 248" como referência visual do layout, não como dado
  real.
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
- **"Ver portal" já linka para `/portal/[slug]`** (ver
  `docs/portal-cliente.md`) quando o `Client` mocado tem `slug`; sem `slug`
  o link aparece desabilitado. O menu "···" ainda não tem handler — é um
  placeholder visual.
- **Ícones da sidebar são SVGs escritos à mão**, sem dependência de ícones
  externa, seguindo a mesma linha do `BarChart` inline citado no `DESIGN.md`
  (§4 "sem lib externa para o MVP").
- **Gradiente de avatar é determinístico por hash do nome** (`src/lib/avatar.ts`),
  não aleatório — o mesmo cliente sempre recebe a mesma cor entre renders.
- **O modal "Novo cliente" não persiste nada.** `NewClientModal` (`src/components/
  dashboard/NewClientModal.tsx`) é um Client Component com estado local; ao
  submeter, só mostra uma tela de confirmação mock — não chama API, não
  adiciona linha em `mockClients` nem valida além do `required` nativo do
  `<input>`. `Modal` (`src/components/ui/Modal.tsx`) é o shell genérico
  (overlay, `Esc` fecha, clique fora fecha) reutilizável para outros modais
  futuros.

## Próximos passos (fora do escopo desta etapa)

- [ ] Autenticação real + proteção de rota no grupo `(integrador)` — a
      página `/login` (ver `docs/login.md`) já existe, mas não está ligada a
      nenhuma sessão/redirecionamento ainda.
- [ ] Substituir `mock-data.ts` por chamadas a uma API/DB real.
- [ ] Tornar busca, filtro e paginação da tabela funcionais.
- [ ] Conectar o submit do `NewClientModal` a uma mutação real (hoje só
      mostra a confirmação mock).
- [ ] Página `/clientes`, `/portais`, `/configuracoes` e ativar os links
      correspondentes na Sidebar.
- [ ] `<ClientCard>` (mobile) — item do checklist do `DESIGN.md` ainda não
      implementado; reaproveitar `mockClients` para o layout 4.4.
- [ ] Testes (unitários dos componentes `ui/` e de integração da página do
      dashboard).

A rota `portal/[slug]` (layout 4.3), o `<BarChart>` inline e o white-label
mocado (`IntegratorTheme`) já foram implementados — ver
`docs/portal-cliente.md`.
