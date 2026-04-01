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
import type { Member, Question, Player } from "@/lib/types"

export default function QuizPage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = use(params)
  const router = useRouter()

  const [player, setPlayer] = useState<Player | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<"answering" | "feedback" | "complete">(
    "answering"
  )
  const [score, setScore] = useState(0)

  useEffect(() => {
    const p = getPlayer()
    if (!p) {
      router.push("/")
      return
    }
    setPlayer(p)

    async function loadQuiz() {
      const { data: memberData } = await supabase
        .from("members")
        .select("*")
        .eq("slug", memberId)
        .single()

      if (!memberData) {
        setLoading(false)
        return
      }

      setMember(memberData)

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("member_id", memberData.id)
        .order("order")

      setQuestions(questionsData ?? [])
      setLoading(false)
    }

    loadQuiz()
  }, [memberId, router])

  const handleAnswer = useCallback(
    (index: number) => {
      if (phase !== "answering") return
      setSelectedAnswer(index)
      setPhase("feedback")

      const newAnswers = [...answers, index]
      setAnswers(newAnswers)

      setTimeout(() => {
        const nextQuestion = currentQuestion + 1
        if (nextQuestion >= questions.length) {
          // Calculate score and complete
          let totalScore = 0
          for (let i = 0; i < newAnswers.length; i++) {
            if (newAnswers[i] === questions[i].correct_index) {
              totalScore++
            }
          }
          setScore(totalScore)

          // Upsert score to supabase
          if (player && member) {
            supabase
              .from("scores")
              .upsert(
                {
                  player_id: player.id,
                  player_name: player.name,
                  member_id: member.id,
                  score: totalScore,
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
          setPhase("answering")
        }
      }, 2000)
    },
    [phase, answers, currentQuestion, questions, player, member]
  )

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!member) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Member not found.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-foreground">
          Questions not submitted yet!
        </p>
        <p className="text-muted-foreground">
          {member.name} hasn&apos;t added their questions yet. Check back later.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
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
            className="text-xl font-bold"
            style={{ color: member.color }}
          >
            {member.name}&apos;s Quiz
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground"
          >
            Quit
          </Button>
        </div>

        <ProgressBar
          current={currentQuestion + 1}
          total={questions.length}
          color={member.color}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <QuestionCard
              question={question}
              onAnswer={handleAnswer}
              phase={phase}
              selectedIndex={selectedAnswer}
              accentColor={member.color}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
