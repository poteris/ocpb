import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// First login as admin
const { data: adminAuth } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!
  });
  
  // Try to read all users
  const { data: conversations } = await supabase.from('conversations').select('*');
  
  // Print what you got
  console.log(conversations);
