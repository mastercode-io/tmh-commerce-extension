import {
  assertMonitoringSubscriptionIntegration,
  canUseMockMonitoringSubscription,
} from '@/lib/monitoring/config';
import { MonitoringServiceError } from '@/lib/monitoring/errors';
import { calculateMonitoringQuote } from '@/lib/monitoring/pricing';
import { buildMonitoringCheckoutIntentPayload } from '@/lib/monitoring/pricing';
import {
  createMonitoringError,
  getMockMonitoringClientData,
  resolveMonitoringScenario,
  simulateMockLatency,
} from '@/lib/monitoring/mock-data';
import {
  parseMockCheckoutSession,
  serializeMockCheckoutSession,
} from '@/lib/monitoring/session';
import type {
  MockCheckoutSession,
  MonitoringCheckoutRequest,
  MonitoringCheckoutResponse,
  MonitoringClientData,
  MonitoringConfirmationResponse,
  MonitoringQuoteRequest,
  MonitoringQuoteResponse,
} from '@/lib/types/monitoring';
import {
  confirmMonitoringSubscriptionCheckout,
  createMonitoringSubscriptionCheckoutIntent,
  isMonitoringSubscriptionCustomApiConfigured,
  resolveMonitoringSubscriptionToken,
  type ZohoMonitoringSubscriptionDebug,
  ZohoMonitoringSubscriptionError,
} from '@/lib/zoho/subscriptions';

function assertScenarioToken(
  token: string | null,
  correlationId: string,
) {
  const scenario = resolveMonitoringScenario(token);

  if (!scenario.ok) {
    throw new MonitoringServiceError(
      scenario.error,
      scenario.status,
      correlationId,
    );
  }

  return scenario.token;
}

function assertTokenValue(token: string | null, correlationId: string) {
  if (!token?.trim()) {
    throw new MonitoringServiceError(
      createMonitoringError(
        'invalid_token',
        'Invalid link. Please contact us for a fresh monitoring invitation.',
      ),
      400,
      correlationId,
    );
  }

  return token.trim();
}

function mapZohoErrorToMonitoringError(
  error: ZohoMonitoringSubscriptionError,
  correlationId: string,
) {
  return new MonitoringServiceError(
    createMonitoringError(
      error.appCode ??
        (error.code === 'config_error' ? 'config_error' : 'upstream_error'),
      error.message,
    ),
    error.status,
    correlationId,
    error.debug,
  );
}

function createReference(token: string) {
  const compact = token
    .replace(/[^a-z0-9]/gi, '')
    .slice(-6)
    .toUpperCase()
    .padStart(6, '0');
  return `TMH-MON-${compact}`;
}

function assertQuoteRequest(
  body: Partial<MonitoringQuoteRequest>,
  correlationId: string,
) {
  if (!body.billingFrequency || !body.selections) {
    throw new MonitoringServiceError(
      createMonitoringError(
        'invalid_request',
        'Token, billing frequency, and selections are required.',
      ),
      400,
      correlationId,
    );
  }

  return {
    billingFrequency: body.billingFrequency,
    selections: body.selections,
  };
}

function assertCheckoutRequest(
  body: Partial<MonitoringCheckoutRequest>,
  correlationId: string,
) {
  if (!body.billingFrequency || !body.selections) {
    throw new MonitoringServiceError(
      createMonitoringError(
        'invalid_request',
        'Token, billing frequency, and selections are required.',
      ),
      400,
      correlationId,
    );
  }

  return {
    billingFrequency: body.billingFrequency,
    selections: body.selections,
  };
}

function buildConfirmationResponse(
  session: MockCheckoutSession,
): MonitoringConfirmationResponse {
  return {
    clientName: session.clientName,
    companyName: session.companyName,
    helpPhoneNumber: session.helpPhoneNumber,
    helpEmail: session.helpEmail,
    bookingUrl: session.bookingUrl,
    billingFrequency: session.billingFrequency,
    firstPaymentDate: session.firstPaymentDate,
    reference: session.reference,
    paidItems: session.quote.payableNowLineItems,
    followUpItems: session.quote.followUpLineItems,
    summary: session.quote.summary,
  };
}

async function resolveMonitoringSubscriptionContext(args: {
  token: string;
  origin: string;
  correlationId: string;
}) {
  try {
    return await resolveMonitoringSubscriptionToken(args);
  } catch (error) {
    if (error instanceof ZohoMonitoringSubscriptionError) {
      throw mapZohoErrorToMonitoringError(error, args.correlationId);
    }

    throw error;
  }
}

export async function getMonitoringSubscriptionContextWithDebug(args: {
  token: string | null;
  origin: string;
  correlationId: string;
}): Promise<{
  data: MonitoringClientData;
  debug?: ZohoMonitoringSubscriptionDebug;
}> {
  assertMonitoringSubscriptionIntegration(args.correlationId);

  if (isMonitoringSubscriptionCustomApiConfigured()) {
    return resolveMonitoringSubscriptionContext({
      token: assertTokenValue(args.token, args.correlationId),
      origin: args.origin,
      correlationId: args.correlationId,
    });
  }

  if (!canUseMockMonitoringSubscription()) {
    assertMonitoringSubscriptionIntegration(args.correlationId);
  }

  const token = assertScenarioToken(args.token, args.correlationId);
  await simulateMockLatency();

  return {
    data: getMockMonitoringClientData(args.origin, token),
  };
}

