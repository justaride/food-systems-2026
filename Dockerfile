FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ARG SOURCE_COMMIT=unknown
ARG SOURCE_BRANCH=unknown
ARG COOLIFY_GIT_COMMIT_SHA=
ARG COOLIFY_GIT_BRANCH=
ENV SOURCE_COMMIT=$SOURCE_COMMIT
ENV SOURCE_BRANCH=$SOURCE_BRANCH
ENV COOLIFY_GIT_COMMIT_SHA=$COOLIFY_GIT_COMMIT_SHA
ENV COOLIFY_GIT_BRANCH=$COOLIFY_GIT_BRANCH
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY research/evidence-pack/*.csv ./research/evidence-pack/
# Kun text/ + exports/ trengs av migrasjons-importer; downloads/ er ~70MB PDFer
COPY research/evidence-pack/okologisk-norden-2026-04-29/text/ ./research/evidence-pack/okologisk-norden-2026-04-29/text/
COPY research/evidence-pack/okologisk-norden-2026-04-29/exports/ ./research/evidence-pack/okologisk-norden-2026-04-29/exports/
COPY research/_status/ ./research/_status/
COPY research/data/nordic/core-series/ ./research/data/nordic/core-series/
COPY research/data/nordic/trade-groups/normalized/ ./research/data/nordic/trade-groups/normalized/
COPY research/data/nordic/market-share/ ./research/data/nordic/market-share/
ARG DATABASE_URL
# psql kreves av run-prod-migrations.ts; alpine ships uten det
RUN apk add --no-cache postgresql-client
RUN npm run build && npx prisma db push && npx tsx scripts/run-prod-migrations.ts

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/research ./research
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN rm -f .env
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
