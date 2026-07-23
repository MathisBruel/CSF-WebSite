'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Exhibition, Cat, ExhibitionPricingTier, ExhibitionCageOption } from '@prisma/client'

function computeBasePrice(
  catCount: number,
  tiers: Pick<ExhibitionPricingTier, 'minCats' | 'pricePerCat'>[],
  fallback: number
): number {
  if (tiers.length === 0) return fallback
  const sorted = [...tiers].sort((a, b) => b.minCats - a.minCats)
  return sorted.find((t) => catCount >= t.minCats)?.pricePerCat ?? fallback
}

type Step = 'cats' | 'options' | 'logistics' | 'summary' | 'done'

type CatEntry = {
  participationDays: string[]
  traditionalClass: string
  traditionalClassOther: string
  isHorsConcours: boolean
  wantsComplianceExam: boolean
  specialParticipations: string[]
}

const defaultCatEntry = (): CatEntry => ({
  participationDays: [],
  traditionalClass: '',
  traditionalClassOther: '',
  isHorsConcours: false,
  wantsComplianceExam: false,
  specialParticipations: [],
})

const TRADITIONAL_CLASSES = [
  '3/6 Mois', '6/10 Mois',
  'CAC', 'CACIB', 'CAGCI', 'CACE', 'CAGCE',
  'CAP', 'CAPIB', 'CAGPI', 'CAPE', 'CAGPE',
  'Honneur', 'RIA', 'Nouvelle Race / AE', 'Autre',
]

const SPECIAL_PARTICIPATIONS = ["Lot d'Elevage", '3 Générations', 'Vétéran']

