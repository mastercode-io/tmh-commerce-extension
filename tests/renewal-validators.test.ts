import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  validateCreateRenewalOrderRequest,
  validateRenewalPaymentLinkRequest,
} from '../lib/renewals/validators.ts';

describe('renewal validators', () => {
  it('accepts a valid create-order payload', () => {
    const result = validateCreateRenewalOrderRequest({
      token: 'tok_123',
      source: 'renewal-landing',
      contact: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techinnovations.com',
        phone: '+44 7700 900123',
      },
      screening: {
        ownershipChange: false,
        classesChange: false,
      },
      selection: {
        primaryTrademarkId: 'tm_001',
        selectedTrademarkIds: ['tm_001', 'tm_002'],
      },
      consents: {
        authorisedToRenew: true,
        contactConsent: true,
      },
    });

    assert.equal(result.ok, true);
  });

  it('rejects incomplete create-order payloads', () => {
    const result = validateCreateRenewalOrderRequest({
      token: 'tok_123',
      source: 'renewal-landing',
      contact: {
        firstName: 'Sarah',
        lastName: '',
        email: 'not-an-email',
        phone: '',
      },
      screening: {
        ownershipChange: false,
        classesChange: false,
      },
      selection: {
        primaryTrademarkId: 'tm_001',
        selectedTrademarkIds: [],
      },
      consents: {
        authorisedToRenew: true,
        contactConsent: false,
      },
    });

    assert.equal(result.ok, false);
    assert.match(result.message, /Contact first name/);
  });

  it('requires accepted terms before payment link creation', () => {
    const invalidResult = validateRenewalPaymentLinkRequest({
      termsAccepted: false,
    });
    const validResult = validateRenewalPaymentLinkRequest({
      termsAccepted: true,
    });

    assert.equal(invalidResult.ok, false);
    assert.equal(validResult.ok, true);
  });
});
