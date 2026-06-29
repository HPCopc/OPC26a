import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

const POOL = process.env.COGNITO_USER_POOL_ID;

// Amplify Gen 2 Lambda handler
export const handler = async (event) => {
  try {
    const method = event.requestContext.http.method;

    // ───────────────────────────────
    // GET /admin/users → list users
    // ───────────────────────────────
    if (method === "GET") {
      const cmd = new ListUsersCommand({
        UserPoolId: POOL,
        Limit: 60,
      });

      const result = await client.send(cmd);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.Users ?? []),
      };
    }

    // ───────────────────────────────
    // POST /admin/users → admin actions
    // ───────────────────────────────
    if (method === "POST") {
      const body = JSON.parse(event.body);

      if (body.action === "create") {
        await client.send(
          new AdminCreateUserCommand({
            UserPoolId: POOL,
            Username: body.email,
            TemporaryPassword: body.tempPassword,
            UserAttributes: [
              { Name: "email", Value: body.email },
              { Name: "email_verified", Value: "true" },
            ],
          })
        );
        return ok();
      }

      if (body.action === "disable") {
        await client.send(
          new AdminDisableUserCommand({
            UserPoolId: POOL,
            Username: body.username,
          })
        );
        return ok();
      }

      if (body.action === "enable") {
        await client.send(
          new AdminEnableUserCommand({
            UserPoolId: POOL,
            Username: body.username,
          })
        );
        return ok();
      }

      if (body.action === "delete") {
        await client.send(
          new AdminDeleteUserCommand({
            UserPoolId: POOL,
            Username