"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Question } from "@/lib/types"

interface QuestionCardProps {
  question: Question
  onAnswer: (index: number) => void
  phase: "answering" | "feedback"
  selectedIndex: number | null
  accentColor: string
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV"] as const

export function QuestionCard({
  question,
  onAnswer,
  phase,
  selectedIndex,
  accentColor,
}: QuestionCardProps) {
  const isAnswering = phase === "answering"
  const isFeedback = phase === "feedback"

  function getOptionState(index: number) {
    if (!isFeedback || selectedIndex === null) return "default"
    const isSelected = index === selectedIndex
    const isCorrect = index === question.correct_index

    if (isSelected && isCorrect) return "correct-selected"
    if (isSelected && !isCorrect) return "incorrect-selected"
    if (!isSelected && isCorrect) return "correct-unselected"
    return "other"
  }

  function getAnimation(state: string) {
    switch (state) {
      case "correct-selected":
        return {
          animate: { scale: [1, 1.05, 1] },
          transition: { duration: 0.5, repeat: 1 },
        }
      case "incorrect-selected":
        return {
          animate: { x: [0, -8, 8, -8, 0] },
          transition: { duration: 0.4 },
        }
      default:
        return {}
    }
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="font-display text-lg font-medium text-foreground leading-relaxed">
        {question.question_text}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((option, index) => {
          const state = getOptionState(index)
          const animation = getAnimation(state)

          return (
            <motion.div
              key={index}
              whileTap={isAnswering ? { scale: 0.97 } : undefined}
              {...animation}
            >
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto py-3.5 px-4 text-sm font-sans border-border/50 transition-all duration-200",
                  isAnswering && "cursor-pointer hover:border-gold/40",
                  state === "correct-selected" &&
                    "bg-emerald-800/60 border-emerald-600 text-emerald-100 hover:bg-emerald-800/60 hover:text-emerald-100",
                  state === "incorrect-selected" &&
                    "bg-crimson/40 border-crimson text-red-200 hover:bg-crimson/40 hover:text-red-200",
                  state === "correct-unselected" &&
                    "border-emerald-600/70 border-2 text-emerald-300",
                  state === "other" && "opacity-40"
                )}
                style={
                  isAnswering
                    ? ({
                        "--hover-accent": accentColor,
                      } as React.CSSProperties)
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (isAnswering) {
                    const target = e.currentTarget as HTMLElement
                    target.style.borderColor = accentColor
                    target.style.backgroundColor = `${accentColor}15`
                  }
                }}
                onMouseLeave={(e) => {
                  if (isAnswering) {
                    const target = e.currentTarget as HTMLElement
                    target.style.borderColor = ""
                    target.style.backgroundColor = ""
                  }
                }}
                disabled={isFeedback}
                onClick={() => isAnswering && onAnswer(index)}
              >
                <span className="font-display text-xs tracking-wider text-gold opacity-70 mr-3 min-w-[1.5rem]">
                  {ROMAN_NUMERALS[index]}
                </span>
                {option}
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
