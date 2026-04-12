'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2, PhoneCall } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestRenewalJson, RenewalApiResponseError } from '@/lib/renewals/client';
import type {
  CreateRenewalOrderResponse,
  RenewalDetailsResponse,
} from '@/features/renewals/lib/types';

type RenewalDetailsApiResponse = RenewalDetailsResponse & {
  correlationId: string;
};

type CreateRenewalOrderApiResponse = CreateRenewalOrderResponse & {
  correlationId: string;
};

type ContactDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function RenewalFlow({
  initialToken,
  showDemoHelpers,
}: {
  initialToken: string | null;
  showDemoHelpers: boolean;
}) {
  const router = useRouter();
  const [isNavigating, startNavigation] = React.useTransition();
  const [details, setDetails] = React.useState<RenewalDetailsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedTrademarkIds, setSelectedTrademarkIds] = React.useState<string[]>([]);
  const [ownershipChange, setOwnershipChange] = React.useState(false);
  const [classesChange, setClassesChange] = React.useState(false);
  const [authorisedToRenew, setAuthorisedToRenew] = React.useState(false);
  const [contactConsent, setContactConsent] = React.useState(false);
  const [contact, setContact] = React.useState<ContactDraft>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  React.useEffect(() => {
    if (!initialToken) {
      setLoading(false);
      setError('A renewal link token is required.');
      return;
    }

    const token = initialToken;
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setError(null);

      try {
        const response = await requestRenewalJson<RenewalDetailsApiResponse>(
          `/api/renewals/details?token=${encodeURIComponent(token)}`,
        );

        if (cancelled) {
          return;
        }

        setDetails(response);
        setSelectedTrademarkIds([
          response.primaryTrademark.id,
          ...response.additionalRenewals.map((trademark) => trademark.id),
        ]);
        setContact({
          firstName: response.contact.firstName,
          lastName: response.contact.lastName,
          email: response.contact.email,
          phone: response.contact.mobile ?? response.contact.phone ?? '',
        });
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof RenewalApiResponseError
            ? requestError.message
            : 'We could not load this renewal right now.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [initialToken]);

  const selfServeBlocked = ownershipChange || classesChange;

  function updateContact<K extends keyof ContactDraft>(
    key: K,
    value: ContactDraft[K],
  ) {
    setContact((current) => ({ ...current, [key]: value }));
  }

  function toggleTrademarkSelection(trademarkId: string, checked: boolean) {
    if (!details) {
      return;
    }

    if (trademarkId === details.primaryTrademark.id) {
      return;
    }

    setSelectedTrademarkIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, trademarkId]));
      }

      return current.filter((item) => item !== trademarkId);
    });
  }

  async function handleCreateOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!details || selfServeBlocked) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await requestRenewalJson<CreateRenewalOrderApiResponse>(
        '/api/renewals/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            token: details.token,
            source: 'renewal-landing',
            contact,
            screening: {
              ownershipChange,
              classesChange,
            },
            selection: {
              primaryTrademarkId: details.primaryTrademark.id,
              selectedTrademarkIds,
            },
            consents: {
              authorisedToRenew,
              contactConsent,
            },
          }),
        },
      );

      startNavigation(() => {
        router.push(`/orders/${response.order.orderId}`);
      });
    } catch (requestError) {
      setError(
        requestError instanceof RenewalApiResponseError
          ? requestError.message
          : 'We could not create this renewal order right now.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading renewal</CardTitle>
          <CardDescription>
            We&apos;re checking the renewal link and loading the available trademarks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={6} />
        </CardContent>
      </Card>
    );
  }

  if (!details) {
    return (
      <EmptyState
        title="Renewal unavailable"
        description={error ?? 'This renewal link could not be loaded.'}
        action={
          showDemoHelpers ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/renewal?token=tok_123">Open demo organisation flow</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/renewal?token=tok_010">Open demo individual flow</Link>
              </Button>
            </div>
          ) : undefined
        }
      />
    );
  }

  const allTrademarks = [details.primaryTrademark, ...details.additionalRenewals];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-3">
              Renewal
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              Review your renewal details
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
              Confirm the trademarks to renew, update the contact details if needed,
              and continue to the order review.
            </p>
          </div>
          {showDemoHelpers ? (
            <div className="bg-muted/40 rounded-xl border px-3 py-2 text-xs">
              Demo tokens: <code>tok_123</code> and <code>tok_010</code>
            </div>
          ) : null}
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Account</CardTitle>
            <CardDescription>
              {details.account.name} • {details.account.type}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                Address
              </div>
              <div className="mt-2 text-sm">
                {details.account.address.line1}
                {details.account.address.line2 ? `, ${details.account.address.line2}` : ''}
                <br />
                {details.account.address.city}, {details.account.address.postcode}
                <br />
                {details.account.address.country}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                Reference details
              </div>
              <div className="mt-2 grid gap-1 text-sm">
                {details.account.companyNumber ? (
                  <div>Company number: {details.account.companyNumber}</div>
                ) : null}
                {details.account.vatNumber ? (
                  <div>VAT number: {details.account.vatNumber}</div>
                ) : null}
                <div>Contact email: {details.contact.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form className="grid gap-6" onSubmit={handleCreateOrder}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Renewal screening</CardTitle>
              <CardDescription>
                Self-serve renewal is only available when the ownership and class
                details are unchanged.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <label className="flex items-start gap-3 rounded-xl border p-4">
                <input
                  type="checkbox"
                  checked={ownershipChange}
                  onChange={(event) => setOwnershipChange(event.target.checked)}
                  className="mt-1"
                />
                <div className="grid gap-1">
                  <div className="text-sm font-medium">
                    The ownership details have changed
                  </div>
                  <div className="text-muted-foreground text-sm">
                    This includes changes to the proprietor or legal entity.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border p-4">
                <input
                  type="checkbox"
                  checked={classesChange}
                  onChange={(event) => setClassesChange(event.target.checked)}
                  className="mt-1"
                />
                <div className="grid gap-1">
                  <div className="text-sm font-medium">
                    The goods, services, or classes need updating
                  </div>
                  <div className="text-muted-foreground text-sm">
                    If the scope changed, a specialist needs to review the renewal first.
                  </div>
                </div>
              </label>

              {selfServeBlocked ? (
                <EmptyState
                  title="Specialist review required"
                  description="This renewal should be handled with a TMH adviser before payment. Use the booking link below to continue."
                  action={
                    <Button asChild>
                      <Link href={details.links?.bookCall ?? '/support'}>
                        <PhoneCall />
                        Book a call
                      </Link>
                    </Button>
                  }
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Select trademarks</CardTitle>
              <CardDescription>
                The primary trademark stays included. Add any other renewals you want to submit now.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4">
              {allTrademarks.map((trademark, index) => {
                const isPrimary = index === 0;
                const isSelected = selectedTrademarkIds.includes(trademark.id);

                return (
                  <label
                    key={trademark.id}
                    className="flex items-start gap-3 rounded-xl border p-4"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isPrimary}
                      onChange={(event) =>
                        toggleTrademarkSelection(trademark.id, event.target.checked)
                      }
                      className="mt-1"
                    />
                    <div className="grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium">{trademark.wordMark}</div>
                        {isPrimary ? <Badge variant="outline">Primary</Badge> : null}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {trademark.registrationNumber ?? trademark.applicationNumber} •{' '}
                        {trademark.markType} • Renewal due {formatDate(trademark.nextRenewalDate)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Contact details</CardTitle>
              <CardDescription>
                We&apos;ll use this contact information for the renewal order and any follow-up questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="renewal-first-name">First name</Label>
                <Input
                  id="renewal-first-name"
                  value={contact.firstName}
                  onChange={(event) => updateContact('firstName', event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renewal-last-name">Last name</Label>
                <Input
                  id="renewal-last-name"
                  value={contact.lastName}
                  onChange={(event) => updateContact('lastName', event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renewal-email">Email</Label>
                <Input
                  id="renewal-email"
                  type="email"
                  value={contact.email}
                  onChange={(event) => updateContact('email', event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="renewal-phone">Phone</Label>
                <Input
                  id="renewal-phone"
                  value={contact.phone}
                  onChange={(event) => updateContact('phone', event.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Consents</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <label className="flex items-start gap-3 rounded-xl border p-4">
                <input
                  type="checkbox"
                  checked={authorisedToRenew}
                  onChange={(event) => setAuthorisedToRenew(event.target.checked)}
                  className="mt-1"
                />
                <div className="grid gap-1">
                  <div className="text-sm font-medium">
                    I confirm I am authorised to renew these trademarks
                  </div>
                  <div className="text-muted-foreground text-sm">
                    This consent is required before the renewal order can be created.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border p-4">
                <input
                  type="checkbox"
                  checked={contactConsent}
                  onChange={(event) => setContactConsent(event.target.checked)}
                  className="mt-1"
                />
                <div className="grid gap-1">
                  <div className="text-sm font-medium">
                    I consent to being contacted about this renewal
                  </div>
                  <div className="text-muted-foreground text-sm">
                    TMH may contact you if a specialist review or follow-up is needed.
                  </div>
                </div>
              </label>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-muted-foreground text-sm">
                {selectedTrademarkIds.length} {selectedTrademarkIds.length === 1 ? 'trademark' : 'trademarks'} selected
              </div>
              <Button
                type="submit"
                disabled={
                  submitting ||
                  isNavigating ||
                  selfServeBlocked ||
                  !authorisedToRenew ||
                  !contactConsent ||
                  selectedTrademarkIds.length < 1
                }
              >
                {submitting || isNavigating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating order
                  </>
                ) : (
                  <>
                    Continue to order
                    <ArrowRight />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

        {error ? (
          <EmptyState
            title="Renewal could not continue"
            description={error}
          />
        ) : null}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Primary renewal</CardTitle>
            <CardDescription>
              Included by default in the order you are about to create.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            <div className="text-lg font-semibold">{details.primaryTrademark.wordMark}</div>
            <div className="text-muted-foreground text-sm">
              {details.primaryTrademark.registrationNumber ??
                details.primaryTrademark.applicationNumber}
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span>{details.primaryTrademark.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Renewal date</span>
                <span>{formatDate(details.primaryTrademark.nextRenewalDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Classes</span>
                <span>{details.primaryTrademark.classesCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5" />
              What happens next
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>1. We create a renewal order with the selected trademarks.</div>
            <div>2. You review the totals and accept the terms.</div>
            <div>3. The hosted payment step starts and the order moves to confirmation.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
