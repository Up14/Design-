# RAETH Frontend Design System

> **Codename:** NEON VOID
> **Aesthetic:** Retro-terminal meets high-end poker broadcast. Dark, precise, electric.
> **Philosophy:** Black canvas, surgical typography, neon data. Every pixel earns its place.

---

## 1. DESIGN IDENTITY

### Core Principles

| Principle | Rule |
|-----------|------|
| **Void-first** | Pure `#000000` black is the canvas. Content floats on darkness, not on surfaces. |
| **Data is decoration** | Numbers, stats, and live indicators ARE the visual interest. No ornamental graphics. |
| **Neon restraint** | Cyan (`#00D4FF`) and orange (`#FF5500`) are the only accent colors. Use sparingly — they mean something. |
| **Terminal DNA** | Monospace labels, corner brackets, uppercase tracking, numbered nav items. It should feel like a command center, not a consumer app. |
| **Zero border-radius** | Panels, buttons, tags, badges, inputs — all `border-radius: 0`. The only exception is the poker table (elliptical by nature) and chip/dot indicators (circular by function). |
| **Motion with purpose** | Animate to communicate state changes (new data, active player, winner). Never animate for decoration. |

### The Feel

Imagine a late-night poker broadcast control room. Dark screens, tight monospace readouts, occasional cyan/orange flickers when something important happens. The UI should feel like it's _monitoring_ something — precise, quiet, then electric when the action hits.

---

## 2. COLOR SYSTEM

### 2.1 Foundation

```
BLACK (Canvas)          #000000          — Body background, the void
SURFACE                 #0A0F1C          — Loader bg, elevated containers, fallback dark
SURFACE LIGHT           #111827          — Slightly lifted surfaces
PANEL                   #0D0D0D          — Glass panels, cards, drawers
PANEL HOVER             #111111          — Panel hover state, button rest state
SURFACE ELEVATED        #1E293B          — Highest elevation surfaces (rare)
```

### 2.2 Accent Duo

These are the ONLY two accent colors. Everything revolves around them.

```
CYAN (Accent)
  DEFAULT               #00D4FF          — Primary interactive, live indicators, call actions, links
  LIGHT                 #33DFFF          — Active text, hover states, street pill text
  DARK                  #0099BB          — Primary button bg, pressed states
  MUTED                 rgba(0,212,255,0.15)  — Subtle backgrounds, selection highlight

ORANGE (Gold)
  DEFAULT               #FF5500          — Winners, bets/raises, active nav, branding accent
  LIGHT                 #FF7733          — Gradient endpoint, lighter hover
  DARK                  #CC3300          — Pressed/active darker variant
  MUTED                 rgba(255,85,0,0.15)   — Subtle backgrounds
```

### 2.3 Poker Table

```
FELT GREEN
  DEFAULT               #1a4a2e          — Felt base color
  DARK                  #0d2818          — Felt edge/shadow
  LIGHT                 #2a5a3e          — Felt highlight
  CENTER                #327a52          — Radial gradient center (brightest green)
  INNER                 #2d6644          — Gradient mid-ring
  OUTER                 #0d2e1c          — Radial gradient edge (darkest)

RAIL BROWN
  DEFAULT               #2c1810          — Rail base
  LIGHT                 #3d2518          — Rail mid gradient
  MID                   #4a2c1a          — Rail transition
  HIGHLIGHT             #5a3520          — Rail top (brightest)

TABLE TRIM              rgba(255,85,0,0.8)  — Orange border around felt
```

### 2.4 Glass & Borders

```
GLASS
  DEFAULT               rgba(255,255,255,0.04)   — Resting glass/card bg
  LIGHT                 rgba(255,255,255,0.06)   — Slightly brighter glass
  HOVER                 rgba(255,255,255,0.08)   — Glass hover state
  ACTIVE                rgba(255,255,255,0.10)   — Glass pressed/active
  BRIGHT                rgba(255,255,255,0.12)   — Maximum glass brightness

BORDER
  SUBTLE                rgba(255,255,255,0.05)   — Barely visible dividers
  DEFAULT               rgba(255,255,255,0.08)   — Standard panel/card borders
  LIGHT                 rgba(255,255,255,0.12)   — Hover borders, emphasized dividers
  HOVER CYAN            rgba(0,212,255,0.3)      — Interactive hover border
  HOVER ORANGE          rgba(255,85,0,0.22)      — Active nav pill border
```

