import { NextResponse, type NextRequest } from 'next/server';

import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';
import { parseJsonRequestBody } from '@/lib/server/request-json';
import {
  isNotificationPreferencesOptOutRequest,
  isNotificationPreferencesSaveRequest,
} from '@/lib/email-preferences/validators';
import {
  getPreferenceProfile,
  NotificationPreferencesError,
  savePreferenceProfile,
} from '@/lib/zoho/preferences';

export const runtime = 'edge';

function isDevModeEnabled() {
  return process.env.DEV_MODE?.toLowerCase() === 'true';
}

function getUserFacingError(
  error: NotificationPreferencesError,
  action: 'load' | 'save',
) {
  if (error.status === 400) {
    return action === 'load'
      ? 'Bad request. Please check the link and try again.'
      : 'Bad request. Please review your changes and try again.';
  }

  if (error.status === 404) {
    return 'User not found. We could not find email preferences for this email address.';
  }

  return action === 'load'
    ? 'We could not load email preferences right now. Please try again later.'
    : 'We could not save email preferences right now. Please try again later.';
}

function createInvalidEmailResponse(
  correlationId: string,
  action: 'load' | 'save',
) {
  return createJsonResponse(
    {
      code: 'invalid_request',
      message:
        action === 'load'
          ? 'Bad request. Please check the link and try again.'
          : 'Bad request. A valid email address is required.',
      correlationId,
      crmSyncStatus: 'sync_failed',
    },
    correlationId,
    { status: 400 },
  );
}

function createJsonResponse(
  payload: unknown,
  correlationId: string,
  init?: ResponseInit,
) {
  return attachCorrelationIdHeader(NextResponse.json(payload, init), correlationId);
}

function createPreferenceResponsePayload(
  preferences: Awaited<ReturnType<typeof getPreferenceProfile>>,
  includeDebug: boolean,
) {
  const profile = {
    customerId: preferences.customerId,
    email: preferences.email,
    globalOptOut: preferences.globalOptOut,
    categories: preferences.categories,
    updatedAt: preferences.updatedAt,
    crmSyncStatus: preferences.crmSyncStatus,
    isNew: preferences.isNew,
  };

  return {
    email: preferences.email,
    categories: preferences.categories,
    ...(preferences.globalOptOut ? { optOut: true as const } : {}),
    ...(preferences.isNew ? { new: true as const } : {}),
    crmSyncStatus: preferences.crmSyncStatus,
    correlationId: preferences.correlationId,
    profile,
    ...(includeDebug && preferences.debug ? { debug: preferences.debug } : {}),
  };
}

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';

  if (!email) {
    return createInvalidEmailResponse(correlationId, 'load');
  }

  try {
    const preferences = await getPreferenceProfile(email, correlationId);
    return createJsonResponse(
      createPreferenceResponsePayload(preferences, isDevModeEnabled()),
      correlationId,
    );
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return createJsonResponse(
        {
          code: error.code,
          message: getUserFacingError(error, 'load'),
          correlationId,
          crmSyncStatus: 'sync_failed',
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        correlationId,
        { status: error.status },
      );
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'Unable to load notification preferences.',
        correlationId,
        crmSyncStatus: 'sync_failed',
      },
      correlationId,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  const payload = await parseJsonRequestBody(request);

  if (
    !isNotificationPreferencesSaveRequest(payload) &&
    !isNotificationPreferencesOptOutRequest(payload)
  ) {
    return createJsonResponse(
      {
        code: 'invalid_request',
        message: 'A valid email preferences payload is required.',
        correlationId,
        crmSyncStatus: 'sync_failed',
      },
      correlationId,
      { status: 400 },
    );
  }

  if (!payload.email.trim()) {
    return createInvalidEmailResponse(correlationId, 'save');
  }

  try {
    const preferences = await savePreferenceProfile(
      { ...payload, email: payload.email.trim() },
      correlationId,
    );
    return createJsonResponse(
      createPreferenceResponsePayload(preferences, isDevModeEnabled()),
      correlationId,
    );
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return createJsonResponse(
        {
          code: error.code,
          message: getUserFacingError(error, 'save'),
          correlationId,
          crmSyncStatus: 'sync_failed',
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        correlationId,
        { status: error.status },
      );
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'Unable to save notification preferences.',
        correlationId,
        crmSyncStatus: 'sync_failed',
      },
      correlationId,
      { status: 500 },
    );
  }
}
