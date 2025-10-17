import { NextResponse } from "next/server"
import { LumaApiClient } from "@/lib/luma-api"

export const revalidate = 60 * 60; // revalidate every hour

export async function GET() {
  try {
    // In production, this should come from environment variables
    const apiKey = process.env.LUMA_API_KEY || "demo-key"
    const lumaClient = new LumaApiClient(apiKey)

    const events = await lumaClient.getEvents(20)

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
