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
        <p className="section-subtitle mt-2">Les bénévoles qui font vivre Chats Sans Frontières depuis 2005</p>
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
            <div className="flex items-center justify-center gap-3 mt-3">
              {member.email && (
                <a href={`mailto:${member.email}`} title="Email"
                  className="w-8 h-8 rounded-full bg-csf-light/60 flex items-center justify-center text-csf-muted hover:text-csf-orange hover:bg-csf-orange/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} title="Téléphone"
                  className="w-8 h-8 rounded-full bg-csf-light/60 flex items-center justify-center text-csf-muted hover:text-csf-orange hover:bg-csf-orange/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
              {member.instagram && (
                <a href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer" title="Instagram"
                  className="w-8 h-8 rounded-full bg-csf-light/60 flex items-center justify-center text-csf-muted hover:text-csf-orange hover:bg-csf-orange/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {member.facebook && (
                <a href={member.facebook.startsWith('http') ? member.facebook : `https://facebook.com/${member.facebook}`} target="_blank" rel="noopener noreferrer" title="Facebook"
                  className="w-8 h-8 rounded-full bg-csf-light/60 flex items-center justify-center text-csf-muted hover:text-csf-orange hover:bg-csf-orange/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
            </div>
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
        <a href="mailto:contact@assocsf.fr"
          className="btn-primary">
          Nous contacter
        </a>
      </div>
    </div>
  )
}
