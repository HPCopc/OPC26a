import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from '../app/functions/Post-confirmation/resource';  

defineBackend({
 // auth,
 data,
 postConfirmation, 
});
