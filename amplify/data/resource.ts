// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from '../../app/functions/Post-confirmation/resource';

// const postConfirmationFunction = postConfirmation.resources?.lambda || postConfirmation;

const schema = a.schema({
  UserProfile: a.model({
// define fields in dynamodb
    // Primary key = Cognito sub (string). Using 'id' keeps client API simple. DynamoDB primary key 
    id: a.id().required(),
    // Keep a copy of sub here for owner rules  Cognito-based
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
    // keep your original name or consider renaming to 'subscriptionType'
    subscriptionType: a.string(),
// New: flag to control onboarding flow
    profileCompleted: a.boolean(),
    // Let the backend manage these; do not mark required
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
     .authorization(allow => [
      // Owner = the user whose sub is stored in userId
      allow.ownerDefinedIn("userId").to(["create", "read", "update", "delete"]),

      // If you want all signed-in users to read other profiles, keep this.
      // Otherwise, remove this line to enforce owner-only read.
      // allow.authenticated().to(['read']),

      allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
      allow.resource(postConfirmation).to(["create","update"])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // Remove apiKey unless you add apiKey-based rules above
    // apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
