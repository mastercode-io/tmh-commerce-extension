import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';

import {
  createRenewalOrder,
  createRenewalPaymentLink,
  getRenewalConfirmation,
  getRenewalOrder,
  getRenewalPaymentStatus,
  resetMockRenewalState,
} from '../lib/renewals/service.ts';
import { RenewalServiceError } from '../lib/renewals/errors.ts';

const correlationId = 'corr_test';
const origin = 'https://portal.example.com';

function createValidPayload(token = 'tok_123') {
  return {
    token,
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
  };
}

describe('renewal service', () => {
  beforeEach(() => {
    resetMockRenewalState();
  });

  it('creates a multi-renewal order and returns stable order details', async () => {
    const created = await createRenewalOrder({
      body: createValidPayload(),
      origin,
      correlationId,
    });
    const order = await getRenewalOrder({
      orderId: created.order.orderId,
      correlationId,
    });

    assert.equal(created.order.status, 'pending_checkout');
    assert.equal(created.orderDetails.trademarks.length, 2);
    assert.equal(order.order.orderId, created.order.orderId);
    assert.equal(order.orderDetails.totals.total, 1824);
    assert.equal(order.request?.requestType, 'renewal');
  });

  it('blocks self-serve renewal when screening flags require specialist help', async () => {
    await assert.rejects(
      () =>
        createRenewalOrder({
          body: {
            ...createValidPayload(),
            screening: {
              ownershipChange: true,
              classesChange: false,
            },
          },
          origin,
          correlationId,
        }),
      (error: unknown) => {
        assert.ok(error instanceof RenewalServiceError);
        assert.equal(error.status, 409);
        assert.equal(error.response.code, 'self_serve_blocked');
        return true;
      },
    );
  });

  it('progresses payment from initiated to pending to succeeded and confirms the order', async () => {
    const created = await createRenewalOrder({
      body: createValidPayload(),
      origin,
      correlationId,
    });
    const startTime = Date.parse('2026-04-12T10:00:00.000Z');

    const paymentLink = await createRenewalPaymentLink({
      orderId: created.order.orderId,
      body: { termsAccepted: true },
      origin,
      correlationId,
      nowMs: startTime,
    });
    const pendingStatus = await getRenewalPaymentStatus({
      orderId: created.order.orderId,
      correlationId,
      nowMs: startTime + 2500,
    });
    const finalStatus = await getRenewalPaymentStatus({
      orderId: created.order.orderId,
      correlationId,
      nowMs: startTime + 6000,
    });
    const confirmation = await getRenewalConfirmation({
      orderId: created.order.orderId,
      correlationId,
      nowMs: startTime + 6000,
    });

    assert.match(paymentLink.paymentUrl, /renewal\/mock-payment/);
    assert.equal(paymentLink.payment.status, 'initiated');
    assert.equal(pendingStatus.status, 'pending');
    assert.equal(finalStatus.status, 'succeeded');
    assert.equal(confirmation.paymentStatus, 'succeeded');
    assert.ok(confirmation.confirmedAt);
  });
});
