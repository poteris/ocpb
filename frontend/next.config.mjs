/** @type {import('next').NextConfig} */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { createClient } from '@supabase/supabase-js';

/**
 * Currently we are only allowing one admin user
 * Future implementations will allow multiple admin users
 * This function ensures that there is only one admin user
 * and creates a new one if there are none
 * NOTE: for this to work, the ADMIN_EMAIL environment variable must be set
 */
export async function signUpAdmin() {
  try {
    if (!process.env.ADMIN_EMAIL) {
      console.log('No ADMIN_EMAIL provided, skipping admin user setup');
      return;
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
      {db: {schema: process.env.SUPABASE_SCHEMA || 'public'}}
    );

    // Check if a supabase user exists with the email process.env.ADMIN_EMAIL
    const { data: existingUsers, error: listUsersError } = await supabase.auth.admin.listUsers();
    if (listUsersError) {
      throw new Error(`Failed to list users: ${listUsersError.message}`);
    }
    
    if (!existingUsers?.users) {
      throw new Error('No users data returned from Supabase');
    }

    const supabaseUser = existingUsers.users.find(user => user.email === process.env.ADMIN_EMAIL);
    
    // Check if admin profile exists
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select()
      .eq('is_admin', true)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(`Failed to check admin profile: ${profileError.message}`);
    }

    const adminSetupRequired = !supabaseUser || !adminProfile;

    if (adminSetupRequired) {
      if (!supabaseUser) {
        // Create a new supabase user
        supabaseUser = await createSupabaseUser(supabase);
      } else {
        console.log(`Admin user ${process.env.ADMIN_EMAIL} already exists`);
      }
      
      if (!adminProfile) {
        await createAdminUserProfile(supabase, supabaseUser);
      }

      const { error: revokeError } = await supabase.rpc('revoke_service_privileges');
      if (revokeError) {
        throw new Error(`Failed to revoke service privileges: ${revokeError.message}`);
      }
      
      console.log('Admin user setup complete: Service role privileges revoked');
    }
  } catch (error) {
    console.error('Error in signUpAdmin:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Admin user setup failed:', errorMessage);
  }
}

signUpAdmin();


const nextConfig = {
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  compiler: {
    reactRemoveProperties: false
  }
};

export default nextConfig;

async function createAdminUserProfile(supabase, supabaseUser) {
  const { error } = await supabase.from('profiles').upsert({
    user_id: supabaseUser.id,
    email: supabaseUser.email,
    is_admin: true
  });
  if (error) {
    console.error('Error upserting admin user profile:', error);
    throw new Error(`Failed to create admin profile: ${error.message}`);
  } 
  console.log('New admin user profile created:', supabaseUser.email, 'for schema:', process.env.SUPABASE_SCHEMA);
}
async function getAdminUserProfile(supabase, supabaseUser) {
  // Check if the admin user has a profile in the current schema
  const { data: adminUserProfile, error: queryError } = await supabase
  .from('profiles')
  .select()
  .eq('is_admin', true).eq('user_id', supabaseUser.id);

  if (queryError) {
    throw new Error(`Failed to check admin user profile: ${queryError.message}`);
  }
  return adminUserProfile;
}

async function createSupabaseUser(supabase) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: process.env.ADMIN_EMAIL,
    email_confirm: true
    /* This confirms the email without sending verification
     on startup we expect the creator of the app to add the admin user manually
     so don't need to verify the email */
  });
  if (error || !data.user) {
    throw new Error(`Failed to create supabase admin user: ${error.message}`);
  } else {
    console.log('New supabase admin user created:', data.user.email);
  }
  return data.user;
}

