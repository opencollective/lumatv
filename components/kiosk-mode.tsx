"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize, Minimize, Terminal } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

interface KioskModeProps {
  onToggleDebug?: () => void
}

export function KioskMode({ onToggleDebug }: KioskModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if fullscreen API is supported
    setIsSupported(
      document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled,
    )

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        ),
      )
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const enterFullscreen = async () => {
    try {
      const element = document.documentElement
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
    } catch (error) {
      console.error("Failed to exit fullscreen:", error)
    }
  }

  if (!isSupported) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {!isFullscreen && onToggleDebug && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDebug}
          className="bg-card/90 backdrop-blur-sm border border-border/50 hover:bg-card"
          title="Open Debug Console (Ctrl+Shift+D)"
        >
          <Terminal className="w-4 h-4" />
        </Button>
      )}

      {!isFullscreen && <ThemeToggle />}

      <Button
        variant="ghost"
        size="sm"
        onClick={isFullscreen ? exitFullscreen : enterFullscreen}
        className="bg-card/90 backdrop-blur-sm border border-border/50 hover:bg-card"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </Button>
    </div>
  )
}
