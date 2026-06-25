# Domene-kartlegging (regenerativ/lokalmat) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg et dekningsstyrt, gjenbrukbart rammeverk for systematisk kartlegging av regenerativt/permakultur/lokalmat/frøbevaring-feltet, og kjør én bevis-runde (`lokale-verdikjeder`, NO).

**Architecture:** Gjenbruker `Actor`/`PersonProfile`/`ActorRelationship` + `themeTags`/`metadata` (ingen schema-endring). En committet dekningsbok (CSV) definerer celler (underdomene × aktørtype × geografi) med univers-anslag; en dekningsaudit teller kartlagte noder fra DB og produserer en hull-rapport; en generalisert, idempotent importer tar kandidat-CSV → DB. Offentlig flate = `/aktorer` med domene-tag-filter + `verificationStatus`-badge.

**Tech Stack:** TypeScript, `tsx`, Prisma 7 (PrismaPg-adapter), Next.js (App Router), npm.

## Global Constraints

- Pakkehåndterer `npm`; kjør engangs-script med `npx tsx scripts/<x>.ts`.
- Prisma via `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })`; `import 'dotenv/config'` øverst.
- **Ingen Prisma-schema-endring.** Alt via `themeTags` + `metadata` (Json).
- Import **idempotent**: upsert på `Actor.id`/`PersonProfile.personKey`; kontakter/dok-refs/relasjoner scoped-slettet+gjenopprettet per `dataset`-tag.
- Node-konvensjoner: `themeTags = ['domene:<domain>', 'subdomene:<subdomain>', '<dataset>']`; `metadata = { dataset, domain, subdomain, geo, sourceClass, verificationStatus, confidence, locatorUrl, accessedAt, ... }`.
- `verificationStatus ∈ {unverified, machine_verified, disputed, human_verified}`; agent-funn aldri `machine_verified` automatisk.
- `disputed`/`unverified` skal være ekskludert fra `audit:citable`/`gate:overclaim` (dataset-tagget ikke-citable).
- Dedup før import mot `Actor.slug`/`Actor.name`/`Company.orgNr`/`PersonProfile.personKey`; treff → additiv berikelse, aldri klobb kuraterte felter.
- Bygg må ikke avhenge av live DB. DB-deriverte artefakter committes separat.
- Commit-meldinger avslutter med `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. Deploy via Coolify/`justaride` — aldri Vercel.
- Verifiseringsbatteri: `npm run db:audit`, `npm run db:audit:strict-sources`, `npm run audit:research-artifacts -- --base=origin/main`, `npx tsc --noEmit -p tsconfig.json`, `npx eslint <endrede filer>`.

---

### Task 1: Dekningsbok-artefakt + taksonomi for `lokale-verdikjeder`

**Files:**
- Create: `research/_status/domene-dekningsbok.csv`

**Interfaces:**
- Produces: dekningsbok-CSV med kolonner `domain,subdomain,geo,estimated_universe,universe_source,universe_confidence,mapped_count,gap,last_updated`. `mapped_count`/`gap` skrives av Task 2 (her: tomme/0).

Underdomene-listen (den eneste «åpne» listen) for `lokale-verdikjeder`: `reko`, `bondens-marked`, `andelslandbruk`, `gaardsutsalg`, `markedshager`, `paraply-nettverk`.

- [ ] **Step 1: Opprett dekningsboka med lokale-verdikjeder-celler**

Create `research/_status/domene-dekningsbok.csv`:

```csv
domain,subdomain,geo,estimated_universe,universe_source,universe_confidence,mapped_count,gap,last_updated
lokale-verdikjeder,reko,NO,140,"REKO Norge feb. 2022 (140+ ringer); siste offisielle",middels,0,0,2026-06-25
lokale-verdikjeder,bondens-marked,NO,20,"Stiftelsen Bondens marked: ~20 faste markedsplasser",middels,0,0,2026-06-25
lokale-verdikjeder,andelslandbruk,NO,93,"Oekologisk Norge: 93 i drift (2023)",middels,0,0,2026-06-25
lokale-verdikjeder,gaardsutsalg,NO,0,"Ingen samlet telling; agent-fanout-celle",lav,0,0,2026-06-25
lokale-verdikjeder,markedshager,NO,0,"Markedshager Norge: ikke tallfestet",lav,0,0,2026-06-25
lokale-verdikjeder,paraply-nettverk,NO,8,"REKO Norge, Bondens marked, HANEN, Oekologisk Norge, NBS, Smaaskala Groent, Matsentralen, Stiftelsen Norsk Mat",hoey,0,0,2026-06-25
```

- [ ] **Step 2: Verifiser at CSV-en parser og har riktige kolonner**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && head -1 research/_status/domene-dekningsbok.csv && echo "rows:" && tail -n +2 research/_status/domene-dekningsbok.csv | grep -c .
```
Expected: header-linje vises; `rows: 6`.

