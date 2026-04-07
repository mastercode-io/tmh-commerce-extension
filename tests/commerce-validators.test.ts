import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isCommerceAccountSummary,
  isCustomerSummary,
  isOrderSummary,
  isPaymentSummary,
  isRequestSummary,
  isSubscriptionSummary,
} from '../lib/commerce/validators.ts';

const customer = {
  customerId: 'cust_123',
  fullName: 'Amelia Carter',
  email: 'amelia@example.com',
};

const order = {
  orderId: 'order_123',
  kind: 'subscription',
  status: 'pending_checkout',
  currency: 'GBP',
  totalDueNow: 240,
  createdAt: '2026-04-07T10:00:00.000Z',
  reference: 'TMH-MON-ABC123',
};

const subscription = {
  subscriptionId: 'sub_123',
  orderId: 'order_123',
  provider: 'xero_gateway',
  planFamily: 'monitoring',
  billingInterval: 'annual',
  status: 'pending_checkout',
  cancelAtPeriodEnd: false,
  reference: 'TMH-MON-ABC123',
};

const payment = {
  paymentId: 'pay_123',
  orderId: 'order_123',
  provider: 'xero_gateway',
  status: 'initiated',
  amount: 240,
  currency: 'GBP',
  reference: 'TMH-MON-ABC123',
};

const request = {
  requestId: 'req_123',
  requestType: 'support',
  status: 'submitted',
  summary: 'Please call me back',
  createdAt: '2026-04-07T10:00:00.000Z',
  updatedAt: '2026-04-07T10:00:00.000Z',
  reference: 'TMH-REQ-ABC123',
};

describe('commerce validators', () => {
  it('accepts valid normalized commerce summary objects', () => {
    assert.equal(isCustomerSummary(customer), true);
    assert.equal(isOrderSummary(order), true);
    assert.equal(isSubscriptionSummary(subscription), true);
    assert.equal(isPaymentSummary(payment), true);
    assert.equal(isRequestSummary(request), true);
    assert.equal(
      isCommerceAccountSummary({
        customer,
        orders: [order],
        subscriptions: [subscription],
        payments: [payment],
        requests: [request],
      }),
      true,
    );
  });

  it('rejects missing or malformed required fields', () => {
    assert.equal(isCustomerSummary(null), false);
    assert.equal(isCustomerSummary({ ...customer, email: undefined }), false);
    assert.equal(isOrderSummary({ ...order, totalDueNow: '240' }), false);
    assert.equal(
      isSubscriptionSummary({ ...subscription, cancelAtPeriodEnd: 'false' }),
      false,
    );
    assert.equal(isPaymentSummary({ ...payment, amount: '240' }), false);
    assert.equal(isRequestSummary({ ...request, reference: undefined }), false);
    assert.equal(
      isCommerceAccountSummary({
        customer,
        orders: [order],
        subscriptions: [subscription],
        payments: [payment],
        requests: [{ ...request, requestId: undefined }],
      }),
      false,
    );
  });
});

