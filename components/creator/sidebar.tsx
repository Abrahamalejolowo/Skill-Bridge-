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
  X,
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
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between bg-[#FAFAF0] px-6 py-8 border-r border-border/40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
      }`}
    >
      <div className="space-y-6">
        {/* Brand Logo, Close Button & Workspace Title */}
        <div className="px-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-block transition-transform hover:opacity-90">
              <Image
                src="/logo.png"
                alt="SkillBridge Logo"
                width={130}
                height={35}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Creator Workspace
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            if (item.isPremium) {
              return (
                <button
                  key={item.href}
                  onClick={onAnalyticsClick}
                  className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-amber-500/5 hover:text-amber-900 transition-all duration-200 group cursor-pointer"
                >
                  <span className="flex items-center gap-3.5">
                    <Icon className="size-5 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold tracking-wider border border-amber-500/20 shadow-xs transition-transform group-hover:scale-105">
                    <Sparkles className="size-3 animate-spin" style={{ animationDuration: '4s' }} />
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
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <Icon className={`size-5 transition-transform group-hover:scale-110 ${active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / Logout Action */}
      <div className="pt-4 border-t border-border/50">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group cursor-pointer"
        >
          <LogOut className="size-5 transition-transform group-hover:-translate-x-0.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}