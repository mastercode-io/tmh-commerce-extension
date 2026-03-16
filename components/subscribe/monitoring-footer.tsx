import Image from 'next/image';
import { MapPin } from 'lucide-react';

export function MonitoringFooter() {
  return (
    <footer className="bg-[#223447] text-slate-200">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-2">
          <Image
            src="/images/tmh-logo-dark.svg"
            alt="The Trademark Helpline"
            width={160}
            height={44}
            className="h-auto w-[160px]"
            priority
          />
          <p className="text-xs text-slate-400">
            © 2025, The Trademark Helpline. All Rights Reserved.
          </p>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-400">
          <MapPin className="mt-0.5 size-4 shrink-0 text-[#E51652]" />
          <div className="grid gap-0.5">
            <p>Craven Business Centre, 4-5 Craven Court,</p>
            <p>Craven Road, Altrincham, Greater Manchester,</p>
            <p>WA14 5DY, UK</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
