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
          <DialogContent showCloseButton={false} className="scroll-card glow-gold border-gold/20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <DialogHeader className="text-center">
                <DialogTitle className="font-display text-2xl sm:text-3xl text-gold-gradient tracking-wide">
                  Welcome to Camelot
                </DialogTitle>
                <DialogDescription className="mt-2 italic text-muted-foreground">
                  State thy name to enter the realm.
                </DialogDescription>
              </DialogHeader>

              <div className="ornament-line my-5" aria-hidden="true">
                <span className="text-primary/40 text-sm tracking-[0.3em] select-none">
                  &#x2756;
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Input
                    placeholder="Thy name, traveller..."
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError("")
                    }}
                    autoFocus
                    minLength={2}
                    className="border-gold/20 bg-background/60 placeholder:text-muted-foreground/50 focus-visible:ring-gold/40"
                  />
                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 glow-gold-hover"
                >
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
