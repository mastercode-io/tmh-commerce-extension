export function normalizeMonitoringTrademarkTypeValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'word' || normalized === 'word_mark') {
    return 'word_mark';
  }

  if (normalized === 'figurative') {
    return 'figurative';
  }

  if (
    normalized === 'combined' ||
    normalized === 'combined_mark' ||
    normalized === 'combined mark'
  ) {
    return 'combined';
  }

  return value;
}

export function normalizeMonitoringTrademarkStatusValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === 'registered' ||
    normalized === 'pending' ||
    normalized === 'expired'
  ) {
    return normalized;
  }

  return value;
}

export function normalizeMonitoringTrademark(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const candidate = value as Record<string, unknown>;

  return {
    ...candidate,
    type: normalizeMonitoringTrademarkTypeValue(candidate.type),
    status: normalizeMonitoringTrademarkStatusValue(candidate.status),
  };
}

export function normalizeMonitoringClientDataPayload(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const candidate = value as Record<string, unknown>;

  if (!('trademarks' in candidate) || !Array.isArray(candidate.trademarks)) {
    return value;
  }

  return {
    ...candidate,
    trademarks: candidate.trademarks.map(normalizeMonitoringTrademark),
  };
}
