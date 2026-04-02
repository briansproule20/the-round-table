"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
      staggerChildren: 0.08,
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
    <main className="flex flex-1 flex-col items-center px-4 py-16">
      <NamePromptDialog open={needsName} onComplete={handleNameComplete} />

      {/* Player name - top right */}
      {player && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                className="rounded border border-gold/25 bg-background/80 px-2.5 py-1 text-sm text-foreground font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-gold/40"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName()
                  if (e.key === "Escape") setEditingName(false)
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                className="font-display text-xs tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNewName(player.name)
                setEditingName(true)
              }}
              className="font-display text-sm tracking-wide text-gold/70 hover:text-gold transition-colors"
            >
              {player.name}
            </button>
          )}
        </div>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="font-display text-4xl sm:text-5xl lg:text-6xl text-gold-gradient text-center tracking-wide"
      >
        The Camelot Quiz
      </motion.h1>

      {/* Ornament line below title */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="ornament-line mt-5 w-48"
        aria-hidden="true"
      />

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 text-lg italic text-muted-foreground text-center"
      >
        How well dost thou know thy brethren?
      </motion.p>

      {/* Ornamental symbol */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="ornament mt-4"
        aria-hidden="true"
      >
        &#x2014;&#x2014;&#x2014; &#x2726; &#x2014;&#x2014;&#x2014;
      </motion.div>

      {/* Member grid */}
      {loaded && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
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

      {/* Navigation links */}
      {loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-8"
        >
          <Link
            href="/leaderboard"
            className="font-display text-sm tracking-wider text-gold/70 hover:text-gold transition-colors underline underline-offset-4 decoration-gold/20 hover:decoration-gold/50"
          >
            The Ledger of Champions
          </Link>
          <span className="hidden sm:inline text-gold/30" aria-hidden="true">&#x2726;</span>
          <Link
            href="/admin"
            className="font-display text-sm tracking-wider text-gold/70 hover:text-gold transition-colors underline underline-offset-4 decoration-gold/20 hover:decoration-gold/50"
          >
            Submit Thy Questions
          </Link>
        </motion.div>
      )}
    </main>
  )
}
