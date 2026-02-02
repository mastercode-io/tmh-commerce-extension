import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            All your trademarks in one place
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Monitor, manage, and renew your intellectual property with ease.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Create Your Free Portfolio</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>

        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle>What you can do</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary mt-0.5 size-6 shrink-0 rounded-md" />
              <div>
                <div className="font-medium">Discover assets automatically</div>
                <div className="text-muted-foreground">
                  Add your identifiers to find trademarks and companies.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary mt-0.5 size-6 shrink-0 rounded-md" />
              <div>
                <div className="font-medium">Track renewals & deadlines</div>
                <div className="text-muted-foreground">
                  See what needs attention at a glance.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 text-primary mt-0.5 size-6 shrink-0 rounded-md" />
              <div>
                <div className="font-medium">Take action quickly</div>
                <div className="text-muted-foreground">
                  Start renewals or request help in a few steps.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

