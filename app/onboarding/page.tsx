'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';  
const client = generateClient<Schema>();

export default function OnboardingPage() {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [sub, setSub] = useState<string | null>(null);

 const [form, setForm] = useState({
  companyName: '',
  jobTitle: '',
  addressLine1: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  subscriptionType: 'free',
 });

 // Combine simple required checks—tune to your needs
 const canSubmit = useMemo(() => {
  return (
   form.companyName.trim().length > 0 &&
   form.addressLine1.trim().length > 0 &&
   form.city.trim().length > 0 &&
   form.state.trim().length > 0 &&
   form.zipCode.trim().length > 0 &&
   form.country.trim().length > 0
  );
 }, [form]);

 useEffect(() => {
  (async () => {
   try {
    const user = await getCurrentUser(); // throws if not signed in
    const sub = user.userId;
    setSub(sub);

    // Preload any existing values from profile
    const { data } = await client.models.UserProfile.get({ id: sub });
    if (data) {
     setForm(prev => ({
      ...prev,
      companyName: data.companyName ?? '',
      jobTitle: data.jobTitle ?? '',
      addressLine1: data.addressLine1 ?? '',
      city: data.city ?? '',
      state: data.state ?? '',
      zipCode: data.zipCode ?? '',
      country: data.country ?? '',
      subscriptionType: data.subscriptionType ?? 'free',
     }));

     // If already completed, send to dashboard
     if (data.profileCompleted) {
      router.replace('/');
      return;
     }
    }
   } catch {
    router.replace('/login');
    return;
   } finally {
    setLoading(false);
   }
  })();
 }, [router]);

 const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
 };

 const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!sub || !canSubmit) return;

  try {
   await client.models.UserProfile.update({
    id: sub,
    userId: sub,
    ...form,
    profileCompleted: true,
   });

   router.replace('/');
  } catch (err) {
   console.error('Failed to save onboarding fields', err);
   alert('Failed to save. Please try again.');
  }
 };

 if (loading) {
  return (
   <div className="flex min-h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
   </div>
  );
 }

 return (
  <div className="max-w-xl mx-auto p-6">
   <h1 className="text-2xl font-semibold mb-2">Complete your profile</h1>
   <p className="text-gray-600 mb-6">
    Tell us a bit more so we can personalize your experience.
   </p>

   <form className="space-y-4" onSubmit={onSubmit}>
    <div>
     <label className="block text-sm font-medium mb-1">Company Name *</label>
     <input
      name="companyName"
      value={form.companyName}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Company LLC"
      required
     />
    </div>

    <div>
     <label className="block text-sm font-medium mb-1">Job Title</label>
     <input
      name="jobTitle"
      value={form.jobTitle}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Product Manager"
     />
    </div>

    <div>
     <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
     <input
      name="addressLine1"
      value={form.addressLine1}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="123 Main St"
      required
     />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
     <div>
      <label className="block text-sm font-medium mb-1">City *</label>
      <input
       name="city"
       value={form.city}
       onChange={onChange}
       className="w-full px-3 py-2 border rounded-md"
       placeholder="Berwyn"
       required
      />
     </div>

     <div>
      <label className="block text-sm font-medium mb-1">State *</label>
      <input
       name="state"
       value={form.state}
       onChange={onChange}
       className="w-full px-3 py-2 border rounded-md"
       placeholder="PA"
       required
      />
     </div>

     <div>
      <label className="block text-sm font-medium mb-1">ZIP *</label>
      <input
       name="zipCode"
       value={form.zipCode}
       onChange={onChange}
       className="w-full px-3 py-2 border rounded-md"
       placeholder="19312"
       required
      />
     </div>
    </div>

    <div>
     <label className="block text-sm font-medium mb-1">Country *</label>
     <input
      name="country"
      value={form.country}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="United States"
      required
     />
    </div>

    <div>
     <label className="block text-sm font-medium mb-1">Subscription</label>
     <select
      name="subscriptionType"
      value={form.subscriptionType}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md"
     >
      <option value="free">Free</option>
      <option value="pro">Pro</option>
      <option value="team">Team</option>
      <option value="enterprise">Enterprise</option>
     </select>
    </div>

    <button
     type="submit"
     disabled={!canSubmit}
     className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
     Save & Continue
    </button>
   </form>
  </div>
 );
}

