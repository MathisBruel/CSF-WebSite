'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { RACES, EYE_COLORS } from '@/lib/cat-data'
import { COAT_COLORS } from '@/lib/coat-colors'

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  breed: z.string().min(1, 'Race requise'),
  color: z.string().optional(),
  gender: z.enum(['Mâle', 'Femelle', 'Neutre Mâle', 'Neutre Femelle']),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  eyeColor: z.string().optional(),
  breeder: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  father: z.string().optional(),
  mother: z.string().optional(),
  isHouseCat: z.boolean().default(false),
  icadNumber: z.string().optional(),
  pedigreeNumber: z.string().optional(),
  pedigreeInProgress: z.boolean().default(false),
  foreignCatCertificate: z.string().optional(),
  inscritChampionnatFrance: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

function Tooltip({ text }: { text: string }) {
  return (
    <div className="relative group inline-flex ml-1">
      <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center cursor-help font-bold leading-none">?</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-60 p-2 bg-gray-800 text-white text-xs rounded hidden group-hover:block z-10 normal-case font-normal">
        {text}
      </div>
    </div>
  )
}

export function AddCatForm({ catId }: { catId?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: 'Mâle',
      pedigreeInProgress: false,
      inscritChampionnatFrance: false,
      isHouseCat: false,
    },
  })

  const pedigreeInProgress = watch('pedigreeInProgress')

  const onSubmit = async (data: FormData) => {
    setError('')
    const payload = { ...data }
    if (payload.pedigreeInProgress) {
      payload.pedigreeNumber = undefined
    }

    const res = await fetch(catId ? `/api/cats/${catId}` : '/api/cats', {
      method: catId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

      {/* datalist for coat colors autocomplete */}
      <datalist id="coat-colors-list">
        {COAT_COLORS.map((c) => <option key={c} value={c} />)}
      </datalist>

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
            {RACES.map((r) => (
              <option key={r.id} value={r.nom}>{r.nom}</option>
            ))}
          </select>
          {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>}
        </div>

        <div>
          <label className="form-label">Sexe <span className="text-red-500">*</span></label>
          <select {...register('gender')} className="form-select">
            <option value="Mâle">Mâle</option>
            <option value="Femelle">Femelle</option>
            <option value="Neutre Mâle">Neutre Mâle</option>
            <option value="Neutre Femelle">Neutre Femelle</option>
          </select>
        </div>

        <div>
          <label className="form-label">Couleur / Robe</label>
          <input
            {...register('color')}
            className="form-input"
            placeholder="Commencer à taper..."
            list="coat-colors-list"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="form-label">Couleur des yeux</label>
          <select {...register('eyeColor')} className="form-select">
            <option value="">Sélectionner</option>
            {EYE_COLORS.map((e) => (
              <option key={e.id} value={e.nom}>{e.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Date de naissance <span className="text-red-500">*</span></label>
          <input {...register('birthDate')} type="date" className="form-input" />
          {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label className="form-label">Nom du père</label>
          <input {...register('father')} className="form-input" placeholder="Nom complet du père" />
        </div>

        <div>
          <label className="form-label">Nom de la mère</label>
          <input {...register('mother')} className="form-input" placeholder="Nom complet de la mère" />
        </div>

        <div>
          <label className="form-label">Éleveur du chat</label>
          <input {...register('breeder')} className="form-input" placeholder="Nom de l'éleveur" />
        </div>

        <div>
          <label className="form-label">Pays d&apos;origine</label>
          <input {...register('countryOfOrigin')} className="form-input" placeholder="France" />
        </div>

        <div>
          <label className="form-label">Numéro I-CAD (puce)</label>
          <input {...register('icadNumber')} className="form-input" placeholder="250269811234567" />
        </div>

        {/* Pedigree section */}
        <div className="col-span-2 space-y-2">
          <label className="form-label mb-0">Pedigree (LOOF...)</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('pedigreeInProgress')} type="checkbox" className="w-4 h-4 rounded text-csf-orange" />
            <span className="text-sm text-csf-dark">Demande de pedigree en cours</span>
          </label>
          {pedigreeInProgress ? (
            <div className="form-input bg-gray-100 text-gray-400 cursor-not-allowed select-none">
              EN COURS
            </div>
          ) : (
            <input {...register('pedigreeNumber')} className="form-input" placeholder="LOOF-XXXX-XX-XXXXX" />
          )}
        </div>

        {/* Chat de maison */}
        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isHouseCat')} type="checkbox" className="w-4 h-4 rounded text-csf-orange" />
            <span className="text-sm text-csf-dark">Chat de maison</span>
          </label>
        </div>

        {/* Certificat chat étranger */}
        <div className="col-span-2">
          <label className="form-label flex items-center">
            Certificat chat étranger
            <Tooltip text="Remplir uniquement si votre chat est né à l'étranger. Laisser vide si le chat est né en France." />
          </label>
          <input {...register('foreignCatCertificate')} className="form-input" placeholder="Numéro / référence du certificat" />
        </div>

        {/* Championnat de France */}
        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('inscritChampionnatFrance')} type="checkbox" className="w-4 h-4 rounded text-csf-orange" />
            <span className="text-sm text-csf-dark">Inscrit au Championnat de France</span>
            <Tooltip text="Cocher uniquement si le chat est bien inscrit au Championnat de France (CDF) sur MyLoof." />
          </label>
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
