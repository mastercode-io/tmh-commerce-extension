import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TrademarkStatus } from '@/lib/types';

const statusStyles: Record<TrademarkStatus, string> = {
  registered: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  examination: 'bg-blue-100 text-blue-800',
  published: 'bg-purple-100 text-purple-800',
  renewal_due: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  refused: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<TrademarkStatus, string> = {
  registered: 'Registered',
  pending: 'Pending',
  examination: 'Examination',
  published: 'Published',
  renewal_due: 'Renewal due',
  expired: 'Expired',
  refused: 'Refused',
};

export function TrademarkStatusBadge({
  status,
  className,
}: {
  status: TrademarkStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn('border border-transparent font-medium', statusStyles[status], className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}

