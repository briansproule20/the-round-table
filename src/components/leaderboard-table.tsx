"use client"

import { motion } from "framer-motion"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/types"

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentPlayerId: string
}

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-500 font-bold",
  2: "text-gray-400 font-bold",
  3: "text-orange-700 font-bold",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

export function LeaderboardTable({
  entries,
  currentPlayerId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No scores yet. Be the first to take the quiz!
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Quizzes</TableHead>
        </TableRow>
      </TableHeader>
      <motion.tbody
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        data-slot="table-body"
        className="[&_tr:last-child]:border-0"
      >
        {entries.map((entry, index) => {
          const rank = index + 1
          const isCurrentPlayer = entry.id === currentPlayerId
          const rankColor = RANK_COLORS[rank]

          return (
            <motion.tr
              key={entry.id}
              variants={rowVariants}
              data-slot="table-row"
              className={cn(
                "border-b transition-colors hover:bg-muted/50",
                isCurrentPlayer && "bg-primary/5"
              )}
            >
              <TableCell className={cn(rankColor)}>
                #{rank}
              </TableCell>
              <TableCell
                className={cn(
                  "font-medium",
                  isCurrentPlayer && "text-primary"
                )}
              >
                {entry.name}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {entry.totalScore}/35
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {entry.quizzesTaken}/7
              </TableCell>
            </motion.tr>
          )
        })}
      </motion.tbody>
    </Table>
  )
}
