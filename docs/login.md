# Login (`/login`)

Implementação do layout descrito em `DESIGN.md` §4.1 (Login — Web). Esse
item não estava no checklist original do `DESIGN.md` (§6) — foi identificado
como lacuna ao comparar a implementação com os mockups de referência e
adicionado ao `docs/roadmap.md`.

## Estrutura de arquivos

```
src/app/login/page.tsx   # Painel de marca (dark) + painel de formulário (branco)
```

Rota pública, fora do grupo `(integrador)` e fora de `portal/`. Usa apenas o
`layout.tsx` raiz (fontes globais).

## Premissas assumidas nesta implementação

- **Não autentica.** Não há `<form>` com submit, nem chamada a nenhuma API de
  auth. Os botões "Entrar" e "Continuar com Google" são `type="button"` sem
  `onClick` — puramente visuais, seguindo o mesmo padrão de placeholders já
  usado no dashboard (busca, filtro, paginação).
- **Página é um Server Component.** Não precisa de estado/interatividade
  ainda porque não valida nem envia nada; quando a autenticação real entrar,
  provavelmente vira Client Component (ou usa Server Actions) para tratar o
  submit e erros.
- **"Fale com a Solyo"** aparece como texto não clicável (com `title` de
  tooltip), não como link — ainda não existe um canal de contato definido
  (e-mail, WhatsApp, formulário) para apontar.
- **Textos de marketing (tagline, estatísticas +2.400/98%/R$4M) são
  placeholders** copiados da estrutura do `DESIGN.md` — não são números reais
  de produto, precisam ser validados/atualizados pelo time antes de ir ao ar.
- **Botão "Continuar com Google" é só visual.** Não há integração OAuth; se o
  produto adotar login social, isso precisa de um provedor real (NextAuth,
  Clerk, etc.) e de decisão sobre quais provedores oferecer.

## Próximos passos (fora do escopo desta etapa)

- [ ] Definir e implementar o provedor de autenticação (credenciais, OAuth,
      magic link) e ligar o formulário a ele.
- [ ] Proteger o grupo `(integrador)` com a sessão criada aqui — hoje
      `/dashboard` é público mesmo com o login existindo.
- [ ] Validação de formulário (e-mail obrigatório, mensagens de erro usando o
      estado `error` que `<Input>` já suporta).
- [ ] Definir o canal real de "Fale com a Solyo" e trocar o texto por um link.
- [ ] Confirmar com produto/marketing os números da coluna de estatísticas.
