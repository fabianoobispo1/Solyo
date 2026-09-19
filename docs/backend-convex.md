# Backend (Convex + Convex Auth)

Liga as telas (que antes só consumiam `src/lib/mock-data.ts` /
`src/lib/mock-portal.ts`) a dados reais, sem alterar nenhum componente
visual em `src/components/ui/`. "Integrador = tenant" neste MVP: não existe
uma tabela `tenants` separada — o próprio `profile` do integrador (role
`integrador_admin`) é o tenant, e `plants.tenantId` aponta pra ele.

## Estrutura de arquivos

```
convex/schema.ts          # profiles, plants, invites, readings/tariffs (sem uso ainda)
convex/auth.config.ts     # domain do Convex Auth
convex/auth.ts            # Password provider + callback que cria o profile
convex/http.ts            # rotas HTTP do Convex Auth
convex/lib/tenant.ts      # requireUser / requireTenant / assertRole / assertSameTenant
convex/lib/tokens.ts      # generateToken (usado por portalToken e por invites)
convex/lib/generation.ts  # geração/economia/CO2 mock a partir de capacityKwp
convex/plants.ts          # list / get / kpis / create / update / getByToken
convex/profiles.ts        # me (perfil do usuário logado)
convex/invites.ts         # create (CLI) / getStatus / accept — criação de conta por convite, ver docs/login.md
convex/seed.ts            # seedDemoTenant — cria "Aurora Solar" + 4 clientes de MG
convex/admin.ts           # resetPassword — troca senha de uma conta (só CLI)

src/components/ConvexClientProvider.tsx  # ConvexAuthProvider (client-side, sem SSR)
src/lib/data/                            # hooks tipados que as páginas consomem
```

## Como rodar localmente

1. `npx convex dev` — deixe rodando; ele cuida do schema/funções e escreve
   as variáveis do Next em `.env.local`.
2. Em outro terminal: `npm run dev`.
3. Acesse `http://localhost:3000/login` com as credenciais de demonstração
   abaixo.

## Produção

O app publicado em `https://solyo-pearl.vercel.app` já roda contra um
deployment de **produção** do Convex (`fine-albatross-963`, projeto
`fabiano-bispo:solyo`), separado do deployment de dev
(`perfect-hippopotamus-761`) — cada um com seu próprio
`JWT_PRIVATE_KEY`/`JWKS` (ver seção acima) e seu próprio tenant de
demonstração semeado. `NEXT_PUBLIC_CONVEX_URL`/`NEXT_PUBLIC_CONVEX_SITE_URL`
estão configurados como env vars de **Production** no projeto Vercel
(`npx vercel env ls production`).

Para deployar funções novas pra produção sem passar pelo prompt interativo
(útil em automação): gere uma deploy key temporária
(`npx convex deployment token create <nome> --prod`), rode
`CONVEX_DEPLOY_KEY='<key>' npx convex deploy` e depois revogue a key
(`npx convex deployment token delete <nome> --prod`) — não deixe uma deploy
key viva sem necessidade.

**O Vercel está conectado ao repositório do GitHub** (`vercel git connect`)
— todo push em `main` builda e publica o Next automaticamente, sem precisar
rodar `npx vercel --prod` à mão. **Isso não inclui o backend do Convex**: o
deploy automático do Vercel só builda o app Next.js, ele não roda
`npx convex deploy`. Sempre que mudar algo em `convex/**` (schema, queries,
mutations), rode `npx convex deploy` pra produção manualmente (como descrito
acima) *antes ou junto* do push — senão o front em produção pode chamar uma
função que ainda não existe no deployment de produção do Convex.

### Preview deployments (por branch/PR)

A mesma conexão Git que builda `main` automaticamente também builda uma
**Preview Deployment** pra qualquer outra branch e pra qualquer Pull
Request aberto no GitHub — isso é o comportamento padrão do app oficial do
Vercel pra repositórios conectados (não precisou de nenhum passo extra além
do `vercel git connect` já feito). O bot do Vercel comenta no PR com a URL
do preview assim que o build termina.

**Mas o app precisa de env vars do Convex pra funcionar em qualquer
ambiente**, e antes só a env **Production** tinha
`NEXT_PUBLIC_CONVEX_URL`/`NEXT_PUBLIC_CONVEX_SITE_URL` configuradas
(`npx vercel env ls` mostrava só `Production`) — um preview build ia
compilar, mas a página quebraria em runtime (`ConvexReactClient` sem URL).
Corrigido apontando a env **Preview** pro deployment de **dev**
(`perfect-hippopotamus-761`, o mesmo que `npx convex dev` usa localmente),
não pro de produção — assim previews nunca leem/escrevem dados reais de
clientes:

```
npx vercel env add NEXT_PUBLIC_CONVEX_URL preview       # https://perfect-hippopotamus-761.convex.cloud
npx vercel env add NEXT_PUBLIC_CONVEX_SITE_URL preview  # https://perfect-hippopotamus-761.convex.site
```

