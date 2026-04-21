'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserProfile } from '@/lib/useUserProfile';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.replace('/login');
      return;
    }

    if (profile.profileCompleted !== true && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [loading, profile, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}