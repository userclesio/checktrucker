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

export default function RenderClient({ link, globalSettings }: RenderClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const purchaseFired = useRef(false)
  const checkoutFired = useRef(false)
  const iframeLoadCount = useRef(0)
  const [iframeError, setIframeError] = useState(false)

  const effectivePixelId = link.pixelId || globalSettings.pixelId
  const effectiveFbToken = link.fbToken || globalSettings.fbToken

  // Fire-and-forget event logger
  function logEvent(type: string, source?: string) {
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
    fbTrack('Purchase', { value: link.value, currency: link.currency })
    logEvent('Purchase', source)
  }

  useEffect(() => {
    // Remove body margin/padding so iframe fills the screen
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
      // Pixel init first, then purchase
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
      // Inject fbq stub
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

      // Load fbevents.js
      if (!document.querySelector('script[src*="fbevents"]')) {
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        script.onload = () => {
          ;(window as any).fbq('init', effectivePixelId)
          ;(window as any).fbq('track', 'PageView')
        }
        document.head.appendChild(script)
      } else {
        if (typeof (window as any).fbq === 'function') {
          ;(window as any).fbq('init', effectivePixelId)
          ;(window as any).fbq('track', 'PageView')
        }
      }
    }

    // Log PageView to DB
    logEvent('PageView', 'direct')

    // Fire InitiateCheckout
    if (!checkoutFired.current) {
      checkoutFired.current = true
      // Short delay to let fbq load
      setTimeout(() => {
        fbTrack('InitiateCheckout', { value: link.value, currency: link.currency })
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

  // Detect iframe block via error + timeout heuristic
  useEffect(() => {
    const timer = setTimeout(() => {
      // If the iframe didn't load at all after 8s, show fallback hint
      if (iframeLoadCount.current === 0) {
        setIframeError(true)
      }
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
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        onLoad={handleIframeLoad}
        allow="payment *; fullscreen *; camera *; microphone *; geolocation *"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-downloads"
        title="Checkout"
      />

      {/* Fallback: shown if iframe is blocked or slow */}
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

      {/* Subtle "open directly" escape hatch — always visible */}
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
            transition: 'color 0.2s',
          }}
          title="Open checkout directly"
        >
          Open directly ↗
        </a>
      )}
    </div>
  )
}
