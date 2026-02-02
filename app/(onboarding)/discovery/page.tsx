'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCompanies, mockTrademarks } from '@/lib/mock-data';

export default function DiscoveryPage() {
  const router = useRouter();
  const [selectedTrademarks, setSelectedTrademarks] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(mockTrademarks.map((t) => [t.id, true]))
  );
  const [selectedCompanies, setSelectedCompanies] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(mockCompanies.map((c) => [c.id, true]))
  );

  const trademarkCount = Object.values(selectedTrademarks).filter(Boolean).length;
  const companyCount = Object.values(selectedCompanies).filter(Boolean).length;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push('/portfolio');
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`We found ${mockTrademarks.length} trademarks and ${mockCompanies.length} companies`}
        description="Select what you want to import into your portfolio."
      />

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between gap-2">
              Trademarks <span className="text-muted-foreground text-sm">({trademarkCount} selected)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {mockTrademarks.map((tm) => (
              <label key={tm.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  checked={selectedTrademarks[tm.id] === true}
                  onChange={(e) =>
                    setSelectedTrademarks((prev) => ({ ...prev, [tm.id]: e.target.checked }))
                  }
                  className="mt-1"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{tm.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {tm.jurisdiction} • {tm.registrationNumber}
                  </div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between gap-2">
              Companies <span className="text-muted-foreground text-sm">({companyCount} selected)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {mockCompanies.map((co) => (
              <label key={co.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                <input
                  type="checkbox"
                  checked={selectedCompanies[co.id] === true}
                  onChange={(e) =>
                    setSelectedCompanies((prev) => ({ ...prev, [co.id]: e.target.checked }))
                  }
                  className="mt-1"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{co.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {co.jurisdiction} • {co.companyNumber}
                  </div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit">Add to My Portfolio</Button>
          <Link href="/welcome" className="text-primary text-sm underline underline-offset-4">
            Add more identifiers
          </Link>
        </div>
      </form>
    </div>
  );
}

