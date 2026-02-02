import type { Metadata } from 'next';
import type * as React from 'react';

import './globals.css';

const fontVars: Record<string, string> = {
  '--font-sans':
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, "Noto Sans", "Liberation Sans", sans-serif',
  '--font-geist-mono':
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const metadata: Metadata = {
  title: 'Temmy Portal',
  description: 'Client-facing trademark management portal (POC)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={fontVars as React.CSSProperties}>
      <body className="min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
