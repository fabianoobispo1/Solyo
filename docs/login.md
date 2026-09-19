# Autenticação (`/login` e `/convite/[token]`)

`/login` implementa o layout descrito em `DESIGN.md` §4.1 (Login — Web) —
item que não estava no checklist original do `DESIGN.md` (§6), identificado
como lacuna e adicionado ao `docs/roadmap.md`. `/convite/[token]` é a tela
de criação de conta, no modelo "convite por link" (ver decisão em
`docs/roadmap.md`). Ambas **autenticam/criam conta de verdade** via Convex
Auth — ver `docs/backend-convex.md`.

## Estrutura de arquivos

```
src/components/auth/AuthShell.tsx   # Painel de marca (dark, compartilhado pelas duas telas)
src/app/login/page.tsx              # Formulário de login
src/app/convite/[token]/page.tsx    # Formulário de criação de conta a partir de um convite
convex/invites.ts                   # create (CLI) / getStatus (pública) / accept (pública)
```

Ambas as rotas são públicas, fora do grupo `(integrador)`. Usam só o
`layout.tsx` raiz (fontes globais + `ConvexClientProvider`).

## Como o login funciona

`LoginForm` (dentro de `login/page.tsx`) chama
`useAuthActions().signIn("password", formData)` com `flow: "signIn"`. Em
caso de sucesso, navega pra `/dashboard`; em erro, mostra "E-mail ou senha
incorretos." (mensagem genérica de propósito — evita enumeração de contas).

## Como a criação de conta por convite funciona

Não existe UI/admin panel pra gerar convite — só o time da Solyo, via CLI:

```
npx convex run invites:create '{"email":"prospect@empresa.com"}'
```

Isso devolve um `token`; o link é `<origem>/convite/<token>` (7 dias de
validade, uso único). Quem abre o link vê um formulário com o e-mail travado
(vem do convite) + nome + senha. Ao enviar, `convite/[token]/page.tsx`:

1. Chama a action `invites.accept` (pública, valida o convite, cria a conta
   via `createAccount` do Convex Auth — o que dispara o callback em
   `convex/auth.ts` que cria o `profile` — e marca o convite como usado).
2. Encerra qualquer sessão anterior do navegador (`signOut()`).
3. Faz `signIn("password", ...)` com as credenciais recém-criadas.
4. Espera o estado reativo `useConvexAuth().isAuthenticated` confirmar a
   sessão nova antes de navegar pra `/dashboard`.

Os passos 2–4 existem por causa de dois bugs encontrados testando esse
fluxo manualmente (ver premissas abaixo) — não são só estilo de código.

## Premissas assumidas nesta implementação

- **E-mail/senha + Google, cadastro fechado.** "Continuar com Google"
  (`signIn("google")`) funciona assim (`createOrUpdateUser` em
  `convex/auth.ts`):
  - e-mail já existe (conta criada por convite) → vincula e entra;
  - e-mail é o do **super admin** (`SUPER_ADMIN_EMAIL` em
    `convex/lib/admin.ts`, fixo no código) → cria a conta direto;
  - qualquer outro → cria o usuário **sem profile** + um `accessRequest`
    pendente e o `(integrador)/layout` manda pra `/acesso-pendente` (tela
    amigável, "solicitação enviada"). O super admin vê a fila em
    `/admin/acessos` (item "Acessos" na Sidebar, com contador) e aprova/recusa
    (`convex/accessRequests.ts`). Aprovar cria o profile `integrador_admin`; a
    tela de pendente redireciona sozinha pro painel (reativo).
  Exige `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` em cada deployment do Convex e
  a URI `<CONVEX_SITE_URL>/api/auth/callback/google` autorizada no Google Cloud.
  Sem fila de notificação por e-mail ainda — o super admin só vê o pedido ao
  abrir o site.
- **Convites são token-only, sem UI de admin.** Só dá pra criar um via CLI
  (`npx convex run invites:create`). O e-mail do convite fica travado no
  formulário (`<Input value={email} disabled readOnly>`), mas isso é só
  cosmético — a action `accept` sempre usa o e-mail gravado no convite, não
  um valor vindo do form, então não tem como burlar isso.
- **Convite expira em 7 dias e é de uso único** (`convex/invites.ts` —
  `INVITE_TTL_MS`), sem forma de reenviar/renovar pela UI ainda.
- **Se o navegador já tinha uma sessão de outra conta, `signOut()` roda
  antes do `signIn`** tanto no login quanto no convite. Sem isso, entrar
  numa segunda conta no mesmo navegador (ex: testar dois convites seguidos)
  ficava "preso" na sessão antiga mesmo depois do login/cadastro ter
  funcionado do lado do servidor.
- **Navegar pra `/dashboard` espera `isAuthenticated` virar `true`** (efeito
  reativo), em vez de um `router.push` logo após o `signIn` resolver. Sem
  isso, o guard do layout `(integrador)` às vezes rodava antes do estado de
  auth propagar e mandava de volta pro `/login` — mesmo com o login/cadastro
  tendo funcionado.
- **Em `/convite/[token]`, a resposta de `getStatus` é "congelada" na
  primeira leitura** (`useState` + set condicional durante o render, não em
  efeito — é o padrão que o React recomenda pra isso). Como `getStatus` é
  uma query reativa, sem congelar ela atualizaria pra "convite já usado" no
  meio do próprio fluxo de aceitar o convite (o `accept` marca o convite
  como usado como parte do sucesso), desmontando o formulário antes do
  `signIn` terminar.
- **Menu "Sair" na Sidebar** (`src/components/layout/Sidebar.tsx`) chama
  `signOut()` e navega pra `/login` — antes deste trabalho não existia
  nenhuma forma de encerrar sessão na UI.
- **Erro de login/cadastro é genérico**, de propósito (evita enumeração de
  contas/convites).
- **Textos de marketing no `AuthShell`** (tagline, estatísticas
  +2.400/98%/R$4M) continuam placeholders copiados da estrutura do
  `DESIGN.md` — precisam ser validados pelo time antes de ir ao ar.

## Próximos passos (fora do escopo desta etapa)

- [ ] Admin panel (ou pelo menos um comando mais amigável) pra gerar
      convites, em vez de exigir `npx convex run` direto.
- [ ] Reenvio/renovação de convite expirado sem precisar gerar um novo token
      manualmente.
- [ ] Login social (Google) se o produto decidir oferecer.
- [ ] Validação de formulário mais rica (força de senha, feedback inline
      antes do submit).
- [ ] Definir o canal real de "Fale com a Solyo" no `/login` e trocar o
      texto por um link.
- [ ] Confirmar com produto/marketing os números da coluna de estatísticas
      do `AuthShell`.
