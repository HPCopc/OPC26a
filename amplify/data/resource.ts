import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from '../functions/post-confirmation/resource';

const schema = a.schema({

  // ─────────────────────────────────────────────────────────────
  // USER PROFILE
  // Created automatically via postConfirmation Lambda.
  // Owner can read/update their own. Admins have full access.
  // ─────────────────────────────────────────────────────────────
  UserProfile: a.model({
    userId:           a.string().required(),
    email:            a.string().required(),
    givenName:        a.string(),
    familyName:       a.string(),
    phoneNumber:      a.string(),
    companyName:      a.string(),
    jobTitle:         a.string(),
    addressLine1:     a.string(),
    city:             a.string(),
    state:            a.string(),
    zipCode:          a.string(),
    country:          a.string(),
    subscriptionType: a.string().default("free"),
    profileCompleted: a.boolean().default(false),
  })
  .secondaryIndexes((index) => [
    index("userId"),
  ])
  .authorization((allow) => [
    allow.ownerDefinedIn("userId").to(["create", "read", "update", "delete"]),
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

  // ─────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────
  Page: a.model({
    slug:     a.string().required(),
    title:    a.string().required(),
    intro:    a.string(),
    status:   a.enum(["draft", "published"]),
    seo:      a.json(),
    featured: a.boolean().default(false),
    authorId: a.string(),
  })
  .identifier(["slug"])
  .authorization((allow) => [
    allow.publicApiKey().to(["read"]),
    allow.guest().to(["read"]),
    allow.authenticated().to(["read"]),
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

  // ─────────────────────────────────────────────────────────────
  // CONTENT META (public teaser data)
  // ─────────────────────────────────────────────────────────────
  ContentMeta: a.model({
    title:           a.string().required(),
    slug:            a.string().required(),
    intro:           a.string(),
    topic:           a.string().required(),
    subcat1:         a.string(),
    subcat2:         a.string(),
    date:            a.date().required(),
    isPublished:     a.boolean().default(true),
    isPublic:        a.boolean().default(false),
    authorId:        a.string(),
    imageUrl:        a.string(),
    seo:             a.string(),
    location:        a.string(),
    eventDate:       a.datetime(),
  })
  .secondaryIndexes((index) => [
    index("slug"),
    index("topic").sortKeys(["date"]),
    index("subcat1").sortKeys(["date"]),
    index("subcat2").sortKeys(["date"]),
  ])
 
  .authorization((allow) => [
  allow.publicApiKey().to(["read"]),
  allow.guest().to(["read"]),
  allow.authenticated().to(["read"]),
  allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
]),

  // ─────────────────────────────────────────────────────────────
  // CONTENT BODY (protected full content)
  // ─────────────────────────────────────────────────────────────
  ContentBody: a.model({
    metaId:  a.id().required(),
    body:    a.string(),
    s3Key:   a.string(),
    fileKey: a.string(),
  })
 
  .authorization((allow) => [
  allow.authenticated().to(["read"]),
  allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});