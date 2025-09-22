import { NextResponse } from "next/server"
import { LumaApiClient } from "@/lib/luma-api"

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const apiKey = process.env.LUMA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const lumaClient = new LumaApiClient(apiKey)
    const guests = await lumaClient.getEventGuests(params.eventId)

    return NextResponse.json({ guests })
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 })
  }
}
