import type { OrderStatus, PaymentStatus, RequestStatus } from '@/lib/commerce/types';

function normalizeStatusValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export function normalizePaymentStatus(
  rawStatus: string | null | undefined,
): PaymentStatus {
  const normalized = normalizeStatusValue(rawStatus);

  switch (normalized) {
    case 'paid':
    case 'succeeded':
    case 'success':
    case 'confirmed':
      return 'succeeded';
    case 'pending':
    case 'initiated':
    case 'processing':
      return normalized === 'initiated' ? 'initiated' : 'pending';
    case 'failed':
    case 'failure':
    case 'error':
      return 'failed';
    case 'voided':
    case 'void':
    case 'cancelled':
    case 'canceled':
    case 'not_found':
    case 'deleted':
    case 'expired':
      return 'cancelled';
    default:
      return 'failed';
  }
}

export function normalizeRequestStatus(
  rawStatus: string | null | undefined,
): RequestStatus {
  const normalized = normalizeStatusValue(rawStatus);

  switch (normalized) {
    case 'submitted':
    case 'new':
      return 'submitted';
    case 'triaged':
    case 'quoted':
    case 'in_review':
      return 'triaged';
    case 'awaiting_customer':
    case 'awaiting-customer':
      return 'awaiting_customer';
    case 'in_progress':
    case 'in-progress':
    case 'pending_checkout':
    case 'paid':
      return 'in_progress';
    case 'completed':
    case 'done':
      return 'completed';
    case 'cancelled':
    case 'canceled':
      return 'cancelled';
    default:
      return 'submitted';
  }
}

export function normalizeOrderStatus(
  rawStatus: string | null | undefined,
): OrderStatus {
  const normalized = normalizeStatusValue(rawStatus);

  switch (normalized) {
    case 'draft':
      return 'draft';
    case 'pending_checkout':
    case 'pending':
      return 'pending_checkout';
    case 'pending_confirmation':
    case 'submitted':
      return 'pending_confirmation';
    case 'confirmed':
    case 'paid':
    case 'completed':
      return 'confirmed';
    case 'failed':
    case 'error':
      return 'failed';
    case 'cancelled':
    case 'canceled':
    case 'voided':
      return 'cancelled';
    default:
      return 'draft';
  }
}
