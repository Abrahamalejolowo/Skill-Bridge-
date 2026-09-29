import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSafeNext(raw: string | null): string | null {
  if (!raw) return null
  // Only allow internal relative paths
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = getSafeNext(url.searchParams.get('next'))

  const isCreatorFlow = !!next && next.startsWith('/creator')
  const signInPath = isCreatorFlow ? '/auth/creator/sign-in' : '/sign-in'

  if (!code) {
    console.error('❌ No auth code in callback')
    return NextResponse.redirect(
      new URL(`${signInPath}?error=No authorization code`, url.origin)
    )
  }

  try {
    const supabase = await createClient()

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('❌ Exchange error:', exchangeError.message)
      return NextResponse.redirect(
        new URL(`${signInPath}?error=${encodeURIComponent(exchangeError.message)}`, url.origin)
      )
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()

    if (getUserError || !user) {
      console.error('❌ Get user error:', getUserError?.message || 'No user found')
      return NextResponse.redirect(
        new URL(`${signInPath}?error=Failed to get user`, url.origin)
      )
    }

    // ---------- CREATOR FLOW ----------
    if (isCreatorFlow) {
      const { data: creator } = await supabase
        .from('creator_profiles')
        .select('user_id, verification_status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!creator) {
        const { error: insertError } = await supabase
          .from('creator_profiles')
          .insert({
            user_id: user.id,
            contact_email: user.email,
            verification_status: 'pending',
          })

        if (insertError) {
          console.error('❌ Creator profile creation error:', insertError.message)
        }
      }

      // Already approved creators go straight to the dashboard
      if (creator?.verification_status === 'verified') {
        return NextResponse.redirect(new URL('/creator', url.origin))
      }

      return NextResponse.redirect(new URL(next!, url.origin))
    }

    // ---------- STUDENT FLOW (unchanged) ----------
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, completed_onboarding')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Profile query error:', profileError.message)
    }

    if (!profile) {
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
      }

      return NextResponse.redirect(new URL('/onboarding', url.origin))
    }

    if (!profile.completed_onboarding) {
      return NextResponse.redirect(new URL('/onboarding', url.origin))
    }

    return NextResponse.redirect(new URL(next || '/dashboard', url.origin))
  } catch (error) {
    console.error('❌ Callback error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      new URL(`${signInPath}?error=${encodeURIComponent(errorMsg)}`, url.origin)
    )
  }
}