'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { fetchUserAttributes } from 'aws-amplify/auth';

const formFields = {
  signUp: {
    given_name: {
      order: 1,
      label: 'First Name',
      placeholder: 'Enter your first name',
      isRequired: true,
    },
    family_name: {
      order: 2,
      label: 'Last Name',
      placeholder: 'Enter your last name',
      isRequired: true,
    },
    email: {
      order: 3,
      label: 'Email',
      placeholder: 'Enter your email',
      isRequired: true,
    },
    phone_number: {
      order: 4,
      label: 'Phone Number (optional)',
      placeholder: '+1 610 555 1234',
      isRequired: false,
      dialCode: '+1',
    },
    password: {
      order: 5,
      label: 'Password',
      placeholder: 'Enter your password',
      isRequired: true,
    },
    confirm_password: {
      order: 6,
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      isRequired: true,
    },
  },
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', async ({ payload }) => {
      if (payload.event === 'signedIn') {
        try {
          const attributes = await fetchUserAttributes();
          console.log('All user attributes:', attributes); 
          const role = attributes['custom:role'];
          console.log('Custom role value:', role);
 if (!role) {
            console.warn('custom:role attribute not found! Available keys:', Object.keys(attributes));
          }

          if (role === 'ADMINS') {
            router.replace('/admin/dashboard');
          } else if (role === 'member') {
            router.replace('/dashboard');
          } else {
            router.replace('/onboarding');
          }
        } catch {
          router.replace('/onboarding');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <Authenticator
        formFields={formFields}
        initialState="signIn"
        loginMechanisms={['email']}
      >
        {() => (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className="ml-3 text-gray-600">Signing you in...</p>
          </div>
        )}
      </Authenticator>
    </div>
  );
}