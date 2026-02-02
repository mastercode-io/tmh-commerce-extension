'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function StepPayment({
  value,
  onChange,
  onBack,
  onPay,
}: {
  value: { cardNumber: string; expiry: string; cvv: string; nameOnCard: string };
  onChange: (next: { cardNumber: string; expiry: string; cvv: string; nameOnCard: string }) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  function update<K extends keyof typeof value>(key: K, nextValue: (typeof value)[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onPay();
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="nameOnCard">Name on card</Label>
            <Input
              id="nameOnCard"
              value={value.nameOnCard}
              onChange={(e) => update('nameOnCard', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cardNumber">Card number</Label>
            <Input
              id="cardNumber"
              inputMode="numeric"
              value={value.cardNumber}
              onChange={(e) => update('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                value={value.expiry}
                onChange={(e) => update('expiry', e.target.value)}
                placeholder="MM/YY"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                inputMode="numeric"
                value={value.cvv}
                onChange={(e) => update('cvv', e.target.value)}
                placeholder="123"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Pay £260</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

