import type { RequestType } from '@/lib/commerce/types';

const VALID_REQUEST_TYPES = new Set<RequestType>([
  'audit',
  'renewal',
  'application',
  'support',
]);

export type CreateCommerceRequestPayload = {
  customerId?: string;
  email?: string;
  requestType: RequestType;
  summary: string;
  details?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isRequestType(value: unknown): value is RequestType {
  return typeof value === 'string' && VALID_REQUEST_TYPES.has(value as RequestType);
}

export function isCreateCommerceRequestPayload(
  value: unknown,
): value is CreateCommerceRequestPayload {
  if (!isRecord(value)) {
    return false;
  }

  const hasCustomerIdentity =
    (typeof value.customerId === 'string' && value.customerId.trim().length > 0) ||
    (typeof value.email === 'string' && value.email.trim().length > 0);

  return (
    hasCustomerIdentity &&
    isRequestType(value.requestType) &&
    typeof value.summary === 'string' &&
    value.summary.trim().length > 0 &&
    (value.details === undefined || isRecord(value.details))
  );
}
