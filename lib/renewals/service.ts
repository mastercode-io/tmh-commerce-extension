import type {
  CreateRenewalOrderResponse,
  CreateRenewalPaymentLinkResponse,
  RenewalConfirmationResponse,
  RenewalDetailsResponse,
  RenewalOrderDetails,
  RenewalOrderResponse,
  RenewalPaymentStatusResponse,
  RenewalTrademark,
} from '../../features/renewals/lib/types.ts';
import type {
  OrderSummary,
  PaymentSummary,
  RequestSummary,
} from '../commerce/types.ts';
import { assertRenewalsIntegration } from './config.ts';
import { createRenewalError, RenewalServiceError } from './errors.ts';
import {
  getMockRenewalDetails,
  getMockRenewalTrademarks,
  resolveMockRenewalPaymentOutcome,
  resolveRenewalScenario,
  simulateMockLatency,
} from './mock-data.ts';
import {
  validateCreateRenewalOrderRequest,
  validateRenewalPaymentLinkRequest,
} from './validators.ts';

type StoredRenewalOrder = {
  token: string;
  request: RequestSummary;
  order: OrderSummary;
  orderDetails: RenewalOrderDetails;
  payment: PaymentSummary | null;
  paymentUrl: string | null;
  paymentCreatedAtMs: number | null;
  paymentOutcome: Extract<PaymentSummary['status'], 'succeeded' | 'failed' | 'cancelled'>;
  confirmedAt: string | null;
};

const RENEWAL_SUBTOTAL_PER_MARK = 760;
const RENEWAL_VAT_PER_MARK = 152;
const RENEWAL_TOTAL_PER_MARK = 912;

const mockOrders = new Map<string, StoredRenewalOrder>();

let mockSequence = 122;

function nextSequence() {
  mockSequence += 1;
  return mockSequence;
}

function formatEntityId(prefix: string, sequence: number) {
  return `${prefix}_${String(sequence).padStart(6, '0')}`;
}

function formatReference(prefix: string, sequence: number) {
  return `TMH-${prefix}-${String(sequence).padStart(6, '0')}`;
}

function pluralizeTrademark(count: number) {
  return count === 1 ? 'trademark' : 'trademarks';
}

function getAvailableTrademarks(origin: string, token: string) {
  return getMockRenewalTrademarks(origin, token);
}

function resolveTokenOrThrow(token: string | null, correlationId: string) {
  const scenario = resolveRenewalScenario(token);

  if (!scenario.ok) {
    throw new RenewalServiceError(
      scenario.error,
      scenario.status,
      correlationId,
    );
  }

  return scenario.token;
}

function getStoredOrder(orderId: string, correlationId: string) {
  const stored = mockOrders.get(orderId);

  if (!stored) {
    throw new RenewalServiceError(
      createRenewalError('not_found', 'We could not find this renewal order.'),
      404,
      correlationId,
    );
  }

  return stored;
}

function dedupeTrademarkIds(selectedTrademarkIds: string[], primaryTrademarkId: string) {
  return Array.from(
    new Set([primaryTrademarkId, ...selectedTrademarkIds.map((item) => item.trim())]),
  );
}

function resolveSelectedTrademarks(args: {
  availableTrademarks: RenewalTrademark[];
  primaryTrademarkId: string;
  selectedTrademarkIds: string[];
  correlationId: string;
}) {
  const lookup = new Map(
    args.availableTrademarks.map((trademark) => [trademark.id, trademark]),
  );
  const selectedIds = dedupeTrademarkIds(
    args.selectedTrademarkIds,
    args.primaryTrademarkId,
  );

  if (!selectedIds.includes(args.primaryTrademarkId)) {
    throw new RenewalServiceError(
      createRenewalError(
        'invalid_request',
        'The selected trademarks must include the primary trademark.',
      ),
      400,
      args.correlationId,
    );
  }

  const selectedTrademarks = selectedIds
    .map((id) => lookup.get(id))
    .filter((trademark): trademark is RenewalTrademark => Boolean(trademark));

  if (selectedTrademarks.length !== selectedIds.length) {
    throw new RenewalServiceError(
      createRenewalError(
        'invalid_request',
        'One or more selected trademarks do not match this renewal.',
      ),
      400,
      args.correlationId,
    );
  }

  return selectedTrademarks;
}

