'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type LoofJudge = {
  firstName: string
  lastName: string
  photoUrl: string | null
  region: string | null
  breeds: string | null
  role: string | null
}

type ExpoJudge = {
  id: string
  firstName: string
  lastName: string
  photoUrl: string | null
  region: string | null
  breeds: string | null
  role: string | null
}

export function ExhibitionJudges({
  exhibitionId,
  initialJudges,
  initialComplete,
}: {
  exhibitionId: string
  initialJudges: ExpoJudge[]
  initialComplete: boolean
}) {
  const router = useRouter()
  const [judges, setJudges] = useState<ExpoJudge[]>(initialJudges)
  const [judgeListComplete, setJudgeListComplete] = useState(initialComplete)
  const [loofJudges, setLoofJudges] = useState<LoofJudge[]>([])
  const [loadingLoof, setLoadingLoof] = useState(false)
  const [loofError, setLoofError] = useState(false)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoadingLoof(true)
    setLoofError(false)
    fetch('/api/admin/loof-judges')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) setLoofJudges(data)
      })
      .catch(() => setLoofError(true))
      .finally(() => setLoadingLoof(false))
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const alreadyAdded = new Set(judges.map((j) => `${j.firstName}|${j.lastName}`))

  const filtered = loofJudges.filter((j) => {
    if (alreadyAdded.has(`${j.firstName}|${j.lastName}`)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      j.firstName.toLowerCase().includes(q) ||
      j.lastName.toLowerCase().includes(q) ||
      (j.region?.toLowerCase().includes(q) ?? false) ||
      (j.breeds?.toLowerCase().includes(q) ?? false)
    )
  })

  const addJudge = async (j: LoofJudge) => {
    setSaving(true)
    const res = await fetch(`/api/admin/exhibitions/${exhibitionId}/judges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(j),
    })
    if (res.ok) {
      const created: ExpoJudge = await res.json()
      setJudges((prev) => [...prev, created])
      setOpen(false)
      setSearch('')
      router.refresh()
    }
    setSaving(false)
  }

  const removeJudge = async (judgeId: string) => {
    setSaving(true)
    await fetch(`/api/admin/exhibitions/${exhibitionId}/judges`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judgeId }),
    })
    setJudges((prev) => prev.filter((j) => j.id !== judgeId))
    router.refresh()
    setSaving(false)
  }

  const toggleComplete = async () => {
    const next = !judgeListComplete
    setSaving(true)
    const res = await fetch(`/api/admin/exhibitions/${exhibitionId}/judges`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ judgeListComplete: next }),
    })
    if (res.ok) {
      setJudgeListComplete(next)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-csf-dark">Juges</h2>
          <p className="text-sm text-csf-muted">
            Liste issue de <a href="https://loof.asso.fr/juges-felins-loof-0" target="_blank" rel="noreferrer" className="underline">loof.asso.fr</a>
          </p>
        </div>
        <button
          onClick={toggleComplete}
          disabled={saving}
          className="flex items-center gap-2 group"
          title={judgeListComplete ? 'Liste complète' : 'Liste provisoire'}
        >
          <span className={`text-sm ${judgeListComplete ? 'text-green-700' : 'text-yellow-700'}`}>
            {judgeListComplete ? 'Liste complète' : 'Liste provisoire'}
          </span>
          <span
            className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ${
              judgeListComplete ? 'bg-green-500' : 'bg-yellow-400'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                judgeListComplete ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
        </button>
      </div>

      {/* Added judges list */}
      <div className="space-y-2">
        {judges.length === 0 && (
          <p className="text-sm text-csf-muted italic">Aucun juge ajouté.</p>
        )}
        {judges.map((j) => (
          <div key={j.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
            {j.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={j.photoUrl}
                alt={`${j.firstName} ${j.lastName}`}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-bold">
                {j.firstName[0]}{j.lastName[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-csf-dark">
                {j.firstName} {j.lastName}
              </p>
              <p className="text-xs text-csf-muted truncate">
                {[j.role, j.region].filter(Boolean).join(' · ')}
              </p>
            </div>
            <button
              onClick={() => removeJudge(j.id)}
              disabled={saving}
              className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0 px-1"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      {/* Judge selector */}
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            loadingLoof
              ? 'Chargement des juges LOOF…'
              : loofError
              ? 'Erreur de chargement — réessayez'
              : 'Rechercher un juge par nom, région ou race…'
          }
          disabled={saving}
          className="form-input w-full"
        />

        {open && !loadingLoof && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
            {loofError ? (
              <div className="p-4 text-sm text-red-500 text-center">
                Impossible de contacter loof.asso.fr
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-sm text-csf-muted text-center">
                {search ? 'Aucun juge trouvé' : 'Tous les juges ont été ajoutés'}
              </div>
            ) : (
              filtered.slice(0, 60).map((j) => (
                <button
                  key={`${j.firstName}|${j.lastName}`}
                  onClick={() => addJudge(j)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  {j.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={j.photoUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-bold">
                      {j.firstName[0]}{j.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-csf-dark">
                      {j.firstName} {j.lastName}
                    </p>
                    <p className="text-xs text-csf-muted truncate">
                      {[j.role, j.region].filter(Boolean).join(' · ')}
                    </p>
                    {j.breeds && (
                      <p className="text-xs text-csf-muted truncate opacity-70">{j.breeds}</p>
                    )}
                  </div>
                  <span className="text-xs text-csf-orange font-medium flex-shrink-0">+ Ajouter</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
