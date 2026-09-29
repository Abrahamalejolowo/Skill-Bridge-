import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Falls back to the request origin if NEXT_PUBLIC_SITE_URL isn't set
    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // "next" tells the callback this is a creator, so it skips the student flow
        emailRedirectTo: `${origin}/auth/callback?next=/creator/onboarding`,
      },
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    // creator_profiles row is created in /auth/callback (once the user has a
    // session) and upserted again during onboarding, so no insert here.

    return NextResponse.json({
      success: true,
      message: 'Account created',
      needsEmailConfirmation: !authData.session,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error: any) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    )
  }
}