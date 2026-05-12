import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TeamMemberForm } from '@/components/admin/TeamMemberForm'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminTeamEdit({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const member = await prisma.teamMember.findUnique({
    where: { id: params.id },
  })

  if (!member) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-csf-dark">Modifier le membre</h1>
        <p className="text-csf-muted">{member.name}</p>
      </div>

      <TeamMemberForm
        memberId={member.id}
        defaultValues={{
          name: member.name,
          role: member.role,
          bio: member.bio || '',
          photoUrl: member.photoUrl,
          active: member.active,
          order: member.order,
        }}
      />
    </div>
  )
}
