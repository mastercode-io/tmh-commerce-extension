import { NextResponse, type NextRequest } from 'next/server';

import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';
import {
  getCommerceAccountSummary,
  ZohoCommerceError,
} from '@/lib/zoho/commerce';

export const runtime = 'edge';

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

function getIdentityFromRequest(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customerId')?.trim();
  const email = request.nextUrl.searchParams.get('email')?.trim();

  return {
    customerId: customerId || undefined,
    email: email || undefined,
  };
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

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  const { customerId, email } = getIdentityFromRequest(request);

  if (!customerId && !email) {
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
    const account = await getCommerceAccountSummary({
      customerId,
      email,
      correlationId,
    });

    return createJsonResponse(
      {
        account,
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
