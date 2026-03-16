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
import { signUp } from 'aws-amplify/auth';

const components: AuthenticatorProps['components'] = {
  SignUp: {
    FormFields() {
      return (
        <>
          <TextField
            name="given_name"
            label="First Name"
            placeholder="John"
            required={true}
          />
          
          {/* Last Name - YOU WERE MISSING THIS */}
          <TextField
            name="family_name"
            label="Last Name"
            placeholder="Doe"
            required={true}
          />
          {/* Amplify handles Email + Password + Confirm Password automatically */}
          <Authenticator.SignUp.FormFields />

          {/* Extra custom fields */}
  
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

const services: AuthenticatorProps['services'] = {
  async handleSignUp(formData) {
    const { username, password, options } = formData;
    try {
      // username is now reliably the email - no DOM hacks needed!
      const email = username

      const givenName = options?.userAttributes?.given_name || ''
      const familyName = options?.userAttributes?.family_name || ''

      const countryCode = ((options?.userAttributes as any)?.country_code || '+1')
        .trim().replace(/\s/g, '')

      const rawPhone = (options?.userAttributes?.phone_number || '').trim()

      console.log('username/email:', email)
      console.log('givenName:', givenName)
      console.log('familyName:', familyName)
      console.log('countryCode:', countryCode)
      console.log('rawPhone:', rawPhone)

      let fullPhone: string | undefined = undefined

      if (rawPhone) {
        if (!countryCode.startsWith('+')) {
          throw new Error('Country code must start with + (e.g. +1, +44, +966)')
        }
        let cleaned = rawPhone.replace(/[\s\-\(\)]/g, '')
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1)
        if (cleaned.length < 7) {
          throw new Error('Please enter a valid phone number')
        }
        fullPhone = countryCode + cleaned
        console.log('fullPhone:', fullPhone)
      }

      const userAttributes: Record<string, string> = {
        email,
        given_name: givenName,
        family_name: familyName,
      }

      if (fullPhone) {
        userAttributes.phone_number = fullPhone
      }

      console.log('Final userAttributes:', userAttributes)

      return signUp({
        username: email,
        password,
        options: { userAttributes },
      })
    } catch (error: any) {
      const message = error?.message || 'Sign up failed. Please try again.'
      throw new Error(message)
    }
  },
}

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
      <Authenticator components={components} services={services} initialState="signIn">
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