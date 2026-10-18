# Cards & Containers Reference

This document provides canonical, copy-pasteable recipes for card layouts and containers in **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).
Cards use frosted glass surfaces (`.glass-card`), specular shine sheen (`.card-lift`), and crisp borders with Laravel red/orange accents.

---

## 1. Symph Offering / Capability Card (Glass Card Lift)

Used on Symph's homepage for core offerings (AI Consultancy, Custom AI Agents, Custom Software).
Features geometric crisp-edge icon, card lift elevation, and specular shimmer.

```html
<div class="card-lift glass-card relative p-8 md:p-10 rounded-2xl bg-surface/80 dark:bg-surface/50 border border-border/80 hover:border-primary/40 transition-all duration-300 group cursor-pointer space-y-6">
  <!-- Crisp Pixel-Style Geometric SVG Icon -->
  <div class="text-primary transition-transform duration-300 group-hover:scale-110 group-hover:text-primary">
    <svg class="w-10 h-10" viewBox="0 0 12 12" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="5" y="1" width="2" height="1"></rect>
      <rect x="4" y="2" width="4" height="1"></rect>
      <rect x="3" y="3" width="6" height="1"></rect>
      <rect x="2" y="4" width="8" height="1"></rect>
      <rect x="3" y="5" width="6" height="1"></rect>
      <rect x="4" y="6" width="4" height="1"></rect>
      <rect x="5" y="7" width="2" height="1"></rect>
      <rect x="5" y="9" width="2" height="2"></rect>
    </svg>
  </div>

  <div class="space-y-2">
    <h3 class="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
      Custom AI Agents
    </h3>
    <p class="text-base text-muted-foreground leading-relaxed">
      Deploy autonomous software workflows and domain-specific agents to put AI to work across your business.
    </p>
  </div>

  <div class="pt-2">
    <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary transition-all duration-200 group-hover:gap-3.5">
      <span>HireAI Workflow</span>
      <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
        <path d="M4 10h12M12 6l4 4-4 4" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </div>
</div>
```

---

## 2. Symph Editorial Work / Case Study Card

Alternating card layout used in Symph's Works index. Combines full-bleed media with high-contrast outcome statements and pill tags.

```html
<a 
  href="#case-study" 
  class="card-lift glass-card group grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-6 md:p-8 rounded-2xl bg-surface/90 border border-border/80 hover:border-primary/40 text-foreground no-underline transition-all duration-300"
>
  <!-- Media Frame with Hover Scale -->
  <div class="relative aspect-video rounded-xl overflow-hidden bg-muted/60 border border-border/50">
    <img 
      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
      alt="Platform Interface Preview" 
      class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
    />
  </div>

  <!-- Editorial Info -->
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="px-3 py-1 text-[11px] font-semibold uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20">
        AI Engineering
      </span>
      <span class="px-3 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full bg-muted text-muted-foreground border border-border">
        Web Application
      </span>
    </div>

    <h3 class="text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
      OceanJet Booking Platform
    </h3>

    <p class="text-base text-muted-foreground leading-relaxed">
      A digital booking and operations infrastructure that replaced manual ferry reservations for one of Southeast Asia's largest passenger fleets.
    </p>

    <!-- Key Outcome Highlight -->
    <div class="pt-3 border-t border-border/60">
      <div class="text-xs uppercase tracking-widest text-muted-foreground">Impact Outcome</div>
      <div class="text-lg font-bold text-foreground">1M+ Travelers Served Seamlessly</div>
    </div>
  </div>
</a>
```

---

## 3. High-Density KPI / Metric Card

Dashboard and analytics stat card with monospace numerals and trend pill.

```html
<div class="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
  <div class="flex items-center justify-between text-muted-foreground">
    <span class="text-xs font-semibold uppercase tracking-widest">Model Inference Throughput</span>
    <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/25">
      +28.4%
    </span>
  </div>
  <div class="space-y-1">
    <div class="text-3xl font-black font-mono tracking-tight text-foreground">84,920 req/s</div>
    <p class="text-xs text-muted-foreground">P99 latency maintained below 18ms under peak load.</p>
  </div>
</div>
```
