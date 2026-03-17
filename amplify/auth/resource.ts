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
    },
     
  },
  
  autoVerify: {
    email: true
  },
 
  // Define user groups
  groups: ['ADMINS', 'USERS'],

  // User attributes stored in Cognito
  userAttributes: {
    given_name: { required: true, mutable: true },
    family_name: { required: true, mutable: true },
    phone_number: { required: false, mutable: true },
  },
   
  senders: {
    email: {
    fromEmail: "no-reply@verificationemail.com",
    fromName: "Opportunity Crudes"
    }
  },

 // emailSettings: {servicePlan: "COGNITO_DEFAULT" },
  // Add the post-confirmation trigger
  triggers: {
    postConfirmation,
    preSignUp,         // ✅ new — blocks disposable emails
  },

  // You can add social providers likes Google, Facebook, etc. here
});
