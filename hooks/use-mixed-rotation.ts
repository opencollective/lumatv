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

  useEffect(() => {
    const items: MixedItem[] = []

    // Convert events to mixed items
    events.forEach((event) => {
      items.push({
        type: "event",
        data: event,
        id: `event-${event.api_id}`,
      })
    })

    // Convert slides to mixed items and intertwine them
    slides.forEach((slide, index) => {
      items.push({
        type: "slide",
        data: slide,
        id: `slide-${slide.id}`,
      })
    })

    // Shuffle or arrange items as needed
    // For now, we'll alternate: event, slide, event, slide...
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

    // Reset to first item if current index is out of bounds
    if (currentIndex >= arranged.length) {
      setCurrentIndex(0)
    }
  }, [events, slides, currentIndex])

  const imageUrls = mixedItems
    .flatMap((item) => {
      const urls: string[] = []

      if (item.type === "event") {
        const event = item.data as LumaEvent
        // Add cover image
        if (event.cover_url) {
          urls.push(event.cover_url)
        }
        // Add host avatars
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
    preloadAll: true, // Preload all images at startup
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
    if (isPaused || mixedItems.length <= 1) return

    const currentItem = mixedItems[currentIndex]
    const interval = currentItem?.type === "slide" ? slideInterval : rotationInterval

    const timer = setTimeout(() => {
      nextItem()
    }, interval)

    return () => {
      clearTimeout(timer)
    }
  }, [nextItem, rotationInterval, slideInterval, isPaused, mixedItems, currentIndex])

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
