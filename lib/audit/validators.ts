import type {
  AuditLeadRequest,
  AuditSectionName,
  CreateAuditPaymentRequest,
  UpdateAuditSectionRequest,
} from '../../features/audit/lib/types.ts';

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isEmail(value: unknown) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value as string).trim());
}

function isAuditSectionName(value: unknown): value is AuditSectionName {
  return (
    typeof value === 'string' &&
    [
      'contact',
      'preferences',
      'tmStatus',
      'temmy',
      'tmInfo',
      'goods',
      'billing',
      'appointment',
      'paymentOptions',
    ].includes(value)
  );
}

export function validateAuditLeadRequest(
  value: unknown,
): ValidationResult<AuditLeadRequest> {
  if (!isRecord(value) || !isRecord(value.lead)) {
    return {
      ok: false,
      message: 'Lead contact details are required.',
    };
  }

  if (
    !isNonEmptyString(value.lead.firstName) ||
    !isNonEmptyString(value.lead.lastName) ||
    !isEmail(value.lead.email) ||
    !isNonEmptyString(value.lead.phone)
  ) {
    return {
      ok: false,
      message:
        'Lead first name, last name, valid email address, and phone are required.',
    };
  }

  return {
    ok: true,
    value: value as unknown as AuditLeadRequest,
  };
}

export function validateUpdateAuditSectionRequest(
  value: unknown,
): ValidationResult<UpdateAuditSectionRequest> {
  if (!isRecord(value) || !isAuditSectionName(value.section) || !isRecord(value.data)) {
    return {
      ok: false,
      message: 'Audit section name and data are required.',
    };
  }

  if (
    value.orderId !== undefined &&
    value.orderId !== null &&
    !isNonEmptyString(value.orderId)
  ) {
    return {
      ok: false,
      message: 'Order ID must be a non-empty string when provided.',
    };
  }

  if (
    value.token !== undefined &&
    value.token !== null &&
    !isNonEmptyString(value.token)
  ) {
    return {
      ok: false,
      message: 'Token must be a non-empty string when provided.',
    };
  }

  if (
    value.section === 'preferences' &&
    (!Array.isArray(value.data.methods) || value.data.methods.length < 1)
  ) {
    return {
      ok: false,
      message: 'At least one contact method must be selected.',
    };
  }

  if (value.section === 'tmStatus') {
    if (!isNonEmptyString(value.data.status)) {
      return {
        ok: false,
        message: 'Trademark status is required.',
      };
    }

    if (
      value.data.status === 'existing' &&
      !isNonEmptyString(value.data.tmAppNumber) &&
      !isNonEmptyString(value.data.tmName)
    ) {
      return {
        ok: false,
        message: 'Existing trademark searches need an application number or name.',
      };
    }

    if (
      value.data.status === 'new' &&
      !isNonEmptyString(value.data.tmName)
    ) {
      return {
        ok: false,
        message: 'A trademark name is required for a new trademark audit.',
      };
    }
  }

  if (value.section === 'billing') {
    if (
      !isNonEmptyString(value.data.type) ||
      !isRecord(value.data.address) ||
      !isNonEmptyString(value.data.address.line1) ||
      !isNonEmptyString(value.data.address.city) ||
      !isNonEmptyString(value.data.address.postcode) ||
      !isEmail(value.data.invoiceEmail) ||
      !isNonEmptyString(value.data.invoicePhone)
    ) {
      return {
        ok: false,
        message: 'Billing type, address, invoice email, and invoice phone are required.',
      };
    }
  }

  return {
    ok: true,
    value: value as unknown as UpdateAuditSectionRequest,
  };
}

export function validateCreateAuditPaymentRequest(
  value: unknown,
): ValidationResult<CreateAuditPaymentRequest> {
  if (
    !isRecord(value) ||
    !isRecord(value.paymentOptions) ||
    value.paymentOptions.termsAccepted !== true
  ) {
    return {
      ok: false,
      message: 'Terms must be accepted before payment can start.',
    };
  }

  return {
    ok: true,
    value: value as unknown as CreateAuditPaymentRequest,
  };
}

export function validateTemmySearchRequest(
  value: unknown,
): ValidationResult<{ application_number?: string; text?: string }> {
  if (!isRecord(value)) {
    return {
      ok: false,
      message: 'A Temmy search payload is required.',
    };
  }

  const applicationNumber = isNonEmptyString(value.application_number)
    ? String(value.application_number).trim()
    : undefined;
  const text = isNonEmptyString(value.text) ? String(value.text).trim() : undefined;

  if (!applicationNumber && !text) {
    return {
      ok: false,
      message: 'Temmy search requires an application number or text query.',
    };
  }

  return {
    ok: true,
    value: {
      ...(applicationNumber ? { application_number: applicationNumber } : {}),
      ...(text ? { text } : {}),
    },
  };
}
