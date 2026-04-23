export type RenewalConfigPolicyInput = {
  requireZohoRenewals?: string;
  vercelEnv?: string;
  hasRenewalCustomApi: boolean;
};

export function isStrictRenewalIntegrationRequiredFor({
  requireZohoRenewals,
  vercelEnv,
}: RenewalConfigPolicyInput) {
  return requireZohoRenewals === 'true' || vercelEnv === 'production';
}

export function canUseMockRenewalsFor(input: RenewalConfigPolicyInput) {
  return !isStrictRenewalIntegrationRequiredFor(input) && !input.hasRenewalCustomApi;
}
