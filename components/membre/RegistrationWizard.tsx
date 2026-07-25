'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Exhibition, Cat, ExhibitionSpecial } from '@prisma/client'
import { computeCatPrice, formatPrice, type GlobalPricing } from '@/lib/utils'
import { computeAvailableClasses } from '@/lib/cat-data'

type Step = 'cats' | 'options' | 'cage' | 'summary' | 'done'

type CatEntry = {
  participationDays: string[]
  traditionalClass: string
  wantsComplianceExam: boolean
  specialParticipations: string[]
}

const defaultCatEntry = (): CatEntry => ({
  participationDays: [],
  traditionalClass: '',
  wantsComplianceExam: false,
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
}: {
  exhibition: Exhibition & { specials: ExhibitionSpecial[] }
  cats: (Cat & { isHouseCat: boolean })[]
  pricing: GlobalPricing
  isMember: boolean
}) {
  const [step, setStep] = useState<Step>('cats')
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [catOptions, setCatOptions] = useState<Record<string, CatEntry>>({})
  const [personalCages, setPersonalCages] = useState(0)
  const [borrowedCages, setBorrowedCages] = useState(0)
  const [cageSpecialRequest, setCageSpecialRequest] = useState('')
  const [wantsSpecialCage, setWantsSpecialCage] = useState(false)
  const [nextTo, setNextTo] = useState('')
  const [comment, setComment] = useState('')
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
    const cat = cats.find((c) => c.id === catId)!
    const opts = catOptions[catId] ?? defaultCatEntry()
    return computeCatPrice(
      idx + 1,
      opts.participationDays,
      cat.isHouseCat,
      opts.wantsComplianceExam,
      false,
      isMember,
      pricing
    )
  })
  const catsTotal = catPrices.reduce((s, p) => s + p, 0)
  const totalAmount = pricing.registrationFee + catsTotal

  const standardCageLength = computeCageLength(selectedCatIds.length)

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
      personalCages,
      borrowedCages,
      cageSpecialLengthRequest: wantsSpecialCage ? cageSpecialRequest : undefined,
      nextTo: nextTo || undefined,
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
                  cat.isHouseCat,
                  opts.wantsComplianceExam,
                  false,
                  isMember,
                  pricing
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

                      <div>
                        <label className="form-label text-sm">Classe de jugement</label>
                        {availableClasses.length === 0 ? (
                          <p className="text-sm text-red-500">Chat trop jeune pour cette exposition.</p>
                        ) : (
                          <select className="form-select" value={opts.traditionalClass}
                            onChange={(e) => update('traditionalClass', e.target.value)}>
                            <option value="">Sélectionner une classe</option>
                            {availableClasses.map((c) => (
                              <option key={c.idClasses} value={c.nom}>{c.nom}</option>
                            ))}
                          </select>
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
          <div className="space-y-5">
            <h2 className="font-bold text-csf-dark">Cage</h2>

            {/* Cage length info — always shown */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-csf-dark">
                  Longueur standard pour {selectedCatIds.length} chat{selectedCatIds.length > 1 ? 's' : ''}
                </p>
                <span className="text-sm font-bold text-csf-orange">{standardCageLength} cm</span>
              </div>
              <p className="text-xs text-csf-muted">1 chat = 80 cm · chaque chat supplémentaire = +60 cm</p>
            </div>

            {/* Personal cages */}
            <div className="p-4 border border-csf-light rounded-xl space-y-1">
              <p className="text-sm font-medium text-csf-dark">Cages personnelles</p>
              <p className="text-xs text-csf-muted mb-3">Nombre de cages que vous apportez vous-même</p>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setPersonalCages(Math.max(0, personalCages - 1))}
                  className="w-8 h-8 rounded-full border border-csf-light flex items-center justify-center text-csf-dark hover:bg-csf-light transition-colors font-bold">−</button>
                <span className="w-8 text-center font-bold text-csf-dark">{personalCages}</span>
                <button type="button"
                  onClick={() => setPersonalCages(personalCages + 1)}
                  className="w-8 h-8 rounded-full border border-csf-light flex items-center justify-center text-csf-dark hover:bg-csf-light transition-colors font-bold">+</button>
              </div>
            </div>

            {/* Borrowed cages */}
            <div className="p-4 border border-csf-light rounded-xl space-y-1">
              <p className="text-sm font-medium text-csf-dark">Cages empruntées au club</p>
              <p className="text-xs text-csf-muted mb-3">Nombre de cages à emprunter — gratuit, caution {formatPrice(pricing.cageDeposit)} par cage par chèque sur place</p>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setBorrowedCages(Math.max(0, borrowedCages - 1))}
                  className="w-8 h-8 rounded-full border border-csf-light flex items-center justify-center text-csf-dark hover:bg-csf-light transition-colors font-bold">−</button>
                <span className="w-8 text-center font-bold text-csf-dark">{borrowedCages}</span>
                <button type="button"
                  onClick={() => setBorrowedCages(borrowedCages + 1)}
                  className="w-8 h-8 rounded-full border border-csf-light flex items-center justify-center text-csf-dark hover:bg-csf-light transition-colors font-bold">+</button>
              </div>
              {borrowedCages > 0 && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  Caution : {formatPrice(pricing.cageDeposit * borrowedCages)} ({borrowedCages} × {formatPrice(pricing.cageDeposit)}) — chèque remis sur place, restitué en fin d&apos;expo
                </p>
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
                      {cat.isHouseCat && <p>Chat de maison</p>}
                      {opts.traditionalClass && <p>Classe : {opts.traditionalClass}</p>}
                      {opts.wantsComplianceExam && <p>Conformité</p>}
                      {opts.specialParticipations.length > 0 && <p>Spéciaux : {opts.specialParticipations.join(', ')}</p>}
                    </div>
                  </div>
                )
              })}

              <div className="text-csf-muted space-y-0.5">
                <div className="flex justify-between">
                  <span>Longueur cage standard</span>
                  <span className="font-medium text-csf-dark">{standardCageLength} cm</span>
                </div>
                {personalCages > 0 && (
                  <div className="flex justify-between">
                    <span>Cage{personalCages > 1 ? 's' : ''} personnelle{personalCages > 1 ? 's' : ''}</span>
                    <span>{personalCages}</span>
                  </div>
                )}
                {borrowedCages > 0 && (
                  <div className="flex justify-between">
                    <span>Cage{borrowedCages > 1 ? 's' : ''} empruntée{borrowedCages > 1 ? 's' : ''} au club</span>
                    <span>{borrowedCages} — caution {formatPrice(pricing.cageDeposit * borrowedCages)} sur place</span>
                  </div>
                )}
                {wantsSpecialCage && cageSpecialRequest && (
                  <p className="text-xs italic">Longueur spéciale : {cageSpecialRequest}</p>
                )}
              </div>

              {nextTo && (
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
