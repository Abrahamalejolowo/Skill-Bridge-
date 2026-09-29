'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, CheckCircle2, Clock, XCircle, Search, Users, Sparkles, Filter, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Status = 'pending' | 'reviewing' | 'accepted' | 'rejected'

interface ApplicantRow {
  id: string
  status: Status
  matchScore: number | null
  appliedAt: string | null
  name: string
  email: string
  skills: string[]
  education: string
  opportunityTitle: string
}

function normalizeStatus(raw: unknown): Status {
  const value = String(raw || '').toLowerCase()
  if (value === 'reviewing' || value === 'accepted' || value === 'rejected') return value
  return 'pending'
}

function computeMatch(studentSkills: string[], requiredSkills: string[]): number | null {
  if (!requiredSkills.length) return null
  const have = new Set(studentSkills.map((s) => s.trim().toLowerCase()))
  const matched = requiredSkills.filter((s) => have.has(s.trim().toLowerCase())).length
  return Math.round((matched / requiredSkills.length) * 100)
}

export default function ApplicantsView({ opportunityId }: { opportunityId?: string }) {
  const [rows, setRows] = useState<ApplicantRow[]>([])
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId])

  const loadData = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/creator/sign-in')
        return
      }

      let oppQuery = supabase
        .from('opportunities')
        .select('id, title, skills')
        .eq('creator_id', user.id)
      if (opportunityId) oppQuery = oppQuery.eq('id', opportunityId)

      const { data: opps, error: oppError } = await oppQuery
      if (oppError) throw oppError

      if (!opps || opps.length === 0) {
        if (opportunityId) {
          toast.error('Opportunity not found')
          router.replace('/creator/opportunities')
        } else {
          setRows([])
        }
        return
      }

      if (opportunityId) setPageTitle(opps[0].title)

      const oppMap = new Map<string, { title: string; skills: string[] }>()
      opps.forEach((o: any) =>
        oppMap.set(o.id, { title: o.title, skills: Array.isArray(o.skills) ? o.skills : [] })
      )

      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .in('opportunity_id', Array.from(oppMap.keys()))
      if (appsError) throw appsError

      const applications = apps || []

      const userIds = Array.from(
        new Set(
          applications
            .map((a: any) => a.user_id ?? a.student_id)
            .filter((id: unknown): id is string => typeof id === 'string')
        )
      )

      const profileMap = new Map<string, any>()
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, skills, education_level, institution')
          .in('id', userIds)
        if (profilesError) throw profilesError
        ;(profiles || []).forEach((p: any) => profileMap.set(p.id, p))
      }

      const built: ApplicantRow[] = applications.map((app: any) => {
        const studentId = app.user_id ?? app.student_id
        const profile = profileMap.get(studentId)
        const opp = oppMap.get(app.opportunity_id)
        const skills: string[] = Array.isArray(profile?.skills) ? profile.skills : []

        const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
        const stored = Number(app.ai_match_score)

        return {
          id: app.id,
          status: normalizeStatus(app.status),
          matchScore:
            Number.isFinite(stored) && stored > 0
              ? Math.round(stored)
              : computeMatch(skills, opp?.skills || []),
          appliedAt: app.applied_at ?? app.created_at ?? null,
          name: fullName || 'Student',
          email: profile?.email || '',
          skills,
          education: [profile?.education_level, profile?.institution].filter(Boolean).join(' • '),
          opportunityTitle: opp?.title || 'Untitled',
        }
      })

      built.sort((a, b) => {
        const ta = a.appliedAt ? new Date(a.appliedAt).getTime() : 0
        const tb = b.appliedAt ? new Date(b.appliedAt).getTime() : 0
        return tb - ta
      })

      setRows(built)
    } catch (error) {
      console.error('Error loading applicants:', error)
      toast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (applicationId: string, newStatus: Status) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select('id')

      if (error) throw error

      if (!data || data.length === 0) {
        toast.error("You don't have permission to update this application")
        return
      }

      setRows((prev) => prev.map((r) => (r.id === applicationId ? { ...r, status: newStatus } : r)))
      toast.success(`Application marked ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => r.status === 'pending').length,
      reviewing: rows.filter((r) => r.status === 'reviewing').length,
      accepted: rows.filter((r) => r.status === 'accepted').length,
      rejected: rows.filter((r) => r.status === 'rejected').length,
    }),
    [rows]
  )

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return rows.filter((r) => {
      const matchesSearch =
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.opportunityTitle.toLowerCase().includes(term)
      const matchesStatus = !filterStatus || r.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [rows, searchTerm, filterStatus])

  const matchColor = (score: number | null) => {
    if (score === null) return 'bg-muted text-muted-foreground border border-border'
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
    if (score >= 60) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
    if (score >= 40) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
    return 'bg-destructive/10 text-destructive border border-destructive/20'
  }

  const statusStyle: Record<Status, string> = {
    pending: 'bg-muted text-muted-foreground border border-border',
    reviewing: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    rejected: 'bg-destructive/10 text-destructive border border-destructive/20',
  }

  const statusIcon: Record<Status, React.ReactNode> = {
    pending: <Clock className="size-3.5" />,
    reviewing: <TrendingUp className="size-3.5" />,
    accepted: <CheckCircle2 className="size-3.5" />,
    rejected: <XCircle className="size-3.5" />,
  }

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—'

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {opportunityId ? `Applicants for ${pageTitle ?? 'this opportunity'}` : 'All Applications'}
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          {opportunityId
            ? 'Manage and review applicants for this opportunity'
            : 'Manage applications across all your active opportunities'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {(
          [
            ['Total', stats.total, Users],
            ['Pending', stats.pending, Clock],
            ['Reviewing', stats.reviewing, TrendingUp],
            ['Accepted', stats.accepted, CheckCircle2],
            ['Rejected', stats.rejected, XCircle],
          ] as const
        ).map(([label, value, Icon]) => (
          <div key={label} className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl shadow-black/5 flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary shrink-0">
              <Icon className="size-4 sm:size-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              opportunityId ? 'Search by name or email...' : 'Search name, email, or role...'
            }
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-background/50 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl sm:rounded-3xl shadow-xl shadow-black/5 p-6">
          <Users className="size-10 sm:size-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-semibold text-base sm:text-lg">
            {searchTerm || filterStatus ? 'No applications match your search criteria' : 'No applications received yet'}
          </p>
          {!searchTerm && !filterStatus && (
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Students and graduates will appear here once they submit applications.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Mobile View: Cards layout (< md) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl p-4 shadow-lg shadow-black/5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{row.name}</h3>
                    {row.email && <p className="text-xs text-muted-foreground">{row.email}</p>}
                    {row.education && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{row.education}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 ${statusStyle[row.status]}`}>
                    {statusIcon[row.status]}
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </div>

                {!opportunityId && (
                  <div className="text-xs font-medium text-foreground bg-muted/30 px-3 py-2 rounded-xl">
                    <span className="text-muted-foreground font-normal">Role: </span>
                    {row.opportunityTitle}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Applied {formatDate(row.appliedAt)}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs ${matchColor(row.matchScore)}`}>
                    <Sparkles className="size-3.5" />
                    {row.matchScore === null ? '—' : `${row.matchScore}% Match`}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {row.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-lg font-medium">
                        {skill}
                      </span>
                    ))}
                    {row.skills.length > 4 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] text-muted-foreground">
                        +{row.skills.length - 4} more
                      </span>
                    )}
                    {row.skills.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => updateStatus(row.id, 'reviewing')}
                    disabled={row.status === 'reviewing'}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition disabled:opacity-40"
                  >
                    <TrendingUp className="size-3.5" />
                    Review
                  </button>
                  <button
                    onClick={() => updateStatus(row.id, 'accepted')}
                    disabled={row.status === 'accepted'}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition disabled:opacity-40"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(row.id, 'rejected')}
                    disabled={row.status === 'rejected'}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition disabled:opacity-40"
                  >
                    <XCircle className="size-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table layout (md and up) */}
          <div className="hidden md:block bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Applicant</th>
                    {!opportunityId && <th className="px-6 py-4">Opportunity</th>}
                    <th className="px-6 py-4">Skills</th>
                    <th className="px-6 py-4">Match Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Applied</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/20 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{row.name}</p>
                        {row.email && <p className="text-xs text-muted-foreground">{row.email}</p>}
                        {row.education && <p className="text-xs text-muted-foreground/80 mt-0.5">{row.education}</p>}
                      </td>
                      {!opportunityId && (
                        <td className="px-6 py-4 font-medium text-foreground">
                          {row.opportunityTitle}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {row.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-xl font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {row.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground font-medium">
                              +{row.skills.length - 3} more
                            </span>
                          )}
                          {row.skills.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${matchColor(row.matchScore)}`}>
                          <Sparkles className="size-3.5" />
                          {row.matchScore === null ? '—' : `${row.matchScore}%`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusStyle[row.status]}`}>
                          {statusIcon[row.status]}
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {formatDate(row.appliedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => updateStatus(row.id, 'reviewing')}
                            disabled={row.status === 'reviewing'}
                            className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition disabled:opacity-40"
                            title="Mark as reviewing"
                          >
                            <TrendingUp className="size-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(row.id, 'accepted')}
                            disabled={row.status === 'accepted'}
                            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition disabled:opacity-40"
                            title="Accept applicant"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(row.id, 'rejected')}
                            disabled={row.status === 'rejected'}
                            className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition disabled:opacity-40"
                            title="Reject applicant"
                          >
                            <XCircle className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}