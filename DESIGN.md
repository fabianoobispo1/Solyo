# Solyo — Design System Reference

> Stack: Next.js · TypeScript · Tailwind CSS v4  
> Superfícies: Painel do Integrador (interno) · Portal do Cliente Final (white-label)

---

## 1. Tokens

### Tailwind `theme.extend` (ou `tailwind.config.ts`)

```ts
colors: {
  brand: {
    emerald:   '#0C5A46',  // primary — CTA, sidebar active, foco
    emeraldDk: '#081E14',  // dark panel bg
    emeraldMd: '#0F7A5F',  // hover/gradient end
    amber:     '#F2A422',  // accent — hoje no gráfico, pill de economia
    amberHov:  '#E09418',
  },
  neutral: {
    bg:        '#F2F5F8',  // page background (integrador)
    surface:   '#FFFFFF',
    subtle:    '#F8FAFC',  // input bg
    border:    '#E4EAF0',
    borderMd:  '#F0F3F7',  // divisores internos
    muted:     '#C4CDD6',
    secondary: '#8896A5',
    body:      '#4A5568',
    heading:   '#0F1720',
  },
  dark: {
    bg:        '#040C18',  // portal bg
    surface:   '#070F1A',  // metrics bar
    glass:     'rgba(255,255,255,0.05)',
    border:    'rgba(255,255,255,0.07)',
  },
  status: {
    onlineBg:  '#ECFDF5',
    onlineBdr: '#A7F3D0',
    onlineDot: '#10B981',
    onlineTxt: '#065F46',
    alertBg:   '#FFFBEB',
    alertBdr:  '#FCD34D',
    alertDot:  '#F2A422',
    alertTxt:  '#92400E',
    alertRow:  '#FFFBF0',  // linha de tabela em alerta
  },
},
fontFamily: {
  display: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
  body:    ["'Instrument Sans'", 'system-ui', 'sans-serif'],
},
borderRadius: {
  card:   '16px',
  modal:  '24px',
  input:  '11px',
  btn:    '13px',
  btnSm:  '10px',
  badge:  '20px',
  avatar: '50%',
},
```

### CSS Custom Properties (`globals.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --color-emerald:    #0C5A46;
  --color-emerald-dk: #081E14;
  --color-amber:      #F2A422;
  --color-bg:         #F2F5F8;
  --color-surface:    #FFFFFF;
  --color-border:     #E4EAF0;
  --color-muted:      #8896A5;
  --color-heading:    #0F1720;

  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Instrument Sans', system-ui, sans-serif;

  --radius-card:  16px;
  --radius-input: 11px;
  --radius-btn:   13px;
}
```

---

## 2. Tipografia

| Role | Font | Size | Weight | Letter-spacing |
|---|---|---|---|---|
| Headline hero | Space Grotesk | 80–100px | 700 | -4–5px |
| H1 page | Space Grotesk | 26px | 700 | -0.6px |
| H2 section | Space Grotesk | 20px | 700 | -0.4px |
| KPI número | Space Grotesk | 34px | 700 | -1.5px |
| KPI label | Instrument Sans | 12px | 500 | 0.8px uppercase |
| Body | Instrument Sans | 14–16px | 400 | — |
| Label input | Instrument Sans | 13px | 500 | — |
| Caption | Instrument Sans | 12px | 400–500 | — |
| Table header | Instrument Sans | 11px | 600 | 0.6px uppercase |
| Button primário | Space Grotesk | 15–16px | 600 | -0.2px |

---

## 3. Componentes

### `<Button>` — variantes

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'amber' | 'neutral' | 'danger' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

// primary  → bg #0C5A46  text white  h:54px (lg) / 48px (md) / 38px (sm)
// secondary→ border #0C5A46  text #0C5A46  bg transparent
// amber    → bg #F2A422  text white
// neutral  → bg #F2F5F8  border #E4EAF0  text #4A5568
// danger   → bg #EF4444  text white
// ghost    → sem borda, sem bg
// border-radius: 13px (lg/md) / 10px (sm)
// font: Space Grotesk 600 (primary/amber/danger) | Instrument Sans 500 (resto)
```

### `<StatusBadge>` — pills

