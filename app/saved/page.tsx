import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateApplication, removeApplication } from '@/app/actions/profile'
import MobileHeader from '@/components/MobileHeader'
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map as MapIcon,
  User,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Trash2,
  LucideIcon,
  MessageCircle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Opportunity {
  id: string
  title: string
  organization: string
  category: string
  deadline: string
  match_score?: number
}

interface ApplicationItem {
  id: string
  opportunity_id: string
  status: string
  notes?: string
  opportunity?: Opportunity | null
}

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const currentFilter = resolvedSearchParams.status || 'all'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in?returnTo=/saved')

  // Fetch profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, education_level')
    .eq('id', user.id)
    .maybeSingle()

  // 1. Fetch raw applications for the user
  const { data: rawApplications } = await supabase
    .from('opportunity_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const baseApplications = rawApplications || []

  // 2. Extract unique opportunity IDs supporting any column name variation
  const opportunityIds = Array.from(
    new Set(
      baseApplications
        .map((app: any) => app.opportunity_id || app.opportunityId || app.opp_id || app.listing_id)
        .filter(Boolean)
    )
  )

  // 3. Fetch corresponding opportunities
  let opportunitiesMap: Record<string, Opportunity> = {}
  if (opportunityIds.length > 0) {
    const { data: oppsData, error: oppsError } = await supabase
      .from('opportunities')
      .select('*')
      .in('id', opportunityIds)

    if (oppsData) {
      opportunitiesMap = oppsData.reduce((acc, opp) => {
        const oppKey = opp.id || opp.opportunity_id || opp.uuid
        if (oppKey) {
          acc[oppKey] = opp
        }
        return acc
      }, {} as Record<string, Opportunity>)
    }
  }

  // 4. Map everything together safely
  const applications: ApplicationItem[] = baseApplications.map((app: any) => {
    const targetId = app.opportunity_id || app.opportunityId || app.opp_id || app.listing_id
    return {
      ...app,
      opportunity_id: targetId,
      opportunity: opportunitiesMap[targetId] || null,
    }
  })
  const firstName = profile?.first_name || 'Abraham'
  const lastName = profile?.last_name || 'Alejolowo'
  const education = profile?.education_level || 'Undergraduate'
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  // Counts for tabs
  const allCount = applications.length
  const savedCount = applications.filter((a) => a.status === 'saved').length
  const inProgressCount = applications.filter((a) => a.status === 'in_progress').length
  const appliedCount = applications.filter((a) => a.status === 'applied').length

  // Filtered applications based on current active tab
  const filteredApplications = applications.filter((item) => {
    if (currentFilter === 'saved') return item.status === 'saved'
    if (currentFilter === 'in_progress') return item.status === 'in_progress'
    if (currentFilter === 'applied') return item.status === 'applied'
    return true // 'all'
  })

  return (
    <div className="flex min-h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
      {/* Desktop Left Sidebar Navigation */}
      <aside className="fixed bottom-0 top-0 left-0 hidden lg:flex w-64 flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-30">
        <div>
          <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355]">
            Skills<span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="mt-12 space-y-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/explore" icon={Compass} label="Explore" />
            <SidebarLink href="/saved" icon={Bookmark} label="Saved" active />
            <SidebarLink href="/roadmap" icon={MapIcon} label="Roadmap" />
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

      {/* Main Container */}
      <div className="flex-1 w-full lg:pl-64 flex flex-col min-h-screen">
        <MobileHeader initials={initials} />

        {/* Top Desktop Header Bar */}
        <header className="sticky top-0 z-20 hidden lg:flex items-center justify-between border-b border-[#EAEAE2] bg-white/80 px-10 py-4 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search"
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
                <p className="text-xs text-[#888]">{education} . CS</p>
              </div>
            </div>
          </div>
        </header>

        {/* Saved & Tracked Content */}
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 py-6 sm:py-8 flex-1">
          <section>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold">Saved & Tracked</h1>
            <p className="mt-1 text-xs sm:text-sm text-[#777]">
              Everything You&apos;re Keeping An Eye On, In One Place — Update Status As You Move Through Each Application.
            </p>
          </section>

          {/* Interactive Filter Pills */}
          <section className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/saved"
              className={`flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs font-medium transition shrink-0 ${
                currentFilter === 'all'
                  ? 'bg-[#E29D38] text-white shadow-sm'
                  : 'border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]'
              }`}
            >
              All <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${currentFilter === 'all' ? 'bg-[#C88A2B] text-white' : 'bg-[#F4F4EE] text-[#888]'}`}>{allCount}</span>
            </Link>
            <Link
              href="/saved?status=saved"
              className={`flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs font-medium transition shrink-0 ${
                currentFilter === 'saved'
                  ? 'bg-[#E29D38] text-white shadow-sm'
                  : 'border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]'
              }`}
            >
              Saved <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${currentFilter === 'saved' ? 'bg-[#C88A2B] text-white' : 'bg-[#F4F4EE] text-[#888]'}`}>{savedCount}</span>
            </Link>
            <Link
              href="/saved?status=in_progress"
              className={`flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs font-medium transition shrink-0 ${
                currentFilter === 'in_progress'
                  ? 'bg-[#E29D38] text-white shadow-sm'
                  : 'border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]'
              }`}
            >
              In Progress <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${currentFilter === 'in_progress' ? 'bg-[#C88A2B] text-white' : 'bg-[#FBF0D9] text-[#C88A2B]'}`}>{inProgressCount}</span>
            </Link>
            <Link
              href="/saved?status=applied"
              className={`flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs font-medium transition shrink-0 ${
                currentFilter === 'applied'
                  ? 'bg-[#E29D38] text-white shadow-sm'
                  : 'border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]'
              }`}
            >
              Applied <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${currentFilter === 'applied' ? 'bg-[#C88A2B] text-white' : 'bg-[#F4F4EE] text-[#888]'}`}>{appliedCount}</span>
            </Link>
          </section>

          {/* Opportunities Section */}
          <section className="mt-6 sm:mt-8">
            {filteredApplications.length > 0 ? (
              <div className="space-y-4 md:space-y-0 md:rounded-3xl md:border md:border-[#EBEBE3] md:bg-white md:shadow-sm md:overflow-hidden">
                <div className="hidden md:grid grid-cols-12 border-b border-[#F5F5EF] px-8 py-4 text-[11px] font-semibold tracking-wider text-[#999] uppercase">
                  <div className="col-span-4">Opportunity</div>
                  <div className="col-span-2 text-center">Category</div>
                  <div className="col-span-2 text-center">Match</div>
                  <div className="col-span-2 text-center">Deadline</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                <div className="md:divide-y md:divide-[#F5F5EF] space-y-4 md:space-y-0">
                  {filteredApplications.map((item) => (
                    <OpportunityCardOrRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#EBEBE3] bg-white p-12 text-center text-[#888] shadow-sm">
                <p className="text-sm font-medium">No opportunities found for this filter.</p>
                <p className="mt-1 text-xs">Explore available listings or select a different tab.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

function OpportunityCardOrRow({ item }: { item: ApplicationItem }) {
  const opportunity = item.opportunity
  const oppId = item.opportunity_id

  return (
    <>
      {/* MOBILE CARD VIEW (< md) */}
      <div className="block md:hidden rounded-2xl border border-[#EBEBE3] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-[#1A1A1A]">
              {opportunity?.title || 'Untitled Opportunity'}
            </h3>
            <p className="text-xs text-[#888] mt-0.5">
              {opportunity?.organization || 'Unknown Organization'}
            </p>
          </div>
          <span className="inline-block rounded-full bg-[#EAF2EC] px-3 py-0.5 text-[11px] font-medium text-[#4B7355] shrink-0">
            {opportunity?.category || 'General'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F5F5EF]">
          <div>
            <span className="text-[#888]">Match: </span>
            <span className="font-semibold text-[#E29D38]">
              {opportunity?.match_score ? `${opportunity.match_score}%` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[#888]">Deadline: </span>
            <span className="font-medium text-[#666]">
              {opportunity?.deadline ? opportunity.deadline : 'No deadline'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#F5F5EF]">
          <form action={updateApplication} className="relative">
            <input type="hidden" name="opportunity_id" value={oppId} />
            <div className="relative flex items-center">
              <select
                name="status"
                defaultValue={item.status}
                className="appearance-none rounded-full bg-[#FBF0D9] py-1.5 pl-3 pr-7 text-xs font-semibold text-[#C88A2B] outline-none cursor-pointer"
              >
                <option value="saved">Saved</option>
                <option value="in_progress">In Progress</option>
                <option value="applied">Applied</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-[#C88A2B]" />
            </div>
          </form>

         <div className="flex items-center gap-3">
          <Link
            href={`/explore/${oppId}`}
            className="text-xs font-semibold text-[#1A1A1A] hover:underline"
          >
            View
          </Link>
          <form action={removeApplication}>
            <input type="hidden" name="opportunity_id" value={oppId} />
            <button 
              type="submit" 
              aria-label="Remove application"
              className="text-[#999] hover:text-[#D9534F] transition p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
        </div>
      </div>

      {/* DESKTOP TABLE ROW VIEW (md+) */}
      <div className="hidden md:grid grid-cols-12 items-center px-8 py-5 transition hover:bg-[#FAFDF9]">
        <div className="col-span-4">
          <h3 className="font-medium text-[#1A1A1A]">
            {opportunity?.title || 'Untitled Opportunity'}
          </h3>
          <p className="mt-0.5 text-xs text-[#888]">
            {opportunity?.organization || 'Unknown Organization'}
          </p>
        </div>

        <div className="col-span-2 text-center">
          <span className="inline-block rounded-full bg-[#EAF2EC] px-3.5 py-1 text-xs font-medium text-[#4B7355]">
            {opportunity?.category || 'General'}
          </span>
        </div>

        <div className="col-span-2 text-center font-semibold text-[#E29D38] text-sm">
          {opportunity?.match_score ? `${opportunity.match_score}%` : 'N/A'}
        </div>

        <div className="col-span-2 text-center text-xs font-medium text-[#666]">
          {opportunity?.deadline ? opportunity.deadline : 'No deadline'}
        </div>

        <div className="col-span-2 flex items-center justify-end gap-3">
          <form action={updateApplication} className="relative">
            <input type="hidden" name="opportunity_id" value={oppId} />
            <div className="relative flex items-center">
              <select
                name="status"
                defaultValue={item.status}
                className="appearance-none rounded-full bg-[#FBF0D9] py-1.5 pl-4 pr-8 text-xs font-semibold text-[#C88A2B] outline-none cursor-pointer"
              >
                <option value="saved">Saved</option>
                <option value="in_progress">In Progress</option>
                <option value="applied">Applied</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#C88A2B]" />
            </div>
          </form>

          <div className="flex items-center gap-3">
  <span className="text-[10px] hidden text-red-500">ID: {oppId || 'MISSING ID'}</span>
  <Link
    href={`/explore/${oppId}`}
    className="text-xs font-semibold text-[#1A1A1A] hover:underline"
  >
    View
  </Link>
  </div>
          <form action={removeApplication}>
            <input type="hidden" name="opportunity_id" value={oppId} />
            <button 
              type="submit" 
              aria-label="Remove application"
              className="text-[#999] hover:text-[#D9534F] transition p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
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