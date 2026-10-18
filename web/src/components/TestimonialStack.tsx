'use client';

import React, { useState } from 'react';

const TESTIMONIALS = [
  {
    quote: (
      <>
        “For a complex campus ecosystem,{' '}
        <strong className="text-primary font-bold">
          ParcelHub eliminated cash liabilities and lost packages from day one
        </strong>
        . Counter handshakes take under 30 seconds with zero discrepancies.”
      </>
    ),
    author: 'Jhoana Rull',
    role: 'Dean of Student Affairs, Public Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
  },
  {
    quote: (
      <>
        “The combination of{' '}
        <strong className="text-primary font-bold">
          Gemini AI vision OCR and zero-credit escrow
        </strong>{' '}
        protects our students from lost COD deposits while providing riders with instant cash payouts.”
      </>
    ),
    author: 'Marcus Vance',
    role: 'Director of Campus Operations & Security',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
  },
  {
    quote: (
      <>
        “Our student union verified{' '}
        <strong className="text-primary font-bold">
          100% compliance with zero-trust escrow invariants
        </strong>
        . Physical envelope change reconciliation is foolproof.”
      </>
    ),
    author: 'Elena Cruz',
    role: 'Student Logistics Council President',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=160&q=80',
  },
];

export const TestimonialStack: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="py-12">
      <div className="card-lift glass-card max-w-4xl mx-auto p-8 sm:p-12 md:p-16 rounded-3xl bg-surface/90 border border-border/80 text-center space-y-8">
        {/* Large Editorial Quote */}
        <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground leading-snug text-balance">
          {current.quote}
        </blockquote>

        {/* Author Stack */}
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Circular Avatar with Subtle Border */}
          <img
            src={current.avatar}
            alt={current.author}
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
          />
          <div className="space-y-0.5">
            <div className="text-base font-bold text-foreground">{current.author}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{current.role}</div>
          </div>
        </div>

        {/* Testimonial Slider Dots */}
        <div className="flex items-center justify-center gap-2 pt-2" role="tablist" aria-label="Testimonial Navigation">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                currentIndex === idx
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-border hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
