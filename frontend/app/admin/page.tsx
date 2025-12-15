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
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || !(await isAdmin(supabase, user.id))) {
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