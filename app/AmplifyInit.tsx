// app/AmplifyInit.tsx
"use client";
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
import outputs from "@/amplify_outputs.json";
import { removeDomainPinnedCognitoCookies } from "@/utils/authCookies";

// Auth cookies used to be pinned to this domain on the deployed site. Remove
// those old copies before Amplify reads the session
// (see removeDomainPinnedCognitoCookies).
const PROD_HOST = "main.d1lw1esjveekyl.amplifyapp.com";
if (typeof window !== "undefined" && window.location.hostname === PROD_HOST) {
  removeDomainPinnedCognitoCookies(PROD_HOST);
}

Amplify.configure(outputs, { ssr: true });

// Host-only cookies (no domain), the way the server writes them when it
// refreshes a session, so sign-out removes the same cookies the server set.
const onHttps = typeof window !== "undefined" && window.location.protocol === "https:";

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    secure: onHttps,
    sameSite: "lax",
    path: "/",
  })
);

export default function AmplifyInit() {
  return null; // This component does nothing visible
}
