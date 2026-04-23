import type {
  RenewalDetailsResponse,
  RenewalTrademark,
} from '../../features/renewals/lib/types.ts';
import type { PaymentStatus } from '../commerce/types.ts';
import { createRenewalError, type RenewalApiError } from './errors.ts';

export const DEMO_RENEWAL_ORG_TOKEN = 'tok_123';
export const DEMO_RENEWAL_INDIVIDUAL_TOKEN = 'tok_010';

type RenewalScenario =
  | { ok: true; token: string }
  | { ok: false; status: number; error: RenewalApiError };

const BOOK_CALL_URL =
  'https://bookings.thetrademarkhelpline.com/#/4584810000004811044';
const TERMS_URL =
  'https://www.thetrademarkhelpline.com/terms-and-conditions';

function buildManagePreferencesUrl(origin: string) {
  return `${origin}/preferences`;
}

const orgPrimaryTrademark: RenewalTrademark = {
  id: 'tm_001',
  wordMark: 'TECHIFY',
  markType: 'Word Mark',
  status: 'Registered',
  jurisdiction: 'UK',
  applicationNumber: 'UK00003456789',
  registrationNumber: 'UK00003456789',
  applicationDate: '2014-06-20',
  registrationDate: '2015-06-20',
  expiryDate: '2025-06-20',
  nextRenewalDate: '2025-06-20',
  imageUrl: null,
  classes: [
    {
      nice: '9',
      description: 'Computer software',
    },
  ],
  classesCount: 1,
  proprietor: {
    name: 'Tech Innovations Ltd',
    address: '123 High Street, Suite 4B, Manchester, M1 1AA, United Kingdom',
  },
};

const orgAdditionalRenewals: RenewalTrademark[] = [
  {
    id: 'tm_002',
    wordMark: 'INNOVATE PRO',
    markType: 'Logo',
    status: 'Registered',
    jurisdiction: 'UK',
    applicationNumber: 'UK00003567890',
    registrationNumber: 'UK00003567890',
    applicationDate: '2015-08-15',
    registrationDate: '2016-08-15',
    expiryDate: '2026-08-15',
    nextRenewalDate: '2026-08-15',
    imageUrl: 'https://cdn.example.com/trademarks/tm_002.png',
    classes: [],
    classesCount: 3,
    proprietor: {
      name: 'Tech Innovations Ltd',
      address: '123 High Street, Suite 4B, Manchester, M1 1AA, United Kingdom',
    },
  },
  {
    id: 'tm_003',
    wordMark: 'TECHIFY LABS',
    markType: 'Word Mark',
    status: 'Registered',
    jurisdiction: 'UK',
    applicationNumber: 'UK00003678901',
    registrationNumber: 'UK00003678901',
    applicationDate: '2016-09-10',
    registrationDate: '2017-09-10',
    expiryDate: '2027-09-10',
    nextRenewalDate: '2027-09-10',
    imageUrl: null,
    classes: [
      {
        nice: '42',
        description: 'Software as a service',
      },
    ],
    classesCount: 1,
    proprietor: {
      name: 'Tech Innovations Ltd',
      address: '123 High Street, Suite 4B, Manchester, M1 1AA, United Kingdom',
    },
  },
];

const individualPrimaryTrademark: RenewalTrademark = {
  id: 'tm_010',
  wordMark: 'EXAMPLE',
  markType: 'Word Mark',
  status: 'Registered',
  jurisdiction: 'UK',
  applicationNumber: 'UK00001010101',
  registrationNumber: null,
  applicationDate: '2019-01-10',
  registrationDate: null,
  expiryDate: '2029-01-10',
  nextRenewalDate: '2029-01-10',
  imageUrl: null,
  classes: [],
  classesCount: 1,
  proprietor: {
    name: 'Alex Example',
    address: '4 Example Road, London, SW1A 1AA, United Kingdom',
  },
};

export function resolveRenewalScenario(token: string | null): RenewalScenario {
  if (!token?.trim()) {
    return {
      ok: false,
      status: 400,
      error: createRenewalError(
        'invalid_token',
        'Invalid renewal link. Please contact us for a fresh invitation.',
      ),
    };
  }

  const normalized = token.trim().toLowerCase();

  if (normalized.includes('expired')) {
    return {
      ok: false,
      status: 410,
      error: createRenewalError(
        'expired_token',
        'This renewal link has expired. Please contact us for a new one.',
      ),
    };
  }

  if (normalized.includes('error')) {
    return {
      ok: false,
      status: 500,
      error: createRenewalError(
        'server_error',
        'We hit a temporary problem while loading this renewal.',
      ),
    };
  }

  if (normalized === DEMO_RENEWAL_ORG_TOKEN || normalized === DEMO_RENEWAL_INDIVIDUAL_TOKEN) {
    return { ok: true, token: normalized };
  }

  return {
    ok: false,
    status: 404,
    error: createRenewalError(
      'not_found',
      'We could not find a renewal for this link.',
    ),
  };
}

export function getMockRenewalDetails(
  origin: string,
  token: string,
): RenewalDetailsResponse {
  if (token === DEMO_RENEWAL_INDIVIDUAL_TOKEN) {
    return {
      token,
      account: {
        type: 'individual',
        name: 'Alex Example',
        address: {
          line1: '4 Example Road',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom',
        },
      },
      contact: {
        firstName: 'Alex',
        lastName: 'Example',
        email: 'alex@example.com',
        phone: '+44 7700 900111',
      },
      primaryTrademark: individualPrimaryTrademark,
      additionalRenewals: [],
      links: {
        bookCall: BOOK_CALL_URL,
        termsConditions: TERMS_URL,
        managePreferences: buildManagePreferencesUrl(origin),
      },
    };
  }

  return {
    token,
    account: {
      type: 'organization',
      name: 'Tech Innovations Ltd',
      companyNumber: '09876543',
      vatNumber: 'GB123456789',
      address: {
        line1: '123 High Street',
        line2: 'Suite 4B',
        city: 'Manchester',
        postcode: 'M1 1AA',
        country: 'United Kingdom',
      },
    },
    contact: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@techinnovations.com',
      mobile: '+44 7700 900123',
      phone: '+44 161 123 4567',
      position: 'Managing Director',
    },
    primaryTrademark: orgPrimaryTrademark,
    additionalRenewals: orgAdditionalRenewals,
    links: {
      bookCall: BOOK_CALL_URL,
      termsConditions: TERMS_URL,
      managePreferences: buildManagePreferencesUrl(origin),
    },
  };
}

export function getMockRenewalTrademarks(origin: string, token: string) {
  const details = getMockRenewalDetails(origin, token);
  return [details.primaryTrademark, ...details.additionalRenewals];
}

export function resolveMockRenewalPaymentOutcome(
  token: string,
): Extract<PaymentStatus, 'succeeded' | 'failed' | 'cancelled'> {
  const normalized = token.toLowerCase();

  if (normalized.includes('failed')) {
    return 'failed';
  }

  if (
    normalized.includes('voided') ||
    normalized.includes('cancelled') ||
    normalized.includes('deleted') ||
    normalized.includes('not-found')
  ) {
    return 'cancelled';
  }

  return 'succeeded';
}

export async function simulateMockLatency(delayMs = 120) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
