'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createChat } from '@/app/actions/chat'

export default function NewChatButton() {
  const router = useRouter()

  const handleNewChat = async () => {
    const result = await createChat()

    if (result.error) {
      console.error(result.error)
      return
    }

    router.push(`/chat?chatId=${result.chat.id}`)
    router.refresh()
  }

  return (
    <button
      onClick={handleNewChat}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E29D38] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D48F2A]"
    >
      <Plus className="h-4 w-4" />
      New Chat
    </button>
  )
}