import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            TMH customer account for subscriptions and service requests
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Manage subscription onboarding, communication preferences, and trademark support
            requests from one account experience.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle>What this v1 account covers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary mt-0.5 size-6 shrink-0 rounded-md" />
              <div>
                <div className="font-medium">Start subscription journeys</div>
                <div className="text-muted-foreground">
                  Enter subscription flows from TMH-issued links and complete setup through the
                  hosted payment journey.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary mt-0.5 size-6 shrink-0 rounded-md" />
              <div>
                <div className="font-medium">Manage email preferences</div>
                <div className="text-muted-foreground">
                  Control the communications you receive from the TMH team.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary mt-0.5 size-6 shrink-0 rounded-md" />
              <div>
                <div className="font-medium">Submit support and renewal requests</div>
                <div className="text-muted-foreground">
                  Use the account experience as the customer-facing extension of TMH services.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
