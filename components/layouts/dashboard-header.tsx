'use client';

import Link from 'next/link';

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
  return (
    <header className={cn('border-b', className)}>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-col">
          <Link href="/settings/notifications" className="text-sm font-semibold tracking-tight">
            TMH Account
          </Link>
          <span className="text-muted-foreground text-xs">
            Preferences, requests, and subscription support
          </span>
        </div>

        <nav className="text-muted-foreground hidden text-sm sm:flex">
          Customer account
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
            <DropdownMenuItem asChild>
              <Link href="/settings/notifications">
                <SettingsIcon />
                Preferences
              </Link>
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
