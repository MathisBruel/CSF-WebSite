# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev               # Start Next.js dev server
npm run build             # Production build
npm run lint              # ESLint via Next.js

# Database
npm run db:generate       # Regenerate Prisma client after schema changes
npm run db:migrate:dev    # Create and apply a new migration (dev)
npm run db:migrate        # Apply pending migrations (production)
npm run db:seed           # Seed demo data (guards against re-running)
npm run db:studio         # Open Prisma Studio GUI
```

There are no automated tests in this project.

After any change to `prisma/schema.prisma`, run `db:generate` before running the app.

## Architecture

Full-stack Next.js 14 (App Router) application for a cat club (Chats Sans Frontières). TypeScript throughout. PostgreSQL database accessed via Prisma 5. Auth via NextAuth.js v5 with JWT (no sessions table).

### Route groups and protection

```
app/
  (public)/      # No auth required — homepage, exhibitions, news, team, contact
  (auth)/        # Login/register pages
  membre/        # Requires login — dashboard, cats, registrations, profile
  admin/         # Requires login + ADMIN role — members, exhibitions, content
  api/           # REST endpoints matching the above domain split
```

`middleware.ts` enforces this: `/membre/*` redirects unauthenticated users to login; `/admin/*` additionally checks for the `ADMIN` role stored in the JWT.

### Data flow

Server Components fetch data directly from Prisma and pass it as props to Client Components. No global client-side state management (no Redux/Zustand). Client forms use React Hook Form + Zod. API routes use Zod for request validation and return plain JSON.

### Key library files

- `lib/prisma.ts` — Prisma singleton with hot-reload guard
- `lib/auth.ts` — NextAuth config; session JWT carries `id`, `email`, `name`, `role`, `membershipActive`
- `lib/upload.ts` — Multer-based file handler; saves files to `UPLOAD_DIR` with UUID names, serves them via `/uploads/`
- `lib/utils.ts` — Date/price/slug formatting helpers, role and status label maps

### Authentication roles

Three roles exist: `ADMIN`, `MEMBRE_ACTIF`, `ADHERENT_CLUB`. Membership can be active or inactive with an expiry date. Registration is currently disabled (`REGISTRATION_ENABLED = false` in the register API route).

Demo credentials (created by seed): `admin@assocsf.fr` / `Admin1234!` and `membre@assocsf.fr` / `Membre1234!`.

### File uploads

Files (PDF, JPEG, PNG, WebP, max 10 MB) are stored on disk at `UPLOAD_DIR/{subfolder}/{uuid}.ext` and exposed at `NEXT_PUBLIC_UPLOAD_URL/{subfolder}/{filename}`. In Docker this is a named volume. The upload route at `app/api/uploads/[...path]/route.ts` serves files with security path checks.

### Rich text editing

News articles and team member bios use TinyMCE (requires `NEXT_PUBLIC_TINYMCE_API_KEY`) in some places and Tiptap in others. Both render HTML stored as a string in the database.

### Docker / deployment

Three-service Compose setup: PostgreSQL, Next.js app (standalone build), and a migration runner container (`Dockerfile.migrate`) that runs `db:migrate` on startup before the app starts. The app runs as a non-root `nextjs` user.

### Prisma schema highlights

Core entities and their relationships:
- `User` → owns `Cat[]`, `Registration[]`
- `Cat` → has `Vaccination[]`, `CatDocument[]`
- `Exhibition` → has `Registration[]` (links users and cats to events)
- `Registration` tracks payment, vet validation, catalog number, and document status
- `SiteConfig` is a key-value store for runtime configuration

### Environment variables

Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOAD_DIR`, `NEXT_PUBLIC_UPLOAD_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_TINYMCE_API_KEY`.

See `.env.example` for all values and their expected format.
