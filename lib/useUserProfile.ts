'use client';

import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export function useUserProfile() {
 const [sub, setSub] = useState<string | null>(null);
 const [profile, setProfile] = useState<Schema['UserProfile']['type'] | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<unknown>(null);

 useEffect(() => {
  (async () => {
   try {
    const user = await getCurrentUser();
    setSub(user.userId);
    const { data } = await client.models.UserProfile.get({ id: user.userId });
    setProfile(data ?? null);
   } catch (e) {
    setError(e);
   } finally {
    setLoading(false);
   }
  })();
 }, []);

 return { sub, profile, setProfile, loading, error };
}

