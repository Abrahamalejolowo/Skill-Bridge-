'use client'

import Link from 'next/link'
import { Sparkles, Lock } from 'lucide-react'

export default function PremiumUpsell({
  compact = false,
}: {
  compact?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center text-center rounded-3xl border border-[#E8E8E0] bg-gradient-to-b from-[#FAFAF8] to-white ${
        compact ? 'px-5 py-6' : 'px-8 py-10'
      }`}
    >
      <div className="h-12 w-12 rounded-full bg-[#4B7355]/10 flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-[#4B7355]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
        AI Advisor is a Premium feature
      </h3>
      <p className="text-sm text-[#666] max-w-sm mb-5">
        Upgrade to Premium to get unlimited AI career guidance, project mentoring, and application help.
      </p>
      <Link
        href="/premium"
        className="inline-flex items-center gap-2 rounded-full bg-[#4B7355] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3D5E45] transition"
      >
        <Sparkles className="h-4 w-4" />
        Upgrade to Premium
      </Link>
    </div>
  )
}