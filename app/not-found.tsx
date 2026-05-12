import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-csf-cream flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-csf-orange font-serif mb-4">404</p>
        <h1 className="text-2xl font-bold text-csf-dark mb-2">Page introuvable</h1>
        <p className="text-csf-muted mb-6">Cette page n&apos;existe pas ou a été déplacée.</p>
        <Link href="/" className="btn-primary">Retour à l&apos;accueil</Link>
      </div>
    </div>
  )
}
