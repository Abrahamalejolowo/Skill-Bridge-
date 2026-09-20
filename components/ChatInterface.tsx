'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { saveChatMessage, getAIResponse } from '@/app/actions/chat'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface ChatInterfaceProps {
  initialMessages: Message[]
  chatId: string
  opportunityTitle: string
}

export default function ChatInterface({
  initialMessages,
  chatId,
  opportunityTitle,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Automatically trigger AI response on initial session creation if no assistant reply exists yet
  useEffect(() => {
    const triggerInitialAIResponse = async () => {
      const hasAssistantMessage = messages.some((msg) => msg.role === 'assistant')
      const hasUserMessage = messages.length > 0 && messages[0].role === 'user'

      if (hasUserMessage && !hasAssistantMessage && !isLoading) {
        setIsLoading(true)

        try {
          const userMessage = messages[0].content
          const response = await getAIResponse(userMessage, chatId, opportunityTitle)

          if (response.error) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: `**Error:** ${response.error}`,
              },
            ])
          } else if (response.message) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: response.message,
              },
            ])
          }
        } catch (err) {
          console.error('Failed to generate initial AI response:', err)
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'An unexpected error occurred. Please try again.',
            },
          ])
        } finally {
          setIsLoading(false)
        }
      }
    }

    triggerInitialAIResponse()
  }, [chatId, opportunityTitle])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      await saveChatMessage(userMessage, 'user', chatId)
      const response = await getAIResponse(userMessage, chatId, opportunityTitle)

      if (response.error) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `**Error:** ${response.error}`,
          },
        ])
      } else if (response.message) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: response.message,
          },
        ])
      }
    } catch (err) {
      console.error('Failed to process message:', err)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'An unexpected error occurred. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-[#EAEAE2] bg-white/80 backdrop-blur-md shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#1A1A1A]">
            {opportunityTitle}
          </h1>
          <p className="text-xs text-[#888] font-medium mt-0.5">
            AI Career Advisor & Project Mentor
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user'

          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3.5 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isUser
                    ? 'bg-[#4B7355] text-white'
                    : 'bg-[#EAEAE2] text-[#4B7355]'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-5 py-3.5 text-[15px] font-medium leading-relaxed ${
                  isUser
                    ? 'bg-[#4B7355] text-white rounded-tr-none'
                    : 'bg-[#F5F5F0] text-[#1A1A1A] rounded-tl-none border border-[#EAEAE2]'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#1A1A1A] prose-headings:font-bold prose-headings:text-[#1A1A1A] prose-strong:text-[#1A1A1A]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5 mr-auto max-w-3xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAEAE2] text-[#4B7355]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-[#F5F5F0] border border-[#EAEAE2] px-5 py-3.5 text-sm font-medium text-[#666] flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#4B7355]" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="p-4 border-t border-[#EAEAE2] bg-white shrink-0">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#F4F4EE] px-5 py-3 text-[15px] font-medium text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4B7355] text-white transition hover:bg-[#3D5E45] disabled:opacity-50 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}