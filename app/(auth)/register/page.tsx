'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthCard } from '@/components/layouts/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState('Sarah Mitchell');
  const [email, setEmail] = React.useState('sarah@example.com');
  const [password, setPassword] = React.useState('password');
  const [confirmPassword, setConfirmPassword] = React.useState('password');

  const passwordsMatch = password === confirmPassword;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthCard title="Create account" description="Create your free portfolio in minutes.">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {!passwordsMatch ? (
            <div className="text-destructive text-xs">Passwords do not match.</div>
          ) : null}
        </div>
        <Button type="submit" disabled={!passwordsMatch}>
          Create Account
        </Button>
        <div className="text-muted-foreground text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Log in
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

