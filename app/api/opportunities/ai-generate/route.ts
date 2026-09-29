import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['internship', 'job', 'project', 'scholarship', 'mentorship']

const SYSTEM_PROMPT = `You turn a creator's informal description of an opportunity for students into structured listing data.

Respond with JSON only, matching exactly this shape:
{
  "title": string,
  "type": "internship" | "job" | "project" | "scholarship" | "mentorship",
  "shortDescription": string,
  "description": string,
  "requirements": string[],
  "skillsNeeded": string[],
  "location": string,
  "remote": boolean,
  "compensation": string,
  "durationMonths": number | null
}

Rules:
- shortDescription is one sentence, under 160 characters.
- description is 2-4 short paragraphs of plain text with no markdown.
- requirements has 3-6 short items. skillsNeeded has 3-8 short items.
- Use only facts stated in the description. If location, compensation or duration is not mentioned, use "" (or null for durationMonths) and false for remote.
- Never invent an organization name, salary or deadline.`

function cleanList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, max)
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

    const { data: creator } = await supabase
      .from('creator_profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!creator || creator.verification_status !== 'verified') {
      return NextResponse.json(
        { error: 'Your creator account must be verified first.' },
        { status: 403 }
      )
    }

    const { prompt } = await request.json()
    const text = String(prompt || '').trim()

    if (text.length < 20) {
      return NextResponse.json(
        { error: 'Please describe the opportunity in a bit more detail.' },
        { status: 400 }
      )
    }
    if (text.length > 4000) {
      return NextResponse.json(
        { error: 'Description is too long. Please keep it under 4000 characters.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 })
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Gemini error:', response.status, responseText)
      return NextResponse.json(
        { error: 'AI service error. Please try again.' },
        { status: 502 }
      )
    }

    const data = JSON.parse(responseText)
    const raw: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || '')
        .join('')
        .trim() || ''

    const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error('AI returned invalid JSON:', raw)
      return NextResponse.json(
        { error: 'AI returned an unexpected response. Please try again.' },
        { status: 502 }
      )
    }

    const type = ALLOWED_TYPES.includes(String(parsed.type).toLowerCase())
      ? String(parsed.type).toLowerCase()
      : 'internship'

    const durationRaw = Number(parsed.durationMonths)
    const durationMonths =
      Number.isInteger(durationRaw) && durationRaw > 0 && durationRaw <= 60 ? durationRaw : null

    return NextResponse.json({
      opportunity: {
        title: String(parsed.title || '').trim(),
        type,
        shortDescription: String(parsed.shortDescription || '').trim(),
        description: String(parsed.description || '').trim(),
        requirements: cleanList(parsed.requirements, 8),
        skillsNeeded: cleanList(parsed.skillsNeeded, 10),
        location: String(parsed.location || '').trim(),
        remote: Boolean(parsed.remote),
        compensation: String(parsed.compensation || '').trim(),
        durationMonths,
      },
    })
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'Failed to generate opportunity' }, { status: 500 })
  }
}