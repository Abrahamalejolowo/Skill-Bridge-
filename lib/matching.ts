// lib/matching.ts

export interface ScoredOpportunity {
  id: string;
  title: string;
  organization?: string;
  category?: string;
  location?: string;
  deadline?: string;
  skills?: string[];
  verified?: boolean;
  score: number;
  daysLeft: number | null;
}

export function calculateMatches(
  opportunities: any[],
  userSkills: string[]
): ScoredOpportunity[] {
  const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase()));

  const scored = opportunities.map((item) => {
    const itemSkills = item.skills ?? [];
    const matchingSkillsCount = itemSkills.filter((s: string) =>
      userSkillsSet.has(s.toLowerCase())
    ).length;

    // Algorithmic formula ensuring scores sit cleanly between 42% and 98%
    const score =
      itemSkills.length > 0
        ? Math.min(
            98,
            Math.max(
              42,
              Math.round(
                (matchingSkillsCount / itemSkills.length) * 65 + 35
              )
            )
          )
        : 70;

    const daysLeft = item.deadline
      ? Math.ceil(
          (new Date(item.deadline).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      ...item,
      score,
      daysLeft,
    };
  });

  // Sort highest match percentage to lowest
  return scored.sort((a, b) => b.score - a.score);
}