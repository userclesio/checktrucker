'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[9999] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-enter pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
            style={{
              background:
                toast.type === 'success'
                  ? '#b8f724'
                  : toast.type === 'error'
                  ? '#ef4444'
                  : '#1a1a1a',
              color: toast.type === 'success' ? '#000' : '#e8e5e0',
              border: toast.type === 'info' ? '1px solid #2a2a2a' : 'none',
            }}
          >
            {toast.type === 'success' && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {toast.type === 'error' && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v6M7 10v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
