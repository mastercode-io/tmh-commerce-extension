export type AuditConfigPolicyInput = {
  requireZohoAudit?: string;
  vercelEnv?: string;
  hasAuditCustomApi: boolean;
};

export function isStrictAuditIntegrationRequiredFor({
  requireZohoAudit,
  vercelEnv,
}: AuditConfigPolicyInput) {
  return requireZohoAudit === 'true' || vercelEnv === 'production';
}

export function canUseMockAuditFor(input: AuditConfigPolicyInput) {
  return !isStrictAuditIntegrationRequiredFor(input) && !input.hasAuditCustomApi;
}
