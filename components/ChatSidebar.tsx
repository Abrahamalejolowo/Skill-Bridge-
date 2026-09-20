'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import NewChatButton from '@/components/NewChatButton'
import DeleteChatButton from '@/components/DeleteChatButton'

interface ChatSession {
  id: string
  title: string
  opportunity_id: string | null
  created_at: string
  updated_at: string
}

interface ChatSidebarProps {
  chatSessions: ChatSession[] | null
  activeChatId?: string
}

export default function ChatSidebar({ chatSessions, activeChatId }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Floating History Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-[#4B7355] px-4 py-3 text-white shadow-lg hover:bg-[#3b5c43] transition"
        aria-label="Open chat history"
      >
        <Menu className="h-5 w-5" />
        <span className="text-xs font-semibold">History</span>
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar: Desktop Static + Mobile Slide-over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-[#EAEAE2] bg-white overflow-hidden transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#EAEAE2] lg:hidden">
          <span className="font-serif font-bold text-sm text-[#1A1A1A]">Chat History</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#F5F5EF] text-[#666]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#EAEAE2]">
          <NewChatButton />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {chatSessions && chatSessions.length > 0 ? (
            chatSessions.map((session) => {
              const isActive = activeChatId === session.id

              return (
                <Link
                  key={session.id}
                  href={`/chat?chatId=${session.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-lg transition cursor-pointer group ${
                    isActive
                      ? 'bg-[#F4F7F4] border border-[#4B7355]/30'
                      : 'bg-[#F5F5EF] hover:bg-[#EBEBDF]'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                      {session.title}
                    </p>
                    <p className="text-[10px] text-[#999] mt-1 font-medium">
                      {formatDate(new Date(session.updated_at))}
                    </p>
                  </div>

                  <DeleteChatButton chatId={session.id} isActive={isActive} />
                </Link>
              )
            })
          ) : (
            <p className="text-xs text-[#999] text-center py-8 font-medium">
              No conversations yet.<br />Start a new chat!
            </p>
          )}
        </div>
      </aside>
    </>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const chatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (chatDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (chatDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}