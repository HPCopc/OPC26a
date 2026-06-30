import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';
import { adminUsers } from './functions/adminUsers/resource';
import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  adminUsers,
});

// ── Create HTTP API for adminUsers Lambda ──
const apiStack = backend.createStack('adminUserApiStack');

const httpApi = new HttpApi(apiStack, 'AdminUserApi', {
  apiName: 'adminUserApi',
  corsPreflight: {
    allowOrigins: ['*'],
    allowMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.OPTIONS],
    allowHeaders: ['Content-Type'],
  },
});

const adminUsersIntegration = new HttpLambdaIntegration(
  'AdminUsersIntegration',
  backend.adminUsers.resources.lambda
);

httpApi.addRoutes({
  path: '/admin/users',
  methods: [HttpMethod.GET, HttpMethod.POST],
  integration: adminUsersIntegration,
});

// Output the API URL so we can find it after deploy
backend.addOutput({
  custom: {
    adminUserApiUrl: httpApi.apiEndpoint,
  },
});