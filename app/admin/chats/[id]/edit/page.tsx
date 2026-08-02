import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AddCatForm } from '@/components/membre/AddCatForm'

type Props = { params: { id: string } }

export default async function AdminEditCatPage({ params }: Props) {
  const cat = await prisma.cat.findUnique({
    where: { id: params.id },
    include: { owner: { select: { name: true } } },
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
    icadNumber: cat.icadNumber,
    pedigreeNumber: cat.pedigreeNumber,
    pedigreeInProgress: cat.pedigreeInProgress,
    foreignCatCertificate: cat.foreignCatCertificate,
    inscritChampionnatFrance: cat.inscritChampionnatFrance,
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/chats" className="text-sm text-csf-muted hover:text-csf-orange transition-colors">
          ← Chats
        </Link>
        <h1 className="text-2xl font-bold font-serif text-csf-dark mt-1">Modifier {cat.name}</h1>
        <p className="text-csf-muted text-sm">Exposant : {cat.owner.name}</p>
      </div>
      <AddCatForm catId={cat.id} initialData={initialData} editRedirectTo="/admin/chats" />
    </div>
  )
}
