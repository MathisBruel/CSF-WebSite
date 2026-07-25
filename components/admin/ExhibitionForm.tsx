'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import { TinyMCEEditor } from '@/components/ui/TinyMCEEditor'
import { ImageUpload } from '@/components/ui/ImageUpload'

type FormData = {
  title: string
  description: string
  location: string
  address: string
  city: string
  startDate: string
  endDate: string
  registrationDeadline: string
  maxRegistrations: number | null
  rules: string
  coverImage?: string
}

export function ExhibitionForm({
  expoId,
  defaultValues,
}: {
  expoId?: string
  defaultValues?: Partial<FormData>
}) {
  const router = useRouter()
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues,
  })

  const title = watch('title', '')

  const onSubmit = async (data: FormData) => {
    setError('')
    const payload = {
      ...data,
      slug: slugify(data.title),
      maxRegistrations: data.maxRegistrations || null,
    }
    const res = await fetch(expoId ? `/api/admin/exhibitions/${expoId}` : '/api/admin/exhibitions', {
      method: expoId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Erreur lors de la sauvegarde')
      return
    }
    router.push('/admin/expositions')
    router.refresh()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* ── Infos générales ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Informations générales</h2>
        <div>
          <Controller name="coverImage" control={control}
            render={({ field }) => (
              <ImageUpload value={field.value as string} onChange={field.onChange}
                category="exhibition" label="Image de couverture" />
            )} />
        </div>
        <div>
          <label className="form-label">Titre <span className="text-red-500">*</span></label>
          <input {...register('title', { required: 'Titre requis' })} className="form-input"
            placeholder="Exposition Féline de Printemps 2026" />
          {title && <p className="text-xs text-csf-muted mt-1">Slug: {slugify(title)}</p>}
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="form-label">Description</label>
          <Controller name="description" control={control}
            render={({ field }) => (
              <TinyMCEEditor value={field.value || ''} onChange={field.onChange}
                placeholder="Description de l'exposition..." height={300} />
            )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Salle / Lieu <span className="text-red-500">*</span></label>
            <input {...register('location', { required: true })} className="form-input" placeholder="Espace Tête d'Or" />
          </div>
          <div>
            <label className="form-label">Ville <span className="text-red-500">*</span></label>
            <input {...register('city', { required: true })} className="form-input" placeholder="Lyon" />
          </div>
        </div>
        <div>
          <label className="form-label">Adresse complète</label>
          <input {...register('address')} className="form-input" placeholder="5 Allée de la Combe" />
        </div>
      </div>

      {/* ── Dates ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Dates</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="form-label">Début <span className="text-red-500">*</span></label>
            <input {...register('startDate', { required: true })} type="datetime-local" className="form-input" />
          </div>
          <div>
            <label className="form-label">Fin <span className="text-red-500">*</span></label>
            <input {...register('endDate', { required: true })} type="datetime-local" className="form-input" />
          </div>
          <div>
            <label className="form-label">Clôture inscriptions <span className="text-red-500">*</span></label>
            <input {...register('registrationDeadline', { required: true })} type="datetime-local" className="form-input" />
          </div>
        </div>
      </div>

      {/* ── Capacité ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-csf-dark mb-3">Capacité</h2>
        <div className="w-48">
          <label className="form-label">Places maximum (chats)</label>
          <input {...register('maxRegistrations', { valueAsNumber: true })} type="number" min="1"
            className="form-input" placeholder="Illimité" />
        </div>
        <p className="text-xs text-csf-muted mt-2">Les tarifs sont définis globalement dans la section <strong>Tarifs</strong>.</p>
      </div>

      {/* ── Règlement ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Règlement</h2>
        <Controller name="rules" control={control}
          render={({ field }) => (
            <TinyMCEEditor value={field.value || ''} onChange={field.onChange}
              placeholder="Conditions de participation, vaccins obligatoires..." height={400} />
          )} />
      </div>

      <div className="flex gap-3">
        <Link href="/admin/expositions" className="btn-secondary flex-1 text-center">Annuler</Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Sauvegarde...' : expoId ? 'Mettre à jour' : "Créer l'exposition"}
        </button>
      </div>
    </form>
  )
}