### 2.5 Text Hierarchy

```
PRIMARY                 #F1F5F9          — Main content, headings, important values
SECONDARY               #B0BDD0          — Supporting text, descriptions, completed states
MUTED                   #8899AA          — Tertiary text, labels, timestamps
DIM                     #94A3B8          — Barely-there text, placeholders
DISABLED                rgba(255,255,255,0.28)   — Inactive nav, disabled controls
LABEL ORANGE            rgba(255,85,0,0.55)      — Retro section labels
LINK HOVER              #E2E8F0          — Nav hover (non-active)
```

### 2.6 AI Model Branding

Every AI model gets ONE color. These are non-negotiable — they provide instant visual identification across all views.

| Model | Color | Hex | Gradient |
|-------|-------|-----|----------|
| Claude | Purple | `#8b5cf6` | `linear-gradient(135deg, #8b5cf6, #a78bfa)` |
| GPT | Cyan | `#00D4FF` | `linear-gradient(135deg, #00D4FF, #33DFFF)` |
| Gemini | Blue | `#3b82f6` | `linear-gradient(135deg, #3b82f6, #60a5fa)` |
| Grok | Orange | `#FF5500` | `linear-gradient(135deg, #FF5500, #FF7733)` |
| DeepSeek | Teal | `#00AADD` | `linear-gradient(135deg, #00AADD, #22CCEE)` |
| Qwen | Pink | `#EC4899` | `linear-gradient(135deg, #EC4899, #f472b6)` |
| Kimi | Red | `#ef4444` | `linear-gradient(135deg, #ef4444, #f87171)` |
| Default/Unknown | Zinc | `#71717A` | `linear-gradient(135deg, #71717A, #A1A1AA)` |

**Usage rules:**
- Model color appears as: dot indicator, left-border accent, glow shadow, gradient text
- Never mix model colors with the accent cyan/orange — model colors are identity, accents are UI state
- Use the gradient variant for larger surfaces (profile headers, chart fills)
- Use the flat hex for small indicators (dots, borders, text)

### 2.7 Semantic Action Colors

```
FOLD                    #EF4444          — Red (danger, elimination)
CHECK                   #A8B9CC          — Neutral gray (passive action)
CALL                    #00D4FF          — Cyan (matching, following)
BET / RAISE             #FF5500          — Orange (aggressive, assertive)
ALL-IN                  #EF4444          — Red + bold + uppercase (maximum commitment)
WIN                     #FF5500          — Orange (achievement, reward)
```

### 2.8 System Status

```
OK / HEALTHY            #22c55e          — Green
DEGRADED                #FF5500          — Orange
DOWN / ERROR            #ef4444          — Red
```

### 2.9 Chip Denomination Colors

| Threshold | Background | Border |
|-----------|-----------|--------|
| ≤ 25 | `#6b7280` | `#9ca3af` |
| ≤ 100 | `#dc2626` | `#f87171` |
| ≤ 500 | `#2563eb` | `#60a5fa` |
| ≤ 1000 | `#16a34a` | `#4ade80` |
| ≤ 5000 | `#7c3aed` | `#a78bfa` |
| > 5000 | `#ca8a04` | `#fbbf24` |

### 2.10 Profit / Loss

```
POSITIVE                #00D4FF          — Cyan for gains
NEGATIVE                #EF4444          — Red for losses
NEUTRAL                 #94A3B8          — Gray for zero/unchanged
```

### 2.11 Ambient Background

The body has a fixed `::before` pseudo-element with three subtle radial gradients to prevent pure-black flatness:

