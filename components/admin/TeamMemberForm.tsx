'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import Link from 'next/link'
import { ImageUpload } from '@/components/ui/ImageUpload'

type FormData = {
  name: string
  role: string
  bio: string
  photoUrl: string | null
  active: boolean
  order: number
}

export function TeamMemberForm({
  memberId,
  defaultValues,
}: {
  memberId?: string
  defaultValues?: Partial<FormData>
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      active: true,
      order: 0,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await fetch(memberId ? `/api/admin/team/${memberId}` : '/api/admin/team', {
        method: memberId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error || 'Erreur lors de la sauvegarde')
        return
      }
      router.push('/admin/contenu')
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
        <h2 className="font-bold text-csf-dark">Informations du membre</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nom <span className="text-red-500">*</span></label>
            <input
              {...register('name', { required: 'Nom requis' })}
              className="form-input"
              placeholder="Nom complet"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Rôle <span className="text-red-500">*</span></label>
            <input
              {...register('role', { required: 'Rôle requis' })}
              className="form-input"
              placeholder="Président, Secrétaire, etc."
            />
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
        </div>
        <div>
          <label className="form-label">Biographie</label>
          <textarea
            {...register('bio')}
            className="form-textarea"
            rows={4}
            placeholder="Courte biographie du membre..."
          />
        </div>
        <div>
          <Controller
            name="photoUrl"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value || ''}
                onChange={field.onChange}
                category="team"
                label="Photo du membre"
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                {...register('active')}
                type="checkbox"
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-csf-dark">Actif</span>
            </label>
          </div>
          <div>
            <label className="form-label">Ordre d&apos;affichage</label>
            <input
              {...register('order', { valueAsNumber: true })}
              type="number"
              className="form-input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/admin/contenu" className="btn-secondary flex-1 text-center">
          Annuler
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Sauvegarde...' : memberId ? 'Mettre à jour' : 'Créer le membre'}
        </button>
      </div>
    </form>
  )
}
