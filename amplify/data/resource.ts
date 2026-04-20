// amplify/data/resource.ts
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
      // Owner = the user whose sub is stored in userId
      allow.ownerDefinedIn("userId").to(["create", "read", "update", "delete"]),
      // allow.publicApiKey(),  
      // If you want all signed-in users to read other profiles, keep this.
      // Otherwise, remove this line to enforce owner-only read.
      // allow.authenticated().to(['read']),

      allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
            
       
    ]),

    // NEW: Page model for CMS content
    Page: a.model({
    // Basic page info
    slug: a.string().required(),
    title: a.string().required(),
    sections: a.json().required(),
    status: a.enum(['draft', 'published']).required(),
    
    // SEO metadata
    seo: a.json(),
    
    // Optional: Featured page flag
    featured: a.boolean().default(false),
    
    // Author tracking
    authorId: a.string(),
    
    // Automatic timestamps
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
    .authorization(allow => [
      // Anyone can read published pages
      allow.guest().to(['read']),
      
      // Authenticated users can read all pages (including drafts)
      allow.authenticated().to(['read']),
      
      // Only ADMINS group can create, update, delete
      allow.groups(["ADMINS"]).to(["create", "read", "update", "delete"]),
    ]),

// end of page model
})

.authorization((allow) => [
  allow.resource(postConfirmation).to(['mutate']), // ✅ fixed
]);

 
export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
   // defaultAuthorizationMode: "apiKey", 
   defaultAuthorizationMode: "userPool",  
  //  apiKeyAuthorizationMode: {
  //    expiresInDays: 7,
  //  },   
  },
});
