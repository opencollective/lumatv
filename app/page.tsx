"use client"

import { EventCard } from "@/components/event-card"
import { SlideCard } from "@/components/slide-card"
import { EventControls } from "@/components/event-controls"
import { KioskMode } from "@/components/kiosk-mode"
import { DebugConsole } from "@/components/debug-console"
import { useEvents } from "@/hooks/use-events"
import { useSlides } from "@/hooks/use-slides"
import { useMixedRotation } from "@/hooks/use-mixed-rotation"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function EventDisplayPage() {
  const [isDebugVisible, setIsDebugVisible] = useState(false)

  const { events, loading: eventsLoading, error: eventsError } = useEvents()

  const {
    slides,
    loading: slidesLoading,
    error: slidesError,
  } = useSlides({
    // Option 1: Use a published Google Slides presentation ID
    // presentationId: "your-presentation-id-here",

    // Option 2: Use direct URLs to slide images
    slideUrls: [
      // Add your slide image URLs here
      // "https://example.com/slide1.png",
      // "https://example.com/slide2.png",
    ],

    // Enable/disable slides
    enabled: false, // Set to true when you have slides configured
  })

  const {
    currentItem,
    currentIndex,
    totalItems,
    animationKey,
    rotationInterval,
    nextItem,
    previousItem,
    goToItem,
    pause,
    resume,
    isPaused,
  } = useMixedRotation({
    events,
    slides,
    rotationInterval: 20000, // 10 seconds for events
    slideInterval: 5000, // 5 seconds for slides
    pauseOnHover: false,
  })

  useEffect(() => {
    const SIX_HOURS = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

    const reloadTimer = setTimeout(() => {
      window.location.reload()
    }, SIX_HOURS)

    return () => {
      clearTimeout(reloadTimer)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        nextItem()
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        previousItem()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [nextItem, previousItem])

  const handleTogglePause = () => {
    if (isPaused) {
      resume()
    } else {
      pause()
    }
  }

  const loading = eventsLoading || slidesLoading
  const error = eventsError || slidesError

  if (loading) {
    return (
      <div className="fullscreen-display flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8">
          <Loader2 className="w-16 h-16 md:w-20 h-20 lg:w-24 h-24 animate-spin text-primary" />
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fullscreen-display flex items-center justify-center bg-background">
        <div className="text-center px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-destructive mb-6 md:mb-8">Error</h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl">
            Failed to load content: {error}
          </p>
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="fullscreen-display flex items-center justify-center bg-background">
        <div className="text-center px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-muted-foreground mb-6 md:mb-8">
            No Content Available
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">Check back later for events and slides</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fullscreen-display relative">
      <KioskMode onToggleDebug={() => setIsDebugVisible(!isDebugVisible)} />

      <div>
        {currentItem?.type === "event" && <EventCard event={currentItem.data as any} />}
        {currentItem?.type === "slide" && <SlideCard slide={currentItem.data as any} />}
      </div>

      {/* Enhanced controls with better visibility */}
      <EventControls
        currentIndex={currentIndex}
        totalEvents={totalItems}
        isPaused={isPaused}
        animationKey={animationKey}
        rotationInterval={rotationInterval}
        onNext={nextItem}
        onPrevious={previousItem}
        onTogglePause={handleTogglePause}
        onGoToEvent={goToItem}
      />

      <DebugConsole isVisible={isDebugVisible} onToggleVisibility={() => setIsDebugVisible(!isDebugVisible)} />
    </div>
  )
}
