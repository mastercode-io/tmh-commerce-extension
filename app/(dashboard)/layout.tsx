import type { ReactNode } from 'react';

import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { MonitoringFooter } from '@/components/subscribe/monitoring-footer';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardHeader userName="Sarah Mitchell" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <MonitoringFooter />
    </div>
  );
}
