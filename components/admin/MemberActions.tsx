'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Role } from '@prisma/client'

export function MemberActions({ memberId, active, role }: { memberId: string; active: boolean; role: Role }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    await fetch(`/api/admin/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipActive: !active }),
    })
    setLoading(false)
    router.refresh()
  }

  const changeRole = async (newRole: Role) => {
    setLoading(true)
    await fetch(`/api/admin/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
          active
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}>
        {active ? 'Suspendre' : 'Valider'}
      </button>
      {role !== 'ADMIN' && (
        <select
          value={role}
          onChange={(e) => changeRole(e.target.value as Role)}
          disabled={loading}
          className="text-xs border border-gray-300 rounded-lg px-2 py-1 text-csf-dark focus:outline-none">
          <option value="ADHERENT_CLUB">Adhérent</option>
          <option value="MEMBRE_ACTIF">Membre Actif</option>
          <option value="ADMIN">Admin</option>
        </select>
      )}
    </div>
  )
}
