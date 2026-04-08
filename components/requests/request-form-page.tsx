'use client';

import * as React from 'react';
import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { RequestSummary, RequestType } from '@/lib/commerce/types';

type RequestFormResponse =
  | {
      request: RequestSummary;
      correlationId: string;
    }
  | {
      code: string;
      message: string;
      correlationId: string;
    };

type SubmitState =
  | { status: 'idle' | 'submitting' }
  | { status: 'success'; request: RequestSummary; correlationId: string }
  | { status: 'error'; message: string; correlationId?: string };

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  audit: 'Audit request',
  renewal: 'Renewal request',
  application: 'Application request',
  support: 'Support request',
};

function isSuccessResponse(
  payload: RequestFormResponse,
): payload is Extract<RequestFormResponse, { request: RequestSummary }> {
  return 'request' in payload;
}

function statusLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function RequestFormPage({
  customerId,
  email,
  initialRequestType = 'support',
  devMode,
}: {
  customerId?: string;
  email?: string;
  initialRequestType?: RequestType;
  devMode?: boolean;
}) {
  const [requestType, setRequestType] =
    React.useState<RequestType>(initialRequestType);
  const [summary, setSummary] = React.useState('');
  const [state, setState] = React.useState<SubmitState>({ status: 'idle' });

  const hasIdentity = Boolean(customerId || email);
  const canSubmit =
    hasIdentity && summary.trim().length > 0 && state.status !== 'submitting';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setState({ status: 'submitting' });

    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        email,
        requestType,
        summary: summary.trim(),
      }),
    });
    const payload = (await response.json()) as RequestFormResponse;

    if (!response.ok || !isSuccessResponse(payload)) {
      setState({
        status: 'error',
        message:
          'message' in payload
            ? payload.message
            : 'We could not submit the request right now.',
        correlationId:
          'correlationId' in payload ? payload.correlationId : undefined,
      });
      return;
    }

    setState({
      status: 'success',
      request: payload.request,
      correlationId: payload.correlationId,
    });
    setSummary('');
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="New service request"
        description="Submit a commercially scoped request to the TMH team."
        actions={
          <Button variant="outline" asChild>
            <Link href="/account/requests">Request history</Link>
          </Button>
        }
      />

      {!hasIdentity ? (
        <EmptyState
          title="Account context required"
          description="This form needs an authenticated customer context or an email/customerId query while auth is still mocked."
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Request details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="request-type">
                Request type
              </label>
              <Select
                value={requestType}
                onValueChange={(value) => setRequestType(value as RequestType)}
                disabled={!hasIdentity || state.status === 'submitting'}
              >
                <SelectTrigger id="request-type" className="w-full">
                  <SelectValue placeholder="Choose request type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="request-summary">
                Summary
              </label>
              <Textarea
                id="request-summary"
                minLength={1}
                placeholder="Describe what the customer needs from TMH."
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                disabled={!hasIdentity || state.status === 'submitting'}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={!canSubmit}>
                {state.status === 'submitting' ? 'Submitting...' : 'Submit request'}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/account">Back to account</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {state.status === 'success' ? (
        <EmptyState
          title="Request submitted"
          description={`${REQUEST_TYPE_LABELS[state.request.requestType]} is now ${statusLabel(
            state.request.status,
          ).toLowerCase()}. Reference: ${state.request.reference}.`}
        />
      ) : null}

      {state.status === 'error' ? (
        <EmptyState
          title="Request could not be submitted"
          description={
            devMode && state.correlationId
              ? `${state.message} Correlation ID: ${state.correlationId}`
              : state.message
          }
        />
      ) : null}
    </div>
  );
}
