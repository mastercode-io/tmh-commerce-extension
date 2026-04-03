'use client';

import { cn } from '@/lib/utils';

export function BillingToggle({
  value,
  onChange,
  disabled,
}: {
  value: 'monthly' | 'annual';
  onChange: (value: 'monthly' | 'annual') => void;
  disabled?: boolean;
}) {
  return (
    <div className="bg-background inline-flex rounded-xl border p-1">
      {(['monthly', 'annual'] as const).map((option) => {
        const active = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            aria-pressed={active}
          >
            {option === 'monthly' ? 'Monthly' : 'Annual'}
          </button>
        );
      })}
    </div>
  );
}