```css
background:
  radial-gradient(ellipse at 15% 10%, rgba(139, 92, 246, 0.06), transparent 50%),   /* Purple top-left */
  radial-gradient(ellipse at 85% 85%, rgba(6, 182, 212, 0.04), transparent 50%),    /* Teal bottom-right */
  radial-gradient(ellipse at 50% 50%, rgba(0, 212, 255, 0.025), transparent 60%);   /* Cyan center */
```

This is barely perceptible. It adds dimensional depth without competing with content. Use this exact pattern on all sites.

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| **Body** | `Space Grotesk` | `system-ui, -apple-system, sans-serif` | All body text, descriptions, paragraphs |
| **Heading** | `concrette` | `Space Grotesk, system-ui, sans-serif` | Brand name, hero headings, page titles |
| **Mono** | `Space Mono` | `Fira Code, Monaco, Consolas, monospace` | Numbers, labels, nav items, stats, code, timestamps |

**Loading:**
- Google Fonts: `Space Grotesk` (300, 400, 500, 600, 700) + `Space Mono` (400, 700)
- Custom: `concrette` (100–900 weights, woff2 format, `font-display: swap`)

### 3.2 Fluid Root Scaling

```css
html {
  font-size: clamp(17px, calc(13.5px + 0.25vw), 24px);
}
```

This scales ALL rem-based values fluidly from 17px on mobile to 24px on 4K monitors. No breakpoint-based font size changes needed — everything proportionally scales.

### 3.3 Type Scale (in rem, relative to fluid root)

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| **hero** | `clamp(26px, 3.8vw, 46px)` | 700 | Loader messages, splash text |
| **page-title** | `0.8125rem` | 700 | Brand wordmark, section headings |
| **body** | `0.75rem` (Tailwind `text-xs`) to `0.875rem` (`text-sm`) | 400–500 | Standard text |
| **label** | `0.625rem` | 500–700 | Stat labels, nav items, ticker text |
| **micro** | `0.5625rem` | 500–700 | Section labels, tab buttons, badges |
| **nano** | `0.5rem` | 400–500 | Sublabels, step counters, retro tab buttons |

### 3.4 Mono Label Style (the signature look)

This is the most distinctive typographic pattern. Use it for ALL data labels, nav items, stats, status indicators:

```css
font-family: 'Space Mono', monospace;
font-size: 0.5625rem;          /* ~9px at base 16 */
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.12em–0.18em;
```

Variations:
- **Nav items:** `0.625rem`, weight 500, spacing `0.11em`
- **Section labels:** `0.5625rem`, weight 500, spacing `0.18em`, color `rgba(255,85,0,0.55)`
- **Tab buttons:** `0.5rem`, weight 400, spacing `0.14em`
- **Stat values:** `0.625rem`, `font-variant-numeric: tabular-nums`

### 3.5 Tabular Numbers

Always use `font-variant-numeric: tabular-nums` with `Space Mono` for any numeric display (chip counts, stats, percentages). This prevents layout jitter when numbers change.

---

## 4. SPACING & LAYOUT

### 4.1 Container

```
Padding:
  DEFAULT     0.75rem       (12px)
  sm          1.5rem        (24px)
  lg          2.5rem        (40px)
  xl          4rem          (64px)

Container: centered, no max-width constraint (fluid)
```

### 4.2 Border Radius Scale

```
none        0             — Panels, buttons, tags, inputs (DEFAULT for most elements)
sm          4px           — Playing cards, nav pills, thought bubbles
DEFAULT     6px           — Rare usage
md          8px           — Thought bubbles
lg          12px          — Winner announcements
xl          16px          — Special modals
2xl         20px          — Unused
full        9999px        — Dots, chips, circular indicators only
```

**The rule: If it's rectangular UI, it's `border-radius: 0`.** Only organic/circular things (dots, chips, poker table) get radius.

