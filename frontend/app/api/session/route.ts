import {supabase} from '../init'
import { NextResponse } from 'next/server'



export async function GET() {

  const { data: { session } } = await supabase.auth.getSession()
  return NextResponse.json(session)
}