import { PrismaClient, Role, ExhibitionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ──────────────────────────────────────────────────────────────────
  // GUARD: Only seed if the database is empty (first-time setup)
  // This prevents overwriting production data on subsequent deploys
  // ──────────────────────────────────────────────────────────────────
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('⏭️  Database already seeded — skipping. (found', userCount, 'users)')
    return
  }

  console.log('🌱 First-time setup — seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@assocsf.fr',
      password: adminPassword,
      name: 'Administrateur CSF',
      firstName: 'Admin',
      lastName: 'CSF',
      role: Role.ADMIN,
      membershipActive: true,
      membershipExpiry: new Date('2027-12-31'),
    },
  })

  // Demo member
  const memberPassword = await bcrypt.hash('Membre1234!', 12)
  const member = await prisma.user.create({
    data: {
      email: 'membre@assocsf.fr',
      password: memberPassword,
      name: 'Marie Dupont',
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '06 12 34 56 78',
      city: 'Lyon',
      postalCode: '69001',
      role: Role.MEMBRE_ACTIF,
      membershipActive: true,
      membershipExpiry: new Date('2027-12-31'),
    },
  })

  // Team members — Bureau CSF
  const teamData = [
    { name: 'Frédérique BEAUCOUSIN', role: 'Présidente', order: 1 },
    { name: 'Alain MIRBEAU', role: 'Vice-Président', order: 2 },
    { name: 'Mathis BRUEL', role: 'Secrétaire', order: 3 },
    { name: 'Céline BRUEL', role: 'Vice-Secrétaire', order: 4 },
    { name: 'Stéphanie JOYER', role: 'Vice-Secrétaire', order: 5 },
    { name: 'Sébastien BRUEL', role: 'Trésorier', order: 6 },
    { name: 'Catherine RENAUDIN', role: 'Vice-Trésorière', order: 7 },
    { name: 'Mickael BALLERINI', role: 'Pôle Bar et Restauration', order: 8 },
    { name: 'Aurore DAVID-BALLERINI', role: 'Marketing, Communication et Animation', order: 9 },
    { name: 'Christel VOGLEY', role: 'Contrôle Vétérinaire', order: 10 },
    { name: 'Joël RENAUDIN', role: 'Contrôle Vétérinaire', order: 11 },
    { name: 'Stecie GRASSET', role: 'Gestion des Entrées', order: 12 },
    { name: 'Laurent ALLAIN', role: 'Photographe officiel', order: 13 },
  ]

  for (const t of teamData) {
    await prisma.teamMember.create({
      data: { ...t, active: true },
    })
  }

  // Site config — valeurs par défaut CSF
  const configs = [
    { key: 'club_name', value: 'Chats Sans Frontières' },
    { key: 'club_email', value: 'contact@assocsf.fr' },
    { key: 'club_address', value: '' },
    { key: 'club_description', value: "Association féline dédiée à l'organisation d'expositions félines, au regroupement d'éleveurs et de passionnés, et à la promotion de l'élevage éthique. Fondée en 2005." },
    { key: 'facebook_url', value: '' },
    { key: 'instagram_url', value: '' },
    { key: 'club_founded', value: '2005' },
    { key: 'club_domain', value: 'assocsf.fr' },
  ]

  for (const c of configs) {
    await prisma.siteConfig.create({ data: c })
  }

  console.log('✅ Seed complete!')
  console.log('   Admin: admin@assocsf.fr / Admin1234!')
  console.log('   Membre: membre@assocsf.fr / Membre1234!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
