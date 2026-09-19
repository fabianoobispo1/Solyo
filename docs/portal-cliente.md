# Portal do Cliente Final (`/portal/[slug]`)

Implementação da rota pública descrita em `DESIGN.md` §4.3 (Portal — Web) e do
white-label §5.

## Estrutura de arquivos

```
src/app/portal/[slug]/page.tsx   # Header + hero (geração + BarChart) + metrics bar
src/components/ui/BarChart.tsx   # Gráfico de barras inline (14 dias), sem lib externa
src/lib/mock-portal.ts           # Dados mocados por cliente (geração, economia, CO2)
src/lib/integrator-theme.ts      # White-label mocado: slug do integrador → tema
```

A rota fica fora do grupo `(integrador)` — usa apenas o `layout.tsx` raiz
(fontes globais), sem sidebar/topbar internos, porque é a superfície
white-label voltada ao cliente final do integrador.

## Como o white-label funciona aqui

Cada "seed" em `mock-portal.ts` tem um `integratorSlug` que resolve, via
`getIntegratorTheme` (`integrator-theme.ts`), para um `IntegratorTheme` com
`name`, `logoInitials` e `primaryHex`. O `primaryHex` substitui apenas o stop
`#0C5A46` do gradiente do hero e o orb inferior-esquerdo — o accent `#F2A422`
(amber) e o `#040C18` (dark bg) permanecem fixos da marca Solyo, como descrito
no `DESIGN.md`. A linha "com tecnologia Solyo" no header reforça a atribuição.

Slugs mocados disponíveis para teste: `/portal/marcos-andrade`,
`/portal/fazenda-boa-vista` (tema `energia-solar-rs`, verde) e
`/portal/loja-ferreira-materiais` (tema `sol-nordeste`, âmbar/marrom — status
`alert`). Qualquer outro slug cai em `notFound()` (404 do Next).

O link "Ver portal" na tabela do dashboard (`ClientTableRow`) só fica ativo
quando o `Client` mocado tem um `slug` correspondente a um desses seeds; os
outros dois clientes mocados (`Condomínio Vista Verde`, `Clínica Odontológica
Sorriso`) não têm portal configurado e o link aparece desabilitado — reflete
o estado real de um cliente que ainda não tem inversor/portal provisionado.

## Premissas assumidas nesta implementação

- **Lookup por slug é um array em memória**, não uma consulta a banco. O
  formato de `ClientPortalData`/`IntegratorTheme` foi desenhado para mapear
  para o futuro contrato de API, mas nenhum contrato real existe ainda.
- **Rota é pública por padrão** (sem sessão/senha) — o "acesso" é o próprio
  slug ser difícil de adivinhar. Se o produto precisar de portal autenticado,
  isso precisa de uma decisão de produto explícita antes de implementar.
- **Sem navegação no header.** O ASCII do `DESIGN.md` menciona "nav" no
  header do portal, mas como só existe esta página, nenhum item de navegação
  foi criado — o header tem apenas marca do integrador (esquerda) e
  nome/avatar do cliente (direita, sem dropdown/menu funcional).
- **Rota é dinâmica (`ƒ`), sem `generateStaticParams`/ISR.** Cada acesso
  renderiza no servidor a partir do mock; ainda não há pré-renderização dos
  slugs conhecidos.
- **Todos os números (geração, economia, CO₂, série de 14 dias) são
  estáticos** — não há integração com inversor/telemetria real.
- **`BarChart` dimensiona o tooltip do dia atual pelo texto**, não por um
  valor fixo, para não cortar valores com mais dígitos (`892 kWh` vs.
  `3.120 kWh`).

## Próximos passos (fora do escopo desta etapa)

- [ ] Substituir `mock-portal.ts`/`integrator-theme.ts` por consulta real
      (API/DB) usando o `slug` da URL.
- [ ] Decidir se o portal precisa de autenticação e, se sim, implementá-la.
- [ ] Layout mobile do portal (o `DESIGN.md` só especifica mobile para o
      dashboard do integrador em §4.4, não para o portal — verificar com
      design antes de assumir o mesmo padrão).
- [ ] Conectar o link "Ver portal" e o menu "···" do dashboard a ações reais
      (o menu ainda não tem handler, ver `docs/dashboard-integrador.md`).
- [ ] Middleware de resolução de white-label por domínio/subdomínio, caso o
      produto opte por isso em vez de (ou além de) `/portal/[slug]`.
