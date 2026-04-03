import type { ReactNode } from 'react';

import { MonitoringFooter } from '@/components/subscribe/monitoring-footer';
import { MonitoringHeader } from '@/components/subscribe/monitoring-header';

export default function SubscribeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted/20 flex h-dvh flex-col overflow-hidden">
      <MonitoringHeader />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      </main>
      <MonitoringFooter />
    </div>
  );
}
