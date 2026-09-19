# Página inicial (`/`)

Landing page pública do produto. Não faz parte do `DESIGN.md` (que cobre
Login, Dashboard, Portal e Mobile, não uma home de marketing) — criada
porque a rota `/` era só a vitrine interna de componentes, que virou `/kit`.

## Estrutura de arquivos

```
src/app/page.tsx   # Landing page — hero, features, prévia do dashboard, CTA, footer
src/app/kit/page.tsx # Vitrine de componentes que antes vivia em `/` (uso interno)
```

## Conteúdo

Reaproveita tokens e componentes já existentes em vez de inventar um estilo
novo: o hero usa o mesmo gradiente escuro + textura de grid + glow orbs do
`/login`; a seção "prévia do dashboard" usa `KPICard`/`StatusBadge` de
verdade com números ilustrativos; os CTAs levam pra `/login` (entrar) e pra
`/portal/marcos-andrade` (portal de exemplo, abre em nova aba).

## Premissas assumidas nesta implementação

- **Números da prévia do dashboard e da seção de estatísticas são
  ilustrativos** (mesmos usados no `/login`: +2.400/98%/R$4M, e no antigo
  `/kit`: 128.430 kWh/248/R$96.2k) — não vêm do Convex. Se algum dia
  precisarem ser reais, decidir se valem a pena buscar via Convex numa
  página pública (hoje não tem `requireTenant` que faça sentido aqui, seria
  uma query agregada sem dono).
- **`LinkButton` (definido no próprio `page.tsx`) duplica as classes de
  variante do `Button`** (`src/components/ui/Button.tsx`) em vez de
  reaproveitá-lo diretamente — `<Link>` renderiza `<a>`, e aninhar
  `<button>` dentro de `<a>` é HTML inválido (elemento interativo dentro de
  elemento interativo). Se o `Button` ganhar suporte nativo a `href` no
  futuro, dá pra remover esse helper.
- **Sem nav/menu** além do botão "Entrar" no header — é uma landing de uma
  página só, sem outras páginas de marketing pra linkar ainda.
- **`/kit` não está protegido nem linkado de lugar nenhum** — é só um
  endereço que quem trabalha no projeto sabe de cor, não um link
  descoberto por navegação normal do produto.

## Próximos passos (fora do escopo desta etapa)

- [ ] Se o produto crescer (preços, sobre, blog), decidir se viram páginas
      novas ou seções na mesma home.
- [ ] Adicionar suporte a `href` no `Button` (`src/components/ui/Button.tsx`)
      pra eliminar a duplicação de estilos em `LinkButton`.
