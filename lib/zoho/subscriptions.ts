import type {
  BillingFrequency,
  MonitoringApiErrorCode,
  MonitoringCheckoutResponse,
  MonitoringClientData,
  MonitoringConfirmationResponse,
  MonitoringQuoteResponse,
  TrademarkSelection,
} from '@/lib/types/monitoring';
import {
  executeZohoRequest,
  requireZohoBaseUrl,
  ZohoClientError,
  type ZohoRequestDebug,
} from '@/lib/zoho/client';

const MONITORING_SUBSCRIPTION_CUSTOM_API_URL_ENV =
  'ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL';

type MonitoringSubscriptionOperation =
  | 'monitoring_subscription.resolve_token'
  | 'monitoring_subscription.create_checkout_intent'
  | 'monitoring_subscription.confirm_checkout';

type ZohoMonitoringSubscriptionRequest = {
  operation: MonitoringSubscriptionOperation;
  correlationId: string;
  token?: string;
  origin?: string;
  billingFrequency?: BillingFrequency;
  selections?: TrademarkSelection[];
  quote?: MonitoringQuoteResponse;
  session?: string;
};

export type ZohoMonitoringSubscriptionDebug = ZohoRequestDebug;

export class ZohoMonitoringSubscriptionError extends Error {
  status: number;
  code: 'config_error' | 'upstream_error' | 'invalid_response';
  appCode?: MonitoringApiErrorCode;
  debug?: ZohoMonitoringSubscriptionDebug;

  constructor(
    message: string,
    status: number,
    code: 'config_error' | 'upstream_error' | 'invalid_response',
    debug?: ZohoMonitoringSubscriptionDebug,
    appCode?: MonitoringApiErrorCode,
  ) {
    super(message);
    this.name = 'ZohoMonitoringSubscriptionError';
    this.status = status;
    this.code = code;
    this.appCode = appCode;
    this.debug = debug;
  }
}

export function isMonitoringSubscriptionCustomApiConfigured() {
  return Boolean(process.env[MONITORING_SUBSCRIPTION_CUSTOM_API_URL_ENV]);
}

function getMonitoringSubscriptionCustomApiUrl() {
  return requireZohoBaseUrl(MONITORING_SUBSCRIPTION_CUSTOM_API_URL_ENV);
}

function unwrapZohoCustomApiEnvelope<T>(body: unknown) {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    body.data &&
    typeof body.data === 'object'
  ) {
    return body.data as T;
  }

  return body as T;
}

function hasStringField<TField extends string>(
  value: unknown,
  field: TField,
): value is Record<TField, string> {
  const candidate = value as Record<string, unknown>;

  return (
    value !== null &&
    typeof value === 'object' &&
    field in candidate &&
    typeof candidate[field] === 'string'
  );
}

function isMonitoringClientData(value: unknown): value is MonitoringClientData {
  return (
    hasStringField(value, 'token') &&
    hasStringField(value, 'clientName') &&
    hasStringField(value, 'helpPhoneNumber') &&
    hasStringField(value, 'helpEmail') &&
    hasStringField(value, 'bookingUrl') &&
    'trademarks' in value &&
    Array.isArray(value.trademarks)
  );
}

function isMonitoringCheckoutResponse(
  value: unknown,
): value is MonitoringCheckoutResponse {
  return (
    hasStringField(value, 'redirectUrl') &&
    hasStringField(value, 'session') &&
    hasStringField(value, 'reference')
  );
}

function isMonitoringConfirmationResponse(
  value: unknown,
): value is MonitoringConfirmationResponse {
  return (
    hasStringField(value, 'clientName') &&
    hasStringField(value, 'helpPhoneNumber') &&
    hasStringField(value, 'helpEmail') &&
    hasStringField(value, 'bookingUrl') &&
    hasStringField(value, 'billingFrequency') &&
    hasStringField(value, 'firstPaymentDate') &&
    hasStringField(value, 'reference') &&
    'paidItems' in value &&
    Array.isArray(value.paidItems) &&
    'followUpItems' in value &&
    Array.isArray(value.followUpItems) &&
    'summary' in value &&
    Boolean(value.summary)
  );
}

function isMonitoringApiErrorCode(value: unknown): value is MonitoringApiErrorCode {
  return (
    value === 'invalid_token' ||
    value === 'expired_token' ||
    value === 'no_trademarks' ||
    value === 'server_error' ||
    value === 'upstream_error' ||
    value === 'config_error' ||
    value === 'invalid_request' ||
    value === 'invalid_session' ||
    value === 'nothing_payable'
  );
}

function extractAppErrorCode(debug?: ZohoRequestDebug) {
  const body = debug?.responseBody;

  if (
    body &&
    typeof body === 'object' &&
    'code' in body &&
    isMonitoringApiErrorCode(body.code)
  ) {
    return body.code;
  }

  return undefined;
}

function mapZohoError(error: unknown) {
  if (error instanceof ZohoMonitoringSubscriptionError) {
    return error;
  }

  if (error instanceof ZohoClientError) {
    return new ZohoMonitoringSubscriptionError(
      error.message,
      error.status,
      error.code,
      error.debug,
      extractAppErrorCode(error.debug),
    );
  }

  return error;
}

async function executeMonitoringSubscriptionRequest<T>(args: {
  operation: MonitoringSubscriptionOperation;
  correlationId: string;
  payload: Omit<ZohoMonitoringSubscriptionRequest, 'operation' | 'correlationId'>;
  validate: (value: unknown) => value is T;
}) {
  try {
    const result = await executeZohoRequest({
      correlationId: args.correlationId,
      operation: args.operation,
      requestMethod: 'POST',
      requestUrl: getMonitoringSubscriptionCustomApiUrl(),
      body: {
        operation: args.operation,
        correlationId: args.correlationId,
        ...args.payload,
      } satisfies ZohoMonitoringSubscriptionRequest,
    });
    const data = unwrapZohoCustomApiEnvelope<T>(result.responseBody);

    if (!args.validate(data)) {
      throw new ZohoMonitoringSubscriptionError(
        `${args.operation} returned an invalid response shape.`,
        502,
        'invalid_response',
        result.debug,
      );
    }

    return data;
  } catch (error) {
    throw mapZohoError(error);
  }
}

export async function resolveMonitoringSubscriptionToken(args: {
  token: string;
  origin: string;
  correlationId: string;
}) {
  return executeMonitoringSubscriptionRequest({
    operation: 'monitoring_subscription.resolve_token',
    correlationId: args.correlationId,
    payload: {
      token: args.token,
      origin: args.origin,
    },
    validate: isMonitoringClientData,
  });
}

export async function createMonitoringSubscriptionCheckoutIntent(args: {
  token: string;
  origin: string;
  billingFrequency: BillingFrequency;
  selections: TrademarkSelection[];
  quote: MonitoringQuoteResponse;
  correlationId: string;
}) {
  return executeMonitoringSubscriptionRequest({
    operation: 'monitoring_subscription.create_checkout_intent',
    correlationId: args.correlationId,
    payload: {
      token: args.token,
      origin: args.origin,
      billingFrequency: args.billingFrequency,
      selections: args.selections,
      quote: args.quote,
    },
    validate: isMonitoringCheckoutResponse,
  });
}

export async function confirmMonitoringSubscriptionCheckout(args: {
  token: string;
  session: string;
  correlationId: string;
}) {
  return executeMonitoringSubscriptionRequest({
    operation: 'monitoring_subscription.confirm_checkout',
    correlationId: args.correlationId,
    payload: {
      token: args.token,
      session: args.session,
    },
    validate: isMonitoringConfirmationResponse,
  });
}
