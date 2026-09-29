import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const {
      organizationName,
      organizationType,
      description,
      website,
      industry,
      location,
      contactPersonName,
      contactEmail,
      contactPhone,
    } = await request.json()

    if (!organizationName || !contactEmail) {
      return NextResponse.json(
        { error: 'Organization name and contact email required' },
        { status: 400 }
      )
    }

    // Upsert creator profile
    const { data, error } = await supabase
      .from('creator_profiles')
      .upsert({
        user_id: user.id,
        organization_name: organizationName,
        organization_type: organizationType,
        description,
        website,
        industry,
        location,
        contact_person_name: contactPersonName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        verification_status: 'pending',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Onboarding submitted successfully',
      creator: data,
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to submit onboarding' },
      { status: 500 }
    )
  }
}