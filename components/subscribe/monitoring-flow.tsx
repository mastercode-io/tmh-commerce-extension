'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';

import { BookingPrompt } from '@/components/subscribe/booking-prompt';
import { BillingToggle } from '@/components/subscribe/billing-toggle';
import { PlanCards } from '@/components/subscribe/plan-cards';
import { PlanFeatureTable } from '@/components/subscribe/plan-feature-table';
import { QuoteSummary } from '@/components/subscribe/quote-summary';
import { TrademarkSelectionTable } from '@/components/subscribe/trademark-selection-table';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  BillingFrequency,
  MonitoringClientData,
  MonitoringPlan,
  MonitoringQuoteResponse,
  MonitoringTrademark,
  TrademarkSelection,
} from '@/lib/types/monitoring';

type MonitoringDebugPayload = {
  correlationId?: string;
  operation?: string;
  requestMethod: 'GET' | 'POST';
  requestUrl: string;
  upstreamStatus: number;
  responsePayload: unknown;
  responseBody: unknown;
};

type MonitoringClientResponse = MonitoringClientData & {
  correlationId?: string;
  message?: string;
  debug?: MonitoringDebugPayload;
};

type MonitoringApiResponse = {
  message?: string;
  correlationId?: string;
  debug?: MonitoringDebugPayload;
};

class MonitoringApiResponseError extends Error {
  status: number;
  debug?: MonitoringDebugPayload;
  correlationId?: string;

  constructor(
    message: string,
    status: number,
    debug?: MonitoringDebugPayload,
    correlationId?: string,
  ) {
    super(message);
    this.name = 'MonitoringApiResponseError';
    this.status = status;
    this.debug = debug;
    this.correlationId = correlationId;
  }
}

function buildSelections(
  trademarks: MonitoringTrademark[],
  plan: MonitoringPlan = 'monitoring_essentials',
): Record<string, TrademarkSelection> {
  return Object.fromEntries(
    trademarks.map((trademark) => [
      trademark.id,
      {
        trademarkId: trademark.id,
        selected: true,
        plan,
      },
    ]),
  );
}

function mapErrorMessage(status: number) {
  if (status === 400) {
    return 'Invalid link. Please contact us if you need a fresh subscription link.';
  }

  if (status === 410) {
    return 'This link has expired. Please contact us for a new subscription link.';
  }

  if (status === 404) {
    return 'We could not find any trademarks for this account.';
  }

  return 'We could not open this monitoring link right now. Please try again later or contact us for help.';
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as
    | (T & MonitoringApiResponse)
    | MonitoringApiResponse
    | null;

  if (!response.ok) {
    throw new MonitoringApiResponseError(
      mapErrorMessage(response.status),
      response.status,
      data && 'debug' in data ? data.debug : undefined,
      data && 'correlationId' in data ? data.correlationId : undefined,
    );
  }

  return data as T;
}

function StatusBanner({ checkoutState }: { checkoutState: string | null }) {
  if (!checkoutState) {
    return null;
  }

  const message =
    checkoutState === 'cancelled'
      ? 'The hosted payment flow was cancelled, your selections are still here'
      : checkoutState === 'failed'
        ? 'The hosted payment flow returned an error, please review the summary and try again'
        : null;

  if (!message) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
      {message}
    </div>
  );
}

function formatTrademarkType(type: MonitoringTrademark['type']) {
  if (type === 'word_mark') {
    return 'Word';
  }

  return 'Image';
}

function formatTrademarkStatus(status: MonitoringTrademark['status']) {
  if (status === 'registered') {
    return 'Registered';
  }

  if (status === 'expired') {
    return 'Expired';
  }

  return 'Pending';
}

