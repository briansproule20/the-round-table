"use client"

import { use, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { getPlayer } from "@/lib/player"
import { supabase } from "@/lib/supabase"
import { ProgressBar } from "@/components/progress-bar"
import { QuestionCard } from "@/components/question-card"
import { ScoreReveal } from "@/components/score-reveal"
import { Button } from "@/components/ui/button"
import type { Member, Player } from "@/lib/types"

// Quiz-safe question type -- no correct_index on the client
interface QuizQuestion {
  id: string
  member_id: string
  question_text: string
  options: string[]
  order: number
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = use(params)
  const router = useRouter()

  const [player, setPlayer] = useState<Player | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [correctIndex, setCorrectIndex] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<"answering" | "feedback" | "complete">(
    "answering"
  )
  const [score, setScore] = useState(0)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const p = getPlayer()
    if (!p) {
      router.push("/")
      return
    }
    setPlayer(p)

    async function loadQuiz() {
      // Fetch questions via server API -- correct_index is NEVER sent to client
      const response = await fetch(`/api/quiz/questions?slug=${memberId}`)
      if (!response.ok) {
        setLoading(false)
        return
      }

      const data = await response.json()
      setMember(data.member)
      setQuestions(data.questions)
      setLoading(false)
    }

    loadQuiz()
  }, [memberId, router])

  const handleAnswer = useCallback(
    async (index: number) => {
      if (phase !== "answering" || checking) return

      setSelectedAnswer(index)
      setChecking(true)

      // Ask the server if the answer is correct
      const response = await fetch("/api/quiz/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questions[currentQuestion].id,
          selected_index: index,
        }),
      })

      const result = await response.json()
      setCorrectIndex(result.correct_index)
      setPhase("feedback")
      setChecking(false)

      const newAnswers = [...answers, index]
      setAnswers(newAnswers)

      const newScore = result.correct ? score + 1 : score
      if (result.correct) setScore(newScore)

      setTimeout(() => {
        const nextQuestion = currentQuestion + 1
        if (nextQuestion >= questions.length) {
          // Submit final score to supabase
          if (player && member) {
            supabase
              .from("scores")
              .upsert(
                {
                  player_id: player.id,
                  player_name: player.name,
                  member_id: member.id,
                  score: newScore,
                  answers: newAnswers,
                },
                { onConflict: "player_id,member_id" }
              )
              .then(() => {})
          }
          setPhase("complete")
        } else {
          setCurrentQuestion(nextQuestion)
          setSelectedAnswer(null)
          setCorrectIndex(null)
          setPhase("answering")
        }
      }, 2000)
    },
    [phase, checking, answers, currentQuestion, questions, player, member, score]
  )

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground italic">
          The scrolls are being retrieved...
        </p>
      </main>
    )
  }

  if (!member) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Member not found.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to the Hall
        </Button>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <p className="text-xl font-display text-foreground">
          The scrolls remain unwritten.
        </p>
        <p className="text-muted-foreground italic">
          {member.name} has not yet inscribed their questions.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to the Hall
        </Button>
      </main>
    )
  }

  if (phase === "complete") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <ScoreReveal
          score={score}
          total={questions.length}
          memberName={member.name}
          onHome={() => router.push("/")}
          onLeaderboard={() => router.push("/leaderboard")}
        />
      </main>
    )
  }

  const question = questions[currentQuestion]

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between">
          <h1
            className="text-xl font-display tracking-wide"
            style={{ color: member.color }}
          >
            {member.name}&apos;s Trial
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            Abandon
          </Button>
        </div>

        <ProgressBar
          current={currentQuestion + 1}
          total={questions.length}
          color={member.color}
        />

        <div className="scroll-card rounded-lg p-6 glow-gold">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <QuestionCard
                question={{
                  ...question,
                  correct_index: correctIndex ?? -1,
                  updated_at: "",
                  created_at: "",
                }}
                onAnswer={handleAnswer}
                phase={phase}
                selectedIndex={selectedAnswer}
                accentColor={member.color}
              />
            </motion.div>
          </AnimatePresence>

          {checking && (
            <p className="text-center text-sm text-muted-foreground italic mt-4">
              The council deliberates...
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
