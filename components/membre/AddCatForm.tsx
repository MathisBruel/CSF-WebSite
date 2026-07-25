'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { RACES, EYE_COLORS } from '@/lib/cat-data'
import { COAT_COLORS } from '@/lib/coat-colors'

const RACE_NAMES = RACES.map((r) => r.nom)

const schema = z.object({
  name: z.string().min(1, 'Nom requis'),
  breed: z.string().min(1, 'Race requise'),
  color: z.string().min(1, 'Couleur de robe requise').refine(
    (val) => COAT_COLORS.some((c) => c.toLowerCase() === val.toLowerCase()),
    'Couleur non reconnue — sélectionner dans la liste LOOF'
  ),
  gender: z.enum(['Mâle', 'Femelle', 'Neutre Mâle', 'Neutre Femelle']),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  eyeColor: z.string().min(1, 'Couleur des yeux requise'),
  breeder: z.string().optional(),
  countryOfOrigin: z.string().min(1, "Pays d'origine requis"),
  father: z.string().optional(),
  mother: z.string().optional(),
  isHouseCat: z.boolean().default(false),
  icadNumber: z.string().min(1, 'Numéro I-CAD requis'),
  pedigreeNumber: z.string().optional(),
  pedigreeInProgress: z.boolean().default(false),
  foreignCatCertificate: z.string().optional(),
  inscritChampionnatFrance: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (!data.isHouseCat) {
    if (!data.father?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nom du père requis', path: ['father'] })
    if (!data.mother?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nom de la mère requis', path: ['mother'] })
    if (!data.breeder?.trim()) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Éleveur requis', path: ['breeder'] })
    if (!data.pedigreeInProgress && !data.pedigreeNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Numéro de pedigree requis', path: ['pedigreeNumber'] })
    }
  }
})

type FormData = z.infer<typeof schema>

function Combobox({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [inputText, setInputText] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => { setInputText(value) }, [value])

  const filtered = inputText
    ? options.filter((o) => o.toLowerCase().includes(inputText.toLowerCase())).slice(0, 60)
    : options.slice(0, 60)

  const select = useCallback((opt: string) => {
    onChange(opt)
    setInputText(opt)
    setOpen(false)
    setHighlighted(0)
  }, [onChange])

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      const match = options.find((o) => o.toLowerCase() === inputText.toLowerCase())
      if (match) {
        onChange(match)
        setInputText(match)
      } else {
        setInputText(value)
      }
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]) }
    else if (e.key === 'Escape') { setOpen(false); setInputText(value) }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={inputText}
        onChange={(e) => { setInputText(e.target.value); setOpen(true); setHighlighted(0) }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="form-input w-full"
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef}
          className="absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto mt-1">
          {filtered.map((opt, i) => (
            <li key={opt}
              onMouseDown={() => select(opt)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                i === highlighted ? 'bg-orange-50 text-csf-orange font-medium' :
                opt === value ? 'text-csf-orange' : 'text-csf-dark hover:bg-gray-50'
              }`}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

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

type CatInitialData = {
  name: string
  breed: string
  color?: string | null
  gender: string
  birthDate: string
  eyeColor?: string | null
  breeder?: string | null
  countryOfOrigin?: string | null
  father?: string | null
  mother?: string | null
  isHouseCat: boolean
  icadNumber?: string | null
  pedigreeNumber?: string | null
  pedigreeInProgress: boolean
  foreignCatCertificate?: string | null
  inscritChampionnatFrance: boolean
}

const HOUSE_CAT_BREEDS = ['Chat de maison Poil Court', 'Chat de maison Poil Long']

export function AddCatForm({ catId, initialData }: { catId?: string; initialData?: CatInitialData }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const isFirstRender = useRef(true)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      name: initialData.name,
      breed: initialData.breed,
      color: initialData.color ?? '',
      gender: initialData.gender as FormData['gender'],
      birthDate: initialData.birthDate,
      eyeColor: initialData.eyeColor ?? '',
      breeder: initialData.breeder ?? '',
      countryOfOrigin: initialData.countryOfOrigin ?? '',
      father: initialData.father ?? '',
      mother: initialData.mother ?? '',
      isHouseCat: initialData.isHouseCat,
      icadNumber: initialData.icadNumber ?? '',
      pedigreeNumber: initialData.pedigreeNumber ?? '',
      pedigreeInProgress: initialData.pedigreeInProgress,
      foreignCatCertificate: initialData.foreignCatCertificate ?? '',
      inscritChampionnatFrance: initialData.inscritChampionnatFrance,
    } : {
      gender: 'Mâle',
      pedigreeInProgress: false,
      inscritChampionnatFrance: false,
      isHouseCat: false,
    },
  })

  const isHouseCat = watch('isHouseCat')
  const pedigreeInProgress = watch('pedigreeInProgress')
  const currentBreed = watch('breed')
  const currentColor = watch('color')

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (isHouseCat) {
      setValue('breed', '')
      setValue('pedigreeNumber', 'SANS')
      setValue('pedigreeInProgress', false)
      setValue('breeder', 'INCONNU')
      setValue('father', 'INCONNU')
      setValue('mother', 'INCONNU')
    } else {
      if (HOUSE_CAT_BREEDS.includes(currentBreed)) setValue('breed', '')
      setValue('pedigreeNumber', '')
      setValue('breeder', '')
      setValue('father', '')
      setValue('mother', '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHouseCat])

  const onSubmit = async (data: FormData) => {
    setError('')
    const payload = { ...data }
    if (payload.pedigreeInProgress || payload.isHouseCat) {
      payload.pedigreeNumber = payload.isHouseCat ? 'SANS' : undefined
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
    router.push(catId ? `/membre/chats/${catId}` : '/membre/chats')
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

        {/* Chat de maison — above race */}
        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isHouseCat')} type="checkbox" className="w-4 h-4 rounded text-csf-orange" />
            <span className="text-sm font-medium text-csf-dark">Chat de maison</span>
          </label>
        </div>

        {/* Race — conditional on isHouseCat */}
        {isHouseCat ? (
          <div className="col-span-2">
            <label className="form-label">Type de poil <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              {HOUSE_CAT_BREEDS.map((breed) => (
                <label key={breed}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-colors text-sm font-medium ${
                    currentBreed === breed
                      ? 'border-csf-orange bg-orange-50 text-csf-dark'
                      : 'border-csf-light hover:border-csf-orange/50 text-csf-muted'
                  }`}>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={currentBreed === breed}
                    onChange={() => setValue('breed', breed, { shouldValidate: true })}
                  />
                  {breed}
                </label>
              ))}
            </div>
            {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>}
          </div>
        ) : (
          <div>
            <label className="form-label">Race <span className="text-red-500">*</span></label>
            <Combobox
              options={RACE_NAMES}
              value={currentBreed}
              onChange={(v) => setValue('breed', v, { shouldValidate: true })}
              placeholder="Rechercher une race..."
            />
            {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>}
          </div>
        )}

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
          <label className="form-label">Couleur / Robe <span className="text-red-500">*</span></label>
          <Combobox
            options={COAT_COLORS}
            value={currentColor ?? ''}
            onChange={(v) => setValue('color', v, { shouldValidate: true })}
            placeholder="Rechercher une couleur..."
          />
          {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color.message}</p>}
        </div>

        <div>
          <label className="form-label">Couleur des yeux <span className="text-red-500">*</span></label>
          <select {...register('eyeColor')} className="form-select">
            <option value="">Sélectionner</option>
            {EYE_COLORS.map((e) => (
              <option key={e.id} value={e.nom}>{e.nom}</option>
            ))}
          </select>
          {errors.eyeColor && <p className="text-red-500 text-xs mt-1">{errors.eyeColor.message}</p>}
        </div>

        <div>
          <label className="form-label">Date de naissance <span className="text-red-500">*</span></label>
          <input {...register('birthDate')} type="date" className="form-input" />
          {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label className="form-label">Nom du père {!isHouseCat && <span className="text-red-500">*</span>}</label>
          <input
            {...register('father')}
            className={`form-input ${isHouseCat ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            disabled={isHouseCat}
            placeholder={isHouseCat ? 'INCONNU' : 'Nom complet du père'}
          />
          {!isHouseCat && errors.father && <p className="text-red-500 text-xs mt-1">{errors.father.message}</p>}
        </div>

        <div>
          <label className="form-label">Nom de la mère {!isHouseCat && <span className="text-red-500">*</span>}</label>
          <input
            {...register('mother')}
            className={`form-input ${isHouseCat ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            disabled={isHouseCat}
            placeholder={isHouseCat ? 'INCONNU' : 'Nom complet de la mère'}
          />
          {!isHouseCat && errors.mother && <p className="text-red-500 text-xs mt-1">{errors.mother.message}</p>}
        </div>

        <div>
          <label className="form-label">Éleveur du chat {!isHouseCat && <span className="text-red-500">*</span>}</label>
          <input
            {...register('breeder')}
            className={`form-input ${isHouseCat ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            disabled={isHouseCat}
            placeholder={isHouseCat ? 'INCONNU' : "Nom de l'éleveur"}
          />
          {!isHouseCat && errors.breeder && <p className="text-red-500 text-xs mt-1">{errors.breeder.message}</p>}
        </div>

        <div>
          <label className="form-label">Pays d&apos;origine <span className="text-red-500">*</span></label>
          <input {...register('countryOfOrigin')} className="form-input" placeholder="France" />
          {errors.countryOfOrigin && <p className="text-red-500 text-xs mt-1">{errors.countryOfOrigin.message}</p>}
        </div>

        <div>
          <label className="form-label">Numéro I-CAD (puce) <span className="text-red-500">*</span></label>
          <input {...register('icadNumber')} className="form-input" placeholder="250269811234567" />
          {errors.icadNumber && <p className="text-red-500 text-xs mt-1">{errors.icadNumber.message}</p>}
        </div>

        {/* Pedigree section */}
        <div className="col-span-2 space-y-2">
          <label className="form-label mb-0">Pedigree (LOOF...) {!isHouseCat && !pedigreeInProgress && <span className="text-red-500">*</span>}</label>
          {isHouseCat ? (
            <div className="form-input bg-gray-100 text-gray-400 cursor-not-allowed select-none">SANS</div>
          ) : (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('pedigreeInProgress')} type="checkbox" className="w-4 h-4 rounded text-csf-orange" />
                <span className="text-sm text-csf-dark">Demande de pedigree en cours</span>
              </label>
              {pedigreeInProgress ? (
                <div className="form-input bg-gray-100 text-gray-400 cursor-not-allowed select-none">EN COURS</div>
              ) : (
                <>
                  <input {...register('pedigreeNumber')} className="form-input" placeholder="LOOF-XXXX-XX-XXXXX" />
                  {errors.pedigreeNumber && <p className="text-red-500 text-xs mt-1">{errors.pedigreeNumber.message}</p>}
                </>
              )}
            </>
          )}
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
        <Link href={catId ? `/membre/chats/${catId}` : '/membre/chats'} className="btn-secondary flex-1 text-center">
          Annuler
        </Link>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? 'Enregistrement...' : catId ? 'Mettre à jour' : 'Ajouter le chat'}
        </button>
      </div>
    </form>
  )
}