O deployment de dev já tem o tenant de demonstração semeado (mesmos dados
que aparecem rodando localmente), então um preview mostra o dashboard
populado em vez de vazio. Login funciona normalmente (Password provider,
sem redirect OAuth que dependa de `SITE_URL` bater com a URL do preview).

Se o schema/queries do Convex mudarem, o deployment de **dev** já reflete a
mudança assim que `npx convex dev` roda localmente (ou via `npx convex
deploy` sem `--prod`) — os previews sempre usam esse mesmo deployment, não
precisam de um passo de deploy separado por PR.

## Tenant de demonstração

Rodar uma vez por deployment (idempotente — pode rodar de novo sem duplicar
nada):

```
npx convex run seed:seedDemoTenant            # no deployment de dev
CONVEX_DEPLOY_KEY='<key>' npx convex run seed:seedDemoTenant  # em produção
```

Cria o login do integrador **Aurora Solar**:

- E-mail: `contato@aurorasolar.com.br`
- Senha: `AuroraSolar#2026`

## Trocar a senha de uma conta

Sem tela de "esqueci minha senha" ainda — pra resetar a senha de qualquer
conta (útil pra contas de teste), via CLI:

```
npx convex run admin:resetPassword '{"email":"...","newPassword":"..."}'
CONVEX_DEPLOY_KEY='<key>' npx convex run admin:resetPassword '{"email":"...","newPassword":"..."}'  # em produção
```

`admin.ts::resetPassword` é uma `internalAction` — não existe endpoint
público pra isso, só quem tem acesso ao deployment (via CLI) consegue
trocar senha de qualquer conta.

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
- **`invites`** — convite de uso único (7 dias) que vira uma conta
  `integrador_admin` em `/convite/[token]`. Ver `docs/login.md` para como
  gerar um e para as premissas/bugs encontrados nesse fluxo.

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

## Segurança das rotas públicas (revisão feita, sem mudança de código)

Item que estava como TODO no `docs/roadmap.md` ("rate limiting, enumeração
de tokens") — investigado e a conclusão foi **deixar como está por
enquanto**, com esse raciocínio registrado pra não precisar reabrir a
mesma investigação depois:

- **Login (`/login`, `convex/auth.ts`) já tem rate limiting.** O
  `@convex-dev/auth` vem com uma tabela `authRateLimits` própria e bloqueia
  por padrão depois de 10 tentativas de senha erradas por hora, por
  e-mail, com recarga gradual (`Password.maxFailedAttempsPerHour` pra
  mudar o número, não configurado aqui — usa o default). Isso já roda sem
  nenhum código nosso. A mensagem de erro no `/login` também já é genérica
  ("E-mail ou senha incorretos"), então não dá pra usar o form pra
  descobrir se um e-mail tem conta ou não.
- **Tokens (`plants.portalToken`, `invites.token`) são 128 bits aleatórios**
  (`crypto.getRandomValues`, ver `convex/lib/tokens.ts`). Adivinhar um por
  força bruta é inviável (2^128 combinações) — "enumeração de tokens" não é
  um risco prático aqui, dado esse tamanho de espaço.
- **`plants.getByToken` e `invites.getStatus` são `query`, não dá pra
  colocar um limitador de taxa clássico (contador + escrita no banco)
  nelas** — funções `query` do Convex não podem escrever no banco, de
  propósito (são read-only e reativas). Um limitador de verdade exigiria
  reescrever essas duas como `httpAction` (só ali dá pra ler o IP de quem
  chamou, via `request.headers`) — mudança de arquitetura, não uma feature
  pequena, e não pareceu valer a pena sem sinal real de abuso.
- **`invites.accept` é a única ação pública que escreve** (cria conta).
  Antes de fazer qualquer trabalho caro (hash de senha via `createAccount`),
  ela já valida o token e falha rápido se for inválido — então uma
  varredura com tokens aleatórios já é barata de rejeitar, mesmo sem
  limitador nenhum.

Se o produto crescer e aparecer sinal real de abuso (tráfego anômalo nos
logs do Convex, custo de função disparando), os dois próximos passos nessa
ordem seriam: (1) throttling leve por token específico em `invites.accept`
usando a própria tabela `invites` (protege contra alguém martelando um
token só, não uma varredura ampla) e (2) migrar `getByToken`/`getStatus`
pra `httpAction` com limite por IP (proteção de verdade, reescrita maior).

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
- O "···" da tabela/cards abre `EditClientModal`, que usa `plants.update` —
  ver `docs/dashboard-integrador.md`.

## Próximos passos (fora do escopo desta etapa)

- [ ] Busca/filtro/paginação reais no dashboard.
- [ ] Guardar uma cor/logo por tenant e aplicar em `/c/[token]` (ou
      descontinuar `/portal/[slug]` quando isso existir).
- [x] Deployment de produção do Convex publicado (ver seção "Produção"
      acima).
- [x] Deploy automático a cada push em `main` (`vercel git connect`).
- [ ] Decidir se o cliente final (`role: "cliente_final"`) um dia loga; hoje
      `clientProfileId` existe no schema mas nunca é preenchido.
