'use client'

import { useEffect, useState } from 'react'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const consent = localStorage.getItem('ga-consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ga-consent', 'accepted')
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    }
    setShow(false)
  }

  const handleReject = () => {
    localStorage.setItem('ga-consent', 'rejected')
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      })
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Nous utilisons Google Analytics pour comprendre comment vous utilisez notre site et améliorer votre expérience.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-csf-dark rounded-lg hover:bg-csf-dark/90"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
