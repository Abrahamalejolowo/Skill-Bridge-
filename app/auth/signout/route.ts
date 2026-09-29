import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function handleSignOut(request: Request) {
  const supabase = await createClient()
  
  // Sign out the user from Supabase auth session
  await supabase.auth.signOut()

  // Redirect to login page after signing out
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
}

export async function GET(request: Request) {
  return handleSignOut(request)
}

export async function POST(request: Request) {
  return handleSignOut(request)
}