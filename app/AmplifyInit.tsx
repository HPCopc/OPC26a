// app/AmplifyInit.tsx
"use client";
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";  
import { CookieStorage } from "aws-amplify/utils";  
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs, { ssr: true });

// Pin the cookie domain on the deployed site only; on localhost the browser
// rejects a foreign domain (and a secure cookie over http), so login would fail.
const PROD_HOST = "main.d1lw1esjveekyl.amplifyapp.com";
const onProd = typeof window !== "undefined" && window.location.hostname === PROD_HOST;
const onHttps = typeof window !== "undefined" && window.location.protocol === "https:";

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    ...(onProd && { domain: PROD_HOST }),
    secure: onHttps,
    sameSite: "lax",
    path: "/",
  })
);

export default function AmplifyInit() {
  return null; // This component does nothing visible
}