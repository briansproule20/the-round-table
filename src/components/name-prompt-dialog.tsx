"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { initPlayer } from "@/lib/player"

interface NamePromptDialogProps {
  open: boolean
  onComplete: () => void
}

export function NamePromptDialog({ open, onComplete }: NamePromptDialogProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const isValid = name.trim().length >= 2

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters")
      return
    }
    initPlayer(trimmed)
    onComplete()
  }

  return (
    <Dialog open={open}>
      <AnimatePresence>
        {open && (
          <DialogContent showCloseButton={false}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>Welcome to Camelot</DialogTitle>
                <DialogDescription>
                  Enter your name to begin your quest.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Input
                    placeholder="Your display name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError("")
                    }}
                    autoFocus
                    minLength={2}
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>
                <Button type="submit" disabled={!isValid}>
                  Enter the Realm
                </Button>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
