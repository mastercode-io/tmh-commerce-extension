import { NextResponse, type NextRequest } from 'next/server';

import { parseMockCheckoutSession } from '@/lib/monitoring/session';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const sessionValue = request.nextUrl.searchParams.get('session');
  const session = parseMockCheckoutSession(sessionValue);

  if (!token || !session || session.token !== token) {
    return NextResponse.json(
      {
        code: 'invalid_session',
        message: 'We could not verify this payment confirmation session.',
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
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
  });
}
