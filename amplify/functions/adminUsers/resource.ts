import { defineFunction } from '@aws-amplify/backend';

export const adminUsers = defineFunction({
  name: 'adminUsers',
  entry: './index.js',
  timeoutSeconds: 30,
  memoryMB: 512,
});