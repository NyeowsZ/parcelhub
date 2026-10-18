# Feedback, Modals & Dialogs Reference

This document provides canonical, copy-pasteable recipes for testimonials, modal dialogs, status banners, and cookie prompts in **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).

---

## 1. Symph Editorial Testimonial Stack

Symph's hallmark testimonial showcase featuring large quote typography, bold highlighted phrases, client avatar, and clean pagination dots.

```html
<div class="card-lift glass-card max-w-4xl mx-auto p-8 sm:p-12 md:p-16 rounded-3xl bg-surface/90 border border-border/80 text-center space-y-8">
  <!-- Large Editorial Quote -->
  <blockquote class="text-xl sm:text-2xl md:text-3xl font-medium text-foreground leading-snug text-balance">
    “For a complex platform, <strong class="text-primary font-bold">Symph truly delivered what we had in mind from day one</strong>. Working with their team felt like an engineering co-founder rather than an agency.”
  </blockquote>

  <!-- Author Stack -->
  <div class="flex flex-col items-center justify-center space-y-3">
    <!-- Circular Avatar with Subtle Border -->
    <img 
      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80" 
      alt="Jhoana Rull" 
      class="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
    />
    <div class="space-y-0.5">
      <div class="text-base font-bold text-foreground">Jhoana Rull</div>
      <div class="text-xs uppercase tracking-wider text-muted-foreground">Chief Information Officer, Public Systems</div>
    </div>
  </div>

  <!-- Testimonial Slider Dots -->
  <div class="flex items-center justify-center gap-2 pt-2" role="tablist" aria-label="Testimonial Navigation">
    <button type="button" aria-label="Go to testimonial 1" class="w-8 h-1.5 rounded-full bg-primary transition-all"></button>
    <button type="button" aria-label="Go to testimonial 2" class="w-2 h-1.5 rounded-full bg-border hover:bg-muted-foreground transition-all"></button>
    <button type="button" aria-label="Go to testimonial 3" class="w-2 h-1.5 rounded-full bg-border hover:bg-muted-foreground transition-all"></button>
  </div>
</div>
```

---

## 2. Accessible Consultation Modal Dialog

Keyboard-accessible dialog with frosted blur backdrop (`backdrop-blur-md`), minimal underline input fields, and Laravel red action button.

```html
<div 
  id="consultation-modal" 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title" 
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
>
  <div class="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
    <!-- Close Button -->
    <button 
      type="button" 
      aria-label="Close dialog" 
      class="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="space-y-1">
      <div class="text-xs font-semibold uppercase tracking-widest text-primary">Direct Inquiry</div>
      <h2 id="modal-title" class="text-2xl font-bold tracking-tight text-foreground">
        Let's build your AI system.
      </h2>
      <p class="text-xs text-muted-foreground">
        Tell us what you're creating. Guaranteed engineering response within 24 hours.
      </p>
    </div>

    <form class="space-y-5">
      <div class="space-y-1">
        <label for="modal-name" class="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Name</label>
        <input 
          type="text" 
          id="modal-name" 
          name="name" 
          required 
          placeholder="What is your name?"
          class="w-full bg-transparent border-0 border-b border-border py-2 text-sm text-foreground focus:border-b-2 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div class="space-y-1">
        <label for="modal-email" class="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Work Email</label>
        <input 
          type="email" 
          id="modal-email" 
          name="email" 
          required 
          placeholder="name@company.com"
          class="w-full bg-transparent border-0 border-b border-border py-2 text-sm text-foreground focus:border-b-2 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <button 
        type="submit" 
        class="w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring"
      >
        Send Consultation Request
      </button>
    </form>
  </div>
</div>
```

---

## 3. Frosted Cookie / Notice Banner

Compact notice positioned at the viewport edge with pill actions.

```html
<div class="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 p-6 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border shadow-xl space-y-4">
  <div class="space-y-1">
    <div class="text-[11px] font-bold uppercase tracking-widest text-foreground">Privacy & Cookies</div>
    <p class="text-xs text-muted-foreground leading-relaxed">
      We use strictly essential telemetry to optimize AI model latency and understand feature usage across our platform.
    </p>
  </div>

  <div class="flex items-center gap-3">
    <button 
      type="button" 
      class="flex-1 py-2 text-xs font-medium uppercase tracking-wider rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
    >
      Accept
    </button>
    <button 
      type="button" 
      class="flex-1 py-2 text-xs font-medium uppercase tracking-wider rounded-full bg-transparent border border-border text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
    >
      Decline
    </button>
  </div>
</div>
```
