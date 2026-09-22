'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { saveChatMessage, getAIResponse } from '@/app/actions/chat'

const STREAMING_STEPS = [
  "Task Input",
  "Understand Goal",
  "Synthesize Plan",
  "Execute Actions",
  "Verify Output Integrity",
  "Report",
]

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
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, currentStepIndex])

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0)
      return
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STREAMING_STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

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
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-[#E8E8E0] bg-white shrink-0">
        <h1 className="text-base md:text-lg font-semibold text-[#1A1A1A] truncate">
          {opportunityTitle}
        </h1>
        <p className="text-xs text-[#999] font-normal mt-1">
          AI Career Advisor & Project Mentor
        </p>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 md:py-12 space-y-12 w-full bg-white">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user'

          return (
            <div
              key={msg.id || index}
              className={`flex gap-4 md:gap-5 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isUser
                    ? 'bg-[#4B7355] text-white'
                    : 'bg-[#E8E8E0] text-[#4B7355]'
                }`}
              >
                {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              {/* Message Content */}
              <div className="flex-1 max-w-2xl">
                {isUser ? (
                  <div className="bg-[#4B7355] text-white rounded-3xl rounded-tr-none px-5 md:px-6 py-4 md:py-5">
                    <p className="text-sm md:text-base font-normal leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#FAFAF8] rounded-3xl rounded-tl-none border border-[#E8E8E0] px-5 md:px-7 py-5 md:py-6">
                      <style>{`
                        .message-content h1 {
                          font-size: 1.5rem;
                          font-weight: 700;
                          color: #1A1A1A;
                          margin: 1.5rem 0 1rem 0;
                          line-height: 1.3;
                        }

                        .message-content h1:first-child {
                          margin-top: 0;
                        }

                        .message-content h2 {
                          font-size: 1.2rem;
                          font-weight: 600;
                          color: #1A1A1A;
                          margin: 1.5rem 0 0.8rem 0;
                          line-height: 1.4;
                        }

                        .message-content h3 {
                          font-size: 1rem;
                          font-weight: 600;
                          color: #333;
                          margin: 1rem 0 0.6rem 0;
                          line-height: 1.4;
                        }

                        .message-content p {
                          font-size: 0.95rem;
                          color: #444;
                          line-height: 1.7;
                          margin: 0 0 1.2rem 0;
                        }

                        .message-content p:last-child {
                          margin-bottom: 0;
                        }

                        .message-content ul, 
                        .message-content ol {
                          margin: 1.2rem 0;
                          padding-left: 1.5rem;
                        }

                        .message-content li {
                          font-size: 0.95rem;
                          color: #444;
                          line-height: 1.8;
                          margin: 0.6rem 0;
                        }

                        .message-content strong {
                          font-weight: 600;
                          color: #1A1A1A;
                        }

                        .message-content em {
                          font-style: italic;
                          color: #555;
                        }

                        .message-content blockquote {
                          border-left: 4px solid #4B7355;
                          padding-left: 1rem;
                          margin: 1rem 0;
                          color: #666;
                          font-style: italic;
                        }

                        .message-content code {
                          background: #F5F5F0;
                          color: #D9534F;
                          padding: 0.2rem 0.5rem;
                          border-radius: 0.3rem;
                          font-family: 'Monaco', 'Courier New', monospace;
                          font-size: 0.9rem;
                        }

                        .message-content pre {
                          background: #1F1F1F;
                          color: #E8E8E8;
                          padding: 1rem;
                          border-radius: 0.5rem;
                          overflow-x: auto;
                          margin: 1.5rem 0;
                          border: 1px solid #333;
                          font-size: 0.85rem;
                          line-height: 1.6;
                        }

                        .message-content pre code {
                          background: none;
                          color: inherit;
                          padding: 0;
                        }

                        .message-content table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 1.5rem 0;
                          border: 1px solid #E8E8E0;
                          border-radius: 0.5rem;
                          overflow: hidden;
                        }

                        .message-content th {
                          background: #F0F0E8;
                          border: 1px solid #E8E8E0;
                          padding: 0.8rem;
                          font-weight: 600;
                          text-align: left;
                          color: #1A1A1A;
                          font-size: 0.9rem;
                        }

                        .message-content td {
                          border: 1px solid #E8E8E0;
                          padding: 0.8rem;
                          color: #333;
                          font-size: 0.9rem;
                        }

                        .message-content a {
                          color: #4B7355;
                          text-decoration: underline;
                          font-weight: 500;
                        }
                      `}</style>
                      
                      <div className="message-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Stepped Loading Indicator */}
        {isLoading && (
          <div className="flex gap-4 md:gap-5 max-w-2xl">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center bg-[#E8E8E0] text-[#4B7355] flex-shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-[#FAFAF8] border border-[#E8E8E0] rounded-3xl rounded-tl-none px-5 md:px-6 py-5 md:py-6">
              <div className="space-y-4">
                {STREAMING_STEPS.map((step, index) => {
                  const isComplete = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isPending = index > currentStepIndex

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        isPending ? 'opacity-35' : 'opacity-100'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-[#4B7355]" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 text-[#4B7355] animate-spin" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-[#D0D0C8]" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-normal ${
                          isCurrent
                            ? 'text-[#4B7355] font-medium'
                            : isComplete
                            ? 'text-[#1A1A1A]'
                            : 'text-[#999]'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="px-4 md:px-12 py-5 border-t border-[#E8E8E0] bg-white shrink-0 w-full">
        <form onSubmit={handleSend} className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#F5F5F0] px-5 py-3 text-sm md:text-base font-normal text-[#1A1A1A] placeholder-[#999] outline-none border border-[#E8E8E0] focus:border-[#4B7355] focus:ring-2 focus:ring-[#4B7355]/20 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4B7355] text-white transition hover:bg-[#3D5E45] disabled:opacity-50 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}