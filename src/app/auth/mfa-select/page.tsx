'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { confirmSignIn, updateMFAPreference } from 'aws-amplify/auth';
import { useToast } from '@/hooks/use-toast';

export default function MFASelectPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [options, setOptions] = useState<string[]>([]);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('tempUserMFA');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        const available = user?.nextStep?.allowedMFATypes || [];
        setOptions(available);
      } catch {
        toast({
          title: 'Invalid session',
          description: 'MFA session data is corrupted.',
          variant: 'destructive',
        });
        router.replace('/auth');
      }
    } else {
      toast({
        title: 'Session expired',
        description: 'Please log in again.',
        variant: 'destructive',
      });
      router.replace('/auth');
    }
  }, []);

  const handleSelect = async (method: 'TOTP' | 'EMAIL') => {
    setLoading(true);
    try {
      const raw = sessionStorage.getItem('tempUserMFA');
      if (!raw) throw new Error('Missing MFA session');

      const user = JSON.parse(raw);

      const result = await confirmSignIn({
        challengeResponse: method,
      });

      // Optionally remember preference
      if (remember) {
        await updateMFAPreference({
          [method.toLowerCase()]: 'PREFERRED',
        });
      }

      // Route based on next step
      const next = result?.nextStep?.signInStep;

      if (next === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        router.push('/auth/mfa-totp');
      } else if (next === 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE') {
        router.push('/auth/mfa-email');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to continue MFA flow.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Select MFA Method</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to verify your identity.
        </p>
      </div>

      {options.includes('TOTP') && (
        <Button
          onClick={() => handleSelect('TOTP')}
          className="w-full"
          disabled={loading}
        >
          Use Authenticator App
        </Button>
      )}

      {options.includes('EMAIL') && (
        <Button
          onClick={() => handleSelect('EMAIL')}
          className="w-full"
          disabled={loading}
        >
          Use Email Code
        </Button>
      )}

    </div>
  );
}
