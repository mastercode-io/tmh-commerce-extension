'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { OnboardingProgress } from '@/components/layouts/onboarding-progress';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const step: 1 | 2 = pathname === '/discovery' ? 2 : 1;

  return (
    <main className="min-h-dvh px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <OnboardingProgress step={step} />
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </div>
    </main>
  );
}

