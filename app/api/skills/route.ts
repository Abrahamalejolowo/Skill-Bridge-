import { NextResponse } from 'next/server'

const PREDEFINED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
  'Tailwind CSS', 'Supabase', 'PostgreSQL', 'SQL', 'Git', 'Docker',
  'HTML/CSS', 'Data Analysis', 'Public Speaking', 'Networking', 'Research',
  'UI/UX Design', 'Solidity', 'Web3', 'Sanity CMS', 'Flutterwave', 'Paystack'
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  if (!query) {
    return NextResponse.json(PREDEFINED_SKILLS.slice(0, 10))
  }

  const filtered = PREDEFINED_SKILLS.filter(skill =>
    skill.toLowerCase().includes(query)
  )

  return NextResponse.json(filtered)
}