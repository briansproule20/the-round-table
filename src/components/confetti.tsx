"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

const GOLD_COLORS = ["#c9a84c", "#b8963f", "#d4b456", "#a08030"]

export function fireConfetti() {
  confetti({
    particleCount: 200,
    spread: 80,
    origin: { y: 0.7 },
    colors: GOLD_COLORS,
  })
}

export function Confetti() {
  useEffect(() => {
    fireConfetti()
  }, [])

  return null
}
