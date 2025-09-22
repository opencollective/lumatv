import { type NextRequest, NextResponse } from "next/server"
import { LumaApiClient } from "@/lib/luma-api"

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const apiKey = process.env.LUMA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const lumaApi = new LumaApiClient(apiKey)

    console.log("[v0] Fetching event details for hosts:", params.eventId)

    const response = await fetch(`https://public-api.luma.com/v1/event/get?api_id=${params.eventId}`, {
      headers: {
        accept: "application/json",
        "x-luma-api-key": apiKey,
      },
    })

    if (!response.ok) {
      console.log("[v0] Event details API response status:", response.status)
      return NextResponse.json({ error: "Failed to fetch event details" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Event details fetched successfully")

    // Extract hosts from the event data
    const hosts = data.hosts || []

    return NextResponse.json({ hosts })
  } catch (error) {
    console.error("[v0] Error fetching event hosts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
