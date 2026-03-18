'use client';

import {
  Authenticator,
  TextField,
  type AuthenticatorProps,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';

const components: AuthenticatorProps['components'] = {
  SignUp: {
    FormFields() {
      return (
        <>
          <TextField
            name="username"
            label="Email"
            placeholder="Enter your email"
            isRequired={true}
            type="email"
          />
          
          <TextField
            name="password"
            label="Password"
            placeholder="Enter your password"
            isRequired={true}
            type="password"
          />
          <TextField
            name="confirm_password"
            label="Confirm Password"
            placeholder="Please confirm your Password"
            isRequired={true}
            type="password"
          />
          <TextField
            name="given_name"
            label="First Name"
            placeholder="Enter your First Name"
            isRequired={true}
          />
          <TextField
            name="family_name"
            label="Last Name"
            placeholder="Enter your Last Name"
            isRequired={true}
          />
          <TextField
            name="country_code"
            label="Country Code (optional)"
            placeholder="+1"
            defaultValue="+1"
            descriptiveText="e.g. +1 (US), +44 (UK), +966 (Saudi Arabia), +971 (UAE)"
          />
          <TextField
            name="phone_number"
            label="Phone Number (optional)"
            placeholder="6105551234"
            descriptiveText="Enter digits only, no country code"
          />
        </>
      );
    },
  },
};

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      console.log('Auth event:', payload.event)
      if (payload.event === 'signedIn') {
        console.log('User signed in, redirecting...')
        router.replace('/onboarding')
      }
    })
    return () => unsubscribe()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      {/* Removed the services prop - now using default Amplify sign-up */}
      <Authenticator components={components} initialState="signIn">
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
  )
}