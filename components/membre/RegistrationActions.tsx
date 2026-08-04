'use client'

export function RegistrationActions({ registration }: { registration: { id: string, status: string }, exhibitionSlug?: string }) {
  return (
    <div className="mt-4 pt-4 border-t border-csf-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 rounded-lg px-3 py-2 text-amber-900 w-full">
        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Pour toute demande d&apos;annulation, veuillez contacter l&apos;association à{' '}
          <a href="mailto:contact@assocsf.fr?subject=Demande d'annulation d'inscription" className="font-semibold text-csf-orange hover:underline">
            contact@assocsf.fr
          </a>
        </span>
      </div>
    </div>
  )
}