export function RegistrationWizard({
  exhibition,
  cats,
  pricingTiers = [],
  cageOptions = [],
}: {
  exhibition: Exhibition
  cats: (Cat & { catDocuments: { type: string; validated: boolean }[] })[]
  pricingTiers?: Pick<ExhibitionPricingTier, 'minCats' | 'pricePerCat'>[]
  cageOptions?: Pick<ExhibitionCageOption, 'id' | 'name' | 'price' | 'order'>[]
}) {
  const [step, setStep] = useState<Step>('cats')
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [catOptions, setCatOptions] = useState<Record<string, CatEntry>>({})
  const [selectedCageOptionId, setSelectedCageOptionId] = useState<string | null>(null)
  const [mealsCount, setMealsCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const sortedCageOptions = [...cageOptions].sort((a, b) => a.order - b.order)
  const lastTierIdx = pricingTiers.length - 1
  const sortedTiers = [...pricingTiers].sort((a, b) => a.minCats - b.minCats)

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
  const currentBasePrice = computeBasePrice(selectedCatIds.length, pricingTiers, exhibition.priceBase)
  const selectedCageOption = sortedCageOptions.find((o) => o.id === selectedCageOptionId)
  const cagePrice = selectedCageOption?.price ?? 0
  const mealsPrice = mealsCount * exhibition.priceMeal
  const catsTotal = selectedCatIds.length * currentBasePrice
  const totalAmount = catsTotal + cagePrice + mealsPrice

  const goToOptions = () => {
    const newOptions: Record<string, CatEntry> = { ...catOptions }
    for (const catId of selectedCatIds) {
      if (!newOptions[catId]) newOptions[catId] = defaultCatEntry()
    }
    setCatOptions(newOptions)
    setStep('options')
  }

  const hasLogisticsStep = sortedCageOptions.length > 0 || exhibition.mealsEnabled

  const goToLogisticsOrSummary = () => setStep(hasLogisticsStep ? 'logistics' : 'summary')

  const submit = async () => {
    setSubmitting(true)
    setError('')
    const payload = {
      exhibitionId: exhibition.id,
      cats: selectedCatIds.map((catId) => ({
        catId,
        ...(catOptions[catId] ?? defaultCatEntry()),
      })),
      cageOptionId: selectedCageOptionId,
      mealsCount,
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
  }

  const steps: Step[] = hasLogisticsStep
    ? ['cats', 'options', 'logistics', 'summary']
    : ['cats', 'options', 'summary']
  const stepLabels = hasLogisticsStep
    ? ['Chats', 'Options', 'Logistique', 'Récapitulatif']
    : ['Chats', 'Options', 'Récapitulatif']
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
        <p className="text-csf-muted mb-2">Votre inscription est en attente de validation par le bureau.</p>
        <p className="text-sm text-csf-muted mb-6">Vous recevrez une confirmation par email une fois validée.</p>
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
      </div>

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

            {/* Pricing tiers table */}
            {sortedTiers.length > 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs">
                <p className="font-medium text-csf-dark mb-2">Tarification dégressive :</p>
                <div className="space-y-1">
                  {sortedTiers.map((tier, i) => {
                    const isLast = i === sortedTiers.length - 1
                    return (
                      <div key={i} className="flex justify-between text-csf-muted">
                        <span>{isLast ? `${tier.minCats}+ chats` : `${tier.minCats} chat${tier.minCats > 1 ? 's' : ''}`}</span>
                        <span className="font-medium text-csf-dark">{tier.pricePerCat.toFixed(2)} € / chat</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {cats.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-csf-muted mb-3">Vous n&apos;avez pas de chat disponible pour cette exposition.</p>
                <Link href="/membre/chats/nouveau" className="btn-primary text-sm">Ajouter un chat</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cats.map((cat) => {
                  const hasAllDocs = ['PEDIGREE', 'ICAD', 'VACCIN'].every(
                    (t) => cat.catDocuments.some((d) => d.type === t)
                  )
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
                      {!hasAllDocs && <span className="badge badge-yellow text-xs">Docs manquants</span>}
                    </label>
                  )
                })}
              </div>
            )}

            {selectedCatIds.length > 0 && (
              <p className="text-sm text-csf-muted mt-3">
                {selectedCatIds.length} chat{selectedCatIds.length > 1 ? 's' : ''} sélectionné{selectedCatIds.length > 1 ? 's' : ''}
                {' · '}<span className="font-medium text-csf-dark">{currentBasePrice.toFixed(2)} € / chat</span>
              </p>
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
                return (
                  <div key={cat.id} className="border border-csf-light rounded-xl p-4">
                    <h3 className="font-medium text-csf-dark mb-4 pb-2 border-b border-csf-light">
                      {idx + 1}. {cat.name}{' '}
                      <span className="text-sm font-normal text-csf-muted">({cat.breed})</span>
                    </h3>

                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide">Compétition</p>

                      <div>
                        <label className="form-label text-sm">Jours de participation</label>
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
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={opts.isHorsConcours}
                          onChange={(e) => update('isHorsConcours', e.target.checked)}
                          className="text-csf-orange rounded" />
                        <span className="text-sm font-medium">Hors Concours (H.C.)</span>
                      </label>

                      {!opts.isHorsConcours && (
                        <>
                          <div>
                            <label className="form-label text-sm">Classe de jugement Traditionnel</label>
                            <select className="form-select" value={opts.traditionalClass}
                              onChange={(e) => update('traditionalClass', e.target.value)}>
                              <option value="">Sélectionner une classe</option>
                              {TRADITIONAL_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          {opts.traditionalClass === 'Autre' && (
                            <div>
                              <label className="form-label text-sm">Précisez la classe</label>
                              <input type="text" className="form-input" value={opts.traditionalClassOther}
                                onChange={(e) => update('traditionalClassOther', e.target.value)} />
                            </div>
                          )}
                        </>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={opts.wantsComplianceExam}
                          onChange={(e) => update('wantsComplianceExam', e.target.checked)}
                          className="text-csf-orange rounded" />
                        <span className="text-sm">Examen de conformité</span>
                      </label>

                      <div>
                        <label className="form-label text-sm">Participations spéciales (Optionnel)</label>
                        <div className="flex flex-col gap-2">
                          {SPECIAL_PARTICIPATIONS.map((sp) => (
                            <label key={sp} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox"
                                checked={opts.specialParticipations.includes(sp)}
                                onChange={(e) => {
                                  const newSp = e.target.checked
                                    ? [...opts.specialParticipations, sp]
                                    : opts.specialParticipations.filter((s) => s !== sp)
                                  update('specialParticipations', newSp)
                                }}
                                className="text-csf-orange rounded" />
                              <span className="text-sm">{sp}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('cats')} className="btn-secondary">← Retour</button>
              <button onClick={goToLogisticsOrSummary} className="btn-primary">Suivant →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Global logistics ── */}
        {step === 'logistics' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-1">Logistique</h2>
            <p className="text-sm text-csf-muted mb-5">Ces options s&apos;appliquent à toute l&apos;inscription.</p>

            <div className="space-y-6">
              {/* Cage options */}
              {sortedCageOptions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-3">Cage</p>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedCageOptionId === null ? 'border-csf-orange bg-orange-50' : 'border-csf-light hover:border-csf-orange/50'
                    }`}>
                      <div>
                        <p className="text-sm font-medium text-csf-dark">Aucune cage</p>
                        <p className="text-xs text-csf-muted">Je gère mes propres cages</p>
                      </div>
                      <input type="radio" name="cage" checked={selectedCageOptionId === null}
                        onChange={() => setSelectedCageOptionId(null)}
                        className="w-5 h-5 text-csf-orange" />
                    </label>
                    {sortedCageOptions.map((opt) => (
                      <label key={opt.id} className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedCageOptionId === opt.id ? 'border-csf-orange bg-orange-50' : 'border-csf-light hover:border-csf-orange/50'
                      }`}>
                        <div>
                          <p className="text-sm font-medium text-csf-dark">{opt.name}</p>
                          {opt.price > 0 && (
                            <p className="text-xs text-csf-muted">+{opt.price.toFixed(2)} €</p>
                          )}
                          {opt.price === 0 && (
                            <p className="text-xs text-csf-muted">Inclus</p>
                          )}
                        </div>
                        <input type="radio" name="cage" checked={selectedCageOptionId === opt.id}
                          onChange={() => setSelectedCageOptionId(opt.id)}
                          className="w-5 h-5 text-csf-orange" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Meals */}
              {exhibition.mealsEnabled && (
                <div>
                  <p className="text-xs font-semibold text-csf-muted uppercase tracking-wide mb-3">Repas</p>
                  <div className="flex items-center justify-between p-3 border-2 rounded-xl border-csf-light">
                    <div>
                      <p className="text-sm font-medium text-csf-dark">Nombre de repas</p>
                      <p className="text-xs text-csf-muted">{exhibition.priceMeal.toFixed(2)} € / repas</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button"
                        onClick={() => setMealsCount((c) => Math.max(0, c - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 text-csf-dark hover:bg-csf-light flex items-center justify-center font-bold">
                        −
                      </button>
                      <span className="w-6 text-center font-medium text-sm">{mealsCount}</span>
                      <button type="button"
                        onClick={() => setMealsCount((c) => c + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 text-csf-dark hover:bg-csf-light flex items-center justify-center font-bold">
                        +
                      </button>
                    </div>
                  </div>
                  {exhibition.mealsRequired && mealsCount === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Ce champ est obligatoire pour cette exposition.</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('options')} className="btn-secondary">← Retour</button>
              <button
                onClick={() => setStep('summary')}
                disabled={exhibition.mealsEnabled && exhibition.mealsRequired && mealsCount === 0}
                className="btn-primary">
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

              {/* Per-cat lines */}
              {selectedCats.map((cat) => {
                const opts = catOptions[cat.id] ?? defaultCatEntry()
                return (
                  <div key={cat.id} className="border border-csf-light rounded-xl p-3">
                    <div className="flex justify-between">
                      <p className="font-medium text-csf-dark">{cat.name}</p>
                      <span className="text-csf-muted text-xs">{currentBasePrice.toFixed(2)} €</span>
                    </div>
                    <div className="space-y-0.5 mt-1 text-xs text-csf-muted">
                      {opts.participationDays.length > 0 && (
                        <p>{opts.participationDays.join(' + ')}</p>
                      )}
                      {opts.traditionalClass && <p>Classe : {opts.traditionalClass}</p>}
                      {opts.isHorsConcours && <p>Hors Concours</p>}
                      {opts.specialParticipations.length > 0 && (
                        <p>{opts.specialParticipations.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Applied pricing tier info */}
              {pricingTiers.length > 0 && (
                <div className="flex justify-between py-1 text-xs text-csf-muted">
                  <span>Tarif appliqué</span>
                  <span>
                    {currentBasePrice.toFixed(2)} € / chat
                    {lastTierIdx >= 0 && selectedCatIds.length >= sortedTiers[lastTierIdx]?.minCats
                      ? ` (${sortedTiers[lastTierIdx].minCats}+ chats)`
                      : ` (${selectedCatIds.length} chat${selectedCatIds.length > 1 ? 's' : ''})`}
                  </span>
                </div>
              )}

              {/* Cats subtotal */}
              <div className="flex justify-between text-sm py-1 border-t border-csf-light">
                <span className="text-csf-muted">
                  {selectedCatIds.length} chat{selectedCatIds.length > 1 ? 's' : ''} × {currentBasePrice.toFixed(2)} €
                </span>
                <span>{catsTotal.toFixed(2)} €</span>
              </div>

              {/* Cage option line */}
              {selectedCageOption && (
                <div className="flex justify-between text-sm text-csf-muted">
                  <span>Cage ({selectedCageOption.name})</span>
                  <span>+{cagePrice.toFixed(2)} €</span>
                </div>
              )}

              {/* Meals line */}
              {mealsCount > 0 && (
                <div className="flex justify-between text-sm text-csf-muted">
                  <span>{mealsCount} repas × {exhibition.priceMeal.toFixed(2)} €</span>
                  <span>+{mealsPrice.toFixed(2)} €</span>
                </div>
              )}

              <div className="flex justify-between py-3 font-bold text-csf-dark text-lg border-t border-csf-light">
                <span>Total</span>
                <span className="text-csf-orange">{totalAmount.toFixed(2)} €</span>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <p className="text-xs text-csf-muted mt-3">
              Le paiement s&apos;effectue par virement bancaire après validation de votre inscription.
            </p>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(hasLogisticsStep ? 'logistics' : 'options')} className="btn-secondary">
                ← Retour
              </button>
              <button onClick={submit} disabled={submitting} className="btn-primary">
                {submitting ? 'Envoi...' : "Confirmer l'inscription"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
