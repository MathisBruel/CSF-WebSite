# Chats Sans Frontières — Application Web

Application web complète pour le club félin **Chats Sans Frontières (CSF)**.

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styles | Tailwind CSS |
| Base de données | PostgreSQL 16 |
| ORM | Prisma 5 |
| Authentification | NextAuth.js v5 (JWT, rôles) |
| Fichiers | Stockage local (volume Docker) |
| Déploiement | Docker + Docker Compose |

## Démarrage rapide (Docker)

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Lancer tous les services (app + DB + migrations + seed)
docker-compose up --build

# L'application est accessible sur http://localhost:3000
```

> La première fois, le conteneur `migrate` applique les migrations Prisma
> et insère les données de démonstration automatiquement.

## Développement local (sans Docker)

### Prérequis
- Node.js 20+
- PostgreSQL 16 (local ou via `docker-compose up postgres`)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec votre DATABASE_URL

# 3. Appliquer les migrations
npm run db:migrate:dev

# 4. Insérer les données de démonstration
npm run db:seed

# 5. Lancer le serveur de développement
npm run dev
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@chats-sans-frontieres.fr | Admin1234! |
| Membre Actif | marie.dupont@example.com | Membre1234! |

## Structure du projet

```
csf-website/
├── app/
│   ├── (public)/           # Pages publiques (homepage, actualités, expositions, équipe, contact)
│   ├── (auth)/             # Pages d'authentification (login, register)
│   ├── membre/             # Espace membre protégé
│   │   ├── dashboard/      # Tableau de bord
│   │   ├── chats/          # Gestion des chats
│   │   ├── inscriptions/   # Inscriptions aux expositions (wizard multi-étapes)
│   │   └── profil/         # Profil utilisateur
│   ├── admin/              # Panel d'administration
│   │   ├── membres/        # Gestion des membres
│   │   ├── expositions/    # Gestion des expositions
│   │   ├── inscriptions/   # Validation des inscriptions et documents
│   │   └── contenu/        # Gestion du contenu (actualités, équipe)
│   └── api/                # API Routes
│       ├── auth/           # NextAuth + Register
│       ├── cats/           # CRUD chats
│       ├── registrations/  # Inscriptions
│       ├── upload/         # Upload de documents
│       ├── member/         # API espace membre
│       ├── admin/          # API administration
│       └── health/         # Health check
├── components/
│   ├── ui/                 # Composants partagés
│   ├── public/             # Composants front-office
│   ├── auth/               # Formulaires d'authentification
│   ├── membre/             # Composants espace membre
│   └── admin/              # Composants administration
├── lib/
│   ├── auth.ts             # Configuration NextAuth
│   ├── prisma.ts           # Client Prisma singleton
│   ├── upload.ts           # Gestion des uploads
│   └── utils.ts            # Utilitaires (formatage dates, prix, etc.)
├── prisma/
│   ├── schema.prisma       # Modèles de données
│   └── seed.ts             # Données de démonstration
├── Dockerfile              # Build multi-stage optimisé
├── Dockerfile.migrate      # Migrations + seed
└── docker-compose.yml      # Orchestration des services
```

## Fonctionnalités

### Front-office public
- Page d'accueil avec actualités et expositions à venir
- Calendrier des expositions avec détail et tarifs
- Page équipe dynamique
- Page contact avec formulaire
- Design fidèle à la maquette CSF (couleurs #1a3546, #d48342)

### Espace Membre
- Tableau de bord personnalisé
- Gestion des chats (ajout, modification, upload documents)
- Wizard d'inscription en 3 étapes (sélection chat → options → récapitulatif)
- Suivi des inscriptions et statuts
- Téléchargement des convocations
- Gestion du profil

### Panel d'Administration
- Dashboard avec alertes (adhésions en attente, inscriptions à valider, documents)
- Gestion des membres (validation adhésion, changement de rôle)
- Gestion des expositions (création, ouverture/fermeture des inscriptions)
- Validation des inscriptions (accepter/refuser avec motif)
- Validation des documents des chats (pedigree, I-CAD, vaccins)
- Marquage du paiement et validation vétérinaire
- Attribution des numéros de catalogue
- **Export CSV** de la liste des inscrits pour le catalogue

## Variables d'environnement

```env
DATABASE_URL=postgresql://csf_user:csf_password@postgres:5432/csf_db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
UPLOAD_DIR=/app/public/uploads
NEXT_PUBLIC_UPLOAD_URL=/uploads
```

## Commandes utiles

```bash
npm run db:studio        # Ouvrir Prisma Studio
npm run db:migrate:dev   # Créer une migration
npm run db:seed          # Réinitialiser les données de démo
npm run build            # Build de production
```
