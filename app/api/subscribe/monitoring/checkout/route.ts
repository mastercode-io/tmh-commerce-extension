import { NextResponse, type NextRequest } from 'next/server';

import {
  getMockMonitoringClientData,
  resolveMonitoringScenario,
  simulateMockLatency,
} from '@/lib/monitoring/mock-data';
import { calculateMonitoringQuote } from '@/lib/monitoring/pricing';
import { serializeMockCheckoutSession } from '@/lib/monitoring/session';
import type {
  MockCheckoutSession,
  MonitoringCheckoutRequest,
} from '@/lib/types/monitoring';

export const runtime = 'edge';

function createReference(token: string) {
  const compact = token
    .replace(/[^a-z0-9]/gi, '')
    .slice(-6)
    .toUpperCase()
    .padStart(6, '0');
  return `TMH-MON-${compact}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<MonitoringCheckoutRequest>;
  const scenario = resolveMonitoringScenario(body.token ?? null);

  await simulateMockLatency(220);

  if (!scenario.ok) {
    return NextResponse.json(scenario.error, { status: scenario.status });
  }

  if (!body.billingFrequency || !body.selections) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'Token, billing frequency, and selections are required.',
      },
      { status: 400 },
    );
  }

  const origin = request.nextUrl.origin;
  const clientData = getMockMonitoringClientData(origin, scenario.token);
  const quote = calculateMonitoringQuote(
    clientData,
    body.billingFrequency,
    body.selections,
  );

  if (quote.summary.payableNowCount < 1) {
    return NextResponse.json(
      {
        code: 'nothing_payable',
        message:
          'At least one payable trademark is required before checkout can start.',
      },
      { status: 400 },
    );
  }

  const session: MockCheckoutSession = {
    token: scenario.token,
    clientName: clientData.clientName,
    companyName: clientData.companyName,
    helpPhoneNumber: clientData.helpPhoneNumber,
    helpEmail: clientData.helpEmail,
    bookingUrl: clientData.bookingUrl,
    billingFrequency: body.billingFrequency,
    quote,
    firstPaymentDate: '2026-04-01',
    reference: createReference(scenario.token),
    createdAt: new Date().toISOString(),
  };

  const serializedSession = serializeMockCheckoutSession(session);
  const redirectUrl = new URL(
    '/subscribe/monitoring/mock-payment',
    request.nextUrl.origin,
  );
  redirectUrl.searchParams.set('token', scenario.token);
  redirectUrl.searchParams.set('session', serializedSession);

  return NextResponse.json({
    redirectUrl: redirectUrl.toString(),
    session: serializedSession,
    reference: session.reference,
  });
}
