'use client';

import type {
  AuditOrderResponse,
  AuditSections,
  TemmySearchResponse,
} from '@/features/audit/lib/types';

const AUDIT_WIZARD_STATE_KEY = 'audit_order_state';

export type AuditWizardStorageState = {
  token: string | null;
  orderId: string | null;
  currentStep: number;
  completedAt: string | null;
  sections: AuditSections;
  lastTemmySearch: {
    mode: 'application_number' | 'text';
    value: string;
    response: TemmySearchResponse;
  } | null;
  latestOrder: AuditOrderResponse | null;
};

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function readAuditWizardState() {
  if (!canUseSessionStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(AUDIT_WIZARD_STATE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuditWizardStorageState;
  } catch {
    return null;
  }
}

export function saveAuditWizardState(state: AuditWizardStorageState) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(AUDIT_WIZARD_STATE_KEY, JSON.stringify(state));
}

export function clearAuditWizardState() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUDIT_WIZARD_STATE_KEY);
}
