"use client"

import { useState, useEffect, useCallback } from "react"

interface UseEventRotationProps {
  totalEvents: number
  rotationInterval?: number // in milliseconds
  pauseOnHover?: boolean
}

export function useEventRotation({
  totalEvents,
  rotationInterval = 10000,
  pauseOnHover = false,
}: UseEventRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [animationKey, setAnimationKey] = useState(0) // Used to restart CSS animation

  const nextEvent = useCallback(() => {
    if (totalEvents === 0) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalEvents)
    setAnimationKey((prev) => prev + 1)
  }, [totalEvents])

  const previousEvent = useCallback(() => {
    if (totalEvents === 0) return
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalEvents - 1 : prevIndex - 1))
    setAnimationKey((prev) => prev + 1)
  }, [totalEvents])

  const goToEvent = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalEvents) {
        setCurrentIndex(index)
        setAnimationKey((prev) => prev + 1)
      }
    },
    [totalEvents],
  )

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  useEffect(() => {
    if (isPaused || totalEvents <= 1) return

    const interval = setInterval(() => {
      nextEvent()
    }, rotationInterval)

    return () => {
      clearInterval(interval)
    }
  }, [nextEvent, rotationInterval, isPaused, totalEvents])

  return {
    currentIndex,
    animationKey,
    rotationInterval,
    nextEvent,
    previousEvent,
    goToEvent,
    pause,
    resume,
    isPaused,
  }
}
