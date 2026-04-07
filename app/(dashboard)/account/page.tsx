import { AccountSummaryPage } from '@/components/account/account-summary-page';

type AccountPageProps = {
  searchParams: Promise<{
    customerId?: string | string[];
    email?: string | string[];
  }>;
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const customerId = firstSearchParam(params.customerId)?.trim();
  const email = firstSearchParam(params.email)?.trim();
  const devMode = process.env.DEV_MODE?.toLowerCase() === 'true';

  return (
    <AccountSummaryPage
      customerId={customerId || undefined}
      email={email || undefined}
      devMode={devMode}
    />
  );
}
