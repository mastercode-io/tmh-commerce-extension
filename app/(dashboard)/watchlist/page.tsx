'use client';

import * as React from 'react';

import { AddAssetDialog } from '@/components/dashboard/add-asset-dialog';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrademarkTable } from '@/components/trademark/trademark-table';
import { mockWatchlist } from '@/lib/mock-data';
import type { Trademark } from '@/lib/types';

function WatchlistSection({ title, items }: { title: string; items: Trademark[] }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>{title}</span>
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {items.length ? <TrademarkTable items={items} mode="watchlist" /> : <div className="text-sm">No items.</div>}
      </CardContent>
    </Card>
  );
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = React.useState<Trademark[]>(mockWatchlist);
  const [addOpen, setAddOpen] = React.useState(false);

  const actionRequired = watchlist.filter((t) => t.status === 'renewal_due');
  const inProgress = watchlist.filter((t) =>
    ['pending', 'examination', 'published'].includes(t.status)
  );
  const active = watchlist.filter((t) => t.status === 'registered');
  const inactive = watchlist.filter((t) => ['expired', 'refused'].includes(t.status));

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Your Watchlist"
        description="Assets you’re monitoring."
        actions={
          <Button onClick={() => setAddOpen(true)} className="whitespace-nowrap">
            + Watch an Asset
          </Button>
        }
      />

      <div className="grid gap-6">
        <WatchlistSection title="Action Required" items={actionRequired} />
        <WatchlistSection title="In Progress" items={inProgress} />
        <WatchlistSection title="Active & Healthy" items={active} />
        <WatchlistSection title="Inactive" items={inactive} />
      </div>

      <AddAssetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="watchlist"
        onAddTrademark={(t) => setWatchlist((prev) => [t, ...prev])}
      />
    </div>
  );
}

