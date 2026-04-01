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

const OPTION_LABELS = ["A", "B", "C", "D"] as const

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
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
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
                  "w-full justify-start text-left h-auto py-3 px-4 text-sm",
                  isAnswering && "cursor-pointer",
                  state === "correct-selected" &&
                    "bg-green-500 border-green-500 text-white hover:bg-green-500 hover:text-white",
                  state === "incorrect-selected" &&
                    "bg-red-500 border-red-500 text-white hover:bg-red-500 hover:text-white",
                  state === "correct-unselected" &&
                    "border-green-500 border-2 text-green-600",
                  state === "other" && "opacity-50"
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
                <span className="font-semibold mr-2">
                  {OPTION_LABELS[index]}.
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
