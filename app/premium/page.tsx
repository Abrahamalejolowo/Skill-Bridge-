'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, Loader2, Copy, Check, Bell, LayoutDashboard } from 'lucide-react'
import { initiatePremiumPayment, getPremiumPageStatus, notifyPaymentMade } from '@/app/actions/premium'
import Link from 'next/link'

export default function PremiumPage() {
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getPremiumPageStatus>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    const res = await getPremiumPageStatus()
    setStatus(res)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!status?.pending || status.isPremium) return

    const interval = setInterval(refresh, 4000)
    return () => clearInterval(interval)
  }, [status, refresh])

  const handleStart = async () => {
    setLoading(true)
    setError(null)

    const result = await initiatePremiumPayment()

    if (!result.success) {
      setError(result.error || 'Could not start payment')
      setLoading(false)
      return
    }

    await refresh()
    setLoading(false)
  }

  const handlePaymentMade = async () => {
    setNotifying(true)
    const result = await notifyPaymentMade()
    if (!result.success) {
      setError(result.error || 'Failed to update payment status')
    } else {
      await refresh()
    }
    setNotifying(false)
  }

  const handleCopy = () => {
    if (!status?.pending?.accountNumber) return
    navigator.clipboard.writeText(status.pending.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-[#FAFAF0] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#4B7355]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF0] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EAEAE2] shadow-sm p-8 text-center relative">
        
        {status.pending && !status.isPremium && (
          <div className="absolute top-6 left-6">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4B7355] bg-[#4B7355]/10 px-2.5 py-1 rounded-full">
              Pending Verification
            </span>
          </div>
        )}

        <div className="h-14 w-14 rounded-full bg-[#4B7355]/10 flex items-center justify-center mx-auto mb-5 mt-2">
          <Sparkles className="h-7 w-7 text-[#4B7355]" />
        </div>

        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Skillsbridge Premium
        </h1>
        <p className="text-sm text-[#666] mb-6">
          Unlock unlimited AI career guidance, project mentoring, and application help.
        </p>

        {status.isPremium ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle2 className="h-8 w-8 text-[#4B7355]" />
            <p className="text-sm font-medium text-[#1A1A1A]">
              You're on Premium 🎉 AI features unlocked!
            </p>
            <Link
              href={status.dashboardPath}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#4B7355] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#3D5E45] transition"
            >
              Go to AI Dashboard
            </Link>
          </div>
        ) : status.pending ? (
          <div className="text-left">
            <div className="bg-[#FAFAF8] border border-[#E8E8E0] rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#4B7355] text-sm font-medium flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Awaiting Admin Approval
                </span>
                
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  status.pending.paymentSeen ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {status.pending.paymentSeen ? 'Reported (Unverified)' : 'Unseen'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <Row label="Bank" value={status.pending.bankName!} />
                <div className="flex items-center justify-between">
                  <span className="text-[#666]">Account Number</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 font-mono font-semibold text-[#1A1A1A] hover:text-[#4B7355] transition"
                  >
                    {status.pending.accountNumber}
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-[#4B7355]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[#999]" />
                    )}
                  </button>
                </div>
                <Row label="Account Name" value={status.pending.accountName!} />
                <Row
                  label="Amount"
                  value={`₦${Number(status.pending.amount).toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                  })}`}
                  emphasize
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-3">
                {error}
              </p>
            )}

            <button
              onClick={handlePaymentMade}
              disabled={notifying || status.pending.paymentSeen}
              className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#4B7355] py-3 text-xs font-bold text-white transition hover:bg-[#3D5E45] disabled:opacity-60 shadow-sm"
            >
              {notifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Notifying system...
                </>
              ) : status.pending.paymentSeen ? (
                'Payment Reported to Supabase ✓'
              ) : (
                'I Have Made the Payment'
              )}
            </button>

            <div className="bg-[#FFF8EC] border border-[#FDE6C5] rounded-2xl p-4 mb-6">
              <p className="text-xs text-[#9A6513] leading-relaxed mb-3">
                Transfer the <strong>exact</strong> amount. Go to your <strong>Supabase Dashboard</strong> and toggle <strong>payment_verified</strong> to <code>true</code> on your profile row. Your AI features will unlock instantly!
              </p>
              <div className="flex gap-2">
                <Link
                  href={status.dashboardPath}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#E8E8E0] py-2 rounded-xl text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F9F5] transition"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#4B7355]" />
                  Dashboard
                </Link>
                <Link
                  href="/notifications"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#E8E8E0] py-2 rounded-xl text-xs font-semibold text-[#1A1A1A] hover:bg-[#F9F9F5] transition"
                >
                  <Bell className="h-3.5 w-3.5 text-[#4B7355]" />
                  Notifications
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ul className="text-left text-sm text-[#444] space-y-2.5 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#4B7355] mt-0.5 shrink-0" />
                <span>Unlimited AI Advisor conversations</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#4B7355] mt-0.5 shrink-0" />
                <span>Personalized project and application guidance</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#4B7355] mt-0.5 shrink-0" />
                <span>Priority access to new AI features</span>
              </li>
            </ul>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#4B7355] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#3D5E45] transition disabled:opacity-60 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing your payment...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Upgrade with BMONI — ₦5,000/mo
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#666]">{label}</span>
      <span className={emphasize ? 'font-bold text-[#4B7355]' : 'font-medium text-[#1A1A1A]'}>
        {value}
      </span>
    </div>
  )
}