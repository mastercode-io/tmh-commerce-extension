import { canUseMockRenewalsFor } from './config-policy.ts';
import { createRenewalError, RenewalServiceError } from './errors.ts';

const RENEWALS_CUSTOM_API_URL_ENV = 'ZOHO_RENEWALS_CUSTOM_API_URL';

export function isRenewalCustomApiConfigured() {
  return Boolean(process.env[RENEWALS_CUSTOM_API_URL_ENV]);
}

export function canUseMockRenewals() {
  return canUseMockRenewalsFor({
    requireZohoRenewals: process.env.TMH_REQUIRE_ZOHO_RENEWALS,
    vercelEnv: process.env.VERCEL_ENV,
    hasRenewalCustomApi: isRenewalCustomApiConfigured(),
  });
}

export function assertRenewalsIntegration(correlationId: string) {
  if (canUseMockRenewals()) {
    return;
  }

  if (isRenewalCustomApiConfigured()) {
    throw new RenewalServiceError(
      createRenewalError(
        'config_error',
        'Renewal integration is configured, but the live renewal adapter is not implemented yet.',
      ),
      501,
      correlationId,
    );
  }

  throw new RenewalServiceError(
    createRenewalError(
      'config_error',
      'Renewal integration is not configured.',
    ),
    500,
    correlationId,
  );
}
