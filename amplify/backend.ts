import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';
import { adminUsers } from './functions/adminUsers/resource';
import { HttpApi, HttpMethod, CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  adminUsers,
});

const apiStack = backend.createStack('adminUserApiStack');

const httpApi = new HttpApi(apiStack, 'AdminUserApi', {
  apiName: 'adminUserApi',
  corsPreflight: {
    allowOrigins: ['*'],
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],  // ← fixed
    allowHeaders: ['Content-Type'],
  },
});

const adminUsersIntegration = new HttpLambdaIntegration(
  'AdminUsersIntegration',
  backend.adminUsers.resources.lambda
);

httpApi.addRoutes({
  path: '/admin/users',
  methods: [HttpMethod.GET, HttpMethod.POST],   // ← stays as HttpMethod here, this is correct
  integration: adminUsersIntegration,
});

backend.addOutput({
  custom: {
    adminUserApiUrl: httpApi.apiEndpoint,
  },
});