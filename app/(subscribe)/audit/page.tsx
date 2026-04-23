import { AuditWizard } from '@/components/audit/audit-wizard';
import { canUseMockAudit } from '@/lib/audit/config';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuditWizard initialToken={token ?? null} showDemoHelpers={canUseMockAudit()} />
  );
}
