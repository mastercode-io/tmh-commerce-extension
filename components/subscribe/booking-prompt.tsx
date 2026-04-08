import Link from 'next/link';
import { CalendarDays, ExternalLink, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function BookingPrompt({
  bookingUrl,
  title = 'A short call is needed before we can price MAD',
  description = 'We need a bit more context to confirm the right risk profile and defence scope before generating a quote.',
}: {
  bookingUrl?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50/70">
      <CardHeader className="border-b border-amber-200/80">
        <CardTitle className="flex items-center gap-2 text-amber-950">
          <CalendarDays className="size-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-amber-900/80">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4 text-sm text-amber-950">
        <p>
          Book a 15-minute call with the TMH team. We will confirm the level of
          monitoring, likely threat profile, and what can be included
          immediately.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="size-4" />
          Prefer to speak now? Call 0800 689 1700
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-3 border-amber-200/80 bg-amber-100/40">
        <div className="text-sm text-amber-900/80">
          The booking flow opens in a new tab so your subscription quote stays intact.
        </div>
        {bookingUrl ? (
          <Button asChild>
            <Link href={bookingUrl} target="_blank" rel="noreferrer">
              Schedule follow-up call
              <ExternalLink />
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
