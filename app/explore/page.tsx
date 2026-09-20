import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/actions/profile";
import ExploreClientContent from "@/components/ExploreClientContent";
import { calculateMatches } from "@/lib/matching";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search || "";
  const selectedCategory = resolvedParams.category || "All";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?returnTo=/explore");
  }

  const profile = await getProfile();
  const userSkills = profile?.skills ?? [];

  // Base query for opportunities
  let query = supabase.from("opportunities").select("*").order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,organization.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  if (selectedCategory && selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }

  const { data: rawOpportunities } = await query;
  const opportunitiesList = rawOpportunities ?? [];

  // Apply Algorithmic Matching for this user
  const scoredOpportunities = calculateMatches(opportunitiesList, userSkills);

  // Fetch unique categories for filter tabs
  const { data: allOpportunities } = await supabase.from("opportunities").select("category");
  const categories = ["All", ...Array.from(new Set(allOpportunities?.map((o) => o.category).filter(Boolean)))];

  const firstName = profile?.first_name || user.email?.split("@")[0] || "User";
  const lastName = profile?.last_name || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return (
    <ExploreClientContent
      opportunities={scoredOpportunities}
      categories={categories}
      searchQuery={searchQuery}
      selectedCategory={selectedCategory}
      initials={initials}
      firstName={firstName}
      lastName={lastName}
      profile={profile}
    />
  );
}