'use client';
// Sign In / Register form (Cognito via the Amplify Authenticator).
// /login opens on the Sign In tab, /register on the Register tab.
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Hub, I18n } from 'aws-amplify/utils';
import { getCurrentUser, signIn, signUp, type SignInInput, type SignUpInput } from 'aws-amplify/auth';
import { clearCognitoCookies } from '@/utils/authCookies';
import { getPostLoginRoute } from '@/lib/postLoginRoute';
import { isDefaultBlocked } from '@/amplify/shared/blockedEmailDomains';

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

// The site calls creating an account "Register" everywhere; relabel the
// Authenticator's "Create Account" / "Sign Up" wording to match.
I18n.putVocabulariesForLanguage('en', {
  'Create Account':       'Register',
  'Create a new account': 'Register',
  'Creating Account':     'Registering',
  'Confirm Sign Up':      'Confirm Registration',
});

const COMPANY_EMAIL_MESSAGE = 'Please register with your company email address.';

const services = {
  // Instant feedback for the common personal domains. The pre-sign-up Lambda
  // is the real check (it reads the admin-managed BlockedEmailDomain table).
  async validateCustomSignUp(formData: Record<string, string>) {
    if (formData.email && isDefaultBlocked(formData.email)) {
      return { email: COMPANY_EMAIL_MESSAGE };
    }
  },
  // Cognito accepted the password but Amplify couldn't read the new session
  // back, which a stale auth cookie causes. Clear the auth cookies and sign
  // in once more instead of showing the error.
  async handleSignIn(input: SignInInput) {
    try {
      return await signIn(input);
    } catch (e) {
      if (!(e instanceof Error) || !/unable to get user session/i.test(e.message)) throw e;
      clearCognitoCookies();
      return await signIn(input);
    }
  },
  // Cognito prefixes Lambda errors with "PreSignUp failed with error ";
  // show only the Lambda's own message.
  async handleSignUp(input: SignUpInput) {
    try {
      return await signUp(input);
    } catch (e) {
      if (e instanceof Error) e.message = e.message.replace(/^PreSignUp failed with error\s*/i, '');
      throw e;
    }
  },
};

export default function AuthPage({ initialState }: { initialState: 'signIn' | 'signUp' }) {
  const router = useRouter();

  const routed = useRef(false);

  useEffect(() => {
    const route = async () => {
      if (routed.current) return;
      routed.current = true;
      try {
        const next = await getPostLoginRoute();
        // Send users back to the page that bounced them here (admins too,
        // rather than the admin home), unless they still have onboarding to
        // do. Only same-site paths are allowed so ?from= can't redirect off-site.
        const from = new URLSearchParams(window.location.search).get('from');
        const safeFrom = from && from.startsWith('/') && !from.startsWith('//') && !from.startsWith('/\\');
        router.replace((next === '/' || next === '/admin') && safeFrom ? from : next);
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
        initialState={initialState}
        loginMechanisms={['email']}
        services={services}
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