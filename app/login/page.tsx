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
     {/* Keep built-in fields for email login */}
     

     {/* Custom-rendered Cognito attributes */}
               <TextField
            name="email"
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
            name="phone_number"
            label="Phone Number"
            placeholder="6105551234"
            descriptiveText="Enter 10 digits, e.g. 6105551234"
          />

      
    </>
   );
  },
 },
};

// ✅ This catches Lambda errors and shows them in the UI
const services: AuthenticatorProps['services'] = {
  async handleSignUp(formData) {
    const { username, password, options } = formData;
    try {

      // Get email from either username or userAttributes
      const email = username || 
                    options?.userAttributes?.email || 
                    (formData as any)['email'] || ''

      const rawPhone = (options?.userAttributes?.phone_number || '')
        .replace('undefined', '')
        .trim();
console.log('ALL userAttributes:', options?.userAttributes);
console.log('rawPhone:', rawPhone);

      let cleaned = rawPhone.replace(/[\s\-\(\)]/g, '');
      if (!cleaned.startsWith('+')) {
       cleaned = '+1' + cleaned;
      }

      // ✅ Add this check
      if (cleaned.replace(/^\+1/, '').length !== 10) {
        throw new Error('Please enter a valid 10-digit US phone number.');
      }
   

      const result = await signUp({
  username: email,
  password,
  options: {
    ...options,
    userAttributes: {
      ...options?.userAttributes,
      email,
      phone_number: cleaned,
    },
  },
});

      return result;
    } catch (error: any) {
      // Extract the Lambda error message and show it in the form
      const message = error?.message || 'Sign up failed. Please try again.';
      throw new Error(message);
    }
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
      <Authenticator components={components} services={services}  initialState="signIn">
        {({ user, signOut }) => (
          // This function runs after successful sign-in
          // We don't need to manually redirect here - Hub event handles it
          <div className="text-center">
            {user && (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
                                {/* ✅ Logout Button */}
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