### 4.3 Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `glass` | `0 4px 24px rgba(0,0,0,0.2)` | Default panel shadow |
| `glass-hover` | `0 8px 32px rgba(0,0,0,0.3)` | Panel hover |
| `glass-lg` | `0 12px 48px rgba(0,0,0,0.35)` | Large elevated containers |
| `felt-inner` | `inset 0 4px 30px rgba(0,0,0,0.5)` | Inside poker felt |
| `card` | `0 2px 8px rgba(0,0,0,0.3)` | Playing cards rest |
| `card-hover` | `0 4px 16px rgba(0,0,0,0.5)` | Playing cards hover |
| `seat-active` | `0 0 20px rgba(0,212,255,0.4)` | Active player seat (cyan) |
| `seat-winner` | `0 0 25px rgba(255,85,0,0.5)` | Winning player seat (orange) |
| `rail` | `0 4px 40px rgba(0,0,0,0.8)` | Poker table rail |
| `glow-green` | `0 0 12px rgba(0,212,255,0.5)` | Cyan glow |
| `glow-gold` | `0 0 16px rgba(255,85,0,0.5)` | Orange glow |
| `glow-accent` | `0 0 20px rgba(0,212,255,0.3)` | Softer cyan glow |
| `glow-purple` | `0 0 20px rgba(139,92,246,0.3)` | Claude/purple glow |

### 4.4 Panel Construction

Every panel follows this exact recipe:

```css
.panel {
  background: #0D0D0D;
  border-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.8);
}
```

Hover variant adds:
```css
.panel:hover {
  background: #111111;
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.9);
}
```

### 4.5 Responsive Breakpoints

Follow Tailwind defaults:
- `sm` (640px) — Show secondary text, expand padding
- `md` (768px) — 2-column grids, show desktop nav
- `lg` (1024px) — 3-column grids, full data tables
- `xl` (1280px) — Full-width panels

**Mobile-first: always.** Default styles are mobile, then layer up with `sm:`, `md:`, `lg:`.

---

## 5. COMPONENT PATTERNS

### 5.1 Navigation

**Structure:** Numbered items with bracket animation

```
01 [HOME]  02 [ARENA]  03 [BOARD]  04 [MODELS]  ...
```

**States:**
- **Default:** `rgba(255,255,255,0.28)` — barely visible
- **Hover:** `#E2E8F0` — revealed, with `[` `]` brackets fading in (cyan `#00D4FF`)
- **Active:** `#FF5500` — orange text, orange brackets, pill background `rgba(255,85,0,0.07)` with `border: 1px solid rgba(255,85,0,0.22)`

**The active pill uses `layoutId` animation** — it slides between items with spring physics (`stiffness: 400, damping: 32`).

**Mobile:** Hamburger menu (3-line, `border-radius: 0`) → full-width dropdown nav. Active item shows `◀` indicator.

### 5.2 Header

```
┌─ scan line (1px gradient: transparent → orange → cyan → transparent) ──────┐
│ LOGO  │  01[HOME] 02[ARENA] ...  │  ● SYSTEM  │  ● LIVE  │  ☰ (mobile)  │
└────────────────────────────────────────────────────────────────────────────┘
```

- Sticky, `z-index: 50`
- Background: `rgba(0,0,0,0.94)` + `backdrop-filter: blur(20px)`
- Bottom border: `rgba(255,255,255,0.06)`
- Height: `46px` fixed
- Scan line at very top: 1px gradient `transparent → rgba(255,85,0,0.45) → rgba(0,212,255,0.35) → transparent`

### 5.3 Buttons

**Default (.btn)**
```css
background: #111111;
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 0;
color: #F1F5F9;
font-size: 0.875rem (text-sm);
font-weight: 500;
padding: 0.5rem 1rem;
transition: all 0.15s;
```

**Hover:** `border-color: rgba(0,212,255,0.3)`, `color: #33DFFF`, `background: rgba(0,212,255,0.06)`

**Primary (.btn-primary)**
```css
background: #0099BB;
border-color: #00D4FF;
color: white;
```
**Hover:** `background: #00D4FF`, `box-shadow: 0 0 16px rgba(0,212,255,0.3)`

### 5.4 Tags / Badges

```css
background: #111111;
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 0;
color: #A8B9CC;
font-size: 0.75rem (text-xs);
font-weight: 500;
padding: 0.125rem 0.625rem;
```

### 5.5 Street Pills

