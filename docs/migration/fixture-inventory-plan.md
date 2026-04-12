# Fixture Inventory Plan

This document defines the minimum fixture set required to begin implementation and testing in `tmh-commerce-extension`.

It operationalizes tracker item `S4`.

## 1. Fixture Goals

Fixtures should support:
- handler tests
- normalization tests
- UI integration tests for critical paths
- manual parity verification

## 2. Fixture Structure

Recommended root:

- `test/fixtures/renewals`
- `test/fixtures/audit`

Recommended shape split:

- `source.*.json` for source/upstream payloads
- `target.*.json` for normalized app-facing payloads

## 3. Minimum Renewal Fixture Set

Required for implementation start:

- `test/fixtures/renewals/source.details.organization.json`
- `test/fixtures/renewals/source.details.individual.json`
- `test/fixtures/renewals/target.details.organization.json`
- `test/fixtures/renewals/target.details.individual.json`
- `test/fixtures/renewals/source.create-order.single.json`
- `test/fixtures/renewals/target.create-order.multi.json`
- `test/fixtures/renewals/source.order-summary.json`
- `test/fixtures/renewals/target.order-read.json`
- `test/fixtures/renewals/source.payment-link.json`
- `test/fixtures/renewals/source.payment.pending.json`
- `test/fixtures/renewals/source.payment.paid.json`
- `test/fixtures/renewals/source.payment.failed.json`
- `test/fixtures/renewals/source.payment.voided.json`
- `test/fixtures/renewals/source.payment.not-found.json`

Required edge-case notes:
- token missing
- token invalid
- zero additional renewals
- multiple additional renewals
- prefill missing optional fields

## 4. Minimum Audit Fixture Set

Required for implementation start:

- `test/fixtures/audit/source.lead.create.json`
- `test/fixtures/audit/target.lead.response.json`
- `test/fixtures/audit/source.section.contact.json`
- `test/fixtures/audit/source.section.preferences.json`
- `test/fixtures/audit/source.section.tm-status.existing.json`
- `test/fixtures/audit/source.section.tm-status.new.json`
- `test/fixtures/audit/source.section.goods.json`
- `test/fixtures/audit/source.section.billing.organisation.json`
- `test/fixtures/audit/source.section.appointment.skip.json`
- `test/fixtures/audit/source.temmy.single.json`
- `test/fixtures/audit/source.temmy.multiple.json`
- `test/fixtures/audit/source.temmy.none.json`
- `test/fixtures/audit/target.order.read.json`

## 5. Fixture Ownership Rules

- source fixtures preserve branch/API semantics
- target fixtures preserve normalized target contracts
- source fixtures should never be imported directly into React components
- fixture updates must be intentional and reviewed when contracts change

## 6. Test Mapping

Recommended first test coverage:

### Renewal
- details normalization
- create-order payload validation
- multi-renewal selection serialization
- payment status normalization
- payment polling terminal-state handling

### Audit
- lead upsert payload normalization
- section-save validation by section
- Temmy zero/single/multi result handling
- audit order read normalization

## 7. Implementation Start Rule

Implementation can start with placeholder test files only if:
- this fixture inventory is accepted
- the team commits to filling the minimum renewal fixture set first

Priority:
- renewal fixtures first
- audit fixtures second

## 8. Ready State

Fixture planning is ready when:
- the file naming convention is accepted
- the minimum renewal fixture set is accepted
- the minimum audit fixture set is accepted
