'use client';

import React from 'react';

export const TrustBar: React.FC = () => {
  return (
    <section className="w-full border-y border-border/80 py-8 bg-surface/50 backdrop-blur-xs overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Integrated Carrier & Campus Infrastructure Partners
          </span>
        </div>

        {/* Partner Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
            J&T Express
          </div>
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
            Shopee Xpress
          </div>
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
            Flash Express
          </div>
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
            Ninja Van
          </div>
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
            Lalamove
          </div>
          <div className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground">
            CTU Danao Hub
          </div>
        </div>
      </div>
    </section>
  );
};
