// amplify/functions/adminUsers/resource.ts
import { defineFunction } from '@aws-amplify/backend';

export const adminUsers = defineFunction({
  name: 'adminUsers',
  entry: './index.js',
});