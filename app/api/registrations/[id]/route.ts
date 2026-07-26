import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyAdminRegistrationCancelled } from '@/lib/email'
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
      include: {
        user: { select: { name: true, email: true } },
        exhibition: { select: { id: true, title: true, startDate: true, city: true } },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (registration.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.registration.delete({ where: { id } })

    notifyAdminRegistrationCancelled(registration.user, registration.exhibition).catch(console.error)

    return NextResponse.json({ message: 'Registration deleted successfully' })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
