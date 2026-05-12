import type { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: "L'Équipe" }

export default async function EquipePage() {
  const team = await prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="section-title">Notre Équipe</h1>
        <p className="section-subtitle mt-2">Les passionnés qui font vivre Chats Sans Frontières</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.map((member) => (
          <div key={member.id} className="card text-center group hover:shadow-md transition-shadow">
            <div className="w-24 h-24 rounded-full bg-csf-light mx-auto mb-4 overflow-hidden flex items-center justify-center">
              {member.photoUrl ? (
                <Image src={member.photoUrl} alt={member.name} width={96} height={96}
                  className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-csf-orange font-serif">
                  {member.name.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="font-bold font-serif text-csf-dark text-lg">{member.name}</h3>
            <p className="text-csf-orange font-medium text-sm mt-1">{member.role}</p>
            {member.bio && (
              <p className="text-csf-muted text-sm mt-3 leading-relaxed">{member.bio}</p>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1 mt-3 text-xs text-csf-muted hover:text-csf-orange transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {member.email}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Join section */}
      <div className="mt-16 text-center bg-csf-dark rounded-2xl p-10 text-white">
        <h2 className="text-2xl font-bold font-serif mb-3">Envie de nous rejoindre ?</h2>
        <p className="text-csf-light/70 mb-6 max-w-lg mx-auto">
          Le bureau recherche des bénévoles motivés pour aider à l&apos;organisation des expositions.
          N&apos;hésitez pas à nous contacter !
        </p>
        <a href="mailto:contact@chats-sans-frontieres.fr"
          className="btn-primary">
          Nous contacter
        </a>
      </div>
    </div>
  )
}
