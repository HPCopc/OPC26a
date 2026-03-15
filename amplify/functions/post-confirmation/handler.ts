import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/post-confirmation';
// import type { Schema } from '../../data/resource';
import type { Schema } from '../../../amplify/data/resource';

// ---- Configure Amplify Data client at module load (ESM supports top-level await)
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

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
  // Try fetch by PK (we set id === sub)
  const existing = await client.models.UserProfile.get({ id: sub });

  if (existing.data) {
   console.log(`ℹ️ Profile exists for ${sub}. Updating basic attributes if changed.`);
   await client.models.UserProfile.update({
    id: sub,
    userId: sub,
    email: email || existing.data.email || '',
    givenName: givenName || existing.data.givenName || '',
    familyName: familyName || existing.data.familyName || '',
    phoneNumber: phoneNumber || existing.data.phoneNumber || '',
   });
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

   if (result.data?.id) {
    console.log(`✅ Created profile for: ${sub}`);
   } else {
    console.error('❌ Failed to create profile:', result.errors);
   }
  }
 } catch (error: any) {
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

