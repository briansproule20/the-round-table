"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full w-1.5 rounded-l-xl"
          style={{ backgroundColor: member.color }}
        />
        {playerScore !== null && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary">{playerScore}/5</Badge>
          </div>
        )}
        <CardContent className="flex items-center gap-4 pl-6">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="size-12 rounded-full object-cover ring-2 ring-foreground/10"
            />
          ) : (
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: member.color }}
            >
              {initial}
            </div>
          )}
          <span className="text-lg font-semibold">{member.name}</span>
        </CardContent>
      </Card>
    </motion.div>
  )
}
