"use client"

import { useState, useEffect, useCallback } from "react"
import type { LumaEvent } from "./use-events"
import type { Slide } from "./use-slides"
import { useImagePreloader } from "./use-image-preloader"

export interface MixedItem {
  type: "event" | "slide"
  data: LumaEvent | Slide
  id: string
}

interface UseMixedRotationProps {
  events: LumaEvent[]
  slides: Slide[]
  rotationInterval?: number
  slideInterval?: number // Different interval for slides
  pauseOnHover?: boolean
}

export function useMixedRotation({
  events,
  slides,
  rotationInterval = 10000,
  slideInterval = 5000, // Slides show for 5 seconds by default
  pauseOnHover = false,
}: UseMixedRotationProps) {
  const [mixedItems, setMixedItems] = useState<MixedItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [hasUserActivation, setHasUserActivation] = useState(false)
  let fallbackTimer: any = null // Declare fallbackTimer here

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

    const handleUserActivation = () => {
      if (!hasUserActivation) {
        console.log("[v0] User activation detected, enabling slideshow")
        setHasUserActivation(true)
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("webkitvisibilitychange", handleVisibilityChange)

      window.addEventListener("focus", handleFocus)
      window.addEventListener("blur", handleBlur)

      handleVisibilityChange()

      // Listen for any user interaction to enable slideshow
      const events = ["click", "keydown", "touchstart", "mousedown"]
      events.forEach((event) => {
        document.addEventListener(event, handleUserActivation, { once: true, passive: true })
      })

      // Auto-activate after a delay as fallback (Chrome 94 might allow this)
      fallbackTimer = setTimeout(() => {
        if (!hasUserActivation) {
          console.log("[v0] Fallback activation after 2 seconds")
          setHasUserActivation(true)
        }
      }, 2000)
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        document.removeEventListener("webkitvisibilitychange", handleVisibilityChange)
        window.removeEventListener("focus", handleFocus)
        window.removeEventListener("blur", handleBlur)

        const events = ["click", "keydown", "touchstart", "mousedown"]
        events.forEach((event) => {
          document.removeEventListener(event, handleUserActivation)
        })
        clearTimeout(fallbackTimer)
      }
    }
  }, [hasUserActivation])

  useEffect(() => {
    const items: MixedItem[] = []

    events.forEach((event) => {
      items.push({
        type: "event",
        data: event,
        id: `event-${event.api_id}`,
      })
    })

    slides.forEach((slide, index) => {
      items.push({
        type: "slide",
        data: slide,
        id: `slide-${slide.id}`,
      })
    })

    const arranged: MixedItem[] = []
    const maxLength = Math.max(events.length, slides.length)

    for (let i = 0; i < maxLength; i++) {
      if (i < events.length) {
        arranged.push(items.find((item) => item.type === "event" && item.id === `event-${events[i].api_id}`)!)
      }
      if (i < slides.length) {
        arranged.push(items.find((item) => item.type === "slide" && item.id === `slide-${slides[i].id}`)!)
      }
    }

    setMixedItems(arranged.filter(Boolean))

    if (currentIndex >= arranged.length) {
      setCurrentIndex(0)
    }
  }, [events, slides, currentIndex])

  const imageUrls = mixedItems
    .flatMap((item) => {
      const urls: string[] = []

      if (item.type === "event") {
        const event = item.data as LumaEvent
        if (event.cover_url) {
          urls.push(event.cover_url)
        }
        if (event.hosts) {
          event.hosts.forEach((host) => {
            if (host.avatar_url) {
              urls.push(host.avatar_url)
            }
          })
        }
      } else {
        const slide = item.data as Slide
        if (slide.imageUrl) {
          urls.push(slide.imageUrl)
        }
      }

      return urls
    })
    .filter(Boolean)

  const { preloadNext, isImageLoaded } = useImagePreloader({
    imageUrls,
    preloadCount: 3,
    preloadAll: true,
  })

  const nextItem = useCallback(() => {
    if (mixedItems.length === 0) return
    const newIndex = (currentIndex + 1) % mixedItems.length
    setCurrentIndex(newIndex)
    setAnimationKey((prev) => prev + 1)

    preloadNext(newIndex)
  }, [mixedItems.length, currentIndex, preloadNext])

  const previousItem = useCallback(() => {
    if (mixedItems.length === 0) return
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? mixedItems.length - 1 : prevIndex - 1))
    setAnimationKey((prev) => prev + 1)
  }, [mixedItems.length])

  const goToItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < mixedItems.length) {
        setCurrentIndex(index)
        setAnimationKey((prev) => prev + 1)
      }
    },
    [mixedItems.length],
  )

  const pause = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    setIsPaused(false)
  }, [])

  useEffect(() => {
    if (isPaused || mixedItems.length <= 1 || !isPageVisible || !hasUserActivation) return

    const currentItem = mixedItems[currentIndex]
    const interval = currentItem?.type === "slide" ? slideInterval : rotationInterval

    console.log(
      "[v0] Setting timer for",
      interval,
      "ms, page visible:",
      isPageVisible,
      "user activated:",
      hasUserActivation,
    )

    const timer = setTimeout(() => {
      console.log("[v0] Timer fired, advancing to next item")
      nextItem()
    }, interval)

    return () => {
      clearTimeout(timer)
    }
  }, [nextItem, rotationInterval, slideInterval, isPaused, mixedItems, currentIndex, isPageVisible, hasUserActivation])

  const currentItem = mixedItems[currentIndex] || null
  const currentInterval = currentItem?.type === "slide" ? slideInterval : rotationInterval

  return {
    currentItem,
    currentIndex,
    totalItems: mixedItems.length,
    animationKey,
    rotationInterval: currentInterval,
    nextItem,
    previousItem,
    goToItem,
    pause,
    resume,
    isPaused,
    isImageLoaded,
  }
}
