"use client"

import type React from "react"

import type { LumaEvent, LumaGuest } from "@/lib/luma-api"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, TicketPlusIcon, Users } from "lucide-react"
import { useState, useEffect } from "react"

interface EventCardProps {
  event: LumaEvent
}

export function EventCard({ event }: EventCardProps) {
  const [imageAspectRatio, setImageAspectRatio] = useState<"square" | "landscape" | "portrait">("landscape")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [guests, setGuests] = useState<LumaGuest[]>([])
  const [hosts, setHosts] = useState<any[]>([])

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const QRCode = (await import("qrcode")).default
        const qrDataUrl = await QRCode.toDataURL(event.url, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
        setQrCodeUrl(qrDataUrl)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
      }
    }

    if (event.url) {
      generateQRCode()
    }
  }, [event.url])

  useEffect(() => {
    const fetchGuests = async () => {
      if (event.api_id) {
        try {
          const response = await fetch(`/api/events/${event.api_id}/guests`)
          if (response.ok) {
            const data = await response.json()
            setGuests(data.guests || [])
          }
        } catch (error) {
          console.error("Failed to fetch guests:", error)
        }
      }
    }

    const fetchHosts = async () => {
      if (event.api_id) {
        try {
          const response = await fetch(`/api/events/${event.api_id}/hosts`)
          if (response.ok) {
            const data = await response.json()
            setHosts(data.hosts || [])
          }
        } catch (error) {
          console.error("Failed to fetch hosts:", error)
        }
      }
    }

    fetchGuests()
    fetchHosts()
  }, [event.api_id])

  const truncateDescription = (text: string, maxChars = 200, minChars = 100) => {
    if (!text) return ""

    const firstParagraph = text.split("\n")[0]
    const sentences = text.split(". ")

    if (firstParagraph.length <= maxChars && firstParagraph.length >= minChars) {
      return firstParagraph
    }

    let truncated = ""
    for (const sentence of sentences) {
      if ((truncated + sentence + ". ").length <= maxChars) {
        truncated += sentence + ". "
      } else {
        break
      }
    }

    if (!truncated) {
      const words = firstParagraph.split(" ")
      for (const word of words) {
        if ((truncated + word + " ").length <= maxChars) {
          truncated += word + " "
        } else {
          break
        }
      }
      truncated = truncated.trim() + "..."
    }

    return truncated.trim()
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight

    if (ratio > 1.2) {
      setImageAspectRatio("landscape")
    } else if (ratio < 0.8) {
      setImageAspectRatio("portrait")
    } else {
      setImageAspectRatio("square")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getEventDuration = () => {
    const start = new Date(event.start_at)
    const end = new Date(event.end_at)
    const startTime = formatTime(event.start_at).replace(":00", "").toLowerCase()
    const endTime = formatTime(event.end_at).replace(":00", "").toLowerCase()

    if (start.toDateString() === end.toDateString()) {
      return `${startTime} - ${endTime}`
    }
    return `${formatDate(event.start_at)} ${startTime} - ${formatDate(event.end_at)} ${endTime}`
  }

  const getTagColor = (tagName: string) => {
    // Simple hash function to generate consistent colors
    let hash = 0
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Convert hash to HSL values for pastel colors
    const hue = Math.abs(hash) % 360
    const saturation = 45 + (Math.abs(hash) % 25) // 45-70% saturation for soft colors
    const lightness = 85 + (Math.abs(hash) % 10) // 85-95% lightness for pastel effect

    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    const textColor = `hsl(${hue}, ${Math.min(saturation + 30, 100)}%, 25%)` // Darker text for contrast

    return { backgroundColor, textColor }
  }

  return (
    <Card className="h-screen w-screen bg-card border-0 rounded-none overflow-hidden flex flex-row large-screen-text high-contrast relative">
      <div className="relative w-1/2 h-full overflow-hidden dark:bg-black flex items-center justify-center bg-background">
        <img
          src={event.cover_url || "/placeholder.svg"}
          alt={event.name}
          className="max-w-full max-h-full object-contain smooth-transition"
          crossOrigin="anonymous"
          loading="eager"
          decoding="async"
          onLoad={handleImageLoad}
        />
      </div>

      <div className="w-1/2 h-full p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col bg-card overflow-y-auto">
        <h1 className="text-3xl md:text-4xl xl:text-6xl font-bold text-card-foreground mb-6 md:mb-8 lg:mb-10 text-balance leading-tight lg:text-4xl">
          {event.name}
        </h1>

        {hosts.length > 0 && (
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              {hosts.map((host, index) => (
                <div key={index} className="flex items-center gap-3 md:gap-4">
                  {host.avatar_url && (
                    <img
                      src={host.avatar_url || "/placeholder.svg"}
                      alt={host.name}
                      className="w-8 h-8 md:w-10 h-10 rounded-full object-cover flex-shrink-0 lg:w-12 h-12"
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                  )}
                  <span className="text-sm md:text-base lg:text-lg font-semibold text-primary">{host.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 lg:gap-6 mb-6 md:mb-8 leading-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-lg md:text-xl lg:text-2xl text-muted-foreground">
            <div className="flex items-center gap-3 md:gap-4">
              <Calendar className="w-5 h-5 md:w-6 h-6 text-primary flex-shrink-0 lg:w-8 h-8" />
              <span className="font-medium text-3xl">{formatDate(event.start_at)}</span>
            </div>
            <div className="flex items-center gap-3 md:gap-4 sm:ml-0 ml-11">
              <Clock className="w-5 md:w-6 h-6 text-primary flex-shrink-0 lg:w-8 h-8 sm:block hidden" />
              <span className="font-medium text-3xl">{getEventDuration()}</span>
            </div>
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
            {event.tags.map((tag, index) => {
              const { backgroundColor, textColor } = getTagColor(tag.name)
              return (
                <span
                  key={index}
                  className="rounded-full text-sm md:text-base lg:text-lg xl:text-xl font-bold px-4 py-2"
                  style={{ backgroundColor, color: textColor }}
                >
                  {tag.name}
                </span>
              )
            })}
          </div>
        )}

        <p className="text-base text-foreground mb-8 md:mb-12 text-pretty leading-relaxed md:text-2xl">
          {truncateDescription(event.description, 200)}
        </p>

        <div className="flex-1 flex flex-col w-1/2 px-12 md:px-16 lg:px-20 xl:px-24 absolute bottom-4 right-0 gap-4 bg-background pt-8">
          {/* Bottom-aligned row with attending and register */}
          <div className=" w-full flex justify-between items-start mb-8">
            {/* Attendees section */}
            <div className="flex flex-col gap-4 flex-1 pr-8 pl-3 items-start">
              {guests.length > 0 && (
                <>
                  <div className="flex items-center gap-3 md:gap-4 text-lg md:text-xl lg:text-2xl text-muted-foreground">
                    <Users className="w-6 h-6 md:w-8 h-8 lg:w-10 h-10 text-primary flex-shrink-0" />
                    <span className="font-medium">Attending ({guests.length}):</span>
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                    {guests
                      .slice(0, 50)
                      .map(
                        (guest, index) =>
                          guest.user_first_name ||
                          guest.user_name?.split(" ")[0] ||
                          guest.name?.split(" ")[0] ||
                          "Guest",
                      )
                      .join(", ")}
                    {guests.length > 50 && ` and ${guests.length - 50} more`}
                  </div>
                </>
              )}
            </div>

            {/* Register section - Always right-aligned */}
            <div className="flex flex-col items-start gap-4 flex-shrink-0">
              <div className="flex items-center gap-3 text-lg md:text-xl lg:text-2xl text-muted-foreground">
                <TicketPlusIcon className="w-6 h-6 md:w-8 h-8 lg:w-10 h-10 text-primary flex-shrink-0" />
                <span className="font-medium">Register:</span>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="QR Code for event registration"
                  className="w-32 h-32 md:w-40 h-40 lg:w-48 h-48"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
