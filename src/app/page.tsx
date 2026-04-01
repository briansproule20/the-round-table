"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getPlayer, setPlayerName } from "@/lib/player"
import { supabase } from "@/lib/supabase"
import { NamePromptDialog } from "@/components/name-prompt-dialog"
import { MemberCard } from "@/components/member-card"
import { Button } from "@/components/ui/button"
import type { Member, Player } from "@/lib/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

export default function HomePage() {
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [needsName, setNeedsName] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState("")

  useEffect(() => {
    const p = getPlayer()
    if (p) {
      setPlayer(p)
      loadData(p)
    } else {
      setNeedsName(true)
    }
  }, [])

  async function loadData(p: Player) {
    const [membersResult, scoresResult] = await Promise.all([
      supabase.from("members").select("*").order("name"),
      supabase
        .from("scores")
        .select("member_id, score")
        .eq("player_id", p.id),
    ])

    if (membersResult.data) {
      setMembers(membersResult.data)
    }

    if (scoresResult.data) {
      const scoreMap: Record<string, number> = {}
      for (const s of scoresResult.data) {
        scoreMap[s.member_id] = s.score
      }
      setScores(scoreMap)
    }

    setLoaded(true)
  }

  function handleNameComplete() {
    const p = getPlayer()
    if (p) {
      setPlayer(p)
      setNeedsName(false)
      loadData(p)
    }
  }

  function handleSaveName() {
    const trimmed = newName.trim()
    if (trimmed.length >= 2) {
      setPlayerName(trimmed)
      setPlayer((prev) => (prev ? { ...prev, name: trimmed } : prev))
      setEditingName(false)
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <NamePromptDialog open={needsName} onComplete={handleNameComplete} />

      {player && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                className="rounded border border-input bg-transparent px-2 py-1 text-sm text-foreground"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName()
                  if (e.key === "Escape") setEditingName(false)
                }}
              />
              <Button size="sm" onClick={handleSaveName}>
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNewName(player.name)
                setEditingName(true)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {player.name}
            </button>
          )}
        </div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-4xl sm:text-5xl font-bold text-foreground text-center"
      >
        The Camelot Quiz
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-3 text-lg text-muted-foreground text-center"
      >
        How well do you really know each other?
      </motion.p>

      {loaded && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {members.map((member) => (
            <motion.div key={member.id} variants={itemVariants}>
              <MemberCard
                member={member}
                playerScore={scores[member.id] ?? null}
                onClick={() => router.push(`/quiz/${member.slug}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10"
        >
          <Button variant="outline" onClick={() => router.push("/leaderboard")}>
            View Leaderboard
          </Button>
        </motion.div>
      )}
    </main>
  )
}
