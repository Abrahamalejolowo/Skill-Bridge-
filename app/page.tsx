"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Menu,
  Search,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import { HeroHeading } from "@/components/AnimatedHeading";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1E293B] font-sans antialiased">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-[#FFFDF7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 text-xl font-bold">
            <span className="text-[#3B6E52]">Skills</span>
            <span className="text-[#E59832]">Bridge</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#475569] md:flex">
            <Link href="/opportunities" className="hover:text-[#3B6E52] transition-colors">
              Opportunities
            </Link>
            <Link href="/how-it-works" className="hover:text-[#3B6E52] transition-colors">
              How It Works
            </Link>
            <Link href="/about" className="hover:text-[#3B6E52] transition-colors">
              About
            </Link>
            <Link href="/features" className="hover:text-[#3B6E52] transition-colors">
              Features
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/sign-in"
              className="rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#1E293B] shadow-sm hover:bg-[#F8FAFC] transition"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-[#E59832] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#D48721] transition"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-[#475569]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E2E8F0] bg-[#FFFDF7] px-6 py-4 md:hidden flex flex-col gap-3">
            <Link href="/opportunities" className="py-1 font-medium text-[#475569]">
              Opportunities
            </Link>
            <Link href="/how-it-works" className="py-1 font-medium text-[#475569]">
              How It Works
            </Link>
            <Link href="/about" className="py-1 font-medium text-[#475569]">
              About
            </Link>
            <Link href="/features" className="py-1 font-medium text-[#475569]">
              Features
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/sign-in"
                className="w-full text-center rounded-lg border border-[#CBD5E1] bg-white py-2 text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="w-full text-center rounded-lg bg-[#E59832] py-2 text-sm font-medium text-white"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="px-6 py-16 text-center lg:py-24">
        <div className="mx-auto max-w-4xl flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D7A5] bg-[#FEF6E6] px-3.5 py-1.5 text-xs font-semibold text-[#B37019]">
            <Sparkles className="size-3.5 fill-[#E59832] text-[#E59832]" />
            <span>AI-powered opportunity discovery & readiness</span>
          </div>

          {/* Animated Dynamic Heading Import */}
          <div className="mt-8">
            <HeroHeading />
          </div>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-base">
            Discover scholarships, internships, grants, fellowships, competitions and learning opportunities matched to your skills, goals and eligibility.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row w-full">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto rounded-lg bg-[#3B6E52] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#2F5942] transition"
            >
              Create Your Free Profile
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto rounded-lg border border-[#CBD5E1] bg-white px-6 py-3 text-sm font-semibold text-[#1E293B] hover:bg-[#F8FAFC] transition"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* 3. The Problem Section */}
      <section id="about" className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#F2D7A5] bg-[#FEF6E6] px-3 py-1 text-xs font-medium text-[#B37019]">
              The Problem
            </span>

            <h2 className="mt-4 font-serif text-2xl font-bold text-[#1E293B] sm:text-4xl">
              The <span className="text-[#3B6E52]">Right Opportunity</span> Is Out There. Finding It Shouldn&apos;t Be This Difficult.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-xs text-[#64748B] sm:text-sm leading-relaxed">
              Students miss valuable opportunities because information is scattered, requirements are confusing, deadlines are easy to miss, and it is difficult to know whether they are truly ready to apply.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <span className="inline-block rounded-md bg-[#FEF6E6] px-2.5 py-1 text-xs font-bold font-mono text-[#B37019]">
                01
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Scattered Opportunities
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Scholarships, Internships, Grants And Competitions Are Spread Across Countless Websites And Social Platforms.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <span className="inline-block rounded-md bg-[#FEF6E6] px-2.5 py-1 text-xs font-bold font-mono text-[#B37019]">
                02
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Unclear Requirements
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Finding An Opportunity Is One Thing. Knowing Whether You Actually Qualify Is Another.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <span className="inline-block rounded-md bg-[#FEF6E6] px-2.5 py-1 text-xs font-bold font-mono text-[#B37019]">
                03
              </span>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Missed Chances
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Without Clear Deadlines And Guidance, Valuable Opportunities Can Easily Pass You By.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Solution Banner Section */}
      <section className="bg-[#3B6E52] px-6 py-16 text-white lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            Our Solution
          </span>

          <h2 className="mt-4 font-serif text-2xl font-bold sm:text-4xl">
            Meet Skills Bridge — Your Smarter Way To Discover Opportunities.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-xs text-white/80 sm:text-sm leading-relaxed">
            Bring relevant opportunities into one place and use your profile to understand what fits, why you match, and what you need to improve.
          </p>
        </div>
      </section>

      {/* 5. Match Score / Opportunity Preview Section */}
      <section className="px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <span className="inline-block rounded-full border border-[#F2D7A5] bg-[#FEF6E6] px-3 py-1 text-xs font-medium text-[#B37019]">
              Match Score
            </span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-[#1E293B] sm:text-3xl leading-snug">
              Find The Opportunity You&apos;re Actually Ready For.
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-[#64748B] sm:text-sm">
              Skills Bridge analyzes full requirement sets against your profile so you know where you stand before spending hours on an application.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-md sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    MATCH ANALYSIS
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#1E293B]">
                    Cybersecurity Internship — TechCorp
                  </h3>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative flex size-14 items-center justify-center rounded-full border-4 border-[#E59832] bg-white font-mono text-base font-bold text-[#E59832]">
                    88%
                  </div>
                  <span className="mt-1 text-[10px] font-medium text-[#64748B]">
                    Match Score
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-[#1E293B]">
                  <Check className="size-4 text-[#3B6E52] shrink-0" />
                  <span>Education Requirement Met</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1E293B]">
                  <Check className="size-4 text-[#3B6E52] shrink-0" />
                  <span>Relevant Skill: Networking Basics</span>
                </div>
                <div className="border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B] space-y-2">
                  <p className="font-semibold text-[#1E293B]">Gaps to improve:</p>
                  <p className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#E59832]" />
                    2+ Years Experience (Optional)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#E59832]" />
                    AWS Certification (Preferred)
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-[#FEF6E6] p-3 text-[11px] text-[#B37019]">
                <strong>AI Recommendation:</strong> You meet all core requirements! You stand a high chance of moving forward.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works - 2x2 Steps Grid */}
      <section id="how-it-works" className="px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="inline-block rounded-full border border-[#F2D7A5] bg-[#FEF6E6] px-3 py-1 text-xs font-medium text-[#B37019]">
              How It Works
            </span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-[#1E293B] sm:text-4xl">
              From Discovery To One Profile. Real Matches. A Clear Next Step. Application, All In One Journey.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xs text-[#64748B] sm:text-sm">
              Skills Bridge simplifies your journey from discovery to application.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF6E6] text-[#E59832]">
                <User className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Build your profile
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Add your education, skills, interests, location and goals. You only do it once.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF6E6] text-[#E59832]">
                <Search className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Discover opportunities
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Browse verified scholarships, internships, grants, and fellowships.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF6E6] text-[#E59832]">
                <Target className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Get an AI match score
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                See transparent fit signals based on your profile requirements.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#FEFBF4] p-6 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#FEF6E6] text-[#E59832]">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="mt-4 font-serif text-base font-bold text-[#1E293B]">
                Apply with confidence
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Go to the official application page and track your progress.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-lg bg-[#3B6E52] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#2F5942] transition"
            >
              Continue <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Readiness Score Feature Highlights */}
      <section className="bg-[#FAF8EE] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E293B] sm:text-3xl leading-snug">
                The Readiness Score: The Difference Between Browsing And Applying.
              </h2>
              <p className="mt-4 text-xs leading-relaxed text-[#64748B] sm:text-sm">
                Understand why you match an opportunity, know your missing qualifications, and see actionable steps to build your skills.
              </p>
              <div className="mt-6 border-l-2 border-[#E59832] pl-4 italic text-xs text-[#64748B]">
                &ldquo;The Top Match Recommended By Skills Bridge Saved Me Hours Of Research.&rdquo;
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#1E293B]">
                  Matched And Missing Requirements, Side By Side
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  No guessing whether you qualify. Clear visibility into every criteria.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-sm font-bold text-[#1E293B]">
                  A Plain-Language Explanation
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  Understand complex requirements in simple, actionable terms.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-sm font-bold text-[#1E293B]">
                  A Next Step, Not Just A Verdict
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  Get guided recommendations on how to close skill gaps before applying.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action Banner */}
      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-2xl bg-[#E59832] p-8 text-white md:flex-row md:p-10 shadow-lg">
          <div>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Your Next Opportunity Starts Here.
            </h2>
            <p className="mt-2 text-xs text-white/90 sm:text-sm">
              Create A Free Profile And See Your First Readiness Scores In Minutes.
            </p>
          </div>

          <Link
            href="/sign-up"
            className="whitespace-nowrap rounded-lg bg-[#3B6E52] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#2F5942] transition"
          >
            Get Started For Free
          </Link>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-[#E2E8F0] px-6 py-12 text-[#64748B]">
        <div className="mx-auto max-w-5xl flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-0.5 text-lg font-bold">
              <span className="text-[#3B6E52]">Skills</span>
              <span className="text-[#E59832]">Bridge</span>
            </div>
            <p className="mt-2 text-xs text-[#94A3B8] max-w-xs">
              AI-powered opportunity discovery and readiness for students.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-medium text-[#64748B]">
            <Link href="/how-it-works" className="hover:text-[#3B6E52]">
              How it works
            </Link>
            <Link href="/opportunities" className="hover:text-[#3B6E52]">
              Explore opportunities
            </Link>
            <Link href="/about" className="hover:text-[#3B6E52]">
              About
            </Link>
            <Link href="/features" className="hover:text-[#3B6E52]">
              Features
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl border-t border-[#E2E8F0] pt-4 text-[11px] text-[#94A3B8]">
          Built for students ready to move forward.
        </div>
      </footer>
    </div>
  );
}