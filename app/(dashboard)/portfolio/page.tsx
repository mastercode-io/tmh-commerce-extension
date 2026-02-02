'use client';

import * as React from 'react';

import { AddAssetDialog } from '@/components/dashboard/add-asset-dialog';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanyTable } from '@/components/company/company-table';
import { TrademarkTable } from '@/components/trademark/trademark-table';
import { mockCompanies, mockTrademarks } from '@/lib/mock-data';
import type { Company, Trademark } from '@/lib/types';

function TrademarkSection({
  title,
  description,
  items,
  highlight,
}: {
  title: string;
  description?: string;
  items: Trademark[];
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'ring-primary/20 ring-2' : undefined}>
      <CardHeader className="border-b">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>{title}</span>
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
        {description ? (
          <div className="text-muted-foreground text-sm">{description}</div>
        ) : null}
      </CardHeader>
      <CardContent className="pt-4">
        {items.length ? <TrademarkTable items={items} mode="portfolio" /> : <div className="text-sm">No items.</div>}
      </CardContent>
    </Card>
  );
}

export default function PortfolioPage() {
  const [trademarks, setTrademarks] = React.useState<Trademark[]>(mockTrademarks);
  const [companies, setCompanies] = React.useState<Company[]>(mockCompanies);
  const [addOpen, setAddOpen] = React.useState(false);

  const actionRequired = trademarks.filter((t) => t.status === 'renewal_due');
  const inProgress = trademarks.filter((t) =>
    ['pending', 'examination', 'published'].includes(t.status)
  );
  const active = trademarks.filter((t) => t.status === 'registered');
  const inactive = trademarks.filter((t) => ['expired', 'refused'].includes(t.status));

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Welcome back, Sarah"
        description="Here’s an overview of your intellectual property."
        actions={
          <Button onClick={() => setAddOpen(true)} className="whitespace-nowrap">
            + Add Asset
          </Button>
        }
      />

      {actionRequired.length ? (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <div className="text-sm font-medium">Action required</div>
                <div className="text-muted-foreground text-sm">
                  {actionRequired.length} trademark{actionRequired.length === 1 ? '' : 's'} require renewal.
                </div>
              </div>
              <Button variant="outline" onClick={() => setAddOpen(true)}>
                Add another asset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6">
        <TrademarkSection
          title="Action Required"
          description="Renewals due and deadlines that need attention."
          items={actionRequired}
          highlight
        />
        <TrademarkSection title="In Progress" items={inProgress} />
        <TrademarkSection title="Active & Healthy" items={active} />
        <TrademarkSection title="Inactive" items={inactive} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between gap-2">
            Your Companies <Badge variant="secondary">{companies.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {companies.length ? <CompanyTable items={companies} /> : <div className="text-sm">No companies.</div>}
        </CardContent>
      </Card>

      <AddAssetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="portfolio"
        onAddTrademark={(t) => setTrademarks((prev) => [t, ...prev])}
        onAddCompany={(c) => setCompanies((prev) => [c, ...prev])}
      />
    </div>
  );
}

