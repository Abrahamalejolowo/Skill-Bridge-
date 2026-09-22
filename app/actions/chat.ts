'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createChat(
  opportunityId?: string,
  title: string = 'New Chat'
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      title,
      opportunity_id: opportunityId || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Create chat error:', error)
    return { error: error.message }
  }

  return {
    success: true,
    chat: data,
  }
}

export async function getChatSessions() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { sessions: [], error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return {
    sessions: data || [],
    error: error?.message,
  }
}

export async function getChatMessages(chatId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      messages: [],
      error: 'Not authenticated',
    }
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', user.id)
    .eq('session_id', chatId)
    .order('created_at', { ascending: true })

  return {
    messages: data || [],
    error: error?.message,
  }
}

export async function deleteChatSession(chatId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // 1. Delete associated messages first and check for errors
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', chatId)
    .eq('user_id', user.id)

  if (messagesError) {
    console.error('Delete chat messages error:', messagesError)
    return { error: `Failed to delete messages: ${messagesError.message}` }
  }

  // 2. Delete the session itself
  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (sessionError) {
    console.error('Delete chat session error:', sessionError)
    return { error: `Failed to delete session: ${sessionError.message}` }
  }

  revalidatePath('/chat')
  return { success: true }
}

export async function saveChatMessage(
  message: string,
  role: 'user' | 'assistant',
  chatId: string,
  shouldRevalidate = false
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: user.id,
      session_id: chatId,
      role,
      content: message,
    })

  if (error) {
    console.error('Save message error:', error)
    return { error: error.message }
  }

  // Update chat session timestamp
  await supabase
    .from('chat_sessions')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (shouldRevalidate) {
    revalidatePath('/chat')
  }

  return { success: true }
}

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      // Retry on 429 (rate limit) or 503 (service unavailable)
      if (response.status === 429 || response.status === 503) {
        if (attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000
          console.log(
            `Rate limited. Retrying after ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`
          )
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          continue
        }
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 500
        console.log(
          `Request failed. Retrying after ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

export async function getAIResponse(
  userMessage: string,
  chatId: string,
  opportunityTitle?: string
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return {
        error:
          'AI service not configured. Please set GEMINI_API_KEY in .env.local',
      }
    }

    // Get ONLY this conversation's history
    const { data: messages, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('session_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20)

    if (historyError) {
      console.error('History error:', historyError)
    }

    const conversationHistory = (messages || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [
        {
          text: msg.content,
        },
      ],
    }))

    conversationHistory.push({
      role: 'user',
      parts: [
        {
          text: userMessage,
        },
      ],
    })

    const systemPrompt = opportunityTitle
      ? `You are an expert career mentor and project advisor.

The user is asking about the "${opportunityTitle}" opportunity.

CRITICAL INSTRUCTIONS FOR THOROUGH ANSWERS:
Do not give short or superficial responses. Every answer must comprehensively unpack the topic using this structure:
1. **Explanation**: A deep dive explaining the core concept thoroughly.
2. **Types & Classifications**: The different types, categories, or variants of the topic.
3. **Concrete Example**: A real-world application, scenario, or practical example.

Format your response using structured Markdown:
- Use ## for main headings
- Use ### for subheadings
- Use standard paragraphs with blank lines between them
- Use bullet lists (- item) for general lists
- Use numbered lists (1. item) for sequential steps
- Use **bold text** for key terms and emphasis
- Do not return raw HTML or unformatted blocks.`
      : `You are an expert career mentor and project advisor.

CRITICAL INSTRUCTIONS FOR THOROUGH ANSWERS:
Do not give short or superficial responses. Every answer must comprehensively unpack the topic using this structure:
1. **Explanation**: A deep dive explaining the core concept thoroughly.
2. **Types & Classifications**: The different types, categories, or variants of the topic.
3. **Concrete Example**: A real-world application, scenario, or practical example.

Format your response using structured Markdown:
- Use ## for main headings
- Use ### for subheadings
- Use standard paragraphs with blank lines between them
- Use bullet lists (- item) for general lists
- Use numbered lists (1. item) for sequential steps
- Use **bold text** for key terms and emphasis
- Do not return raw HTML or unformatted blocks.`

    // Use retry logic for API call
    const response = await fetchWithRetry(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: conversationHistory,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
          },
        }),
      }
    )

    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = 'Gemini API request failed'

      try {
        const errorData = JSON.parse(responseText)
        errorMessage =
          errorData?.error?.message || errorMessage
      } catch {
        errorMessage = responseText || errorMessage
      }

      console.error('Gemini API error:', {
        status: response.status,
        message: errorMessage,
      })

      return {
        error: `AI service error: ${errorMessage}. Please try again.`,
      }
    }

    const data = JSON.parse(responseText)

    const aiMessage =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || '')
        .join('')
        .trim() || ''

    if (!aiMessage) {
      return {
        error: 'No response received from AI. Please try again.',
      }
    }

    // Save AI response
    const { error: saveError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        session_id: chatId,
        role: 'assistant',
        content: aiMessage,
      })

    if (saveError) {
      console.error('Failed to save AI response:', saveError)
    }

    await supabase
      .from('chat_sessions')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId)
      .eq('user_id', user.id)

    return {
      success: true,
      message: aiMessage,
    }
  } catch (error) {
    console.error('Chat error:', error)

    return {
      error:
        error instanceof Error
          ? error.message
          : 'Something went wrong while contacting the AI. Please try again.',
    }
  }
}