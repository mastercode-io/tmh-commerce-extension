'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';

function NavTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active && 'bg-muted text-foreground'
      )}
    >
      {label}
    </Link>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="bg-muted text-foreground grid size-9 place-items-center rounded-full text-xs font-semibold">
      {initials || 'U'}
    </div>
  );
}

export function DashboardHeader({
  userName = 'Sarah',
  className,
}: {
  userName?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const isPortfolio = pathname === '/portfolio' || pathname?.startsWith('/asset/') || pathname?.startsWith('/renew/');
  const isWatchlist = pathname === '/watchlist';

  return (
    <header className={cn('border-b', className)}>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/portfolio" className="text-sm font-semibold tracking-tight">
          Temmy Portal
        </Link>

        <nav className="bg-muted/50 inline-flex items-center gap-1 rounded-lg p-1">
          <NavTab href="/portfolio" label="Portfolio" active={isPortfolio} />
          <NavTab href="/watchlist" label="Watchlist" active={isWatchlist} />
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2" aria-label="User menu">
              <InitialAvatar name={userName} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <UserIcon />
              {userName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

