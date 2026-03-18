'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';

// Define form fields configuration
const formFields = {
  signUp: {
    username: {
      order: 1,
      label: 'Email',
      placeholder: 'Enter your email',
      isRequired: true,
    },
    password: {
      order: 2,
      label: 'Password',
      placeholder: 'Enter your password',
      isRequired: true,
    },
    confirm_password: {
      order: 3,
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      isRequired: true,
    },
    given_name: {
      order: 4,
      label: 'First Name',
      placeholder: 'Enter your first name',
      isRequired: true,
    },
    family_name: {
      order: 5,
      label: 'Last Name',
      placeholder: 'Enter your last name',
      isRequired: true,
    },
    phone_number: {
      order: 6,
      label: 'Phone Number (optional)',
      placeholder: '+1 610 555 1234',
      isRequired: false,
      dialCode: '+1',
    },
  },
};

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      console.log('Auth event:', payload.event);
      if (payload.event === 'signedIn') {
        console.log('User signed in, redirecting...');
        router.replace('/onboarding');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <Authenticator 
        formFields={formFields}
        initialState="signIn"
      >
        {({ user, signOut }) => (
          <div className="text-center">
            {user && (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </Authenticator>
    </div>
  );
}