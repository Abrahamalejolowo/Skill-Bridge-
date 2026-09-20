'use client'

import { useState, useRef, useEffect } from 'react'
import { getAIResponse, saveChatMessage } from '@/app/actions/chat'
import { Send, Loader, X, MessageCircle } from 'lucide-react'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ChatWidgetProps {
  opportunityId: string
  opportunityTitle: string
}

export default function ChatWidget({ opportunityId, opportunityTitle }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
    }
    setMessages((prev) => [...prev, newUserMessage])
    setLoading(true)

    try {
      await saveChatMessage(userMessage, 'user', opportunityId)

      const { message: aiMessage, error } = await getAIResponse(
        userMessage,
        opportunityId,
        opportunityTitle
      )

      if (error) {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${error}`,
        }
        setMessages((prev) => [...prev, errorMessage])
      } else if (aiMessage) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: aiMessage,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#E29D38] text-white shadow-lg transition hover:bg-[#D48F2A] hover:scale-110 z-40"
        title="Chat with AI Advisor"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 flex w-96 max-w-full flex-col rounded-2xl border border-[#EBEBE3] bg-white shadow-2xl overflow-hidden z-40">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#4B7355] to-[#E29D38] px-4 py-3">
        <div>
          <h3 className="font-semibold text-white">AI Advisor</h3>
          <p className="text-xs text-white/80">{opportunityTitle}</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full p-1 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 flex-1 overflow-y-auto space-y-3 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-xs text-[#777]">
              Ask me about skills to build or projects to work on for this role.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-xs ${
                    message.role === 'user'
                      ? 'bg-[#4B7355] text-white rounded-br-none'
                      : 'bg-[#F4F4EE] text-[#1A1A1A] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F4F4EE] text-[#1A1A1A] rounded-lg rounded-bl-none px-3 py-2 flex items-center gap-2">
                  <Loader className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-[#EAEAE2] px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask..."
          disabled={loading}
          className="flex-1 rounded-full border border-[#EBEBE3] bg-[#F4F4EE] px-3 py-2 text-xs text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-[#E29D38] text-white transition hover:bg-[#D48F2A] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}