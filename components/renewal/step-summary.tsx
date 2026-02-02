'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function StepSummary({
  agreeToTerms,
  onChangeAgree,
  onBack,
  onNext,
}: {
  agreeToTerms: boolean;
  onChangeAgree: (agree: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!agreeToTerms) return;
    onNext();
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Review & fees</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Fee breakdown</div>
            <div className="text-muted-foreground grid gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Official fee</span>
                <span>£200</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service fee</span>
                <span>£50 + VAT</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 font-medium text-foreground">
                <span>Total</span>
                <span>£260</span>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => onChangeAgree(e.target.checked)}
              className="mt-1"
            />
            <div className="grid gap-0.5">
              <Label>I agree to the terms and conditions</Label>
              <div className="text-muted-foreground text-sm">
                This is a mock flow for the POC.
              </div>
            </div>
          </label>
        </CardContent>
        <CardFooter className="justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={!agreeToTerms}>
            Proceed to Payment
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

