import { supabase } from '../init'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { email, redirectUrl } = await request.json()
    const { error } = await supabase.auth.signInWithOtp({
        email: email,
      options: {
        emailRedirectTo: redirectUrl.toString(),
        data: {
          csrf_protection: true
        }
      }
        })
    return NextResponse.json({ error })
}