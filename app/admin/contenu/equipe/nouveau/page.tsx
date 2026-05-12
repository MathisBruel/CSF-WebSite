import { auth } from '@/lib/auth'
import { TeamMemberForm } from '@/components/admin/TeamMemberForm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminTeamNew() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Ajouter un membre d&apos;équipe</h1>
        <p className="text-csf-muted">Ajouter une nouvelle personne à l&apos;équipe du club</p>
      </div>

      <TeamMemberForm />
    </div>
  )
}
