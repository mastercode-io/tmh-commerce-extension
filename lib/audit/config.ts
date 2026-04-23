import { canUseMockAuditFor } from './config-policy.ts';
import { createAuditError, AuditServiceError } from './errors.ts';

const AUDIT_CUSTOM_API_URL_ENV = 'ZOHO_AUDIT_CUSTOM_API_URL';

export function isAuditCustomApiConfigured() {
  return Boolean(process.env[AUDIT_CUSTOM_API_URL_ENV]);
}

export function canUseMockAudit() {
  return canUseMockAuditFor({
    requireZohoAudit: process.env.TMH_REQUIRE_ZOHO_AUDIT,
    vercelEnv: process.env.VERCEL_ENV,
    hasAuditCustomApi: isAuditCustomApiConfigured(),
  });
}

export function assertAuditIntegration(correlationId: string) {
  if (canUseMockAudit()) {
    return;
  }

  if (isAuditCustomApiConfigured()) {
    throw new AuditServiceError(
      createAuditError(
        'config_error',
        'Audit integration is configured, but the live audit adapter is not implemented yet.',
      ),
      501,
      correlationId,
    );
  }

  throw new AuditServiceError(
    createAuditError('config_error', 'Audit integration is not configured.'),
    500,
    correlationId,
  );
}
