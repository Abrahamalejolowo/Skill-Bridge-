'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, X, HelpCircle, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Build Your Profile',
    text: 'Add Your Education, Skills, Interests, Location And Goals. It Takes 5 Min Max And You Only Do It Once — You Can Edit Any Time.',
  },
  {
    number: '02',
    title: 'Discover Opportunities',
    text: 'Browse Verified Scholarships, Internships, Hackathons, Grants, Fellowships And Competitions Saved Daily Into Verified Database — Filtered By Scope And Type.',
  },
  {
    number: '03',
    title: 'Get An AI Match Score',
    text: 'Every Opportunity Is Scored Against Your Profile Using A 0–100% Signal. Non-Random Matching And Visible Breakdown Of Qualified Match Matrix.',
  },
  {
    number: '04',
    title: 'Understand Why',
    text: 'See Exactly Which Requirements You Meet, What Is Missing, And A Plain-Language Explanation Of The Gap — Never A Bare Percentage Without Context.',
  },
  {
    number: '05',
    title: 'Apply With Confidence',
    text: 'When You Are Ready, Follow The Direct Link To The Official Application Page And Mark Off The Opportunity As Applied In Your Dashboard.',
  },
]

const faqs = [
  {
    q: 'Is Skills Bridge Free To Use?',
    a: 'Yes, Creating A Profile And Discovering Tracked Opportunities Is 100% Free For Students.',
  },
  {
    q: 'What Data Do You Collect?',
    a: 'Only Information Needed For Matching — Your Education, Field Of Study, Core Skills, Location, And Goals. We Do Not Sell Data To Third Parties And Never Store More Information Than Necessary.',
  },
  {
    q: 'How Accurate Is The Match Score?',
    a: 'Very Accurate. It Uses Direct Keyword And Vector Analysis Between Your Stated Profile And Opportunity Requirements. You Can Always See The Exact Criteria Behind Your Percentage.',
  },
  {
    q: 'What If An Opportunity Isn’t Verified Yet?',
    a: 'Every Listed Opportunity Is Audited Before Publication So You Always Know It Comes From A Legitimate Source.',
  },
]

