'use client';

import * as React from 'react';
import Link from 'next/link';

import { StepApplicant } from '@/components/renewal/step-applicant';
import { StepConfirmation } from '@/components/renewal/step-confirmation';
import { StepPayment } from '@/components/renewal/step-payment';
import { StepSummary } from '@/components/renewal/step-summary';
import { StepTrademark } from '@/components/renewal/step-trademark';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { findTrademarkById, mockUser } from '@/lib/mock-data';

type RenewalDraft = {
  applicant: {
    fullName: string;
    email: string;
    address: string;
  };
  agreeToTerms: boolean;
  payment: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    nameOnCard: string;
  };
};

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={cn(
        'text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium',
        active && 'bg-muted text-foreground'
      )}
    >
      {label}
    </div>
  );
}

export function RenewalWizard({ assetId }: { assetId: string }) {
  const trademark = findTrademarkById(assetId);
  const [step, setStep] = React.useState(1);
  const reference = React.useMemo(() => {
    const suffix = assetId.replace(/[^a-zA-Z0-9]/g, '').slice(-5).padStart(5, '0');
    return `TMH-2026-${suffix}`;
  }, [assetId]);
  const [draft, setDraft] = React.useState<RenewalDraft>(() => ({
    applicant: {
      fullName: mockUser.name,
      email: mockUser.email,
      address: '123 Business Street, London, EC1A 1BB',
    },
    agreeToTerms: false,
    payment: { cardNumber: '', expiry: '', cvv: '', nameOnCard: mockUser.name },
  }));

  if (!trademark) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Renewal</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm">This asset could not be found.</div>
          <div className="mt-4">
            <Link href="/portfolio" className="text-primary text-sm underline underline-offset-4">
              Back to Portfolio
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        <StepPill active={step === 1} label="Applicant" />
        <StepPill active={step === 2} label="Trademark" />
        <StepPill active={step === 3} label="Summary" />
        <StepPill active={step === 4} label="Payment" />
        <StepPill active={step === 5} label="Confirmation" />
      </div>

      {step === 1 ? (
        <StepApplicant
          value={draft.applicant}
          onChange={(applicant) => setDraft((d) => ({ ...d, applicant }))}
          onNext={() => setStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <StepTrademark trademark={trademark} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      ) : null}

      {step === 3 ? (
        <StepSummary
          agreeToTerms={draft.agreeToTerms}
          onChangeAgree={(agreeToTerms) => setDraft((d) => ({ ...d, agreeToTerms }))}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      ) : null}

      {step === 4 ? (
        <StepPayment
          value={draft.payment}
          onChange={(payment) => setDraft((d) => ({ ...d, payment }))}
          onBack={() => setStep(3)}
          onPay={() => setStep(5)}
        />
      ) : null}

      {step === 5 ? <StepConfirmation reference={reference} trademark={trademark} /> : null}
    </div>
  );
}
