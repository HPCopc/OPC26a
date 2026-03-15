import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'post-confirmation', // This name is referenced in auth.resource.ts
  entry: './handler.ts',

  // Optional: Environment variables- copilot recommend to remove
 // environment: {
  //  GROUP_NAME: 'EVERYONE',
 //   TABLE_NAME: 'UserProfile',
 //  },

  timeoutSeconds: 60, // Optional: configure timeout
  memoryMB: 512,      // Optional: configure memory
});
