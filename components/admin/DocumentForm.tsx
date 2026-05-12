'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

type FormData = {
  title: string
  description: string
  category: string
  public: boolean
}

export function DocumentForm({
  docId,
  fileName,
  defaultValues,
}: {
  docId?: string
  fileName?: string
  defaultValues?: Partial<FormData>
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      public: true,
      category: 'general',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await fetch(docId ? `/api/admin/documents/${docId}` : '', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error || 'Erreur lors de la sauvegarde')
        return
      }
      router.push('/admin/documents')
      router.refresh()
    } catch (err) {
      setError('Erreur réseau')
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Informations du document</h2>
        {fileName && (
          <div>
            <label className="form-label">Fichier</label>
            <p className="text-sm text-csf-dark">{fileName}</p>
          </div>
        )}
        <div>
          <label className="form-label">Titre <span className="text-red-500">*</span></label>
          <input
            {...register('title', { required: 'Titre requis' })}
            className="form-input"
            placeholder="Titre du document"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea
            {...register('description')}
            className="form-textarea"
            rows={3}
            placeholder="Description du document..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Catégorie</label>
            <select {...register('category')} className="form-select">
              <option value="general">Général</option>
              <option value="rules">Règlements</option>
              <option value="forms">Formulaires</option>
              <option value="guides">Guides</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                {...register('public')}
                type="checkbox"
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-csf-dark">Public</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/documents" className="btn-secondary flex-1 text-center">
          Annuler
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Sauvegarde...' : docId ? 'Mettre à jour' : 'Créer le document'}
        </button>
      </div>
    </form>
  )
}
