// app/ConfigureAmplify.tsx
"use client";
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { CookieStorage } from 'aws-amplify/utils';
import outputs from "@/amplify_outputs.json";

// This must run BEFORE any auth operations
if (typeof window !== 'undefined') {
  console.log('🔧 Configuring Amplify with explicit cookie storage');
  
  // Create cookie storage with explicit settings
  const cookieStorage = new CookieStorage({
    domain: window.location.hostname, // 192.168.0.102
    secure: false,
    path: '/',
    sameSite: 'lax',
    expires: 30,
  });
  
  // Set the token provider with cookie storage
  cognitoUserPoolsTokenProvider.setKeyValueStorage(cookieStorage);
  
  // Also set the default storage
  // @ts-ignore - Internal API but helps ensure tokens are stored
  if (Amplify.Auth) {
    // @ts-ignore
    Amplify.Auth.configure({
      storage: cookieStorage,
      cookieStorage: {
        domain: window.location.hostname,
        secure: false,
        path: '/',
        sameSite: 'lax',
        expires: 30,
      }
    });
  }
}

// Configure Amplify with SSR
Amplify.configure(outputs, { 
  ssr: true,
  Auth: {
    // These options help with token storage
    tokenProvider: {
      keyValueStorage: new CookieStorage({
        domain: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
        secure: false,
        path: '/',
        sameSite: 'lax',
        expires: 30,
      })
    }
  }
});

console.log('✅ Amplify configured');

export default function AmplifyInit() {
  return null;
}