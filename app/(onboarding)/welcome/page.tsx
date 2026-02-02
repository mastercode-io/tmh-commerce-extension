'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockUser } from '@/lib/mock-data';

export default function WelcomePage() {
  const router = useRouter();
  const [ipoClientIds, setIpoClientIds] = React.useState<string[]>(['']);
  const [chPersonIds, setChPersonIds] = React.useState<string[]>(['']);
  const [showCh, setShowCh] = React.useState(false);

  function updateList(
    list: string[],
    index: number,
    nextValue: string,
    setter: (next: string[]) => void
  ) {
    const next = list.slice();
    next[index] = nextValue;
    setter(next);
  }

  function addRow(list: string[], setter: (next: string[]) => void) {
    setter([...list, '']);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push('/discovery');
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Welcome, ${mockUser.name.split(' ')[0]}`}
        description="We can automatically find your UK trademarks and companies."
      />

      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-3">
              <div>
                <div className="text-sm font-medium">IPO Client ID</div>
                <div className="text-muted-foreground text-sm">
                  Add one or more IPO Client IDs to discover associated assets.
                </div>
              </div>
              <div className="grid gap-3">
                {ipoClientIds.map((value, index) => (
                  <div key={`ipo-${index}`} className="grid gap-2">
                    <Label className="sr-only" htmlFor={`ipo-${index}`}>
                      IPO Client ID {index + 1}
                    </Label>
                    <Input
                      id={`ipo-${index}`}
                      value={value}
                      onChange={(e) =>
                        updateList(ipoClientIds, index, e.target.value, setIpoClientIds)
                      }
                      placeholder="e.g. IPO-CLIENT-123"
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addRow(ipoClientIds, setIpoClientIds)}>
                  + Add another
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Companies House Person ID</div>
                  <div className="text-muted-foreground text-sm">
                    Optional: used to discover company appointments.
                  </div>
                </div>
                <Button type="button" variant="ghost" onClick={() => setShowCh((v) => !v)}>
                  {showCh ? 'Hide' : 'Add'}
                </Button>
              </div>

              {showCh ? (
                <div className="grid gap-3">
                  {chPersonIds.map((value, index) => (
                    <div key={`ch-${index}`} className="grid gap-2">
                      <Label className="sr-only" htmlFor={`ch-${index}`}>
                        CH Person ID {index + 1}
                      </Label>
                      <Input
                        id={`ch-${index}`}
                        value={value}
                        onChange={(e) =>
                          updateList(chPersonIds, index, e.target.value, setChPersonIds)
                        }
                        placeholder="e.g. CH-PERSON-456"
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => addRow(chPersonIds, setChPersonIds)}>
                    + Add another
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit">Find My Assets</Button>
              <Link href="/portfolio" className="text-primary text-sm underline underline-offset-4">
                Skip and add manually
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

