/**
 * ParcelHub Design System & UI Architecture Tokens
 * Source of truth: DESIGN_CONTEXT.md
 * 
 * Strict 60-30-10 Color Rule:
 * - 60% Canvas & Base Surfaces: surface-canvas, surface-card, surface-subtle, surface-inverse, surface-glass
 * - 30% Structure, Layout & Content: text-primary, text-secondary, text-muted, border-subtle, border-focus
 * - 10% Accent, Actions & Semantic Feedback: brand-primary, brand-hover, brand-soft, status-success, status-warning, status-error
 */

export const Colors = {
  // 60% — Canvas & Base Surfaces
  surface: {
    canvas: '#F8FAFC', // Base app background (off-white, avoids hospital-white)
    card: '#FFFFFF', // Elevated floating cards, sheets
    subtle: '#F1F5F9', // Input field bg, keypad pill fills (slate-100)
    inverse: '#0F172A', // High-contrast hero metric card (slate-900)
    glass: 'rgba(255, 255, 255, 0.85)', // Floating bottom nav dock with blur
    glassInverse: 'rgba(15, 23, 42, 0.85)',
  },

  // 30% — Structure, Layout & Content
  structure: {
    textPrimary: '#0F172A', // Deep slate for headings, amounts (NEVER pure #000000)
    textSecondary: '#475569', // Field labels, instructions (slate-600)
    textMuted: '#94A3B8', // Timestamps, placeholders, inactive icons (slate-400)
    borderSubtle: '#E2E8F0', // Dividers, soft card perimeter rings (slate-200)
    borderFocus: '#2563EB', // Input focus ring (blue-600)
  },

  // 10% — Accent, Actions & Semantic Feedback
  accent: {
    brandPrimary: '#2563EB', // Main CTA buttons, active indicators (blue-600)
    brandHover: '#1D4ED8', // Active tap state (blue-700)
    brandSoft: '#EFF6FF', // Secondary buttons, icon backdrops (blue-50)
    brandSoftText: '#1D4ED8', // Labels on brand-soft surfaces
    
    // Semantic States
    successBg: '#DCFCE7', // Ready to Claim / Claimed badge background (emerald-100)
    successText: '#15803D', // Ready to Claim text (emerald-700)
    warningBg: '#FEF3C7', // Pending / Awaiting Funding badge (amber-100)
    warningText: '#B45309', // Warning text (amber-700)
    error: '#EF4444', // Notification count badge, errors (rose-500)
  },
} as const;

export const Radius = {
  // Hyper-Rounded Geometric Language (Design System Rule: No sharp corners < 12px)
  pill: 9999, // Pill buttons, badges, keypad numbers (rounded-full)
  hero: 28, // Hero summary card, camera frame (rounded-3xl)
  card: 20, // Activity & parcel cards, modal sheets (rounded-2xl)
  input: 16, // Input fields (rounded-2xl)
  badge: 9999, // Micro-tags, pills (rounded-full)
} as const;

export const Typography = {
  fontFamily: {
    sans: 'System', // Plus Jakarta Sans / Inter / system-ui
    mono: 'Courier', // JetBrains Mono / SF Mono for tracking numbers & MPIN
  },
  sizes: {
    display: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6 },
    h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.3 },
    h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const, letterSpacing: 0 },
    bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, letterSpacing: 0 },
    body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const, letterSpacing: 0 },
    label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.5 },
    caption: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const, letterSpacing: 0 },
  },
} as const;

export const Shadows = {
  level0: {
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  level1: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  level2: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  level3: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;
