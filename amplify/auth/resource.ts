import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * userAttributes: last first names ... all store in cognito user pool 
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Welcome! Verify your email!'
    },
  },
  
  // ✅ CORRECT: This object defines your custom attributes
  userAttributes: {
    givenName: {
      required: false,
      mutable: true,
    },
    familyName: {
      required: false,
      mutable: true,
    },
  },
  
  // You can add social providers like Google, Facebook, etc. here
});