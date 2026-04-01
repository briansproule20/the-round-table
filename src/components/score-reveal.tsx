"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getScoreMessage } from "@/lib/constants"
import { fireConfetti } from "@/components/confetti"

interface ScoreRevealProps {
  score: number
  total: number
  memberName: string
  onHome: () => void
  onLeaderboard: () => void
}

export function ScoreReveal({
  score,
  total,
  memberName,
  onHome,
  onLeaderboard,
}: ScoreRevealProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [showMessage, setShowMessage] = useState(false)
  const confettiFired = useRef(false)

  useEffect(() => {
    if (score === 0) {
      setDisplayScore(0)
      const timer = setTimeout(() => setShowMessage(true), 500)
      return () => clearTimeout(timer)
    }

    const duration = 1500
    const startTime = performance.now()

    let animationId: number

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * score))

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      } else {
        setDisplayScore(score)

        if (score === total && !confettiFired.current) {
          confettiFired.current = true
          fireConfetti()
        }
      }
    }

    animationId = requestAnimationFrame(animate)

    const messageTimer = setTimeout(() => {
      setShowMessage(true)
    }, duration + 500)

    return () => {
      cancelAnimationFrame(animationId)
      clearTimeout(messageTimer)
    }
  }, [score, total])

  const message = getScoreMessage(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <h2 className="text-lg font-medium text-muted-foreground">
        {memberName}&apos;s Quiz
      </h2>

      <div className="text-7xl font-bold tabular-nums text-foreground">
        {displayScore}/{total}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showMessage ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="text-lg text-muted-foreground max-w-sm"
      >
        {message}
      </motion.p>

      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={onHome}>
          Back to Home
        </Button>
        <Button onClick={onLeaderboard}>View Leaderboard</Button>
      </div>
    </motion.div>
  )
}
