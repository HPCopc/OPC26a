import { defineAuth } from "@aws-amplify/backend";
import { postConfirmation } from '../functions/post-confirmation/resource';
import { preSignUp } from './pre-sign-up/resource'; // ✅ Add this

/**
 * Define and configure your auth resource
 * userAttributes: last first names ... all store in cognito user pool 
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
    verificationEmailSubject: 'Welcome! Verify your email!',
    verificationEmailStyle: 'CODE',
    verificationEmailBody: 'Your verification code is {####}', // ✅ Perfect!
    },
     
  },
    
  // Define user groups
  groups: ['ADMINS', 'USERS'],

  // User attributes stored in Cognito
  userAttributes: {
    givenName: { required: true, mutable: true },
    familyName: { required: true, mutable: true },
    phoneNumber: { required: false, mutable: true },
  },
   
 // emailSettings: {servicePlan: "COGNITO_DEFAULT" },
  // Add the post-confirmation trigger
  triggers: {
    postConfirmation,
    preSignUp,         // ✅ new — blocks disposable emails
  },

  // You can add social providers likes Google, Facebook, etc. here
});