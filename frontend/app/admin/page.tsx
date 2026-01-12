import { createClient } from '@/utils/supabase/server'
import LoginForm from '@/components/AdminLogin/LoginForm'
import { SiteAdmin } from '@/components/screens/SiteAdmin'

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single()
  
  if (error || !data) {
    return false
  }
  
  return data.is_admin
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  try {
    // Use getClaims() instead of getUser() - it validates the JWT signature
    // against the project's published public keys every time, making it safe
    // to trust in server code.
    const { data, error } = await supabase.auth.getClaims()
    
    if (error || !data || !(await isAdmin(supabase, data.claims.sub))) {
      return <LoginForm />
    }

    return (
      <SiteAdmin />
    )
  } catch (error) {
    console.error('Error in AdminPage:', error)
    return <div>Unable to access admin page. Please try again later.</div>
  }
}