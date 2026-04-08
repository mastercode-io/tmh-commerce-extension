import { NextResponse, type NextRequest } from 'next/server';

import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';
import {
  getCommerceCustomer,
  listCommerceOrders,
  listCommercePayments,
  listCommerceRequests,
  listCommerceSubscriptions,
  ZohoCommerceError,
} from '@/lib/zoho/commerce';

export const runtime = 'edge';

type AccountResource = 'orders' | 'subscriptions' | 'payments' | 'requests';

function isDevModeEnabled() {
  return process.env.DEV_MODE?.toLowerCase() === 'true';
}

function createJsonResponse(
  payload: unknown,
  correlationId: string,
  init?: ResponseInit,
) {
  return attachCorrelationIdHeader(NextResponse.json(payload, init), correlationId);
}

function isAccountResource(value: string): value is AccountResource {
  return ['orders', 'subscriptions', 'payments', 'requests'].includes(value);
}

function getIdentityFromRequest(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customerId')?.trim();
  const email = request.nextUrl.searchParams.get('email')?.trim();

  return {
    customerId: customerId || undefined,
    email: email || undefined,
  };
}

async function resolveCustomerId(args: {
  customerId?: string;
  email?: string;
  correlationId: string;
}) {
  if (args.customerId) {
    return args.customerId;
  }

  if (!args.email) {
    return null;
  }

  const customer = await getCommerceCustomer({
    email: args.email,
    correlationId: args.correlationId,
  });

  return customer.customerId;
}

async function listResource(args: {
  resource: AccountResource;
  customerId: string;
  correlationId: string;
}) {
  if (args.resource === 'orders') {
    return listCommerceOrders(args);
  }

  if (args.resource === 'subscriptions') {
    return listCommerceSubscriptions(args);
  }

  if (args.resource === 'payments') {
    return listCommercePayments(args);
  }

  return listCommerceRequests(args);
}

function getCommerceErrorStatus(error: ZohoCommerceError) {
  if (error.code === 'config_error') {
    return 503;
  }

  return error.status;
}

function getCommerceErrorMessage(error: ZohoCommerceError) {
  if (error.code === 'config_error') {
    return 'Account data integration is not configured yet.';
  }

  if (error.status === 404) {
    return 'We could not find an account for this customer.';
  }

  return 'We could not load account data right now. Please try again later.';
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const correlationId = getOrCreateCorrelationId(request);
  const { resource } = await context.params;

  if (!isAccountResource(resource)) {
    return createJsonResponse(
      {
        code: 'not_found',
        message: 'Unknown account resource.',
        correlationId,
      },
      correlationId,
      { status: 404 },
    );
  }

  const identity = getIdentityFromRequest(request);

  if (!identity.customerId && !identity.email) {
    return createJsonResponse(
      {
        code: 'invalid_request',
        message: 'A customer ID or email address is required.',
        correlationId,
      },
      correlationId,
      { status: 400 },
    );
  }

  try {
    const customerId = await resolveCustomerId({
      ...identity,
      correlationId,
    });

    if (!customerId) {
      return createJsonResponse(
        {
          code: 'invalid_request',
          message: 'A customer ID or email address is required.',
          correlationId,
        },
        correlationId,
        { status: 400 },
      );
    }

    const items = await listResource({
      resource,
      customerId,
      correlationId,
    });

    return createJsonResponse(
      {
        resource,
        customerId,
        items,
        correlationId,
      },
      correlationId,
    );
  } catch (error) {
    if (error instanceof ZohoCommerceError) {
      return createJsonResponse(
        {
          code: error.code,
          message: getCommerceErrorMessage(error),
          correlationId,
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        correlationId,
        { status: getCommerceErrorStatus(error) },
      );
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'Unable to load account data.',
        correlationId,
      },
      correlationId,
      { status: 500 },
    );
  }
}
