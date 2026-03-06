import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from "../functions/post-confirmation/resource";

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
    
  // Define user groups
  groups: ['ADMINS', 'USERS'],

  // User attributes stored in Cognito
  userAttributes: {
    givenName: { required: false, mutable: true },
    familyName: { required: false, mutable: true },
    phoneNumber: { required: false, mutable: true },
  },
  // Add the post-confirmation trigger
  triggers: {
    postConfirmation,
  },

  // You can add social providers likes Google, Facebook, etc. here
});