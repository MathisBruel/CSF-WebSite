import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/membre/dashboard')

  const pendingMembershipRequests = await prisma.membershipRequest.count({
    where: { status: 'PENDING' },
  })

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminNav pendingMembershipRequests={pendingMembershipRequests} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
