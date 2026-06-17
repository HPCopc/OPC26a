// app/AmplifyInit.tsx
"use client";
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";  
import { CookieStorage } from "aws-amplify/utils";  
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs, { ssr: true });

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    domain: "main.d1lw1esjveekyl.amplifyapp.com",
    secure: true,
    sameSite: "lax",
    path: "/",
  })
);

export default function AmplifyInit() {
  return null; // This component does nothing visible
}