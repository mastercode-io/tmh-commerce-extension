import { NextResponse, type NextRequest } from 'next/server';

import {
  fetchNotificationPreferences,
  NotificationPreferencesError,
  saveNotificationPreferences,
} from '@/lib/email-preferences/crm';
import topicConfigs from '@/lib/email-preferences/topics.json';
import type { NotificationPreferencesPayload } from '@/lib/email-preferences/types';

export const runtime = 'edge';

function isDevModeEnabled() {
  return process.env.DEV_MODE?.toLowerCase() === 'true';
}

function validateCategories(
  payload: unknown,
): payload is NotificationPreferencesPayload {
  return Array.isArray(payload);
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';

  if (!isDevModeEnabled() && !email) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'Email is required.',
      },
      { status: 400 },
    );
  }

  try {
    if (isDevModeEnabled()) {
      return NextResponse.json({
        email,
        categories: topicConfigs as NotificationPreferencesPayload,
      });
    }

    const preferences = await fetchNotificationPreferences(email);
    return NextResponse.json(preferences);
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        code: 'server_error',
        message: 'Unable to load notification preferences.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';
  const payload = (await request.json()) as unknown;

  if (!validateCategories(payload)) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'A notification categories array is required.',
      },
      { status: 400 },
    );
  }

  if (isDevModeEnabled()) {
    return NextResponse.json({
      email,
      categories: payload,
    });
  }

  if (!email) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'Email is required.',
      },
      { status: 400 },
    );
  }

  try {
    const preferences = await saveNotificationPreferences(email, payload);
    return NextResponse.json(preferences);
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return NextResponse.json(
        {
          code: error.code,
          message: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        code: 'server_error',
        message: 'Unable to save notification preferences.',
      },
      { status: 500 },
    );
  }
}
