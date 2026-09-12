'use client'

import { useEffect } from 'react'
import { GAEvents } from '@/lib/ga-events'

interface PageViewTrackerProps {
  type: 'exhibition' | 'article' | 'document'
  id: string
  title?: string
}

export function PageViewTracker({ type, id, title }: PageViewTrackerProps) {
  useEffect(() => {
    if (type === 'exhibition') {
      GAEvents.exhibitionView(id)
    } else if (type === 'article') {
      GAEvents.newsArticleView(id)
    }
  }, [type, id])

  return null
}
