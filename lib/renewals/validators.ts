import type { CreateRenewalOrderRequest } from '../../features/renewals/lib/types.ts';

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

export function validateCreateRenewalOrderRequest(
  value: unknown,
): ValidationResult<CreateRenewalOrderRequest> {
  if (!isRecord(value)) {
    return {
      ok: false,
      message: 'Renewal order payload is required.',
    };
  }

  if (!isNonEmptyString(value.token)) {
    return {
      ok: false,
      message: 'A renewal token is required.',
    };
  }

  if (!isNonEmptyString(value.source)) {
    return {
      ok: false,
      message: 'A renewal source is required.',
    };
  }

  if (!isRecord(value.contact)) {
    return {
      ok: false,
      message: 'Contact details are required.',
    };
  }

  if (
    !isNonEmptyString(value.contact.firstName) ||
    !isNonEmptyString(value.contact.lastName) ||
    !isEmail(value.contact.email) ||
    !isNonEmptyString(value.contact.phone)
  ) {
    return {
      ok: false,
      message:
        'Contact first name, last name, valid email address, and phone are required.',
    };
  }

  if (!isRecord(value.screening)) {
    return {
      ok: false,
      message: 'Renewal screening answers are required.',
    };
  }

  if (
    typeof value.screening.ownershipChange !== 'boolean' ||
    typeof value.screening.classesChange !== 'boolean'
  ) {
    return {
      ok: false,
      message: 'Both renewal screening answers are required.',
    };
  }

  if (!isRecord(value.selection)) {
    return {
      ok: false,
      message: 'Trademark selection is required.',
    };
  }

  if (
    !isNonEmptyString(value.selection.primaryTrademarkId) ||
    !Array.isArray(value.selection.selectedTrademarkIds) ||
    value.selection.selectedTrademarkIds.length < 1 ||
    value.selection.selectedTrademarkIds.some((item) => !isNonEmptyString(item))
  ) {
    return {
      ok: false,
      message:
        'A primary trademark and at least one selected trademark are required.',
    };
  }

  if (!isRecord(value.consents)) {
    return {
      ok: false,
      message: 'Renewal consents are required.',
    };
  }

  if (value.consents.authorisedToRenew !== true) {
    return {
      ok: false,
      message: 'Authorisation to renew is required.',
    };
  }

  if (value.consents.contactConsent !== true) {
    return {
      ok: false,
      message: 'Contact consent is required.',
    };
  }

  return {
    ok: true,
    value: value as unknown as CreateRenewalOrderRequest,
  };
}

export function validateRenewalPaymentLinkRequest(
  value: unknown,
): ValidationResult<{ termsAccepted: true }> {
  if (!isRecord(value) || value.termsAccepted !== true) {
    return {
      ok: false,
      message: 'Terms must be accepted before payment can start.',
    };
  }

  return {
    ok: true,
    value: { termsAccepted: true },
  };
}
