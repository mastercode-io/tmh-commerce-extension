import type { MonitoringConfirmationResponse } from '@/lib/types/monitoring';

const MONITORING_PAYMENT_COMPLETED_KEY = 'monitoring_payment_completed';
const MONITORING_CONFIRMATION_SNAPSHOT_KEY =
  'monitoring_payment_confirmation_snapshot';

type MonitoringPaymentCompletedMarker = {
  token: string;
  session: string;
};

type MonitoringConfirmationSnapshot = MonitoringConfirmationResponse & {
  token: string;
  session: string;
};

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function saveMonitoringPaymentCompletedMarker(
  marker: MonitoringPaymentCompletedMarker,
) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    MONITORING_PAYMENT_COMPLETED_KEY,
    JSON.stringify(marker),
  );
}

export function consumeMonitoringPaymentCompletedMarker(
  token: string,
  session: string,
) {
  if (!canUseSessionStorage()) {
    return false;
  }

  const raw = window.sessionStorage.getItem(MONITORING_PAYMENT_COMPLETED_KEY);

  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MonitoringPaymentCompletedMarker>;
    return parsed.token === token && parsed.session === session;
  } catch {
    return false;
  }
}

export function saveMonitoringConfirmationSnapshot(
  snapshot: MonitoringConfirmationSnapshot,
) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(
    MONITORING_CONFIRMATION_SNAPSHOT_KEY,
    JSON.stringify(snapshot),
  );
}

export function readMonitoringConfirmationSnapshot(
  token: string,
  session: string,
) {
  if (!canUseSessionStorage()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(
    MONITORING_CONFIRMATION_SNAPSHOT_KEY,
  );

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MonitoringConfirmationSnapshot>;

    if (parsed.token !== token || parsed.session !== session) {
      return null;
    }

    const snapshot = parsed as MonitoringConfirmationSnapshot;

    return {
      clientName: snapshot.clientName,
      companyName: snapshot.companyName,
      helpPhoneNumber: snapshot.helpPhoneNumber,
      helpEmail: snapshot.helpEmail,
      bookingUrl: snapshot.bookingUrl,
      billingFrequency: snapshot.billingFrequency,
      firstPaymentDate: snapshot.firstPaymentDate,
      reference: snapshot.reference,
      paidItems: snapshot.paidItems,
      followUpItems: snapshot.followUpItems,
      summary: snapshot.summary,
    };
  } catch {
    return null;
  }
}
