import type {
  MonitoringApiError,
  MonitoringApiErrorCode,
  MonitoringClientData,
  MonitoringTrademark,
} from '@/lib/types/monitoring';

export const DEMO_MONITORING_TOKEN = 'demo-monitoring-001';

export const MOCK_MONITORING_HELP_PHONE = '0800 689 1700';
export const MOCK_MONITORING_HELP_EMAIL = 'care@thetrademarkhelpline.com';

function buildLogoDataUri(monogram: string, fill: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="24" fill="${fill}" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${monogram}</text>
    </svg>`,
  )}`;
}

const mockTrademarks: MonitoringTrademark[] = [
  {
    id: 'tm-luma-word',
    name: 'LUMA LANE',
    brandName: 'Luma Lane',
    type: 'word_mark',
    jurisdiction: 'GB',
    applicationDate: '2024-02-12',
    registrationDate: '2024-08-19',
    expiryDate: '2034-08-19',
    registrationNumber: 'UK00003163853',
    status: 'registered',
    riskProfile: 'medium',
  },
  {
    id: 'tm-luma-device',
    name: 'LUMA LANE device',
    brandName: 'Luma Lane',
    type: 'combined',
    jurisdiction: 'GB',
    applicationDate: '2024-02-28',
    registrationDate: '2024-09-02',
    expiryDate: '2034-09-02',
    registrationNumber: 'UK00003164021',
    status: 'registered',
    riskProfile: 'high',
    imageUrl: buildLogoDataUri('LL', '#111827'),
  },
  {
    id: 'tm-northvale-word',
    name: 'NORTHVALE',
    brandName: 'Northvale',
    type: 'word_mark',
    jurisdiction: 'GB',
    applicationDate: '2024-03-18',
    registrationDate: '2024-09-14',
    expiryDate: '2034-09-14',
    registrationNumber: 'UK00002894762',
    status: 'registered',
    riskProfile: 'low',
  },
];

function buildBookingUrl(origin: string, token: string) {
  return `${origin}/subscribe/monitoring/mock-booking?token=${encodeURIComponent(token)}`;
}

type MockScenario =
  | { ok: true; token: string }
  | {
      ok: false;
      status: number;
      error: MonitoringApiError;
    };

export function resolveMonitoringScenario(token: string | null): MockScenario {
  if (!token?.trim()) {
    return {
      ok: false,
      status: 400,
      error: {
        code: 'invalid_token',
        message:
          'Invalid link. Please contact us for a fresh monitoring invitation.',
      },
    };
  }

  const normalized = token.trim().toLowerCase();

  if (normalized.includes('expired')) {
    return {
      ok: false,
      status: 410,
      error: {
        code: 'expired_token',
        message: 'This link has expired. Please contact us for a new one.',
      },
    };
  }

  if (normalized.includes('empty')) {
    return {
      ok: false,
      status: 404,
      error: {
        code: 'no_trademarks',
        message: "We couldn't find any trademarks for this account.",
      },
    };
  }

  if (normalized.includes('error')) {
    return {
      ok: false,
      status: 500,
      error: {
        code: 'server_error',
        message:
          'We hit a temporary problem while loading this subscription link.',
      },
    };
  }

  if (normalized.includes('invalid')) {
    return {
      ok: false,
      status: 400,
      error: {
        code: 'invalid_token',
        message:
          'Invalid link. Please contact us for a fresh monitoring invitation.',
      },
    };
  }

  return { ok: true, token: token.trim() };
}

export function getMockMonitoringClientData(
  origin: string,
  token: string,
): MonitoringClientData {
  return {
    token,
    clientName: 'Amelia Carter',
    companyName: 'Luma Lane Studio Ltd',
    helpPhoneNumber: MOCK_MONITORING_HELP_PHONE,
    helpEmail: MOCK_MONITORING_HELP_EMAIL,
    bookingUrl: buildBookingUrl(origin, token),
    trademarks: mockTrademarks,
  };
}

export function createMonitoringError(
  code: MonitoringApiErrorCode,
  message: string,
): MonitoringApiError {
  return { code, message };
}

export async function simulateMockLatency(delayMs = 180) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
