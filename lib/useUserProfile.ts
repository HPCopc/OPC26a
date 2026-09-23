// lib/useUserProfile.ts
import { useState, useEffect } from 'react';
import { getProfileStatus, type ProfileStatus } from '@/lib/postLoginRoute';

export function useUserProfile() {
  const [state, setState] = useState<ProfileStatus>({ status: 'signedOut', profile: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setState(await getProfileStatus());
      } catch {
        // Network or API error: treat as logged out
        setState({ status: 'signedOut', profile: null });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { ...state, loading };
}
