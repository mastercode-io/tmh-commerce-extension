import type { MockCheckoutSession } from '@/lib/types/monitoring';

export function serializeMockCheckoutSession(session: MockCheckoutSession) {
  return JSON.stringify(session);
}

export function parseMockCheckoutSession(
  session: string | null,
): MockCheckoutSession | null {
  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session) as MockCheckoutSession;
  } catch {
    return null;
  }
}
