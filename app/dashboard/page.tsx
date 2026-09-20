import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import MobileHeader from "@/components/MobileHeader";
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map,
  User,
  LogOut,
  Search,
  Bell,
  Clock,
  MapPin,
  Wifi,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/sign-in?returnTo=/dashboard");

    const profile = await getProfile();
    
    // If no profile, redirect to onboarding to create one
    if (!profile) {
      redirect("/onboarding");
    }
    
    // Skip completed_onboarding check - let users see dashboard even if not completed
    // They can complete onboarding from profile page

    // 1. Fetch all opportunities from the database safely
    const { data: rawOpportunities } = await supabase
      .from("opportunities")
      .select("id, title, organization, category, location, deadline, skills, verified")
      .order("deadline", { ascending: true });

    const allOpportunities = rawOpportunities ?? [];

    // 2. Fetch user's saved opportunities from the database safely
    const { data: rawSaved } = await supabase
      .from("saved_opportunities")
      .select("id, status, opportunity_id, opportunities (id, title, organization, category, deadline, location)")
      .eq("user_id", user.id);

    const savedRecords = rawSaved ?? [];

    const userSkillsSet = new Set(
      (profile.skills ?? []).map((s: string) => s.toLowerCase()),
    );

    // 3. Algorithmic Matching: Calculate dynamic scores based on skill overlap
    const scoredOpportunities = allOpportunities.map((item) => {
      const itemSkills = item.skills ?? [];
      const matchingSkillsCount = itemSkills.filter((s: string) =>
        userSkillsSet.has(s.toLowerCase()),
      ).length;

      const score = itemSkills.length > 0
        ? Math.min(98, Math.max(42, Math.round((matchingSkillsCount / itemSkills.length) * 65 + 35)))
        : 70;

      // Calculate days remaining until deadline
      const daysLeft = item.deadline
        ? Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...item,
        score,
        daysLeft,
      };
    });

    // Sort by match score descending
    scoredOpportunities.sort((a, b) => b.score - a.score);

    // 4. Compute real metrics
    const totalTracked = scoredOpportunities.length;
    const eligibleMatches = scoredOpportunities.filter((x) => x.score >= 60);
    const avgReadiness = scoredOpportunities.length
      ? Math.round(scoredOpportunities.reduce((acc, curr) => acc + curr.score, 0) / scoredOpportunities.length)
      : 0;

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const deadlinesThisWeekCount = scoredOpportunities.filter((x) => {
      if (!x.deadline) return false;
      const d = new Date(x.deadline);
      return d >= now && d <= nextWeek;
    }).length;

    // Upcoming deadlines list (next 4 items with valid future deadlines)
    const upcomingDeadlines = scoredOpportunities
      .filter((x) => x.deadline && new Date(x.deadline) >= now)
      .slice(0, 4);

    // 5. Compute dynamic skill gaps from top matches using plain object tracking
    const missingSkillsCount: Record<string, number> = {};
    scoredOpportunities.slice(0, 5).forEach((item) => {
      (item.skills ?? []).forEach((skill: string) => {
        if (!userSkillsSet.has(skill.toLowerCase())) {
          missingSkillsCount[skill] = (missingSkillsCount[skill] || 0) + 1;
        }
      });
    });

    const topMissingSkills = Object.entries(missingSkillsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([skill]) => skill);

    const firstName = profile?.first_name || user.email?.split("@")[0] || "there";
    const lastName = profile?.last_name || "";
    const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

    return (
      <div className="flex h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-hidden">
        {/* Desktop Left Sidebar (Fixed) */}
        <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#EAEAE2] bg-white px-6 py-8 z-30 shrink-0">
          <div>
            <Link href="/" className="font-serif text-2xl font-bold text-[#4B7355]">
              Skills<span className="text-[#E29D38]">bridge</span>
            </Link>

            <nav className="mt-12 space-y-2">
              <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active />
              <SidebarLink href="/explore" icon={Compass} label="Explore" />
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

        {/* Right Pane (Header + Scrollable Content) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile Header component */}
          <MobileHeader initials={initials} />

          {/* Top Desktop Bar */}
          <header className="hidden lg:flex items-center justify-between border-b border-[#EAEAE2] bg-white/80 px-10 py-4 backdrop-blur-md shrink-0 z-20">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <input
                type="text"
                placeholder="Search opportunities..."
                className="w-full rounded-full bg-[#F4F4EE] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/20"
              />
            </div>

            <div className="flex items-center gap-6">
              <Link href="/notifications" className="relative text-[#666] hover:text-[#1A1A1A] transition">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#D9534F]" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4B7355] text-sm font-semibold text-white">
                  {initials || "AC"}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold">
                    {firstName} {lastName}
                  </p>
                  <p className="text-xs text-[#888]">
                    {profile?.education_level || "Undergraduate"} • {profile?.field_of_study || "General"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Dashboard Content Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-8">
            {/* Welcome Banner */}
            <section>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
                Welcome Back, <span className="text-[#C88A2B]">{firstName}.</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#777]">
                You&apos;re Eligible For {eligibleMatches.length} Of {totalTracked} Tracked Opportunities—{deadlinesThisWeekCount} Deadlines Land This Week.
              </p>
            </section>

            {/* Metric Cards */}
            <section className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <StatCard value={String(scoredOpportunities.length)} label="Active Matches" />
              <StatCard value={`${avgReadiness}%`} label="Average Readiness" />
              <StatCard value={String(deadlinesThisWeekCount)} label="Deadlines This Week" />
              <StatCard value={String(savedRecords.length)} label="Saved Opportunities" />
            </section>

            {/* Two Column Grid Layout */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
              {/* Left Column: Recommended Section */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg sm:text-xl font-semibold">Recommended For You</h2>
                  <Link
                    href="/explore"
                    className="flex items-center gap-1 text-xs font-semibold text-[#4B7355] hover:underline"
                  >
                    See All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {scoredOpportunities.slice(0, 4).map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#EBEBE3] bg-white p-5 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-[#E5EFE7] px-3 py-1 text-xs font-medium text-[#4B7355]">
                            {item.category || "Opportunity"}
                          </span>
                          <span className="rounded-full bg-[#FBF0D9] px-3 py-1 text-xs font-semibold text-[#C88A2B]">
                            {item.score}% Match
                          </span>
                        </div>

                        <h3 className="mt-4 font-semibold text-[#1A1A1A]">{item.title}</h3>
                        <p className="mt-0.5 text-xs text-[#888]">{item.organization}</p>

                        <div className="mt-4 flex items-center gap-4 text-xs text-[#666]">
                          <span className="flex items-center gap-1">
                            {item.location?.toLowerCase().includes("remote") ? (
                              <Wifi className="h-3.5 w-3.5" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5" />
                            )}
                            {item.location || "Remote"}
                          </span>
                          <span className="flex items-center gap-1 text-[#D9534F]">
                            <Clock className="h-3.5 w-3.5" />
                            {item.daysLeft !== null ? `${item.daysLeft} Days Left` : "Flexible"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-[#F5F5EF] pt-4 text-xs font-medium">
                        <span className="text-[11px] text-[#888]">
                          {item.verified ? "✓ Verified" : ""}
                        </span>
                        <Link
                          href={`/explore/${item.id}`}
                          className="flex items-center gap-1 text-[#1A1A1A] hover:underline ml-auto"
                        >
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                  {scoredOpportunities.length === 0 && (
                    <p className="text-xs text-[#888] col-span-2 py-4">No opportunities found in the database yet.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Widgets */}
              <div className="lg:col-span-4 space-y-6">
                {/* Deadlines Coming Up */}
                <div className="rounded-2xl border border-[#EBEBE3] bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-base font-semibold">Deadlines Coming Up</h3>
                  <div className="mt-4 space-y-4">
                    {upcomingDeadlines.map((item) => {
                      const days = item.daysLeft ?? 0;
                      const color = days <= 3 
                        ? "bg-[#FADBD8] text-[#C0392B]" 
                        : days <= 10 
                        ? "bg-[#FCF3CF] text-[#B7950B]" 
                        : "bg-[#D4EFDF] text-[#1E8449]";

                      return (
                        <div key={item.id} className="flex items-center justify-between border-b border-[#F5F5EF] pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-xs font-semibold text-[#1A1A1A] truncate max-w-[180px]">{item.title}</p>
                            <p className="text-[11px] text-[#888]">{item.organization}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold shrink-0 ${color}`}>
                            {days} days
                          </span>
                        </div>
                      );
                    })}
                    {upcomingDeadlines.length === 0 && (
                      <p className="text-xs text-[#888]">No upcoming deadlines.</p>
                    )}
                  </div>
                </div>

                {/* Saved Opportunities */}
                <div className="rounded-2xl border border-[#EBEBE3] bg-white p-6 shadow-sm">
                  <h3 className="font-serif text-base font-semibold">Saved Opportunities</h3>
                  <div className="mt-4 divide-y divide-[#F5F5EF]">
                    {savedRecords.slice(0, 3).map((record: any) => {
                      const opp = record.opportunities;
                      if (!opp) return null;
                      return (
                        <div key={record.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <p className="text-xs font-medium text-[#1A1A1A] truncate max-w-[170px]">{opp.title}</p>
                          <span className="text-[10px] text-[#888] capitalize">{record.status || "saved"}</span>
                        </div>
                      );
                    })}
                    {savedRecords.length === 0 && (
                      <p className="text-xs text-[#888] py-2">No saved opportunities yet.</p>
                    )}
                  </div>
                  <Link
                    href="/saved"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#4B7355] hover:underline"
                  >
                    View All Saved <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Your Roadmap Widget */}
                <div className="rounded-2xl bg-[#4B7355] p-6 text-white shadow-sm">
                  <h3 className="font-serif text-lg font-semibold">Your Roadmap</h3>
                  <p className="mt-2 text-xs text-white/80 leading-relaxed">
                    {topMissingSkills.length > 0
                      ? `Top skill gaps affecting your matches include: ${topMissingSkills.join(" and ")}.`
                      : "You have great skill coverage across current active opportunities!"}
                  </p>
                  <Link
                    href="/roadmap"
                    className="mt-5 block w-full rounded-xl bg-[#E29D38] py-3 text-center text-xs font-semibold text-white transition hover:bg-[#D48F2A]"
                  >
                    View Roadmap
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error)
    redirect('/sign-in?error=dashboard_load_failed')
  }
}

/* Helper Components */

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-[#F4F7F4] text-[#4B7355]"
          : "text-[#666] hover:bg-[#F5F5EF] hover:text-[#1A1A1A]"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#EBEBE3] bg-white p-5 sm:p-6 shadow-sm">
      <p className="text-2xl sm:text-3xl font-bold text-[#C88A2B]">{value}</p>
      <p className="mt-2 text-xs font-medium text-[#777]">{label}</p>
    </div>
  );
}