'use server'

import { createClient } from '@/lib/supabase/server'

export async function generateAIReadiness(opportunityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch user profile and skills
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch the specific opportunity details
  const { data: opp } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single()

  if (!opp) throw new Error('Opportunity not found')

  // Prompt construction for your AI provider (e.g., Google Gen AI SDK)
  const prompt = `
    Analyze the following user profile against the job/opportunity description.
    Provide a JSON response with:
    1. score (number between 0 and 100)
    2. summary (short string explanation)
    3. whatYouHave (array of strings detailing met requirements)
    4. whatsMissing (array of strings detailing missing requirements)

    User Profile:
    - Education: ${profile?.education_level} in ${profile?.field_of_study}
    - Skills: ${JSON.stringify(profile?.skills)}

    Opportunity:
    - Title: ${opp.title}
    - Description: ${opp.description}
    - Required Skills: ${JSON.stringify(opp.skills)}
  `

  // Call your AI API client here (e.g., Google Gemini API)
  // const response = await callAIModel(prompt);
  // const analysis = JSON.parse(response);

  // Return the parsed AI evaluation back to your client component
  return {
    score: 74, // Example result from AI analysis
    summary: "Strong alignment with core technical stack, with minor gaps in advanced deployment tooling.",
    whatYouHave: [
      "Education Requirement Met — Academic Standing Satisfies Minimum.",
      "Core stack matching profile data (React, TypeScript)."
    ],
    whatsMissing: [
      "Missing hands-on production experience with advanced CI/CD pipelines.",
      "Cloud containerization tools (Docker/Kubernetes) not explicitly listed."
    ]
  }
}