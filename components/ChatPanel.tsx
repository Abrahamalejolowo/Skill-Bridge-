'use client'

import { useState, useRef, useEffect } from 'react'
import { getChatMessages, getAIResponse, saveChatMessage } from '@/app/actions/chat'
import { Send, Loader, X, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ChatPanelProps {
  opportunityId: string
  opportunityTitle: string
}

export default function ChatPanel({ opportunityId, opportunityTitle }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMessagesAndTriggerAI = async () => {
      setLoading(true)
      const { messages: loadedMessages } = await getChatMessages(opportunityId)
      const initialMessages = loadedMessages || []
      setMessages(initialMessages)

      // Check if there is an initial user message but no assistant reply yet
      const hasUserMessage = initialMessages.length > 0 && initialMessages[0].role === 'user'
      const hasAssistantMessage = initialMessages.some((msg) => msg.role === 'assistant')

      if (hasUserMessage && !hasAssistantMessage) {
        try {
          const userPrompt = initialMessages[0].content
          const { message: aiMessage, error } = await getAIResponse(
            userPrompt,
            opportunityId,
            opportunityTitle
          )

          if (error) {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: `Error: ${error}` },
            ])
          } else if (aiMessage) {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: aiMessage },
            ])
          }
        } catch (err) {
          console.error('Failed to trigger initial AI response:', err)
        }
      }

      setLoading(false)
    }

    loadMessagesAndTriggerAI()
  }, [opportunityId, opportunityTitle])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${error}` },
        ])
      } else if (aiMessage) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: aiMessage },
        ])
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An unexpected error occurred. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#EAEAE2]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAEAE2] bg-gradient-to-r from-[#4B7355] to-[#E29D38] px-6 py-4">
        <div>
          <h3 className="font-semibold text-white">AI Explanation</h3>
          <p className="text-xs text-white/80">{opportunityTitle}</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full p-1 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-sm font-medium text-[#1A1A1A]">Ask About This Opportunity</p>
            <p className="text-xs text-[#777] mt-2 max-w-sm">
              Get personalized advice about what you need to learn or build to succeed in this role.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => {
              const isUser = message.role === 'user'
              return (
                <div
                  key={message.id || idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAEAE2] text-[#4B7355] text-xs font-bold mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#4B7355] text-white rounded-tr-none font-medium'
                        : 'bg-[#F4F4EE] text-[#1A1A1A] rounded-tl-none border border-[#EAEAE2]'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-[#1A1A1A] prose-headings:text-[#1A1A1A]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4B7355] text-white text-xs font-bold mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAEAE2] text-[#4B7355] text-xs font-bold">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-[#F4F4EE] border border-[#EAEAE2] text-[#1A1A1A] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-sm font-medium">
                  <Loader className="h-4 w-4 animate-spin text-[#4B7355]" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-[#EAEAE2] px-6 py-3 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={loading}
          className="flex-1 rounded-full border border-[#EBEBE3] bg-[#F4F4EE] px-4 py-2 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/30 disabled:opacity-50 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-[#E29D38] text-white transition hover:bg-[#D48F2A] disabled:opacity-50 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}