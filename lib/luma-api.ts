export interface LumaEvent {
  id: string
  name: string
  description: string
  start_at: string
  end_at: string
  cover_url: string
  url: string
  api_id: string // Added api_id for guest fetching
  hosts: Array<{
    name: string
    avatar_url?: string
  }>
  tags: Array<{
    name: string
  }>
  location?: {
    name: string
    address: string
  }
  guests?: LumaGuest[] // Added optional guests array
}

export interface LumaGuest {
  id: string
  name: string
  user_name?: string
  user_first_name?: string
  user_last_name?: string
  avatar_url?: string
  approval_status: string
}

export interface LumaApiResponse {
  entries: Array<{
    api_id: string
    event: {
      id: string
      name: string
      description: string
      start_at: string
      end_at: string
      cover_url: string
      geo_address_json?: {
        full_address: string
        city: string
      }
      timezone: string
      url: string
    }
    tags: Array<{
      name: string
    }>
  }>
  has_more: boolean
  next_cursor?: string
}

export class LumaApiClient {
  private apiKey: string
  private baseUrl = "https://public-api.luma.com/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getEventGuests(eventApiId: string): Promise<LumaGuest[]> {
    try {
      console.log(`[v0] Fetching guests for event: ${eventApiId}`)

      const url = new URL(`${this.baseUrl}/event/get-guests`)
      url.searchParams.append("event_api_id", eventApiId)
      url.searchParams.append("approval_status", "approved")

      const response = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          "x-luma-api-key": this.apiKey,
        },
      })

      console.log(`[v0] Guest API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[v0] Guest API error response:`, errorText)
        return []
      }

      const data = await response.json()
      console.log(`[v0] Fetched ${data.entries?.length || 0} guests`)

      if (data.entries && data.entries.length > 0) {
        console.log(`[v0] First guest data:`, JSON.stringify(data.entries[0], null, 2))
      }

      return (data.entries || []).map((entry: any) => ({
        id: entry.guest?.id || entry.api_id,
        name: entry.guest?.name || "Guest",
        user_name: entry.guest?.user_name,
        user_first_name: entry.guest?.user_first_name,
        user_last_name: entry.guest?.user_last_name,
        avatar_url: entry.guest?.avatar_url,
        approval_status: entry.guest?.approval_status || "approved",
      }))
    } catch (error) {
      console.error(`[v0] Failed to fetch guests for event ${eventApiId}:`, error)
      return []
    }
  }

  async getEvents(limit = 50): Promise<LumaEvent[]> {
    try {
      // Calculate date range for next 4 weeks
      const now = new Date()
      const fourWeeksFromNow = new Date()
      fourWeeksFromNow.setDate(now.getDate() + 28)

      const startDate = now.toISOString()
      const endDate = fourWeeksFromNow.toISOString()

      console.log("[v0] Fetching events from Luma API for date range:", { startDate, endDate })

      const url = new URL(`${this.baseUrl}/calendar/list-events`)
      url.searchParams.append("after", startDate)
      url.searchParams.append("before", endDate)
      url.searchParams.append("sort_column", "start_at")

      const response = await fetch(url.toString(), {
        headers: {
          accept: "application/json",
          "x-luma-api-key": this.apiKey,
        },
      })

      console.log("[v0] Luma API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Luma API error response:", errorText)
        throw new Error(`Luma API error: ${response.status} - ${errorText}`)
      }

      const data: LumaApiResponse = await response.json()
      console.log("[v0] Luma API returned", data.entries?.length || 0, "events")

      const events: LumaEvent[] = (data.entries || []).map((entry) => ({
        id: entry.event.id,
        name: entry.event.name,
        description: entry.event.description,
        start_at: entry.event.start_at,
        end_at: entry.event.end_at,
        cover_url: entry.event.cover_url,
        url: entry.event.url,
        api_id: entry.api_id, // Added api_id mapping
        hosts: [{ name: "Event Organizer" }], // Default since hosts aren't in the API response
        tags: entry.tags || [],
      }))

      events.forEach((event, index) => {
        console.log(`[v0] Event ${index + 1}: ${event.name} - ${event.start_at}`)
      })

      console.log("[v0] Returning", events.length, "events")

      return events
    } catch (error) {
      console.error("[v0] Failed to fetch Luma events:", error)
      return []
    }
  }
}
