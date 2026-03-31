// Type definitions matching the Prisma schema.
// File I/O has been replaced by Prisma + Supabase.

export interface Link {
  id: string
  slug: string
  name: string
  url: string
  pixelId?: string | null
  fbToken?: string | null
  value: number
  currency: string
  createdAt: string | Date
}

export interface Event {
  id: string
  linkId: string
  type: string
  source?: string | null
  timestamp: string | Date
  metadata?: Record<string, unknown> | null
}

export interface Settings {
  pixelId: string
  fbToken: string
}
