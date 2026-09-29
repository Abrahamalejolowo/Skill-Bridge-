'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, Mail, Star, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Status = 'pending' | 'reviewing' | 'accepted' | 'rejected'

interface OppRow {
  id: string
  title: string
}

interface AppRow {
  opportunity_id: string
  status: string | null
  created_at: string | null
  ai_match_score: number | null
}

const STATUS_META: Record<Status, { label: string; bar: string }> = {
  pending: { label: 'Pending', bar: 'bg-muted-foreground/50' },
  reviewing: { label: 'Reviewing', bar: 'bg-blue-500' },
  accepted: { label: 'Accepted', bar: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bar: 'bg-destructive' },
}

function normalizeStatus(raw: unknown): Status {
  const value = String(raw || '').toLowerCase()
  if (value === 'reviewing' || value === 'accepted' || value === 'rejected') return value
  return 'pending'
}

function dayKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AnalyticsPage() {
  const [opps, setOpps] = useState<OppRow[]>([])
  const [apps, setApps] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title')
        .eq('creator_id', user.id)

      if (oppError) throw oppError

      const list = (oppData || []) as OppRow[]
      setOpps(list)

      if (list.length > 0) {
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('opportunity_id, status, created_at, ai_match_score')
          .in(
            'opportunity_id',
            list.map((o) => o.id)
          )

        if (appError) throw appError
        setApps((appData || []) as AppRow[])
      }
    } catch (error) {
      console.error('Analytics load error:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const analytics = useMemo(() => {
    const byStatus: Record<Status, number> = {
      pending: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0,
    }
    apps.forEach((a) => {
      byStatus[normalizeStatus(a.status)]++
    })

    const perOpp = opps
      .map((o) => ({
        id: o.id,
        title: o.title,
        count: apps.filter((a) => a.opportunity_id === o.id).length,
      }))
      .sort((a, b) => b.count - a.count)

    const scores = apps
      .map((a) => Number(a.ai_match_score))
      .filter((n) => Number.isFinite(n) && n > 0)
    const avgMatch = scores.length
      ? Math.round(scores.reduce((sum, n) => sum + n, 0) / scores.length)
      : null

    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (13 - i))
      return {
        key: dayKey(d),
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0,
      }
    })
    const dayIndex = new Map<string, number>(days.map((d, i): [string, number] => [d.key, i]))
    apps.forEach((a) => {
      if (!a.created_at) return
      const idx = dayIndex.get(dayKey(new Date(a.created_at)))
      if (idx !== undefined) days[idx].count++
    })

    const total = apps.length
    const acceptanceRate = total ? Math.round((byStatus.accepted / total) * 100) : 0

    return { byStatus, perOpp, avgMatch, days, total, acceptanceRate }
  }, [opps, apps])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const { byStatus, perOpp, avgMatch, days, total, acceptanceRate } = analytics
  const maxDay = Math.max(...days.map((d) => d.count), 1)
  const maxOpp = Math.max(...perOpp.map((o) => o.count), 1)

  const stats = [
    { label: 'Opportunities Posted', value: opps.length, icon: FileText },
    { label: 'Total Applications', value: total, icon: Mail },
    { label: 'Average Match', value: avgMatch === null ? '—' : `${avgMatch}%`, icon: Star },
    { label: 'Acceptance Rate', value: `${acceptanceRate}%`, icon: CheckCircle2 },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          How your opportunities are performing
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl shadow-black/5 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{stat.value}</p>
              </div>
              <div className="flex items-center justify-center size-9 sm:size-11 rounded-xl sm:rounded-2xl bg-primary/10 text-primary shrink-0">
                <Icon className="size-4 sm:size-5" />
              </div>
            </div>
          )
        })}
      </div>

      {opps.length === 0 ? (
        <div className="text-center py-16 bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl shadow-xl shadow-black/5 p-8">
          <FileText className="size-10 sm:size-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-semibold text-base sm:text-lg">No data yet</p>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Post an opportunity and your analytics will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Applications over time */}
          <section className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Applications, last 14 days</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {days.reduce((s, d) => s + d.count, 0)} received in this period
              </p>
            </div>

            <div className="flex items-end gap-1.5 sm:gap-2 h-40 pt-4">
              {days.map((d) => (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col justify-end h-full group relative"
                  title={`${d.label}: ${d.count}`}
                >
                  <div
                    className={`w-full rounded-t-xl transition-all ${d.count > 0 ? 'bg-primary' : 'bg-muted/50'}`}
                    style={{
                      height: d.count > 0 ? `${Math.max((d.count / maxDay) * 100, 8)}%` : '6px',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] sm:text-xs text-muted-foreground pt-2 border-t border-border/50">
              <span>{days[0].label}</span>
              <span>{days[days.length - 1].label}</span>
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* By status */}
            <section className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Applications by status</h2>
              <div className="space-y-4">
                {(Object.keys(STATUS_META) as Status[]).map((status) => {
                  const count = byStatus[status]
                  const pct = total ? (count / total) * 100 : 0
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-foreground font-medium">
                          {STATUS_META[status].label}
                        </span>
                        <span className="text-muted-foreground font-semibold">{count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden border border-border/40">
                        <div
                          className={`h-full rounded-full transition-all ${STATUS_META[status].bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Per opportunity */}
            <section className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/5 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Applications by opportunity</h2>
              <div className="space-y-4">
                {perOpp.slice(0, 6).map((o) => (
                  <div key={o.id} className="space-y-1.5">
                    <div className="flex justify-between gap-3 text-xs sm:text-sm">
                      <span className="text-foreground font-medium truncate">{o.title}</span>
                      <span className="text-muted-foreground font-semibold shrink-0">{o.count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden border border-border/40">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(o.count / maxOpp) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}