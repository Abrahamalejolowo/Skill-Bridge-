'use client'

import { useState } from 'react' 
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  kind: string
  read_at: string | null
  created_at: string
}

export default function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter((n) => !n.read_at).length

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )

    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      router.refresh()
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  const markAllAsRead = async () => {
    setIsUpdating(true)
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || now })))

    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      router.refresh()
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F7F2] px-5 py-10 text-[#1A1A1A] sm:px-8 font-sans antialiased">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4B7355] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold">Notifications</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#777]">
              Deadline reminders, profile updates, and new match signals.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isUpdating}
              className="flex items-center gap-2 self-start rounded-xl border border-[#D5D5CD] bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm transition hover:bg-[#F5F5EF]"
            >
              <CheckCheck className="h-4 w-4 text-[#4B7355]" />
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-3">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const isUnread = !n.read_at
              return (
                <article
                  key={n.id}
                  onClick={() => isUnread && markAsRead(n.id)}
                  className={`relative rounded-2xl border p-5 transition cursor-pointer shadow-sm ${
                    isUnread
                      ? 'border-[#4B7355]/40 bg-white hover:border-[#4B7355]'
                      : 'border-[#EBEBE3] bg-white/60 opacity-80'
                  }`}
                >
                  {isUnread && (
                    <span className="absolute top-5 right-5 h-2 w-2 rounded-full bg-[#4B7355]" />
                  )}
                  <div className="flex items-center justify-between gap-4 pr-4">
                    <h2 className="font-serif text-base font-semibold text-[#1A1A1A]">{n.title}</h2>
                    <span className="text-xs text-[#888]">
                      {new Date(n.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-[#555] leading-relaxed">{n.message}</p>
                </article>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#D5D5CD] bg-white/40 p-12 text-center text-[#777]">
              <Bell className="mx-auto h-8 w-8 text-[#CCC] mb-3" />
              <p className="text-sm font-medium">You&apos;re all caught up.</p>
              <p className="text-xs text-[#999] mt-1">Check back later for new opportunity updates.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}