function buildOrderDetails(orderId: string, sequence: number, selectedTrademarks: RenewalTrademark[]) {
  return {
    orderId,
    dealToken: `deal_tok_${sequence}`,
    currency: 'GBP',
    totals: {
      subtotal: RENEWAL_SUBTOTAL_PER_MARK * selectedTrademarks.length,
      vat: RENEWAL_VAT_PER_MARK * selectedTrademarks.length,
      total: RENEWAL_TOTAL_PER_MARK * selectedTrademarks.length,
    },
    trademarks: selectedTrademarks.map((trademark) => ({
      id: trademark.id,
      wordMark: trademark.wordMark,
      registrationNumber: trademark.registrationNumber ?? null,
      applicationNumber: trademark.applicationNumber ?? null,
      markType: trademark.markType ?? null,
      classesCount: trademark.classesCount ?? null,
    })),
    lineItems: selectedTrademarks.map((trademark, index) => ({
      orderLineId: formatEntityId('ol', sequence * 10 + index + 1),
      orderId,
      lineType: 'service_request',
      label: `IPO Renewal Fee - ${trademark.wordMark}`,
      quantity: 1,
      unitPrice: RENEWAL_SUBTOTAL_PER_MARK,
      total: RENEWAL_SUBTOTAL_PER_MARK,
      disposition: 'payable_now' as const,
      sourceRecordId: trademark.id,
    })),
  } satisfies RenewalOrderDetails;
}

function refreshStoredOrderPaymentState(
  stored: StoredRenewalOrder,
  nowMs = Date.now(),
) {
  if (!stored.payment || !stored.paymentCreatedAtMs) {
    return null;
  }

  const elapsedMs = Math.max(0, nowMs - stored.paymentCreatedAtMs);
  let nextStatus: PaymentSummary['status'] = 'initiated';

  if (elapsedMs >= 5000) {
    nextStatus = stored.paymentOutcome;
  } else if (elapsedMs >= 2000) {
    nextStatus = 'pending';
  }

  stored.payment.status = nextStatus;

  if (nextStatus === 'succeeded') {
    stored.order.status = 'confirmed';
    stored.confirmedAt ??= new Date(stored.paymentCreatedAtMs + 5000).toISOString();
    stored.order.confirmedAt ??= stored.confirmedAt;
  } else if (nextStatus === 'failed') {
    stored.order.status = 'failed';
  } else if (nextStatus === 'cancelled') {
    stored.order.status = 'cancelled';
  } else if (nextStatus === 'pending') {
    stored.order.status = 'pending_confirmation';
  }

  return {
    payment: { ...stored.payment },
    updatedAt:
      nextStatus === 'initiated'
        ? new Date(stored.paymentCreatedAtMs).toISOString()
        : nextStatus === 'pending'
          ? new Date(stored.paymentCreatedAtMs + 2000).toISOString()
          : new Date(stored.paymentCreatedAtMs + 5000).toISOString(),
  };
}

export function resetMockRenewalState() {
  mockOrders.clear();
  mockSequence = 122;
}

export async function getRenewalDetails(args: {
  token: string | null;
  origin: string;
  correlationId: string;
}): Promise<RenewalDetailsResponse> {
  assertRenewalsIntegration(args.correlationId);

  const token = resolveTokenOrThrow(args.token, args.correlationId);
  await simulateMockLatency();

  return getMockRenewalDetails(args.origin, token);
}

export async function createRenewalOrder(args: {
  body: unknown;
  origin: string;
  correlationId: string;
}): Promise<CreateRenewalOrderResponse> {
  assertRenewalsIntegration(args.correlationId);

  const parsed = validateCreateRenewalOrderRequest(args.body);

  if (!parsed.ok) {
    throw new RenewalServiceError(
      createRenewalError('invalid_request', parsed.message),
      400,
      args.correlationId,
    );
  }

  if (
    parsed.value.screening.ownershipChange ||
    parsed.value.screening.classesChange
  ) {
    throw new RenewalServiceError(
      createRenewalError(
        'self_serve_blocked',
        'This renewal needs specialist review. Please book a call to continue.',
      ),
      409,
      args.correlationId,
    );
  }

  const token = resolveTokenOrThrow(parsed.value.token, args.correlationId);
  const availableTrademarks = getAvailableTrademarks(args.origin, token);
  const selectedTrademarks = resolveSelectedTrademarks({
    availableTrademarks,
    primaryTrademarkId: parsed.value.selection.primaryTrademarkId,
    selectedTrademarkIds: parsed.value.selection.selectedTrademarkIds,
    correlationId: args.correlationId,
  });
  const sequence = nextSequence();
  const orderId = formatEntityId('ord', sequence);
  const createdAt = new Date().toISOString();
  const orderDetails = buildOrderDetails(orderId, sequence, selectedTrademarks);
  const order: OrderSummary = {
    orderId,
    kind: 'service_request',
    status: 'pending_checkout',
    currency: 'GBP',
    totalDueNow: orderDetails.totals.total,
    totalFollowUp: 0,
    createdAt,
    reference: formatReference('ORD', sequence),
  };
  const request: RequestSummary = {
    requestId: formatEntityId('req', sequence),
    requestType: 'renewal',
    status: 'submitted',
    summary: `Renewal request for ${selectedTrademarks.length} ${pluralizeTrademark(selectedTrademarks.length)}`,
    createdAt,
    updatedAt: createdAt,
    orderId,
    reference: formatReference('REN', sequence),
  };

  mockOrders.set(orderId, {
    token,
    request,
    order,
    orderDetails,
    payment: null,
    paymentUrl: null,
    paymentCreatedAtMs: null,
    paymentOutcome: resolveMockRenewalPaymentOutcome(token),
    confirmedAt: null,
  });

  await simulateMockLatency();

  return {
    request: { ...request },
    order: { ...order },
    orderDetails: {
      ...orderDetails,
      totals: { ...orderDetails.totals },
      trademarks: orderDetails.trademarks.map((item) => ({ ...item })),
      lineItems: orderDetails.lineItems.map((item) => ({ ...item })),
    },
  };
}

