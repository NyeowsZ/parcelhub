import type { Metadata } from 'next';
import './globals.css';
import { TerminalAppShell } from '@/components/TerminalAppShell';

export const metadata: Metadata = {
  title: 'ParcelHub Studio Desk | CTU Danao Campus Node',
  description:
    'Functional Counter Terminal for Zero-Credit Campus Escrow, Envelope Ledgering, and Gemini AI Vision Intake.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased selection:bg-primary selection:text-primary-foreground">
        <TerminalAppShell>{children}</TerminalAppShell>
      </body>
    </html>
  );
}
