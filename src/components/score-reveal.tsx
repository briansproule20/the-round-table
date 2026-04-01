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
      className="scroll-card glow-gold rounded-xl p-8 sm:p-12 flex flex-col items-center gap-6 text-center"
    >
      <div className="ornament">--- --- ---</div>

      <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground">
        {memberName}&apos;s Trial
      </h2>

      <div className="ornament-line w-full">
        <span className="font-display text-xs text-gold opacity-50">*</span>
      </div>

      <div className="text-gold-gradient text-8xl font-display tabular-nums leading-none py-2">
        {displayScore}/{total}
      </div>

      <div className="ornament-line w-full">
        <span className="font-display text-xs text-gold opacity-50">*</span>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showMessage ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className={`font-sans text-lg text-muted-foreground max-w-sm leading-relaxed ${showMessage ? "ink-text" : ""}`}
      >
        {message}
      </motion.p>

      <div className="ornament-line w-full mt-2">
        <span className="font-display text-xs text-gold opacity-50">*</span>
      </div>

      <div className="flex gap-3 mt-2">
        <Button
          variant="outline"
          className="font-display text-xs uppercase tracking-wider border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
          onClick={onHome}
        >
          Return to the Hall
        </Button>
        <Button
          variant="outline"
          className="font-display text-xs uppercase tracking-wider border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
          onClick={onLeaderboard}
        >
          View the Leaderboard
        </Button>
      </div>

      <div className="ornament">--- --- ---</div>
    </motion.div>
  )
}
