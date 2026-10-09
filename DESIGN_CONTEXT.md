# CONTEXT: ParcelHub Design System & UI Architecture

> **Purpose**: Single source of truth for frontend & AI generation (Claude, Cursor, Copilot, ChatGPT).  
> **Target Form Factor**: Mobile-First (Base viewport: 390px × 844px / iPhone 14/15/16 baseline).  
> **Aesthetic Archetype**: Modern Rounded Minimalist / Soft Fintech (Neo-Banking & Logistics).

---

## 1. System Philosophy & Anti-Patterns

### Core Principles
1. **Hyper-Rounded Geometric Language**: Interfaces prioritize organic pill-shapes (`rounded-full`), soft container radii (`rounded-2xl` to `rounded-3xl`), and completely eliminate sharp corners ($< 12\text{px}$).
2. **Subtle Depth over Wireframes**: Avoid harsh, thin 1px wireframe borders. Visual separation is accomplished via surface fills (`#F1F5F9`), micro-elevations (`shadow-sm`), and soft backdrop blurs.
3. **Logistics Clarity**: Crucial logistics telemetry (Tracking numbers, payment status badges, receiver credentials) must be scannable within 1.5 seconds.
4. **Accessible Touch Targets**: Every interactive component must satisfy at least a $48\text{px} \times 48\text{px}$ physical tap footprint.

### Explicit Anti-Patterns (Do NOT Generate)
* ❌ **No notched or split borders**: Do not generate input fields where the label cuts halfway through the top outline.
* ❌ **No pure black text or borders**: Never use `#000000`. Use Deep Slate (`#0F172A`).
* ❌ **No flat hospital-white screens**: Avoid blinding `#FFFFFF` whole-canvas fills; use off-white canvas (`#F8FAFC`).
* ❌ **No sharp rectangular buttons**: All action buttons must be `rounded-full` or minimum `rounded-2xl`.
* ❌ **No wireframe circle keypads**: MPIN buttons must use filled background surfaces, never hollow outlines.

---

## 2. Color Tokens (Strict 60-30-10 Distribution)

### 60% — Canvas & Base Surfaces (Dominant)
Sets the atmospheric tone and prevents visual fatigue.

| Token Name | Hex Code | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- | :--- |
| `surface-canvas` | `#F8FAFC` | `bg-slate-50` | Full-screen app background |
| `surface-card` | `#FFFFFF` | `bg-white` | Elevated floating cards, modals, sheets |
| `surface-subtle` | `#F1F5F9` | `bg-slate-100` | Input field background, keypad pill fills |
| `surface-inverse` | `#0F172A` | `bg-slate-900` | High-contrast hero metric card (Active Orders) |
| `surface-glass` | `rgba(255,255,255,0.85)` | `bg-white/85 backdrop-blur-md` | Floating bottom navigation dock |

### 30% — Structure, Layout & Content (Secondary)
Provides readable hierarchy, icons, and structural grounding.

| Token Name | Hex Code | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- | :--- |
| `text-primary` | `#0F172A` | `text-slate-900` | Headings, amounts, active codes, button labels |
| `text-secondary` | `#475569` | `text-slate-600` | Field labels, subheaders, body instructions |
| `text-muted` | `#94A3B8` | `text-slate-400` | Timestamps, placeholders, inactive icon states |
| `border-subtle` | `#E2E8F0` | `border-slate-200` | Dividers, soft card perimeter rings |
| `border-focus` | `#2563EB` | `ring-blue-600` | Input focus boundary |

### 10% — Accent, Actions & Semantic Feedback (Accents)
Draws direct focus to conversions, tap targets, and status cues.

| Token Name | Hex Code | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- | :--- |
| `brand-primary` | `#2563EB` | `bg-blue-600` | Main CTA buttons, active radio indicators |
| `brand-hover` | `#1D4ED8` | `bg-blue-700` | Active tap state |
| `brand-soft` | `#EFF6FF` | `bg-blue-50` | Secondary buttons, icon badge backdrops |
| `brand-soft-text` | `#1D4ED8` | `text-blue-700` | Labels on `brand-soft` surfaces |
| `status-success-bg` | `#DCFCE7` | `bg-emerald-100` | Pill badge for "Ready to Claim" |
| `status-success-text`| `#15803D` | `text-emerald-700` | Status text for claimed packages |
| `status-warning-bg` | `#FEF3C7` | `bg-amber-100` | Pill badge for "Pending" / "Awaiting Payment" |
| `status-warning-text`| `#B45309` | `text-amber-700` | Status text for pending states |
| `status-error` | `#EF4444` | `bg-rose-500` | Notification indicator count badge, error hints |

