'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { applyToOpportunity } from '@/app/actions/applications'

interface ApplyButtonProps {
  opportunityId: string
  applyUrl: string | null
  alreadyApplied: boolean
  closed: boolean
}

export default function ApplyButton({
  opportunityId,
  applyUrl,
  alreadyApplied,
  closed,
}: ApplyButtonProps) {
  const [applied, setApplied] = useState(alreadyApplied)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (closed && !applied) {
    return (
      <div className="flex w-full items-center justify-center rounded-xl bg-[#F0F0E8] py-3 text-xs font-semibold text-[#999]">
        Applications Closed
      </div>
    )
  }

  const handleClick = () => {
    if (applied || isPending) return
    setError(null)

    startTransition(async () => {
      const result = await applyToOpportunity(opportunityId)

      if (result.success || result.alreadyApplied) {
        setApplied(true)
      } else {
        setError(result.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div>
      <a
        href={applyUrl || '#'}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C88A2B] py-3 text-xs font-semibold text-white transition hover:bg-[#B57A22]"
      >
        {applied ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Applied · Open Application Page
          </>
        ) : (
          <>
            Apply On Official Site
            <ExternalLink className="h-3.5 w-3.5" />
          </>
        )}
      </a>
      {error && <p className="mt-2 text-xs text-[#D9534F]">{error}</p>}
    </div>
  )
}