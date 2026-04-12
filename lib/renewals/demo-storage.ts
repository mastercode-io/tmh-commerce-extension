'use client';

import type {
  RenewalOrderDetails,
  RenewalOrderResponse,
} from '../../features/renewals/lib/types.ts';
import type {
  OrderSummary,
  PaymentSummary,
  RequestSummary,
} from '../commerce/types.ts';

const RENEWAL_DEMO_ORDER_PREFIX = 'renewal_demo_order:';

type RenewalDemoPaymentOutcome = Extract<
  PaymentSummary['status'],
  'succeeded' | 'failed' | 'cancelled'
>;

export type RenewalDemoOrderSnapshot = {
  token: string;
  request?: RequestSummary;
  order: OrderSummary;
  orderDetails: RenewalOrderDetails;
  payment: PaymentSummary | null;
  paymentStartedAtMs: number | null;
  paymentOutcome: RenewalDemoPaymentOutcome;
  confirmedAt: string | null;
};

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function getStorageKey(orderId: string) {
  return `${RENEWAL_DEMO_ORDER_PREFIX}${orderId}`;
}

function cloneOrderDetails(orderDetails: RenewalOrderDetails): RenewalOrderDetails {
  return {
    ...orderDetails,
    totals: { ...orderDetails.totals },
    trademarks: orderDetails.trademarks.map((item) => ({ ...item })),
    lineItems: orderDetails.lineItems.map((item) => ({ ...item })),
  };
}

function resolveDemoPaymentOutcome(token: string): RenewalDemoPaymentOutcome {
  const normalized = token.toLowerCase();

  if (normalized.includes('failed')) {
    return 'failed';
  }

  if (
    normalized.includes('voided') ||
    normalized.includes('cancelled') ||
    normalized.includes('deleted') ||
    normalized.includes('not-found')
  ) {
    return 'cancelled';
  }

  return 'succeeded';
}

export function saveRenewalDemoOrder(args: {
  token: string;
  request?: RequestSummary;
  order: OrderSummary;
  orderDetails: RenewalOrderDetails;
  payment?: PaymentSummary | null;
}) {
  if (!canUseSessionStorage()) {
    return;
  }

  const snapshot: RenewalDemoOrderSnapshot = {
    token: args.token,
    request: args.request ? { ...args.request } : undefined,
    order: { ...args.order },
    orderDetails: cloneOrderDetails(args.orderDetails),
    payment: args.payment ? { ...args.payment } : null,
    paymentStartedAtMs: null,
    paymentOutcome: resolveDemoPaymentOutcome(args.token),
    confirmedAt: null,
  };

  window.sessionStorage.setItem(
    getStorageKey(args.order.orderId),
    JSON.stringify(snapshot),
  );
}

export function readRenewalDemoOrder(orderId: string) {
  if (!canUseSessionStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(getStorageKey(orderId));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RenewalDemoOrderSnapshot;
  } catch {
    return null;
  }
}

export function writeRenewalDemoOrder(snapshot: RenewalDemoOrderSnapshot) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    getStorageKey(snapshot.order.orderId),
    JSON.stringify(snapshot),
  );
}

export function toRenewalOrderResponse(
  snapshot: RenewalDemoOrderSnapshot,
): RenewalOrderResponse {
  return {
    request: snapshot.request ? { ...snapshot.request } : undefined,
    order: { ...snapshot.order },
    orderDetails: cloneOrderDetails(snapshot.orderDetails),
    payment: snapshot.payment ? { ...snapshot.payment } : null,
  };
}

export function startRenewalDemoPayment(args: {
  orderId: string;
  nowMs?: number;
}) {
  const snapshot = readRenewalDemoOrder(args.orderId);

  if (!snapshot) {
    return null;
  }

  if (!snapshot.payment) {
    const numeric = Number.parseInt(snapshot.order.orderId.replace(/\D/g, ''), 10) || 0;
    snapshot.payment = {
      paymentId: `pay_${String(numeric).padStart(6, '0')}`,
      orderId: snapshot.order.orderId,
      provider: 'xero',
      status: 'initiated',
      amount: snapshot.order.totalDueNow,
      currency: snapshot.order.currency,
      reference: `TMH-PAY-${String(numeric).padStart(6, '0')}`,
    };
  }

  snapshot.paymentStartedAtMs = args.nowMs ?? Date.now();
  snapshot.order.status = 'pending_confirmation';
  writeRenewalDemoOrder(snapshot);

  return {
    paymentUrl: `/renewal/mock-payment?orderId=${encodeURIComponent(snapshot.order.orderId)}`,
    payment: { ...snapshot.payment },
  };
}

export function getRenewalDemoPaymentSnapshot(args: {
  orderId: string;
  nowMs?: number;
}) {
  const snapshot = readRenewalDemoOrder(args.orderId);

  if (!snapshot || !snapshot.payment || !snapshot.paymentStartedAtMs) {
    return null;
  }

  const nowMs = args.nowMs ?? Date.now();
  const elapsedMs = Math.max(0, nowMs - snapshot.paymentStartedAtMs);
  let status: PaymentSummary['status'] = 'initiated';

  if (elapsedMs >= 5000) {
    status = snapshot.paymentOutcome;
  } else if (elapsedMs >= 2000) {
    status = 'pending';
  }

  snapshot.payment.status = status;

  if (status === 'succeeded') {
    snapshot.order.status = 'confirmed';
    snapshot.confirmedAt ??= new Date(snapshot.paymentStartedAtMs + 5000).toISOString();
    snapshot.order.confirmedAt ??= snapshot.confirmedAt;
  } else if (status === 'failed') {
    snapshot.order.status = 'failed';
  } else if (status === 'cancelled') {
    snapshot.order.status = 'cancelled';
  } else if (status === 'pending') {
    snapshot.order.status = 'pending_confirmation';
  }

  writeRenewalDemoOrder(snapshot);

  return {
    snapshot,
    payment: { ...snapshot.payment },
    updatedAt:
      status === 'initiated'
        ? new Date(snapshot.paymentStartedAtMs).toISOString()
        : status === 'pending'
          ? new Date(snapshot.paymentStartedAtMs + 2000).toISOString()
          : new Date(snapshot.paymentStartedAtMs + 5000).toISOString(),
  };
}
