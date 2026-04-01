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

const RANK_MEDALS: Record<number, { label: string; color: string }> = {
  1: { label: "I", color: "text-[#c9a84c] font-bold" },
  2: { label: "II", color: "text-gray-400 font-bold" },
  3: { label: "III", color: "text-[#b87333] font-bold" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
}

export function LeaderboardTable({
  entries,
  currentPlayerId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground italic font-sans">
        The ledger stands empty. Be the first to prove thy worth.
      </div>
    )
  }

  return (
    <div className="scroll-card rounded-lg glow-gold overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#c9a84c]/15 hover:bg-transparent">
            <TableHead className="w-16 font-display uppercase tracking-wider text-xs text-muted-foreground">
              Rank
            </TableHead>
            <TableHead className="font-display uppercase tracking-wider text-xs text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="text-right font-display uppercase tracking-wider text-xs text-muted-foreground">
              Score
            </TableHead>
            <TableHead className="text-right font-display uppercase tracking-wider text-xs text-muted-foreground">
              Trials
            </TableHead>
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
            const medal = RANK_MEDALS[rank]

            return (
              <motion.tr
                key={entry.id}
                variants={rowVariants}
                data-slot="table-row"
                className={cn(
                  "border-b border-[#c9a84c]/10 transition-colors hover:bg-[#c9a84c]/5",
                  isCurrentPlayer && "bg-[#c9a84c]/8"
                )}
              >
                <TableCell className={cn("font-display", medal?.color)}>
                  {medal ? medal.label : `${rank}`}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-medium",
                    isCurrentPlayer && "text-[#c9a84c]"
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
    </div>
  )
}
