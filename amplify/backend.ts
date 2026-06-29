import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';  
import { adminUsers } from './functions/adminUsers/resource';

const backend = defineBackend({
 auth,
 data,
 postConfirmation, 
 adminUsers,
});