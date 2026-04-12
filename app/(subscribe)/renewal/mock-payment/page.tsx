import Link from 'next/link';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { canUseMockRenewals } from '@/lib/renewals/config';

export default async function RenewalMockPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!canUseMockRenewals() || !orderId) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="border-b">
          <CardTitle>Hosted payment unavailable</CardTitle>
          <CardDescription>
            The local renewal payment simulator is only available in mock mode and needs a valid order reference.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/renewal">
              <ArrowLeft />
              Back to renewal
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Hosted payment simulator
        </CardTitle>
        <CardDescription>
          This local page stands in for the external hosted payment flow while the live renewal gateway is still mocked.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 text-sm">
        <div className="rounded-xl border p-4">
          Order <span className="font-medium">{orderId}</span> is now in payment
          processing. The mock backend advances this payment automatically.
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Wait a few seconds, then return to the order page to let it finish polling.
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button asChild>
          <Link href={`/orders/${orderId}`}>Return to order</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
