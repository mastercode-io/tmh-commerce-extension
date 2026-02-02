import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-muted/30 flex flex-col items-start gap-2 rounded-xl border border-dashed p-6',
        className
      )}
    >
      <div className="text-sm font-medium">{title}</div>
      {description ? (
        <div className="text-muted-foreground text-sm">{description}</div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

