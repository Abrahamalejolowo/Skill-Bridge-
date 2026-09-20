import { createClient } from '@/lib/supabase/server'
import OpportunitiesClient from '@/components/OpportunitiesClient'

export const dynamic = 'force-dynamic'

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: rawItems } = await supabase
    .from('opportunities')
    .select('id, title, organization, category, location, deadline, verified')
    .order('deadline', { ascending: true })

  return <OpportunitiesClient initialItems={rawItems ?? []} />
}