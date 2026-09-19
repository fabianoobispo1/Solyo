# Backend (Convex + Convex Auth)

Liga as telas (que antes só consumiam `src/lib/mock-data.ts` /
`src/lib/mock-portal.ts`) a dados reais, sem alterar nenhum componente
visual em `src/components/ui/`. "Integrador = tenant" neste MVP: não existe
uma tabela `tenants` separada — o próprio `profile` do integrador (role
`integrador_admin`) é o tenant, e `plants.tenantId` aponta pra ele.

## Estrutura de arquivos

```
convex/schema.ts          # profiles, plants, readings/tariffs (sem uso ainda)
convex/auth.config.ts     # domain do Convex Auth
convex/auth.ts            # Password provider + callback que cria o profile
convex/http.ts            # rotas HTTP do Convex Auth
convex/lib/tenant.ts      # requireUser / requireTenant / assertRole / assertSameTenant
convex/lib/tokens.ts      # generatePortalToken
convex/lib/generation.ts  # geração/economia/CO2 mock a partir de capacityKwp
convex/plants.ts          # list / get / kpis / create / update / getByToken
convex/profiles.ts        # me (perfil do usuário logado)
convex/seed.ts            # seedDemoTenant — cria "Aurora Solar" + 4 clientes de MG

src/components/ConvexClientProvider.tsx  # ConvexAuthProvider (client-side, sem SSR)
src/lib/data/                            # hooks tipados que as páginas consomem
```

## Como rodar localmente

1. `npx convex dev` — deixe rodando; ele cuida do schema/funções e escreve
   as variáveis do Next em `.env.local`.
2. Em outro terminal: `npm run dev`.
3. Acesse `http://localhost:3000/login` com as credenciais de demonstração
   abaixo.

## Tenant de demonstração

Rodar uma vez (idempotente — pode rodar de novo sem duplicar nada):

```
npx convex run seed:seedDemoTenant
```

Cria o login do integrador **Aurora Solar**:

- E-mail: `contato@aurorasolar.com.br`
- Senha: `AuroraSolar#2026`

com 4 clientes em MG (Uberlândia, Belo Horizonte, Juiz de Fora, Uberaba).

## Variáveis de ambiente do Convex Auth (pegadinha de setup manual)

`npx convex dev --configure new` só provisiona `CONVEX_DEPLOYMENT`,
`NEXT_PUBLIC_CONVEX_URL` e `NEXT_PUBLIC_CONVEX_SITE_URL` no `.env.local` do
Next. O Convex Auth precisa de mais duas variáveis **do lado do servidor**
(no deployment do Convex, não no `.env.local`) que a CLI interativa
`npx @convex-dev/auth` normalmente gera sozinha. Como este projeto foi
montado arquivo por arquivo (para não deixar aquele scaffold interativo
sobrescrever o que já existia), elas tiveram que ser geradas manualmente:

- `JWT_PRIVATE_KEY` — chave privada RS256 (PKCS8) usada para assinar o JWT
  de sessão.
- `JWKS` — o JWK público correspondente (é o que `convex/auth.config.ts`
  expõe).
- `SITE_URL` — usado internamente pelo Convex Auth mesmo sem provider de
  OAuth/e-mail configurado.

Sem isso, todo login falha em runtime com
`Missing environment variable "JWT_PRIVATE_KEY"` — foi exatamente esse erro
que apareceu ao testar o login pela primeira vez nesta implementação.

Como gerar (usa `jose`, que já vem como dependência transitiva do
`@convex-dev/auth`):

```js
const { generateKeyPair, exportPKCS8, exportJWK } = require("jose");
const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
```

E então `npx convex env set JWT_PRIVATE_KEY -- "<privateKey>"`,
`npx convex env set JWKS -- "<jwks>"` e
`npx convex env set SITE_URL "http://localhost:3000"`.

**Se você criar um novo deployment do Convex para este projeto** (por
exemplo, um de produção), vai precisar repetir esse passo lá também.

## Modelagem

