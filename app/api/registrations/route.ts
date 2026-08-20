import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ExhibitionStatus } from '@prisma/client'
import { computeCatPrice, DEFAULT_PRICING } from '@/lib/utils'
import { isHouseCatBreed } from '@/lib/cat-data'
import { sendRegistrationConfirmationEmail, notifyAdminNewRegistration } from '@/lib/email'

export const dynamic = 'force-dynamic'

const catEntrySchema = z.object({
  catId: z.string(),
  participationDays: z.array(z.string()).default([]),
  traditionalClassSaturday: z.string().optional(),
  traditionalClassSunday: z.string().optional(),
  traditionalClassOther: z.string().optional(),
  wantsComplianceExam: z.boolean().default(false),
  isConformityOnly: z.boolean().default(false),
  specialParticipations: z.array(z.string()).default([]),
})

const registrationSchema = z.object({
  exhibitionId: z.string(),
  cats: z.array(catEntrySchema).min(1, 'Au moins un chat requis'),
  personalCages: z.number().int().min(0).default(0),
  borrowedCages: z.number().int().min(0).default(0),
  cageSpecialLengthRequest: z.string().optional(),
  nextTo: z.string().optional(),
  comment: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  try {
    const body = await req.json()
    const data = registrationSchema.parse(body)

    const [exhibition, userRecord, globalPricing] = await Promise.all([
      prisma.exhibition.findUnique({ where: { id: data.exhibitionId } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          membershipActive: true, membershipExpiry: true, role: true,
          firstName: true, lastName: true, civilite: true,
          phone: true, phoneFixed: true,
          address: true, address2: true, city: true, postalCode: true, country: true,
          exposantType: true, certificatCapacite: true,
          affixe: true, breedingName: true, siret: true, website: true, otherClubs: true,
        },
      }),
      prisma.pricing.findFirst(),
    ])

    if (!exhibition || exhibition.status !== ExhibitionStatus.OPEN) {
      return NextResponse.json({ error: 'Exposition non disponible' }, { status: 400 })
    }
    if (new Date() > exhibition.registrationDeadline) {
      return NextResponse.json({ error: "La date limite d'inscription est dépassée" }, { status: 400 })
    }

    const pricing = globalPricing ?? DEFAULT_PRICING
    const isMember = userRecord?.membershipActive ?? false

    const catIds = data.cats.map((c) => c.catId)
    const userCats = await prisma.cat.findMany({
      where: { id: { in: catIds }, ownerId: session.user.id },
      select: {
        id: true, name: true, breed: true, color: true, gender: true, birthDate: true,
        icadNumber: true, pedigreeNumber: true, pedigreeInProgress: true, foreignCatCertificate: true,
        eyeColor: true, breeder: true, father: true, mother: true, countryOfOrigin: true,
      },
    })
    if (userCats.length !== catIds.length) {
      return NextResponse.json({ error: 'Un ou plusieurs chats introuvables' }, { status: 404 })
    }

    let existingReg = await prisma.registration.findUnique({
      where: { exhibitionId_userId: { exhibitionId: data.exhibitionId, userId: session.user.id } },
      include: { cats: { select: { catId: true } } },
    })

    if (existingReg && existingReg.status === 'REJECTED') {
      await prisma.registration.delete({ where: { id: existingReg.id } })
      existingReg = null
    }

    const alreadyRegisteredCatIds = existingReg?.cats.map((rc) => rc.catId) ?? []
    const duplicates = catIds.filter((id) => alreadyRegisteredCatIds.includes(id))
    if (duplicates.length > 0) {
      return NextResponse.json({ error: 'Un ou plusieurs chats sont déjà inscrits à cette exposition' }, { status: 409 })
    }

    const existingCount = alreadyRegisteredCatIds.length
    const catBreedMap = new Map(userCats.map((c) => [c.id, c.breed]))

    const newCatData = data.cats.map((entry, idx) => {
      const position = existingCount + idx + 1
      const isConformityOnly = entry.isConformityOnly
      const wantsComplianceExam = entry.wantsComplianceExam || isConformityOnly
      const isHouseCat = isHouseCatBreed(catBreedMap.get(entry.catId) ?? '')
      const amount = computeCatPrice(
        position,
        entry.participationDays,
        isHouseCat,
        wantsComplianceExam,
        false,
        isMember,
        pricing,
        isConformityOnly
      )
      return {
        catId: entry.catId,
        participationDays: entry.participationDays,
        traditionalClassSaturday: entry.traditionalClassSaturday,
        traditionalClassSunday: entry.traditionalClassSunday,
        traditionalClassOther: entry.traditionalClassOther,
        isHouseCat,
        wantsComplianceExam,
        isConformityOnly,
        specialParticipations: entry.specialParticipations,
        amount,
      }
    })

    if (existingReg) {
      const newCatsTotal = newCatData.reduce((s, c) => s + c.amount, 0)
      const newTotalAmount = existingReg.totalAmount + newCatsTotal

      await prisma.$transaction([
        prisma.registrationCat.createMany({
          data: newCatData.map((d) => ({ registrationId: existingReg.id, ...d })),
        }),
        prisma.registration.update({
          where: { id: existingReg.id },
          data: {
            totalAmount: newTotalAmount,
            personalCages: data.personalCages || existingReg.personalCages,
            borrowedCages: data.borrowedCages || existingReg.borrowedCages,
            cageSpecialLengthRequest: data.cageSpecialLengthRequest || existingReg.cageSpecialLengthRequest,
            nextTo: data.nextTo || existingReg.nextTo,
            comment: data.comment || existingReg.comment,
          },
        }),
      ])
      return NextResponse.json({ id: existingReg.id }, { status: 200 })
    }

    // Check capacity
    if (exhibition.maxRegistrations) {
      const count = await prisma.registrationCat.count({
        where: { registration: { exhibitionId: data.exhibitionId } },
      })
      if (count + catIds.length > exhibition.maxRegistrations) {
        return NextResponse.json({ error: "L'exposition est complète ou n'a pas assez de places" }, { status: 400 })
      }
    }

    const registrationFee = pricing.registrationFee
    const catsTotal = newCatData.reduce((s, c) => s + c.amount, 0)
    const totalAmount = registrationFee + catsTotal

    const registration = await prisma.registration.create({
      data: {
        exhibitionId: data.exhibitionId,
        userId: session.user.id,
        registrationFee,
        totalAmount,
        personalCages: data.personalCages,
        borrowedCages: data.borrowedCages,
        cageSpecialLengthRequest: data.cageSpecialLengthRequest || null,
        nextTo: data.nextTo || null,
        comment: data.comment || null,
        cats: { create: newCatData },
      },
    })

    // Notify inscription desk (fire-and-forget)
    notifyAdminNewRegistration({
      registrationId: registration.id,
      user: {
        name: session.user.name || 'Exposant',
        email: session.user.email || '',
        membershipActive: isMember,
        membershipExpiry: userRecord?.membershipExpiry ?? null,
        role: userRecord?.role ?? 'ADHERENT_CLUB',
        firstName: userRecord?.firstName ?? '',
        lastName: userRecord?.lastName ?? '',
        civilite: userRecord?.civilite ?? null,
        phone: userRecord?.phone ?? null,
        phoneFixed: userRecord?.phoneFixed ?? null,
        address: userRecord?.address ?? null,
        address2: userRecord?.address2 ?? null,
        city: userRecord?.city ?? null,
        postalCode: userRecord?.postalCode ?? null,
        country: userRecord?.country ?? 'France',
        exposantType: userRecord?.exposantType ?? 'PARTICULIER',
        certificatCapacite: userRecord?.certificatCapacite ?? null,
        affixe: userRecord?.affixe ?? null,
        breedingName: userRecord?.breedingName ?? null,
        siret: userRecord?.siret ?? null,
        website: userRecord?.website ?? null,
        otherClubs: userRecord?.otherClubs ?? null,
      },
      exhibition: { title: exhibition.title, startDate: exhibition.startDate, city: exhibition.city },
      cats: newCatData.map((d) => {
        const cat = userCats.find((c) => c.id === d.catId)
        return {
          name: cat?.name ?? d.catId,
          breed: cat?.breed ?? '',
          color: cat?.color ?? null,
          gender: cat?.gender ?? null,
          birthDate: cat?.birthDate ?? null,
          icadNumber: cat?.icadNumber ?? null,
          pedigreeNumber: cat?.pedigreeNumber ?? null,
          pedigreeInProgress: cat?.pedigreeInProgress ?? false,
          foreignCatCertificate: cat?.foreignCatCertificate ?? null,
          eyeColor: cat?.eyeColor ?? null,
          breeder: cat?.breeder ?? null,
          father: cat?.father ?? null,
          mother: cat?.mother ?? null,
          countryOfOrigin: cat?.countryOfOrigin ?? null,
          participationDays: d.participationDays,
          traditionalClassSaturday: d.traditionalClassSaturday,
          traditionalClassSunday: d.traditionalClassSunday,
          traditionalClassOther: d.traditionalClassOther,
          isHouseCat: d.isHouseCat,
          wantsComplianceExam: d.wantsComplianceExam,
          specialParticipations: d.specialParticipations,
          amount: d.amount,
        }
      }),
      registrationFee,
      totalAmount,
      personalCages: data.personalCages,
      borrowedCages: data.borrowedCages,
      cageSpecialLengthRequest: data.cageSpecialLengthRequest,
      nextTo: data.nextTo,
      comment: data.comment,
    }).catch((err) => console.error('[email] Notif inscription admin:', err))

    // Send confirmation email (fire-and-forget)
    if (session.user.email) {
      const siteConfigs = await prisma.siteConfig.findMany({
        where: { key: { in: ['membership_rib_iban', 'membership_rib_bic', 'membership_rib_holder', 'membership_paypal_link'] } },
      })
      const cfg = Object.fromEntries(siteConfigs.map((c) => [c.key, c.value]))
      const catMap = Object.fromEntries(userCats.map((c) => [c.id, c]))
      sendRegistrationConfirmationEmail({
        user: { name: session.user.name || 'Exposant', email: session.user.email },
        exhibition: {
          title: exhibition.title,
          startDate: exhibition.startDate,
          city: exhibition.city,
        },
        cats: newCatData.map((d) => ({
          name: catMap[d.catId]?.name ?? d.catId,
          breed: catMap[d.catId]?.breed ?? '',
          participationDays: d.participationDays,
          wantsComplianceExam: d.wantsComplianceExam,
          amount: d.amount,
        })),
        registrationFee,
        totalAmount,
        iban: cfg['membership_rib_iban'] || '',
        bic: cfg['membership_rib_bic'] || '',
        holder: cfg['membership_rib_holder'] || '',
        paypalLink: cfg['membership_paypal_link'] || '',
      }).catch((err) => console.error('[email] Confirmation inscription:', err))
    }

    return NextResponse.json({ id: registration.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
