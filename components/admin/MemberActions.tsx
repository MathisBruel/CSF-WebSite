'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { MEMBER_STATUS_LABELS, type MemberStatus } from '@/lib/membership'

const STATUS_OPTIONS: MemberStatus[] = ['none', 'pending', 'active', 'admin']

export function MemberActions({ memberId, status }: { memberId: string; status: MemberStatus }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [confirmAdmin, setConfirmAdmin] = useState(false)

  const isSelf = session?.user?.id === memberId
  const isSelfAdmin = isSelf && status === 'admin'

  const applyStatus = async (newStatus: MemberStatus) => {
    setLoading(true)
    setConfirmAdmin(false)
    await fetch(`/api/admin/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(false)
    router.refresh()
  }

  const requestStatusChange = (newStatus: MemberStatus) => {
    if (newStatus === status) return
    if (isSelfAdmin) {
      alert('Vous ne pouvez pas retirer votre propre rôle administrateur.')
      return
    }
    if (newStatus === 'admin') {
      setConfirmAdmin(true)
      return
    }
    applyStatus(newStatus)
  }

  const handleDelete = async () => {
    if (isSelf) {
      alert('Vous ne pouvez pas supprimer votre propre compte.')
      return
    }
    if (!confirm('Voulez-vous vraiment supprimer ce membre ? Cette action est irréversible (ses chats et inscriptions seront supprimés).')) {
      return
    }

    setLoading(true)
    const res = await fetch(`/api/admin/members/${memberId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Erreur lors de la suppression')
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={loading || isSelf}
        title="Supprimer le membre"
        className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors bg-red-100 text-red-700 hover:bg-red-200 ${
          isSelf ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>

      {confirmAdmin ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-amber-600 font-medium">Confirmer Admin ?</span>
          <button
            onClick={() => applyStatus('admin')}
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
          value={status}
          onChange={(e) => requestStatusChange(e.target.value as MemberStatus)}
          disabled={loading || isSelfAdmin}
          className={`text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none ${
            status === 'admin'
              ? 'bg-amber-50 text-amber-700 border-amber-300 font-medium'
              : 'text-csf-dark'
          } ${isSelfAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{MEMBER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      )}
    </div>
  )
}