- **`profiles`** — usuário da plataforma. `role: "integrador_admin"` é o
  único que loga hoje; `"cliente_final"` existe só para o dia em que o
  cliente final puder ter conta própria. `profile._id` funciona como
  `tenantId`.
- **`plants`** — cada linha é uma usina/cliente gerenciado por um
  integrador: `tenantId`, `clientProfileId` (sempre `null` neste MVP),
  `name` (nome da usina, ex. "Residência Jardim Europa"), `ownerName` (nome
  do dono/cliente, ex. "Marcos Andrade"), `city`, `capacityKwp`,
  `portalToken`, `status`, `alert`, `createdAt`.
- **`readings` / `tariffs`** — existem no schema propositalmente **sem
  uso**. Geração/economia/CO₂ são calculadas a partir de `capacityKwp`
  (`convex/lib/generation.ts`), não de telemetria real de inversor.

## Isolamento entre tenants

Toda query/mutation que toca `plants` passa por `requireTenant` (exige um
`integrador_admin` autenticado) e, ao ler/editar um documento específico,
por `assertSameTenant` (compara `tenantId`). Isso é o que garante que um
integrador nunca vê ou altera dado de outro — coberto por testes em
`convex/plants.test.ts` (ver `docs/testing.md`).

A única função que **não** exige tenant é `plants.getByToken`
(usada por `/c/[token]`), de propósito: é a rota pública do portal do
cliente final, resolvida pelo `portalToken` não-adivinhável, e devolve só
os dados daquela usina — nunca das outras do mesmo integrador.

## Camada de dados no Next (`src/lib/data/`)

As páginas nunca importam `convex/_generated/api` nem os mocks antigos
diretamente — usam hooks:

- `useClients()` → `Client[] | undefined` (`convex/plants.ts::list`)
- `useKpis()` → `DashboardKpis | undefined` (`convex/plants.ts::kpis`)
- `useClient(token)` → `ClientPortalData | null | undefined`
  (`convex/plants.ts::getByToken`)
- `useCurrentProfile()` → perfil do integrador logado
  (`convex/profiles.ts::me`)
- `useCreatePlant()` / `useUpdatePlant()` → mutations

Os *shapes* devolvidos são exatamente os mesmos tipos que
`src/lib/mock-data.ts` e `src/lib/mock-portal.ts` já definiam — por isso a
UI não precisou mudar, só a fonte dos dados.

## O que ainda é mock/placeholder

- **`/portal/[slug]`** (rota antiga) continua existindo e continua 100%
  mock (`src/lib/mock-portal.ts`) — foi o protótipo de white-label por
  integrador (cor customizada por tenant). A rota real (`/c/[token]`) não
  tem esse theming ainda: usa sempre o verde da Solyo, porque o schema atual
  não guarda uma cor por tenant. Ver `docs/portal-cliente.md`.
- Busca/filtro/paginação do dashboard continuam só visuais (não filtram
  `useClients()`).
- O modal "Novo cliente" não tem campo para o nome da usina — usa
  `Usina de ${ownerName}` como padrão (ver `NewClientModal`).
- O menu "···" da tabela/cards ainda não abre nada. A mutation
  `plants.update` já existe e está testada, só não foi conectada a uma UI
  de edição nesta etapa.

## Próximos passos (fora do escopo desta etapa)

- [ ] Conectar o menu "···" a um fluxo de edição (reaproveitando
      `NewClientModal` em modo edição + `useUpdatePlant`).
- [ ] Busca/filtro/paginação reais no dashboard.
- [ ] Guardar uma cor/logo por tenant e aplicar em `/c/[token]` (ou
      descontinuar `/portal/[slug]` quando isso existir).
- [ ] `npx convex deploy` para um deployment de produção + repetir o setup
      de `JWT_PRIVATE_KEY`/`JWKS`/`SITE_URL` lá.
- [ ] Decidir se o cliente final (`role: "cliente_final"`) um dia loga; hoje
      `clientProfileId` existe no schema mas nunca é preenchido.
