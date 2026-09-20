import { getProfile } from '@/app/actions/profile'
import { OnboardingForm } from '@/components/onboarding-form' 

export default async function OnboardingPage() {
  const profile = await getProfile()
  return <OnboardingForm profile={profile} />
}