- [ ] **Step 3: Commit**

```bash
git add research/_status/domene-dekningsbok.csv
git commit -m "feat(dekning): dekningsbok-artefakt + lokale-verdikjeder-taksonomi

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Dekningsaudit `scripts/audit-domain-coverage.ts`

**Files:**
- Create: `scripts/audit-domain-coverage.ts`
- Create: `research/_status/` markdown hull-rapport (skrevet av scriptet)
- Modify: `package.json` (npm-alias `audit:domain-coverage`)

**Interfaces:**
- Consumes: `research/_status/domene-dekningsbok.csv` (Task 1).
- Produces: `public/data/coverage/domene-profiles.json` (`[{domain,subdomain,geo,estimated_universe,universe_confidence,mapped_count,gap}]`) + `research/_status/domene-dekning-hull-<YYYY-MM-DD>.md`. CLI: `npx tsx scripts/audit-domain-coverage.ts --date=YYYY-MM-DD`.

- [ ] **Step 1: Skriv audit-scriptet**

Create `scripts/audit-domain-coverage.ts`:

```typescript
import 'dotenv/config'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const LEDGER = 'research/_status/domene-dekningsbok.csv'
const PROFILES = 'public/data/coverage/domene-profiles.json'

type Cell = {
  domain: string; subdomain: string; geo: string
  estimated_universe: number; universe_confidence: string
  mapped_count: number; gap: number
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = '', record: string[] = [], q = false
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++ } else q = false } else field += c }
    else if (c === '"') q = true
    else if (c === ',') { record.push(field); field = '' }
    else if (c === '\n') { record.push(field); field = ''; if (record.some(x => x)) rows.push(record); record = [] }
    else field += c
  }
  if (field || record.length) { record.push(field); if (record.some(x => x)) rows.push(record) }
  const header = rows.shift()!
  return rows.map(cols => Object.fromEntries(header.map((h, i) => [h.trim(), (cols[i] ?? '').trim()])))
}

function dateArg(): string {
  const a = process.argv.find(x => x.startsWith('--date='))
  return a ? a.slice('--date='.length) : new Date().toISOString().slice(0, 10)
}

async function main() {
  const date = dateArg()
  const ledger = parseCsv(readFileSync(LEDGER, 'utf8'))

  // Hent alle domene-tagga aktører én gang; tell per (domain, subdomain, geo) fra metadata.
  const actors = await prisma.actor.findMany({
    where: { themeTags: { hasSome: ledger.map(r => `domene:${r.domain}`) } },
    select: { metadata: true, country: true },
  })
  const counts = new Map<string, number>()
  for (const a of actors) {
    const m = (a.metadata ?? {}) as Record<string, unknown>
    const domain = String(m.domain ?? '')
    const subdomain = String(m.subdomain ?? '(uklassifisert)')
    const geo = String(m.geo ?? a.country ?? 'NO')
    counts.set(`${domain}|${subdomain}|${geo}`, (counts.get(`${domain}|${subdomain}|${geo}`) ?? 0) + 1)
  }

  const cells: Cell[] = ledger.map(r => {
    const mapped = counts.get(`${r.domain}|${r.subdomain}|${r.geo}`) ?? 0
    const universe = Number(r.estimated_universe) || 0
    return {
      domain: r.domain, subdomain: r.subdomain, geo: r.geo,
      estimated_universe: universe, universe_confidence: r.universe_confidence,
      mapped_count: mapped, gap: Math.max(0, universe - mapped),
    }
  })

  mkdirSync(dirname(PROFILES), { recursive: true })
  writeFileSync(PROFILES, JSON.stringify(cells, null, 2) + '\n')

  // Hull-rapport (sortert synkende på gap)
  const thin = [...cells].sort((a, b) => b.gap - a.gap)
  const md = [
    `# Domene-dekning — hull-rapport ${date}`, '',
    '| Domene | Underdomene | Geo | Univers | Kartlagt | Hull | Konfidens |',
    '|---|---|---|---|---|---|---|',
    ...thin.map(c => `| ${c.domain} | ${c.subdomain} | ${c.geo} | ${c.estimated_universe} | ${c.mapped_count} | ${c.gap} | ${c.universe_confidence} |`),
    '', `Totalt kartlagt (domene-tagga): ${cells.reduce((s, c) => s + c.mapped_count, 0)}`,
  ].join('\n')
  writeFileSync(`research/_status/domene-dekning-hull-${date}.md`, md + '\n')

  console.log(`Dekningsaudit ferdig: ${cells.length} celler, profiler -> ${PROFILES}`)
}

