import { RequestFormPage } from '@/components/requests/request-form-page';
import type { RequestType } from '@/lib/commerce/types';

type NewRequestPageProps = {
  searchParams: Promise<{
    customerId?: string | string[];
    email?: string | string[];
    requestType?: string | string[];
  }>;
};

const VALID_REQUEST_TYPES = new Set<RequestType>([
  'audit',
  'renewal',
  'application',
  'support',
]);

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeRequestType(value?: string) {
  if (value && VALID_REQUEST_TYPES.has(value as RequestType)) {
    return value as RequestType;
  }

  return 'support';
}

export default async function NewRequestPage({
  searchParams,
}: NewRequestPageProps) {
  const params = await searchParams;
  const customerId = firstSearchParam(params.customerId)?.trim();
  const email = firstSearchParam(params.email)?.trim();
  const requestType = normalizeRequestType(
    firstSearchParam(params.requestType)?.trim(),
  );
  const devMode = process.env.DEV_MODE?.toLowerCase() === 'true';

  return (
    <RequestFormPage
      customerId={customerId || undefined}
      email={email || undefined}
      initialRequestType={requestType}
      devMode={devMode}
    />
  );
}
