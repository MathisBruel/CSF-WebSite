import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { formatDate, EXHIBITION_STATUS_LABELS } from '@/lib/utils'
import { ExhibitionStatusToggle } from '@/components/admin/ExhibitionStatusToggle'
import { DeleteExhibitionButton } from '@/components/admin/DeleteExhibitionButton'

export default async function AdminExpositions() {
  const exhibitions = await prisma.exhibition.findMany({
    orderBy: { startDate: 'desc' },
    include: { _count: { select: { registrations: true } } },
  })

  const statusColors: Record<string, string> = {
    DRAFT: 'badge-blue', OPEN: 'badge-green', CLOSED: 'badge-yellow', CANCELLED: 'badge-red', ARCHIVED: 'badge-gray',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-csf-dark">Expositions</h1>
          <p className="text-csf-muted">{exhibitions.length} exposition{exhibitions.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/expositions/nouvelle" className="btn-primary">
          + Nouvelle exposition
        </Link>
      </div>

      <div className="space-y-4">
        {exhibitions.map((expo) => (
          <div key={expo.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${statusColors[expo.status]}`}>
                    {EXHIBITION_STATUS_LABELS[expo.status]}
                  </span>
                  <span className="text-xs text-csf-muted">{expo.city}</span>
                </div>
                <h3 className="font-bold font-serif text-csf-dark text-lg">{expo.title}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-csf-muted">
                  <span>{formatDate(expo.startDate)} – {formatDate(expo.endDate)}</span>
                  <span>{expo.location}</span>
                  <span>{expo._count.registrations} inscrits{expo.maxRegistrations ? ` / ${expo.maxRegistrations}` : ''}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <ExhibitionStatusToggle expoId={expo.id} currentStatus={expo.status} />
                <div className="flex gap-2 flex-wrap justify-end">
                  <Link href={`/admin/inscriptions?expo=${expo.id}`}
                    className="text-xs px-3 py-1.5 border border-gray-300 text-csf-dark rounded-lg hover:bg-gray-50 transition-colors">
                    Inscrits
                  </Link>
                  <Link href={`/admin/expositions/${expo.id}/edit`}
                    className="text-xs px-3 py-1.5 border border-csf-orange text-csf-orange rounded-lg hover:bg-orange-50 transition-colors">
                    Modifier
                  </Link>
                  <a href={`/api/admin/exhibitions/${expo.id}/export`}
                    className="text-xs px-3 py-1.5 bg-csf-dark text-white rounded-lg hover:bg-csf-darker transition-colors">
                    Exporter CSV
                  </a>
                  <DeleteExhibitionButton expoId={expo.id} expoTitle={expo.title} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
