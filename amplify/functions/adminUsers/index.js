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

// No manual credentials — Lambda's execution role is used automatically
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

const POOL = process.env.COGNITO_USER_POOL_ID;

const ALLOWED_GROUPS = ["ADMINS", "USERS"];

function ok() {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
}

function error(statusCode, message) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: message }),
  };
}

// HTTP API JWT authorizers pass array claims as a string like "[ADMINS USERS]"
function callerGroups(claims) {
  const raw = claims["cognito:groups"];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string") return [];
  return raw.replace(/^\[|\]$/g, "").split(/[\s,]+/).filter(Boolean);
}

// Amplify Gen 2 Lambda handler
export const handler = async (event) => {
  try {
    const method = event.requestContext.http.method;

    // The API Gateway authorizer has already verified the token;
    // only members of ADMINS may use this API.
    const claims = event.requestContext.authorizer?.jwt?.claims ?? {};
    if (!callerGroups(claims).includes("ADMINS")) {
      return error(403, "Forbidden");
    }
    const callerUsername = claims.username ?? claims["cognito:username"];

    // GET /admin/users → list users
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

    // POST /admin/users → admin actions
    if (method === "POST") {
      const body = JSON.parse(event.body ?? "{}");

      // Prevent admins from locking themselves out
      const selfTargeting = ["disable", "delete", "set-group"].includes(body.action);
      if (selfTargeting && body.username === callerUsername) {
        return error(400, "You cannot change your own account here");
      }

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
            Username: body.username,
          })
        );
        return ok();
      }

      if (body.action === "set-group") {
        if (!ALLOWED_GROUPS.includes(body.newGroup)) {
          return error(400, "Invalid group");
        }
        if (body.oldGroup && !ALLOWED_GROUPS.includes(body.oldGroup)) {
          return error(400, "Invalid group");
        }
        // Add before removing so a failure never leaves the user in no group
        await client.send(
          new AdminAddUserToGroupCommand({
            UserPoolId: POOL,
            Username: body.username,
            GroupName: body.newGroup,
          })
        );
        if (body.oldGroup && body.oldGroup !== body.newGroup) {
          await client.send(
            new AdminRemoveUserFromGroupCommand({
              UserPoolId: POOL,
              Username: body.username,
              GroupName: body.oldGroup,
            })
          );
        }
        return ok();
      }

      return error(400, "Unknown action");
    }

    return error(405, "Method not allowed");

  } catch (err) {
    console.error("adminUsers error:", err);
    return error(500, "Internal server error");
  }
};