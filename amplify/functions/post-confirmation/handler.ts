import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { env } from '$amplify/env/post-confirmation';
import type { Schema } from '../../data/resource';

console.log('🔧 Loading Lambda function...');

// Configured on first use, not at module load. A failure here used to happen
// during Lambda INIT, before the handler's try/catch existed, so Cognito
// surfaced it to the user and blocked sign-up and password reset.
let cachedClient: ReturnType<typeof generateClient<Schema>> | null = null;

async function getClient() {
  if (!cachedClient) {
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env as any);

    console.log('📡 GraphQL Endpoint:', resourceConfig.API?.GraphQL?.endpoint);
    console.log('🌍 Region:', resourceConfig.API?.GraphQL?.region);

    Amplify.configure(resourceConfig, libraryOptions);

    cachedClient = generateClient<Schema>({
      authMode: 'iam'  // <-- This is critical!
    });
  }
  return cachedClient;
}

// The data client returns GraphQL errors instead of throwing them. Throw so
// every failure goes through the handler's catch.
const writeError = (op: string, errors: unknown) =>
  Object.assign(new Error(`UserProfile ${op} failed`), { errors });

// Small helpers to sanitize optional attributes
const s = (v?: string | null) => (typeof v === 'string' ? v.trim() : '');
const toLower = (v?: string | null) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

export const handler: PostConfirmationTriggerHandler = async (event) => {
 const sub = event.request.userAttributes.sub;
 const email = toLower(event.request.userAttributes.email);
 const givenName = s(event.request.userAttributes.given_name);
 const familyName = s(event.request.userAttributes.family_name);
 const phoneNumber = s(event.request.userAttributes.phone_number);
const companyName = s(event.request.userAttributes['custom:companyName'] ?? event.request.userAttributes.companyName);

 console.log(`Post-confirmation triggered for user: ${sub} (${event.triggerSource})`);

 try {
  const client = await getClient();

  // Try fetch by PK (we set id === sub)
  console.log(`🔍 Attempting to get profile for: ${sub}`);
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
     companyName: companyName || existing.data.companyName || '',
   });

   if (!updateResult.data) throw writeError('update', updateResult.errors);
   console.log(`✅ Profile updated successfully for: ${sub}`);

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
    companyName: companyName || '',
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

   if (!result.data?.id) throw writeError('create', result.errors);
   console.log(`✅ Created profile for: ${sub}`);
  }

  console.log(`🏁 Handler completed successfully for user: ${sub}`);
 } catch (error: any) {

  console.error('❌ ERROR CAUGHT in post-confirmation handler:');
  console.error('Error name:', error?.name);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);

  console.error('Errors:', JSON.stringify(error?.errors ?? null, null, 2));

  let recovered = false;

  // Optional: handle race where create collided with an existing record
  if (cachedClient && error?.errors?.some((e: any) => String(e.message || '').includes('already exists'))) {
   console.warn('⚠️ Create collided (already exists). Falling back to update.');
   try {
    const retry = await cachedClient.models.UserProfile.update({
     id: sub,
     userId: sub,
     email: email || '',
     givenName,
     familyName,
     phoneNumber,
     companyName,
    });
    recovered = Boolean(retry.data);
    if (!recovered) console.error('❌ Fallback update also failed:', JSON.stringify(retry.errors, null, 2));
   } catch (retryError) {
    console.error('❌ Fallback update also failed:', retryError);
   }
  }

  // Stable marker for a CloudWatch metric filter / alarm. The user can still
  // sign in; onboarding creates the missing profile on their next login.
  if (!recovered) {
   console.error(`PROFILE_WRITE_FAILED sub=${sub} trigger=${event.triggerSource}`);
  }
 }

 // Always return the event. Cognito sign-up and password reset must never be
 // blocked by a profile-write failure.
 return event;
};
