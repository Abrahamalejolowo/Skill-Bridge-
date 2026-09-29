'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Trash2,
  Loader2,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CreatorOpportunity {
  id: string
  title: string
  category: string
  location: string | null
  remote: boolean | null
  deadline: string | null
  created_at: string
  official_url: string | null
}

export default function MyOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<CreatorOpportunity[]>([])
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadOpportunities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadOpportunities = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, category, location, remote, deadline, created_at, official_url')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const list = (data || []) as CreatorOpportunity[]
      setOpportunities(list)

      if (list.length > 0) {
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select('opportunity_id')
          .in(
            'opportunity_id',
            list.map((o) => o.id)
          )

        if (!appsError && apps) {
          const counts: Record<string, number> = {}
          list.forEach((o) => {
            counts[o.id] = 0
          })
          apps.forEach((a: any) => {
            counts[a.opportunity_id] = (counts[a.opportunity_id] || 0) + 1
          })
          setApplicantCounts(counts)
        }
      }
    } catch (err) {
      console.error('Load opportunities error:', err)
      toast.error('Failed to load your opportunities')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (opportunity: CreatorOpportunity) => {
    const confirmed = window.confirm(
      `Delete "${opportunity.title}"? This can't be undone.`
    )
    if (!confirmed) return

    setDeletingId(opportunity.id)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunity.id)
        .eq('creator_id', user.id)

      if (error) throw error

      setOpportunities((prev) => prev.filter((o) => o.id !== opportunity.id))
      toast.success('Opportunity deleted')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete opportunity'
      console.error('Delete error:', err)
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  const isClosed = (deadline: string | null) => {
    if (!deadline) return false
    const end = new Date(`${deadline}T23:59:59`)
    return end.getTime() < Date.now()
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            My Opportunities
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {opportunities.length === 0
              ? 'Opportunities you post will show up here'
              : `${opportunities.length} posted opportunity${opportunities.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link
          href="/creator/opportunities/create"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-primary/20 transition text-sm"
        >
          <Plus className="size-4" />
          Post Opportunity
        </Link>
      </div>

      {/* Empty state */}
      {opportunities.length === 0 ? (
        <div className="text-center py-16 bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl shadow-xl shadow-black/5 p-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <FileText className="size-7" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No opportunities yet</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Post your first opportunity and start receiving applicants.
          </p>
          <Link
            href="/creator/opportunities/create"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-primary/20 transition text-sm"
          >
            <Plus className="size-4" />
            Post Opportunity
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => {
            const closed = isClosed(opp.deadline)
            const count = applicantCounts[opp.id]

            return (
              <div
                key={opp.id}
                className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition hover:border-border"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                      {opp.title}
                    </h2>
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {opp.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                        closed
                          ? 'bg-muted text-muted-foreground border border-border'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {closed ? 'Closed' : 'Active'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground/80" />
                      {opp.remote ? 'Remote' : opp.location || 'Not specified'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground/80" />
                      {opp.deadline
                        ? `Deadline ${formatDate(opp.deadline)}`
                        : 'No deadline'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground/80" />
                      {count === undefined
                        ? 'Applicants'
                        : `${count} applicant${count === 1 ? '' : 's'}`}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground/70">
                    Posted {formatDate(opp.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 shrink-0">
                  <Link
                    href={`/creator/opportunities/${opp.id}/applicants`}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl text-xs font-semibold transition text-center"
                  >
                    Applicants
                  </Link>
                  <Link
                    href={`/explore/${opp.id}`}
                    target="_blank"
                    className="p-2.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-2xl transition border border-border/60"
                    title="View as student"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(opp)}
                    disabled={deletingId === opp.id}
                    className="p-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-2xl transition disabled:opacity-50 border border-destructive/20"
                    title="Delete"
                  >
                    {deletingId === opp.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}