---

## 3. Shape & Elevation Scale

### Border Radius Hierarchy
```
[ Component ]                   [ Radius ]       [ Tailwind Class ]
Pill Buttons & Badges --------> 9999px --------> rounded-full
Keypad Numbers ---------------> 9999px --------> rounded-full
Hero Summary / Camera Frame --> 28px ----------> rounded-3xl
Activity / Order Cards -------> 20px ----------> rounded-2xl
Input Fields -----------------> 16px ----------> rounded-2xl
Small Badges / Micro-tags ----> 9999px --------> rounded-full
```

### Elevation & Depth Levels
* **Level 0 (Flat)**: `border border-slate-200/60` (Used inside dark cards or nested components).
* **Level 1 (Card Rest)**: `shadow-sm shadow-slate-200/50 border border-slate-100` (Transaction rows, static info cards).
* **Level 2 (Interactive Floating)**: `shadow-lg shadow-blue-500/20` (Primary button emphasis).
* **Level 3 (Modal / Nav Dock)**: `shadow-xl shadow-slate-300/40 border border-white/60` (Floating navigation bar).

---

## 4. Typography Matrix

* **Primary Font Stack**: `Plus Jakarta Sans`, `Inter`, `SF Pro Text`, system-ui.
* **Monospace Stack**: `JetBrains Mono`, `SF Mono` (for Tracking IDs & Pin codes).

| Tier | Size | Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | $32\text{px}$ | $38\text{px}$ | 800 (ExtraBold) | `-0.02em` | Active counter values, big balances |
| **H1** | $24\text{px}$ | $30\text{px}$ | 700 (Bold) | `-0.01em` | Screen main titles (e.g., "Create an Order") |
| **H2** | $18\text{px}$ | $24\text{px}$ | 700 (Bold) | `normal` | Section headers ("Activities") |
| **Body Bold**| $15\text{px}$ | $22\text{px}$ | 600 (SemiBold) | `normal` | Button text, item names |
| **Body** | $14\text{px}$ | $20\text{px}$ | 500 (Medium) | `normal` | Input values, descriptive explanations |
| **Label** | $12\text{px}$ | $16\text{px}$ | 600 (SemiBold) | `+0.02em`| Input field headers, uppercase meta |
| **Caption** | $11\text{px}$ | $14\text{px}$ | 500 (Medium) | `normal` | Timestamps, secondary transaction info |

---

## 5. Standard Component Blueprints

### 5.1. Form Inputs (Replaces Broken Wireframe)
* **Structure**: Clean stack consisting of a top uppercase micro-label followed by a soft tinted pill container.
* **Tailwind Blueprint**:
```html
<div class="space-y-1.5 w-full">
  <label class="text-[12px] font-semibold text-slate-500 uppercase tracking-wider pl-3">
    Email Address
  </label>
  <div class="flex items-center bg-slate-100 rounded-2xl px-4 py-3.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:shadow-sm">
    <input 
      type="email" 
      placeholder="johnvincekeyed@gmail.com" 
      class="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
    />
  </div>
</div>
```

### 5.2. Primary and Secondary Action Buttons
* **Structure**: Full-width pill (`rounded-full`) with active press-scale micro-interaction (`active:scale-[0.98]`).
* **Tailwind Blueprint**:
```html
<!-- Primary Action CTA -->
<button class="w-full h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-base font-semibold rounded-full shadow-lg shadow-blue-600/25 flex items-center justify-center transition-all">
  <span>Create Order</span>
</button>

<!-- Secondary / Back Button -->
<button class="w-full h-12 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-700 text-sm font-semibold rounded-full flex items-center justify-center transition-all">
  <span>Register an account</span>
</button>
```

