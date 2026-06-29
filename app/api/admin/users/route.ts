import { NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminDeleteUserCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId:     process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
  },
});
const POOL = process.env.COGNITO_USER_POOL_ID!;

// GET /api/admin/users — list all users
export async function GET() {
  try {
    const cmd    = new ListUsersCommand({ UserPoolId: POOL, Limit: 60 });
    const result = await client.send(cmd);
    return NextResponse.json(result.Users ?? []);
  } catch (err) {
    console.error('ListUsers error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/admin/users — create / disable / enable / delete / set-group
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'create') {
      await client.send(new AdminCreateUserCommand({
        UserPoolId:        POOL,
        Username:          body.email,
        TemporaryPassword: body.tempPassword,
        UserAttributes:    [{ Name: 'email', Value: body.email }, { Name: 'email_verified', Value: 'true' }],
      }));
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'disable') {
      await client.send(new AdminDisableUserCommand({ UserPoolId: POOL, Username: body.username }));
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'enable') {
      await client.send(new AdminEnableUserCommand({ UserPoolId: POOL, Username: body.username }));
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'delete') {
      await client.send(new AdminDeleteUserCommand({ UserPoolId: POOL, Username: body.username }));
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'set-group') {
      if (body.oldGroup) {
        await client.send(new AdminRemoveUserFromGroupCommand({ UserPoolId: POOL, Username: body.username, GroupName: body.oldGroup }));
      }
      await client.send(new AdminAddUserToGroupCommand({ UserPoolId: POOL, Username: body.username, GroupName: body.newGroup }));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}