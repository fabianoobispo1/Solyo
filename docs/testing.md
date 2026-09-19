# Testes

Padrão de testes do projeto: **Vitest** para tudo (funções puras e funções
Convex), sem framework separado por camada.

## Rodando

```
npm run test        # roda uma vez (CI)
npm run test:watch  # modo watch (desenvolvimento)
```

Não precisa do `npx convex dev` rodando para os testes passarem — os testes
de `convex/*.test.ts` usam `convex-test`, que simula um backend Convex
completo em memória (schema real, sem rede, sem deployment).

## Onde colocar um teste novo

Regra simples: **arquivo `<nome>.test.ts` do lado do arquivo que ele
testa**, não uma pasta `__tests__/` separada. Já existe:

```
src/lib/cn.test.ts
src/lib/avatar.test.ts
src/lib/text.test.ts
src/components/ui/Button.test.tsx
src/components/ui/StatusBadge.test.tsx
src/components/ui/Input.test.tsx
src/components/ui/Modal.test.tsx
src/components/ui/KPICard.test.tsx
src/components/ui/SolvoLogo.test.tsx
src/components/ui/ClientTableRow.test.tsx
src/components/ui/ClientCard.test.tsx
convex/lib/generation.test.ts
convex/lib/tenant.test.ts
convex/plants.test.ts
convex/invites.test.ts
src/components/dashboard/NewClientModal.test.tsx
src/components/dashboard/EditClientModal.test.tsx
src/components/dashboard/PortalLinkRow.test.tsx
```

- **Função pura sem dependência de banco/auth** (helpers em `src/lib/*` e
  `convex/lib/*`, como `cn`, `getAvatarGradient`, `estimateDailyKwh`) → teste
  direto, sem `convex-test`, só `describe`/`it`/`expect` do Vitest.
- **Componente React em `src/components/ui/*`** (a vitrine de componentes
  base do `DESIGN.md`) → Testing Library + `.test.tsx`, ver seção abaixo.
- **Query/mutation do Convex** (qualquer coisa em `convex/*.ts` que recebe
  `ctx`) → usa `convex-test` (ver `convex/plants.test.ts` como referência).
  Nunca teste essas funções chamando a API HTTP de um deployment real.

## Testando funções Convex com `convex-test`

```ts
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

const t = convexTest(schema);
```

Para simular um integrador autenticado **sem** passar pelo fluxo de senha
completo do Convex Auth: insira a `users` row e o `profile` direto no banco
de teste, e use `t.withIdentity({ subject: "<userId>|qualquer-coisa" })` —
é exatamente esse formato (`userId` + `"|"` + sessionId) que
`getAuthUserId` em `convex/lib/tenant.ts` espera encontrar no token. Veja o
helper `createIntegrador` no topo de `convex/plants.test.ts`; reaproveite-o
em vez de duplicar esse setup em novos arquivos de teste.

`t.query`/`t.mutation` chamam funções públicas; `internal.<modulo>.<nome>`
chama `internalQuery`/`internalMutation` (não expostas em `api`) — usado em
`convex/invites.test.ts` pra criar o convite direto, sem passar pela CLI.
Pra testar uma `action` (que não acessa `ctx.db` diretamente, só via
`ctx.runQuery`/`ctx.runMutation`), use `t.action(api.<modulo>.<nome>, args)`
— ver `convex/invites.test.ts` testando `invites.accept`.

## Testando componentes React com Testing Library

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
```

O ambiente padrão do projeto (`vitest.config.mts`) é `edge-runtime`, porque
os testes de `convex/*` precisam dele. Testes de componente precisam de DOM
de verdade, então cada arquivo `*.test.tsx` de componente começa com o
comentário `// @vitest-environment jsdom` — é isso que troca o ambiente só
pra aquele arquivo, sem mexer na config global.

`vitest.setup.ts` já registra `@testing-library/jest-dom` (matchers como
`toBeInTheDocument`/`toHaveFocus`) e chama `cleanup()` depois de cada teste
— sem isso, o DOM de um teste vaza pro próximo e quebra
`getByRole`/`getByText` (mais de um elemento encontrado). Não precisa
repetir esse setup nos arquivos de teste.

Prefira `@testing-library/user-event` a `fireEvent` pra simular interação
(clique, digitação, `Tab`, `Escape`) — ele se aproxima mais do que um
usuário real faz (dispara a sequência certa de eventos, respeita
`disabled`, etc.). `fireEvent` ainda é útil pra disparar um evento
específico direto num elemento (ex: clicar no backdrop do `Modal`, que não
tem role/texto pra selecionar via `user-event`).

**Pegadinha do `navigator.clipboard`**: `userEvent.setup()` instala seu
próprio stub de `navigator.clipboard` (usado internamente pra simular
copiar/colar via teclado). Se você mockar `navigator.clipboard` com
`Object.defineProperty` **antes** de chamar `userEvent.setup()`, o setup
sobrescreve seu mock e o `writeText` espionado nunca é chamado de verdade.
Sempre chame `userEvent.setup()` primeiro, e só depois defina o mock — ver
`ClientCard.test.tsx` (teste "copia o link absoluto do portal").

## O que é obrigatório testar ao mexer em `convex/plants.ts` (ou schema)

**Isolamento entre tenants é a regra inegociável do projeto** (ver
`docs/backend-convex.md`) — qualquer query/mutation nova que leia ou escreva
um `plant` precisa de um teste correspondente em `convex/plants.test.ts`
provando que:

1. Um tenant não vê o recurso do outro numa listagem.
2. Um tenant recebe erro (`assertSameTenant`) ao tentar ler/editar o
   recurso do outro diretamente pelo id.
3. A função exige autenticação (`requireUser`/`requireTenant`), a menos que
   seja uma rota intencionalmente pública como `getByToken`.

Se a função for pública de propósito (como `getByToken`, usada por
`/c/[token]`), o teste correspondente é o oposto: provar que ela **não**
exige login e que só devolve dados daquele único recurso, nunca de outros
do mesmo tenant.

## Testando componentes que dependem do Convex

`NewClientModal`/`EditClientModal` (em `src/components/dashboard/`) usam os
hooks de `src/lib/data/usePlantMutations.ts` (`useCreatePlant`/
`useUpdatePlant`), que por sua vez chamam `useMutation` do Convex. Em vez de
mockar `convex/react` diretamente, mocka-se o módulo wrapper com
`vi.mock("@/lib/data/usePlantMutations", () => ({ useCreatePlant: vi.fn() }))`
e `vi.mocked(useCreatePlant).mockReturnValue(fn)` — mais simples e testa
exatamente o contrato que o componente realmente usa. Ver
`NewClientModal.test.tsx`/`EditClientModal.test.tsx`.

## O que não está coberto ainda

- Todos os componentes de `src/components/ui/` e `src/components/dashboard/`
  já têm teste.
- `src/lib/data/*` (os hooks) — são wrappers finos de `useQuery`/`useMutation`
  do Convex; a cobertura real está nas funções Convex por trás deles (e,
  para os componentes que os consomem, no mock desses hooks — ver acima).
- Rotas Next inteiras (`src/app/**`) — sem teste de integração/E2E (ex:
  Playwright). A verificação end-to-end até aqui foi manual via browser
  (login real + criar cliente + abrir `/c/[token]`, documentado no
  histórico do projeto).
