'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function StepApplicant({
  value,
  onChange,
  onNext,
}: {
  value: { fullName: string; email: string; address: string };
  onChange: (next: { fullName: string; email: string; address: string }) => void;
  onNext: () => void;
}) {
  function update<K extends keyof typeof value>(key: K, nextValue: (typeof value)[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onNext();
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Applicant details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={value.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={value.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={value.address}
              onChange={(e) => update('address', e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

