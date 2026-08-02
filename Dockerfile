# ──────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: install all dependencies (prod + dev)
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder: build the Next.js application
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Accept build args for environment variables
ARG NEXT_PUBLIC_TINYMCE_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client against the bundled node_modules
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Placeholder DB URL is enough for the build step (schema is already generated)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Set environment variables from build args
ENV NEXT_PUBLIC_TINYMCE_API_KEY=${NEXT_PUBLIC_TINYMCE_API_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}

RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner: minimal production image
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma schema + generated client (needed at runtime for migrations check)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Uploads volume mount-point
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
