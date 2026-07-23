'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RegistrationActions({ registration, exhibitionSlug }: { registration: { id: string, status: string }, exhibitionSlug: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette inscription ? Cette action est irréversible.`)) {
      setIsDeleting(true)
      try {
        const res = await fetch(`/api/registrations/${registration.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          throw new Error('Failed to delete registration')
        }
        
        if (registration.status === 'REJECTED') {
          router.push(`/expositions/${exhibitionSlug}`)
        } else {
          router.refresh()
        }

      } catch (error) {
        console.error(error)
        alert('Une erreur est survenue lors de la suppression.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-csf-light flex justify-end">
      {['PENDING', 'VALIDATED', 'WAITING_DOCS'].includes(registration.status) && (
        <button onClick={handleDelete} disabled={isDeleting} className="btn-secondary-outline">
          {isDeleting ? 'Annulation...' : 'Annuler mon inscription'}
        </button>
      )}
      {registration.status === 'REJECTED' && (
        <button onClick={handleDelete} disabled={isDeleting} className="btn-primary">
          {isDeleting ? 'Suppression...' : 'Supprimer et se réinscrire'}
        </button>
      )}
    </div>
  )
}
