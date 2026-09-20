import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileHeader from '@/components/MobileHeader'
import ChatInterface from '@/components/ChatInterface'
import ChatSidebar from '@/components/ChatSidebar'
import NewChatButton from '@/components/NewChatButton'
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map,
  User,
  LogOut,
  Search,
  Bell,
  MessageCircle,
  MessageSquare,
  LucideIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{
    chatId?: string
    search?: string
    opportunityId?: string
    opportunityTitle?: string
  }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  let activeChatId = resolvedSearchParams?.chatId
  const searchQuery = resolvedSearchParams?.search
  const opportunityId = resolvedSearchParams?.opportunityId
  const opportunityTitle = resolvedSearchParams?.opportunityTitle

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in?returnTo=/chat')

  // Fetch profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, education_level, field_of_study')
    .eq('id', user.id)
    .maybeSingle()

  // Auto-handle opportunity chat session creation
  if (opportunityId && !activeChatId) {
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)
      .maybeSingle()

    if (existingSession) {
      activeChatId = existingSession.id
    } else {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: opportunityTitle ? `Chat: ${opportunityTitle}` : 'Opportunity Chat',
          opportunity_id: opportunityId,
        })
        .select()
        .single()

      if (newSession) {
        activeChatId = newSession.id
        const initialPrompt = `Please explain this opportunity: "${opportunityTitle || 'Opportunity'}". Give me a complete overview, key requirements, and what makes a strong application.`
        
        await supabase.from('chat_messages').insert({
          session_id: newSession.id,
          user_id: user.id,
          role: 'user',
          content: initialPrompt,
        })
      }
    }
  }

  // Fetch all chat sessions for this user
  let sessionsQuery = supabase
    .from('chat_sessions')
    .select('id, title, opportunity_id, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (searchQuery) {
    sessionsQuery = sessionsQuery.ilike('title', `%${searchQuery}%`)
  }

  const { data: chatSessions } = await sessionsQuery

  // Fetch messages for active chat
  let activeMessages: any[] = []
  let activeChat: any = null

  if (activeChatId) {
    const { data: chat } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', activeChatId)
      .eq('user_id', user.id)
      .single()

    activeChat = chat

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .eq('session_id', activeChatId)
      .order('created_at', { ascending: true })

    activeMessages = messages || []
  }

  const firstName = profile?.first_name || user.email?.split('@')[0] || 'Member'
  const lastName = profile?.last_name || ''
  const education = profile?.education_level || 'Undergraduate'
  const fieldOfStudy = profile?.field_of_study || 'CS'
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'SB'

  return (
    <div className="flex h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-hidden">
      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-30 shrink-0 h-screen sticky top-0">
        <div>
          <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355]">
            Skills<span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="mt-12 space-y-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/explore" icon={Compass} label="Explore" />
            <SidebarLink href="/saved" icon={Bookmark} label="Saved" />
            <SidebarLink href="/roadmap" icon={Map} label="Roadmap" />
            <SidebarLink href="/chat" icon={MessageCircle} label="AI Advisor" active />
            <SidebarLink href="/profile" icon={User} label="Profile" />
          </nav>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#666] transition hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </form>
      </aside>

      {/* Main Chat Area Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <MobileHeader initials={initials} />

        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between border-b border-[#EAEAE2] bg-white/80 px-10 py-4 backdrop-blur-md shrink-0 z-20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-full bg-[#F4F4EE] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/20 font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <Link href="/notifications" className="relative text-[#666] hover:text-[#1A1A1A]">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#D9534F]" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4B7355] text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold">
                  {firstName} {lastName}
                </p>
                <p className="text-xs text-[#888] font-medium">{education} • {fieldOfStudy}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Responsive Chat History Sidebar / Drawer Component */}
          <ChatSidebar chatSessions={chatSessions} activeChatId={activeChatId} />

          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col overflow-hidden font-medium text-[15px] leading-relaxed">
            {activeChatId && activeChat ? (
              <ChatInterface 
                initialMessages={activeMessages}
                chatId={activeChatId}
                opportunityTitle={activeChat.title || 'Career Development'}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white px-4">
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F7F4] mb-4 mx-auto">
                    <MessageSquare className="h-8 w-8 text-[#4B7355]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                    No Chat Selected
                  </h2>
                  <p className="text-sm text-[#666] mb-6 font-medium">
                    Start a new chat or select one from the sidebar
                  </p>
                  <NewChatButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: LucideIcon
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? 'bg-[#F4F7F4] text-[#4B7355]'
          : 'text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  )
}