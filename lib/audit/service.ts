import type {
  AuditConfirmationResponse,
  AuditLeadResponse,
  AuditOrderResponse,
  AuditSectionName,
  CreateAuditPaymentResponse,
  UpdateAuditSectionResponse,
} from '../../features/audit/lib/types.ts';
import type { PaymentSummary, RequestSummary } from '../commerce/types.ts';
import { assertAuditIntegration } from './config.ts';
import { createAuditError, AuditServiceError } from './errors.ts';
import {
  DEMO_AUDIT_TOKEN,
  getMockAuditOrderTemplate,
  resolveAuditToken,
  searchMockTemmy,
  shouldCreateAuditOrderForSection,
  simulateMockLatency,
} from './mock-data.ts';
import {
  validateAuditLeadRequest,
  validateCreateAuditPaymentRequest,
  validateTemmySearchRequest,
  validateUpdateAuditSectionRequest,
} from './validators.ts';

type StoredAuditOrder = {
  token: string;
  request: RequestSummary;
  order: AuditOrderResponse;
  paymentOutcome: Extract<PaymentSummary['status'], 'succeeded' | 'failed' | 'cancelled'>;
  paymentStartedAtMs: number | null;
  confirmedAt: string | null;
};

const mockAuditOrders = new Map<string, StoredAuditOrder>();
const tokenToOrderId = new Map<string, string>();

let mockSequence = 122;

function nextSequence() {
  mockSequence += 1;
  return mockSequence;
}

function cloneAuditOrder(order: AuditOrderResponse): AuditOrderResponse {
  return structuredClone(order);
}

function formatEntityId(prefix: string, sequence: number) {
  return `${prefix}_${String(sequence).padStart(6, '0')}`;
}

function formatAuditOrderId(sequence: number) {
  return `aud_ord_${String(sequence).padStart(6, '0')}`;
}

function formatReference(prefix: string, sequence: number) {
  return `TMH-AUD-${prefix}-${String(sequence).padStart(6, '0')}`;
}

function resolveTokenOrThrow(token: string | null, correlationId: string) {
  const result = resolveAuditToken(token);

  if (!result.ok) {
    throw new AuditServiceError(result.error, result.status, correlationId);
  }

  return result.token;
}

function getStoredOrderById(orderId: string, correlationId: string) {
  const stored = mockAuditOrders.get(orderId);

  if (!stored) {
    throw new AuditServiceError(
      createAuditError('not_found', 'We could not find this audit order.'),
      404,
      correlationId,
    );
  }

  return stored;
}

function getStoredOrderByToken(token: string, correlationId: string) {
  const orderId = tokenToOrderId.get(token);

  if (!orderId) {
    throw new AuditServiceError(
      createAuditError('not_found', 'We could not find this audit order.'),
      404,
      correlationId,
    );
  }

  return getStoredOrderById(orderId, correlationId);
}

function createAuditRequest(sequence: number, createdAt: string): RequestSummary {
  return {
    requestId: formatEntityId('req', sequence),
    requestType: 'audit',
    status: 'submitted',
    summary: 'Trademark audit request',
    createdAt,
    updatedAt: createdAt,
    reference: formatReference('REQ', sequence),
  };
}

function createAuditOrder(sequence: number, createdAt: string, request: RequestSummary): AuditOrderResponse {
  const orderId = formatAuditOrderId(sequence);
  const template = getMockAuditOrderTemplate();

  return {
    orderId,
    dealId: template.dealId,
    status: template.status,
    currency: template.currency,
    createdAt,
    updatedAt: createdAt,
    request: {
      ...request,
      orderId,
      updatedAt: createdAt,
    },
    sections: structuredClone(template.sections),
    pricing: structuredClone(template.pricing),
    payment: template.payment ? { ...template.payment } : null,
  };
}

