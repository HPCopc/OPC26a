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
  
  
    // Last name (automatically appears in sign-up form)
     
  },  // ← ADD THIS CLOSING BRACE!
  
  // You can add social provider like Google, Facebook, etc. here
});
