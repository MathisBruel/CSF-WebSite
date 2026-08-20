'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Exhibition, Cat, ExhibitionSpecial } from '@prisma/client'
import { computeCatPrice, formatPrice, type GlobalPricing } from '@/lib/utils'
import { computeAvailableClasses, isHouseCatBreed } from '@/lib/cat-data'

type Step = 'cats' | 'options' | 'cage' | 'summary' | 'done'

type CatEntry = {
  participationDays: string[]
  traditionalClassSaturday: string
  traditionalClassSunday: string
  wantsComplianceExam: boolean
  isConformityOnly: boolean
  specialParticipations: string[]
}

const defaultCatEntry = (): CatEntry => ({
  participationDays: [],
  traditionalClassSaturday: '',
  traditionalClassSunday: '',
  wantsComplianceExam: false,
  isConformityOnly: false,
  specialParticipations: [],
})

function computeCageLength(catCount: number): number {
  if (catCount <= 0) return 0
  return 80 + (catCount - 1) * 60
}

export function RegistrationWizard({
  exhibition,
  cats,
  pricing,
  isMember,
  hasPendingMembershipRequest,
}: {
  exhibition: Exhibition & { specials: ExhibitionSpecial[] }
  cats: (Cat & { isHouseCat: boolean })[]
  pricing: GlobalPricing
  isMember: boolean
  hasPendingMembershipRequest: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wizardStorageKey = `csf-registration-wizard-${exhibition.id}`
  const [step, setStep] = useState<Step>('cats')
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [catOptions, setCatOptions] = useState<Record<string, CatEntry>>({})
  const [wantsBorrowedCages, setWantsBorrowedCages] = useState(false)
  const [borrowedCages, setBorrowedCages] = useState(1)
  const [cageSpecialRequest, setCageSpecialRequest] = useState('')
  const [wantsSpecialCage, setWantsSpecialCage] = useState(false)
  const [nextTo, setNextTo] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hasReadRules, setHasReadRules] = useState(false)
  const [triedOptionsNext, setTriedOptionsNext] = useState(false)

  // Resume an in-progress registration after being sent to /membre/chats/nouveau to add a cat.
  useEffect(() => {
    const saved = sessionStorage.getItem(wizardStorageKey)
    if (saved) {
      sessionStorage.removeItem(wizardStorageKey)
      try {
        const parsed = JSON.parse(saved) as { selectedCatIds: string[]; catOptions: Record<string, CatEntry> }
        setSelectedCatIds(parsed.selectedCatIds ?? [])
        setCatOptions(parsed.catOptions ?? {})
      } catch {
        // ignore malformed storage
      }
    }

    const newCatId = searchParams.get('newCat')
    if (newCatId && cats.some((c) => c.id === newCatId)) {
      setSelectedCatIds((prev) => (prev.includes(newCatId) ? prev : [...prev, newCatId]))
      setCatOptions((prev) => (prev[newCatId] ? prev : { ...prev, [newCatId]: defaultCatEntry() }))
      router.replace(`/membre/inscriptions/${exhibition.id}`)
    }
    // Run once on mount only — restoring saved state and consuming the newCat param.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCatHref = `/membre/chats/nouveau?returnTo=${encodeURIComponent(`/membre/inscriptions/${exhibition.id}`)}`
  const saveWizardStateBeforeLeaving = () => {
    sessionStorage.setItem(wizardStorageKey, JSON.stringify({ selectedCatIds, catOptions }))
  }

  const toggleCat = (catId: string) => {
    if (selectedCatIds.includes(catId)) {
      setSelectedCatIds(selectedCatIds.filter((id) => id !== catId))
    } else {
      setSelectedCatIds([...selectedCatIds, catId])
      if (!catOptions[catId]) {
        setCatOptions((prev) => ({ ...prev, [catId]: defaultCatEntry() }))
      }
    }
  }

  const updateCatOption = <K extends keyof CatEntry>(catId: string, field: K, value: CatEntry[K]) => {
    setCatOptions((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], [field]: value },
    }))
  }

  const selectedCats = cats.filter((c) => selectedCatIds.includes(c.id))

  const allConformityOnly = selectedCatIds.length > 0 && selectedCatIds.every((id) => (catOptions[id] ?? defaultCatEntry()).isConformityOnly)

  const catPrices = selectedCatIds.map((catId, idx) => {
    const cat = cats.find((c) => c.id === catId)
    if (!cat) return 0
    const opts = catOptions[catId] ?? defaultCatEntry()
    return computeCatPrice(
      idx + 1,
      opts.participationDays,
      isHouseCatBreed(cat.breed),
      opts.wantsComplianceExam || opts.isConformityOnly,
      false,
      isMember,
      pricing,
      opts.isConformityOnly
    )
  })
  const catsTotal = catPrices.reduce((s, p) => s + p, 0)
  const totalAmount = pricing.registrationFee + catsTotal

  const standardCageLength = computeCageLength(selectedCatIds.length)

  const isCatOptionsValid = (catId: string) => {
    const opts = catOptions[catId] ?? defaultCatEntry()
    if (opts.participationDays.length === 0) return false
    if (opts.isConformityOnly) return true
    if (opts.participationDays.includes('Samedi') && opts.traditionalClassSaturday === '') return false
    if (opts.participationDays.includes('Dimanche') && opts.traditionalClassSunday === '') return false
    return true
  }
  const allCatsOptionsValid = selectedCatIds.every(isCatOptionsValid)

  const goToOptions = () => {
    const newOptions: Record<string, CatEntry> = { ...catOptions }
    for (const catId of selectedCatIds) {
      if (!newOptions[catId]) newOptions[catId] = defaultCatEntry()
    }
    setCatOptions(newOptions)
    setStep('options')
  }

  const submit = async () => {
    setSubmitting(true)
    setError('')
    const payload = {
      exhibitionId: exhibition.id,
      cats: selectedCatIds.map((catId) => {
        const opts = catOptions[catId] ?? defaultCatEntry()
        return {
          catId,
          ...opts,
          wantsComplianceExam: opts.wantsComplianceExam || opts.isConformityOnly,
        }
      }),
      borrowedCages: allConformityOnly ? 0 : (wantsBorrowedCages ? borrowedCages : 0),
      cageSpecialLengthRequest: allConformityOnly ? undefined : (wantsSpecialCage ? cageSpecialRequest : undefined),
      nextTo: allConformityOnly ? undefined : (nextTo || undefined),
      comment: comment || undefined,
    }
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSubmitting(false)
    if (!res.ok) {
      const body = await res.json()
      setError(body.error || "Erreur lors de l'inscription")
      return
    }
    setStep('done')
    router.refresh()
  }

  const steps: Step[] = allConformityOnly ? ['cats', 'options', 'summary'] : ['cats', 'options', 'cage', 'summary']
  const stepLabels = allConformityOnly ? ['Chats', 'Options', 'Récapitulatif'] : ['Chats', 'Options', 'Cage', 'Récapitulatif']
  const currentStepIdx = steps.indexOf(step)

  if (step === 'done') {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-serif text-csf-dark mb-2">Inscription enregistrée !</h2>
        <p className="text-csf-muted mb-2">Votre inscription est en attente de réception du paiement.</p>
        <p className="text-sm text-csf-muted mb-6">Vous recevrez une confirmation par email une fois le paiement reçu et validé.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/membre/inscriptions" className="btn-primary">Mes inscriptions</Link>
          <Link href="/membre/dashboard" className="btn-secondary">Tableau de bord</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/expositions/${exhibition.slug}`}
          className="text-sm text-csf-muted hover:text-csf-orange transition-colors">
          ← {exhibition.title}
        </Link>
        <h1 className="text-2xl font-bold font-serif text-csf-dark mt-1">Inscription à l&apos;exposition</h1>
        {isMember && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Tarif adhérent appliqué
          </span>
        )}
      </div>

      {!isMember && hasPendingMembershipRequest && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Votre demande d&apos;adhésion est en attente de validation</p>
            <p className="text-sm text-amber-700 mt-1">
              Les tarifs appliqués à cette inscription sont donc les tarifs non-adhérent. Pour profiter des tarifs
              réduits, attendez que le bureau valide votre adhésion avant de vous inscrire.
            </p>
          </div>
        </div>
      )}

      {!isMember && !hasPendingMembershipRequest && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div>
            <p className="font-medium text-orange-800">Vous n&apos;êtes pas adhérent</p>
            <p className="text-sm text-orange-700 mt-1">
              Adhérez pour bénéficier de tarifs réduits sur cette exposition.{' '}
              <Link href="/membre/dashboard" className="underline font-medium hover:text-orange-800">
                Faire une demande d&apos;adhésion
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-initial">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              i < currentStepIdx ? 'bg-green-500 text-white' :
              i === currentStepIdx ? 'bg-csf-orange text-white' :
              'bg-csf-light text-csf-muted'
            }`}>
              {i < currentStepIdx ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-sm ${i === currentStepIdx ? 'font-medium text-csf-dark' : 'text-csf-muted'}`}>
              {stepLabels[i]}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < currentStepIdx ? 'bg-green-500' : 'bg-csf-light'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card">
        {/* ── Step 1: Select cats ── */}
        {step === 'cats' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-1">Sélectionner vos chats</h2>
            <p className="text-sm text-csf-muted mb-4">Vous pouvez inscrire plusieurs chats en une seule inscription.</p>

            {cats.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-csf-muted mb-3">Vous n&apos;avez pas de chat disponible pour cette exposition.</p>
                <Link href={addCatHref} onClick={saveWizardStateBeforeLeaving} className="btn-primary text-sm">Ajouter un chat</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cats.map((cat) => {
                  const isSelected = selectedCatIds.includes(cat.id)
                  return (
                    <label key={cat.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'border-csf-orange bg-orange-50' : 'border-csf-light hover:border-csf-orange/50'
                      }`}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleCat(cat.id)}
                        className="w-5 h-5 text-csf-orange rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-csf-dark">{cat.name}</p>
                        <p className="text-sm text-csf-muted">{cat.breed} · {cat.gender}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            {cats.length > 0 && (
              <div className="mt-3">
                <Link href={addCatHref} onClick={saveWizardStateBeforeLeaving}
                  className="text-sm text-csf-orange hover:text-csf-orange-dark font-medium">
                  + Ajouter un autre chat
                </Link>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={goToOptions} disabled={selectedCatIds.length === 0} className="btn-primary">
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Options per cat ── */}
        {step === 'options' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-4">Options par chat</h2>
            <div className="space-y-6">
              {selectedCats.map((cat, idx) => {
                const opts = catOptions[cat.id] ?? defaultCatEntry()
                const update = <K extends keyof CatEntry>(field: K, value: CatEntry[K]) =>
                  updateCatOption(cat.id, field, value)
                const catPrice = computeCatPrice(
                  idx + 1,
                  opts.participationDays,
                  isHouseCatBreed(cat.breed),
                  opts.wantsComplianceExam || opts.isConformityOnly,
                  false,
                  isMember,
                  pricing,
                  opts.isConformityOnly
                )
                const availableClasses = computeAvailableClasses(
                  new Date(cat.birthDate),
                  cat.gender,
                  cat.breed,
                  cat.isHouseCat,
                  new Date(exhibition.startDate)
                )
                return (
                  <div key={cat.id} className="border border-csf-light rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-csf-light">
                      <h3 className="font-medium text-csf-dark">
                        {idx + 1}. {cat.name}{' '}
                        <span className="text-sm font-normal text-csf-muted">({cat.breed})</span>
                        {cat.isHouseCat && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">Chat de maison</span>
                        )}
                        {opts.isConformityOnly && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 font-medium rounded">Conformité seule</span>
                        )}
                      </h3>
                      <span className="text-sm font-semibold text-csf-orange">{formatPrice(catPrice)}</span>
                    </div>

                    <div className="space-y-4">
                      {/* Checkbox "S'inscrire seulement pour une conformité" */}
                      <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-lg">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={opts.isConformityOnly}
                            onChange={(e) => {
                              const checked = e.target.checked
                              update('isConformityOnly', checked)
                              if (checked) {
                                update('wantsComplianceExam', true)
                                if (opts.participationDays.length > 1) {
                                  update('participationDays', [opts.participationDays[0]])
                                }
                              }
                            }}
                            className="mt-0.5 text-csf-orange rounded w-4 h-4"
                          />
                          <div>
                            <span className="text-sm font-semibold text-csf-dark">
                              S&apos;inscrire seulement pour une conformité
                            </span>
                            <span className="ml-2 text-xs text-csf-orange font-bold">
                              ({formatPrice(isMember ? pricing.memberConformite : pricing.nonMemberConformite)})
                            </span>
                            {opts.isConformityOnly && (
                              <p className="text-xs text-csf-muted mt-1">
                                Seul l&apos;examen de conformité de race sera passé (un seul jour). Pas de concours ni d&apos;emplacement en cage.
                              </p>
                            )}
                          </div>
                        </label>
                      </div>

                      {opts.isConformityOnly ? (
                        <div>
                          <label className="form-label text-sm">
                            Jour d&apos;examen de conformité <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-4">
                            {['Samedi', 'Dimanche'].map((day) => (
                              <label key={day} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`conformity-day-${cat.id}`}
                                  checked={opts.participationDays.includes(day)}
                                  onChange={() => update('participationDays', [day])}
                                  className="text-csf-orange focus:ring-csf-orange"
                                />
                                <span className="text-sm">{day}</span>
                              </label>
                            ))}
                          </div>
                          {triedOptionsNext && opts.participationDays.length === 0 && (
                            <p className="text-red-500 text-xs mt-1">Sélectionner un jour</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label className="form-label text-sm">
                            Jours de participation <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-4">
                            {['Samedi', 'Dimanche'].map((day) => (
                              <label key={day} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                  checked={opts.participationDays.includes(day)}
                                  onChange={(e) => {
                                    const days = e.target.checked
                                      ? [...opts.participationDays, day]
                                      : opts.participationDays.filter((d) => d !== day)
                                    update('participationDays', days)
                                  }}
                                  className="text-csf-orange rounded" />
                                <span className="text-sm">{day}</span>
                              </label>
                            ))}
                          </div>
                          {triedOptionsNext && opts.participationDays.length === 0 && (
                            <p className="text-red-500 text-xs mt-1">Sélectionner au moins un jour</p>
                          )}
                        </div>
                      )}

                      {!opts.isConformityOnly && (
                        <>
                          <div>
                            <label className="form-label text-sm">
                              Classe de jugement <span className="text-red-500">*</span>
                            </label>
                            {availableClasses.length === 0 ? (
                              <p className="text-sm text-red-500">Chat trop jeune pour cette exposition.</p>
                            ) : opts.participationDays.length === 0 ? (
                              <p className="text-sm text-csf-muted">Sélectionner d&apos;abord au moins un jour de participation.</p>
                            ) : (
                              <div className="space-y-3">
                                {opts.participationDays.includes('Samedi') && (
                                  <div>
                                    <label className="text-xs text-csf-muted mb-1 block">Samedi</label>
                                    <select
                                      className={`form-select ${triedOptionsNext && opts.traditionalClassSaturday === '' ? 'border-red-400' : ''}`}
                                      value={opts.traditionalClassSaturday}
                                      onChange={(e) => update('traditionalClassSaturday', e.target.value)}>
                                      <option value="">Sélectionner une classe</option>
                                      {availableClasses.map((c) => (
                                        <option key={c.idClasses} value={c.nom}>{c.nom}</option>
                                      ))}
                                    </select>
                                    {triedOptionsNext && opts.traditionalClassSaturday === '' && (
                                      <p className="text-red-500 text-xs mt-1">Classe obligatoire</p>
                                    )}
                                  </div>
                                )}
                                {opts.participationDays.includes('Dimanche') && (
                                  <div>
                                    <label className="text-xs text-csf-muted mb-1 block">Dimanche</label>
                                    <select
                                      className={`form-select ${triedOptionsNext && opts.traditionalClassSunday === '' ? 'border-red-400' : ''}`}
                                      value={opts.traditionalClassSunday}
                                      onChange={(e) => update('traditionalClassSunday', e.target.value)}>
                                      <option value="">Sélectionner une classe</option>
                                      {availableClasses.map((c) => (
                                        <option key={c.idClasses} value={c.nom}>{c.nom}</option>
                                      ))}
                                    </select>
                                    {triedOptionsNext && opts.traditionalClassSunday === '' && (
                                      <p className="text-red-500 text-xs mt-1">Classe obligatoire</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={opts.wantsComplianceExam}
                              onChange={(e) => update('wantsComplianceExam', e.target.checked)}
                              className="text-csf-orange rounded" />
                            <span className="text-sm">
                              Examen de conformité{' '}
                              <span className="text-csf-muted">
                                (+{formatPrice(isMember ? pricing.memberConformite : pricing.nonMemberConformite)})
                              </span>
                            </span>
                          </label>

                          {exhibition.specials.length > 0 && (
                            <div>
                              <label className="form-label text-sm">Spéciaux de race</label>
                              <div className="flex flex-col gap-2">
                                {exhibition.specials.map((sp) => (
                                  <label key={sp.id} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox"
                                      checked={opts.specialParticipations.includes(sp.name)}
                                      onChange={(e) => {
                                        const newSp = e.target.checked
                                          ? [...opts.specialParticipations, sp.name]
                                          : opts.specialParticipations.filter((s) => s !== sp.name)
                                        update('specialParticipations', newSp)
                                      }}
                                      className="text-csf-orange rounded" />
                                    <span className="text-sm">{sp.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {triedOptionsNext && !allCatsOptionsValid && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Chaque chat doit avoir au moins un jour de participation et les options requises renseignées.
              </div>
            )}
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep('cats')} className="btn-secondary">← Retour</button>
              <button
                onClick={() => {
                  setTriedOptionsNext(true)
                  if (allCatsOptionsValid) setStep(allConformityOnly ? 'summary' : 'cage')
                }}
                className="btn-primary">
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Cage ── */}
        {step === 'cage' && (
          <div className="space-y-5">
            <h2 className="font-bold text-csf-dark">Cage</h2>

            {/* Cage length info */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-csf-dark">
                  Longueur standard pour {selectedCatIds.length} chat{selectedCatIds.length > 1 ? 's' : ''}
                </p>
                <span className="text-sm font-bold text-csf-orange">{standardCageLength} cm</span>
              </div>
              <p className="text-xs text-csf-muted">1 chat = 80 cm · chaque chat supplémentaire = +60 cm</p>
            </div>

            {/* Borrowed cages */}
            <div className="p-4 border border-csf-light rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsBorrowedCages}
                  onChange={(e) => setWantsBorrowedCages(e.target.checked)}
                  className="w-4 h-4 accent-csf-orange"
                />
                <span className="text-sm font-medium text-csf-dark">Emprunter des cages au club</span>
              </label>
              {wantsBorrowedCages && (
                <>
                  <p className="text-xs text-csf-muted">
                    Gratuit — caution {formatPrice(pricing.cageDeposit)} par cage par chèque sur place
                  </p>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setBorrowedCages(Math.max(1, borrowedCages - 1))}
                      disabled={borrowedCages <= 1}
                      className="w-8 h-8 rounded-full border border-csf-light flex items-center justify-center text-csf-dark hover:bg-csf-light transition-colors font-bold disabled:opacity-40 disabled:cursor-not-allowed">−</button>
                    <span className="w-8 text-center font-bold text-csf-dark">{borrowedCages}</span>
                    <button type="button"
                      onClick={() => setBorrowedCages(borrowedCages + 1)}
                      className="w-8 h-8 rounded-full border border-csf-light flex items-center justify-center text-csf-dark hover:bg-csf-light transition-colors font-bold">+</button>
                  </div>
                  <p className="text-xs text-orange-600 font-medium">
                    Caution : {formatPrice(pricing.cageDeposit * borrowedCages)} ({borrowedCages} × {formatPrice(pricing.cageDeposit)}) — chèque remis sur place, restitué en fin d&apos;expo
                  </p>
                </>
              )}
            </div>

            {/* Special length request — always available */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={wantsSpecialCage}
                  onChange={(e) => { setWantsSpecialCage(e.target.checked); if (!e.target.checked) setCageSpecialRequest('') }}
                  className="text-csf-orange rounded" />
                <span className="text-sm">Demander une longueur différente</span>
              </label>
              {wantsSpecialCage && (
                <div>
                  <label className="form-label text-sm">Raison de la demande spéciale</label>
                  <textarea
                    value={cageSpecialRequest}
                    onChange={(e) => setCageSpecialRequest(e.target.value)}
                    className="form-textarea"
                    rows={2}
                    placeholder="Ex : cage décorée 120 cm, cage double pour deux chatons..."
                  />
                </div>
              )}
            </div>

            {/* À côté de + commentaire */}
            <div className="space-y-4 pt-2 border-t border-csf-light">
              <div>
                <label className="form-label">À côté de...</label>
                <input
                  type="text"
                  value={nextTo}
                  onChange={(e) => setNextTo(e.target.value)}
                  className="form-input"
                  placeholder="Nom(s) des personnes à côté desquelles vous souhaitez être"
                />
              </div>
              <div>
                <label className="form-label">Commentaire</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-textarea"
                  rows={2}
                  placeholder="Informations complémentaires pour le bureau..."
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('options')} className="btn-secondary">← Retour</button>
              <button onClick={() => setStep('summary')} className="btn-primary">
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Summary ── */}
        {step === 'summary' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-4">Récapitulatif</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-csf-light">
                <span className="text-csf-muted">Exposition</span>
                <span className="font-medium text-csf-dark text-right max-w-48">{exhibition.title}</span>
              </div>

              <div className="flex justify-between py-1 text-csf-muted">
                <span>Frais d&apos;inscription</span>
                <span>{formatPrice(pricing.registrationFee)}</span>
              </div>

              {selectedCats.map((cat, idx) => {
                const opts = catOptions[cat.id] ?? defaultCatEntry()
                const catPrice = catPrices[idx]
                return (
                  <div key={cat.id} className="border border-csf-light rounded-xl p-3">
                    <div className="flex justify-between">
                      <p className="font-medium text-csf-dark">{cat.name}</p>
                      <span className="font-medium text-csf-dark">{formatPrice(catPrice)}</span>
                    </div>
                    <div className="space-y-0.5 mt-1 text-xs text-csf-muted">
                      {opts.participationDays.length > 0 && <p>{opts.participationDays.join(' + ')}</p>}
                      {opts.isConformityOnly ? (
                        <p className="font-medium text-csf-orange">Conformité uniquement (sans emplacement)</p>
                      ) : (
                        <>
                          {cat.isHouseCat && <p>Chat de maison</p>}
                          {opts.traditionalClassSaturday && <p>Classe Samedi : {opts.traditionalClassSaturday}</p>}
                          {opts.traditionalClassSunday && <p>Classe Dimanche : {opts.traditionalClassSunday}</p>}
                          {opts.wantsComplianceExam && <p>Conformité</p>}
                          {opts.specialParticipations.length > 0 && <p>Spéciaux : {opts.specialParticipations.join(', ')}</p>}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              {!allConformityOnly && (
                <div className="text-csf-muted space-y-0.5">
                  <div className="flex justify-between">
                    <span>Longueur cage standard</span>
                    <span className="font-medium text-csf-dark">{standardCageLength} cm</span>
                  </div>
                  {wantsBorrowedCages && (
                    <div className="flex justify-between">
                      <span>Cage{borrowedCages > 1 ? 's' : ''} empruntée{borrowedCages > 1 ? 's' : ''} au club</span>
                      <span>{borrowedCages} — caution {formatPrice(pricing.cageDeposit * borrowedCages)} sur place</span>
                    </div>
                  )}
                  {wantsSpecialCage && cageSpecialRequest && (
                    <p className="text-xs italic">Longueur spéciale : {cageSpecialRequest}</p>
                  )}
                </div>
              )}

              {!allConformityOnly && nextTo && (
                <div className="flex justify-between text-csf-muted">
                  <span>À côté de</span>
                  <span className="text-right max-w-48">{nextTo}</span>
                </div>
              )}

              {comment && (
                <div className="text-csf-muted">
                  <p className="mb-1">Commentaire :</p>
                  <p className="text-xs italic">{comment}</p>
                </div>
              )}

              <div className="flex justify-between py-3 font-bold text-csf-dark text-lg border-t border-csf-light">
                <span>Total</span>
                <span className="text-csf-orange">{formatPrice(totalAmount)}</span>
              </div>

              {isMember && (
                <p className="text-xs text-green-600">Tarif adhérent appliqué</p>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <p className="text-xs text-csf-muted mt-3">
              Votre inscription sera validée dès réception de votre règlement.
            </p>

            <label className="flex items-start gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={hasReadRules}
                onChange={(e) => setHasReadRules(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-csf-orange rounded flex-shrink-0"
              />
              <span className="text-sm text-csf-muted">
                J&apos;ai lu et j&apos;accepte le{' '}
                <Link href="/documents" target="_blank" className="text-csf-orange underline hover:no-underline">
                  règlement des expositions
                </Link>
              </span>
            </label>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(allConformityOnly ? 'options' : 'cage')} className="btn-secondary">← Retour</button>
              <button onClick={submit} disabled={submitting || !hasReadRules} className="btn-primary">
                {submitting ? 'Envoi...' : "Confirmer l'inscription"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