function refreshStoredAuditPaymentState(
  stored: StoredAuditOrder,
  nowMs = Date.now(),
) {
  if (!stored.order.payment || !stored.paymentStartedAtMs) {
    return null;
  }

  const elapsedMs = Math.max(0, nowMs - stored.paymentStartedAtMs);
  let status: PaymentSummary['status'] = 'initiated';

  if (elapsedMs >= 5000) {
    status = stored.paymentOutcome;
  } else if (elapsedMs >= 2000) {
    status = 'pending';
  }

  stored.order.payment.status = status;

  if (status === 'succeeded') {
    stored.order.status = 'confirmed';
    stored.confirmedAt ??= new Date(stored.paymentStartedAtMs + 5000).toISOString();
  } else if (status === 'failed') {
    stored.order.status = 'failed';
  } else if (status === 'cancelled') {
    stored.order.status = 'cancelled';
  } else if (status === 'pending') {
    stored.order.status = 'pending_confirmation';
  }

  stored.order.updatedAt = new Date(nowMs).toISOString();
  if (stored.order.request) {
    stored.order.request.updatedAt = stored.order.updatedAt;
  }

  return {
    payment: { ...stored.order.payment },
    updatedAt:
      status === 'initiated'
        ? new Date(stored.paymentStartedAtMs).toISOString()
        : status === 'pending'
          ? new Date(stored.paymentStartedAtMs + 2000).toISOString()
          : new Date(stored.paymentStartedAtMs + 5000).toISOString(),
  };
}

export function resetMockAuditState() {
  mockAuditOrders.clear();
  tokenToOrderId.clear();
  mockSequence = 122;
}

export async function upsertAuditLead(args: {
  body: unknown;
  correlationId: string;
}): Promise<AuditLeadResponse> {
  assertAuditIntegration(args.correlationId);

  const parsed = validateAuditLeadRequest(args.body);

  if (!parsed.ok) {
    throw new AuditServiceError(
      createAuditError('invalid_request', parsed.message),
      400,
      args.correlationId,
    );
  }

  const token = parsed.value.token?.trim() || DEMO_AUDIT_TOKEN;
  const existingOrderId = tokenToOrderId.get(token);

  if (existingOrderId) {
    const stored = getStoredOrderById(existingOrderId, args.correlationId);
    stored.order.sections.contact = { ...parsed.value.lead };
    stored.order.updatedAt = new Date().toISOString();
    if (stored.order.request) {
      stored.order.request.updatedAt = stored.order.updatedAt;
    }

    await simulateMockLatency();

    return {
      token,
      lead: { ...parsed.value.lead },
      request: stored.order.request ? { ...stored.order.request } : undefined,
    };
  }

  const createdAt = new Date().toISOString();
  const sequence = nextSequence();
  const request = createAuditRequest(sequence, createdAt);

  await simulateMockLatency();

  return {
    token,
    lead: { ...parsed.value.lead },
    request,
  };
}

export async function saveAuditSection(args: {
  body: unknown;
  correlationId: string;
}): Promise<UpdateAuditSectionResponse> {
  assertAuditIntegration(args.correlationId);

  const parsed = validateUpdateAuditSectionRequest(args.body);

  if (!parsed.ok) {
    throw new AuditServiceError(
      createAuditError('invalid_request', parsed.message),
      400,
      args.correlationId,
    );
  }

  const payload = parsed.value;
  const token = resolveTokenOrThrow(payload.token ?? DEMO_AUDIT_TOKEN, args.correlationId);

  let stored: StoredAuditOrder | null = null;

  if (payload.orderId) {
    stored = getStoredOrderById(payload.orderId, args.correlationId);
  } else if (tokenToOrderId.has(token)) {
    stored = getStoredOrderByToken(token, args.correlationId);
  } else if (shouldCreateAuditOrderForSection(payload.section)) {
    const createdAt = new Date().toISOString();
    const sequence = nextSequence();
    const request = createAuditRequest(sequence, createdAt);
    const order = createAuditOrder(sequence, createdAt, request);

    stored = {
      token,
      request,
      order,
      paymentOutcome: 'succeeded',
      paymentStartedAtMs: null,
      confirmedAt: null,
    };

    mockAuditOrders.set(order.orderId, stored);
    tokenToOrderId.set(token, order.orderId);
  } else {
    throw new AuditServiceError(
      createAuditError(
        'invalid_request',
        'Start the audit by saving the contact section first.',
      ),
      409,
      args.correlationId,
    );
  }

  stored.order.sections[payload.section as AuditSectionName] = structuredClone(
    payload.data,
  ) as never;
  stored.order.updatedAt = new Date().toISOString();
  if (stored.order.request) {
    stored.order.request.updatedAt = stored.order.updatedAt;
  }

  await simulateMockLatency();

  return {
    orderId: stored.order.orderId,
    success: true,
    message: 'Section saved successfully',
    orderStatus: stored.order.status,
  };
}

