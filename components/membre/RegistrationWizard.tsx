'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Exhibition, Cat } from '@prisma/client'
import { computeCatPrice, formatPrice, type GlobalPricing } from '@/lib/utils'

type Step = 'cats' | 'options' | 'cage' | 'summary' | 'done'

type CatEntry = {
  participationDays: string[]
  traditionalClass: string
  traditionalClassOther: string
  isHorsConcours: boolean
  isHouseCat: boolean
  wantsComplianceExam: boolean
  wantsDiploma: boolean
  specialParticipations: string[]
}

const defaultCatEntry = (): CatEntry => ({
  participationDays: [],
  traditionalClass: '',
  traditionalClassOther: '',
  isHorsConcours: false,
  isHouseCat: false,
  wantsComplianceExam: false,
  wantsDiploma: false,
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
  pricing,
  isMember,
}: {
  exhibition: Exhibition
  cats: (Cat & { catDocuments: { type: string; validated: boolean }[] })[]
  pricing: GlobalPricing
  isMember: boolean
}) {
  const [step, setStep] = useState<Step>('cats')
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [catOptions, setCatOptions] = useState<Record<string, CatEntry>>({})
  const [needsCage, setNeedsCage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  const catPrices = selectedCatIds.map((catId, idx) => {
    const opts = catOptions[catId] ?? defaultCatEntry()
    return computeCatPrice(
      idx + 1,
      opts.participationDays,
      opts.isHouseCat,
      opts.wantsComplianceExam,
      opts.wantsDiploma,
      isMember,
      pricing
    )
  })
  const catsTotal = catPrices.reduce((s, p) => s + p, 0)
  const totalAmount = pricing.registrationFee + catsTotal

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
      cats: selectedCatIds.map((catId) => ({
        catId,
        ...(catOptions[catId] ?? defaultCatEntry()),
      })),
      needsCage,
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

  const steps: Step[] = ['cats', 'options', 'cage', 'summary']
  const stepLabels = ['Chats', 'Options', 'Cage', 'Récapitulatif']
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
        {isMember && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Tarif adhérent appliqué
          </span>
        )}
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
                  opts.isHouseCat,
                  opts.wantsComplianceExam,
                  opts.wantsDiploma,
                  isMember,
                  pricing
                )
                return (
                  <div key={cat.id} className="border border-csf-light rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-csf-light">
                      <h3 className="font-medium text-csf-dark">
                        {idx + 1}. {cat.name}{' '}
                        <span className="text-sm font-normal text-csf-muted">({cat.breed})</span>
                      </h3>
                      <span className="text-sm font-semibold text-csf-orange">{formatPrice(catPrice)}</span>
                    </div>

                    <div className="space-y-4">
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
                        <input type="checkbox" checked={opts.isHouseCat}
                          onChange={(e) => update('isHouseCat', e.target.checked)}
                          className="text-csf-orange rounded" />
                        <span className="text-sm font-medium">Chat de maison</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={opts.isHorsConcours}
                          onChange={(e) => update('isHorsConcours', e.target.checked)}
                          className="text-csf-orange rounded" />
                        <span className="text-sm font-medium">Hors Concours (H.C.)</span>
                      </label>

                      {!opts.isHorsConcours && !opts.isHouseCat && (
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
                        <span className="text-sm">
                          Examen de conformité{' '}
                          <span className="text-csf-muted">
                            (+{formatPrice(isMember ? pricing.memberConformite : pricing.nonMemberConformite)})
                          </span>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={opts.wantsDiploma}
                          onChange={(e) => update('wantsDiploma', e.target.checked)}
                          className="text-csf-orange rounded" />
                        <span className="text-sm">
                          Diplôme{' '}
                          <span className="text-csf-muted">
                            {isMember
                              ? pricing.memberDiploma === 0 ? '(gratuit)' : `(+${formatPrice(pricing.memberDiploma)})`
                              : pricing.nonMemberDiploma === 0 ? '(gratuit)' : `(+${formatPrice(pricing.nonMemberDiploma)})`
                            }
                          </span>
                        </span>
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
              <button onClick={() => setStep('cage')} className="btn-primary">Suivant →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Cage ── */}
        {step === 'cage' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-1">Cage</h2>
            <p className="text-sm text-csf-muted mb-5">Les cages sont fournies gratuitement par le club.</p>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mb-5">
              <p className="text-sm font-medium text-csf-dark mb-1">Caution cage</p>
              <p className="text-sm text-csf-muted">
                Une caution de <strong className="text-csf-dark">{formatPrice(pricing.cageDeposit)}</strong> par chèque
                vous sera demandée sur place lors du retrait de votre cage. Elle vous sera restituée en fin d&apos;exposition.
              </p>
            </div>

            <div className="space-y-2">
              <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                !needsCage ? 'border-csf-orange bg-orange-50' : 'border-csf-light hover:border-csf-orange/50'
              }`}>
                <div>
                  <p className="text-sm font-medium text-csf-dark">Je n&apos;ai pas besoin d&apos;une cage</p>
                  <p className="text-xs text-csf-muted">J&apos;apporte ma propre cage</p>
                </div>
                <input type="radio" name="cage" checked={!needsCage}
                  onChange={() => setNeedsCage(false)}
                  className="w-5 h-5 text-csf-orange" />
              </label>
              <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                needsCage ? 'border-csf-orange bg-orange-50' : 'border-csf-light hover:border-csf-orange/50'
              }`}>
                <div>
                  <p className="text-sm font-medium text-csf-dark">Je souhaite une cage du club</p>
                  <p className="text-xs text-csf-muted">Gratuit · caution {formatPrice(pricing.cageDeposit)} par chèque sur place</p>
                </div>
                <input type="radio" name="cage" checked={needsCage}
                  onChange={() => setNeedsCage(true)}
                  className="w-5 h-5 text-csf-orange" />
              </label>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('options')} className="btn-secondary">← Retour</button>
              <button onClick={() => setStep('summary')} className="btn-primary">Suivant →</button>
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

              {/* Per-cat lines */}
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
                      {opts.isHouseCat && <p>Chat de maison</p>}
                      {opts.traditionalClass && !opts.isHouseCat && <p>Classe : {opts.traditionalClass}</p>}
                      {opts.isHorsConcours && <p>Hors Concours</p>}
                      {opts.wantsComplianceExam && <p>Conformité</p>}
                      {opts.wantsDiploma && <p>Diplôme</p>}
                      {opts.specialParticipations.length > 0 && <p>{opts.specialParticipations.join(', ')}</p>}
                    </div>
                  </div>
                )
              })}

              {needsCage && (
                <div className="flex justify-between text-csf-muted">
                  <span>Cage club</span>
                  <span>Gratuit (caution {formatPrice(pricing.cageDeposit)} sur place)</span>
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
              Le paiement s&apos;effectue par virement bancaire après validation de votre inscription.
            </p>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('cage')} className="btn-secondary">← Retour</button>
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
