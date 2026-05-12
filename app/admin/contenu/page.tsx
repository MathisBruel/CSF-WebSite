import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { formatDate } from '@/lib/utils'
import { DeleteButton } from '@/components/admin/DeleteButton'

export default async function AdminContenu() {
  const [news, teamMembers] = await Promise.all([
    prisma.news.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { author: { select: { name: true } } } }),
    prisma.teamMember.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold font-serif text-csf-dark">Gestion du contenu</h1>

      {/* News */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-csf-dark">Actualités</h2>
          <Link href="/admin/contenu/actualites/nouvelle" className="btn-primary text-sm py-1.5 px-4">
            + Nouvel article
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {news.map((article) => (
            <div key={article.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-csf-dark text-sm">{article.title}</p>
                <p className="text-xs text-csf-muted">
                  {article.author.name} · {formatDate(article.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${article.published ? 'badge-green' : 'badge-gray'}`}>
                  {article.published ? 'Publié' : 'Brouillon'}
                </span>
                <Link href={`/admin/contenu/actualites/${article.id}/edit`}
                  className="text-xs text-csf-orange hover:text-csf-orange-dark">
                  Modifier
                </Link>
                <DeleteButton
                  endpoint={`/api/admin/news/${article.id}`}
                  itemName={article.title}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-csf-dark">Équipe</h2>
          <Link href="/admin/contenu/equipe/nouveau" className="btn-primary text-sm py-1.5 px-4">
            + Nouveau membre
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-csf-dark text-sm">{member.name}</p>
                <p className="text-xs text-csf-muted">{member.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${member.active ? 'badge-green' : 'badge-gray'}`}>
                  {member.active ? 'Actif' : 'Inactif'}
                </span>
                <Link href={`/admin/contenu/equipe/${member.id}/edit`}
                  className="text-xs text-csf-orange hover:text-csf-orange-dark">
                  Modifier
                </Link>
                <DeleteButton
                  endpoint={`/api/admin/team/${member.id}`}
                  itemName={member.name}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
