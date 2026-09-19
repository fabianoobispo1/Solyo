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
convex/lib/generation.test.ts
convex/lib/tenant.test.ts
convex/plants.test.ts
```

- **Função pura sem dependência de banco/auth** (helpers em `src/lib/*` e
  `convex/lib/*`, como `cn`, `getAvatarGradient`, `estimateDailyKwh`) → teste
  direto, sem `convex-test`, só `describe`/`it`/`expect` do Vitest.
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

## O que não está coberto ainda

- Componentes React (`src/components/**`) — sem testes de renderização
  ainda (nenhum Testing Library configurado). Se isso mudar, documentar a
  escolha aqui.
- `src/lib/data/*` (os hooks) — são wrappers finos de `useQuery`/`useMutation`
  do Convex; a cobertura real está nas funções Convex por trás deles.
- Rotas Next (`src/app/**`) — sem teste de integração/E2E (ex: Playwright).
  A verificação end-to-end até aqui foi manual via browser (login real +
  criar cliente + abrir `/c/[token]`, documentado no histórico do projeto).
