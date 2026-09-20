'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteChatSession } from '@/app/actions/chat'
import { useRouter, useSearchParams } from 'next/navigation'

interface DeleteChatButtonProps {
  chatId: string
  isActive: boolean
}

export default function DeleteChatButton({ chatId, isActive }: DeleteChatButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isDeleting) return
    if (!confirm('Are you sure you want to delete this chat?')) return

    setIsDeleting(true)

    const res = await deleteChatSession(chatId)

    if (res.success) {
      // If deleting active chat, redirect to general chat page
      if (isActive || searchParams.get('chatId') === chatId) {
        router.push('/chat')
      } else {
        router.refresh()
      }
    } else {
      alert('Failed to delete chat.')
    }

    setIsDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Chat"
      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#999] hover:text-[#D9534F] hover:bg-[#EAEAE2] transition shrink-0"
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  )
}