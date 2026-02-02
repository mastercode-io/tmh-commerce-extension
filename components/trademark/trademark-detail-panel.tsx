import Link from 'next/link';

import { TrademarkStatusBadge } from '@/components/trademark/trademark-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Trademark } from '@/lib/types';

export function TrademarkDetailPanel({ trademark }: { trademark: Trademark }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span className="truncate">{trademark.name}</span>
              <TrademarkStatusBadge status={trademark.status} />
            </CardTitle>
            <div className="text-muted-foreground mt-1 text-sm">
              {trademark.jurisdiction} • {trademark.registrationNumber}
            </div>
          </div>
          {trademark.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trademark.imageUrl}
              alt={`${trademark.name} logo`}
              className="bg-muted size-12 rounded-lg object-cover"
            />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground text-xs">Filing Date</div>
            <div className="text-sm font-medium">{trademark.filingDate}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Registration Date</div>
            <div className="text-sm font-medium">{trademark.registrationDate ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Renewal Date</div>
            <div className="text-sm font-medium">{trademark.renewalDate ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Owner</div>
            <div className="text-sm font-medium">{trademark.ownerName}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-muted-foreground text-xs">Classes</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {trademark.classes.length ? (
                trademark.classes.map((niceClass) => (
                  <Badge key={niceClass} variant="outline">
                    Class {niceClass}
                  </Badge>
                ))
              ) : (
                <div className="text-sm">—</div>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Separator className="my-2" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-muted-foreground text-xs">Representative</div>
                <div className="text-sm font-medium">
                  {trademark.representative ?? '—'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Registry Link</div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" asChild>
          <Link href="/portfolio">Back to Portfolio</Link>
        </Button>
        {trademark.status === 'renewal_due' ? (
          <Button asChild>
            <Link href={`/renew/${trademark.id}`}>Renew Now</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