```css
background: rgba(0, 212, 255, 0.10);
border: 1px solid rgba(0, 212, 255, 0.18);
border-radius: 0;
color: #33DFFF;
font-family: 'Space Mono', monospace;
font-size: 0.75rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.1em;
padding: 0.25rem 0.75rem;
```

### 5.6 Playing Cards

**Four sizes:**

| Size | Width | Height | Font |
|------|-------|--------|------|
| xs | `1.75rem` | `2.5rem` | `0.5625rem` |
| sm | `2.5rem` | `3.5rem` | `0.6875rem` |
| md | `3.5rem` | `5rem` | `0.875rem` |
| lg | `5rem` | `7rem` | `1.125rem` |

**Face:** `background: #faf8f5`, `border: 1px solid #e0dcd6`, `border-radius: 4px`
**Red suits:** `#cc0000` | **Black suits:** `#1a1a1a`

**Card back:**
```css
background: #1a1040;
border: 1px solid rgba(139,92,246,0.2);
/* Purple diagonal stripe pattern: */
background-image:
  repeating-linear-gradient(45deg, transparent 6px, rgba(139,92,246,0.08) 6px 7px),
  repeating-linear-gradient(-45deg, transparent 6px, rgba(139,92,246,0.08) 6px 7px);
```

Inner border (card back): `inset 3px, 1px solid rgba(255,255,255,0.08)`

### 5.7 Retro Section Label

The signature "command center" label used above data panels:

```css
font-family: 'Space Mono', monospace;
font-size: 0.5625rem;
text-transform: uppercase;
letter-spacing: 0.18em;
color: rgba(255, 85, 0, 0.55);
padding: 5px 12px;
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
```

### 5.8 Retro Tab Buttons

```css
font-family: 'Space Mono', monospace;
font-size: 0.5rem;
text-transform: uppercase;
letter-spacing: 0.14em;
border-bottom: 2px solid transparent;
```

**Active:** `color: #FF5500`, `border-bottom-color: #FF5500`, `background: rgba(255,85,0,0.06)`, `text-shadow: 0 0 8px rgba(255,85,0,0.3)`
**Inactive:** `color: rgba(255,255,255,0.45)`
**Inactive hover:** `color: rgba(255,255,255,0.7)`, `background: rgba(255,255,255,0.03)`

### 5.9 Retro Stats Strip

Horizontal stat bar with pipe-separated items:

```css
background: rgba(255, 255, 255, 0.01);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
```

Each item:
```css
padding: 5px 14px;
font-family: 'Space Mono', monospace;
font-size: 0.5625rem;
text-transform: uppercase;
letter-spacing: 0.12em;
color: rgba(255, 255, 255, 0.22);
border-right: 1px solid rgba(255, 255, 255, 0.06);
```

Values within: `color: rgba(255, 85, 0, 0.8)`

### 5.10 Toast Notifications

Fixed bottom-right. Types:

| Type | Border Color | Icon |
|------|-------------|------|
| success | `#00D4FF` | `✓` |
| error | `#EF4444` | `✕` |
| winner | `#FF5500` | `🏆` |
| info | `#94A3B8` | `ℹ` |

Toast body: `background: rgba(10,15,28,0.95)`, `border: 1px solid rgba(255,255,255,0.08)`, auto-dismiss at 3000ms.

### 5.11 Skeleton Loading

```css
background: linear-gradient(90deg,
  rgba(255,255,255,0.04) 25%,
  rgba(255,255,255,0.08) 50%,
  rgba(255,255,255,0.04) 75%
);
background-size: 200% 100%;
animation: shimmer 1.8s ease-in-out infinite;
```

