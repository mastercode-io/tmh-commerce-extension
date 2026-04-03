import { NextResponse, type NextRequest } from 'next/server';

import {
  getMockMonitoringClientData,
  resolveMonitoringScenario,
  simulateMockLatency,
} from '@/lib/monitoring/mock-data';
import { calculateMonitoringQuote } from '@/lib/monitoring/pricing';
import type { MonitoringQuoteRequest } from '@/lib/types/monitoring';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<MonitoringQuoteRequest>;
  const scenario = resolveMonitoringScenario(body.token ?? null);

  await simulateMockLatency();

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

  return NextResponse.json(quote);
}
