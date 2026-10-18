# Navigation & Headers Reference

This document provides canonical, copy-pasteable recipes for navigation bars and application headers in **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).
Navigation reflects Symph's frosted glass sticky header (`backdrop-blur-md`), sliding underline indicators in Laravel red, and tracked uppercase typography.

---

## 1. Symph Studio Header (Frosted Top Nav)

Sticky frosted header with brand wordmark, tracked navigation links with sliding underline indicators, and Laravel red action pill.

```html
<header class="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border/80 transition-colors">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
    <!-- Brand Wordmark -->
    <a href="/" class="flex items-center gap-2 text-foreground font-black tracking-tight text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
      <span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
      <span class="uppercase tracking-widest text-sm font-extrabold">Symph</span>
    </a>

    <!-- Main Navigation Links with Sliding Underline -->
    <nav aria-label="Main Navigation" class="hidden md:flex items-center gap-1 lg:gap-2">
      <a 
        href="#works" 
        class="relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:text-primary after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-250 after:origin-left"
      >
        Works
      </a>
      <a 
        href="#services" 
        class="relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:text-primary after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-250 after:origin-left"
      >
        Services
      </a>
      <a 
        href="#tools" 
        class="relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:text-primary after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-250 after:origin-left"
      >
        Tools
      </a>
      <a 
        href="#about" 
        class="relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:text-primary after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-250 after:origin-left"
      >
        About
      </a>
      <a 
        href="#blog" 
        class="relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:text-primary after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-250 after:origin-left"
      >
        Blog
      </a>
    </nav>

    <!-- Right Actions: Theme Switcher & Contact Pill -->
    <div class="flex items-center gap-3">
      <!-- Dark/Light Theme Toggle -->
      <button 
        type="button" 
        id="theme-toggle" 
        aria-label="Toggle dark mode" 
        class="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg class="w-4 h-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg class="w-4 h-4 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- Pill Action CTA -->
      <a 
        href="#contact" 
        class="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-200 hover:shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Let's Ship</span>
      </a>

      <!-- Mobile Menu Button -->
      <button 
        type="button" 
        aria-label="Open mobile navigation menu" 
        class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</header>
```
