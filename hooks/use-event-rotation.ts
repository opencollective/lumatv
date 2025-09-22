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
  const [isPageVisible, setIsPageVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = typeof document !== "undefined" && (document.visibilityState === "visible" || !document.hidden)
      setIsPageVisible(isVisible)

      console.log("[v0] Page visibility changed:", isVisible ? "visible" : "hidden")
    }

    const handleFocus = () => {
      setIsPageVisible(true)
      console.log("[v0] Window focused")
    }

    const handleBlur = () => {
      setIsPageVisible(false)
      console.log("[v0] Window blurred")
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("webkitvisibilitychange", handleVisibilityChange)

      window.addEventListener("focus", handleFocus)
      window.addEventListener("blur", handleBlur)

      handleVisibilityChange()
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        document.removeEventListener("webkitvisibilitychange", handleVisibilityChange)
        window.removeEventListener("focus", handleFocus)
        window.removeEventListener("blur", handleBlur)
      }
    }
  }, [])

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
    if (isPaused || totalEvents <= 1 || !isPageVisible) return

    console.log("[v0] Setting interval for", rotationInterval, "ms, page visible:", isPageVisible)

    const interval = setInterval(() => {
      console.log("[v0] Interval fired, advancing to next event")
      nextEvent()
    }, rotationInterval)

    return () => {
      clearInterval(interval)
    }
  }, [nextEvent, rotationInterval, isPaused, totalEvents, isPageVisible])

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
