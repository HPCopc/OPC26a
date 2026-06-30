import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';
import { adminUsers } from './functions/adminUsers/resource';
import { HttpApi, HttpMethod, CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  adminUsers,
});

// Give adminUsers Lambda the User Pool ID it needs at runtime
backend.adminUsers.addEnvironment(
  'COGNITO_USER_POOL_ID',
  backend.auth.resources.userPool.userPoolId
);

// Grant adminUsers Lambda permission to call the Cognito admin APIs it uses
backend.adminUsers.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:ListUsers',
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminDisableUser',
      'cognito-idp:AdminEnableUser',
      'cognito-idp:AdminDeleteUser',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminRemoveUserFromGroup',
    ],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
);

const apiStack = backend.createStack('adminUserApiStack');

const httpApi = new HttpApi(apiStack, 'AdminUserApi', {
  apiName: 'adminUserApi',
  corsPreflight: {
    allowOrigins: ['*'],
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
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

backend.addOutput({
  custom: {
    adminUserApiUrl: httpApi.apiEndpoint,
  },
});