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
  // 60% — Canvas & Base Surfaces (Symph Studio Craft)
  surface: {
    canvas: '#faf9f7', // Base app background (warm chalk)
    card: '#ffffff', // Elevated floating cards, sheets
    subtle: '#f2f0eb', // Input field bg, keypad pill fills (cream)
    inverse: '#0f0f12', // High-contrast hero metric card (deep ink)
    glass: 'rgba(250, 249, 247, 0.85)', // Floating bottom nav dock with blur
    glassInverse: 'rgba(15, 15, 18, 0.85)',
    border: '#d4d0c8', // Aliased for card perimeter borders
  },

  // 30% — Structure, Layout & Content
  structure: {
    textPrimary: '#0f0f12', // Deep ink for headings, amounts
    textSecondary: '#5a5a5e', // Field labels, instructions
    textMuted: '#a1a1aa', // Timestamps, placeholders, inactive icons
    borderSubtle: '#d4d0c8', // Dividers, soft card perimeter rings
    borderFocus: '#ff2d20', // Input focus ring (Laravel flame)
  },

  // 10% — Accent, Actions & Semantic Feedback
  accent: {
    brandPrimary: '#d9261a', // Main CTA buttons, active indicators (Laravel flame)
    brandHover: '#ff2d20', // Active tap state
    brandSoft: 'rgba(217, 38, 26, 0.08)', // Secondary buttons, icon backdrops
    brandSoftText: '#d9261a', // Labels on brand-soft surfaces
    subtleBlue: 'rgba(217, 38, 26, 0.08)', // Compatibility alias
    
    // Semantic States
    successBg: '#dcfce7', // Ready to Claim / Claimed badge background
    successText: '#15803d', // Ready to Claim text
    subtleGreen: '#dcfce7', // Convenience alias for successBg
    warningBg: '#fef3c7', // Pending / Awaiting Funding badge
    warningText: '#b45309', // Warning text
    error: '#ef4444', // Notification count badge, errors
  },
} as const;

export const Radius = {
  // Hyper-Rounded Geometric Language (Design System Rule: No sharp corners < 12px)
  pill: 9999,
  full: 9999,
  hero: 28,
  card: 20,
  xxl: 28,
  xl: 20,
  lg: 16,
  md: 12,
  sm: 8,
  input: 16,
  badge: 9999,
} as const;

export const Typography = {
  fontFamily: {
    sans: 'System',
    mono: 'Courier',
  },
  fontSize: {
    display: 32,
    title1: 28,
    title2: 24,
    title3: 20,
    headline: 18,
    body: 14,
    subhead: 13,
    caption: 11,
    small: 10,
    tiny: 9,
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
