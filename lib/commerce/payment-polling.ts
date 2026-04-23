import type { PaymentStatus } from '@/lib/commerce/types';

export interface PaymentPollingOptions {
  initialFastIntervalMs: number;
  initialFastDurationMs: number;
  midIntervalMs: number;
  midDurationMs: number;
  slowIntervalMs: number;
  timeoutMs: number;
}

export interface PaymentPollingSnapshot {
  status: PaymentStatus;
  updatedAt?: string | null;
}

export interface PaymentTerminalState {
  status: PaymentStatus | 'timeout';
  lastSnapshot?: PaymentPollingSnapshot | null;
}

const DEFAULT_PAYMENT_POLLING_OPTIONS: PaymentPollingOptions = {
  initialFastIntervalMs: 2_000,
  initialFastDurationMs: 30_000,
  midIntervalMs: 5_000,
  midDurationMs: 90_000,
  slowIntervalMs: 10_000,
  timeoutMs: 10 * 60 * 1_000,
};

function sleep(durationMs: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, durationMs);
  });
}

function isTerminalStatus(status: PaymentStatus) {
  return status === 'succeeded' || status === 'failed' || status === 'cancelled';
}

function getIntervalForElapsedTime(
  elapsedMs: number,
  options: PaymentPollingOptions,
) {
  if (elapsedMs < options.initialFastDurationMs) {
    return options.initialFastIntervalMs;
  }

  if (elapsedMs < options.initialFastDurationMs + options.midDurationMs) {
    return options.midIntervalMs;
  }

  return options.slowIntervalMs;
}

export async function pollPaymentStatus(
  getStatus: () => Promise<PaymentPollingSnapshot>,
  options?: Partial<PaymentPollingOptions>,
): Promise<PaymentTerminalState> {
  const resolvedOptions: PaymentPollingOptions = {
    ...DEFAULT_PAYMENT_POLLING_OPTIONS,
    ...options,
  };
  const startedAt = Date.now();
  let lastSnapshot: PaymentPollingSnapshot | null = null;

  while (Date.now() - startedAt < resolvedOptions.timeoutMs) {
    lastSnapshot = await getStatus();

    if (isTerminalStatus(lastSnapshot.status)) {
      return {
        status: lastSnapshot.status,
        lastSnapshot,
      };
    }

    const elapsedMs = Date.now() - startedAt;
    const intervalMs = getIntervalForElapsedTime(elapsedMs, resolvedOptions);
    await sleep(intervalMs);
  }

  return {
    status: 'timeout',
    lastSnapshot,
  };
}
