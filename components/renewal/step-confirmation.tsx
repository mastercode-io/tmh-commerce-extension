import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Trademark } from '@/lib/types';

export function StepConfirmation({
  reference,
  trademark,
}: {
  reference: string;
  trademark: Trademark;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Renewal submitted</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 pt-4">
        <div className="text-sm">
          We&apos;ll process your renewal and update your portfolio.
        </div>
        <div className="text-muted-foreground text-sm">
          Trademark: {trademark.name} ({trademark.registrationNumber})
        </div>
        <div className="mt-2 text-sm font-medium">Reference: {reference}</div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button asChild>
          <Link href="/portfolio">Back to Portfolio</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

