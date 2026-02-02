import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function OnboardingProgress({
  step,
  className,
}: {
  step: 1 | 2;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex items-center gap-2">
        <Badge variant={step === 1 ? 'default' : 'secondary'}>1</Badge>
        <div className="text-sm font-medium">Identifiers</div>
      </div>
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2">
        <Badge variant={step === 2 ? 'default' : 'secondary'}>2</Badge>
        <div className="text-sm font-medium">Confirm</div>
      </div>
    </div>
  );
}

