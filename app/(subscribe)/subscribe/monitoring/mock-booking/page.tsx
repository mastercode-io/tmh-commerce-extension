import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Phone,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { canUseMockMonitoringSubscription } from '@/lib/monitoring/config';

const slots = [
  { label: 'Tuesday, 18 March', time: '10:00 AM' },
  { label: 'Tuesday, 18 March', time: '2:30 PM' },
  { label: 'Wednesday, 19 March', time: '11:15 AM' },
];

export default async function MockBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  if (!canUseMockMonitoringSubscription()) {
    notFound();
  }

  const { token } = await searchParams;
  const returnHref = token
    ? `/subscribe/monitoring?token=${encodeURIComponent(token)}`
    : '/subscribe/monitoring';

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="secondary" className="mb-3">
            Local booking simulator
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Schedule your MAD assessment call
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            This page stands in for the external booking experience during local
            development. In production, the booking link opens in a new tab so
            the subscription quote remains intact.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={returnHref}>
            <ArrowLeft />
            Return to subscription
          </Link>
        </Button>
      </div>

      <Card className="ring-primary/15 bg-background ring-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="text-primary size-5" />
            Choose a 15-minute slot
          </CardTitle>
          <CardDescription>
            We use this call to confirm risk profile, enforcement appetite, and
            any active issues affecting your MAD quote.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          {slots.map((slot) => (
            <div
              key={`${slot.label}-${slot.time}`}
              className="bg-muted/50 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            >
              <div>
                <div className="font-medium">{slot.label}</div>
                <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                  <Clock3 className="size-4" />
                  {slot.time}
                </div>
              </div>
              <Button>Reserve slot</Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Phone className="size-4" />
            Prefer to call? 0800 689 1700
          </div>
          <Button variant="ghost" asChild>
            <Link href={returnHref}>
              Continue comparing plans
              <ExternalLink />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