```tsx
type StatusKind = 'online' | 'alert' | 'offline' | 'inactive'

// online:   bg #ECFDF5  border #A7F3D0  dot #10B981  text #065F46
// alert:    bg #FFFBEB  border #FCD34D  dot #F2A422  text #92400E
// offline:  bg #F1F5F9  border #CBD5E1  dot #94A3B8  text #475569
// inactive: bg #F1F5F9  border #CBD5E1  dot #CBD5E1  text #94A3B8
// padding: 4px 10px  border-radius: 20px  font: 12px 500
```

### `<Input>` — estados

```tsx
// default: border 1.5px #E4EAF0  bg #F8FAFC
// focus:   border 2px   #0C5A46  bg #FFFFFF
// error:   border 1.5px #EF4444  bg #FFF5F5
// height: 48–50px  border-radius: 11px  font: Instrument Sans 15px
// padding: 0 14–16px
```

### `<KPICard>` — integrador

```tsx
interface KPICardProps {
  label:   string      // 12px 500 uppercase letter-spacing 0.8px
  value:   string      // Space Grotesk 34px 700 letter-spacing -1.5px
  sub?:    string      // 12px muted
  variant: 'filled' | 'outline'
  // filled:  bg #0C5A46  text/label rgba(255,255,255,...)
  // outline: bg white    border #E4EAF0  value color por prop
  icon?:   ReactNode   // 28×28 rounded-lg bg #F2F5F8 (outline) / rgba(255,255,255,0.15) (filled)
}
// border-radius: 16px  padding: 22px 24px
```

### `<ClientCard>` — mobile list item

```tsx
interface ClientCardProps {
  name:       string
  city:       string
  kwp:        number
  generation: string   // ex: "892 kWh"
  status:     StatusKind
  alert?:     string   // msg de alerta abaixo do nome
  onViewPortal: () => void
  onCopyLink:   () => void
}
// border-radius: 14px  border: 1px #E4EAF0  padding: 16px
// alert variant: border-left: 3px solid #F2A422
```

### `<ClientTableRow>` — desktop

```tsx
// Colunas: avatar+nome+subtítulo | Cidade | kWp (right) | Geração set. (right) | Status | Ações
// Avatar: 34×34 rounded-full, gradiente único por iniciais
// Row alert: bg #FFFBF0
// Ações: "Ver portal" link-btn outline + "···" icon btn 30×30
```

### `<BarChart>` — geração diária

```tsx
// 14 barras; viewBox proporcional ao container
// Bar padrão:    fill rgba(255,255,255,0.15)  rx 5
// Bar nublado:   fill rgba(30,55,75,0.8)
// Bar hoje:      fill #F2A422  + shine rect rgba(255,255,255,0.25) no topo
// Tooltip hoje:  rect #F2A422  text preto  Space Grotesk 11px 600
// Grid lines:    stroke rgba(255,255,255,0.06)
// X/Y labels:    9px  fill rgba(255,255,255,0.3)
```

### `<SolvoLogo>` — SVG icon

```tsx
// viewBox="0 0 36 36"
// rect rx=10 fill #0C5A46 (sidebar) / rgba(255,255,255,0.15) (painel dark)
// circle cx=18 cy=13 r=5.5 fill #F2A422   ← sol/cabeça
// path "M9 26c0-5 4-9 9-9s9 4 9 9" stroke #F2A422 stroke-width 1.6  ← ombros
// line x1=6 y1=26 x2=30 y2=26 stroke #F2A422 stroke-width 1.6       ← base
// Wordmark: "Solyo" Space Grotesk 700 letter-spacing -0.5–0.6px
```

---

## 4. Layouts

### 4.1 Login — Web (1280×800)

```
┌────────────────────────┬──────────────────────┐
│  560px  Brand panel    │  720px  Form panel   │
│  bg: gradient dark     │  bg: #FFFFFF         │
│  ─ Logo               │  ─ H1 "Bem-vindo..."  │
│  ─ Tagline H2 40px    │  ─ Email input       │
│  ─ Body copy          │  ─ Senha input       │
│  ─ Stats row (3 cols) │  ─ Button primary    │
│    +2.400 / 98% / R$4M│  ─ Divider "ou"      │
│                        │  ─ Google button     │
│                        │  ─ "Fale com a Solyo"│
└────────────────────────┴──────────────────────┘
```

- Brand panel gradient: `linear-gradient(155deg,#081E14 0%,#0C5A46 50%,#062E22 100%)`
- Glow orbs: 2× radial-gradient absolute divs (amber topo-direita, emerald baixo-esquerda)
- Grid SVG texture: opacity 0.06, pattern 40×40, stroke rgba(255,255,255) 0.5