main().catch(e => { console.error('Coverage audit failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Legg til npm-alias**

Modify `package.json` — etter linjen `"audit:konsern": "tsx scripts/audit-konsern-coverage.ts",` legg til:

```json
    "audit:domain-coverage": "tsx scripts/audit-domain-coverage.ts",
```

- [ ] **Step 3: Kjør auditen mot eksisterende data**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npm run audit:domain-coverage -- --date=2026-06-25 && echo "---" && cat public/data/coverage/domene-profiles.json | head -20
```
Expected: «Dekningsaudit ferdig: 6 celler …»; `domene-profiles.json` viser cellene. NB: eksisterende 59 noder har `metadata.domain` men ikke `subdomain` → de teller i `(uklassifisert)`-bøtta, ikke i de navngitte underdomenene. Det er forventet (subdomene fylles av nye runder).

- [ ] **Step 4: Typecheck + lint**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "audit-domain-coverage" || echo "tsc OK"; npx eslint scripts/audit-domain-coverage.ts && echo "eslint OK"
```
Expected: «tsc OK» og «eslint OK».

- [ ] **Step 5: Commit**

```bash
git add scripts/audit-domain-coverage.ts package.json public/data/coverage/domene-profiles.json research/_status/domene-dekning-hull-2026-06-25.md
git commit -m "feat(dekning): audit-domain-coverage — teller kartlagte noder, skriver hull-rapport

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Generalisert importer `scripts/import-domain-actors.ts`

**Files:**
- Create: `scripts/import-domain-actors.ts` (parameterisert refaktor av `scripts/import-regenerativ-lokalmat-actors.ts`)
- Modify: `package.json` (alias `db:import:domain` + innlemmelse i `db:prod-sync`)

**Interfaces:**
- Consumes: kandidat/review-CSV (15-kolonners skjema) + et `dataset`-config.
- Produces: CLI `npx tsx scripts/import-domain-actors.ts --csv=<sti> --dataset=<tag> --doc=<document-slug-match> [--rel=<sti.json>]`. Idempotent upsert; samme dedup-/berik-logikk som forrige runde.

- [ ] **Step 1: Skriv den generaliserte importeren**

Create `scripts/import-domain-actors.ts`. Bruk `scripts/import-regenerativ-lokalmat-actors.ts` (PR #200) som mal, med disse endringene fra den hardkodede versjonen:
- Les `--csv`, `--dataset`, `--doc`, `--rel` fra `process.argv` i stedet for konstantene `CSV_PATH`/`DATASET_TAG`/`NOTE_FILE_MATCH`/`RELATIONSHIP_SOURCE`.
- `themeTags` per node: `['domene:' + r.domain, r.subdomain ? 'subdomene:' + r.subdomain : null, datasetTag].filter(Boolean)` (les `subdomain` fra ny CSV-kolonne `subdomain` hvis til stede, ellers utelat).
- `nodeMetadata` legger til `subdomain: r.subdomain ?? null` og `geo: r.country || 'NO'`.
- Relasjoner leses fra valgfri `--rel`-JSON (`[{from,to,type,note?}]`) i stedet for den hardkodede `RELATIONSHIPS`-lista; hvis `--rel` mangler, hopp over relasjons-steget.
- `buildPersonProfile` blir generisk: `roles: []`, `affiliations: []`, `tags: ['domene:'+r.domain, datasetTag]`, `biography: r.description` (ingen hardkodede Barstow/McMillion-grener).
- Behold uendret: CSV-parser, `mapActorType`, `parseKeyPeople`, `websiteFrom`, `parseAccessedAt`, dedup-mot-eksisterende (`existingBySlug` + `resolveActorId`), idempotent upsert, scoped relasjons-slett på `source = 'document:'+docSlug` (les fra `--doc`-oppslag).

Konkret CLI-arg-parsing øverst i `main()`:
```typescript
function arg(name: string, fallback?: string): string {
  const a = process.argv.find(x => x.startsWith(`--${name}=`))
  if (a) return a.slice(`--${name}=`.length + 1)
  if (fallback !== undefined) return fallback
  throw new Error(`Mangler påkrevd argument --${name}=`)
}
const CSV_PATH = arg('csv')
const datasetTag = arg('dataset')
const noteMatch = arg('doc', '')          // tom = ingen dok-ref
const relPath = arg('rel', '')            // tom = ingen relasjoner
```

- [ ] **Step 2: Legg til npm-alias + prod-sync**

Modify `package.json` — etter `"db:import:regenerativ-lokalmat": ...` legg til:
```json
    "db:import:domain": "tsx scripts/import-domain-actors.ts",
```
(Konkrete celle-runder kjøres med eksplisitte argumenter, f.eks. `npm run db:import:domain -- --csv=... --dataset=...`. Egne per-runde-alias legges til når runder committes; prod-sync-innlemmelse skjer per runde i Task 4.)

- [ ] **Step 3: Idempotens-test mot et lite fikstur**

Create midlertidig `tmp-domain-fixture.csv`:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && cat > /tmp/domain-fixture.csv <<'CSV'
node_id,name,node_type,domain,subdomain,country,description,key_people,scale_metric_year,org_nr,locator_url,sourceClass,verificationStatus,confidence,accessedAt,notes
test-domain-node-xyz,Test Domain Node XYZ,organisasjon,lokale-verdikjeder,reko,NO,Testnode for idempotens,,,,https://example.org,secondary,unverified,lav,2026-06-25,fixtur
CSV
```

- [ ] **Step 4: Kjør importeren to ganger; verifiser ingen duplikater**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsx scripts/import-domain-actors.ts --csv=/tmp/domain-fixture.csv --dataset=test-domain-fixture && npx tsx scripts/import-domain-actors.ts --csv=/tmp/domain-fixture.csv --dataset=test-domain-fixture && npx tsx -e "
import 'dotenv/config'; import { PrismaClient } from './src/generated/prisma/client'; import { PrismaPg } from '@prisma/adapter-pg'
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
p.actor.count({ where: { slug: 'test-domain-node-xyz' } }).then(n => console.log('count:', n)).finally(() => p.\$disconnect())
"
```
Expected: `count: 1` (én rad tross to kjøringer).

- [ ] **Step 5: Rydd fikstur fra DB**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsx -e "
import 'dotenv/config'; import { PrismaClient } from './src/generated/prisma/client'; import { PrismaPg } from '@prisma/adapter-pg'
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
;(async () => { await p.actorDocumentRef.deleteMany({ where: { actorId: 'test-domain-node-xyz' } }); await p.actorContact.deleteMany({ where: { actorId: 'test-domain-node-xyz' } }); await p.actor.deleteMany({ where: { slug: 'test-domain-node-xyz' } }); console.log('ryddet') })().finally(() => p.\$disconnect())
"
```
Expected: `ryddet`.

- [ ] **Step 6: Typecheck + lint + commit**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i "import-domain-actors" || echo "tsc OK"; npx eslint scripts/import-domain-actors.ts && echo "eslint OK"
git add scripts/import-domain-actors.ts package.json
git commit -m "feat(dekning): generalisert import-domain-actors (CLI-parameterisert, idempotent)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
Expected: «tsc OK», «eslint OK», commit opprettet.

---

### Task 4: Bevis-runde — `lokale-verdikjeder` (NO)

**Files:**
- Create: `research/_status/lokale-verdikjeder-node-kandidater-2026-06-25.csv`
- Create: `research/_status/lokale-verdikjeder-relasjoner-2026-06-25.json` (valgfri)
- Create: `research/_status/lokale-verdikjeder-mottakslogg-2026-06-25.md`
- Modify: `package.json` (per-runde-alias + prod-sync), `research/_status/domene-dekningsbok.csv` (oppdaterte `last_updated`)

**Interfaces:**
- Consumes: Task 3-importer, Task 2-audit.
- Produces: importerte `lokale-verdikjeder`-noder med `subdomene:`-tagger; oppdatert dekningsbok/profiler.

- [ ] **Step 1: Registreringspass — bygg kandidat-CSV fra strukturerte lister**

Samle inn for hver celle, til 15+1-kolonners skjema (`...,domain,subdomain,country,...`):
- `reko`: REKO Norge ringliste (rekonorge.no) — per ring: navn, lokator-URL, `node_type=nettverk`, `subdomain=reko`.
- `bondens-marked`: Bondens marked lokallag (bondensmarked.no).
- `andelslandbruk`: andelslandbruk.no-kart (Økologisk Norge).
- `gaardsutsalg`: HANEN-medlemmer + lokalmat.no-utsalg.
- `paraply-nettverk`: allerede dekket av forrige runde — kun dedup-berikelse.

Skriv radene til `research/_status/lokale-verdikjeder-node-kandidater-2026-06-25.csv`. `sourceClass=primary|registry_snapshot`, `verificationStatus=machine_verified` for registeroppslag, `unverified` der bare listet. Per node: `node_id` = kebab-slug.

- [ ] **Step 2: Agent-fanout — fyll praktikerlaget**

Dispatch én research-agent per tynn celle (`gaardsutsalg`, `markedshager`) med streng «ikke gjett»-instruks (mal: forrige rundes verifiseringsprompt). Agenten skriver rader til samme kandidat-CSV med `verificationStatus=unverified` (aldri `machine_verified` for agent-funn). Dedup mot eksisterende `node_id`/navn før tilføyelse.

- [ ] **Step 3: Dedup + review**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsx -e "
import 'dotenv/config'; import { readFileSync } from 'node:fs'; import { PrismaClient } from './src/generated/prisma/client'; import { PrismaPg } from '@prisma/adapter-pg'
const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
;(async () => {
  const lines = readFileSync('research/_status/lokale-verdikjeder-node-kandidater-2026-06-25.csv','utf8').split(/\r?\n/).slice(1).filter(Boolean)
  const ids = lines.map(l => l.split(',')[0])
  const hit = await p.actor.findMany({ where: { slug: { in: ids } }, select: { slug: true, id: true } })
  console.log('kandidater:', ids.length, '| finnes allerede (berik):', hit.map(h => h.slug).join(', ') || 'ingen')
})().finally(() => p.\$disconnect())
"
```
Expected: liste over kandidater og hvilke som allerede finnes (berikes additivt, ikke dupliseres). Gå gjennom CSV-en manuelt; fjern/merk usikre rader.

- [ ] **Step 4: Importer runden**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsx scripts/import-domain-actors.ts --csv=research/_status/lokale-verdikjeder-node-kandidater-2026-06-25.csv --dataset=lokale-verdikjeder-2026-06-25
```
Expected: «Ferdig: N aktører, …» uten feil.

- [ ] **Step 5: Reconcile — oppdater dekningsbok + profiler**

Sett `last_updated=2026-06-25` på de berørte cellene i `research/_status/domene-dekningsbok.csv`, så kjør:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npm run audit:domain-coverage -- --date=2026-06-25 && cat public/data/coverage/domene-profiles.json
```
Expected: `mapped_count` for `reko`/`bondens-marked`/`andelslandbruk` osv. har økt; `gap` redusert tilsvarende.

- [ ] **Step 6: Skriv mottakslogg + registrer alias**

Create `research/_status/lokale-verdikjeder-mottakslogg-2026-06-25.md` (antall noder per celle, kilder, dedup-treff, dekningsdelta). Modify `package.json`: legg til `"db:import:lokale-verdikjeder-2026": "tsx scripts/import-domain-actors.ts --csv=research/_status/lokale-verdikjeder-node-kandidater-2026-06-25.csv --dataset=lokale-verdikjeder-2026-06-25"` og innlemm i `db:prod-sync` (etter `db:import:regenerativ-lokalmat`).

- [ ] **Step 7: Commit**

```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026"
git add research/_status/lokale-verdikjeder-*.csv research/_status/lokale-verdikjeder-*.json research/_status/lokale-verdikjeder-mottakslogg-2026-06-25.md research/_status/domene-dekningsbok.csv research/_status/domene-dekning-hull-2026-06-25.md public/data/coverage/domene-profiles.json package.json
git commit -m "feat(dekning): bevis-runde lokale-verdikjeder (NO) — registre + agent-fanout

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Offentlig flate — `verificationStatus`-badge på `/aktorer`

**Files:**
- Modify: `src/lib/queries/actors.ts` (inkludér `verificationStatus` i select)
- Modify: `src/app/aktorer/AktorerContent.tsx` (type + badge-render)

**Interfaces:**
- Consumes: `Actor.verificationStatus` (eksisterende felt).
- Produces: synlig status-badge; domene-filter dekkes alt av eksisterende `themeFilter` (themeTags inkluderer `domene:*`).

- [ ] **Step 1: Inkludér verificationStatus i list-spørringen**

Modify `src/lib/queries/actors.ts` — i `getActors`-`findMany` (linje ~48), legg `verificationStatus: true` til i `select`/`include`-objektet på aktørnivå (ved siden av eksisterende felter). Hvis spørringen bruker implisitt full-rad (ingen `select` på toppnivå), er feltet allerede med — verifiser ved å lese funksjonen først.

- [ ] **Step 2: Vis badge i aktørlista**

Modify `src/app/aktorer/AktorerContent.tsx`:
- I `Actor`-typen (rundt linje 14–23) legg til `verificationStatus: string | null`.
- Ved siden av priorityTier-badgen (rundt linje 339–341), legg til:
```tsx
{actor.verificationStatus && actor.verificationStatus !== 'human_verified' && actor.verificationStatus !== 'machine_verified' && (
  <span className="text-[10px] px-1.5 py-0.5 rounded border border-amber-400 text-amber-700">
    {actor.verificationStatus === 'disputed' ? 'omstridt' : 'ubekreftet'}
  </span>
)}
```

- [ ] **Step 3: Verifiser bygg + lint + test**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npx tsc --noEmit -p tsconfig.json 2>&1 | grep -iE "actors.ts|AktorerContent" || echo "tsc OK"; npx eslint src/lib/queries/actors.ts src/app/aktorer/AktorerContent.tsx && echo "eslint OK"; npm run build 2>&1 | tail -5
```
Expected: «tsc OK», «eslint OK», bygg fullfører.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries/actors.ts src/app/aktorer/AktorerContent.tsx
git commit -m "feat(aktorer): verificationStatus-badge (omstridt/ubekreftet) i aktoerlista

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Verifiseringsgate + PR

**Files:** ingen nye (kjører gate-batteriet og åpner PR).

- [ ] **Step 1: Bekreft disputed/unverified ekskludert fra citable-gates**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npm run gate:overclaim 2>&1 | tail -15
```
Expected: ingen nye `disputed`/`unverified` domene-noder rapportert som whitepaper-eksponert/overclaim. Hvis noen lekker, legg dataset-taggen til ekskluderingslista i gate-konfigurasjonen og re-kjør.

- [ ] **Step 2: Kjør hele verifiseringsbatteriet**

Run:
```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026" && npm run db:audit 2>&1 | tail -5 && npm run db:audit:strict-sources >/dev/null 2>&1; echo "strict exit: $?" && npm run audit:research-artifacts -- --base=origin/main 2>&1 | tail -3
```
Expected: db:audit «All enforced integrity checks passed»; `strict exit: 0`; research-artifacts `Violations: 0`.

- [ ] **Step 3: Åpne PR (egen branch fra main, jf. forrige rundes mønster)**

Lag en dedikert branch fra `main` (git worktree for å ikke forstyrre arbeidstreet), cherry-pick/commit denne planens commits dit, push, og:
```bash
gh pr create --base main --title "feat(dekning): domene-kartlegging-rammeverk + lokale-verdikjeder-runde" --body-file <pr-body>
```
Expected: PR-URL returnert. Deploy via Coolify/`justaride`.

---

## Self-Review

**Spec coverage:**
- §4.1 taksonomi → Task 1. §4.2 dekningsbok → Task 1. §4.3 dekningsaudit → Task 2.
- §5 datamodell (themeTags/metadata, tiered status, dedup) → Task 3 (importer) + Global Constraints.
- §6 pipeline (registreringspass, agent-fanout, dedup/review, import, reconcile) → Task 4.
- §6.1 importer-kontrakt → Task 3.
- §7 offentlig flate + gates → Task 5 (badge/filter) + Task 6 (gate-bekreftelse).
- §8 kadens/eierskap → mottakslogg (Task 4) + dekningsbok selv-dokumenterende.
- §9 success criteria → Task 6 (gate-batteri) + per-task-verifisering.

**Placeholder scan:** Ingen TBD/TODO. Task 4 step 1–2 er datainnsamling (iboende åpne mengder), men har konkrete kilder per celle og eksakt utdata-skjema — ikke kode-placeholders. Task 5 step 1 ber leseren lese `getActors` først fordi select-formen avgjør om endring trengs (eksplisitt betinget, ikke vag).

**Type consistency:** `themeTags`-format (`domene:`/`subdomene:`) konsistent Task 1↔2↔3. `metadata.domain/subdomain/geo` konsistent Task 2 (lesing) ↔ Task 3 (skriving). CLI-args (`--csv`/`--dataset`/`--doc`/`--rel`) konsistent Task 3↔4. `domene-profiles.json`-form konsistent Task 2↔4.
