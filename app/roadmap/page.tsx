import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateRoadmapAction } from '@/app/actions/roadmap'
import MobileHeader from '@/components/MobileHeader'
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map,
  User,
  LogOut,
  Search,
  Bell,
  Terminal,
  LucideIcon,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface RoadmapItem {
  id: string
  title: string
  description?: string
  progress: number
  status: string
}

export default async function RoadmapPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in?returnTo=/roadmap')

  // Fetch profile details securely from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, education_level, field_of_study')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch real roadmap items securely from database
  const { data: rawItems } = await supabase
    .from('roadmap_items')
    .select('id, title, description, progress, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const items: RoadmapItem[] = (rawItems as RoadmapItem[]) ?? []

  // User Profile Metadata from DB or fallback
  const firstName = profile?.first_name || user.email?.split('@')[0] || 'Member'
  const lastName = profile?.last_name || ''
  const education = profile?.education_level || 'Undergraduate'
  const fieldOfStudy = profile?.field_of_study || 'CS'
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'SB'

  // Categorize Real Roadmap Items
  const activeGaps = items.filter((item) => item.status !== 'completed' && item.progress < 100)
  const completedGaps = items.filter((item) => item.status === 'completed' || item.progress === 100)

  // Real Stat Counters
  const totalGaps = items.length
  const matchesUnlocked = items.filter((item) => item.progress > 50).length
  const pathsCompletedCount = completedGaps.length

  return (
    <div className="flex h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-hidden">
      {/* Left Sidebar Navigation (Desktop Only) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-30 shrink-0 h-screen sticky top-0">
        <div>
          <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355]">
            Skills<span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="mt-12 space-y-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/explore" icon={Compass} label="Explore" />
            <SidebarLink href="/saved" icon={Bookmark} label="Saved" />
            <SidebarLink href="/roadmap" icon={Map} label="Roadmap" active />
            <SidebarLink href="/chat" icon={MessageCircle} label="AI Advisor" />
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

      {/* Right Pane (Header + Scrollable Content Area) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Mobile Header (Visible on small screens) */}
        <MobileHeader initials={initials} />

        {/* Top Header Bar (Desktop Only) */}
        <header className="hidden lg:flex items-center justify-between border-b border-[#EAEAE2] bg-white/80 px-10 py-4 backdrop-blur-md shrink-0 z-20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-full bg-[#F4F4EE] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/20"
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
                <p className="text-xs text-[#888]">{education} • {fieldOfStudy}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Roadmap Main Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-8">
          <div className="mx-auto w-full max-w-5xl">
            {/* Section Header */}
            <section className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold">Your Roadmap</h1>
                <p className="mt-1 text-xs sm:text-sm text-[#777]">
                  Every gap here comes straight from opportunities you&apos;re tracking — close one, and your readiness score moves.
                </p>
              </div>
              <Link
                href="/roadmap/add"
                className="px-4 py-2 bg-[#E29D38] text-white rounded-lg hover:bg-[#D48F2A] font-semibold text-sm whitespace-nowrap"
              >
                + Add Item
              </Link>
            </section>

            {/* Metric Cards */}
            <section className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <StatCard value={totalGaps} label="Skill Gaps Identified" />
              <StatCard value={matchesUnlocked} label="Matches Unlocked If Closed" />
              <StatCard value={pathsCompletedCount} label="Paths Completed" />
            </section>

            {/* Active Gaps Section */}
            <section className="mt-8 sm:mt-10">
              <h2 className="font-serif text-xl font-semibold">Active Gaps</h2>

              <div className="mt-4 sm:mt-5 space-y-6">
                {activeGaps.length > 0 ? (
                  activeGaps.map((gap) => (
                    <RoadmapItemCard key={gap.id} item={gap} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#EAEAE2] bg-white p-8 sm:p-12 text-center shadow-sm">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-[#4B7355]" />
                    <h3 className="mt-3 font-serif text-lg font-semibold text-[#1A1A1A]">No Active Gaps Found</h3>
                    <p className="mt-1 text-xs text-[#777] max-w-md mx-auto">
                      You are all caught up on your tracked opportunities! Explore more roles on the dashboard to generate new learning goals.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Completed Section */}
            <section className="mt-8 sm:mt-10 pb-12">
              <h2 className="font-serif text-xl font-semibold">Completed</h2>
              {completedGaps.length > 0 ? (
                <div className="mt-4 sm:mt-5 space-y-6">
                  {completedGaps.map((gap) => (
                    <RoadmapItemCard key={gap.id} item={gap} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 sm:mt-5 rounded-2xl border border-dashed border-[#C88A2B]/40 bg-white/50 p-8 sm:p-12 text-center text-xs font-medium text-[#888] shadow-sm">
                  You haven&apos;t completed any paths yet — finished gaps will move here.
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

/* Sub-Components */

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

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#EBEBE3] bg-white p-5 sm:p-6 shadow-sm">
      <p className="text-2xl sm:text-3xl font-bold text-[#C88A2B]">{value}</p>
      <p className="mt-1.5 sm:mt-2 text-xs font-medium text-[#777]">{label}</p>
    </div>
  )
}

function RoadmapItemCard({ item }: { item: RoadmapItem }) {
  const isInProgress = item.status === 'in_progress' || (item.progress > 0 && item.progress < 100)
  const isCompleted = item.status === 'completed' || item.progress === 100

  const statusBadgeText = isCompleted
    ? 'Completed'
    : isInProgress
    ? 'In Progress'
    : 'Not Started'

  return (
    <div className="rounded-2xl border border-[#EBEBE3] bg-white p-5 sm:p-7 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#E29D38] text-white">
            <Terminal className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A] truncate">
            {item.title}
          </h3>
        </div>
        <span className="rounded-full bg-[#FBF0D9] px-3 sm:px-3.5 py-1 text-[11px] font-semibold text-[#C88A2B] shrink-0">
          {statusBadgeText}
        </span>
      </div>

      {item.description && (
        <p className="mt-2 text-sm text-[#777]">{item.description}</p>
      )}

      <div className="mt-5 sm:mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 rounded-2xl bg-[#F9F9F4] p-5 sm:p-6">
        <div className="flex-1 min-w-0">
          <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[#EAEAE2]">
            <div
              className="h-full rounded-full bg-[#E29D38]"
              style={{ width: `${item.progress || 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#888]">{item.progress}% complete</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          {!isCompleted && (
            <form action={updateRoadmapAction}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="actionType" value="complete" />
              <button
                type="submit"
                className="rounded-xl bg-[#E29D38] px-4 sm:px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#D48F2A] whitespace-nowrap"
              >
                Mark As Complete
              </button>
            </form>
          )}

          {!isCompleted && (
            <form action={updateRoadmapAction}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="actionType" value="start" />
              <button
                type="submit"
                className="rounded-xl bg-[#4B7355] px-5 sm:px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D5E45] whitespace-nowrap"
              >
                {isInProgress ? 'Continue' : 'Start'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}