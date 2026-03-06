// app/login/page.tsx
// Authenticator component automatically provides both Sign In and Sign Up pages out of the box. 
"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center bg-gray-50 py-8">
      <Authenticator>
        {({ signOut, user }) => {
          // Redirect to home page after login
          useEffect(() => {
            if (user) {
              router.push('/');
            }
          }, [user, router]);

          return (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
            </div>
          );
        }}
      </Authenticator>
    </div>
  );
}