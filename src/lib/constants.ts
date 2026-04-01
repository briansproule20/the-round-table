export const MEMBERS_CONFIG = [
  { name: "Tanner", slug: "tanner", color: "#f59e0b" },
  { name: "Parker", slug: "parker", color: "#3b82f6" },
  { name: "Alex", slug: "alex", color: "#10b981" },
  { name: "Mick", slug: "mick", color: "#ef4444" },
  { name: "Mass", slug: "mass", color: "#8b5cf6" },
  { name: "Matt", slug: "matt", color: "#f97316" },
  { name: "Brian", slug: "brian", color: "#06b6d4" },
] as const

export const SCORE_MESSAGES = [
  { min: 5, max: 5, message: "PERFECT. You are a true knight of Camelot." },
  { min: 4, max: 4, message: "So close. Almost legendary." },
  { min: 3, max: 3, message: "Decent. You've been paying attention." },
  { min: 2, max: 2, message: "Mid. Do you even live here?" },
  { min: 1, max: 1, message: "Embarrassing. Are you sure you know this person?" },
  { min: 0, max: 0, message: "Zero. Absolute zero. Blood eagle incoming." },
] as const

export function getScoreMessage(score: number): string {
  return SCORE_MESSAGES.find((m) => score >= m.min && score <= m.max)?.message ?? ""
}
