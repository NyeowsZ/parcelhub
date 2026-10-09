import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ParcelHub Staff Counter Terminal | CTU Danao Campus',
  description:
    'Staff Desk Portal for Zero-Credit Escrow, Envelope Ledgering, and Gemini AI Visual Ingestion at CTU Danao Campus.',
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
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] text-[#0F172A] min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
