"use client"

import { useEffect, useRef } from "react"

interface UseImagePreloaderProps {
  imageUrls: string[]
  preloadCount?: number // How many images ahead to preload
  preloadAll?: boolean // Whether to preload all images at startup
}

export function useImagePreloader({ imageUrls, preloadCount = 2, preloadAll = false }: UseImagePreloaderProps) {
  const loadedImages = useRef<Set<string>>(new Set())
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const hasPreloadedAll = useRef(false)

  useEffect(() => {
    function preloadImage(url: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (loadedImages.current.has(url)) {
          resolve()
          return
        }

        const img = new Image()
        img.crossOrigin = "anonymous" // Set crossOrigin for Samsung TV compatibility

        img.onload = () => {
          loadedImages.current.add(url)
          imageCache.current.set(url, img)
          resolve()
        }

        img.onerror = () => {
          reject(new Error("Failed to load image: " + url))
        }

        img.src = url
      })
    }

    function preloadImages(urls: string[]) {
      urls.forEach((url) => {
        if (url && !loadedImages.current.has(url)) {
          preloadImage(url).catch((error) => {
            console.warn("[v0] Failed to preload image:", error)
          })
        }
      })
    }

    if (imageUrls.length > 0) {
      if (preloadAll) {
        if (!hasPreloadedAll.current) {
          console.log("[v0] Preloading all", imageUrls.length, "images at startup")
          preloadImages(imageUrls)
          hasPreloadedAll.current = true
        }
      } else {
        const initialUrls = imageUrls.slice(0, preloadCount)
        preloadImages(initialUrls)
      }
    }
  }, [imageUrls.join(","), preloadCount, preloadAll])

  const preloadNext = (currentIndex: number) => {
    const nextUrls: string[] = []

    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = (currentIndex + i) % imageUrls.length
      if (imageUrls[nextIndex]) {
        nextUrls.push(imageUrls[nextIndex])
      }
    }

    nextUrls.forEach((url) => {
      if (url && !loadedImages.current.has(url)) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          loadedImages.current.add(url)
          imageCache.current.set(url, img)
        }
        img.onerror = () => {
          console.warn("[v0] Failed to preload next image:", url)
        }
        img.src = url
      }
    })
  }

  return {
    preloadNext,
    isImageLoaded: (url: string) => loadedImages.current.has(url),
    getCachedImage: (url: string) => imageCache.current.get(url),
  }
}
