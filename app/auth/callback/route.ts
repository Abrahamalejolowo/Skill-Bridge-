import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/dashboard'

  console.log('🔐 Auth callback triggered')
  console.log('Code:', code ? 'Present' : 'Missing')
  console.log('Next redirect:', next)

  if (!code) {
    console.error('❌ No auth code in callback')
    return NextResponse.redirect(
      new URL('/sign-in?error=No authorization code', url.origin)
    )
  }

  try {
    const supabase = await createClient()

    // Exchange code for session
    console.log('📝 Exchanging code for session...')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('❌ Exchange error:', exchangeError.message)
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(exchangeError.message)}`, url.origin)
      )
    }

    // Get the authenticated user
    console.log('👤 Fetching user...')
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()

    if (getUserError || !user) {
      console.error('❌ Get user error:', getUserError?.message || 'No user found')
      return NextResponse.redirect(
        new URL('/sign-in?error=Failed to get user', url.origin)
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, completed_onboarding')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Profile query error:', profileError.message)
    }

    // If profile doesn't exist, create it (new user)
    if (!profile) {
      console.log('🆕 New user - creating profile...')
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          email: user.email,
          completed_onboarding: false,
        })

      if (createError) {
        console.error('❌ Profile creation error:', createError.message)
        // Don't fail here - continue anyway
      } else {
        console.log('✅ Profile created successfully')
      }

      // New users always go to onboarding
      console.log('➡️ Redirecting new user to /onboarding')
      return NextResponse.redirect(new URL('/onboarding', url.origin))
    }

    // Existing user - check onboarding status
    if (!profile.completed_onboarding) {
      console.log('➡️ Redirecting to /onboarding (incomplete)')
      return NextResponse.redirect(new URL('/onboarding', url.origin))
    }

    // User has completed onboarding
    console.log('➡️ Redirecting to /dashboard')
    return NextResponse.redirect(new URL('/dashboard', url.origin))
  } catch (error) {
    console.error('❌ Callback error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorMsg)}`, url.origin)
    )
  }
}