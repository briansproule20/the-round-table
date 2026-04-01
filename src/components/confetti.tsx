"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

export function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.8 },
  })
}

export function Confetti() {
  useEffect(() => {
    fireConfetti()
  }, [])

  return null
}
