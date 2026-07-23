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
  priceBase: number
  priceCage: number
  priceDoubleCage: number
  priceMeal: number
  maxRegistrations: number | null
  rules: string
  coverImage?: string
}

type PricingTier = { minCats: number; pricePerCat: number }

export function ExhibitionForm({
  expoId,
  defaultValues,
  defaultPricingTiers,
}: {
  expoId?: string
  defaultValues?: Partial<FormData>
  defaultPricingTiers?: PricingTier[]
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(
    defaultPricingTiers ?? []
  )

  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      priceBase: 35, priceCage: 15, priceDoubleCage: 25, priceMeal: 12,
      ...defaultValues,
    },
  })

  const title = watch('title', '')

  const addTier = () => {
    const maxMin = pricingTiers.reduce((m, t) => Math.max(m, t.minCats), 0)
    setPricingTiers([...pricingTiers, { minCats: maxMin + 1, pricePerCat: 0 }])
  }

  const removeTier = (idx: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== idx))
  }

  const updateTier = (idx: number, field: keyof PricingTier, value: number) => {
    setPricingTiers(pricingTiers.map((t, i) => i === idx ? { ...t, [field]: value } : t))
  }

  const sortedTiers = [...pricingTiers].sort((a, b) => a.minCats - b.minCats)

  const onSubmit = async (data: FormData) => {
    setError('')
    const payload = {
      ...data,
      slug: slugify(data.title),
      maxRegistrations: data.maxRegistrations || null,
      pricingTiers: sortedTiers.filter((t) => t.minCats >= 1 && t.pricePerCat >= 0),
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Informations générales</h2>
        <div>
          <Controller
            name="coverImage"
            control={control}
            render={({ field }) => (
              <ImageUpload
                value={field.value as string}
                onChange={field.onChange}
                category="exhibition"
                label="Image de couverture"
              />
            )}
          />
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
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TinyMCEEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Description de l&apos;exposition..."
                height={300}
              />
            )}
          />
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Tarifs (€)</h2>

        {/* Fixed costs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'priceBase', label: 'Inscription de base (par chat)' },
            { name: 'priceCage', label: 'Cage simple' },
            { name: 'priceDoubleCage', label: 'Cage double' },
            { name: 'priceMeal', label: 'Repas' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="form-label">{label}</label>
              <input
                {...register(name as keyof FormData, { valueAsNumber: true })}
                type="number" step="0.01" min="0" className="form-input" />
            </div>
          ))}
        </div>
        <p className="text-xs text-csf-muted">
          Le prix de base est utilisé quand aucun palier dégressif ne s&apos;applique.
        </p>

        {/* Degressive pricing tiers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-csf-dark text-sm">Tarification dégressive par nombre de chats</h3>
              <p className="text-xs text-csf-muted">Le palier avec le plus grand nombre de chats s&apos;applique automatiquement en &quot;X+&quot;.</p>
            </div>
          </div>

          {sortedTiers.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-csf-muted px-1">
                <span>À partir de X chats</span>
                <span>Prix / chat (€)</span>
                <span />
              </div>
              {sortedTiers.map((tier, idx) => {
                const originalIdx = pricingTiers.indexOf(tier)
                const isLast = idx === sortedTiers.length - 1
                return (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={tier.minCats}
                        onChange={(e) => updateTier(originalIdx, 'minCats', parseInt(e.target.value) || 1)}
                        className="form-input"
                      />
                      <span className="text-sm text-csf-muted whitespace-nowrap">
                        {isLast ? `chat${tier.minCats > 1 ? 's' : ''} et +` : `chat${tier.minCats > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.pricePerCat}
                      onChange={(e) => updateTier(originalIdx, 'pricePerCat', parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeTier(originalIdx)}
                      className="px-2 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm">
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <button
            type="button"
            onClick={addTier}
            className="text-sm text-csf-orange hover:text-csf-orange-dark font-medium flex items-center gap-1 transition-colors">
            + Ajouter un palier
          </button>
        </div>

        <div className="w-48">
          <label className="form-label">Places maximum</label>
          <input {...register('maxRegistrations', { valueAsNumber: true })} type="number" min="1"
            className="form-input" placeholder="Illimité" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-csf-dark">Règlement</h2>
        <Controller
          name="rules"
          control={control}
          render={({ field }) => (
            <TinyMCEEditor
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="Conditions de participation, vaccins obligatoires..."
              height={400}
            />
          )}
        />
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
