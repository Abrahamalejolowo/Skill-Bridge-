'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, MapPin, Search, Bookmark, ArrowUpRight, ArrowLeft, SlidersHorizontal } from 'lucide-react'

const filters = [
  'All',
  'Scholarship',
  'Internship',
  'Hackathon',
  'Grant',
  'Fellowship',
]

interface OpportunityItem {
  id: string
  title: string
  organization: string
  category: string
  location: string
  deadline: string | null
  verified?: boolean
}

interface OpportunitiesClientProps {
  initialItems: OpportunityItem[]
}

export default function OpportunitiesClient({ initialItems }: OpportunitiesClientProps) {
  const [activeFilter, setActiveFilter] = useState('All')
  const safeItems = initialItems ?? []

  // Filter items based on category selection
  const filteredItems = safeItems.filter((item) => {
    if (activeFilter === 'All') return true
    const category = item.category ?? ''
    return category.toLowerCase().startsWith(activeFilter.toLowerCase().slice(0, -1))
  })

  return (
    <main className="min-h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased">
      {/* Header */}
      <header className="border-b border-[#EAEAE2] bg-white">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-serif text-2xl font-bold flex items-center gap-0.5">
            <span className="text-[#4B7355]">Skills</span>
            <span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#4A5568] md:flex">
            <Link href="/opportunities" className="text-[#4B7355] font-semibold transition-colors">
              Opportunities
            </Link>
            <Link href="/how-it-works" className="hover:text-[#4B7355] transition-colors">
              How it works
            </Link>
            <Link href="/about" className="hover:text-[#4B7355] transition-colors">
              About
            </Link>
            <Link href="/features" className="hover:text-[#4B7355] transition-colors">
              Features
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl border border-[#4B7355] px-5 py-2 text-sm font-semibold text-[#4B7355] transition hover:bg-[#F4F7F4]"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-[#E29D38] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#D48F2A]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        
        {/* Badge Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EBEBE3] bg-white px-4 py-1.5 text-xs font-semibold text-[#E29D38] shadow-sm">
            <span className="size-2 rounded-full bg-[#E29D38]" />
            <span>AI-Powered Opportunity Discovery & Readiness</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mx-auto mt-6 max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight">
            Every Scholarship, Internship And Grant,{' '}
            <span className="text-[#E29D38]">Matched To You.</span>
          </h1>
          <p className="mt-4 text-sm text-[#666] leading-relaxed max-w-xl mx-auto">
            Filter by category, deadline or location — or just look at your match score and let Skillsbridge do the sorting.
          </p>
        </div>

        {/* Filter Badges & Sort Button */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#E29D38] text-white shadow-sm'
                    : 'border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]'
                }`}
              >
                {filter}
              </button>
            )
          })}

          <button className="inline-flex items-center gap-1.5 rounded-full border border-[#EBEBE3] bg-[#4B7355] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3D5E45]">
            <SlidersHorizontal className="size-3.5" />
            <span>Sort By</span>
          </button>
        </div>

        {/* Opportunities Grid */}
        {filteredItems.length === 0 ? (
          <div className="mx-auto mt-16 max-w-xl rounded-3xl border border-dashed border-[#C88A2B] bg-white p-12 text-center shadow-sm">
            <Search className="mx-auto size-8 text-[#E29D38]" />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1A1A1A]">
              No opportunities found
            </h2>
            <p className="mt-2 text-sm text-[#777]">
              No listings match the selected category &ldquo;{activeFilter}&rdquo;. Try choosing a different filter.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              let formattedDate = 'Open'
              if (item.deadline) {
                const [year, month, day] = item.deadline.split('-').map(Number)
                if (year && month && day) {
                  const dateObj = new Date(year, month - 1, day)
                  formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              }

              return (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#EBEBE3] bg-white p-7 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#EAF2EC] px-3.5 py-1 text-xs font-semibold text-[#4B7355]">
                        {item.category}
                      </span>
                      {item.verified && (
                        <span className="text-xs font-medium text-[#888]">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Title & Org */}
                    <h2 className="mt-6 font-serif text-2xl font-semibold text-[#1A1A1A]">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#777]">{item.organization}</p>

                    {/* Meta Details */}
                    <div className="mt-6 flex items-center gap-5 text-xs font-medium text-[#666]">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4 text-[#999]" />
                        {item.location || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-[#999]" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Save & View matching design specs) */}
                  <div className="mt-8 flex items-center justify-between border-t border-[#EAEAE2] pt-4">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-[#666] hover:text-[#1A1A1A] transition">
                      <Bookmark className="size-4 text-[#999]" />
                      <span>Save</span>
                    </button>

                    <Link
                      href={`/sign-in?returnTo=/opportunities/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#4B7355] hover:text-[#3D5E45] transition"
                    >
                      <span>View</span>
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Back To Home */}
        <div className="mt-12 flex justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E29D38] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back To Home</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EAEAE2] bg-white px-5 py-12 text-[#666] sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-0.5 text-lg font-bold">
              <span className="text-[#4B7355]">Skills</span>
              <span className="text-[#E29D38]">bridge</span>
            </div>
            <p className="mt-2 text-xs text-[#888] max-w-xs leading-relaxed">
              AI-Powered Opportunity Discovery And Readiness For Students.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-medium text-[#666]">
            <Link href="/how-it-works" className="hover:text-[#4B7355] transition">
              How It Works
            </Link>
            <Link href="/opportunities" className="hover:text-[#4B7355] transition">
              Explore Opportunities
            </Link>
            <Link href="/privacy" className="hover:text-[#4B7355] transition">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-[#4B7355] transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-[#EAEAE2] pt-4 text-[11px] text-[#999]">
          Built For The Digital Innovation Track.
        </div>
      </footer>
    </main>
  )
}