export async function getRenewalOrder(args: {
  orderId: string;
  correlationId: string;
  nowMs?: number;
}): Promise<RenewalOrderResponse> {
  assertRenewalsIntegration(args.correlationId);

  const stored = getStoredOrder(args.orderId, args.correlationId);
  const paymentState = refreshStoredOrderPaymentState(stored, args.nowMs);

  await simulateMockLatency();

  return {
    request: { ...stored.request },
    order: { ...stored.order },
    orderDetails: {
      ...stored.orderDetails,
      totals: { ...stored.orderDetails.totals },
      trademarks: stored.orderDetails.trademarks.map((item) => ({ ...item })),
      lineItems: stored.orderDetails.lineItems.map((item) => ({ ...item })),
    },
    payment: paymentState?.payment ?? (stored.payment ? { ...stored.payment } : null),
  };
}

export async function createRenewalPaymentLink(args: {
  orderId: string;
  body: unknown;
  origin: string;
  correlationId: string;
  nowMs?: number;
}): Promise<CreateRenewalPaymentLinkResponse> {
  assertRenewalsIntegration(args.correlationId);

  const parsed = validateRenewalPaymentLinkRequest(args.body);

  if (!parsed.ok) {
    throw new RenewalServiceError(
      createRenewalError('terms_required', parsed.message),
      400,
      args.correlationId,
    );
  }

  const stored = getStoredOrder(args.orderId, args.correlationId);

  if (!stored.payment) {
    const sequence = Number.parseInt(stored.order.orderId.replace(/\D/g, ''), 10);
    const createdAt = args.nowMs ?? Date.now();
    stored.payment = {
      paymentId: formatEntityId('pay', sequence),
      orderId: stored.order.orderId,
      provider: 'xero',
      status: 'initiated',
      amount: stored.order.totalDueNow,
      currency: stored.order.currency,
      reference: formatReference('PAY', sequence),
    };
    stored.paymentCreatedAtMs = createdAt;
    stored.paymentUrl = `${args.origin}/renewal/mock-payment?orderId=${encodeURIComponent(stored.order.orderId)}`;
    stored.order.status = 'pending_confirmation';
  }

  const paymentState = refreshStoredOrderPaymentState(stored, args.nowMs);
  await simulateMockLatency();

  return {
    orderId: stored.order.orderId,
    dealToken: stored.orderDetails.dealToken,
    paymentUrl: stored.paymentUrl ?? `${args.origin}/renewal/mock-payment`,
    payment: paymentState?.payment ?? { ...stored.payment! },
  };
}

export async function getRenewalPaymentStatus(args: {
  orderId: string;
  correlationId: string;
  nowMs?: number;
}): Promise<RenewalPaymentStatusResponse> {
  assertRenewalsIntegration(args.correlationId);

  const stored = getStoredOrder(args.orderId, args.correlationId);

  if (!stored.payment) {
    throw new RenewalServiceError(
      createRenewalError(
        'invalid_request',
        'Payment has not been started for this renewal order yet.',
      ),
      409,
      args.correlationId,
    );
  }

  const paymentState = refreshStoredOrderPaymentState(stored, args.nowMs);
  await simulateMockLatency();

  return {
    orderId: stored.order.orderId,
    paymentId: stored.payment.paymentId,
    status: paymentState?.payment.status ?? stored.payment.status,
    updatedAt: paymentState?.updatedAt ?? null,
  };
}

export async function getRenewalConfirmation(args: {
  orderId: string;
  correlationId: string;
  nowMs?: number;
}): Promise<RenewalConfirmationResponse> {
  assertRenewalsIntegration(args.correlationId);

  const stored = getStoredOrder(args.orderId, args.correlationId);

  if (!stored.payment) {
    throw new RenewalServiceError(
      createRenewalError(
        'invalid_request',
        'Payment confirmation is not available until payment has started.',
      ),
      409,
      args.correlationId,
    );
  }

  const paymentState = refreshStoredOrderPaymentState(stored, args.nowMs);
  await simulateMockLatency();

  return {
    orderId: stored.order.orderId,
    requestId: stored.request.requestId,
    paymentStatus: paymentState?.payment.status ?? stored.payment.status,
    confirmedAt: stored.confirmedAt,
    reference: stored.order.reference,
  };
}
