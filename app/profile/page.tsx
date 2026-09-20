import { getProfile, getApplications } from '@/app/actions/profile'
import ProfileClientWrapper from '@/components/ProfileClientWrapper'

// Force Next.js to dynamically fetch database data without stale cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const profile = await getProfile()
  
  // Optional: Fetch saved/tracked applications if your wrapper accepts them
  const applications = await getApplications().catch(() => [])

  return (
    <ProfileClientWrapper
      key={profile?.updated_at || profile?.id || Date.now()}
      initialProfile={profile}
      userEmail={profile?.email || ''}
      applications={applications}
    />
  )
}