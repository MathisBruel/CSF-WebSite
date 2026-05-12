'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Exhibition, Cat } from '@prisma/client'

type Step = 'cat' | 'options' | 'summary' | 'done'

interface WizardState {
  catId: string
  wantsCage: boolean
  wantsDoubleCage: boolean
  mealsCount: number
}

export function RegistrationWizard({
  exhibition,
  cats,
}: {
  exhibition: Exhibition
  cats: (Cat & { catDocuments: { type: string; validated: boolean }[] })[]
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('cat')
  const [state, setState] = useState<WizardState>({
    catId: '',
    wantsCage: false,
    wantsDoubleCage: false,
    mealsCount: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedCat = cats.find((c) => c.id === state.catId)

  const totalAmount =
    exhibition.priceBase +
    (state.wantsCage ? exhibition.priceCage : 0) +
    (state.wantsDoubleCage ? exhibition.priceDoubleCage : 0) +
    state.mealsCount * exhibition.priceMeal

  const steps: Step[] = ['cat', 'options', 'summary']
  const stepLabels = ['Chat', 'Options', 'Récapitulatif']
  const currentStepIdx = steps.indexOf(step)

  const submit = async () => {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...state, exhibitionId: exhibition.id }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Erreur lors de l\'inscription')
      return
    }
    setStep('done')
  }

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
      {/* Header */}
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

      {/* Step content */}
      <div className="card">
        {step === 'cat' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-4">Sélectionner un chat</h2>
            {cats.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-csf-muted mb-3">Vous n&apos;avez pas de chat disponible pour cette exposition.</p>
                <Link href="/membre/chats/nouveau" className="btn-primary text-sm">
                  Ajouter un chat
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cats.map((cat) => {
                  const hasAllDocs = ['PEDIGREE', 'ICAD', 'VACCIN'].every(
                    (t) => cat.catDocuments.some((d) => d.type === t)
                  )
                  return (
                    <label key={cat.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        state.catId === cat.id
                          ? 'border-csf-orange bg-orange-50'
                          : 'border-csf-light hover:border-csf-orange/50'
                      }`}>
                      <input type="radio" name="cat" value={cat.id}
                        checked={state.catId === cat.id}
                        onChange={() => setState({ ...state, catId: cat.id })}
                        className="text-csf-orange" />
                      <div className="flex-1">
                        <p className="font-medium text-csf-dark">{cat.name}</p>
                        <p className="text-sm text-csf-muted">{cat.breed} · {cat.gender}</p>
                      </div>
                      {!hasAllDocs && (
                        <span className="badge badge-yellow text-xs">Docs manquants</span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setStep('options')}
                disabled={!state.catId}
                className="btn-primary">
                Suivant →
              </button>
            </div>
          </div>
        )}

        {step === 'options' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-4">Options et services</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer hover:border-csf-orange/50 transition-colors">
                <div>
                  <p className="font-medium text-csf-dark">Location d&apos;une cage simple</p>
                  <p className="text-sm text-csf-muted">+{exhibition.priceCage.toFixed(2)} €</p>
                </div>
                <input type="checkbox" checked={state.wantsCage}
                  onChange={(e) => setState({ ...state, wantsCage: e.target.checked, wantsDoubleCage: false })}
                  className="w-5 h-5 text-csf-orange rounded" />
              </label>

              <label className="flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer hover:border-csf-orange/50 transition-colors">
                <div>
                  <p className="font-medium text-csf-dark">Location d&apos;une cage double</p>
                  <p className="text-sm text-csf-muted">+{exhibition.priceDoubleCage.toFixed(2)} €</p>
                </div>
                <input type="checkbox" checked={state.wantsDoubleCage}
                  onChange={(e) => setState({ ...state, wantsDoubleCage: e.target.checked, wantsCage: false })}
                  className="w-5 h-5 text-csf-orange rounded" />
              </label>

              <div className="flex items-center justify-between p-4 border-2 rounded-xl border-csf-light">
                <div>
                  <p className="font-medium text-csf-dark">Repas (journée)</p>
                  <p className="text-sm text-csf-muted">{exhibition.priceMeal.toFixed(2)} € / repas</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setState({ ...state, mealsCount: Math.max(0, state.mealsCount - 1) })}
                    className="w-8 h-8 rounded-full border border-gray-300 text-csf-dark hover:bg-csf-light flex items-center justify-center font-bold">
                    −
                  </button>
                  <span className="w-6 text-center font-medium">{state.mealsCount}</span>
                  <button type="button"
                    onClick={() => setState({ ...state, mealsCount: Math.min(4, state.mealsCount + 1) })}
                    className="w-8 h-8 rounded-full border border-gray-300 text-csf-dark hover:bg-csf-light flex items-center justify-center font-bold">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('cat')} className="btn-secondary">← Retour</button>
              <button onClick={() => setStep('summary')} className="btn-primary">Suivant →</button>
            </div>
          </div>
        )}

        {step === 'summary' && (
          <div>
            <h2 className="font-bold text-csf-dark mb-4">Récapitulatif</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-csf-light">
                <span className="text-csf-muted">Exposition</span>
                <span className="font-medium text-csf-dark text-right max-w-48">{exhibition.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-csf-light">
                <span className="text-csf-muted">Chat</span>
                <span className="font-medium text-csf-dark">{selectedCat?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-csf-light">
                <span className="text-csf-muted">Inscription de base</span>
                <span>{exhibition.priceBase.toFixed(2)} €</span>
              </div>
              {state.wantsCage && (
                <div className="flex justify-between py-2 border-b border-csf-light">
                  <span className="text-csf-muted">Cage simple</span>
                  <span>+{exhibition.priceCage.toFixed(2)} €</span>
                </div>
              )}
              {state.wantsDoubleCage && (
                <div className="flex justify-between py-2 border-b border-csf-light">
                  <span className="text-csf-muted">Cage double</span>
                  <span>+{exhibition.priceDoubleCage.toFixed(2)} €</span>
                </div>
              )}
              {state.mealsCount > 0 && (
                <div className="flex justify-between py-2 border-b border-csf-light">
                  <span className="text-csf-muted">{state.mealsCount} repas</span>
                  <span>+{(state.mealsCount * exhibition.priceMeal).toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between py-3 font-bold text-csf-dark text-lg">
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
              <button onClick={() => setStep('options')} className="btn-secondary">← Retour</button>
              <button onClick={submit} disabled={submitting} className="btn-primary">
                {submitting ? 'Envoi...' : 'Confirmer l\'inscription'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
