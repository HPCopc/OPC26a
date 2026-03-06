// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from '../../app/functions/Post-confirmation/resource';

const schema = a.schema({
  UserProfile: a.model({
    id: a.id().required(),
    userId: a.string().required(),

    email: a.string().required(),
    givenName: a.string(),
    familyName: a.string(),
    phoneNumber: a.string(),

    companyName: a.string(),
    jobTitle: a.string(),
    addressLine1: a.string(),
    city: a.string(),
    state: a.string(),
    zipCode: a.string(),
    country: a.string(),

    subscriptionType: a.string(),

    profileCompleted: a.boolean(),

    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [
    allow.ownerDefinedIn("userId").to(["create", "read", "update", "delete"]),
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
    allow.resource(postConfirmation).to(["create", "update"]),
  ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});