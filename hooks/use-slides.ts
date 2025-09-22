"use client"

import { useMemo } from "react"

export interface Slide {
  id: string
  title: string
  imageUrl: string
  duration?: number // Optional custom duration for this slide
}

interface UseSlidesProps {
  presentationId?: string // Google Slides presentation ID
  slideUrls?: string[] // Direct URLs to slide images
  enabled?: boolean
}

export function useSlides({ presentationId, slideUrls = [], enabled = true }: UseSlidesProps = {}) {
  const slides = useMemo(() => {
    if (!enabled) {
      return []
    }

    // If direct URLs are provided, use them
    if (slideUrls.length > 0) {
      return slideUrls.map((url, index) => ({
        id: `slide-${index}`,
        title: `Slide ${index + 1}`,
        imageUrl: url,
      }))
    }

    // If presentation ID is provided, construct URLs for published slides
    if (presentationId) {
      const slideData: Slide[] = []
      // You can add multiple slides by incrementing the slide number
      // For now, we'll create a few example slides
      for (let i = 1; i <= 5; i++) {
        slideData.push({
          id: `slide-${i}`,
          title: `Slide ${i}`,
          imageUrl: `https://docs.google.com/presentation/d/${presentationId}/export/png?id=${presentationId}&pageid=slide${i}`,
        })
      }
      return slideData
    }

    return []
  }, [enabled, presentationId, slideUrls.join(",")]) // Use string join for stable dependency

  return {
    slides,
    loading: false, // No async loading needed for this simple implementation
    error: null,
  }
}
