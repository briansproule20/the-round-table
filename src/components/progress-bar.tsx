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
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted-foreground">
        Question {current} of {total}
      </span>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          layout
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}
