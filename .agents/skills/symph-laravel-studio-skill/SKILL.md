---
name: symph-laravel-studio-skill
description: >-
  Build, style, and verify UI components and frontend views using the Symph Studio Craft design system (inspired by Symph.co) featuring a warm chalk canvas, ambient 200px engineering grid, pill silhouettes, frosted glassmorphism, specular shine sweeps, and Laravel red/orange accents with strict token recipes and deterministic compliance linting.
compatibility: Zero-dependency Node.js v18+
metadata:
  archetype: "Symph Studio Craft"
  version: "1.0.0"
---

# symph-laravel-studio-skill (Procedural UI/UX Design System)

A deterministic, procedural UI/UX skill enforcing the **Symph Studio Craft** design system (inspired by the award-winning agency **Symph.co**, reimagined with **Laravel Red/Orange** accents).
Strictly locks down design decisions using pre-validated component recipes and automated compliance verification to prevent inconsistent styles, hallucinated classes, or contrast failures across agent turns.

---

## When to Use This Skill

- When creating or modifying frontend user interfaces, marketing pages, or studio platforms in this project.
- When generating pill CTA buttons with specular shine, frosted glass offering cards, alternating editorial work showcases, or sticky frosted navigation headers.
- When applying the warm chalk (`#faf9f7`) and deep ink (`#0f0f12`) dual-canvas with subtle 200px coordinate grids and Laravel red/orange (`#ff2d20` / `#d9261a`) interactive accents.
- When checking UI code for WCAG AA compliance, semantic token adherence, and interactive states.

---

## Design System Foundations

| Dimension | Light Mode | Dark Mode | Usage & Rationale |
| :--- | :--- | :--- | :--- |
| **Canvas (60%)** | `#faf9f7` (Chalk) | `#0f0f12` (Ink) | 200px subtle coordinate grid overlay |
| **Surfaces (30%)** | `#ffffff` / `#f2f0eb` (Cream) | `#141418` / `#1c1c22` | Cards, modals, elevated panels (`.glass-card`) |
| **Accent (10%)** | `#d9261a` (Flame Red) | `#ff2d20` (Laravel Red/Orange) | Primary CTA pills, focus rings, glow effects |
| **Typography** | Satoshi / Golos Text + Inter | Satoshi + Geist Mono | High-impact headlines, tracked micro-labels (`tracking-widest`) |
| **Silhouettes** | Full pills (`rounded-full`) | Full pills (`rounded-full`) | CTAs, category chips, author avatars, filter tags |
| **Sheen & Glow** | 105° specular shine sweep | Laravel flame glow pulse | Specular light transition on hover (`.card-lift`) |

---

## Hard Control Principles

1. **CANONICAL RECIPES ONLY**: Do not invent CSS classes or structure from scratch. Copy and adapt exact recipes from the [references/](./references) directory.
2. **ZERO ARBITRARY VALUES**: Never use arbitrary hex codes (`bg-[#...]`) or unmapped Tailwind color palettes (`bg-blue-500`). Use predefined semantic tokens (`bg-primary`, `bg-surface`, `text-foreground`, `border-border`).
3. **MANDATORY VERIFICATION**: After creating or modifying any UI file, run `node scripts/verify-ui-compliance.js <path>` to deterministically verify compliance.
4. **NO EMOJIS IN UI**: Never use emojis as decorative or icon elements. Use clean SVG geometric icons, crisp 12x12 pixel-art icons, or semantic badges.

---

## Component Reference Index

Before writing any markup, consult the corresponding canonical recipe:

| Component | Reference File | Primary Recipe & Signature Elements |
| :--- | :--- | :--- |
| **Tokens & Theme** | [semantic-tokens.md](./references/semantic-tokens.md) | 60-30-10 distribution, 200px engineering grid, and CSS variables |
| **Typography** | [typography.md](./references/typography.md) | Display headline scales, accent word highlights, tracked micro-labels |
| **Buttons & Inputs** | [buttons-inputs.md](./references/buttons-inputs.md) | Pill CTAs with specular shine, flame glow, and minimalist underline inputs |
| **Cards & Panels** | [cards.md](./references/cards.md) | Frosted glass offering cards, editorial case studies, KPI stat panels |
| **Navigation & Header** | [navbar.md](./references/navbar.md) | Frosted sticky header with sliding underline indicator in Laravel red |
| **Layouts & Tables** | [layouts-tables.md](./references/layouts-tables.md) | Cinematic hero stage, scroll pulse indicator, client trust bar marquee |
| **Feedback & Dialogs** | [feedback-dialogs.md](./references/feedback-dialogs.md) | Editorial testimonial quotes, consultation modal, frosted cookie prompt |

---

## Bundled Tool Scripts

Execute these scripts directly in the terminal to scaffold and verify UI code:

- **Extract Component Boilerplate**:
  ```bash
  node scripts/scaffold-component.js --type <card|button|navbar|input|modal|table|layout|typography>
  ```
- **Audit WCAG Contrast**:
  ```bash
  node scripts/check-contrast.js
  ```
- **Lint UI Compliance (Mandatory Step)**:
  ```bash
  node scripts/verify-ui-compliance.js <path-to-html-or-component>
  ```
- **Extend Skill with New Component**:
  ```bash
  node scripts/extend-skill.js --add-component <name> --description "<details>"
  ```

---

## Procedural Workflow (4 Steps)

### Step 1: Identify Required Components
Scan the user prompt or feature requirements and identify the necessary components (e.g. Navigation Header + Cinematic Hero Stage + Offering Cards + Contact Form). Open the corresponding reference file(s) in `references/`.

### Step 2: Extract Canonical Recipes
Use the scaffolding script to retrieve verified markup:
```bash
node scripts/scaffold-component.js --type button --variant primary
node scripts/scaffold-component.js --type card --variant glass
node scripts/scaffold-component.js --type layout --variant hero
```
Alternatively, copy the exact code block from `references/<component>.md`.

### Step 3: Assemble & Wire Up Interface
Integrate the component into the page layout:
- Ensure the canvas mounts the 200px engineering grid and warm chalk (`bg-background`).
- Wrap cards in `.card-lift` and `.glass-card` for specular shine and frosted depth.
- Style primary CTAs as pills (`rounded-full`) with Laravel red/orange accent (`bg-primary text-primary-foreground`).
- Maintain accessible markup: ensure all `<button>` elements have text or `aria-label`, `<input>` elements have labels, and `<img>` elements have `alt`.

### Step 4: Run Deterministic Compliance Verification
Run the linter on the target file:
```bash
node scripts/verify-ui-compliance.js path/to/index.html
```
- If errors are reported, inspect the line number and remediation instruction, adjust markup, and rerun until the check passes with `0 errors`.
