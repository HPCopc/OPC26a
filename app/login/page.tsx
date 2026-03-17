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
         {/* Amplify handles Email + Password + Confirm Password automatically */}
          <Authenticator.SignUp.FormFields />
          {/* Extra custom fields */}                 
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

      console.log('username/email:', email);
      console.log('givenName:', options?.userAttributes?.given_name || '');
      console.log('familyName:', options?.userAttributes?.family_name || '');

      // ✅ Use directly - no intermediate variables
      const userAttributes: Record<string, string> = {
        email,
        given_name: options?.userAttributes?.given_name || '',
        family_name: options?.userAttributes?.family_name || '',       
      };

      console.log('Final userAttributes:', userAttributes);

      const result = await signUp({
      username: email,
      password,
      options: { 
        userAttributes, 
        autoSignIn: true,
        clientMetadata: {
          source: 'web-app',
          timestamp: new Date().toISOString(),
        }
      },
    });

  // Add this to see verification details
       if (result.nextStep) {
        console.log('Next step details:', {
          signUpStep: result.nextStep.signUpStep,
        });
        
        // ✅ FIXED: Type-safe check for codeDeliveryDetails
        if ('codeDeliveryDetails' in result.nextStep && result.nextStep.codeDeliveryDetails) {
          console.log('📧 Verification sent to:', {
            destination: result.nextStep.codeDeliveryDetails.destination,
            medium: result.nextStep.codeDeliveryDetails.deliveryMedium,
            attribute: result.nextStep.codeDeliveryDetails.attributeName
          });
        } else {
          console.log('⚠️ No verification code was sent - check Cognito email configuration');
        }
      }

   return result;


    } catch (error: any) {
      console.error('Full signup error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      details: error
    });

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
