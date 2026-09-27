import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from '../functions/post-confirmation/resource';
import { preSignUp } from '../auth/pre-sign-up/resource';

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
  // BLOCKED EMAIL DOMAIN
  // Domains that can't be used to sign up (gmail.com, comcast.net, ...).
  // Admin-only; managed at /admin/blocked-emails. The pre-sign-up Lambda
  // reads it with IAM (see the schema authorization below).
  // ─────────────────────────────────────────────────────────────
  BlockedEmailDomain: a.model({
    domain:   a.string().required(),   // lowercase, e.g. "gmail.com"
    category: a.enum(["personal", "isp", "disposable", "other"]),
    note:     a.string(),
  })
  .identifier(["domain"])
  .authorization((allow) => [
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
  // Admin-only. The public site reads through the published* queries below,
  // which never return drafts.
  .authorization((allow) => [
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
    // Composite keys so subcategory listings are scoped to their parents
    // ("general" exists under several subcat1s). Built by lib/taxonomy.ts.
    topicSubcat1:    a.string(),   // "news#opc"
    topicSubcat2:    a.string(),   // "news#opc#general"
    date:            a.date().required(),
    isPublished:     a.boolean().default(true),
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
    index("topicSubcat1").sortKeys(["date"]),
    index("topicSubcat2").sortKeys(["date"]),
  ])
  // Admin-only; see the published* queries.
  .authorization((allow) => [
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

  // ─────────────────────────────────────────────────────────────
  // PUBLIC CONTENT BODY
  // For topic = "events" or "resource" — no login required
  // ─────────────────────────────────────────────────────────────
  PublicContentBody: a.model({
    metaId:      a.id().required(),
    contentType: a.enum(["EVENTS", "RESOURCES"]),
    body:        a.string(),
    s3Key:       a.string(),
    fileKey:     a.string(),
  })
  .secondaryIndexes((index) => [
    index("metaId"),
    index("contentType"),
  ])
  // Admin-only; read via publishedPublicBody.
  .authorization((allow) => [
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

  // ─────────────────────────────────────────────────────────────
  // PROTECTED CONTENT BODY
  // For topic = "news", "top10", "video", "whitepaper" — login required
  // ─────────────────────────────────────────────────────────────
  ProtectedContentBody: a.model({
    metaId:      a.id().required(),
    contentType: a.enum(["NEWS", "TOP10", "VIDEOS", "WHITEPAPERS"]),
    body:        a.string(),
    s3Key:       a.string(),
    fileKey:     a.string(),
  })
  .secondaryIndexes((index) => [
    index("metaId"),
    index("contentType"),
  ])
  // Admin-only; signed-in users read via publishedProtectedBody.
  .authorization((allow) => [
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

  // ─────────────────────────────────────────────────────────────
  // HOME BOX
  // One box on the home page: gray header (optionally linked), then any
  // mix of description, buttons and a feed of the newest articles.
  // Admin-only; managed at /admin/home, read via publishedHomeBoxes.
  // ─────────────────────────────────────────────────────────────
  HomeBoxButton: a.customType({
    label:   a.string().required(),
    href:    a.string().required(),
    style:   a.string(),            // "primary" | "secondary"
    newTab:  a.boolean(),
  }),

  HomeBox: a.model({
    title:           a.string().required(),
    titleLink:       a.string(),
    column:          a.enum(["left", "right"]),
    sortOrder:       a.integer().required(),
    description:     a.string(),     // rich text HTML
    buttons:         a.ref("HomeBoxButton").array(),
    buttonsPosition: a.enum(["above", "below"]),  // relative to the news feed
    newsTopic:       a.string(),     // empty = no news feed
    newsSubcat1:     a.string(),
    newsSubcat2:     a.string(),
    newsLimit:       a.integer(),
    newsNumbered:    a.boolean(),
    showMore:        a.boolean(),
    moreLabel:       a.string(),
    moreLink:        a.string(),     // empty = the feed's listing page
    isPublished:     a.boolean().default(true),
  })
  .authorization((allow) => [
    allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
  ]),

  // ─────────────────────────────────────────────────────────────
  // PUBLISHED-ONLY READS
  // The content models above are admin-only, so drafts can't be read by
  // querying them directly with the public API key. The site reads through
  // these queries instead; their resolvers drop drafts before returning.
  // ─────────────────────────────────────────────────────────────
  PublishedPage: a.customType({
    slug:   a.string().required(),
    title:  a.string().required(),
    intro:  a.string(),
    status: a.string(),
  }),

  PublishedContent: a.customType({
    id:          a.id().required(),
    title:       a.string().required(),
    slug:        a.string().required(),
    intro:       a.string(),
    topic:       a.string().required(),
    subcat1:     a.string(),
    subcat2:     a.string(),
    date:        a.string().required(),
    isPublished: a.boolean(),
    imageUrl:    a.string(),
    location:    a.string(),
    eventDate:   a.string(),
  }),

  PublishedContentList: a.customType({
    items:     a.ref("PublishedContent").array(),
    nextToken: a.string(),
  }),

  PublishedBody: a.customType({
    body:    a.string(),
    s3Key:   a.string(),
    fileKey: a.string(),
  }),

  PublishedHomeBox: a.customType({
    id:              a.id().required(),
    title:           a.string().required(),
    titleLink:       a.string(),
    column:          a.string(),
    sortOrder:       a.integer(),
    description:     a.string(),
    buttons:         a.ref("HomeBoxButton").array(),
    buttonsPosition: a.string(),
    newsTopic:       a.string(),
    newsSubcat1:     a.string(),
    newsSubcat2:     a.string(),
    newsLimit:       a.integer(),
    newsNumbered:    a.boolean(),
    showMore:        a.boolean(),
    moreLabel:       a.string(),
    moreLink:        a.string(),
  }),

  publishedHomeBoxes: a.query()
    .returns(a.ref("PublishedHomeBox").array())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.custom({ dataSource: a.ref("HomeBox"), entry: "./resolvers/publishedHomeBoxes.js" })),

  publishedPage: a.query()
    .arguments({ slug: a.string().required() })
    .returns(a.ref("PublishedPage"))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.custom({ dataSource: a.ref("Page"), entry: "./resolvers/publishedPage.js" })),

  publishedPages: a.query()
    .arguments({ prefix: a.string() })
    .returns(a.ref("PublishedPage").array())
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.custom({ dataSource: a.ref("Page"), entry: "./resolvers/publishedPages.js" })),

  // field: "topic" | "topicSubcat1" | "topicSubcat2"
  publishedContentList: a.query()
    .arguments({
      field:     a.string().required(),
      value:     a.string().required(),
      limit:     a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref("PublishedContentList"))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.custom({ dataSource: a.ref("ContentMeta"), entry: "./resolvers/publishedContentList.js" })),

  publishedContentBySlug: a.query()
    .arguments({ slug: a.string().required() })
    .returns(a.ref("PublishedContent"))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler(a.handler.custom({ dataSource: a.ref("ContentMeta"), entry: "./resolvers/publishedContentBySlug.js" })),

  // Body of a published events/resources item.
  publishedPublicBody: a.query()
    .arguments({ slug: a.string().required() })
    .returns(a.ref("PublishedBody"))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()])
    .handler([
      a.handler.custom({ dataSource: a.ref("ContentMeta"), entry: "./resolvers/publishedBodyMeta.js" }),
      a.handler.custom({ dataSource: a.ref("PublicContentBody"), entry: "./resolvers/publishedBody.js" }),
    ]),

  // Body of a published news/videos/whitepapers item — signed-in users only.
  publishedProtectedBody: a.query()
    .arguments({ slug: a.string().required() })
    .returns(a.ref("PublishedBody"))
    .authorization((allow) => [allow.authenticated()])
    .handler([
      a.handler.custom({ dataSource: a.ref("ContentMeta"), entry: "./resolvers/publishedBodyMeta.js" }),
      a.handler.custom({ dataSource: a.ref("ProtectedContentBody"), entry: "./resolvers/publishedBody.js" }),
    ]),

})
// Grants the postConfirmation and preSignUp Lambdas IAM access to the data
// API and injects the AMPLIFY_DATA_* env vars they need to build a client.
// preSignUp only reads (BlockedEmailDomain).
.authorization((allow) => [
  allow.resource(postConfirmation).to(["query", "mutate"]),
  allow.resource(preSignUp).to(["query"]),
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});