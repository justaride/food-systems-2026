FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ARG SOURCE_COMMIT=
ARG SOURCE_BRANCH=
ARG COOLIFY_BRANCH=
ARG COOLIFY_GIT_COMMIT_SHA=
ARG COOLIFY_GIT_BRANCH=
ENV SOURCE_COMMIT=$SOURCE_COMMIT
ENV SOURCE_BRANCH=$SOURCE_BRANCH
ENV COOLIFY_BRANCH=$COOLIFY_BRANCH
ENV COOLIFY_GIT_COMMIT_SHA=$COOLIFY_GIT_COMMIT_SHA
ENV COOLIFY_GIT_BRANCH=$COOLIFY_GIT_BRANCH
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY public ./public
COPY scripts ./scripts
COPY src ./src
# i18n-kataloger: src/i18n/request.ts dynamisk-importerer ../../messages/<locale>.json,
# så Turbopack trenger messages/ tilstede for å bygge dynamic-import-kartet.
COPY messages ./messages
# Hvitbok-kapitler leses fra disk ved kjøretid (src/lib/hvitbok/loader.ts)
COPY content ./content
COPY research/evidence-pack/*.csv ./research/evidence-pack/
# Kun text/ + exports/ trengs av migrasjons-importer; downloads/ er ~70MB PDFer
COPY research/evidence-pack/okologisk-norden-2026-04-29/text/ ./research/evidence-pack/okologisk-norden-2026-04-29/text/
COPY research/evidence-pack/okologisk-norden-2026-04-29/exports/ ./research/evidence-pack/okologisk-norden-2026-04-29/exports/
COPY research/_status/ ./research/_status/
COPY research/data/nordic/core-series/ ./research/data/nordic/core-series/
COPY research/data/nordic/trade-groups/normalized/ ./research/data/nordic/trade-groups/normalized/
COPY research/data/nordic/market-share/ ./research/data/nordic/market-share/
# Prosjektlandskapet leses filbasert av den interne /prosjektlandskap-ruten.
COPY research/landscape/ ./research/landscape/
# data/konsern-coverage.json leses ved kjøretid av src/lib/queries/ownership.ts (/eierskap)
COPY data ./data
ENV COVERAGE_ENV=prod
# Schema-sync (prisma db push) er fjernet pga inkompatibilitet med STORED
# GENERATED-kolonner (search_vector). Prisma kan ikke uttrykke disse, og
# selv med Unsupported(tsvector) prøver db push å ALTER dem.
#
# Prod-skjemaet synkes i stedet av scripts/apply-prod-migrations.sh før
# applikasjonsprosessen starter i runner-stage.
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install psql + curl mens vi fortsatt er root, slik at migrasjonsinngangen og
# den lokale container-healthchecken er tilgjengelige som nextjs-bruker.
RUN apk add --no-cache postgresql-client curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/research ./research
# data/ holder konsern-coverage.json (lest ved kjøretid av /eierskap via ownership.ts)
COPY --from=builder --chown=nextjs:nodejs /app/data ./data
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# `apply-prod-migrations.sh` uses Prisma's ledger/advisory locking rather than
# replaying SQL files. Copy the npm-ci dependency tree from the repository
# lockfile so the runtime CLI is reproducible; do not run an unlocked npm
# install in a separate image stage.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
# scripts/ + prisma/ kopieres for den fail-closed migrasjonsinngangen.
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma
RUN rm -f .env
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/data-status" >/dev/null || exit 1
CMD ["sh", "-c", "sh /app/scripts/apply-prod-migrations.sh && unset MIGRATION_DATABASE_URL && exec node server.js"]
