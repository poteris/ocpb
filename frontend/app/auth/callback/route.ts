import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
// admin user is redirected to the admin page after login
  return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin`, request.url))
}