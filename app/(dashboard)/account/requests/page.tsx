import { AccountResourcePage } from '@/components/account/account-resource-page';

type AccountRequestsPageProps = {
  searchParams: Promise<{
    customerId?: string | string[];
    email?: string | string[];
  }>;
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountRequestsPage({
  searchParams,
}: AccountRequestsPageProps) {
  const params = await searchParams;
  const customerId = firstSearchParam(params.customerId)?.trim();
  const email = firstSearchParam(params.email)?.trim();
  const devMode = process.env.DEV_MODE?.toLowerCase() === 'true';

  return (
    <AccountResourcePage
      resource="requests"
      customerId={customerId || undefined}
      email={email || undefined}
      devMode={devMode}
    />
  );
}
