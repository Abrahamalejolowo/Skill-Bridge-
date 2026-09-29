import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NotificationsClient from './NotificationsClient'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in?returnTo=/notifications')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, message, kind, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Optional: check user role or default to a standard dashboard path
  // If you store user roles in a profiles table, you can route them accordingly, 
  // or use a safe default dashboard link:
  const dashboardPath = '/dashboard' 

  return (
    <NotificationsClient 
      initialNotifications={notifications || []} 
      dashboardPath={dashboardPath} 
    />
  )
}