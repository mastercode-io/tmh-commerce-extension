import { NextResponse, type NextRequest } from 'next/server';

import {
  getMockMonitoringClientData,
  resolveMonitoringScenario,
  simulateMockLatency,
} from '@/lib/monitoring/mock-data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const scenario = resolveMonitoringScenario(token);

  await simulateMockLatency();

  if (!scenario.ok) {
    return NextResponse.json(scenario.error, { status: scenario.status });
  }

  const origin = request.nextUrl.origin;

  return NextResponse.json(getMockMonitoringClientData(origin, scenario.token));
}
