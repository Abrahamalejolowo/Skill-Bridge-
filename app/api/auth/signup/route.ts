import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json()

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    if (!['student', 'creator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up with Supabase
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: { role }, // Pass role in metadata safely here instead
      },
    })

    if (signupError) {
      return NextResponse.json(
        { error: signupError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    // Create profile based on role
    if (role === 'student') {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          email: email,
          completed_onboarding: false,
        })

      if (profileError) {
        console.error('Error creating student profile:', profileError)
      }
    } else if (role === 'creator') {
      const { error: creatorError } = await supabase
        .from('creator_profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          organization_name: '',
          contact_email: email,
          verification_status: 'pending',
        })

      if (creatorError) {
        console.error('Error creating creator profile:', creatorError)
      }
    }

    // Update user table with role (if table exists)
    const { error: userUpdateError } = await supabase
      .from('user')
      .upsert({ id: authData.user.id, email, role })

    if (userUpdateError) {
      console.error('Error updating user table:', userUpdateError)
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: 'Account created successfully. Check your email for confirmation.',
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error?.message || 'An error occurred during signup' },
      { status: 500 }
    )
  }
}