function formatDate(value?: string) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function MonitoringTrademarkOverview({
  trademarks,
}: {
  trademarks: MonitoringTrademark[];
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Trademark Number</TableHead>
              <TableHead>Word</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Expire Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trademarks.map((trademark) => (
              <TableRow key={trademark.id}>
                <TableCell className="pl-4 font-medium whitespace-nowrap">
                  {trademark.registrationNumber ?? '—'}
                </TableCell>
                <TableCell className="min-w-[180px]">{trademark.name}</TableCell>
                <TableCell>{formatTrademarkType(trademark.type)}</TableCell>
                <TableCell>{formatTrademarkStatus(trademark.status)}</TableCell>
                <TableCell className="pr-4 whitespace-nowrap">
                  {formatDate(trademark.expiryDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {trademarks.map((trademark) => (
          <div
            key={trademark.id}
            className="bg-background rounded-2xl border px-3 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-snug">
                  {trademark.name}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {trademark.registrationNumber ?? 'Registration number pending'}
                </div>
              </div>
              <Badge variant="secondary">
                {formatTrademarkStatus(trademark.status)}
              </Badge>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formatTrademarkType(trademark.type)}</Badge>
                <Badge variant="outline">{trademark.jurisdiction}</Badge>
              </div>
              <div className="text-right text-sm">
                <div className="text-muted-foreground text-xs uppercase">
                  Expires
                </div>
                <div className="mt-1 font-medium whitespace-nowrap">
                  {formatDate(trademark.expiryDate)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function MonitoringFlow({
  initialToken,
  initialCheckoutState,
  showDemoHelpers,
  devMode,
}: {
  initialToken: string | null;
  initialCheckoutState: string | null;
  showDemoHelpers: boolean;
  devMode: boolean;
}) {
  const [token] = React.useState(initialToken);
  const [clientData, setClientData] =
    React.useState<MonitoringClientData | null>(null);
  const [loadState, setLoadState] = React.useState<
    'loading' | 'error' | 'ready'
  >(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    token
      ? null
      : 'Invalid link. Please use a monitoring subscription link that includes a token.',
  );
  const [flowMode, setFlowMode] = React.useState<
    'plan-selection' | 'configuration'
  >('plan-selection');
  const [billingFrequency, setBillingFrequency] =
    React.useState<BillingFrequency>('monthly');
  const [selections, setSelections] = React.useState<
    Record<string, TrademarkSelection>
  >({});
  const [quote, setQuote] = React.useState<MonitoringQuoteResponse | null>(
    null,
  );
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [checkoutPending, setCheckoutPending] = React.useState(false);
  const [bookingPromptVisible, setBookingPromptVisible] = React.useState(false);
  const [busyPlan, setBusyPlan] = React.useState<MonitoringPlan | null>(null);
  const [debugPayload, setDebugPayload] =
    React.useState<MonitoringDebugPayload | null>(null);
  const [correlationId, setCorrelationId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      return;
    }

    const safeToken = token;
    let cancelled = false;

    async function loadClient() {
      try {
        setLoadState('loading');
        setErrorMessage(null);
        const url = `/api/subscribe/monitoring?token=${encodeURIComponent(safeToken)}`;
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = (await response.json().catch(() => null)) as
          | MonitoringClientResponse
          | null;

        if (!response.ok || !payload) {
          throw new MonitoringApiResponseError(
            mapErrorMessage(response.status),
            response.status,
            payload && 'debug' in payload ? payload.debug : undefined,
            payload && 'correlationId' in payload ? payload.correlationId : undefined,
          );
        }

        if (cancelled) {
          return;
        }

        setClientData(payload);
        setSelections(
          buildSelections(
            payload.trademarks,
            payload.preSelectedPlan ?? 'monitoring_essentials',
          ),
        );
        setFlowMode(payload.preSelectedPlan ? 'configuration' : 'plan-selection');
        setDebugPayload(payload.debug ?? null);
        setCorrelationId(payload.correlationId ?? null);
        setLoadState('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadState('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Something went wrong.',
        );
        if (error instanceof MonitoringApiResponseError) {
          setDebugPayload(error.debug ?? null);
          setCorrelationId(error.correlationId ?? null);
        }
      }
    }

    void loadClient();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const selectionList = React.useMemo(
    () =>
      Object.values(selections).sort((a, b) =>
        a.trademarkId.localeCompare(b.trademarkId),
      ),
    [selections],
  );

  React.useEffect(() => {
    if (!token || flowMode !== 'configuration' || selectionList.length === 0) {
      return;
    }

    const safeToken = token;
    let cancelled = false;
    const controller = new AbortController();

    async function refreshQuote() {
      try {
        setQuoteLoading(true);
        setQuoteError(null);
        const data = await requestJson<MonitoringQuoteResponse>(
          '/api/subscribe/monitoring/quote',
          {
            method: 'POST',
            signal: controller.signal,
            body: JSON.stringify({
              token: safeToken,
              billingFrequency,
              selections: selectionList,
            }),
          },
        );

        if (cancelled) {
          return;
        }

        setQuote(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setQuoteError(
          error instanceof Error ? error.message : 'Quote refresh failed.',
        );
        if (error instanceof MonitoringApiResponseError) {
          setDebugPayload(error.debug ?? null);
          setCorrelationId(error.correlationId ?? null);
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    }

    void refreshQuote();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [billingFrequency, flowMode, selectionList, token]);

  const handlePlanSelect = React.useCallback(
    (plan: MonitoringPlan) => {
      if (!clientData) {
        return;
      }

      setBusyPlan(plan);
      const nextSelections = buildSelections(clientData.trademarks, plan);

      setSelections(nextSelections);

      const noRiskProfiles = clientData.trademarks.every(
        (trademark) => !trademark.riskProfile,
      );
      setBookingPromptVisible(plan === 'monitoring_defence' && noRiskProfiles);

      if (plan === 'monitoring_defence' && noRiskProfiles) {
        setFlowMode('plan-selection');
        setBusyPlan(null);
        return;
      }

      setFlowMode('configuration');
      window.setTimeout(() => setBusyPlan(null), 150);
    },
    [clientData],
  );

  const updateSelection = React.useCallback(
    (trademarkId: string, update: Partial<TrademarkSelection>) => {
      setSelections((current) => ({
        ...current,
        [trademarkId]: {
          ...current[trademarkId],
          trademarkId,
          ...update,
        },
      }));
    },
    [],
  );

  const handleCheckout = React.useCallback(async () => {
    if (!token) {
      return;
    }

    const safeToken = token;
    try {
      setCheckoutPending(true);
      const data = await requestJson<{ redirectUrl: string }>(
        '/api/subscribe/monitoring/checkout',
        {
          method: 'POST',
          body: JSON.stringify({
            token: safeToken,
            billingFrequency,
            selections: selectionList,
          }),
        },
      );

      window.location.assign(data.redirectUrl);
    } catch (error) {
      setQuoteError(
        error instanceof Error
          ? error.message
          : 'Checkout could not be created.',
      );
      if (error instanceof MonitoringApiResponseError) {
        setDebugPayload(error.debug ?? null);
        setCorrelationId(error.correlationId ?? null);
      }
      setCheckoutPending(false);
    }
  }, [billingFrequency, selectionList, token]);

  const greeting = clientData
    ? `Hi ${clientData.clientName}${clientData.companyName ? ` - ${clientData.companyName}` : ''}`
    : null;

  if (loadState === 'loading') {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader className="border-b">
            <Badge variant="secondary" className="mb-3">
              Loading monitoring link
            </Badge>
            <CardTitle>Preparing your subscription options</CardTitle>
            <CardDescription>
              Fetching client context and trademark records for this subscription link
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadState === 'error' || !clientData) {
    return (
      <div className="grid gap-6">
        <Card className="mx-auto max-w-3xl">
          <CardHeader className="border-b">
            <Badge variant="secondary" className="mb-3 w-fit">
              Subscription link issue
            </Badge>
            <CardTitle>We couldn&apos;t open this monitoring link</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          {showDemoHelpers ? (
            <CardContent className="grid gap-4 pt-4">
              <div className="bg-muted/40 rounded-xl border p-4 text-sm">
                Local demo mode is available, so you can open the sample client
                journey using the demo token.
              </div>
            </CardContent>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
            <div className="text-muted-foreground text-sm">
              Need help? 0800 689 1700
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="mailto:care@thetrademarkhelpline.com">Contact us</a>
              </Button>
              {showDemoHelpers ? (
                <Button asChild>
                  <Link href="/subscribe/monitoring?token=demo-monitoring-001">
                    Open demo link
                    <ArrowRight />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </Card>

        {devMode && debugPayload ? (
          <Card className="mx-auto max-w-3xl overflow-hidden border-slate-300">
            <CardContent className="pt-4">
              <details className="group">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                  Custom API Debug
                </summary>
                <div className="text-muted-foreground mt-3 text-xs">
                  {debugPayload.requestMethod} {debugPayload.requestUrl}
                  <span className="ml-3 font-medium text-slate-700">
                    Status {debugPayload.upstreamStatus}
                  </span>
                  {debugPayload.correlationId ?? correlationId ? (
                    <span className="ml-3 font-medium text-slate-700">
                      Correlation {debugPayload.correlationId ?? correlationId}
                    </span>
                  ) : null}
                </div>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-800">
                  {JSON.stringify(debugPayload.responsePayload, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <StatusBanner checkoutState={initialCheckoutState} />

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="text-muted-foreground mb-3 text-sm font-semibold tracking-tight">
                Subscriptions <span className="mx-1">→</span>{' '}
                <span className="text-foreground">Monitoring</span>
              </div>
              <CardTitle className="text-3xl tracking-tight">
                {greeting}
              </CardTitle>
              <CardDescription className="mt-3 max-w-2xl text-sm">
                Protect your trademarks with ongoing monitoring, review, and
                defense support
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {flowMode === 'plan-selection' ? (
          <CardContent
            id="monitoring-trademarks"
            className="scroll-mt-24 grid gap-4 pt-4"
          >
            <div className="grid gap-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
                {clientData.trademarks.length} trademark
                {clientData.trademarks.length === 1 ? '' : 's'} require a
                monitoring subscription
              </div>
              <MonitoringTrademarkOverview trademarks={clientData.trademarks} />
            </div>
          </CardContent>
        ) : null}
      </Card>

      {flowMode === 'plan-selection' ? (
        <div className="grid gap-6">
          <div className="hidden justify-end md:flex">
            <BillingToggle
              value={billingFrequency}
              onChange={setBillingFrequency}
            />
          </div>
          <div id="monitoring-plans" className="scroll-mt-24">
            <PlanCards
              billingFrequency={billingFrequency}
              onBillingFrequencyChange={setBillingFrequency}
              onSelectPlan={handlePlanSelect}
              busyPlan={busyPlan}
            />
          </div>
          <div id="monitoring-compare" className="scroll-mt-24 grid gap-6">
            {bookingPromptVisible ? (
              <BookingPrompt bookingUrl={clientData.bookingUrl} />
            ) : null}
            <PlanFeatureTable
              onSelectPlan={handlePlanSelect}
              busyPlan={busyPlan}
            />
          </div>
        </div>
      ) : null}

      {flowMode === 'configuration' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="text-primary size-5" />
                      Configure your subscription
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Choose plans per trademark and switch between monthly and
                      annual billing
                    </CardDescription>
                  </div>
                  <BillingToggle
                    value={billingFrequency}
                    onChange={setBillingFrequency}
                    disabled={quoteLoading}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <TrademarkSelectionTable
                  trademarks={clientData.trademarks}
                  selections={selections}
                  lineItems={quote?.lineItems ?? []}
                  billingFrequency={billingFrequency}
                  bookingUrl={clientData.bookingUrl}
                  quoteLoading={quoteLoading}
                  onToggleTrademark={(trademarkId, selected) =>
                    updateSelection(trademarkId, { selected })
                  }
                  onToggleAll={(selected) =>
                    setSelections((current) =>
                      Object.fromEntries(
                        Object.entries(current).map(([key, value]) => [
                          key,
                          { ...value, selected },
                        ]),
                      ),
                    )
                  }
                  onPlanChange={(trademarkId, plan) =>
                    updateSelection(trademarkId, { plan })
                  }
                />

                {!Object.values(selections).some(
                  (selection) => selection.selected,
                ) ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
                    <div className="flex items-center gap-2 font-medium">
                      <BadgeAlert className="size-4" />
                      Please select at least one trademark to continue
                    </div>
                  </div>
                ) : null}

                {quoteLoading ? (
                  <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    Refreshing quote based on current selections
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {quote && quote.lineItems.some((item) => item.requiresQuote) ? (
              <BookingPrompt
                bookingUrl={clientData.bookingUrl}
                title="Some MAD selections still need a short review call"
                description="You can continue to payment for the quotable items now, the remaining MAD items will stay listed for follow-up on the confirmation page"
              />
            ) : null}
          </div>

          <QuoteSummary
            quote={quote}
            selections={selections}
            billingFrequency={billingFrequency}
            bookingUrl={clientData.bookingUrl}
            quoteLoading={quoteLoading}
            checkoutPending={checkoutPending}
            quoteError={quoteError}
            onCheckout={() => void handleCheckout()}
          />
        </div>
      ) : null}

      {showDemoHelpers ? (
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Demo tokens: demo-monitoring-001, demo-monitoring-expired,
            demo-monitoring-empty, demo-monitoring-error
          </div>
        </div>
      ) : null}

      {devMode && debugPayload ? (
        <Card className="overflow-hidden border-slate-300">
          <CardContent className="pt-4">
            <details className="group">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                Custom API Debug
              </summary>
              <div className="text-muted-foreground mt-3 text-xs">
                {debugPayload.requestMethod} {debugPayload.requestUrl}
                <span className="ml-3 font-medium text-slate-700">
                  Status {debugPayload.upstreamStatus}
                </span>
                {debugPayload.correlationId ?? correlationId ? (
                  <span className="ml-3 font-medium text-slate-700">
                    Correlation {debugPayload.correlationId ?? correlationId}
                  </span>
                ) : null}
              </div>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-800">
                {JSON.stringify(debugPayload.responsePayload, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
