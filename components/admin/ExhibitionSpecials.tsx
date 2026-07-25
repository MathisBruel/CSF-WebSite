'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Special = { id: string; name: string }

export function ExhibitionSpecials({
  exhibitionId,
  initialSpecials,
}: {
  exhibitionId: string
  initialSpecials: Special[]
}) {
  const router = useRouter()
  const [specials, setSpecials] = useState<Special[]>(initialSpecials)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  const add = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const res = await fetch(`/api/admin/exhibitions/${exhibitionId}/specials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      const sp = await res.json()
      setSpecials((prev) => [...prev, sp])
      setNewName('')
      router.refresh()
    }
    setLoading(false)
  }

  const remove = async (specialId: string) => {
    setLoading(true)
    await fetch(`/api/admin/exhibitions/${exhibitionId}/specials`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialId }),
    })
    setSpecials((prev) => prev.filter((s) => s.id !== specialId))
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-bold text-csf-dark">Spéciaux de race</h2>
      <p className="text-sm text-csf-muted">
        Les spéciaux ajoutés ici seront proposés aux exposants lors de leur inscription.
      </p>

      <div className="space-y-2">
        {specials.length === 0 && (
          <p className="text-sm text-csf-muted italic">Aucun spécial défini.</p>
        )}
        {specials.map((sp) => (
          <div key={sp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-csf-dark">{sp.name}</span>
            <button
              onClick={() => remove(sp.id)}
              disabled={loading}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="form-input flex-1"
          placeholder="Ex : Spécial Maine Coon"
          disabled={loading}
        />
        <button
          onClick={add}
          disabled={loading || !newName.trim()}
          className="btn-primary text-sm"
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}
