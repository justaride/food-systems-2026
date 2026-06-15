---
tittel: Strøm A — en-sides kommandoark
status: Operator-cheatsheet
eier: Gabriel
dato: 2026-06-15
relaterte_filer:
  - docs/project/status/food-tg-strom-a-runbook-2026-06-15.md
---

# Strøm A — kommandoark

Full forklaring, rollback og beslutningsregler ligger i
`docs/project/status/food-tg-strom-a-runbook-2026-06-15.md`.

## 0. Pre-flight

```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026"
git checkout main
git pull
git checkout -b chore/strom-a-closeout

npm run db:generate
export DATABASE_URL="$(node -e 'require("dotenv").config({ quiet: true }); process.stdout.write(process.env.DATABASE_URL || "")')"
test -n "$DATABASE_URL"   # quiet:true: dotenv v17 logger banneret til stdout og forurenser ellers verdien

# DB-sjekk: klienten (prisma-client-provider, ingen url i datasource) KREVER pg-adapter + dotenv.
npx tsx -e 'import "dotenv/config"; import { PrismaPg } from "@prisma/adapter-pg"; import { PrismaClient } from "./src/generated/prisma/client"; const main = async () => { const url = process.env.DATABASE_URL; if (!url) throw new Error("DATABASE_URL mangler"); const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }); try { await p.$queryRaw`SELECT 1`; console.log("DB OK"); } finally { await p.$disconnect(); } }; main().catch((error) => { console.error(error); process.exit(1); })'

PG_DUMP_URL="$(node -e 'const raw = process.env.DATABASE_URL || ""; if (!raw) process.exit(2); const u = new URL(raw); u.search = ""; process.stdout.write(u.toString())')"
pg_dump "$PG_DUMP_URL" > ~/foodsystems-backup-$(date +%Y%m%d-%H%M).sql
npm test && npm run lint && npm run build
```

## 1. Vei 2 — AP-1 / person-dedupe

```bash
npx tsx scripts/extend-board-coverage-brreg.ts --dry-run
npx tsx scripts/extend-board-coverage-brreg.ts --snapshot-in=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json

# Kritisk write-step: kjør kun etter at backupen i §0 finnes.
npx tsx scripts/dedupe-person-keys.ts --commit

npx tsx scripts/analyze-board-interlocks.ts --out=research/analyse/ap1-styreoverlapp.json
```

Stopp her og oppdater `src/lib/data/dybdeanalyse.ts` med reelle AP-1-tall i
`ins-ap1-001.coverageNote`.

## 2. Strict-source gate

```bash
npm run db:audit:strict-sources
```

Hvis rød: sorter treffene etter full runbook §2, og bruk bare relevante tiltak:

```bash
npx tsx scripts/enrich-offentligdata.ts --companies-only --dry-run --orgnr=<ORGNR>
npx tsx scripts/enrich-offentligdata.ts --companies-only --orgnr=<ORGNR>

npx tsx scripts/prune-unverified-board-members.ts --dry-run
npx tsx scripts/prune-unverified-board-members.ts

npx tsx scripts/backfill-board-member-provenance.ts --dry-run
npx tsx scripts/backfill-board-member-provenance.ts

npm run db:audit:strict-sources
```

## 3. Operator-sekvens

```bash
npm test && npm run lint && npm run db:audit && npm run db:audit:strict-sources \
  && npm run audit:citable-reports \
  && npm run research:citation-readiness-queue \
  && npm run research:citable-acceptance-pack \
  && npm run build

git diff --check
```

Hvis `compute-metrics` er eneste build-avvik:

```bash
npm run compute-metrics:full
npm test && npm run lint && npm run build && git diff --check
```

Commit/push etter grønn gate:

```bash
git status --short
# Stage eksplisitt — IKKE hele mapper (research/analyse + docs/project/* har untracked-filer
# som da dras inn utilsiktet, jf. runbook §3). Legg til kun det du faktisk endret:
git add src/lib/data/dybdeanalyse.ts research/analyse/ap1-styreoverlapp.json
#   ev. funnnotater/docs du endret, og selve runbooken/kommandoarket hvis de skal spores:
#   git add docs/project/status/food-tg-strom-a-runbook-2026-06-15.md \
#           docs/project/status/food-tg-strom-a-kommandoark-2026-06-15.md
git status --short        # bekreft at KUN tiltenkte filer er staget før commit
git commit -m "chore(food-tg): close stream a local db evidence gates"
git push origin chore/strom-a-closeout
```

Deploy-sjekk etter merge til `main`:

```bash
curl -s https://food-systems.naturalstateproject.com/api/version
curl -s https://food-systems.naturalstateproject.com/api/data-status
```

## 4. Vei 1 — Aksjonærregister

```bash
npx tsx scripts/verify-ownership-aksjonaerregister.ts \
  --file="<sti-til-aksjonaerregister-csv>" \
  --out=research/analyse/ap5-eierandel-verifikasjon-2026.json
```

Oppdater deretter `CL-AP5-001`, `PCQ-MAKT-001` og `CL-MAKTKART-001` etter
faktisk output.

## 5. Brreg-validering

```bash
npm run validate:brreg
```

Hvis NTS/SalmoNor/Hallvard Lerøy fortsatt feiler, bruk orgnr-korreksjonene fra
full runbook §5.

## Ferdig når

- `npm test`, `npm run lint`, `npm run build` er grønne.
- `npm run db:audit`, `npm run db:audit:strict-sources`,
  `npm run audit:citable-reports`, `npm run research:citation-readiness-queue`
  og `npm run research:citable-acceptance-pack` er grønne.
- AP-1 `coverageNote` viser reelle tall etter lokal DB-kjøring.
- AP-5 eierandel-output er lagret og claim-status er oppdatert.
- `validate:brreg` er grønn eller har eksplisitt dokumentert restavvik.
