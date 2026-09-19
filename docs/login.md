# Login (`/login`)

Implementação do layout descrito em `DESIGN.md` §4.1 (Login — Web). Esse
item não estava no checklist original do `DESIGN.md` (§6) — foi identificado
como lacuna ao comparar a implementação com os mockups de referência e
adicionado ao `docs/roadmap.md`. **Autentica de verdade** desde a integração
com Convex Auth — ver `docs/backend-convex.md`.

## Estrutura de arquivos

```
src/app/login/page.tsx   # Painel de marca (dark) + painel de formulário (branco)
```

Rota pública, fora do grupo `(integrador)` e fora de `portal/`/`c/`. Usa
apenas o `layout.tsx` raiz (fontes globais + `ConvexClientProvider`).

## Como funciona

`LoginForm` (dentro do próprio `page.tsx`) é um Client Component que chama
`useAuthActions().signIn("password", formData)` do `@convex-dev/auth/react`,
com `flow: "signIn"`. Em caso de sucesso, `router.push("/dashboard")`; em
caso de erro, mostra "E-mail ou senha incorretos." no campo de senha
(reaproveitando a prop `error` que `<Input>` já suportava). Não há signup
pela UI — contas de integrador são criadas via seed/console do Convex neste
MVP (ver credenciais de demonstração em `docs/backend-convex.md`).

## Premissas assumidas nesta implementação

- **Só e-mail/senha.** O botão "Continuar com Google" continua `disabled`,
  puramente visual — não há provider OAuth configurado em `convex/auth.ts`.
- **Sem tela de cadastro.** "Fale com a Solyo" continua um texto não
  clicável (com `title` de tooltip) — o produto ainda não definiu um canal
  de contato nem se o cadastro será self-serve.
- **Textos de marketing (tagline, estatísticas +2.400/98%/R$4M) continuam
  placeholders** copiados da estrutura do `DESIGN.md` — não são números
  reais de produto, precisam ser validados/atualizados pelo time antes de ir
  ao ar.
- **Erro de login é genérico** ("E-mail ou senha incorretos.") — não
  distingue "e-mail não existe" de "senha errada", de propósito (evita
  enumeração de contas).

## Próximos passos (fora do escopo desta etapa)

- [ ] Cadastro self-serve de integrador (hoje só existe via seed/console do
      Convex).
- [ ] Login social (Google) se o produto decidir oferecer.
- [ ] Validação de formulário mais rica (força de senha, feedback inline
      antes do submit).
- [ ] Definir o canal real de "Fale com a Solyo" e trocar o texto por um link.
- [ ] Confirmar com produto/marketing os números da coluna de estatísticas.
