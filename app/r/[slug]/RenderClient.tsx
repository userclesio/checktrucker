'use client'

import { useEffect, useRef, useState } from 'react'

interface RenderClientProps {
  link: {
    id: string
    url: string
    pixelId?: string
    fbToken?: string
    value: number
    currency: string
  }
  globalSettings: {
    pixelId: string
    fbToken: string
  }
}

// localStorage keys — one per link per event type
function lsKey(linkId: string, type: string) {
  return `ct_${type}_${linkId}`
}

function alreadyFired(linkId: string, type: string): boolean {
  try {
    return localStorage.getItem(lsKey(linkId, type)) === '1'
  } catch {
    return false
  }
}

function markFired(linkId: string, type: string) {
  try {
    localStorage.setItem(lsKey(linkId, type), '1')
  } catch {}
}

export default function RenderClient({ link, globalSettings }: RenderClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const purchaseFired = useRef(false)
  const checkoutFired = useRef(false)
  const iframeLoadCount = useRef(0)
  const [iframeError, setIframeError] = useState(false)

  const effectivePixelId = link.pixelId || globalSettings.pixelId
  const effectiveFbToken = link.fbToken || globalSettings.fbToken

  // Fire-and-forget event logger — skips if device already sent this event
  function logEvent(type: string, source?: string) {
    if (alreadyFired(link.id, type)) return
    markFired(link.id, type)
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId: link.id, type, source }),
    }).catch(() => {})
  }

  // Browser pixel + Conversions API
  function fbTrack(eventName: string, data?: Record<string, unknown>) {
    if (effectivePixelId && typeof (window as any).fbq === 'function') {
      ;(window as any).fbq('track', eventName, data ?? {})
    }
    if (effectivePixelId && effectiveFbToken) {
      fetch('/api/fb-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelId: effectivePixelId,
          fbToken: effectiveFbToken,
          eventName,
          eventData: data,
        }),
      }).catch(() => {})
    }
  }

  function firePurchase(source: string) {
    if (purchaseFired.current) return
    purchaseFired.current = true
    // Purchase fires every real conversion — no dedup here
    // (a device can buy more than once, just not in the same session)
    fbTrack('Purchase', { value: link.value, currency: link.currency })
    logEvent('Purchase', source)
  }

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
    document.body.style.width = '100vw'

    return () => {
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.width = ''
    }
  }, [])

  useEffect(() => {
    // Strategy C: URL param check — immediate purchase fire
    const params = new URLSearchParams(window.location.search)
    if (params.get('purchase') === '1' || params.get('order') === 'success') {
      setTimeout(() => firePurchase('url-param'), 300)
    }

    // Strategy A: postMessage listener
    const msgHandler = (e: MessageEvent) => {
      if (!e.data) return
      const d = e.data as Record<string, unknown>
      if (d.event === 'purchase' || d.type === 'order_complete' || d.status === 'paid') {
        firePurchase('postmessage')
      }
    }
    window.addEventListener('message', msgHandler)

    // Initialize Facebook Pixel
    if (effectivePixelId) {
      const w = window as any
      if (!w.fbq) {
        const n = function (...args: unknown[]) {
          if (n.callMethod) n.callMethod.apply(n, args)
          else n.queue.push(args)
        } as any
        n.callMethod = null
        n.queue = []
        n.push = n
        n.loaded = true
        n.version = '2.0'
        w.fbq = n
        w._fbq = n
      }

      if (!document.querySelector('script[src*="fbevents"]')) {
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        script.onload = () => {
          ;(window as any).fbq('init', effectivePixelId)
          // Only fire browser PageView if device hasn't fired it yet
          if (!alreadyFired(link.id, 'PageView')) {
            ;(window as any).fbq('track', 'PageView')
          }
        }
        document.head.appendChild(script)
      }
    }

    // PageView — only if not already fired on this device
    logEvent('PageView', 'direct')

    // InitiateCheckout — only if not already fired on this device
    if (!checkoutFired.current) {
      checkoutFired.current = true
      setTimeout(() => {
        if (!alreadyFired(link.id, 'InitiateCheckout')) {
          fbTrack('InitiateCheckout', { value: link.value, currency: link.currency })
        }
        logEvent('InitiateCheckout', 'direct')
      }, 500)
    }

    return () => {
      window.removeEventListener('message', msgHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Strategy B: iframe reload counter
  const handleIframeLoad = () => {
    iframeLoadCount.current++
    if (iframeLoadCount.current > 1 && checkoutFired.current) {
      setTimeout(() => firePurchase('iframe-reload'), 1500)
    }
  }

  // Detect iframe block via timeout heuristic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeLoadCount.current === 0) setIframeError(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#080808',
      }}
    >
      <iframe
        ref={iframeRef}
        src={link.url}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        onLoad={handleIframeLoad}
        allow="payment *; fullscreen *; camera *; microphone *; geolocation *"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-downloads"
        title="Checkout"
      />

      {iframeError && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#080808',
            gap: '16px',
          }}
        >
          <p style={{ color: '#888', fontSize: '14px' }}>
            The checkout page could not be embedded.
          </p>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#b8f724',
              color: '#000',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Open Checkout →
          </a>
        </div>
      )}

      {!iframeError && (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.5)',
            color: '#888',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            textDecoration: 'none',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          title="Open checkout directly"
        >
          Open directly ↗
        </a>
      )}
    </div>
  )
}
