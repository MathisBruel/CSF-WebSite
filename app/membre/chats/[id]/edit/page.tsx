import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AddCatForm } from '@/components/membre/AddCatForm'

type Props = { params: { id: string } }

export default async function EditCatPage({ params }: Props) {
  const session = await auth()
  if (!session) return null

  const cat = await prisma.cat.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  })

  if (!cat) notFound()

  const initialData = {
    name: cat.name,
    breed: cat.breed,
    color: cat.color,
    gender: cat.gender,
    birthDate: cat.birthDate.toISOString().split('T')[0],
    eyeColor: cat.eyeColor,
    breeder: cat.breeder,
    countryOfOrigin: cat.countryOfOrigin,
    father: cat.father,
    mother: cat.mother,
    isHouseCat: cat.isHouseCat,
    icadNumber: cat.icadNumber,
    pedigreeNumber: cat.pedigreeNumber,
    pedigreeInProgress: cat.pedigreeInProgress,
    foreignCatCertificate: cat.foreignCatCertificate,
    inscritChampionnatFrance: cat.inscritChampionnatFrance,
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/membre/chats/${cat.id}`} className="text-sm text-csf-muted hover:text-csf-orange transition-colors">
          ← {cat.name}
        </Link>
        <h1 className="text-2xl font-bold font-serif text-csf-dark mt-1">Modifier {cat.name}</h1>
      </div>
      <AddCatForm catId={cat.id} initialData={initialData} />
    </div>
  )
}
