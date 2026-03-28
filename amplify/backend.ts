import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';  

const backend = defineBackend({
 auth,
 data,
 postConfirmation, 
});