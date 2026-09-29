'use client'

import { useParams } from 'next/navigation'
import ApplicantsView from '@/components/creator/applicants-view'

export default function ApplicantsPage() {
  const params = useParams()
  return <ApplicantsView opportunityId={params.id as string} />
}