import { PageHeader } from '@/components/common/page-header';
import { RenewalWizard } from '@/components/renewal/renewal-wizard';

export default async function RenewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="grid gap-6">
      <PageHeader title="Renewal" description="Complete your renewal in a few steps." />
      <RenewalWizard assetId={id} />
    </div>
  );
}
