import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check verification status from creator_profiles
    const { data: creatorProfile, error: profileError } = await supabase
      .from('creator_profiles')
      .select('verification_status, rejection_reason')
      .eq('user_id', authData.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile query error:', profileError)
      return NextResponse.json(
        { error: 'Failed to load creator profile' },
        { status: 500 }
      )
    }

    if (!creatorProfile) {
      // Sign out user if no profile found
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Creator profile not found. Please sign up first.' },
        { status: 404 }
      )
    }

    // Check verification status - PENDING
    if (creatorProfile.verification_status === 'pending') {
      // IMPORTANT: Sign out the user so they can't access dashboard
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          success: false,
          error: 'Account verification pending',
          verification_status: 'pending',
          message: 'Your account is pending verification by our team. This typically takes 1-2 hours.',
        },
        { status: 403 }
      )
    }

    // Check verification status - REJECTED
    if (creatorProfile.verification_status === 'rejected') {
      // Sign out user
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          success: false,
          error: 'Account rejected',
          verification_status: 'rejected',
          rejection_reason: creatorProfile.rejection_reason,
          message: `Your account has been rejected. ${
            creatorProfile.rejection_reason 
              ? 'Reason: ' + creatorProfile.rejection_reason 
              : 'Please contact support.'
          }`,
        },
        { status: 403 }
      )
    }

    // Status is VERIFIED - Allow login
    return NextResponse.json(
      {
        success: true,
        message: 'Signed in successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        verification_status: 'verified',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Sign in server error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in' },
      { status: 500 }
    )
  }
}