import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { postConfirmation } from './functions/post-confirmation/resource';
import { adminUsers } from './functions/adminUsers/resource';
import { HttpApi, HttpMethod, CorsHttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  adminUsers,
});

// IMPORTANT: replace this with your actual Cognito User Pool ID
// (AWS Console → Cognito → User Pools → your pool → Pool ID)
const USER_POOL_ID = 'us-east-1_EXCmFy428';

// Hardcoded literal value — avoids a cross-stack CDK token,
// which is what caused the circular dependency with auth/function stacks
backend.adminUsers.addEnvironment('COGNITO_USER_POOL_ID', USER_POOL_ID);

const functionStack = Stack.of(backend.adminUsers.resources.lambda);

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
    // Wildcard built from the function's own stack region/account —
    // no token import from the auth stack, so no circular dependency
    resources: [`arn:aws:cognito-idp:${functionStack.region}:${functionStack.account}:userpool/${USER_POOL_ID}`],
  })
);

const apiStack = backend.createStack('adminUserApiStack');

const httpApi = new HttpApi(apiStack, 'AdminUserApi', {
  apiName: 'adminUserApi',
  corsPreflight: {
    allowOrigins: [
      'https://main.d1lw1esjveekyl.amplifyapp.com',
      'http://localhost:3000',
      'http://192.168.0.102:3000',
    ],
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});

const adminUsersIntegration = new HttpLambdaIntegration(
  'AdminUsersIntegration',
  backend.adminUsers.resources.lambda
);

// Reject any request without a valid token from this app's user pool.
// The Lambda additionally requires the caller to be in ADMINS.
const adminUsersAuthorizer = new HttpUserPoolAuthorizer(
  'AdminUsersAuthorizer',
  backend.auth.resources.userPool,
  { userPoolClients: [backend.auth.resources.userPoolClient] }
);

httpApi.addRoutes({
  path: '/admin/users',
  methods: [HttpMethod.GET, HttpMethod.POST],
  integration: adminUsersIntegration,
  authorizer: adminUsersAuthorizer,
});

backend.addOutput({
  custom: {
    adminUserApiUrl: httpApi.apiEndpoint,
  },
});