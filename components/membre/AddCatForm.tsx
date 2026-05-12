'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  breed: z.string().min(1, 'Race requise'),
  color: z.string().optional(),
  gender: z.enum(['Mâle', 'Femelle']),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  icadNumber: z.string().optional(),
  pedigreeNumber: z.string().optional(),
  neutered: z.boolean().default(false),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const BREEDS = [
  'Abyssin', 'Bengal', 'Birman', 'British Shorthair', 'Chartreux', 'Devon Rex',
  'Exotic Shorthair', 'Maine Coon', 'Norvégien', 'Persan', 'Ragdoll', 'Sacré de Birmanie',
  'Siamois', 'Sibérien', 'Sphynx', 'Autre',
]

export function AddCatForm({ catId }: { catId?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'Mâle', neutered: false },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const res = await fetch(catId ? `/api/cats/${catId}` : '/api/cats', {
      method: catId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Erreur lors de la sauvegarde')
      return
    }
    router.push('/membre/chats')
    router.refresh()
  }

  return (
    <form className="card space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="form-label">Nom du chat <span className="text-red-500">*</span></label>
          <input {...register('name')} className="form-input" placeholder="Apollon du Soleil Levant" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="form-label">Race <span className="text-red-500">*</span></label>
          <select {...register('breed')} className="form-select">
            <option value="">Choisir une race</option>
            {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>}
        </div>

        <div>
          <label className="form-label">Couleur / Robe</label>
          <input {...register('color')} className="form-input" placeholder="Brown tabby" />
        </div>

        <div>
          <label className="form-label">Sexe <span className="text-red-500">*</span></label>
          <select {...register('gender')} className="form-select">
            <option value="Mâle">Mâle</option>
            <option value="Femelle">Femelle</option>
          </select>
        </div>

        <div>
          <label className="form-label">Date de naissance <span className="text-red-500">*</span></label>
          <input {...register('birthDate')} type="date" className="form-input" />
          {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label className="form-label">Numéro I-CAD (puce)</label>
          <input {...register('icadNumber')} className="form-input" placeholder="250269811234567" />
        </div>

        <div>
          <label className="form-label">Numéro de pedigree</label>
          <input {...register('pedigreeNumber')} className="form-input" placeholder="LOOF-XXXX-XX-XXXXX" />
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('neutered')} type="checkbox" className="w-4 h-4 rounded text-csf-orange" />
            <span className="text-sm text-csf-dark">Chat castré / stérilisé</span>
          </label>
        </div>

        <div className="col-span-2">
          <label className="form-label">Notes</label>
          <textarea {...register('notes')} className="form-textarea" placeholder="Informations complémentaires..." rows={3} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link href="/membre/chats" className="btn-secondary flex-1 text-center">
          Annuler
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Enregistrement...' : catId ? 'Mettre à jour' : 'Ajouter le chat'}
        </button>
      </div>
    </form>
  )
}
