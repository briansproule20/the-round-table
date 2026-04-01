export interface Member {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  color: string
  created_at: string
}

export interface Question {
  id: string
  member_id: string
  question_text: string
  options: string[]
  correct_index: number
  order: number
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  player_id: string
  player_name: string
  member_id: string
  score: number
  answers: number[]
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  totalScore: number
  quizzesTaken: number
}

export interface Player {
  id: string
  name: string
}
