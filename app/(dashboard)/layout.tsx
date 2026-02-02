import type { ReactNode } from 'react';

import { DashboardHeader } from '@/components/layouts/dashboard-header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <DashboardHeader userName="Sarah Mitchell" />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}

