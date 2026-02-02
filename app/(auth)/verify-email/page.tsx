import Link from 'next/link';

import { AuthCard } from '@/components/layouts/auth-card';
import { Button } from '@/components/ui/button';
import { MailIcon } from 'lucide-react';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const displayEmail = email ?? 'your email address';

  return (
    <AuthCard
      title="Check your email"
      description={`We’ve sent a verification link to ${displayEmail}.`}
    >
      <div className="grid gap-4">
        <div className="bg-muted flex items-center justify-center rounded-xl p-6">
          <MailIcon className="text-muted-foreground size-7" />
        </div>
        <div className="text-muted-foreground text-sm">
          Didn&apos;t receive it? You can resend the email (non-functional in the POC).
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" disabled>
            Resend Verification
          </Button>
          <Button asChild>
            <Link href="/welcome">Skip for now →</Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