export async function getAuditOrder(args: {
  orderId: string;
  correlationId: string;
  nowMs?: number;
}): Promise<AuditOrderResponse> {
  assertAuditIntegration(args.correlationId);

  const stored = getStoredOrderById(args.orderId, args.correlationId);
  refreshStoredAuditPaymentState(stored, args.nowMs);
  await simulateMockLatency();

  return cloneAuditOrder(stored.order);
}

export async function createAuditPayment(args: {
  orderId: string;
  body: unknown;
  origin: string;
  correlationId: string;
  nowMs?: number;
}): Promise<CreateAuditPaymentResponse> {
  assertAuditIntegration(args.correlationId);

  const parsed = validateCreateAuditPaymentRequest(args.body);

  if (!parsed.ok) {
    throw new AuditServiceError(
      createAuditError('terms_required', parsed.message),
      400,
      args.correlationId,
    );
  }

  const stored = getStoredOrderById(args.orderId, args.correlationId);
  const sequence = Number.parseInt(stored.order.orderId.replace(/\D/g, ''), 10);

  if (!stored.order.payment) {
    stored.order.payment = {
      paymentId: formatEntityId('pay', sequence),
      orderId: stored.order.orderId,
      provider: 'xero',
      status: 'initiated',
      amount: stored.order.pricing.total,
      currency: stored.order.currency,
      reference: formatReference('PAY', sequence),
    };
  }

  stored.order.status = 'pending_checkout';
  stored.paymentStartedAtMs = args.nowMs ?? Date.now();
  stored.order.updatedAt = new Date(stored.paymentStartedAtMs).toISOString();
  if (stored.order.request) {
    stored.order.request.updatedAt = stored.order.updatedAt;
  }

  await simulateMockLatency();

  return {
    orderId: stored.order.orderId,
    checkoutUrl: `${args.origin}/audit/mock-payment?orderId=${encodeURIComponent(stored.order.orderId)}`,
    order: {
      orderId: stored.order.orderId,
      kind: 'service_request',
      status: 'pending_checkout',
      currency: 'GBP',
      totalDueNow: stored.order.pricing.total,
      createdAt: stored.order.createdAt,
      reference: formatReference('ORD', sequence),
    },
    payment: { ...stored.order.payment },
  };
}

export async function getAuditConfirmation(args: {
  orderId: string;
  correlationId: string;
  nowMs?: number;
}): Promise<AuditConfirmationResponse> {
  assertAuditIntegration(args.correlationId);

  const stored = getStoredOrderById(args.orderId, args.correlationId);
  refreshStoredAuditPaymentState(stored, args.nowMs);
  await simulateMockLatency();

  return {
    orderId: stored.order.orderId,
    paymentStatus: stored.order.payment?.status ?? 'initiated',
    confirmedAt: stored.confirmedAt,
    reference: stored.order.request?.reference ?? null,
  };
}

export async function searchTemmy(args: {
  body: unknown;
  correlationId: string;
}) {
  assertAuditIntegration(args.correlationId);

  const parsed = validateTemmySearchRequest(args.body);

  if (!parsed.ok) {
    throw new AuditServiceError(
      createAuditError('invalid_request', parsed.message),
      400,
      args.correlationId,
    );
  }

  await simulateMockLatency();

  return searchMockTemmy({
    applicationNumber: parsed.value.application_number,
    text: parsed.value.text,
  });
}
