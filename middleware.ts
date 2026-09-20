import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  try {
    const response = await updateSession(request)
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Allow request to continue even if session update fails
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}