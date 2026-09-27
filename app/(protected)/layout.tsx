//This is the auth guard wrapper. every page come in (protected) has to run this
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserProfile } from '@/lib/useUserProfile';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, profile, loading, error, retry } = useUserProfile();

  useEffect(() => {
    if (loading || error) return;

    if (status === 'signedOut') {
      // Pass the current page so login can send them back here.
      router.replace(`/login?from=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // Signed in but the postConfirmation Lambda never created a profile:
    // onboarding creates it, so send them there rather than to /login.
    if ((status === 'noProfile' || profile.profileCompleted !== true) && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [loading, error, status, profile, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-gray-700">We couldn&apos;t load your account. Check your connection and try again.</p>
        <button
          onClick={retry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}