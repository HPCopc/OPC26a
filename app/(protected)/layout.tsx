//This is the auth guard wrapper. every page come in (protected) has to run this
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserProfile } from '@/lib/useUserProfile';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;

    if (status === 'signedOut') {
      router.replace('/login');
      return;
    }

    // Signed in but the postConfirmation Lambda never created a profile:
    // onboarding creates it, so send them there rather than to /login.
    if ((status === 'noProfile' || profile.profileCompleted !== true) && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [loading, status, profile, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}