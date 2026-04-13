import type {
  AuditLeadResponse,
  AuditOrderResponse,
  AuditSectionName,
  AuditSections,
  TemmyResultItem,
} from '../../features/audit/lib/types.ts';
import { createAuditError } from './errors.ts';

export const DEMO_AUDIT_TOKEN = 'lead_tok_123';

const baseLead: AuditLeadResponse['lead'] = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+44 7700 900000',
};

const baseSections: AuditSections = {
  contact: { ...baseLead },
  preferences: {
    methods: ['Email', 'Phone'],
  },
  tmStatus: {
    status: 'existing',
    tmAppNumber: 'UK00003456789',
    tmName: '',
  },
  temmy: {
    selected: 'UK00003456789',
    results: {
      items: [
        {
          application_number: 'UK00003456789',
          verbal_element_text: 'TECHIFY',
          status: 'Registered',
          expiry_date: '2026-08-15',
          applicants: [{ name: 'Tech Innovations Ltd' }],
        },
      ],
    },
  },
  goods: {
    description: 'Software development and support services',
    website: 'https://example.com',
  },
  billing: {
    type: 'Organisation',
    companyName: 'Tech Innovations Ltd',
    address: {
      line1: '123 High Street',
      line2: 'Suite 4B',
      city: 'Manchester',
      county: 'Greater Manchester',
      postcode: 'M1 1AA',
      country: 'United Kingdom',
    },
    invoiceEmail: 'finance@example.com',
    invoicePhone: '+44 161 123 4567',
  },
  appointment: {
    scheduled: false,
    skipped: true,
  },
};

const temmyItems: TemmyResultItem[] = [
  {
    application_number: 'UK00003456789',
    verbal_element_text: 'TECHIFY',
    status: 'Registered',
    expiry_date: '2026-08-15',
    applicants: [{ name: 'Tech Innovations Ltd' }],
  },
  {
    application_number: 'UK00009999999',
    verbal_element_text: 'TECHIFY',
    status: 'Pending',
    expiry_date: null,
    applicants: [{ name: 'Example Labs Ltd' }],
  },
];

export function getMockAuditLead() {
  return { ...baseLead };
}

export function getMockAuditSections(): AuditSections {
  return structuredClone(baseSections);
}

export function getMockAuditOrderTemplate(): Omit<
  AuditOrderResponse,
  'orderId' | 'createdAt' | 'updatedAt' | 'request'
> {
  return {
    dealId: 'zoho_deal_123',
    status: 'draft',
    currency: 'GBP',
    sections: getMockAuditSections(),
    pricing: {
      lineItems: [
        {
          orderLineId: 'aud_ol_1',
          orderId: 'aud_ord_123',
          lineType: 'service_request',
          label: 'Trademark Audit',
          quantity: 1,
          unitPrice: 59,
          disposition: 'payable_now',
        },
      ],
      subtotal: 59,
      vat: 11.8,
      total: 70.8,
    },
    payment: null,
  };
}

export function resolveAuditToken(token: string | null) {
  if (!token?.trim()) {
    return {
      ok: false as const,
      status: 400,
      error: createAuditError(
        'invalid_token',
        'Audit continuation token is missing or invalid.',
      ),
    };
  }

  if (token.trim().toLowerCase() !== DEMO_AUDIT_TOKEN) {
    return {
      ok: false as const,
      status: 404,
      error: createAuditError(
        'not_found',
        'We could not find an audit journey for this token.',
      ),
    };
  }

  return {
    ok: true as const,
    token: DEMO_AUDIT_TOKEN,
  };
}

export function searchMockTemmy(args: {
  applicationNumber?: string | null;
  text?: string | null;
}) {
  const applicationNumber = args.applicationNumber?.trim().toUpperCase() ?? '';
  const text = args.text?.trim().toUpperCase() ?? '';

  let items = temmyItems;

  if (applicationNumber) {
    items = temmyItems.filter(
      (item) => item.application_number.toUpperCase() === applicationNumber,
    );
  } else if (text) {
    items = temmyItems.filter((item) =>
      item.verbal_element_text.toUpperCase().includes(text),
    );
  } else {
    items = [];
  }

  return {
    source: 'live',
    data: {
      items,
    },
  };
}

export function shouldCreateAuditOrderForSection(section: AuditSectionName) {
  return section === 'contact';
}

export async function simulateMockLatency(delayMs = 100) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
