'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Plus,
  FileText,
  Mail,
  BarChart3,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onLogout: () => void
  onAnalyticsClick: () => void
}

export function Sidebar({ sidebarOpen, setSidebarOpen, onLogout, onAnalyticsClick }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/creator' },
    { icon: Plus, label: 'Post Opportunity', href: '/creator/opportunities/create' },
    { icon: FileText, label: 'My Opportunities', href: '/creator/opportunities' },
    { icon: Mail, label: 'Applications', href: '/creator/applications' },
    { icon: BarChart3, label: 'Analytics', href: '/creator/analytics', isPremium: true },
    { icon: User, label: 'Organization profile', href: '/creator/profile' },
  ]

  const isActive = (href: string) => {
    if (href === '/creator') return pathname === '/creator'

    if (href === '/creator/opportunities') {
      return (
        pathname === href ||
        (pathname.startsWith(`${href}/`) && !pathname.startsWith('/creator/opportunities/create'))
      )
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col justify-between bg-[#FAFAF0] px-6 py-8 transition-transform md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SkillBridge Logo"
            width={130}
            height={35}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Creator Workspace
        </p>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            if (item.isPremium) {
              return (
                <button
                  key={item.href}
                  onClick={onAnalyticsClick}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition group"
                >
                  <span className="flex items-center gap-3.5">
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                    <Sparkles className="size-3" />
                    PRO
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-5" />
        <span>Log Out</span>
      </button>
    </aside>
  )
}