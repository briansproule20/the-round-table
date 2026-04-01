"use client"

import { motion } from "framer-motion"

interface ProgressBarProps {
  current: number
  total: number
  color: string
}

export function ProgressBar({ current, total, color }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
        Question {current} of {total}
      </span>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        {/* Notch marks at each question position */}
        {Array.from({ length: total }, (_, i) => {
          const position = ((i + 1) / total) * 100
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 z-10 h-1.5 w-1.5 rounded-full"
              style={{
                left: `${position}%`,
                transform: "translate(-50%, -50%)",
                backgroundColor:
                  i + 1 <= current
                    ? color
                    : "oklch(0.73 0.13 85 / 30%)",
              }}
            />
          )
        })}

        {/* Progress fill */}
        <motion.div
          layout
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}60, inset 0 1px 2px rgba(255,255,255,0.15)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}
