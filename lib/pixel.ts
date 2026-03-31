export interface ConversionPayload {
  pixelId: string
  fbToken: string
  eventName: string
  eventData?: Record<string, unknown>
}

export async function sendFBConversion(payload: ConversionPayload): Promise<void> {
  const { pixelId, fbToken, eventName, eventData = {} } = payload

  if (!pixelId || !fbToken) return

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events`

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        ...eventData,
      },
    ],
    access_token: fbToken,
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
