'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToOpportunity(opportunityId: string, responseLetter?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Please sign in to apply' }

  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', user.id)
    .eq('opportunity_id', opportunityId)
    .maybeSingle()

  if (existing) return { error: 'You have already applied to this opportunity', alreadyApplied: true }

  const [{ data: opportunity }, { data: profile }] = await Promise.all([
    supabase
      .from('opportunities')
      .select('id, title, skills, deadline, official_url')
      .eq('id', opportunityId)
      .maybeSingle(),
    supabase.from('profiles').select('skills').eq('id', user.id).maybeSingle(),
  ])

  if (!opportunity) return { error: 'Opportunity not found' }

  if (opportunity.deadline) {
    const today = new Date().toISOString().split('T')[0]
    if (opportunity.deadline < today) return { error: 'The deadline for this opportunity has passed' }
  }

  const required: string[] = Array.isArray(opportunity.skills) ? opportunity.skills : []
  const have = new Set(
    (Array.isArray(profile?.skills) ? profile.skills : []).map((s: string) => s.trim().toLowerCase())
  )
  const matched = required.filter((s) => have.has(s.trim().toLowerCase()))

  const score = required.length ? Math.round((matched.length / required.length) * 100) : 0
  const summary = required.length
    ? `Matches ${matched.length} of ${required.length} required skills${
        matched.length ? `: ${matched.join(', ')}` : ''
      }.`
    : 'No required skills were listed for this opportunity.'

  const { error } = await supabase.from('applications').insert({
    student_id: user.id,
    opportunity_id: opportunityId,
    status: 'pending',
    response_letter: responseLetter?.trim() || null,
    ai_match_score: score,
    ai_match_summary: summary,
  })

  if (error) {
    console.error('Apply error:', error)
    return { error: error.message }
  }

  revalidatePath('/applications')
  revalidatePath('/dashboard')

  return { success: true, applyUrl: opportunity.official_url as string | null }
}