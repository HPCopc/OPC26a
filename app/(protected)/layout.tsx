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

  // If not completed and not already on onboarding, send them there
  if (profile.profileCompleted !== true && pathname !== '/onboarding') {
   router.replace('/onboarding');
  }
 }, [loading, profile, pathname, router]);

 return <>{children}</>;
}

