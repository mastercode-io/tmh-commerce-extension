import type { ReactNode } from 'react';

import { MonitoringHeader } from '@/components/subscribe/monitoring-header';

export default function SubscribeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted/20 min-h-dvh">
      <MonitoringHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
