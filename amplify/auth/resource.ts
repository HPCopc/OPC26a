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
    // You can also add phone number, etc. userAttributes: { givenName:{required: false,}}
    userAttributes: {
    // First name (automatically appears in sign-up form)
    givenName: {
      required: false,      // Set to true if you want to force users to provide this
      mutable: true,        // Allow users to update this later
    },
    // Last name (automatically appears in sign-up form)
    familyName: {
      required: false,
      mutable: true,
    },
  },
  // You can add social providers like Google, Facebook, etc. here
});
