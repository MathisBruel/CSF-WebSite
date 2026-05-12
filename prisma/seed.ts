import { PrismaClient, Role, ExhibitionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chats-sans-frontieres.fr' },
    update: {},
    create: {
      email: 'admin@chats-sans-frontieres.fr',
      password: adminPassword,
      name: 'Administrateur CSF',
      firstName: 'Admin',
      lastName: 'CSF',
      role: Role.ADMIN,
      membershipActive: true,
      membershipExpiry: new Date('2026-12-31'),
    },
  })

  // Demo member
  const memberPassword = await bcrypt.hash('Membre1234!', 12)
  const member = await prisma.user.upsert({
    where: { email: 'marie.dupont@example.com' },
    update: {},
    create: {
      email: 'marie.dupont@example.com',
      password: memberPassword,
      name: 'Marie Dupont',
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '06 12 34 56 78',
      city: 'Lyon',
      postalCode: '69001',
      role: Role.MEMBRE_ACTIF,
      membershipActive: true,
      membershipExpiry: new Date('2026-12-31'),
    },
  })

  // Team members
  const teamData = [
    { name: 'Sophie Laurent', role: 'Présidente', bio: 'Éleveuse passionnée depuis 15 ans, spécialiste des Maine Coons.', order: 1 },
    { name: 'Jean-Pierre Martin', role: 'Vice-Président', bio: 'Organisateur des expositions régionales, juge certifié LOOF.', order: 2 },
    { name: 'Isabelle Bernard', role: 'Secrétaire', bio: 'Responsable administrative et coordinatrice des adhésions.', order: 3 },
    { name: 'François Petit', role: 'Trésorier', bio: 'Gestion financière et relations avec les partenaires.', order: 4 },
    { name: 'Nathalie Rousseau', role: 'Responsable Communication', bio: 'Community manager et rédactrice du bulletin mensuel.', order: 5 },
    { name: 'Alain Moreau', role: 'Responsable Technique', bio: 'Organisation logistique des expositions et gestion du matériel.', order: 6 },
  ]

  for (const t of teamData) {
    await prisma.teamMember.upsert({
      where: { id: `team-${t.order}` },
      update: {},
      create: { id: `team-${t.order}`, ...t },
    })
  }

  // News articles
  const newsData = [
    {
      id: 'news-1',
      title: 'Résultats de l\'exposition nationale de Bordeaux',
      slug: 'resultats-exposition-bordeaux-2025',
      excerpt: 'Notre club a brillé lors de la 42e exposition nationale. Retrouvez le palmarès complet de nos adhérents.',
      content: `<p>C'est avec une immense fierté que nous vous présentons les résultats de la 42e Exposition Nationale Féline de Bordeaux, qui s'est tenue les 18 et 19 octobre derniers.</p>
<p>Nos adhérents ont brillamment représenté le club avec pas moins de 12 récompenses remportées sur les différentes catégories.</p>
<h3>Palmarès</h3>
<ul>
<li><strong>Best in Show</strong> : Asterix du Moulin des Chats (Maine Coon, élevage Martin)</li>
<li><strong>Best of Breed Maine Coon</strong> : Luna de la Forêt Enchantée</li>
<li><strong>Meilleur chaton</strong> : Simba des Étoiles du Nord</li>
</ul>
<p>Félicitations à tous nos exposants pour leur participation exemplaire !</p>`,
      published: true,
      publishedAt: new Date('2025-10-22'),
      authorId: admin.id,
    },
    {
      id: 'news-2',
      title: 'Ouverture des inscriptions — Expo Printemps 2026',
      slug: 'ouverture-inscriptions-expo-printemps-2026',
      excerpt: 'Les inscriptions pour notre exposition de printemps sont désormais ouvertes. Places limitées !',
      content: `<p>Nous avons le plaisir de vous annoncer l'ouverture des inscriptions pour notre <strong>Exposition Féline de Printemps 2026</strong>, qui se tiendra le 14 et 15 mars à Lyon.</p>
<p>Cette exposition est ouverte à tous les chats de race inscrits au LOOF ou titulaires d'un pedigree étranger reconnu.</p>
<h3>Modalités d'inscription</h3>
<p>Les inscriptions s'effectuent exclusivement via l'espace membre de notre site web. Connectez-vous à votre compte et rendez-vous dans la section "Mes inscriptions".</p>
<p><strong>Date limite d'inscription : 28 février 2026</strong></p>`,
      published: true,
      publishedAt: new Date('2025-12-01'),
      authorId: admin.id,
    },
    {
      id: 'news-3',
      title: 'Mise à jour du règlement intérieur 2026',
      slug: 'reglement-interieur-2026',
      excerpt: 'Le règlement intérieur du club a été mis à jour pour l\'année 2026. Prenez connaissance des nouvelles dispositions.',
      content: `<p>Le bureau du club a procédé à la mise à jour annuelle du règlement intérieur, qui entre en vigueur à compter du 1er janvier 2026.</p>
<p>Les principales modifications concernent :</p>
<ul>
<li>Les modalités de validation des vaccinations (délai porté à 48h avant l'exposition)</li>
<li>Les tarifs des cages doubles</li>
<li>La procédure de remboursement en cas d'annulation</li>
</ul>
<p>Le nouveau règlement est disponible en téléchargement dans la section Documents.</p>`,
      published: true,
      publishedAt: new Date('2026-01-05'),
      authorId: admin.id,
    },
  ]

  for (const n of newsData) {
    await prisma.news.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    })
  }

  // Exhibitions
  const exhibitions = [
    {
      id: 'expo-1',
      title: 'Exposition Féline de Printemps — Lyon 2026',
      slug: 'exposition-printemps-lyon-2026',
      description: 'Notre exposition annuelle de printemps, reconnue par le LOOF et la WCF. Deux jours de compétition dans une ambiance conviviale.',
      location: 'Espace Tête d\'Or',
      address: '5 Allée de la Combe',
      city: 'Lyon',
      startDate: new Date('2026-03-14T09:00:00'),
      endDate: new Date('2026-03-15T18:00:00'),
      registrationDeadline: new Date('2026-02-28T23:59:59'),
      status: ExhibitionStatus.OPEN,
      priceBase: 35,
      priceCage: 15,
      priceDoubleCage: 25,
      priceMeal: 12,
      rules: 'Chats LOOF ou pedigree étranger reconnu. Vaccins obligatoires : typhus, coryza, leucose (moins de 1 an). Puce électronique obligatoire.',
      maxRegistrations: 200,
    },
    {
      id: 'expo-2',
      title: 'Grande Exposition Nationale — Paris 2026',
      slug: 'grande-exposition-nationale-paris-2026',
      description: 'La grande exposition nationale annuelle, réunissant les meilleurs chats de race de toute la France.',
      location: 'Parc des Expositions — Hall 7',
      address: '1 Place de la Pyramide',
      city: 'Paris',
      startDate: new Date('2026-06-20T09:00:00'),
      endDate: new Date('2026-06-21T18:00:00'),
      registrationDeadline: new Date('2026-06-05T23:59:59'),
      status: ExhibitionStatus.DRAFT,
      priceBase: 45,
      priceCage: 20,
      priceDoubleCage: 35,
      priceMeal: 15,
      maxRegistrations: 500,
    },
    {
      id: 'expo-3',
      title: 'Exposition Régionale Automne — Bordeaux 2025',
      slug: 'exposition-regionale-automne-bordeaux-2025',
      description: 'Exposition régionale clôturant la saison 2025.',
      location: 'Palais des Congrès',
      address: 'Avenue Jean Gabriel Domergue',
      city: 'Bordeaux',
      startDate: new Date('2025-10-18T09:00:00'),
      endDate: new Date('2025-10-19T18:00:00'),
      registrationDeadline: new Date('2025-10-03T23:59:59'),
      status: ExhibitionStatus.ARCHIVED,
      priceBase: 30,
      priceCage: 12,
      priceDoubleCage: 20,
      priceMeal: 10,
    },
  ]

  for (const e of exhibitions) {
    await prisma.exhibition.upsert({
      where: { id: e.id },
      update: {},
      create: e,
    })
  }

  // Demo cat for member
  const cat = await prisma.cat.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      name: 'Apollon du Soleil Levant',
      breed: 'Maine Coon',
      color: 'Brown tabby',
      gender: 'Mâle',
      birthDate: new Date('2023-05-15'),
      icadNumber: '250269811234567',
      pedigreeNumber: 'LOOF-2023-MC-12345',
      ownerId: member.id,
    },
  })

  // Site config
  const configs = [
    { key: 'club_name', value: 'Chats Sans Frontières' },
    { key: 'club_email', value: 'contact@chats-sans-frontieres.fr' },
    { key: 'club_phone', value: '04 72 00 00 00' },
    { key: 'club_address', value: '12 Rue des Félins, 69001 Lyon' },
    { key: 'club_description', value: 'Association féline reconnue, organisatrice d\'expositions nationales depuis 1982.' },
    { key: 'facebook_url', value: 'https://facebook.com/chatssansfrontieres' },
    { key: 'instagram_url', value: 'https://instagram.com/chatssansfrontieres' },
  ]

  for (const c of configs) {
    await prisma.siteConfig.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: c,
    })
  }

  console.log('✅ Seed complete!')
  console.log('   Admin: admin@chats-sans-frontieres.fr / Admin1234!')
  console.log('   Member: marie.dupont@example.com / Membre1234!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
