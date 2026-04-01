"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { getPlayer } from "@/lib/player"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { Button } from "@/components/ui/button"
import type { LeaderboardEntry, Score } from "@/lib/types"

export default function LeaderboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const player = getPlayer()
    if (player) {
      setCurrentPlayerId(player.id)
    }

    async function loadScores() {
      const { data } = await supabase.from("scores").select("*")

      if (data) {
        const grouped: Record<
          string,
          { name: string; totalScore: number; quizzesTaken: number }
        > = {}

        for (const score of data as Score[]) {
          if (!grouped[score.player_id]) {
            grouped[score.player_id] = {
              name: score.player_name,
              totalScore: 0,
              quizzesTaken: 0,
            }
          }
          grouped[score.player_id].totalScore += score.score
          grouped[score.player_id].quizzesTaken += 1
        }

        const leaderboard: LeaderboardEntry[] = Object.entries(grouped)
          .map(([id, data]) => ({
            id,
            name: data.name,
            totalScore: data.totalScore,
            quizzesTaken: data.quizzesTaken,
          }))
          .sort((a, b) => {
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
            return b.quizzesTaken - a.quizzesTaken
          })

        setEntries(leaderboard)
      }

      setLoading(false)
    }

    loadScores()
  }, [])

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-foreground"
      >
        Leaderboard
      </motion.h1>

      <div className="mt-8 w-full max-w-2xl">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <LeaderboardTable
            entries={entries}
            currentPlayerId={currentPlayerId}
          />
        )}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </main>
  )
}
