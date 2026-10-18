'use client';

import React from 'react';

interface HeroStageProps {
  onOpenClaimModal?: () => void;
  onOpenIntakeModal?: () => void;
  onScrollToWorkspace?: () => void;
  waitingCount: number;
}

export const HeroStage: React.FC<HeroStageProps> = ({
  onOpenClaimModal,
  onOpenIntakeModal,
  onScrollToWorkspace,
  waitingCount,
}) => {
  return (
    <section className="relative min-h-[50vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
      {/* Hero Content Stage */}
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Supertitle Micro-Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <span>Zero-Credit Campus Escrow Terminal</span>
        </div>

        {/* Main Headline with Accent Word */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.08] text-balance">
          Campus Logistics.<br />
          <span className="text-primary underline decoration-primary/40 underline-offset-8 transition-transform duration-200 inline-block hover:scale-[1.02]">
            Zero cash liabilities.
          </span>
        </h1>

        {/* Subtitle with Terminal Cursor */}
        <p className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground font-normal leading-relaxed">
          <span>
            Automated courier intake, Gemini AI waybill inspection, and atomic student cash handshakes. Backed by mathematical escrow solvency
          </span>
          <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse align-middle" aria-hidden="true" />
        </p>

        {/* Dual Pill CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {/* Primary Pill CTA with Specular Shine */}
          <button
            type="button"
            onClick={onOpenClaimModal}
            className="relative inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,45,32,0.35),0_0_40px_rgba(255,45,32,0.15)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="relative z-10">Start Claim Handshake</span>
            {waitingCount > 0 && (
              <span className="relative z-10 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-white text-primary">
                {waitingCount} Waiting
              </span>
            )}
          </button>

          {/* Secondary See Work / Intake Pill */}
          <button
            type="button"
            onClick={onOpenIntakeModal}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-foreground bg-transparent border border-foreground/30 hover:border-foreground rounded-full transition-all duration-200 hover:bg-foreground/5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>Intake Courier Package</span>
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Vertical Scroll Indicator Line */}
      <div 
        onClick={onScrollToWorkspace}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onScrollToWorkspace?.(); }}
        aria-label="Scroll to workspace"
        className="mt-12 flex flex-col items-center gap-2 text-muted-foreground/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1"
      >
        <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Studio Desk</span>
        <div className="w-[1px] h-10 bg-border relative overflow-hidden" aria-hidden="true">
          <div className="w-full h-1/2 bg-primary animate-[scrollPulse_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
};
