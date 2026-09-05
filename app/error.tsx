'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-csf-bg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-full.png" alt="Chats Sans Frontières" className="h-14 object-contain mb-6" />
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-6">
        🐾
      </div>
      <h1 className="text-2xl font-bold font-serif text-csf-dark mb-3">
        Le site rencontre une erreur
      </h1>
      <p className="text-csf-muted max-w-md leading-relaxed mb-2">
        Nous sommes au courant du problème et travaillons à le résoudre.
        Le site sera rétabli dans les plus brefs délais.
      </p>
      <p className="text-csf-muted max-w-md leading-relaxed mb-6">
        Si le problème persiste, contactez-nous à{' '}
        <a href="mailto:contact@assocsf.fr" className="text-csf-orange underline">
          contact@assocsf.fr
        </a>
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary text-sm">
          Réessayer
        </button>
        <a href="/" className="text-sm px-4 py-2 border border-gray-300 text-csf-dark rounded-lg hover:bg-gray-50 transition-colors">
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  )
}