export async function getMonitoringSubscriptionContext(args: {
  token: string | null;
  origin: string;
  correlationId: string;
}): Promise<MonitoringClientData> {
  const result = await getMonitoringSubscriptionContextWithDebug(args);
  return result.data;
}

export async function getMonitoringQuote(args: {
  body: Partial<MonitoringQuoteRequest>;
  origin: string;
  correlationId: string;
}): Promise<MonitoringQuoteResponse> {
  assertMonitoringSubscriptionIntegration(args.correlationId);

  const token = isMonitoringSubscriptionCustomApiConfigured()
    ? assertTokenValue(args.body.token ?? null, args.correlationId)
    : assertScenarioToken(args.body.token ?? null, args.correlationId);
  const request = assertQuoteRequest(args.body, args.correlationId);

  const clientData = isMonitoringSubscriptionCustomApiConfigured()
    ? (
        await resolveMonitoringSubscriptionContext({
          token,
          origin: args.origin,
          correlationId: args.correlationId,
        })
      ).data
    : getMockMonitoringClientData(args.origin, token);

  if (!isMonitoringSubscriptionCustomApiConfigured()) {
    await simulateMockLatency();
  }

  return calculateMonitoringQuote(
    clientData,
    request.billingFrequency,
    request.selections,
  );
}

export async function createMonitoringCheckout(args: {
  body: Partial<MonitoringCheckoutRequest>;
  origin: string;
  correlationId: string;
}): Promise<MonitoringCheckoutResponse> {
  assertMonitoringSubscriptionIntegration(args.correlationId);

  const token = isMonitoringSubscriptionCustomApiConfigured()
    ? assertTokenValue(args.body.token ?? null, args.correlationId)
    : assertScenarioToken(args.body.token ?? null, args.correlationId);
  const request = assertCheckoutRequest(args.body, args.correlationId);

  const clientData = isMonitoringSubscriptionCustomApiConfigured()
    ? (
        await resolveMonitoringSubscriptionContext({
          token,
          origin: args.origin,
          correlationId: args.correlationId,
        })
      ).data
    : getMockMonitoringClientData(args.origin, token);
  const quote = calculateMonitoringQuote(
    clientData,
    request.billingFrequency,
    request.selections,
  );

  if (quote.summary.payableNowCount < 1) {
    throw new MonitoringServiceError(
      createMonitoringError(
        'nothing_payable',
        'At least one payable trademark is required before checkout can start.',
      ),
      400,
      args.correlationId,
    );
  }

  if (isMonitoringSubscriptionCustomApiConfigured()) {
    try {
      return await createMonitoringSubscriptionCheckoutIntent({
        token,
        origin: args.origin,
        billingFrequency: request.billingFrequency,
        checkoutIntent: buildMonitoringCheckoutIntentPayload(
          clientData,
          request.billingFrequency,
          request.selections,
        ),
        correlationId: args.correlationId,
      });
    } catch (error) {
      if (error instanceof ZohoMonitoringSubscriptionError) {
        throw mapZohoErrorToMonitoringError(error, args.correlationId);
      }

      throw error;
    }
  }

  await simulateMockLatency(220);

  const session: MockCheckoutSession = {
    token,
    clientName: clientData.clientName,
    companyName: clientData.companyName,
    helpPhoneNumber: clientData.helpPhoneNumber,
    helpEmail: clientData.helpEmail,
    bookingUrl: clientData.bookingUrl,
    billingFrequency: request.billingFrequency,
    quote,
    firstPaymentDate: '2026-04-01',
    reference: createReference(token),
    createdAt: new Date().toISOString(),
  };

  const serializedSession = serializeMockCheckoutSession(session);
  const redirectUrl = new URL('/subscribe/monitoring/mock-payment', args.origin);
  redirectUrl.searchParams.set('token', token);
  redirectUrl.searchParams.set('session', serializedSession);

  return {
    redirectUrl: redirectUrl.toString(),
    session: serializedSession,
    reference: session.reference,
  };
}

export async function confirmMonitoringCheckout(args: {
  token: string | null;
  sessionValue: string | null;
  correlationId: string;
}): Promise<MonitoringConfirmationResponse> {
  assertMonitoringSubscriptionIntegration(args.correlationId);

  if (isMonitoringSubscriptionCustomApiConfigured()) {
    const token = assertTokenValue(args.token, args.correlationId);

    if (!args.sessionValue?.trim()) {
      throw new MonitoringServiceError(
        createMonitoringError(
          'invalid_session',
          'We could not verify this payment confirmation session.',
        ),
        400,
        args.correlationId,
      );
    }

    try {
      return await confirmMonitoringSubscriptionCheckout({
        token,
        session: args.sessionValue.trim(),
        correlationId: args.correlationId,
      });
    } catch (error) {
      if (error instanceof ZohoMonitoringSubscriptionError) {
        throw mapZohoErrorToMonitoringError(error, args.correlationId);
      }

      throw error;
    }
  }

  const session = parseMockCheckoutSession(args.sessionValue);

  if (!args.token || !session || session.token !== args.token) {
    throw new MonitoringServiceError(
      createMonitoringError(
        'invalid_session',
        'We could not verify this payment confirmation session.',
      ),
      400,
      args.correlationId,
    );
  }

  return buildConfirmationResponse(session);
}
