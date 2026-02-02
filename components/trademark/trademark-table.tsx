import Link from 'next/link';

import { TrademarkStatusBadge } from '@/components/trademark/trademark-status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Trademark } from '@/lib/types';

export function TrademarkTable({
  items,
  mode,
}: {
  items: Trademark[];
  mode: 'portfolio' | 'watchlist';
}) {
  const showOwner = mode === 'watchlist';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Name</TableHead>
          {showOwner ? <TableHead>Owner</TableHead> : null}
          <TableHead>Reg. Number</TableHead>
          <TableHead>Renewal Date</TableHead>
          <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((tm) => (
          <TableRow key={tm.id}>
            <TableCell>
              <TrademarkStatusBadge status={tm.status} />
            </TableCell>
            <TableCell className="font-medium">{tm.name}</TableCell>
            {showOwner ? <TableCell>{tm.ownerName}</TableCell> : null}
            <TableCell className="font-mono text-xs">{tm.registrationNumber}</TableCell>
            <TableCell>{tm.renewalDate ?? '—'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/asset/${tm.id}`}>View</Link>
                </Button>
                {mode === 'portfolio' && tm.status === 'renewal_due' ? (
                  <Button asChild size="sm">
                    <Link href={`/renew/${tm.id}`}>Renew</Link>
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

