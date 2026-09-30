'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
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
  Bell,
  Sparkles
} from 'lucide-react'

interface MobileHeaderProps {
  initials?: string
  showNotificationIcon?: boolean
  onAIAdvisorClick?: () => void
}

export default function MobileHeader({ 
  initials = 'AC', 
  onAIAdvisorClick
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
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
        </div>

        {/* Right: Notifications & Profile Avatar Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A] transition cursor-pointer"
            aria-label="Open Notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>

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
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A] transition cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-10 space-y-2">
                <MobileNavLink 
                  href="/dashboard" 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={isActive('/dashboard')}
                  onClick={() => setIsOpen(false)} 
                />
                <MobileNavLink 
                  href="/explore" 
                  icon={Compass} 
                  label="Explore" 
                  active={isActive('/explore')}
                  onClick={() => setIsOpen(false)} 
                />
                <MobileNavLink 
                  href="/saved" 
                  icon={Bookmark} 
                  label="Saved" 
                  active={isActive('/saved')}
                  onClick={() => setIsOpen(false)} 
                />
                <MobileNavLink 
                  href="/roadmap" 
                  icon={Map} 
                  label="Roadmap" 
                  active={isActive('/roadmap')}
                  onClick={() => setIsOpen(false)} 
                />
                
                {/* AI Advisor with PRO Badge */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    if (onAIAdvisorClick) {
                      onAIAdvisorClick()
                    } else {
                      router.push('/chat')
                    }
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer ${
                    isActive('/chat')
                      ? 'bg-[#4B7355]/10 text-[#4B7355] font-semibold'
                      : 'text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="flex items-center gap-3.5">
                    <MessageCircle className={`h-5 w-5 ${isActive('/chat') ? 'text-[#4B7355]' : 'text-[#888]'}`} />
                    <span>AI Advisor</span>
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                    <Sparkles className="size-3" />
                    PRO
                  </span>
                </button>

                <MobileNavLink 
                  href="/profile" 
                  icon={User} 
                  label="Profile" 
                  active={isActive('/profile')}
                  onClick={() => setIsOpen(false)} 
                />
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
  active,
  onClick,
}: {
  href: string
  icon: any
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? 'bg-[#4B7355] text-white shadow-sm font-semibold'
          : 'text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]'
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-[#888]'}`} />
      {label}
    </Link>
  )
}