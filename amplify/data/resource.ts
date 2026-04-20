import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from '../functions/post-confirmation/resource';

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
  .authorization(allow => [
    allow.ownerDefinedIn("userId").to(["create", "read", "update", "delete"]),
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),                        // ← closes UserProfile here with a comma

  Page: a.model({            // ← Page is now a sibling, not nested
    slug: a.string().required(),
    title: a.string().required(),
    sections: a.json().required(),
    status: a.enum(['draft', 'published']),  // ← removed .required()
    seo: a.json(),
    featured: a.boolean().default(false),
    authorId: a.string(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization(allow => [
    allow.guest().to(['read']),
    allow.authenticated().to(['read']),
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),                        // ← closes Page here with a comma

})
.authorization((allow) => [
  allow.resource(postConfirmation).to(['mutate']),
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});