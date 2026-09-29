'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlarmClock,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Plus,
  Users,
  Wifi,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Status = 'pending' | 'reviewing' | 'accepted' | 'rejected'

interface Opp {
  id: string
  title: string
  category: string
  location: string | null
  remote: boolean | null
  deadline: string | null
  created_at: string
}

interface RecentApplicant {
  id: string
  opportunityId: string
  name: string
  opportunityTitle: string
  status: Status
}

interface DashboardData {
  name: string
  opportunities: Opp[]
  applicantCounts: Record<string, number>
  totalApplications: number
  awaitingReview: number
  activeCount: number
  closingThisWeek: number
  recentApplicants: RecentApplicant[]
}

// Dark amber derived from your --accent token, so it follows your theme
const AMBER_STRONG = 'text-[color-mix(in_oklab,var(--accent)_60%,black)]'

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  reviewing: { label: 'Reviewing', className: 'bg-accent/30 text-accent-foreground' },
  accepted: { label: 'Accepted', className: 'bg-primary/15 text-primary' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
}

function normalizeStatus(raw: unknown): Status {
  const value = String(raw || '').toLowerCase()
  if (value === 'reviewing' || value === 'accepted' || value === 'rejected') return value
  return 'pending' // "applied" and anything unknown count as pending
}

// Days remaining, counting through the end of the deadline day.
// Returns null when there is no deadline, and 0 or less once it has passed.
function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null
  const [y, m, d] = deadline.split('-').map(Number)
  if (!y || !m || !d) return null
  const end = new Date(y, m - 1, d, 23, 59, 59)
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function deadlineBadgeClass(left: number) {
  if (left <= 7) return 'bg-destructive/10 text-destructive border border-destructive/30'
  if (left <= 14) return 'bg-accent/30 text-accent-foreground border border-accent/50'
  return 'bg-primary/15 text-primary border border-primary/30'
}

