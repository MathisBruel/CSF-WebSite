'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Role } from '@prisma/client'

export function MemberActions({ memberId, active, role }: { memberId: string; active: boolean; role: Role }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [confirmAdmin, setConfirmAdmin] = useState(false)

  const isSelf = session?.user?.id === memberId

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
    // Prevent self-demotion from admin
    if (isSelf && role === 'ADMIN' && newRole !== 'ADMIN') {
      alert('Vous ne pouvez pas retirer votre propre rôle administrateur.')
      return
    }

    // Confirm before promoting to admin
    if (newRole === 'ADMIN' && !confirmAdmin) {
      setConfirmAdmin(true)
      return
    }

    setLoading(true)
    setConfirmAdmin(false)
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

      {confirmAdmin ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-amber-600 font-medium">Confirmer Admin ?</span>
          <button
            onClick={() => changeRole('ADMIN' as Role)}
            className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600">
            Oui
          </button>
          <button
            onClick={() => setConfirmAdmin(false)}
            className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Non
          </button>
        </div>
      ) : (
        <select
          value={role}
          onChange={(e) => changeRole(e.target.value as Role)}
          disabled={loading || (isSelf && role === 'ADMIN')}
          className={`text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none ${
            role === 'ADMIN'
              ? 'bg-amber-50 text-amber-700 border-amber-300 font-medium'
              : 'text-csf-dark'
          } ${isSelf && role === 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <option value="ADHERENT_CLUB">Adhérent</option>
          <option value="MEMBRE_ACTIF">Membre Actif</option>
          <option value="ADMIN">Admin</option>
        </select>
      )}
    </div>
  )
}
