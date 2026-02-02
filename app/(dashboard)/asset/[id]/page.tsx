import Link from 'next/link';

import { PageHeader } from '@/components/common/page-header';
import { TrademarkDetailPanel } from '@/components/trademark/trademark-detail-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { findAssetById } from '@/lib/mock-data';

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = findAssetById(id);

  if (!asset) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Asset not found</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm">We couldn&apos;t find this asset in the mock data.</div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button asChild>
            <Link href="/portfolio">Back to Portfolio</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (asset.kind === 'trademark') {
    return (
      <div className="grid gap-6">
        <PageHeader title="Asset detail" description="Trademark details" />
        <TrademarkDetailPanel trademark={asset.data} />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader title="Asset detail" description="Company details" />
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{asset.data.name}</CardTitle>
          <div className="text-muted-foreground text-sm">
            {asset.data.jurisdiction} • {asset.data.companyNumber}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 text-sm">
          <div className="grid gap-1">
            <div className="text-muted-foreground text-xs">Status</div>
            <div className="font-medium">{asset.data.status}</div>
          </div>
          <div className="grid gap-1">
            <div className="text-muted-foreground text-xs">Incorporation date</div>
            <div className="font-medium">{asset.data.incorporationDate}</div>
          </div>
          <div className="grid gap-1">
            <div className="text-muted-foreground text-xs">Registered address</div>
            <div className="font-medium">{asset.data.registeredAddress ?? '—'}</div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" asChild>
            <Link href="/portfolio">Back to Portfolio</Link>
          </Button>
          <Button variant="outline" disabled>
            View on Registry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
