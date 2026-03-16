import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MonitoringHeader() {
  return (
    <header className="bg-background/95 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              Temmy Portal
            </div>
            <div className="text-muted-foreground text-xs">
              Monitoring subscriptions
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-medium tracking-[0.16em] text-neutral-500 uppercase">
              Need help?
            </div>
            <div className="text-sm font-medium">0800 689 1700</div>
          </div>
          <Button variant="outline" asChild>
            <a href="tel:08006891700">Call us</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
