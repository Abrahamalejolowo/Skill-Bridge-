import Link from 'next/link'
import { Bell, Bookmark, CheckCircle2, ClipboardList, Search, Sparkles, Map, ShieldCheck, ArrowLeft } from 'lucide-react'

const features = [
  ['Verified opportunity directory', 'A single place for scholarships, internships, hackathons, grants and fellowships with source links and deadlines.', Search],
  ['Transparent match scoring', 'Understand why something fits instead of receiving a black-box percentage.', Sparkles],
  ['Readiness breakdowns', 'See requirements you meet, gaps to close, and recommended actions.', CheckCircle2],
  ['Saved application pipeline', 'Move opportunities from saved to in progress to applied.', Bookmark],
  ['Deadline reminders', 'Stay ahead of upcoming deadlines and prioritize your week.', Bell],
  ['Personal roadmap', 'Turn recurring skill gaps into an actionable learning plan.', Map],
  ['Profile editing', 'Keep your education, goals, interests and skills current from one place.', ClipboardList],
  ['Verification workflow', 'Report inaccurate opportunities and help keep the directory trustworthy.', ShieldCheck],
]

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased">
      {/* Header / Navbar */}
      <header className="border-b border-[#EAEAE2] bg-white">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-serif text-2xl font-bold flex items-center gap-0.5">
            <span className="text-[#4B7355]">Skills</span>
            <span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#4A5568] md:flex">
            <Link href="/opportunities" className="hover:text-[#4B7355] transition-colors">
              Opportunities
            </Link>
            <Link href="/how-it-works" className="hover:text-[#4B7355] transition-colors">
              How it works
            </Link>
            <Link href="/about" className="hover:text-[#4B7355] transition-colors">
              About
            </Link>
            <Link href="/features" className="text-[#4B7355] font-semibold transition-colors">
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
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        
        {/* Top Badge Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EBEBE3] bg-white px-4 py-1.5 text-xs font-semibold text-[#E29D38] shadow-sm">
            <span className="size-2 rounded-full bg-[#E29D38]" />
            <span>AI-Powered Opportunity Discovery & Readiness</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mx-auto mt-6 text-center max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#E29D38]">
            Everything in one place
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight">
            A clearer path from discovery to application.
          </h1>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text, Icon]) => {
            const IconComponent = Icon as React.ComponentType<{ className?: string }>
            return (
              <article
                key={title as string}
                className="flex flex-col justify-between rounded-3xl border border-[#EBEBE3] bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="inline-flex items-center justify-center rounded-2xl bg-[#EAF2EC] p-3 text-[#4B7355]">
                    <IconComponent className="size-6" />
                  </div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold text-[#1A1A1A]">
                    {title as string}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#666]">
                    {text as string}
                  </p>
                </div>
              </article>
            )
          })}
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