### 4.2 Dashboard — Web (1280×800)

```
┌───────┬──────────────────────────────────────┐
│ 220px │  Topbar 68px (saudação + btn Novo)   │
│ Side- ├──────────────────────────────────────┤
│ bar   │  KPI row (4 cards em grid 1fr×4)     │
│       ├──────────────────────────────────────┤
│       │  Tabela branca                       │
│       │  ─ header c/ search + filtrar        │
│       │  ─ thead 6 colunas                   │
│       │  ─ 5 rows (row 3 = alert bg #FFFBF0) │
│       │  ─ footer paginação                  │
└───────┴──────────────────────────────────────┘
```

- Sidebar: bg white, border-right #E4EAF0, nav item ativo bg #EBF3F0 text #0C5A46
- Nav items: ícone SVG 18×18 + label 14px; separador entre Portais e Configurações
- Footer user: avatar 34px + nome + role "Integrador Pro" + chevron

### 4.3 Portal — Web (1280×760)

```
┌─────────────────────────────────────────────┐
│  Header 64px (logo integrador + nav + user) │
├──────────────────────────────────────────────┤
│  Hero flex (gradient escuro + glow orbs)    │
│  ┌──────────────────┬────────────────────┐  │
│  │  Geração hero    │  Painel de gráfico │  │
│  │  "892" 100px 700 │  560px glassmorphic│  │
│  │  label + pills   │  14-day bar chart  │  │
│  └──────────────────┴────────────────────┘  │
├──────────────────────────────────────────────┤
│  Metrics bar 156px (bg #070F1A)             │
│  ┌────────────┬────────────┬─────────────┐  │
│  │ R$7.820    │ 628 kg CO₂ │ Operacional │  │
│  │ acumulado  │ evitado    │ status dot  │  │
│  └────────────┴────────────┴─────────────┘  │
└──────────────────────────────────────────────┘
```

- Hero bg: `linear-gradient(140deg,#081E14 0%,#0C5A46 40%,#062E22 70%,#040C18 100%)`
- Gráfico: `background: rgba(255,255,255,0.05)` `border: rgba(255,255,255,0.1)` `backdrop-filter: blur(12px)`
- Metrics bar: dividida em 3 cols com `border-right: rgba(255,255,255,0.08)`

### 4.4 Mobile — Dashboard (390×844)

- Header: logo + ícone notificação + avatar; bg white, border-bottom
- KPI cards: `grid-template-columns: repeat(3,1fr)` gap 10px; card 1 = filled emerald
- Search: height 40px, ícone SVG dentro do padding
- Client list: 3+ cards `<ClientCard>`
- Bottom nav: 4 tabs (Painel / Clientes / Portais / Conta), ícone 22px + label 10px

---

## 5. White-label (Portal do Cliente)

O portal substitui o branding do integrador. Tokens que variam por integrador:

```ts
interface IntegratorTheme {
  name:       string   // ex: "EnergiaSolar RS"
  logo:       string   // URL do logo (38×38 border-radius 9px)
  primaryHex: string   // substitui #0C5A46 nas barras e glows
  // Solyo mantém #F2A422 como accent e #040C18 como dark bg
}
```

Linha de atribuição no header:
```tsx
<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
  com tecnologia Solyo
</span>
```

---

## 6. Checklist de implementação

- [x] Instalar fonts via `next/font/google` (Space Grotesk + Instrument Sans)
- [x] Criar tokens da seção 1 (via `@theme` do Tailwind v4 em `globals.css`, equivalente ao `tailwind.config.ts`)
- [x] `globals.css` com CSS custom properties
- [x] Componentes base: `Button`, `StatusBadge`, `Input`, `KPICard`, `SolvoLogo`
- [x] Layout `(integrador)/layout.tsx` — sidebar + topbar
- [x] Página `(integrador)/dashboard` — KPI row + tabela (dados mocados; ver `docs/dashboard-integrador.md`)
- [x] Rota pública `portal/[slug]` — hero + chart + metrics bar (dados mocados; ver `docs/portal-cliente.md`)
- [x] `BarChart` com SVG inline (sem lib externa para o MVP)
- [x] Lookup mocado `slug` → `IntegratorTheme` (em memória; middleware real de white-label por domínio fica como próximo passo)
