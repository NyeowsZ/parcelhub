# Buttons & Form Controls Reference

This document provides canonical, copy-pasteable recipes for interactive controls in **symph-laravel-studio-skill** (Archetype: **Symph Studio Craft**).
Every interactive control reflects Symph's signature pill silhouettes (`rounded-full`), specular shine sweeps, and Laravel red/orange luminous glow.

---

## 1. Symph Pill Button Variants

### Primary Action Pill Button (with Specular Shine & Laravel Glow)
The flagship CTA on Symph. Features a 105° specular shine sweep and Laravel flame glow on hover.

```html
<button 
  type="button" 
  class="relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,45,32,0.35),0_0_40px_rgba(255,45,32,0.15)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none group"
>
  <!-- Specular Sheen Overlay -->
  <span class="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
  <span class="relative z-10">Start a Project</span>
  <svg class="relative z-10 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 20 20" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10h12M12 6l4 4-4 4" />
  </svg>
</button>
```

### Secondary Outline Pill Button (Specular Hover)
A crisp structural pill border with a subtle white sheen sweep across the face.

```html
<button 
  type="button" 
  class="relative inline-flex items-center justify-center gap-2 px-7 py-3 text-xs font-medium uppercase tracking-widest text-foreground bg-transparent border border-foreground/30 hover:border-foreground rounded-full overflow-hidden transition-all duration-200 hover:bg-foreground/5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none group"
>
  <span class="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></span>
  <span class="relative z-10">See Our Work</span>
</button>
```

### Subtle Glass Pill Button
Frosted pill button for overlaying heroes or media.

```html
<button 
  type="button" 
  class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-foreground bg-surface/70 backdrop-blur-md border border-border hover:bg-surface-elevated hover:border-border-subtle rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  <span>Explore Services</span>
</button>
```

### Animated Wavy Arrow Link
Symph's editorial text link with an animated arrow slide.

```html
<a 
  href="#services" 
  class="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground hover:text-primary transition-colors duration-200"
>
  <span>View All Capabilities</span>
  <svg class="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
    <path d="M4 10h12M12 6l4 4-4 4" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</a>
```

---

## 2. Symph Minimalist Form Controls

### Minimalist Underline Text Input (Symph Contact Form Standard)
Symph uses flat, borderless underline inputs that light up in Laravel red on focus.

```html
<div class="space-y-2">
  <label for="contact-name" class="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
    What is your name?
  </label>
  <input 
    type="text" 
    id="contact-name" 
    name="name" 
    placeholder="Jane Doe" 
    required
    class="w-full bg-transparent border-0 border-b border-border py-3 text-base text-foreground placeholder:text-muted-foreground/50 transition-colors focus:outline-none focus:border-b-2 focus:border-primary focus:ring-0"
  />
</div>
```

### Minimalist Underline Select with Custom Chevron
```html
<div class="space-y-2">
  <label for="contact-service" class="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
    What service are you looking for?
  </label>
  <div class="relative">
    <select 
      id="contact-service" 
      name="service" 
      required
      class="w-full appearance-none bg-transparent border-0 border-b border-border py-3 pr-8 text-base text-foreground transition-colors focus:outline-none focus:border-b-2 focus:border-primary focus:ring-0 cursor-pointer"
    >
      <option value="" disabled selected class="bg-surface text-muted-foreground">Select a discipline</option>
      <option value="ai-apps" class="bg-surface text-foreground">Custom AI Applications & Agents</option>
      <option value="web-platforms" class="bg-surface text-foreground">Web Platforms & Engineering</option>
      <option value="uiux-design" class="bg-surface text-foreground">Product & UI/UX Design</option>
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-muted-foreground">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>
```

### Minimalist Textarea
```html
<div class="space-y-2">
  <label for="project-details" class="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
    Tell us about your project
  </label>
  <textarea 
    id="project-details" 
    name="details" 
    rows="4" 
    placeholder="Describe your vision, timeline, or architecture constraints..." 
    class="w-full bg-transparent border-0 border-b border-border py-3 text-base text-foreground placeholder:text-muted-foreground/50 resize-y transition-colors focus:outline-none focus:border-b-2 focus:border-primary focus:ring-0"
  ></textarea>
</div>
```

### Filter Pill Toggle / Radio Filter Group
```html
<div class="flex flex-wrap items-center gap-2" role="group" aria-label="Portfolio Category Filter">
  <button 
    type="button" 
    class="px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full bg-foreground text-background transition-colors focus-visible:ring-2 focus-visible:ring-ring"
  >
    All Works
  </button>
  <button 
    type="button" 
    class="px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle transition-colors focus-visible:ring-2 focus-visible:ring-ring"
  >
    AI & Agents
  </button>
  <button 
    type="button" 
    class="px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle transition-colors focus-visible:ring-2 focus-visible:ring-ring"
  >
    Web Platforms
  </button>
</div>
```
