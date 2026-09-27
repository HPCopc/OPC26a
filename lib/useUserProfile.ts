// lib/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { getProfileStatus, type ProfileStatus } from '@/lib/postLoginRoute';

export function useUserProfile() {
  const [state, setState] = useState<ProfileStatus>({ status: 'signedOut', profile: null });
  const [loading, setLoading] = useState(true);
  // Network or API failure. Kept apart from signedOut so a brief outage
  // shows a retry instead of bouncing a signed-in user to /login.
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setState(await getProfileStatus());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, loading, error, retry: load };
}