export default function HowItWorksPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#FDFCF7] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-[#EBEBE3] bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355] flex items-center gap-0.5">
            Skills<span className="text-[#E29D38]">bridge</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#555] md:flex">
            <Link href="/opportunities" className="hover:text-[#1A1A1A] transition-colors">
              Opportunities
            </Link>
            <Link href="/how-it-works" className="font-semibold text-[#1A1A1A]">
              How It Works
            </Link>
            <Link href="/about" className="hover:text-[#1A1A1A] transition-colors">
              About
            </Link>
            <Link href="/features" className="hover:text-[#1A1A1A] transition-colors">
              Features
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-xl border border-[#EBEBE3] px-5 py-2.5 text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5EF]"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-[#E29D38] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#D48F2A]"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#1A1A1A] hover:bg-[#F5F5EF] md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-[#EBEBE3] bg-white px-5 py-6 md:hidden shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-4 text-sm font-medium text-[#555]">
              <Link
                href="/opportunities"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#1A1A1A]"
              >
                Opportunities
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="font-semibold text-[#1A1A1A]"
              >
                How It Works
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#1A1A1A]"
              >
                About
              </Link>
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#1A1A1A]"
              >
                Features
              </Link>
            </nav>

            <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-[#EBEBE3]">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl border border-[#EBEBE3] py-2.5 text-center text-xs font-semibold text-[#1A1A1A] transition hover:bg-[#F5F5EF]"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-xl bg-[#E29D38] py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#D48F2A]"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="px-5 pt-16 pb-12 sm:px-8 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8DDCB] bg-[#FAF5EC] px-4 py-1.5 text-xs font-semibold text-[#C88A2B] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C88A2B]" />
            AI-Powered Opportunity Discovery & Readiness
          </span>

          <h1 className="mt-6 font-serif text-3xl font-bold leading-tight sm:text-5xl md:text-6xl text-[#1A1A1A]">
            From <span className="text-[#C88A2B]">One Profile</span> To Your Next Application.
          </h1>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#666] max-w-xl mx-auto">
            Six steps, most of which Skills Bridge does for you. Know exactly what happens from the moment you sign up.
          </p>
        </div>
      </section>

      {/* Steps List Section */}
      <section className="mx-auto max-w-3xl px-5 sm:px-8 pb-20">
        <div className="divide-y divide-[#EBEBE3]">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 py-8 first:pt-0">
              <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FAF5EC] text-xs font-bold text-[#C88A2B]">
                {step.number}
              </span>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#666]">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Green Banner Feature Section */}
      <section className="bg-[#4B7355] px-5 sm:px-8 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Readiness Score
          </div>

          <h2 className="mt-6 font-serif text-2xl font-bold sm:text-4xl">
            Not Just A Match.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-lg">
            The Readiness Score Is What Turns Browsing Into Progress. It&apos;s Built From Three Things Working Together.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="font-serif text-base font-semibold">Verified Data First</h3>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                Every Opportunity Is Scraped, Structured, And Verified Daily Before Entering Our System.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="font-serif text-base font-semibold">AI For Explanation</h3>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                We Generate Clear Explanations That Outline Where You Fit Well And Where Gaps Need Closing.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="font-serif text-base font-semibold">A Guide, Not A Guarantee</h3>
              <p className="mt-3 text-xs leading-relaxed text-white/70">
                Readiness Scores Help Prioritize Where To Spend Time — Not A Final Guarantee Of Selection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="px-5 sm:px-8 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E8DDCB] bg-[#FAF5EC] px-4 py-1.5 text-xs font-semibold text-[#C88A2B] shadow-sm">
            <HelpCircle className="size-3.5 text-[#C88A2B]" />
            Common Questions
          </span>

          <h2 className="mt-6 font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
            Good To Know Before You Start
          </h2>

          <div className="mt-10 text-left space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-[#EBEBE3] pb-6 last:border-0">
                <h3 className="font-serif text-sm sm:text-base font-semibold text-[#1A1A1A]">
                  {faq.q}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#666]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Golden CTA Banner */}
      <section className="px-5 sm:px-8 pb-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between rounded-3xl bg-[#E29D38] p-8 text-white md:flex-row md:p-14 shadow-md">
          <div className="text-center md:text-left">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold">
              Ready To See Your First Readiness Score?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/90">
              It Takes Less Time To Build Your Profile Than It Does To Read One Scholarship Page.
            </p>
          </div>

          <Link
            href="/sign-up"
            className="mt-6 shrink-0 rounded-xl bg-[#3D5E45] px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-[#2F4A36] md:mt-0 shadow-sm"
          >
            Get Started For Free
          </Link>
        </div>

        <div className="mt-6 flex justify-end max-w-5xl mx-auto px-2">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-medium text-[#888] hover:text-[#1A1A1A]">
            Back To Home <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="border-t border-[#EBEBE3] bg-white px-5 sm:px-8 py-12 text-xs text-[#777]">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-8 md:flex-row md:items-start">
          <div>
            <Link href="/" className="font-serif text-xl font-bold text-[#4B7355] flex items-center gap-0.5">
              Skills<span className="text-[#E29D38]">bridge</span>
            </Link>
            <p className="mt-4 font-serif text-sm font-semibold text-[#1A1A1A]">Skills Bridge</p>
            <p className="mt-1 text-[#888] leading-relaxed">
              AI-Powered Opportunity Discovery<br />And Readiness For Students.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 font-medium">
            <Link href="/how-it-works" className="hover:text-[#1A1A1A] transition">How It Works</Link>
            <Link href="/opportunities" className="hover:text-[#1A1A1A] transition">Explore Opportunities</Link>
            <Link href="/privacy" className="hover:text-[#1A1A1A] transition">Privacy</Link>
            <Link href="/contact" className="hover:text-[#1A1A1A] transition">Contact</Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl border-t border-[#F5F5EF] pt-6 text-[11px] text-[#A0A090]">
          Built For The Digital Innovation Track.
        </div>
      </footer>
    </main>
  )
}