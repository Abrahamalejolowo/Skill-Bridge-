import { createClient } from '@/lib/supabase/server'

export async function isUserPremium(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('is_premium, premium_expires_at')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data?.is_premium) return false

  if (data.premium_expires_at && new Date(data.premium_expires_at) < new Date()) {
    return false
  }

  return true
}