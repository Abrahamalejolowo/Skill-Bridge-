import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TYPE_TO_CATEGORY: Record<string, string> = {
  internship: 'Internship',
  job: 'Job',
  project: 'Project',
  scholarship: 'Scholarship',
  mentorship: 'Mentorship',
}

const DEFAULT_EDUCATION_LEVELS = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate']

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean)
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only admin-approved creators can post
    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('verification_status, organization_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!creator || creator.verification_status !== 'verified') {
      return NextResponse.json(
        { error: 'Your creator account must be verified before posting.' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const title = String(body.title || '').trim()
    const shortDescription = String(body.shortDescription || '').trim()
    const description = String(body.description || '').trim()
    const officialUrl = String(body.officialUrl || '').trim()
    const type = String(body.type || 'internship').toLowerCase()
    const remote = Boolean(body.remote)
    const location = String(body.location || '').trim()
    const compensation = String(body.compensation || '').trim()
    const deadline = String(body.deadline || '').trim()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!shortDescription) {
      return NextResponse.json({ error: 'Short description is required' }, { status: 400 })
    }
    if (!officialUrl || !isValidHttpUrl(officialUrl)) {
      return NextResponse.json(
        { error: 'A valid application link (starting with http:// or https://) is required' },
        { status: 400 }
      )
    }
    if (!TYPE_TO_CATEGORY[type]) {
      return NextResponse.json({ error: 'Invalid opportunity type' }, { status: 400 })
    }
    if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      return NextResponse.json({ error: 'Deadline must be a valid date' }, { status: 400 })
    }

    const durationRaw = Number(body.durationMonths)
    const durationMonths =
      Number.isInteger(durationRaw) && durationRaw > 0 && durationRaw <= 60 ? durationRaw : null

    const educationLevels = cleanList(body.educationLevels)

    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        title,
        organization: creator.organization_name || 'Independent',
        category: TYPE_TO_CATEGORY[type],
        description: description || shortDescription,
        short_description: shortDescription,
        location: location || (remote ? 'Remote' : 'Not specified'),
        remote,
        compensation: compensation || null,
        duration_months: durationMonths,
        deadline: deadline || null,
        official_url: officialUrl,
        requirements: cleanList(body.requirements),
        skills: cleanList(body.skillsNeeded),
        education_levels: educationLevels.length > 0 ? educationLevels : DEFAULT_EDUCATION_LEVELS,
        verified: true, // creator was already approved by an admin
        creator_id: user.id,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Create opportunity error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Create opportunity error:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}