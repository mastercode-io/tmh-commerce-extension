import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export function ActionButton({
  children,
  icon,
  ...props
}: {
  children: ReactNode;
  icon?: ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button {...props}>
      {icon}
      {children}
    </Button>
  );
}

