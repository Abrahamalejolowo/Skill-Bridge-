import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  try {
    // 1. First, update session and get the base response
    const response = await updateSession(request)
    
    const pathname = request.nextUrl.pathname

    // Only run database role checks if entering protected route prefixes
    if (pathname.startsWith('/creator') || pathname.startsWith('/student')) {
      // Create a dedicated Supabase client for middleware using the request/response
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }
      
      // Check user role from the 'profiles' table (matching your app schema)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const userRole = profileData?.role

      if (pathname.startsWith('/creator') && userRole !== 'creator') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      if (pathname.startsWith('/student') && userRole !== 'student') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
// lib/matching.ts

export interface Opportunity {
  id: string;
  title: string;
  skills?: string[];
  [key: string]: any;
}

export function calculateMatches(opportunities: Opportunity[], userSkills: string[] = []) {
  const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase()));

  return opportunities.map((item) => {
    const itemSkills = item.skills ?? [];
    const matchingSkillsCount = itemSkills.filter((s: string) =>
      userSkillsSet.has(s.toLowerCase())
    ).length;

    // Calculate match score between 42% and 98%
    const score = itemSkills.length > 0
      ? Math.min(98, Math.max(42, Math.round((matchingSkillsCount / itemSkills.length) * 65 + 35)))
      : 70;

    // Calculate days remaining until deadline if applicable
    const daysLeft = item.deadline
      ? Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      ...item,
      score,
      daysLeft,
    };
  }).sort((a, b) => b.score - a.score); // Sort by highest match score descending
}