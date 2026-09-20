'use client'

import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

interface ChatWithOpportunityProps {
  opportunityId: string
  opportunityTitle: string
  opportunityDescription?: string
  skills?: string[]
  category?: string
}

export default function ChatWithOpportunity({
  opportunityId,
  opportunityTitle,
}: ChatWithOpportunityProps) {
  const router = useRouter()

  const handleStartChat = () => {
    const params = new URLSearchParams({
      opportunityId,
      opportunityTitle,
    })
    router.push(`/chat?${params.toString()}`)
  }

  return (
    <button
      onClick={handleStartChat}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4B7355] py-3 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#3A5544] active:scale-95 animate-fade-in"
    >
      <MessageCircle className="h-4 w-4" />
      Chat with AI About This Project
    </button>
  )
}