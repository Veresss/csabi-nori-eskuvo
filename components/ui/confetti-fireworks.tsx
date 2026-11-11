"use client"

import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function ConfettiFireworks() {
  const triggerFireworks = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
    
    return interval
  }

  useEffect(() => {
    const intervalId = triggerFireworks()
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="relative text-center mt-4">
      <Button variant="outline" size="xl" onClick={triggerFireworks}><span className="text-xl">🥳</span></Button>
    </div>
  )
}
