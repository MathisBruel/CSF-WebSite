'use client'

import { useRouter } from 'next/navigation'

interface Exhibition {
  id: string
  title: string
}

export function RegistrationFilters({
  exhibitions,
  currentExpo,
  currentFilter,
}: {
  exhibitions: Exhibition[]
  currentExpo?: string
  currentFilter?: string
}) {
  const router = useRouter()

  const handleExhibitionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const expoId = e.target.value
    if (expoId) {
      router.push(`/admin/inscriptions?expo=${expoId}`)
    } else {
      router.push('/admin/inscriptions')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
      <a
        href="/admin/inscriptions"
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          !currentFilter && !currentExpo ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
        }`}
      >
        Toutes
      </a>
      <a
        href="/admin/inscriptions?filter=pending"
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          currentFilter === 'pending' ? 'bg-csf-dark text-white' : 'text-csf-muted hover:bg-gray-100'
        }`}
      >
        En attente
      </a>
      <select
        value={currentExpo || ''}
        onChange={handleExhibitionChange}
        className="ml-auto form-select text-sm py-1.5 w-64"
      >
        <option value="">Toutes les expositions</option>
        {exhibitions.map((e) => (
          <option key={e.id} value={e.id}>
            {e.title}
          </option>
        ))}
      </select>
      {currentExpo && (
        <a
          href={`/api/admin/exhibitions/${currentExpo}/export`}
          className="btn-primary text-sm py-1.5 px-4"
        >
          Exporter CSV
        </a>
      )}
    </div>
  )
}
