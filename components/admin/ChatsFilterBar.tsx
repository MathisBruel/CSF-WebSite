'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Owner = { id: string; label: string }

export function ChatsFilterBar({
  owners,
  defaultQ,
  defaultExposantId,
}: {
  owners: Owner[]
  defaultQ: string
  defaultExposantId: string
}) {
  const router = useRouter()
  const [q, setQ] = useState(defaultQ)
  const [exposantId, setExposantId] = useState(defaultExposantId)
  const [inputText, setInputText] = useState(
    owners.find((o) => o.id === defaultExposantId)?.label ?? ''
  )
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  useEffect(() => {
    setInputText(owners.find((o) => o.id === exposantId)?.label ?? '')
  }, [exposantId, owners])

  const filtered = inputText
    ? owners.filter((o) => o.label.toLowerCase().includes(inputText.toLowerCase())).slice(0, 60)
    : owners.slice(0, 60)

  const submit = useCallback((nextQ: string, nextExposantId: string) => {
    const params = new URLSearchParams()
    if (nextQ) params.set('q', nextQ)
    if (nextExposantId) params.set('exposant', nextExposantId)
    router.push(`/admin/chats${params.toString() ? `?${params}` : ''}`)
  }, [router])

  const select = (owner: Owner) => {
    setExposantId(owner.id)
    setInputText(owner.label)
    setOpen(false)
    setHighlighted(0)
    submit(q, owner.id)
  }

  const clearExposant = () => {
    setExposantId('')
    setInputText('')
    submit(q, '')
  }

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      if (!inputText) { if (exposantId) clearExposant(); return }
      const match = owners.find((o) => o.label.toLowerCase() === inputText.toLowerCase())
      if (match) {
        if (match.id !== exposantId) select(match)
      } else {
        setInputText(owners.find((o) => o.id === exposantId)?.label ?? '')
      }
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]) }
    else if (e.key === 'Escape') { setOpen(false); setInputText(owners.find((o) => o.id === exposantId)?.label ?? '') }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-start">
      <form
        className="flex-1 min-w-[220px]"
        onSubmit={(e) => { e.preventDefault(); submit(q, exposantId) }}
      >
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un chat (nom, race, robe, ICAD, pedigree)..."
          className="form-input text-sm py-1.5 w-full"
        />
      </form>

      <div className="relative w-64">
        <input
          type="text"
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setOpen(true); setHighlighted(0) }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Filtrer par exposant..."
          autoComplete="off"
          className="form-input text-sm py-1.5 w-full pr-7"
        />
        {exposantId && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clearExposant() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-csf-muted hover:text-csf-dark text-sm"
            aria-label="Effacer le filtre exposant"
          >
            ×
          </button>
        )}
        {open && filtered.length > 0 && (
          <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto mt-1">
            {filtered.map((owner, i) => (
              <li
                key={owner.id}
                onMouseDown={() => select(owner)}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  i === highlighted ? 'bg-orange-50 text-csf-orange font-medium' :
                  owner.id === exposantId ? 'text-csf-orange' : 'text-csf-dark hover:bg-gray-50'
                }`}
              >
                {owner.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
