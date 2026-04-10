'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser();
      const userId = user.userId;
      setSub(userId);

      // Fetch existing profile
      const { data, errors } = await client.models.UserProfile.get({ id: userId });
      
      if (errors) {
        console.error('Error loading profile:', errors);
        return;
      }

      if (data) {
        setForm({
          companyName: data.companyName || '',
          jobTitle: data.jobTitle || '',
          addressLine1: data.addressLine1 || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          country: data.country || '',
          subscriptionType: data.subscriptionType || 'free',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sub || saving) return;
    
    setSaving(true);

    try {
      const { data, errors } = await client.models.UserProfile.update({
        id: sub,
        userId: sub,
        ...form,
        updatedAt: new Date().toISOString(),
      });

      if (errors) {
        console.error('Update failed:', errors);
        alert(`Update failed: ${errors[0]?.message || 'Unknown error'}`);
      } else if (data) {
        alert('Profile updated successfully!');
        router.push('/'); // Return to dashboard
      }
    } catch (error) {
      console.error('Exception caught:', error);
      alert(`Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Profile</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
          <input
            type="text"
            name="addressLine1"
            value={form.addressLine1}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code *</label>
            <input
              type="text"
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country *</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subscription Type</label>
          <select
            name="subscriptionType"
            value={form.subscriptionType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}