import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  try {
    const cookieStore = await cookies()
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('Missing Supabase keys')
    }

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.error('Cookie error:', error)
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Supabase client creation failed:', error)
    throw error
  }
}