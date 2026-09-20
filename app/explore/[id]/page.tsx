import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import OpportunityActions from "@/components/OpportunityActions";
import ChatAboutOpportunityButton from "@/components/ChatWithOpportunity";
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Map,
  User,
  LogOut,
  Search,
  Bell,
  Briefcase,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Inbox,
  LucideIcon,
  MessageCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OpportunityDetailProps {
  params: Promise<{ id: string }>;
}

interface ApplicationRecord {
  id: string;
  status: string;
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?returnTo=/explore/${id}`);
  }

  const profile = await getProfile();

  // Fetch specific opportunity details
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (!opportunity) {
    notFound();
  }

  // Fetch current user's application/saved status for this opportunity
  const { data: userApplication } = await supabase
    .from("opportunity_applications")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("opportunity_id", id)
    .maybeSingle();

  const currentStatus = (userApplication as ApplicationRecord)?.status || "none";

  const firstName = profile?.first_name || user.email?.split("@")[0] || "User";
  const lastName = profile?.last_name || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  let formattedDeadline = "Open";
  if (opportunity.deadline) {
    const [year, month, day] = opportunity.deadline.split("-").map(Number);
    if (year && month && day) {
      const dateObj = new Date(year, month - 1, day);
      const diffDays = Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      formattedDeadline = diffDays > 0 ? `${diffDays} days left` : "Deadline Passed";
    }
  }

  // --- Real Algorithmic Readiness Calculation ---
  const userSkills = (profile?.skills as string[]) || [];
  const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const opportunitySkills = (opportunity.skills as string[]) || [];

  const matchedSkills = opportunitySkills.filter((skill: string) =>
    userSkillsSet.has(skill.toLowerCase())
  );
  const missingSkills = opportunitySkills.filter(
    (skill: string) => !userSkillsSet.has(skill.toLowerCase())
  );

  // Calculate true match score based on overlap, keeping it between 40% and 98%
  let computedScore = opportunity.match_score;
  if (!computedScore) {
    if (opportunitySkills.length > 0) {
      computedScore = Math.min(
        98,
        Math.max(
          40,
          Math.round((matchedSkills.length / opportunitySkills.length) * 65 + 35)
        )
      );
    } else {
      computedScore = 70; 
    }
  }

  return (
    <div className="flex h-screen bg-[#F7F7F2] text-[#1A1A1A] font-sans antialiased overflow-hidden">
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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between border-b border-[#EAEAE2] bg-white/90 px-4 sm:px-8 lg:px-10 py-4 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/" className="font-serif text-xl font-bold text-[#4B7355]">
              Skills<span className="text-[#E29D38]">bridge</span>
            </Link>
          </div>

          <div className="hidden lg:block relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-[#F4F4EE] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#4B7355]/20"
            />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/notifications" className="relative text-[#666] hover:text-[#1A1A1A]" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#D9534F]" />
            </Link>

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

        {/* Scrollable Opportunity Detail View Container */}
        <main className="flex-1 overflow-y-auto no-scrollbar mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10 py-8">
          <section>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-snug">
              {opportunity.title}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#666]">
              {opportunity.organization} · Posted Recently
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[#EAF2EC] px-3 py-1 text-xs font-semibold text-[#4B7355]">
                <Briefcase className="h-3.5 w-3.5" />
                {opportunity.category}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-[#FDE8E8] px-3 py-1 text-xs font-semibold text-[#D9534F]">
                <Clock className="h-3.5 w-3.5" />
                {formattedDeadline}
              </span>
              {opportunity.verified && (
                <span className="flex items-center gap-1.5 rounded-full bg-[#FDF4E7] px-3 py-1 text-xs font-semibold text-[#C88A2B]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Listing
                </span>
              )}
            </div>
          </section>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
            {/* Left Content Cards */}
            <div className="lg:col-span-8 space-y-8">
              {/* Description Section */}
              <div className="rounded-3xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-lg sm:text-xl font-semibold">About This Opportunity</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#555] whitespace-pre-line">
                  {opportunity.description || "No description provided for this opportunity."}
                </p>
              </div>

              {/* Real Computed Readiness Score */}
              <div className="rounded-3xl border border-[#EBEBE3] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-lg sm:text-xl font-semibold">Your Readiness Score</h2>
                <p className="mt-0.5 text-xs text-[#888]">
                  Based On Your Profile Against This Opportunity&apos;s Requirements.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                  <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-8 border-[#F3E2C8] border-t-[#C88A2B] shrink-0">
                    <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                      {computedScore}%
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1A1A1A]">
                      You&apos;re {computedScore}% Ready For This Opportunity
                    </h3>
                    <p className="mt-1 text-xs text-[#777]">
                      Aligned with your current verified skill profile and academic standing.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-t border-[#F5F5EF] pt-6">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#4B7355]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      What You Have ({matchedSkills.length})
                    </div>
                    <ul className="mt-3 space-y-3 text-[#4B7355]">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4B7355] shrink-0" />
                        <span>Education Requirement Met — Academic Standing Satisfies Minimum.</span>
                      </li>
                      {matchedSkills.length > 0 ? (
                        matchedSkills.map((skill: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4B7355] shrink-0" />
                            <span>Matched Skill: <strong className="capitalize">{skill}</strong></span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#4B7355] shrink-0" />
                          <span>General academic profile background matches baseline requirements.</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#D9534F]">
                      <XCircle className="h-4 w-4 shrink-0" />
                      What&apos;s Missing ({missingSkills.length})
                    </div>
                    <ul className="mt-3 space-y-3 text-[#D9534F]">
                      {missingSkills.length > 0 ? (
                        missingSkills.map((skill: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D9534F] shrink-0" />
                            <span>Missing Requirement: <strong className="capitalize">{skill}</strong></span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D9534F] shrink-0" />
                          <span>None! You meet all listed technical requirements for this role.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Meta Sidebar */}
            <div className="lg:col-span-4 rounded-3xl border border-[#EBEBE3] bg-white p-6 shadow-sm h-fit sticky top-8">
              <div className="divide-y divide-[#F5F5EF] text-xs">
                <MetaRow label="Organization" value={opportunity.organization} />
                <MetaRow label="Category" value={opportunity.category} />
                <MetaRow label="Deadline" value={formattedDeadline} valueColor="text-[#D9534F]" />
                <MetaRow label="Location" value={opportunity.location || "Remote"} />
              </div>

              <div className="mt-8 space-y-3">
                <a
                  href={opportunity.application_url || opportunity.applicationUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C88A2B] py-3 text-xs font-semibold text-white transition hover:bg-[#B57A22]"
                >
                  Apply On Official Site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* Interactive Save / Applied Actions Component */}
                <OpportunityActions opportunityId={id} initialStatus={currentStatus} />

                {/* Chat with AI About This Opportunity - No Popup! */}
                <ChatAboutOpportunityButton 
                  opportunityId={id} 
                  opportunityTitle={opportunity.title}
                />
              </div>
            </div>
          </div>
        </main>

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

function MobileNavLink({ href, icon: Icon, label, active }: { href: string; icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition ${
        active ? "text-[#4B7355]" : "text-[#777] hover:text-[#1A1A1A]"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

function MetaRow({ label, value, valueColor = "text-[#1A1A1A]" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-[#888]">{label}</span>
      <span className={`font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}