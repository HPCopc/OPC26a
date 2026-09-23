'use client';
// <authentication trigger cognito .   
// sign up form here
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { getPostLoginRoute } from '@/lib/postLoginRoute';

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
    'custom:companyName': {
      order: 3,
      label: 'Company Name',
      placeholder: 'Enter your company name',
      isRequired: true,
    },
    email: {
      order: 4,
      label: 'Email',
      placeholder: 'Enter your email',
      isRequired: true,
    },
    phone_number: {
      order: 5,
      label: 'Phone Number (optional)',
      placeholder: '+1 610 555 1234',
      isRequired: false,
      dialCode: '+1',
    },
    password: {
      order: 6,
      label: 'Password',
      placeholder: 'Enter your password',
      isRequired: true,
    },
    confirm_password: {
      order: 7,
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      isRequired: true,
    },
  },
};

export default function LoginPage() {
  const router = useRouter();

  const routed = useRef(false);

  useEffect(() => {
    const route = async () => {
      if (routed.current) return;
      routed.current = true;
      try {
        router.replace(await getPostLoginRoute());
      } catch {
        router.replace('/');
      }
    };

    // Already signed in (e.g. bounced here by the guard): no signedIn event
    // will fire, so route now instead of spinning on "Signing you in...".
    getCurrentUser().then(route).catch(() => {});

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') route();
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