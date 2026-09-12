'use client'

import { useCallback } from 'react'
import { GAEvents } from '@/lib/ga-events'

interface DownloadLinkProps {
  href: string
  filename: string
  children: React.ReactNode
  className?: string
}

export function DownloadLink({
  href,
  filename,
  children,
  className,
}: DownloadLinkProps) {
  const handleClick = useCallback(() => {
    GAEvents.download(filename)
  }, [filename])

  return (
    <a href={href} download className={className} onClick={handleClick}>
      {children}
    </a>
  )
}
