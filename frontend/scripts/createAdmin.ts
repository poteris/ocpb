import { createClient } from '@supabase/supabase-js';

// Create connection using the special admin key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureSingleAdmin() {
  // Step 1: Find any existing admin users
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const adminUsers = existingUsers?.users.filter(
    user => user.user_metadata?.role === 'admin'
  );

  // Step 2: Delete all existing admin users
  for (const user of adminUsers || []) {
    await supabase.auth.admin.deleteUser(user.id);
  }

  // Step 3: Create the new admin user
  const { data, error } = await supabase.auth.admin.createUser({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
    user_metadata: {
      role: 'admin'
    },
    email_confirm: true
  });

  if (error) {
    console.error('Failed to create new admin:', error.message);
  } else {
    console.log('New admin user created:', data.user.email);
  }
}

// Run the function
ensureSingleAdmin();