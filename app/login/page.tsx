'use client';

import {
 Authenticator,
 PhoneNumberField,
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
     {/* Keep built-in fields for email login */}
    <Authenticator.SignUp.FormFields />

     {/* Custom-rendered Cognito attributes */}
     <TextField
      name="given_name"
      label="First Name"
      placeholder="First Name"
     />
     <TextField
      name="family_name"
      label="Last Name"
      placeholder="Last Name"
     />
     <PhoneNumberField
      name="phone_number"
      label="Phone Number"
      defaultDialCode="+1"
      placeholder="+1 555-123-4567"
     />
    </>
   );
  },
 },
};

export default function LoginPage() {
 const router = useRouter();

   // ✅ Move useEffect to the component level, NOT inside Authenticator
  useEffect(() => {
    // Listen for authentication events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      console.log('Auth event:', payload.event);
      
      // Redirect when user signs in
      if (payload.event === 'signedIn') {
        console.log('User signed in, redirecting...');
        router.replace('/onboarding'); // or '/'
      }
    });
     // Cleanup listener on unmount
    return () => unsubscribe();
  }, [router]); //

 return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
      <Authenticator components={components} initialState="signIn">
        {({ user }) => (
          // This function runs after successful sign-in
          // We don't need to manually redirect here - Hub event handles it
          <div className="text-center">
            {user && (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
              </>
            )}
          </div>
        )}
      </Authenticator>

  </div>
 );
}

