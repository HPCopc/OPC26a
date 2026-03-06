import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { postConfirmation } from '../app/functions/Post-confirmation/resource';  

defineBackend({
  auth,
  data,
  postConfirmation, 
});
