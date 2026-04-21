// lib/useUserProfile.ts
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export function useUserProfile() {
  const [profile, setProfile] = useState<Schema['UserProfile']['type'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const attributes = await fetchUserAttributes();
        const userId = attributes.sub;

        if (!userId) {
          setProfile(null);
          return;
        }

        const { data } = await client.models.UserProfile.list({
          filter: { userId: { eq: userId } },
        });

        setProfile(data?.[0] ?? null);
      } catch {
        // Not authenticated or network error — treat as logged out
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { profile, loading };
}