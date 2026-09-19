# Portal do Cliente Final (`/c/[token]` e `/portal/[slug]`)

Implementação da rota pública descrita em `DESIGN.md` §4.3 (Portal — Web) e
do white-label §5. Existem hoje **duas rotas** com a mesma composição
visual, uma real e uma demo — ver `docs/backend-convex.md` para o porquê.

## Estrutura de arquivos

```
src/components/portal/PortalView.tsx   # A composição visual (header + hero + BarChart + metrics bar)
                                        # compartilhada pelas duas rotas abaixo — mudar aqui afeta as duas.
src/components/ui/BarChart.tsx         # Gráfico de barras inline (14 dias), sem lib externa

src/app/c/[token]/page.tsx             # ROTA REAL — resolve o portalToken via Convex (useClient)
src/lib/data/useClient.ts              # Hook: convex/plants.ts::getByToken

src/app/portal/[slug]/page.tsx         # ROTA DEMO — resolve o slug em src/lib/mock-portal.ts (mock puro)
src/lib/mock-portal.ts                 # Dados mocados por cliente (geração, economia, CO2)
src/lib/integrator-theme.ts            # White-label mocado: slug do integrador → tema
```

Ambas as rotas ficam fora do grupo `(integrador)` — usam só o `layout.tsx`
raiz (fontes globais), sem sidebar/topbar internos, porque são a superfície
white-label voltada ao cliente final do integrador.

## `/c/[token]` — a rota real

É pra essa rota que o botão "Ver portal" do dashboard aponta
(`/c/${plant.portalToken}`). `src/app/c/[token]/page.tsx` é um Client
Component: usa `useClient(token)` (`src/lib/data/useClient.ts`), que chama
`convex/plants.ts::getByToken` — uma query **pública**, sem
`requireTenant`, de propósito (ver `docs/backend-convex.md`). `undefined`
enquanto carrega, `null` dispara `notFound()`.

Como o schema atual não guarda uma cor/logo por tenant, esta rota **não
tem white-label de verdade** — `PortalView` sempre recebe
`integrator.primaryHex: "#0C5A46"` (o verde da Solyo) e
`integrator.name`/`logoInitials` derivados do nome do integrador
(`profiles.name`), montados em `convex/plants.ts::getByToken`.

## `/portal/[slug]` — a rota demo (mock)

Ficou no repositório como demonstração do conceito de white-label por
integrador (cor customizada por tenant), que o MVP do backend não
implementou ainda. Continua 100% mock, sem nenhuma ligação com o Convex:

Slugs mocados disponíveis para teste: `/portal/marcos-andrade`,
`/portal/fazenda-boa-vista` (tema `energia-solar-rs`, verde) e
`/portal/loja-ferreira-materiais` (tema `sol-nordeste`, âmbar/marrom — status
`alert`). Qualquer outro slug cai em `notFound()`.

Cada "seed" em `mock-portal.ts` tem um `integratorSlug` que resolve, via
`getIntegratorTheme` (`integrator-theme.ts`), para um `IntegratorTheme` com
`name`, `logoInitials` e `primaryHex`. O `primaryHex` substitui apenas o stop
`#0C5A46` do gradiente do hero e o orb inferior-esquerdo — o accent `#F2A422`
(amber) e o `#040C18` (dark bg) permanecem fixos da marca Solyo.

## Premissas assumidas nesta implementação

- **As duas rotas compartilham a mesma UI** (`PortalView`) de propósito —
  garante que `/c/[token]` e `/portal/[slug]` nunca divergem visualmente por
  acidente; a única diferença entre elas é de onde vem o `ClientPortalData`.
- **Ambas as rotas são públicas por padrão** (sem sessão/senha) — o "acesso"
  é o próprio token/slug ser difícil de adivinhar. Se o produto precisar de
  portal autenticado, isso precisa de uma decisão de produto explícita antes
  de implementar (decidido por ora como **sem login**, ver
  `docs/roadmap.md`).
- **Sem navegação no header.** O ASCII do `DESIGN.md` menciona "nav" no
  header do portal, mas como só existe esta página, nenhum item de navegação
  foi criado — o header tem apenas marca do integrador (esquerda) e
  nome/avatar do cliente (direita, sem dropdown/menu funcional).
- **`/c/[token]` é sempre dinâmica** (Client Component, sem
  `generateStaticParams`/ISR) — cada acesso consulta o Convex ao vivo.
  `/portal/[slug]` é uma rota Next dinâmica (`ƒ`) que lê o mock em memória.
- **Em `/c/[token]`, geração/economia/CO₂ continuam calculadas a partir de
  `capacityKwp`** (`convex/lib/generation.ts`), não de telemetria real de
  inversor — ver `docs/backend-convex.md`.
- **`BarChart` dimensiona o tooltip do dia atual pelo texto**, não por um
  valor fixo, para não cortar valores com mais dígitos (`22 kWh` vs.
  `1.043 kWh`).
- **Não existe uma composição "mobile" separada do portal** — o `DESIGN.md`
  não especifica um layout §4.4-like para o portal (só para o dashboard do
  integrador), então em vez de inventar uma segunda versão, `PortalView` é
  responsiva com breakpoints Tailwind: número da geração (`text-5xl` →
  `sm:text-[64px]` → `lg:text-[100px]`), padding do header/hero e altura das
  células da metrics bar encolhem progressivamente. Se o design entregar um
  mockup mobile dedicado do portal, essa decisão precisa ser revisitada.

## Próximos passos (fora do escopo desta etapa)

- [ ] Guardar cor/logo por tenant no schema e aplicar em `/c/[token]` — ou
      decidir explicitamente que o MVP não terá white-label de verdade e
      aposentar `/portal/[slug]`.
- [ ] Validar com design se o portal precisa de um mockup mobile dedicado
      (hoje é só uma versão responsiva da página web, ver premissa acima).
- [ ] `generateMetadata` para `/c/[token]` (hoje só existe em
      `/portal/[slug]`, porque `/c/[token]` precisou virar Client Component
      para usar o hook do Convex) — exigiria separar em Server wrapper +
      Client child se isso importar para SEO/compartilhamento.
