'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: '/links',
    label: 'Links',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7.5 10.5a4 4 0 005.657 0l2-2a4 4 0 00-5.657-5.657l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10.5 7.5a4 4 0 00-5.657 0l-2 2a4 4 0 005.657 5.657l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/events',
    label: 'Events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 1.5v1.8M9 14.7v1.8M1.5 9h1.8M14.7 9h1.8M3.4 3.4l1.27 1.27M13.33 13.33l1.27 1.27M14.6 3.4l-1.27 1.27M4.67 13.33l-1.27 1.27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface border-r border-border fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold text-sm"
              style={{ background: '#b8f724' }}
            >
              CT
            </div>
            <span className="font-semibold text-primary tracking-tight">CheckTrack</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group"
                    style={{
                      color: active ? '#b8f724' : '#888888',
                      background: active ? 'rgba(184,247,36,0.08)' : 'transparent',
                    }}
                  >
                    <span
                      className="transition-colors"
                      style={{ color: active ? '#b8f724' : '#555555' }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[11px] text-muted">
            {/* TODO: Add user auth here */}
            Single-user mode
          </p>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border" style={{ background: '#0f0f0f' }}>
        <ul className="flex">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
                  style={{ color: active ? '#b8f724' : '#555' }}
                >
                  <span style={{ color: active ? '#b8f724' : '#555' }}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
