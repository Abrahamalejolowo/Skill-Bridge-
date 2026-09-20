'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  return { supabase, user }
}

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value) return []
  const str = String(value).trim()
  
  // Handle JSON array strings if passed from state
  if (str.startsWith('[')) {
    try {
      return JSON.parse(str)
    } catch {
      // Fallback to comma separation on parse error
    }
  }

  return str.split(',').map((item) => item.trim()).filter(Boolean)
}

export async function saveProfile(formData: FormData) {
  const { user, supabase } = await getUser()

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      first_name: formData.get('first_name') || null,
      last_name: formData.get('last_name') || null,
      education_level: formData.get('education_level') || null,
      field_of_study: formData.get('field_of_study') || null,
      institution: formData.get('institution') || null,
      bio: formData.get('bio') || null,
      skills: parseList(formData.get('skills')),
      interests: parseList(formData.get('interests')),
      location: formData.get('location') || null,
      career_goal: formData.get('career_goal') || null,
      completed_onboarding: true,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const { user, supabase } = await getUser()

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  // Dynamically attach provided fields
  const fields = ['first_name', 'last_name', 'education_level', 'field_of_study', 'institution', 'bio', 'location', 'career_goal']
  
  fields.forEach((field) => {
    const val = formData.get(field)
    if (val !== null) updates[field] = String(val)
  })

  if (formData.has('skills')) {
    updates.skills = parseList(formData.get('skills'))
  }

  if (formData.has('interests')) {
    updates.interests = parseList(formData.get('interests'))
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return { success: true, profile: data }
}

export async function getProfile() {
  try {
    const { user, supabase } = await getUser()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error?.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          first_name: user.email?.split('@')[0] || 'User',
          completed_onboarding: false,
        })
        .select()
        .single()

      if (createError) throw createError
      return { ...newProfile, email: user.email }
    }

    if (error) throw error

    return data ? { ...data, email: user.email } : null
  } catch (err) {
    console.error('getProfile error:', err)
    throw err
  }
}

export async function getApplications() {
  try {
    const { user, supabase } = await getUser()

    const { data, error } = await supabase
      .from('opportunity_applications')
      .select(`
        id,
        opportunity_id,
        status,
        updated_at,
        opportunity:opportunities (
          id,
          title,
          organization,
          category,
          match_score,
          deadline
        )
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching applications:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('getApplications error:', err)
    return []
  }
}

export async function saveOpportunity(formData: FormData) {
  const { user, supabase } = await getUser()

  const { error } = await supabase
    .from('saved_opportunities')
    .upsert({
      user_id: user.id,
      opportunity_id: formData.get('opportunity_id'),
      status: 'saved',
    })

  if (error) throw error

  revalidatePath('/saved')
  revalidatePath('/dashboard')
}

export async function updateApplication(formData: FormData) {
  const { user, supabase } = await getUser()
  const opportunityId = String(formData.get('opportunity_id'))
  const status = String(formData.get('status') || 'saved')

  const { error } = await supabase
    .from('opportunity_applications')
    .upsert({
      user_id: user.id,
      opportunity_id: opportunityId,
      status,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error

  revalidatePath('/saved')
  revalidatePath('/dashboard')
}

export async function removeApplication(formData: FormData) {
  const { user, supabase } = await getUser()
  const opportunityId = String(formData.get('opportunity_id'))

  if (!opportunityId) return

  const { error } = await supabase
    .from('opportunity_applications')
    .delete()
    .eq('user_id', user.id)
    .eq('opportunity_id', opportunityId)

  if (error) throw error

  revalidatePath('/saved')
  revalidatePath('/dashboard')
}