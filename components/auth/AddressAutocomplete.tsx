'use client'

import { useState, useRef, useEffect } from 'react'

interface Feature {
  properties: {
    label: string
    name: string
    postcode: string
    city: string
  }
}

interface Props {
  value: string
  onChange: (val: string) => void
  onSelect: (data: { address: string; postalCode: string; city: string; country: string }) => void
  className?: string
}

export function AddressAutocomplete({ value, onChange, onSelect, className }: Props) {
  const [suggestions, setSuggestions] = useState<Feature[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`
        )
        const json = await res.json()
        const features: Feature[] = json.features || []
        setSuggestions(features)
        setOpen(features.length > 0)
      } catch {
        // ignore network errors
      }
    }, 300)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); search(e.target.value) }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={className}
        placeholder="10 rue de la Paix"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-800 border-b border-gray-100 last:border-0"
              onMouseDown={(e) => {
                e.preventDefault()
                const p = s.properties
                onChange(p.name)
                onSelect({ address: p.name, postalCode: p.postcode, city: p.city, country: 'France' })
                setSuggestions([])
                setOpen(false)
              }}
            >
              {s.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