### 5.12 Scrollbar

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
```

### 5.13 Text Selection

```css
::selection {
  background: rgba(0, 212, 255, 0.3);
  color: white;
}
```

### 5.14 Gradient Text

```css
/* Cyan accent */
.text-gradient-accent {
  background: linear-gradient(135deg, #00D4FF, #06B6D4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Orange gold */
.text-gradient-gold {
  background: linear-gradient(135deg, #FF5500, #FF7733);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 5.15 Corner Brackets (Decorative Pattern)

Used on the loader, rank badges, and winner announcements. Four L-shaped borders in the corners:

```css
/* Each corner: a 20x20px div with two adjacent borders */
position: absolute;
width: 20px;
height: 20px;
border-color: rgba(255,255,255,0.55);
border-width: 1px;
/* Top-left: border-top + border-left. Top-right: border-top + border-right. etc. */
```

This creates a technical/targeting reticle feel. Use on important highlight areas.

---

## 6. ANIMATION LANGUAGE

### 6.1 Registered Animations

| Name | Duration | Easing | Purpose |
|------|----------|--------|---------|
| `pulse-glow` | 2s alternate infinite | ease-in-out | Active player seat — cyan shadow pulses |
| `winner-glow` | 1.5s alternate infinite | ease-in-out | Winner seat — orange shadow pulses |
| `card-deal` | 0.4s forwards | ease-out | Card appearing — scale(0.5) + translateY(-20px) → normal |
| `card-flip-in` | — | — | 3D card reveal — rotateY(-75deg) → 0 with slight overshoot |
| `fade-in` | 0.3s forwards | ease-out | Generic fade in |
| `slide-up` | 0.3s forwards | ease-out | Element slides up 10px + fades in |
| `thinking` | 1.4s infinite | ease-in-out | Three-dot thinking indicator — scale pulse with staggered delays |
| `float` | 3s infinite | ease-in-out | Gentle vertical bob (-4px) |
| `chip-flash` | 0.6s | ease-out | Chip value changed — orange bg flash → transparent |
| `shimmer` | 1.8s infinite | ease-in-out | Skeleton loading effect |
| `live-pulse` | 2s infinite | ease-in-out | Live indicator dot — opacity + scale pulse |
| `slow-pulse` | 3s infinite | ease-in-out | Paused state badge — 0.7→1 opacity |
| `trim-shimmer` | 6s infinite | ease-in-out | Table trim glow — shadow intensity breathes |
| `glow-breathe` | 3s infinite | ease-in-out | Soft opacity breathing — 0.6→1 |
| `thought-appear` | 0.3s forwards | ease-out | Thought bubble — scale(0.85)→1 + fade |
| `winner-burst` | — | — | Winner display — scale(0.8)→1.04→1 with translateY |
| `loader-corner-float` | 6s linear infinite | linear | Floating box orbits screen corners |
| `loader-letter-in` | — | — | Letter-by-letter text reveal |
| `loader-cursor-blink` | 1s step-end infinite | step-end | Terminal cursor blink |

### 6.2 Framer Motion Patterns

**Page transitions:**
```js
initial: { opacity: 0, y: -8 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.3, ease: 'easeOut' }
```

**Staggered children (nav, lists):**
```js
container: { staggerChildren: 0.045, delayChildren: 0.08 }
item: { opacity: 0, y: -6 } → { opacity: 1, y: 0, duration: 0.2 }
```

**Spring physics (nav pill, drawers):**
```js
type: 'spring', stiffness: 400, damping: 32
```

**Tap feedback:**
```js
whileTap: { scale: 0.91, transition: { duration: 0.07 } }    // nav items
whileTap: { scale: 0.97 }                                      // buttons
```

**Hover feedback:**
```js
whileHover: { borderColor: 'rgba(0,212,255,0.28)', background: 'rgba(0,212,255,0.08)' }
transition: { duration: 0.15 }
```

### 6.3 Animation Rules

1. **Page transitions** — `AnimatePresence mode="wait"` on routes. Fade in + slight upward drift.
2. **Real-time data** — Use `slide-up` for new list items. Use `chip-flash` when numbers change.
3. **Player states** — `pulse-glow` (cyan) for active turn, `winner-glow` (orange) for winners.
4. **Loading** — `shimmer` for skeleton placeholders. Three-dot `thinking` for AI processing.
5. **Interactive** — Spring-based `layoutId` for moving active indicators. `0.15s ease` transitions for hover color/border.
6. **Never** animate just for visual flair. Every animation communicates a state change.

---

## 7. PLAYER STATE VISUAL LANGUAGE

| State | Border | Shadow | Opacity | Filter | Animation |
|-------|--------|--------|---------|--------|-----------|
| **Default** | `rgba(255,255,255,0.08)` | `glass` | 1 | none | none |
| **Active (their turn)** | `#00D4FF` | Cyan pulse 10→32px | 1 | none | `pulse-glow` 2s |
| **Folded** | inherited | none | 0.35 | `grayscale(30%)` | none |
| **All-in** | `#EF4444` | none | 1 | none | none |
| **Winner** | `#FF5500` | Orange pulse 12→40px | 1 | none | `winner-glow` 1.5s |

---

## 8. LOADER / SPLASH SCREEN

The loader is a core branding moment. It uses:

- Full-screen `#0A0F1C` background with grid pattern (`48px` grid, `rgba(255,255,255,0.04)`)
- Corner brackets (L-shapes at all four corners)
- Center: Letter-by-letter text reveal using `Space Mono` at hero size
- Blinking terminal cursor
- Step counter: `01 / 03` style
- Floating `72x72px` box orbiting corners (6s loop)
- Three sequential messages with enter → hold → exit transitions
- Fadeout on complete

Recreate this pattern for any splash/loading screen across RAETH properties.

---

## 9. THE POKER TABLE

### Visual Stack (outside → inside)

```
1. GLOW        — Ambient glow (cyan + orange + dark, 240px spread)
2. RAIL        — Brown wood gradient with grain pattern, 50% border-radius
3. TRIM        — 2.5px orange border with breathing shimmer (6s cycle)
4. FELT        — Green radial gradient with subtle crosshatch texture
5. CENTER MARK — 30% × 40% ellipse, barely-visible border
6. COMMUNITY   — Center cards with deal animation
7. POT         — Below cards, mono text with orange accent
8. SEATS       — 7 positions around the ellipse
```

### Seat Layout (7 players)

Position seats absolutely around the table ellipse. Top (2), sides (2), bottom (2), center-bottom (1).

Each seat shows:
- Model color dot + name
- Hole cards (face-up for spectators, card-back if unknown)
- Chip count (mono, tabular-nums)
- Action badge (colored by action type)
- Bet chip (if has current-round bet)
- Thought bubble (positioned away from table center, max 16.25rem wide)

---

## 10. DATA VISUALIZATION STYLE

### Charts (Custom SVG — no chart library)

- **Background:** transparent (sits on panel bg)
- **Grid lines:** `rgba(255,255,255,0.05)` — barely visible
- **Axis labels:** `Space Mono`, `0.5625rem`, `#8899AA`
- **Data lines:** Model color (2px stroke, rounded caps)
- **Active line:** Increased opacity + `drop-shadow(0 0 4px {color})`
- **Fill area:** Model color at 5–15% opacity
- **Tooltip:** Panel style (dark bg, light border, mono text)
- **Legend:** Model color dot + mono label + value

### Radar Chart (Cognitive Profile)

- 6 axes: Bluff, Read, Predict, Cool, Adapt, Sizing
- Polygon fill: Model color at 15% opacity
- Polygon stroke: Model color
- Axis lines: `rgba(255,255,255,0.08)`
- Axis labels: `Space Mono`, uppercase

### Decision Tree (React Flow)

- Transparent background (no grid)
- Nodes: Panel style with colored left-border (model color)
- Edges: `rgba(255,255,255,0.15)` stroke
- Active node: Glow shadow in model color
- Uses `@xyflow/react` — hide attribution

---

## 11. DO'S AND DON'TS

### DO

- Use `#000000` as the base — not `#0A0F1C` (that's for elevated surfaces)
- Use `Space Mono` for ALL data/numbers/labels/stats
- Use `border-radius: 0` on all rectangular UI elements
- Use the ambient body gradient on every page
- Keep accent usage to cyan (interactive/live) and orange (action/winner/brand)
- Use `0.15s ease` as the standard transition
- Use `rgba(255,255,255,0.08)` as the default border
- Use panel recipe (`#0D0D0D` bg, 0 radius, thin border, heavy shadow)
- Make numbers tabular (`font-variant-numeric: tabular-nums`)
- Use lettered/numbered prefixes on nav items (`01`, `02`, etc.)
- Use bracket animation `[ ]` on interactive hover states
- Use corner brackets as decorative accents on important containers

### DON'T

- Don't use rounded corners on panels, buttons, or tags
- Don't introduce new accent colors beyond cyan/orange
- Don't use background colors lighter than `#1E293B`
- Don't use sans-serif fonts for data/stat displays
- Don't add decorative illustrations, icons, or emoji (except in toasts)
- Don't use gradients on backgrounds (only on text, model identity, and table felt)
- Don't animate without a state-change reason
- Don't use white (`#FFFFFF`) for body text — use `#F1F5F9`
- Don't mix model brand colors with UI accent colors
- Don't use box shadows lighter than `rgba(0,0,0,0.2)`
- Don't use borders heavier than `1px` (exception: table trim at `2.5px`, active tab bottom at `2px`)
- Don't put padding > `16px` on a panel section header
- Don't center-align data tables — left-align text, right-align numbers

---

## 12. EXTENDING TO NEW SITES

When building new RAETH properties or pages, follow this checklist:

1. **Start with the void** — `body { background: #000000 }` + ambient gradient `::before`
2. **Import the fonts** — Space Grotesk (body), Space Mono (data), concrette (headings)
3. **Apply fluid scaling** — `html { font-size: clamp(17px, calc(13.5px + 0.25vw), 24px) }`
4. **Copy the panel recipe** — `#0D0D0D`, `border-radius: 0`, `rgba(255,255,255,0.08)` border
5. **Use the header pattern** — Scan line top, sticky blur header, numbered nav with bracket hover
6. **Use the color system** — Cyan for interactive, orange for emphasis, model colors for identity
7. **Use mono for data** — Every number, stat, label, and timestamp gets `Space Mono`
8. **Add the scrollbar and selection styles**
9. **Add the skeleton shimmer** for all loading states
10. **Use Framer Motion** for page transitions (`AnimatePresence mode="wait"`)

### Technology Stack (recommended)

```
React 18+           — UI library
Vite 5+             — Build tool
Tailwind CSS 3+     — Utility classes + custom config
Framer Motion 12+   — Animation
PostCSS + Autoprefixer — CSS processing
```

Keep dependencies minimal. No component library needed — the design system is intentionally custom and lightweight.

---

## 13. QUICK REFERENCE — COPY-PASTE VALUES

### Most-Used Colors
```
#000000                     Body background
#0D0D0D                     Panel background
#111111                     Panel hover / button bg
#0A0F1C                     Surface / loader bg
#00D4FF                     Cyan accent
#33DFFF                     Cyan light
#FF5500                     Orange accent
#FF7733                     Orange light
#F1F5F9                     Text primary
#B0BDD0                     Text secondary
#8899AA                     Text muted
#94A3B8                     Text dim
rgba(255,255,255,0.08)      Default border
rgba(255,255,255,0.06)      Subtle divider
rgba(0,212,255,0.3)         Cyan hover border
rgba(255,85,0,0.22)         Orange active border
#EF4444                     Red (error/fold)
#22c55e                     Green (ok/healthy)
```

### Most-Used Patterns
```css
/* Standard panel */
background: #0D0D0D; border-radius: 0; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 4px 32px rgba(0,0,0,0.8);

/* Mono label */
font-family: 'Space Mono', monospace; font-size: 0.5625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em;

/* Standard transition */
transition: all 0.15s ease;

/* Cyan hover */
border-color: rgba(0,212,255,0.3); color: #33DFFF; background: rgba(0,212,255,0.06);

/* Glass surface */
background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);

/* Ambient body gradient */
radial-gradient(ellipse at 15% 10%, rgba(139,92,246,0.06), transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.04), transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.025), transparent 60%);
```

---

*RAETH Design System v1.0 — Built from the LLM Poker Arena codebase. This is the source of truth for all frontend design decisions across RAETH properties.*
