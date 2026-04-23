import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  validateAuditLeadRequest,
  validateCreateAuditPaymentRequest,
  validateTemmySearchRequest,
  validateUpdateAuditSectionRequest,
} from '../lib/audit/validators.ts';

describe('audit validators', () => {
  it('accepts a valid lead payload', () => {
    const result = validateAuditLeadRequest({
      lead: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '+44 7700 900000',
      },
    });

    assert.equal(result.ok, true);
  });

  it('rejects invalid billing section payloads', () => {
    const result = validateUpdateAuditSectionRequest({
      token: 'lead_tok_123',
      section: 'billing',
      data: {
        type: 'Organisation',
        address: {
          line1: '',
          city: '',
          postcode: '',
        },
        invoiceEmail: 'not-an-email',
        invoicePhone: '',
      },
    });

    assert.equal(result.ok, false);
    assert.match(result.message, /Billing type/);
  });

  it('requires accepted terms for payment', () => {
    assert.equal(
      validateCreateAuditPaymentRequest({
        paymentOptions: { termsAccepted: true },
      }).ok,
      true,
    );
    assert.equal(
      validateCreateAuditPaymentRequest({
        paymentOptions: { termsAccepted: false },
      }).ok,
      false,
    );
  });

  it('requires a Temmy query', () => {
    assert.equal(validateTemmySearchRequest({}).ok, false);
    assert.equal(
      validateTemmySearchRequest({ application_number: 'UK00003456789' }).ok,
      true,
    );
  });
});
