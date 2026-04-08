import type { MonitoringApiError } from '@/lib/types/monitoring';

export class MonitoringServiceError extends Error {
  status: number;
  response: MonitoringApiError;
  correlationId: string;

  constructor(
    response: MonitoringApiError,
    status: number,
    correlationId: string,
  ) {
    super(response.message);
    this.name = 'MonitoringServiceError';
    this.status = status;
    this.response = response;
    this.correlationId = correlationId;
  }
}

