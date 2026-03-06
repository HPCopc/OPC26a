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

const components: AuthenticatorProps['components'] = {
 SignUp: {
  FormFields() {
   return (
    <>
     {/* Keep built-in fields for email login */}
     <Authenticator.SignUp.FormFields fields={['email', 'password', 'confirm_password']} />

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

 return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 py-8">
   <Authenticator components={components} initialState="signIn">
    {({ user }) => {
     useEffect(() => {
      if (user) {
       // If you implement onboarding, switch to:
       router.replace('/onboarding');
      // router.replace('/');
      }
     }, [user, router]);

     return (
      <div className="text-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
       <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
       <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
     );
    }}
   </Authenticator>
  </div>
 );
}

