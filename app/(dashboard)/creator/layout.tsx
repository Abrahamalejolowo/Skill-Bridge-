'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Bell, Sparkles, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/creator/sidebar'
import { getPremiumStatus } from '@/app/actions/chat'
import Image from 'next/image'
import Link from 'next/link'

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'CR'
  )
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [isPremium, setIsPremium] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const isOnboarding = pathname?.startsWith('/creator/onboarding')

  useEffect(() => {
    checkAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const checkAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/creator/sign-in')
        return
      }

      setEmail(user.email || '')

      if (isOnboarding) {
        setLoading(false)
        return
      }

      const { data: creator } = await supabase
        .from('creator_profiles')
        .select('verification_status, organization_name')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!creator || !creator.organization_name) {
        router.replace('/creator/onboarding')
        return
      }

      if (creator.verification_status !== 'verified') {
        router.replace('/auth/creator/verification-pending')
        return
      }

      setOrgName(creator.organization_name)

      const premiumStatus = await getPremiumStatus()
      setIsPremium(premiumStatus.isPremium)

      setLoading(false)
    } catch (error) {
      console.error('Auth error:', error)
      router.replace('/auth/creator/sign-in')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleAnalyticsClick = () => {
    setShowPremiumModal(true)
    setSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isOnboarding) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onAnalyticsClick={handleAnalyticsClick}
        isPremium={isPremium}
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Header z-index is set to 30 so it sits under the sidebar (z-50) */}
        <header className="h-[72px] bg-[#FAFAF0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-sm border-b border-border/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-muted border border-border text-foreground relative z-40"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SkillBridge Logo"
                width={130}
                height={35}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/notifications"
              className="relative text-muted-foreground hover:text-foreground transition"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shrink-0">
                {getInitials(orgName)}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-foreground">{orgName || 'Creator'}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative flex-1">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {children}
        </main>
      </div>

      {/* Premium Upgrade Modal Popup */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowPremiumModal(false)}
          />

          <div className="relative w-full max-w-md bg-card/95 backdrop-blur-2xl border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/10 space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center size-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-inner">
                <Sparkles className="size-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Unlock Creator Analytics
                </h2>
                <p className="text-sm text-muted-foreground">
                  Upgrade to SkillBridge Pro to access deep candidate insights, AI match score distributions, and application velocity reports.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border/50 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary shrink-0">
                  <Check className="size-3.5" />
                </div>
                <span>Detailed 14-day application trend charts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary shrink-0">
                  <Check className="size-3.5" />
                </div>
                <span>Average AI candidate match breakdowns</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary shrink-0">
                  <Check className="size-3.5" />
                </div>
                <span>Real-time conversion & acceptance rates</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  router.push('/premium')
                  setShowPremiumModal(false)
                }}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="size-4" />
                Upgrade to Pro
              </button>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full py-3 px-4 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-2xl font-semibold transition text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}