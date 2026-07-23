import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const registration = await prisma.registration.findUnique({
      where: { id },
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Allow deletion only if the user is the owner or an admin
    if (registration.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // A payment that has been completed should not be deleted, but refunded
    // We allow deletion for all status for now for simplicity, but this should be refined
    // For example, a VALIDATED registration might need a refund process.
    // For now, we allow deletion of VALIDATED registrations.

    await prisma.registration.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Registration deleted successfully' })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
