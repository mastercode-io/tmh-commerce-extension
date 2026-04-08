import type {
  CommerceAccountSummary,
  CreateCommerceRequestInput,
  CustomerSummary,
  OrderSummary,
  PaymentSummary,
  RequestSummary,
  SubscriptionSummary,
} from '@/lib/commerce/types';
import {
  isCommerceAccountSummary,
  isCustomerSummary,
  isOrderSummary,
  isPaymentSummary,
  isRequestSummary,
  isSubscriptionSummary,
} from '@/lib/commerce/validators';
import {
  executeZohoRequest,
  requireZohoBaseUrl,
  ZohoClientError,
  type ZohoClientErrorCode,
  type ZohoRequestDebug,
} from '@/lib/zoho/client';

const COMMERCE_CUSTOM_API_URL_ENV = 'ZOHO_COMMERCE_CUSTOM_API_URL';

type ZohoCommerceOperation =
  | 'commerce.account_summary.get'
  | 'commerce.customer.get'
  | 'commerce.orders.list'
  | 'commerce.subscriptions.list'
  | 'commerce.payments.list'
  | 'commerce.requests.list'
  | 'commerce.requests.create';

type ZohoCommerceRequest = {
  operation: ZohoCommerceOperation;
  correlationId: string;
  customerId?: string;
  email?: string;
  request?: CreateCommerceRequestInput;
};

export type ZohoCommerceDebug = ZohoRequestDebug;

export class ZohoCommerceError extends Error {
  status: number;
  code: ZohoClientErrorCode;
  debug?: ZohoCommerceDebug;

  constructor(
    message: string,
    status: number,
    code: ZohoClientErrorCode,
    debug?: ZohoCommerceDebug,
  ) {
    super(message);
    this.name = 'ZohoCommerceError';
    this.status = status;
    this.code = code;
    this.debug = debug;
  }
}

export function isZohoCommerceCustomApiConfigured() {
  return Boolean(process.env[COMMERCE_CUSTOM_API_URL_ENV]);
}

function getCommerceCustomApiUrl() {
  return requireZohoBaseUrl(COMMERCE_CUSTOM_API_URL_ENV);
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

function mapZohoError(error: unknown) {
  if (error instanceof ZohoCommerceError) {
    return error;
  }

  if (error instanceof ZohoClientError) {
    return new ZohoCommerceError(
      error.message,
      error.status,
      error.code,
      error.debug,
    );
  }

  return error;
}

async function executeCommerceRequest<T>(args: {
  operation: ZohoCommerceOperation;
  correlationId: string;
  payload: Omit<ZohoCommerceRequest, 'operation' | 'correlationId'>;
  validate: (value: unknown) => value is T;
}) {
  try {
    const result = await executeZohoRequest({
      correlationId: args.correlationId,
      operation: args.operation,
      requestMethod: 'POST',
      requestUrl: getCommerceCustomApiUrl(),
      body: {
        operation: args.operation,
        correlationId: args.correlationId,
        ...args.payload,
      } satisfies ZohoCommerceRequest,
    });
    const data = unwrapZohoCustomApiEnvelope<T>(result.responseBody);

    if (!args.validate(data)) {
      throw new ZohoCommerceError(
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

function isArrayOf<T>(
  value: unknown,
  validate: (candidate: unknown) => candidate is T,
): value is T[] {
  return Array.isArray(value) && value.every(validate);
}

export async function getCommerceAccountSummary(args: {
  customerId?: string;
  email?: string;
  correlationId: string;
}): Promise<CommerceAccountSummary> {
  return executeCommerceRequest({
    operation: 'commerce.account_summary.get',
    correlationId: args.correlationId,
    payload: {
      customerId: args.customerId,
      email: args.email,
    },
    validate: isCommerceAccountSummary,
  });
}

export async function getCommerceCustomer(args: {
  customerId?: string;
  email?: string;
  correlationId: string;
}): Promise<CustomerSummary> {
  return executeCommerceRequest({
    operation: 'commerce.customer.get',
    correlationId: args.correlationId,
    payload: {
      customerId: args.customerId,
      email: args.email,
    },
    validate: isCustomerSummary,
  });
}

export async function listCommerceOrders(args: {
  customerId: string;
  correlationId: string;
}): Promise<OrderSummary[]> {
  return executeCommerceRequest({
    operation: 'commerce.orders.list',
    correlationId: args.correlationId,
    payload: {
      customerId: args.customerId,
    },
    validate: (value): value is OrderSummary[] => isArrayOf(value, isOrderSummary),
  });
}

export async function listCommerceSubscriptions(args: {
  customerId: string;
  correlationId: string;
}): Promise<SubscriptionSummary[]> {
  return executeCommerceRequest({
    operation: 'commerce.subscriptions.list',
    correlationId: args.correlationId,
    payload: {
      customerId: args.customerId,
    },
    validate: (value): value is SubscriptionSummary[] =>
      isArrayOf(value, isSubscriptionSummary),
  });
}

export async function listCommercePayments(args: {
  customerId: string;
  correlationId: string;
}): Promise<PaymentSummary[]> {
  return executeCommerceRequest({
    operation: 'commerce.payments.list',
    correlationId: args.correlationId,
    payload: {
      customerId: args.customerId,
    },
    validate: (value): value is PaymentSummary[] =>
      isArrayOf(value, isPaymentSummary),
  });
}

export async function listCommerceRequests(args: {
  customerId: string;
  correlationId: string;
}): Promise<RequestSummary[]> {
  return executeCommerceRequest({
    operation: 'commerce.requests.list',
    correlationId: args.correlationId,
    payload: {
      customerId: args.customerId,
    },
    validate: (value): value is RequestSummary[] =>
      isArrayOf(value, isRequestSummary),
  });
}

export async function createCommerceRequest(args: {
  request: CreateCommerceRequestInput;
  correlationId: string;
}): Promise<RequestSummary> {
  return executeCommerceRequest({
    operation: 'commerce.requests.create',
    correlationId: args.correlationId,
    payload: {
      request: args.request,
    },
    validate: isRequestSummary,
  });
}
