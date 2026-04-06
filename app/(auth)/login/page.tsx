'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthCard } from '@/components/layouts/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('sarah@example.com');
  const [password, setPassword] = React.useState('password');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push('/settings/notifications');
  }

  return (
    <AuthCard
      title="Sign in"
      description="Access your TMH account to manage preferences, subscriptions, and requests."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
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
        <Button type="submit">Sign In</Button>
        <div className="text-muted-foreground text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
