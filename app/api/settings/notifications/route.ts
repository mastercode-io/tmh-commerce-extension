import { NextResponse, type NextRequest } from 'next/server';

import {
  fetchNotificationPreferences,
  NotificationPreferencesError,
} from '@/lib/email-preferences/crm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim();

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
