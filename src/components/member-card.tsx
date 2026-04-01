"use client"

import { motion } from "framer-motion"
import type { Member } from "@/lib/types"

interface MemberCardProps {
  member: Member
  playerScore: number | null
  onClick: () => void
}

export function MemberCard({ member, playerScore, onClick }: MemberCardProps) {
  const initial = member.name.charAt(0).toUpperCase()

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="scroll-card glow-gold-hover relative overflow-hidden rounded-lg border-l-2 border-l-gold/30 p-4">
        {playerScore !== null && (
          <div className="absolute top-2.5 right-2.5">
            <span className="wax-seal text-[0.65rem]">
              {playerScore}/5
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="size-11 rounded-full object-cover ring-2 ring-gold/20"
            />
          ) : (
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full font-display text-base font-bold text-white ring-2 ring-gold/15"
              style={{ backgroundColor: member.color }}
            >
              {initial}
            </div>
          )}

          <span className="font-display text-base tracking-wide text-foreground">
            {member.name}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
