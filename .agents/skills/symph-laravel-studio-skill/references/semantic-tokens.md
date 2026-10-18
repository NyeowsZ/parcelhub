# Semantic Tokens Contract (60-30-10 Architecture)

This document defines the strict color, surface, and elevation token contract for **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).
AI agents MUST use these semantic classes and MUST NOT introduce arbitrary hex codes (`bg-[#...]`) or unmapped Tailwind utilities.

---

## 1. 60-30-10 System Allocation

### 60% Dominant (Canvas & Primary Surfaces)
Provides the calm, grounding canvas for the entire interface.
- `bg-background`: Main application canvas. Light: `#faf9f7`, Dark: `#0f0f12`.
- `bg-surface`: Default component card/container canvas. Light: `#ffffff`, Dark: `#141418`.
- `text-foreground`: Primary high-contrast body and heading text. Light: `#0f0f12`, Dark: `#faf9f7`.

### 30% Secondary (Hierarchy, Structural Borders, Elevated Surfaces)
Creates depth, structure, and readable divisions.
- `bg-surface-elevated`: Hover states, dropdowns, popovers, and elevated modal panels. Light: `#f2f0eb`, Dark: `#1c1c22`.
- `bg-muted`: Subtle fill for chips, code blocks, inactive tabs, and input backings. Light: `#f2f0eb`, Dark: `#18181f`.
- `text-muted-foreground`: Secondary meta-data, timestamps, placeholders, and descriptions. Light: `#5a5a5e`, Dark: `#a1a1aa`.
- `border-border`: Primary container and card borders (1px solid). Light: `#d4d0c8`, Dark: `#27272e`.
- `border-border-subtle`: Divider lines and table row separators. Light: `#f0eee8`, Dark: `#1b1b21`.

### 10% Accent (Interactive Focus & Primary Calls-to-Action)
Draws the user's eye directly to key interactive decisions. Never overused.
- `bg-primary`: Primary CTA button background and active state indicator. Light: `#d9261a` (Laravel Flame), Dark: `#ff2d20` (Laravel Red/Orange).
- `text-primary-foreground`: High-contrast text rendered on top of `bg-primary`. Light: `#ffffff` (4.95:1 WCAG AA), Dark: `#0f0f12` (5.15:1 WCAG AA).
- `hover:bg-primary-hover`: Interactive hover state for primary elements (`#ff2d20` light / `#ff4a3d` dark).
- `ring-ring`: Focus-visible outline ring for accessible keyboard navigation (`focus-visible:ring-2 focus-visible:ring-ring`).

---

## 2. Functional & Status Tokens

Used strictly for state communication (not decorative styling):
- **Success**: `bg-success` / `text-success` / `bg-success-subtle`
- **Warning**: `bg-warning` / `text-warning` / `bg-warning-subtle`
- **Destructive**: `bg-destructive` / `text-destructive` / `bg-destructive-subtle`
- **Info**: `bg-info` / `text-info` / `bg-info-subtle`

---

## 3. Tailwind v4 Theme & CSS Variables Definition

When mounting into HTML/Vite:
```html
<style type="text/tailwindcss">
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-elevated: var(--surface-elevated);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-ring: var(--ring);
}

:root {
  --background: #faf9f7;
  --foreground: #0f0f12;
  --surface: #ffffff;
  --surface-elevated: #f2f0eb;
  --muted: #f2f0eb;
  --muted-foreground: #5a5a5e;
  --border: #d4d0c8;
  --border-subtle: #f0eee8;
  --primary: #d9261a;
  --primary-foreground: #ffffff;
  --ring: #ff2d20;
}

.dark {
  --background: #0f0f12;
  --foreground: #faf9f7;
  --surface: #141418;
  --surface-elevated: #1c1c22;
  --muted: #18181f;
  --muted-foreground: #a1a1aa;
  --border: #27272e;
  --border-subtle: #1b1b21;
  --primary: #ff2d20;
  --primary-foreground: #0f0f12;
  --ring: #ff2d20;
}

/* Symph Engineering Grid Canvas */
body {
  background-color: var(--background);
  background-image: linear-gradient(90deg, rgba(15, 15, 18, 0.035) 1px, transparent 1px),
                    linear-gradient(rgba(15, 15, 18, 0.035) 1px, transparent 1px);
  background-size: 200px 200px;
}

.dark body, body.dark {
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
                    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 200px 200px;
}

/* Symph Specular Sheen & Card Lift */
.card-lift {
  position: relative;
  overflow: clip;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-lift:after {
  content: "";
  pointer-events: none;
  background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.08) 50%, transparent 60%);
  transition: transform 0.6s ease;
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
}
.card-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 45, 32, 0.15);
}
.card-lift:hover:after {
  transform: translateX(100%);
}

/* Glassmorphism */
.glass-card {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}
</style>
```

---

## 4. Anti-Patterns & Hard Constraints

1. **NO Arbitrary Hex Inlining**: Never write `<div class="bg-[#121212]">`. Always use `<div class="bg-surface">`.
2. **NO Hardcoded Grays**: Do not use `text-gray-400` or `border-zinc-800`. Always use `text-muted-foreground` and `border-border`.
3. **Contrast Verification**: Run `node scripts/check-contrast.js` if tweaking variable values.
