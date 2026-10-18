# Typography Scales & Hierarchy

This document defines the strict typographic contract for **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).
Typographic styling mirrors Symph.co's bold neo-grotesk display headings, uppercase tracked micro-labels, and crisp high-contrast body text.

---

## 1. Font Family Stacks

- **Primary Sans (Headings & UI)**:
  `font-sans`: `Satoshi, Golos Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace (Data, Code & Numeric Metrics)**:
  `font-mono`: `Geist Mono, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`

---

## 2. Type Hierarchy Scale

| Semantic Role | Tailwind Recipe | Tracking & Leading | Usage |
| :--- | :--- | :--- | :--- |
| **Studio Hero Display (`h1`)** | `text-4xl sm:text-6xl lg:text-7xl font-black text-foreground` | `tracking-tight leading-[1.05]` | Single per page / hero stage |
| **Section Title (`h2`)** | `text-3xl sm:text-4xl font-extrabold text-foreground` | `tracking-tight leading-[1.15]` | Major editorial sections |
| **Offering / Card Title (`h3`)**| `text-2xl font-bold text-foreground` | `tracking-tight leading-snug` | Service cards, case study headers |
| **Widget / Subtitle (`h4`)** | `text-lg font-semibold text-foreground` | `tracking-normal leading-normal` | Small card titles, modal headings |
| **Micro-Label / Tag** | `text-[11px] font-semibold uppercase text-muted-foreground` | `tracking-widest` | Category pills, nav links, form labels |
| **Body (Editorial)** | `text-base sm:text-lg font-normal text-muted-foreground` | `leading-[1.6]` | Paragraphs, case study summaries |
| **Body (Default UI)** | `text-sm font-normal text-foreground` | `leading-relaxed` | Forms, table cells, modal text |
| **Numeric KPI Metric** | `text-3xl sm:text-4xl font-black font-mono text-foreground` | `tracking-tight` | Statistics, throughput, counters |

---

## 3. Symph Headline Recipes

### Hero Headline with Accent Highlight & Hover Shake
```html
<h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.08] text-balance">
  Real AI expertise.<br />
  <span class="text-primary underline decoration-primary/40 underline-offset-8 transition-transform duration-200 inline-block hover:scale-[1.02]">Real results.</span>
</h1>
```

### Section Eyebrow & Title Stack
```html
<div class="space-y-3">
  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-widest">
    Work Delivered
  </div>
  <h2 class="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
    Three ways we partner with your team.
  </h2>
  <p class="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
    Wherever you are on your AI journey: exploring capabilities, putting agents to work, or scaling infrastructure.
  </p>
</div>
```

---

## 4. Anti-Patterns & Hard Constraints

1. **NO Arbitrary Font Sizing**: Never write `text-[17px]`. Use predefined tokens (`text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, etc.).
2. **NO Heading Level Skipping**: Do not skip from `h1` directly to `h3`. Maintain accessibility hierarchy for screen readers.
3. **Always Ensure 4.5:1 Contrast**: All body text must meet or exceed WCAG AA against the underlying canvas (`text-foreground` or `text-muted-foreground`).
