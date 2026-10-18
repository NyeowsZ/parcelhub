# Layouts & Tables Reference

This document provides canonical, copy-pasteable recipes for layouts, hero stages, trust bars, and tables in **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).

---

## 1. Symph Cinematic Studio Hero Stage

The signature hero section on Symph.co: warm chalk canvas with 200px engineering grid, high-impact headline, blinking terminal cursor, dual pill CTA row, and animated vertical scroll pulse line.

```html
<section class="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
  <!-- Hero Content Stage -->
  <div class="max-w-5xl mx-auto space-y-8 relative z-10">
    <!-- Supertitle Micro-Tag -->
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-widest">
      <span class="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
      <span>AI Engineering Studio</span>
    </div>

    <!-- Main Headline with Accent Word -->
    <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.08] text-balance">
      Real AI expertise.<br />
      <span class="text-primary underline decoration-primary/40 underline-offset-8">Real results.</span>
    </h1>

    <!-- Subtitle with Terminal Cursor -->
    <p class="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed">
      <span>Software that accelerates revenue and operations. Backed by engineering craft and accelerated by AI</span><span class="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse align-middle" aria-hidden="true"></span>
    </p>

    <!-- Dual Pill CTA Row -->
    <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
      <!-- Primary Pill CTA with Specular Shine -->
      <a 
        href="#contact" 
        class="relative inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,45,32,0.35),0_0_40px_rgba(255,45,32,0.15)] group"
      >
        <span class="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
        <span class="relative z-10">Start a Project</span>
      </a>

      <!-- Secondary See Work Pill -->
      <a 
        href="#works" 
        class="inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-foreground bg-transparent border border-foreground/30 hover:border-foreground rounded-full transition-all duration-200 hover:bg-foreground/5 group"
      >
        <span>See Our Work</span>
        <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M4 10h12M12 6l4 4-4 4" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
    </div>
  </div>

  <!-- Vertical Scroll Indicator Line -->
  <div class="mt-16 flex flex-col items-center gap-2 text-muted-foreground/60" aria-hidden="true">
    <div class="w-[1px] h-12 bg-border relative overflow-hidden">
      <div class="w-full h-1/2 bg-primary animate-[scrollPulse_2s_ease-in-out_infinite]"></div>
    </div>
  </div>
</section>
```

---

## 2. Partner / Client Trust Bar (Infinite Marquee Ticker)

A clean monochrome trust bar displaying enterprise and startup partners.

```html
<section class="w-full border-y border-border/80 py-8 bg-surface/50 backdrop-blur-xs overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-6">
      <span class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Trusted by high-growth startups and global institutions
      </span>
    </div>

    <!-- Partner Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
      <div class="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">500 Global</div>
      <div class="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">BPI Group</div>
      <div class="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">Dept of Budget</div>
      <div class="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">Sunnies Studios</div>
      <div class="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">OceanJet</div>
      <div class="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">Qavalo</div>
    </div>
  </div>
</section>
```

---

## 3. Responsive Studio Deliverables / SLA Table

Clean tabular layout with subtle borders, muted table headers, and monospace latency/metrics cells.

```html
<div class="w-full overflow-hidden rounded-2xl border border-border bg-surface">
  <div class="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
    <div class="space-y-0.5">
      <h3 class="text-sm font-semibold uppercase tracking-wider text-foreground">Service Level Commitments</h3>
      <p class="text-xs text-muted-foreground">Engineering delivery timelines and production SLAs.</p>
    </div>
    <span class="px-2.5 py-1 text-[11px] font-medium font-mono uppercase rounded-full bg-primary/10 text-primary">
      Q4 Verified
    </span>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left text-xs">
      <thead class="bg-muted text-muted-foreground border-b border-border-subtle font-semibold uppercase tracking-wider">
        <tr>
          <th scope="col" class="px-6 py-3.5">Discipline</th>
          <th scope="col" class="px-6 py-3.5">Deployment Model</th>
          <th scope="col" class="px-6 py-3.5">Standard Velocity</th>
          <th scope="col" class="px-6 py-3.5 text-right">Production SLA</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border-subtle text-foreground">
        <tr class="hover:bg-muted/40 transition-colors">
          <td class="px-6 py-4 font-medium flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary"></span>
            <span>Custom AI Agents</span>
          </td>
          <td class="px-6 py-4 text-muted-foreground">Self-hosted / Cloud</td>
          <td class="px-6 py-4 font-mono">14 – 21 Days</td>
          <td class="px-6 py-4 text-right font-mono font-semibold text-primary">99.95%</td>
        </tr>
        <tr class="hover:bg-muted/40 transition-colors">
          <td class="px-6 py-4 font-medium flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-foreground"></span>
            <span>Web Platform Engineering</span>
          </td>
          <td class="px-6 py-4 text-muted-foreground">Full-Stack Cloud Native</td>
          <td class="px-6 py-4 font-mono">30 – 45 Days</td>
          <td class="px-6 py-4 text-right font-mono font-semibold text-primary">99.99%</td>
        </tr>
        <tr class="hover:bg-muted/40 transition-colors">
          <td class="px-6 py-4 font-medium flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-muted-foreground"></span>
            <span>Product & UI/UX Design</span>
          </td>
          <td class="px-6 py-4 text-muted-foreground">Design System + Prototypes</td>
          <td class="px-6 py-4 font-mono">10 – 14 Days</td>
          <td class="px-6 py-4 text-right font-mono font-semibold text-muted-foreground">Design Signoff</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