export default function CreatorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboard = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [creatorRes, oppsRes] = await Promise.all([
        supabase
          .from('creator_profiles')
          .select('organization_name, contact_person_name')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('opportunities')
          .select('id, title, category, location, remote, deadline, created_at')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      if (oppsRes.error) throw oppsRes.error

      const opportunities = (oppsRes.data || []) as Opp[]

      // Applications are optional: if this fails, the rest of the page still loads
      let applications: {
        id: string
        opportunity_id: string
        student_id: string | null
        status: string | null
        created_at: string | null
      }[] = []

      if (opportunities.length > 0) {
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select('id, opportunity_id, student_id, status, created_at')
          .in(
            'opportunity_id',
            opportunities.map((o) => o.id)
          )
          .order('created_at', { ascending: false })

        if (!appsError && apps) applications = apps
      }

      const applicantCounts: Record<string, number> = {}
      opportunities.forEach((o) => {
        applicantCounts[o.id] = 0
      })
      applications.forEach((a) => {
        applicantCounts[a.opportunity_id] = (applicantCounts[a.opportunity_id] || 0) + 1
      })

      // Names for the "Recent Applicants" panel
      const recentApps = applications.slice(0, 4)
      const studentIds = Array.from(
        new Set(recentApps.map((a) => a.student_id).filter((id): id is string => Boolean(id)))
      )

      const nameMap = new Map<string, string>()
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', studentIds)

        ;(profiles || []).forEach((p: any) => {
          const full = `${p.first_name || ''} ${p.last_name || ''}`.trim()
          if (full) nameMap.set(p.id, full)
        })
      }

      const titleMap = new Map(opportunities.map((o) => [o.id, o.title]))

      const recentApplicants: RecentApplicant[] = recentApps.map((a) => ({
        id: a.id,
        opportunityId: a.opportunity_id,
        name: (a.student_id && nameMap.get(a.student_id)) || 'Student',
        opportunityTitle: titleMap.get(a.opportunity_id) || 'Untitled',
        status: normalizeStatus(a.status),
      }))

      const activeOpps = opportunities.filter((o) => {
        const left = daysLeft(o.deadline)
        return left === null || left > 0
      })

      const closingThisWeek = activeOpps.filter((o) => {
        const left = daysLeft(o.deadline)
        return left !== null && left <= 7
      }).length

      const awaitingReview = applications.filter((a) => normalizeStatus(a.status) === 'pending').length

      setData({
        name:
          creatorRes.data?.organization_name ||
          creatorRes.data?.contact_person_name ||
          'there',
        opportunities,
        applicantCounts,
        totalApplications: applications.length,
        awaitingReview,
        activeCount: activeOpps.length,
        closingThisWeek,
        recentApplicants,
      })
    } catch (error) {
      console.error('Dashboard load error:', error)
      toast.error('Failed to load your dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-8 p-6 md:p-10">
        <div className="h-10 w-1/3 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            <div className="h-52 rounded-3xl bg-muted" />
            <div className="h-52 rounded-3xl bg-muted" />
          </div>
          <div className="h-72 rounded-3xl bg-muted lg:col-span-4" />
        </div>
      </div>
    )
  }

  const upcomingDeadlines = data.opportunities
    .filter((o) => {
      const left = daysLeft(o.deadline)
      return left !== null && left > 0
    })
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .slice(0, 4)

  const subtitle =
    data.opportunities.length === 0
      ? 'Post your first opportunity to start receiving applicants.'
      : `You have ${data.activeCount} active ${
          data.activeCount === 1 ? 'opportunity' : 'opportunities'
        } and ${data.awaitingReview} ${
          data.awaitingReview === 1 ? 'application' : 'applications'
        } waiting for review.`

  const stats = [
    { label: 'Active Opportunities', value: data.activeCount, color: AMBER_STRONG },
    { label: 'Total Applications', value: data.totalApplications, color: AMBER_STRONG },
    { label: 'Closing This Week', value: data.closingThisWeek, color: 'text-accent' },
    { label: 'Awaiting Review', value: data.awaitingReview, color: 'text-primary' },
  ]

  return (
    <div className="mx-auto max-w-7xl bg-[#FAFAF0] space-y-10 p-6 md:p-10">
      {/* Welcome */}
      <section>
        <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Welcome back, <span className={AMBER_STRONG}>{data.name}.</span>
        </h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-accent/40 bg-card px-6 py-5 shadow-sm"
          >
            <p className={`font-serif text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Your opportunities */}
        <section className="lg:col-span-8">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-serif text-2xl font-semibold text-foreground">Your Opportunities</h2>
            <Link
              href="/creator/opportunities"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
            >
              See All <ArrowRight className="size-4" />
            </Link>
          </div>

          {data.opportunities.length === 0 ? (
            <div className="rounded-3xl border border-accent/40 bg-card px-6 py-14 text-center shadow-sm">
              <p className="font-serif text-xl font-semibold text-foreground">No opportunities yet</p>
              <p className="mx-auto mt-1 mb-6 max-w-sm text-sm text-muted-foreground">
                Post an internship, scholarship or project and students will start applying.
              </p>
              <Link
                href="/creator/opportunities/create"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus className="size-4" />
                Create Your First Opportunity
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {data.opportunities.slice(0, 4).map((opp) => {
                const left = daysLeft(opp.deadline)
                const closed = left !== null && left <= 0
                const count = data.applicantCounts[opp.id] ?? 0

                return (
                  <div
                    key={opp.id}
                    className="flex flex-col rounded-3xl border border-accent/40 bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                        {opp.category}
                      </span>
                      <span className="rounded-full bg-accent/40 px-3 py-1 text-xs font-semibold text-accent-foreground">
                        {count} applicant{count === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h3 className="mt-4 font-serif text-xl font-semibold leading-snug text-foreground">
                      {opp.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Posted{' '}
                      {new Date(opp.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        {opp.remote ? (
                          <Wifi className="size-4" />
                        ) : (
                          <MapPin className="size-4" />
                        )}
                        {opp.remote ? 'Remote' : opp.location || 'Not specified'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          closed
                            ? 'text-muted-foreground'
                            : left !== null && left <= 7
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <AlarmClock className="size-4" />
                        {left === null
                          ? 'Open'
                          : closed
                          ? 'Closed'
                          : `${left} day${left === 1 ? '' : 's'} left`}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 text-sm font-medium">
                      <Link
                        href={`/creator/opportunities/${opp.id}/applicants`}
                        className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground"
                      >
                        <Users className="size-4" />
                        Applicants
                      </Link>
                      <Link
                        href={`/explore/${opp.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-foreground transition hover:text-primary"
                      >
                        View <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Right column */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Deadlines */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-foreground">Deadlines Coming Up</h2>

            {upcomingDeadlines.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">No upcoming deadlines.</p>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {upcomingDeadlines.map((opp) => {
                  const left = daysLeft(opp.deadline) as number
                  return (
                    <li key={opp.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{opp.title}</p>
                        <p className="text-xs text-muted-foreground">{opp.category}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${deadlineBadgeClass(left)}`}
                      >
                        {left} day{left === 1 ? '' : 's'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Recent applicants */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-foreground">Recent Applicants</h2>

            {data.recentApplicants.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Students show up here after they apply.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-border">
                {data.recentApplicants.map((applicant) => {
                  const style = STATUS_STYLE[applicant.status]
                  return (
                    <li key={applicant.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {applicant.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {applicant.opportunityTitle}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}

            <Link
              href="/creator/applications"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
            >
              View All Applications <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* CTA card */}
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm">
            <h2 className="font-serif text-xl font-semibold">Reach More Students</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
              Post a new opportunity and it is matched against student skill profiles right away.
            </p>
            <Link
              href="/creator/opportunities/create"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              <Plus className="size-4" />
              Post Opportunity
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}