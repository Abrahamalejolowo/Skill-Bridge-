"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map,
  User,
  LogOut,
  Bell,
  Briefcase,
  Clock,
  ShieldCheck,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  LucideIcon,
  MessageCircle
} from "lucide-react";

export default function ExploreClientContent({
  opportunities,
  categories,
  searchQuery,
  selectedCategory,
  initials,
  firstName,
  lastName,
  profile,
}: {
  opportunities: any[] | null;
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
  initials: string;
  firstName: string;
  lastName: string;
  profile: any;
}) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-hidden relative">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-30 shrink-0">
        <div>
          <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355]">
            Skills<span className="text-[#E29D38]">bridge</span>
          </Link>

          <nav className="mt-12 space-y-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink href="/explore" icon={Compass} label="Explore" active />
            <SidebarLink href="/saved" icon={Bookmark} label="Saved" />
            <SidebarLink href="/roadmap" icon={Map} label="Roadmap" />
            <SidebarLink href="/chat" icon={MessageCircle} label="AI Advisor" />
            <SidebarLink href="/profile" icon={User} label="Profile" />
          </nav>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#666] transition hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </form>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between border-b border-[#EAEAE2] bg-white/90 px-4 sm:px-8 lg:px-10 py-4 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Trigger for Left-Side Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#666] hover:bg-[#EAEAE2] transition cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="font-serif text-xl font-bold text-[#4B7355]">
              Skills<span className="text-[#E29D38]">bridge</span>
            </Link>
          </div>

          <form method="GET" action="/explore" className="hidden lg:block relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search title, organization, skills..."
              className="w-full rounded-full bg-[#F4F4EE] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/20"
            />
            {selectedCategory !== "All" && <input type="hidden" name="category" value={selectedCategory} />}
          </form>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative text-[#666] hover:text-[#1A1A1A] transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#D9534F]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#4B7355] text-xs sm:text-sm font-semibold text-white shrink-0">
                {initials || "AC"}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-sm font-semibold">
                  {firstName} {lastName}
                </p>
                <p className="text-xs text-[#888]">
                  {profile?.education_level || "Undergraduate"} • {profile?.field_of_study || "CS"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Explore Content Feed */}
        <main className="flex-1 overflow-y-auto mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 py-8">
          <section className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-snug">
              Explore Opportunities
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#666]">
              Discover curated internships, roles, and programs tailored to your skills and goals.
            </p>
          </section>

          <form method="GET" action="/explore" className="block lg:hidden relative w-full mb-6">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search opportunities..."
              className="w-full rounded-2xl bg-white border border-[#EBEBE3] py-3 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/20 shadow-sm"
            />
            {selectedCategory !== "All" && <input type="hidden" name="category" value={selectedCategory} />}
          </form>

          {/* Category / Role Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#888] pr-2 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter Role:
            </div>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              const queryParams = new URLSearchParams();
              if (searchQuery) queryParams.set("search", searchQuery);
              if (cat && cat !== "All") queryParams.set("category", cat);
              const href = `/explore${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

              return (
                <Link
                  key={cat}
                  href={href}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition shrink-0 ${
                    isActive
                      ? "bg-[#4B7355] text-white shadow-sm"
                      : "bg-white border border-[#EBEBE3] text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Opportunities Grid */}
          {!opportunities || opportunities.length === 0 ? (
            <div className="rounded-3xl border border-[#EBEBE3] bg-white p-12 text-center shadow-sm">
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">No opportunities found</h3>
              <p className="mt-1 text-xs text-[#666]">
                Try adjusting your search query or role filters to find matching listings.
              </p>
              <Link
                href="/explore"
                className="mt-4 inline-block rounded-xl bg-[#4B7355] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
              {opportunities.map((opp) => {
                let formattedDeadline = "Open";
                if (opp.deadline) {
                  const [year, month, day] = opp.deadline.split("-").map(Number);
                  if (year && month && day) {
                    const dateObj = new Date(year, month - 1, day);
                    const diffDays = Math.ceil(
                      (dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    formattedDeadline = diffDays > 0 ? `${diffDays} days left` : "Deadline Passed";
                  }
                }

                return (
                  <div
                    key={opp.id}
                    className="flex flex-col justify-between rounded-3xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-[#EAF2EC] px-3 py-1 text-xs font-semibold text-[#4B7355]">
                          <Briefcase className="h-3.5 w-3.5" />
                          {opp.category || "General"}
                        </span>
                        {opp.verified && (
                          <span className="flex items-center gap-1.5 rounded-full bg-[#FDF4E7] px-3 py-1 text-xs font-semibold text-[#C88A2B]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
                        <Link href={`/explore/${opp.id}`} className="hover:text-[#4B7355] transition">
                          {opp.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-[#666]">
                        {opp.organization} · {opp.location || "Remote"}
                      </p>

                      <p className="mt-3 text-xs leading-relaxed text-[#555] line-clamp-2">
                        {opp.description || "No description provided for this listing."}
                      </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[#F5F5EF] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[#D9534F]">
                        <Clock className="h-3.5 w-3.5" />
                        {formattedDeadline}
                      </span>

                      <Link
                        href={`/explore/${opp.id}`}
                        className="flex items-center gap-1.5 rounded-xl bg-[#4B7355] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D5E45]"
                      >
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Left-Side Slide-Over Navigation Menu Drawer matching your exact design */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
              <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col justify-between border-r border-[#EAEAE2] p-6 overflow-y-auto">
                <div>
                  {/* Top Profile Header inside Drawer */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#EAEAE2]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4B7355] text-sm font-semibold text-white shrink-0">
                        {initials || "AC"}
                      </div>
                      <div className="leading-tight">
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          {firstName} {lastName}
                        </p>
                        <p className="text-xs text-[#888]">
                          {profile?.education_level || "Undergraduate"} • {profile?.field_of_study || "CS"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 rounded-full text-[#666] hover:bg-[#EAEAE2] transition cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sidebar Navigation Items */}
                  <nav className="mt-6 space-y-2">
                    <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarLink href="/explore" icon={Compass} label="Explore" active />
                    <SidebarLink href="/saved" icon={Bookmark} label="Saved" />
                    <SidebarLink href="/roadmap" icon={Map} label="Roadmap" />
                    <SidebarLink href="/chat" icon={MessageCircle} label="AI Advisor" />
                    <SidebarLink href="/profile" icon={User} label="Profile" />
                  </nav>
                </div>

                {/* Log Out Button at the bottom */}
                <div className="pt-6 border-t border-[#EAEAE2]">
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-[#666] transition hover:bg-[#F5F5EF] hover:text-[#1A1A1A] cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      Log Out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Slide-Over Drawer */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
              onClick={() => setIsNotificationsOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAEAE2]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAEAE2] bg-[#F7F7F2]/50">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#4B7355]" />
                    <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">Notifications</h2>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-full text-[#666] hover:bg-[#EAEAE2] transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <NotificationItem
                    title="Application Update"
                    description="Your application status for Frontend Engineer has changed to Under Review."
                    time="2 hours ago"
                    type="success"
                  />
                  <NotificationItem
                    title="New Opportunity Match"
                    description="A new verified listing matches your skill profile with a 92% readiness score."
                    time="Yesterday"
                    type="info"
                  />
                </div>

                <div className="p-4 border-t border-[#EAEAE2] bg-[#F7F7F2]/30 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs font-semibold text-[#4B7355] hover:underline"
                  >
                    View all notifications in full page &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({ title, description, time, type }: { title: string; description: string; time: string; type: 'success' | 'info' | 'alert' }) {
  return (
    <div className="p-4 rounded-2xl border border-[#EBEBE3] bg-[#F9F9F5] flex gap-3 items-start transition hover:border-[#4B7355]/30">
      {type === 'success' && <CheckCircle className="h-5 w-5 text-[#4B7355] shrink-0 mt-0.5" />}
      {type === 'info' && <Bell className="h-5 w-5 text-[#C88A2B] shrink-0 mt-0.5" />}
      {type === 'alert' && <AlertCircle className="h-5 w-5 text-[#D9534F] shrink-0 mt-0.5" />}
      
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-[#1A1A1A]">{title}</h4>
        <p className="mt-1 text-xs text-[#666] leading-relaxed">{description}</p>
        <span className="mt-2 block text-[10px] text-[#999]">{time}</span>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string; icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active ? "bg-[#F4F7F4] text-[#4B7355]" : "text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}