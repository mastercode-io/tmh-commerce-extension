import { cn } from '@/lib/utils';

export function LoadingSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="bg-muted h-4 w-full animate-pulse rounded-md"
        />
      ))}
    </div>
  );
}
