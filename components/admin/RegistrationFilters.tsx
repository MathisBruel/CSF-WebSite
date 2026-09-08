'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Exhibition {
  id: string
  title: string
}

export function RegistrationFilters({
  exhibitions,
  currentExpo,
  currentFilter,
}: {
  exhibitions: Exhibition[]
  currentExpo?: string
  currentFilter?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (currentExpo) params.set('expo', currentExpo)
      if (currentFilter) params.set('filter', currentFilter)
      if (search) params.set('search', search)

      const queryString = params.toString()
      router.push(`/admin/inscriptions${queryString ? '?' + queryString : ''}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, currentExpo, currentFilter, router])

  const handleExhibitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const expoId = e.target.value
    const params = new URLSearchParams()
    if (expoId) params.set('expo', expoId)
    if (search) params.set('search', search)
    if (currentFilter) params.set('filter', currentFilter)

    const queryString = params.toString()
    router.push(`/admin/inscriptions${queryString ? '?' + queryString : ''}`)
  }

  const getFilterUrl = (filter?: string) => {
    const params = new URLSearchParams()
    if (filter) params.set('filter', filter)
    if (currentExpo) params.set('expo', currentExpo)
    if (search) params.set('search', search)
    const queryString = params.toString()
    return `/admin/inscriptions${queryString ? '?' + queryString : ''}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <a
          href={getFilterUrl()}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !currentFilter && !currentExpo && !search ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
          }`}
        >
          Toutes
        </a>
        <a
          href={getFilterUrl('pending')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            currentFilter === 'pending' ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
          }`}
        >
          En attente
        </a>
        <select
          value={currentExpo || ''}
          onChange={handleExhibitionChange}
          className="ml-auto form-select text-sm py-1.5 w-64"
        >
          <option value="">Toutes les expositions</option>
          {exhibitions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
        {currentExpo && (
          <a
            href={`/api/admin/exhibitions/${currentExpo}/export`}
            className="btn-primary text-sm py-1.5 px-4"
          >
            Exporter CSV
          </a>
        )}
      </div>
      <input
        type="text"
        placeholder="Chercher par chat, éleveur, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="form-input w-full text-sm py-2 px-3"
      />
    </div>
  )
}
