import { NextResponse, type NextRequest } from 'next/server';

import { isCreateCommerceRequestPayload } from '@/lib/commerce/request-validators';
import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';
import { parseJsonRequestBody } from '@/lib/server/request-json';
import {
  createCommerceRequest,
  getCommerceCustomer,
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

async function resolveCustomerId(args: {
  customerId?: string;
  email?: string;
  correlationId: string;
}) {
  if (args.customerId?.trim()) {
    return args.customerId.trim();
  }

  if (!args.email?.trim()) {
    return null;
  }

  const customer = await getCommerceCustomer({
    email: args.email.trim(),
    correlationId: args.correlationId,
  });

  return customer.customerId;
}

function getCommerceErrorStatus(error: ZohoCommerceError) {
  if (error.code === 'config_error') {
    return 503;
  }

  return error.status;
}

function getCommerceErrorMessage(error: ZohoCommerceError) {
  if (error.code === 'config_error') {
    return 'Request integration is not configured yet.';
  }

  if (error.status === 404) {
    return 'We could not find an account for this customer.';
  }

  return 'We could not submit the request right now. Please try again later.';
}

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  const payload = await parseJsonRequestBody(request);

  if (!isCreateCommerceRequestPayload(payload)) {
    return createJsonResponse(
      {
        code: 'invalid_request',
        message:
          'A customer identity, request type, and summary are required to submit a request.',
        correlationId,
      },
      correlationId,
      { status: 400 },
    );
  }

  try {
    const customerId = await resolveCustomerId({
      customerId: payload.customerId,
      email: payload.email,
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

    const createdRequest = await createCommerceRequest({
      correlationId,
      request: {
        customerId,
        requestType: payload.requestType,
        summary: payload.summary.trim(),
        details: payload.details,
      },
    });

    return createJsonResponse(
      {
        request: createdRequest,
        correlationId,
      },
      correlationId,
      { status: 201 },
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
        message: 'Unable to submit request.',
        correlationId,
      },
      correlationId,
      { status: 500 },
    );
  }
}
