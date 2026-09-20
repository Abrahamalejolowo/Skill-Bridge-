import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Small delay to ensure session is persisted
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch user profile status
        const { data: profile } = await supabase
          .from('profiles')
          .select('completed_onboarding')
          .eq('id', user.id)
          .maybeSingle()

        // Redirect based on onboarding status
        if (!profile?.completed_onboarding) {
          return NextResponse.redirect(new URL('/onboarding', url.origin))
        }

        return NextResponse.redirect(new URL('/dashboard', url.origin))
      }
    }
  }

  // Redirect to sign-in with error message
  return NextResponse.redirect(
    new URL('/sign-in?error=Authentication failed', url.origin)
  )
}