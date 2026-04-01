// Heraldic colors for each knight of Camelot
export const MEMBERS_CONFIG = [
  { name: "Tanner", slug: "tanner", color: "#c9a84c" },  // Gold
  { name: "Parker", slug: "parker", color: "#4a6fa5" },  // Royal blue
  { name: "Alex", slug: "alex", color: "#4a8c5c" },      // Forest green
  { name: "Mick", slug: "mick", color: "#8b2942" },      // Crimson
  { name: "Mass", slug: "mass", color: "#6b4c8a" },      // Royal purple
  { name: "Matt", slug: "matt", color: "#b87333" },       // Bronze
  { name: "Brian", slug: "brian", color: "#4a8c8c" },     // Teal
] as const

export const SCORE_MESSAGES = [
  { min: 5, max: 5, message: "Flawless. The scribes shall record your triumph in the Annals of Camelot." },
  { min: 4, max: 4, message: "A worthy showing, knight. One question short of legend." },
  { min: 3, max: 3, message: "Middling. You are present, but are you paying attention?" },
  { min: 2, max: 2, message: "Troubling. The court questions your loyalty." },
  { min: 1, max: 1, message: "Disgraceful. Do you even dwell in these halls?" },
  { min: 0, max: 0, message: "The blood eagle awaits." },
] as const

export function getScoreMessage(score: number): string {
  return SCORE_MESSAGES.find((m) => score >= m.min && score <= m.max)?.message ?? ""
}
