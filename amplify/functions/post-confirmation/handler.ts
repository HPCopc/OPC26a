import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/post-confirmation';
import type { Schema } from '../../data/resource';
// import type { Schema } from '../../../amplify/data/resource';
console.log('🔧 Loading Lambda function...');

// ---- Configure Amplify Data client at module load (ESM supports top-level await)
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);

console.log('📡 GraphQL Endpoint:', resourceConfig.API?.GraphQL?.endpoint);
console.log('🌍 Region:', resourceConfig.API?.GraphQL?.region);


Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>({
  authMode: 'iam'  // <-- This is critical!
});

// Small helpers to sanitize optional attributes
const s = (v?: string | null) => (typeof v === 'string' ? v.trim() : '');
const toLower = (v?: string | null) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

export const handler: PostConfirmationTriggerHandler = async (event) => {
 const sub = event.request.userAttributes.sub;
 const email = toLower(event.request.userAttributes.email);
 const givenName = s(event.request.userAttributes.given_name);
 const familyName = s(event.request.userAttributes.family_name);
 const phoneNumber = s(event.request.userAttributes.phone_number);

 console.log(`Post-confirmation triggered for user: ${sub}`);

 try {

  // First, test if we can even connect to the GraphQL API
  console.log('🔍 Testing GraphQL connection...');
  
  // Try fetch by PK
  console.log(`🔍 Attempting to get profile for: ${sub}`);
  // Try fetch by PK (we set id === sub)
  const existing = await client.models.UserProfile.get({ id: sub });

console.log('📊 Get result:', JSON.stringify(existing, null, 2));


  if (existing.data) {
   console.log(`ℹ️ Profile exists for ${sub}. Updating basic attributes if changed.`);
   const updateResult = await client.models.UserProfile.update({
    id: sub,
    userId: sub,
    email: email || existing.data.email || '',
    givenName: givenName || existing.data.givenName || '',
    familyName: familyName || existing.data.familyName || '',
    phoneNumber: phoneNumber || existing.data.phoneNumber || '',
   });
   
   if (updateResult.data) {
     console.log(`✅ Profile updated successfully for: ${sub}`);
     console.log('✅ Update result:', JSON.stringify(updateResult.data, null, 2));
   } else {
     console.error('❌ Update failed:', JSON.stringify(updateResult.errors, null, 2));
   }
   
  } else {
        
   // Create new profile
   const result = await client.models.UserProfile.create({
    id: sub,    // PK
    userId: sub,  // owner field for ownerDefinedIn
    email: email || '',
    givenName,
    familyName,
    phoneNumber,

    // Defaults for optional fields you’ll fill later
    companyName: '',
    jobTitle: '',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    subscriptionType: 'free',  // <-- match your schema’s casing
    profileCompleted: false,
   });
console.log('📊 Create result:', JSON.stringify(result, null, 2));

   if (result.data?.id) {
    console.log(`✅ Created profile for: ${sub}`);
   } else {
    console.error('❌ Failed to create profile:', result.errors);
   }
  }

  console.log(`🏁 Handler completed successfully for user: ${sub}`);
 } catch (error: any) {

  console.error('❌ ERROR CAUGHT in post-confirmation handler:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Log the full error object for debugging
  try {
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  } catch (e) {
    console.error('Could not stringify full error');
  }


  // Optional: handle race where record already exists
  if (error?.errors?.some((e: any) => String(e.message || '').includes('already exists'))) {
   console.warn('⚠️ Create collided (already exists). Falling back to update.');
   await client.models.UserProfile.update({
    id: sub,
    userId: sub,
    email: email || '',
    givenName,
    familyName,
    phoneNumber,
   });
  } else {
   console.error('❌ Error in post-confirmation handler:', error);
   // Do not throw — Cognito confirmation must not be blocked
  }
 }

 return event;
};

