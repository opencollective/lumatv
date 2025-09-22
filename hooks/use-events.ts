"use client"

import { useState, useEffect } from "react"
import type { LumaEvent } from "@/lib/luma-api"

export function useEvents() {
  const [events, setEvents] = useState<LumaEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    var fetchEvents = () =>
      new Promise((resolve, reject) => {
        try {
          setLoading(true)
          fetch("/api/events")
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to fetch events")
              }
              return response.json()
            })
            .then((data) => {
              const now = new Date()
              const futureEvents = data.events.filter((event: LumaEvent) => {
                const eventStart = new Date(event.start_at)
                return eventStart > now
              })
              setEvents(futureEvents)
              setError(null)
              resolve(data)
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : "Unknown error")
              console.error("Error fetching events:", err)
              reject(err)
            })
            .finally(() => {
              setLoading(false)
            })
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error")
          console.error("Error fetching events:", err)
          setLoading(false)
          reject(err)
        }
      })

    fetchEvents()

    var interval = setInterval(
      () => {
        fetchEvents()
      },
      60 * 60 * 1000,
    ) // 1 hour

    return () => {
      clearInterval(interval)
    }
  }, [])

  return { events, loading, error }
}
