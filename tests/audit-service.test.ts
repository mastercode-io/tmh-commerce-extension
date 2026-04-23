import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  createAuditPayment,
  getAuditConfirmation,
  getAuditOrder,
  resetMockAuditState,
  saveAuditSection,
  searchTemmy,
  upsertAuditLead,
} from '../lib/audit/service.ts';
import { AuditServiceError } from '../lib/audit/errors.ts';

const correlationId = 'corr_audit_test';
const origin = 'https://portal.example.com';

describe('audit service', () => {
  beforeEach(() => {
    resetMockAuditState();
  });

  it('upserts lead and creates order on first contact section save', async () => {
    const lead = await upsertAuditLead({
      body: {
        lead: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+44 7700 900000',
        },
      },
      correlationId,
    });
    const sectionSave = await saveAuditSection({
      body: {
        token: lead.token,
        section: 'contact',
        data: lead.lead,
      },
      correlationId,
    });
    const order = await getAuditOrder({
      orderId: sectionSave.orderId,
      correlationId,
    });

    assert.equal(lead.token, 'lead_tok_123');
    assert.equal(sectionSave.success, true);
    assert.equal(order.sections.contact?.email, 'jane@example.com');
    assert.equal(order.request?.requestType, 'audit');
  });

  it('saves sections and returns validation errors for invalid updates', async () => {
    const lead = await upsertAuditLead({
      body: {
        lead: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+44 7700 900000',
        },
      },
      correlationId,
    });
    const contactSave = await saveAuditSection({
      body: {
        token: lead.token,
        section: 'contact',
        data: lead.lead,
      },
      correlationId,
    });

    const preferencesSave = await saveAuditSection({
      body: {
        orderId: contactSave.orderId,
        token: lead.token,
        section: 'preferences',
        data: { methods: ['Email', 'Phone'] },
      },
      correlationId,
    });

    assert.equal(preferencesSave.success, true);

    await assert.rejects(
      () =>
        saveAuditSection({
          body: {
            orderId: contactSave.orderId,
            token: lead.token,
            section: 'preferences',
            data: { methods: [] },
          },
          correlationId,
        }),
      (error: unknown) => {
        assert.ok(error instanceof AuditServiceError);
        assert.equal(error.status, 400);
        return true;
      },
    );
  });

  it('creates payment, advances status, and returns confirmation', async () => {
    const lead = await upsertAuditLead({
      body: {
        lead: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+44 7700 900000',
        },
      },
      correlationId,
    });
    const contactSave = await saveAuditSection({
      body: {
        token: lead.token,
        section: 'contact',
        data: lead.lead,
      },
      correlationId,
    });
    const startTime = Date.parse('2026-04-13T10:00:00.000Z');

    const payment = await createAuditPayment({
      orderId: contactSave.orderId,
      body: { paymentOptions: { termsAccepted: true } },
      origin,
      correlationId,
      nowMs: startTime,
    });
    const pendingOrder = await getAuditOrder({
      orderId: contactSave.orderId,
      correlationId,
      nowMs: startTime + 2500,
    });
    const confirmation = await getAuditConfirmation({
      orderId: contactSave.orderId,
      correlationId,
      nowMs: startTime + 6000,
    });

    assert.match(payment.checkoutUrl, /audit\/mock-payment/);
    assert.equal(payment.payment.status, 'initiated');
    assert.equal(pendingOrder.payment?.status, 'pending');
    assert.equal(confirmation.paymentStatus, 'succeeded');
    assert.ok(confirmation.confirmedAt);
  });

  it('returns Temmy matches for application number and name search', async () => {
    const numberResults = await searchTemmy({
      body: { application_number: 'UK00003456789' },
      correlationId,
    });
    const textResults = await searchTemmy({
      body: { text: 'techify' },
      correlationId,
    });

    assert.equal(numberResults.data.items.length, 1);
    assert.equal(textResults.data.items.length, 2);
  });
});
