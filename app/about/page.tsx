import Link from 'next/link'
import { ArrowLeft, HelpCircle } from 'lucide-react'

const values = [
  {
    title: 'Transparency',
    text: 'Verified Data And AI-Generated Content Are Always Clearly Distinguished, So You Know What To Trust.',
  },
  {
    title: 'Privacy By Default',
    text: 'We Collect Only What\'s Needed To Match You To Opportunities, And Never Ask For Application Credentials.',
  },
  {
    title: 'Action Over Information',
    text: 'A Score Alone Doesn\'t Help You Improve — Every Gap Comes With A Concrete Next Step.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased">
      {/* 1. Header / Navbar matching site design */}
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
            <Link href="/about" className="text-[#4B7355] font-semibold transition-colors">
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
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
        
        {/* Top Badge Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EBEBE3] bg-white px-4 py-1.5 text-xs font-semibold text-[#E29D38] shadow-sm">
            <span className="size-2 rounded-full bg-[#E29D38]" />
            <span>AI-Powered Opportunity Discovery & Readiness</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mx-auto mt-6 max-w-3xl text-center">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight">
            Built So No Student Misses <br />
            An <span className="text-[#E29D38]">Opportunity</span> They Were Ready For.
          </h1>
          <p className="mt-4 text-sm text-[#666] leading-relaxed max-w-xl mx-auto">
            Skillsbridge started as a simple observation: talented students weren&apos;t losing out because they weren&apos;t good enough — they were losing out because information was scattered and eligibility was hard to read.
          </p>
        </div>

        {/* Two Column Section: Why we built this & What makes it different */}
        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <div className="rounded-3xl border border-[#EBEBE3] bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Why we built this</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#666]">
              Scholarships, internships, hackathons and grants live across university pages, social media and mailing lists. Requirements are often buried in fine print, deadlines slip by unnoticed, and students rarely have a way to tell whether they&apos;re actually competitive before they apply.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#666]">
              We wanted a single place that didn&apos;t just list opportunities, but told students, in plain language, where they stood — and what to do next.
            </p>
          </div>

          <div className="rounded-3xl border border-[#EBEBE3] bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">What makes it different</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#666]">
              Most platforms stop at &quot;here&apos;s a list of opportunities that might fit.&quot; Skillsbridge goes further with a Readiness Score: a transparent breakdown of what you already qualify for, what&apos;s missing, and a concrete next step to close the gap.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#666]">
              We built it as a hybrid of verified, structured data and AI — so the eligibility facts you see are trustworthy, and the explanations are easy to understand.
            </p>
          </div>
        </div>

        {/* Section Header: What We Value */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EBEBE3] bg-white px-4 py-1.5 text-xs font-semibold text-[#E29D38] shadow-sm">
            <HelpCircle className="size-3.5 text-[#E29D38]" />
            <span>What We Value</span>
          </div>
          <h2 className="mt-6 font-serif text-3xl font-bold sm:text-4xl text-[#1A1A1A]">
            The Principles Behind The Product
          </h2>
        </div>

        {/* Values Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((item) => (
            <article
              key={item.title}
              className="flex flex-col rounded-3xl border border-[#EBEBE3] bg-white p-8 shadow-sm"
            >
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#666]">{item.text}</p>
            </article>
          ))}
        </div>

        {/* Call to Action Banner */}
        <div className="mt-20 rounded-3xl bg-[#E29D38] p-10 sm:p-12 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Curious How Ready You Are?
            </h2>
            <p className="mt-2 text-sm text-white/90 max-w-md">
              Build Your Profile And Get Your First Readiness Score In Minutes.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="rounded-xl bg-[#4B7355] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3D5E45] whitespace-nowrap"
          >
            Create Your Profile
          </Link>
        </div>

        {/* Back To Home */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E29D38] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back To Home</span>
          </Link>
        </div>
      </section>

      {/* Footer matching standard layout */}
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
              Explore Oppurtunities
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