import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export function MonitoringHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 shrink-0 border-b shadow-[0_6px_12px_rgba(34,52,71,0.05)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/tmh-logo-light.svg"
            alt="The Trademark Helpline"
            width={220}
            height={62}
            className="h-auto w-[170px] sm:w-[200px] lg:w-[220px]"
            priority
          />
        </Link>

        <nav className="flex flex-col gap-2 text-sm font-semibold text-[#223447] sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-5">
          <a
            href="tel:01618335400"
            className="inline-flex items-center gap-2 text-[#223447] hover:text-[#223447]"
          >
            <Phone className="size-4 text-[#E51652]" />
            <span>0161 833 5400</span>
          </a>
          <a
            href="mailto:enquiries@thetrademarkhelpline.com"
            className="inline-flex items-center gap-2 text-[#223447] hover:text-[#223447]"
          >
            <Mail className="size-4 text-[#E51652]" />
            <span>Email us</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
