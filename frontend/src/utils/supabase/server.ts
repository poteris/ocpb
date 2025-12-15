// for more info on how this works see: https://supabase.com/docs/guides/auth/server-side/nextjs
// NOTE: this is the server-side supabase client
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      db: { schema: process.env.SUPABASE_SCHEMA || 'public' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
           console.error('Error setting cookies', error)
          }
        },
      },
    }
  )
}