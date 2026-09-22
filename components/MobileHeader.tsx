'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Compass, 
  Bookmark, 
  Map, 
  User, 
  LogOut,
  MessageCircle,
  Bell
} from 'lucide-react'

interface MobileHeaderProps {
  initials?: string
  showNotificationIcon?: boolean
  onNotificationClick?: () => void
}

export default function MobileHeader({ 
  initials = 'AC', 
  showNotificationIcon = true,
  onNotificationClick 
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <>
      {/* Top Mobile Header Bar */}
      <header className="sticky top-0 z-40 flex lg:hidden items-center justify-between border-b border-[#EAEAE2] bg-white px-4 py-3.5 shadow-sm">
        {/* Left: Hamburger Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-1.5 text-[#1A1A1A] hover:bg-[#F5F5EF] transition cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/dashboard" className="font-serif text-xl font-bold tracking-tight">
            <span className="text-[#E29D38]">Skills</span><span className="text-[#4B7355]">bridge</span>
          </Link>
        </div>

        {/* Right: Notifications & Profile Avatar Link */}
        <div className="flex items-center gap-3">
          {showNotificationIcon && (
            <button
              onClick={onNotificationClick}
              className="relative rounded-lg p-2 text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A] transition cursor-pointer"
              aria-label="Open Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D9534F]" />
            </button>
          )}

          <Link 
            href="/profile" 
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B7355] text-xs font-semibold text-white shadow-sm"
            aria-label="User Profile"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar Content */}
          <div className="relative flex w-72 max-w-full flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-10 shadow-xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between">
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="font-serif text-2xl font-bold text-[#4B7355]"
                >
                  Skills<span className="text-[#E29D38]">bridge</span>
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A] transition cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-10 space-y-2">
                <MobileNavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/explore" icon={Compass} label="Explore" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/saved" icon={Bookmark} label="Saved" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/roadmap" icon={Map} label="Roadmap" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/chat" icon={MessageCircle} label="AI Advisor" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/profile" icon={User} label="Profile" onClick={() => setIsOpen(false)} />
              </nav>
            </div>

            <div className="pt-6 border-t border-[#F5F5EF]">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#666] transition hover:bg-[#F5F5EF] hover:text-[#1A1A1A] cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string
  icon: any
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-[#666] transition hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
    >
      <Icon className="h-5 w-5 text-[#888]" />
      {label}
    </Link>
  )
}