### 5.3. Hero Metric Card (Active Orders)
* **Structure**: Deep slate high-contrast card with glassmorphism micro-action tiles.
* **Tailwind Blueprint**:
```html
<div class="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10">
  <div class="flex items-baseline gap-2 mb-6">
    <span class="text-4xl font-extrabold tracking-tight">3</span>
    <span class="text-slate-300 font-medium text-sm">Active Orders</span>
  </div>
  
  <!-- 5-Column Quick Action Grid -->
  <div class="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800">
    <!-- Action Item -->
    <button class="flex flex-col items-center gap-1.5 group">
      <div class="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <!-- Icon -->
      </div>
      <span class="text-[10px] font-medium text-slate-400 text-center leading-tight">Create</span>
    </button>
  </div>
</div>
```

### 5.4. Activity / Parcel Item Card
* **Structure**: Rounded-2xl card with semantic status chip and monospace tracking support.
* **Tailwind Blueprint**:
```html
<div class="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
  <div class="flex items-center gap-3.5">
    <div class="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
      <!-- Incline Arrow / Package Icon -->
    </div>
    <div>
      <h4 class="text-sm font-bold text-slate-900">VXE R1 Nearlink</h4>
      <p class="text-xs font-medium text-slate-400">March 16, 2026 · 16:43</p>
    </div>
  </div>
  <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
    Ready to Claim
  </span>
</div>
```

### 5.5. Modern MPIN Circular Keypad
* **Structure**: Tactile circular keys with smooth fill states rather than hairline borders.
* **Tailwind Blueprint**:
```html
<!-- MPIN Indicators -->
<div class="flex justify-center items-center gap-4 my-6">
  <div class="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
  <div class="w-3.5 h-3.5 rounded-full bg-blue-600"></div>
  <div class="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
  <div class="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
</div>

<!-- Keypad Grid (Centered 3-column) -->
<div class="grid grid-cols-3 gap-y-4 gap-x-8 max-w-[280px] mx-auto">
  <button class="w-16 h-16 rounded-full bg-slate-100 text-slate-900 text-xl font-bold flex items-center justify-center active:bg-blue-600 active:text-white transition-all">
    1
  </button>
</div>
```

### 5.6. Floating Island Bottom Navigation
* **Structure**: Floats $16\text{px}$ above screen bottom with backdrop blur and pill badge.
* **Tailwind Blueprint**:
```html
<nav class="fixed bottom-5 left-5 right-5 h-16 bg-white/90 backdrop-blur-md rounded-full px-6 flex items-center justify-between shadow-xl shadow-slate-300/40 border border-white/60 z-50">
  <button class="flex flex-col items-center gap-0.5 text-blue-600">
    <span class="w-1.5 h-1.5 rounded-full bg-blue-600 mb-0.5"></span>
    <span class="text-[11px] font-bold">Home</span>
  </button>
  <button class="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700">
    <span class="text-[11px] font-medium">Orders</span>
  </button>
  <button class="relative flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700">
    <span class="absolute -top-1 -right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">4</span>
    <span class="text-[11px] font-medium">Alerts</span>
  </button>
  <button class="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700">
    <span class="text-[11px] font-medium">Account</span>
  </button>
</nav>
```

---

## 6. AI Agent Prompt Directives

Paste this system instruction into your prompt configuration when asking AI coding agents to create ParcelHub screens:

```text
Follow the ParcelHub Modern Rounded Design System at CONTEXT/parcelhub_design_system_context.md:
1. Corner radii must be hyper-rounded: buttons & tags must use `rounded-full`, inputs `rounded-2xl`, cards `rounded-2xl`, and summary headers `rounded-3xl`.
2. Follow the 60-30-10 color rule strictly: 60% background (#F8FAFC canvas, #FFFFFF card), 30% structural text & borders (#0F172A primary text, #F1F5F9 input fills, #E2E8F0 borders), 10% accent (#2563EB primary CTA, #DCFCE7/#FEF3C7 semantic badges).
3. Do not create wireframe cut-out labels. Form inputs must be solid rounded-2xl containers with labels resting cleanly above them.
4. Keypad numbers must be filled circles (w-16 h-16 rounded-full bg-slate-100), not wireframe outlines.
5. Bottom navigation must be a floating island (rounded-full or rounded-3xl) with backdrop blur.
```