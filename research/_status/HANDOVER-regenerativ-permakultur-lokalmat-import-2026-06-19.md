# HANDOVER: Import av regenerativ/permakultur/lokalmat-noder til plattform

> **Til:** agent med fulle tillatelser (DB-tilgang, nett/arkivering, commit/PR)
> **Fra:** kartleggingsrunde 2026-06-19
> **Mål:** Ta det kildevaliderte node-datasettet fra «kandidat» til importert, auditert og committet — uten å bryte claim-lock/kildestandard.
> **Estimert omfang:** 1 import-script + SHA-256-arkivering + 3 åpne verifiseringspunkter + audits + PR.

---

## 0. TL;DR — rekkefølge

1. **Les** de tre inputfilene (§1) og `.claude/source-attribution-policy.md` + `.claude/data-imports.md` + `.claude/database.md`.
2. **Arkivér kilder** med SHA-256 (§4, Fase 1) — kreves før noden kan brukes whitepaper-klart.
3. **Lukk de 3 åpne verifiseringspunktene** (§5, Fase 2) — eller importér dem eksplisitt som `unverified`/`disputed`.
4. **Skriv import-script** `scripts/import-regenerativ-lokalmat-actors.ts` (§6, Fase 3) — `Actor` + `ActorContact` + `ActorRelationship` + `PersonProfile`, idempotente upserts.
5. **Kjør** `npm run db:import:actors && npm run db:import:persons` → `npm run db:audit` (§7).
6. **Kjør kildegate** `npm run audit:citable` / `npm run gate:overclaim` + `npm run audit:research-artifacts -- --base=origin/main` (§7).
7. **Commit/PR** (§8). Deploy via Coolify/`justaride` — aldri Vercel.

**Ikke gjør:** ikke importér `disputed`-noder som verifisert; ikke fremstill REKO Danmark som aktiv; ikke knytt SUM til NMBU (SUM = UiO); ikke bruk «Maad seeds» (finnes ikke); ikke commit rå PDF-er eller filer ≥50 MB.

---

## 1. Input-artefakter

| Fil | Innhold |
|---|---|
| `research/bibliotek/regenerativ-permakultur-lokalmat-norge-kartlegging-2026-06-19.md` | Kunnskapsnotat (v2): Norge + Norden, 9 seksjoner, ~110 kilder inline, verifiseringslogg §8 |
| `research/_status/regenerativ-permakultur-lokalmat-node-kandidater-2026-06-19.csv` | **Import-kandidat: 59 noder** (36 NO + 23 Norden), 15 kolonner m/ kildestandard-felt |
| `research/_status/HANDOVER-regenerativ-permakultur-lokalmat-import-2026-06-19.md` | Dette dokumentet |

CSV-kolonner: `node_id, name, node_type, domain, country, description, key_people, scale_metric_year, org_nr, locator_url, sourceClass, verificationStatus, confidence, accessedAt, notes`.

`node_type`-verdier: `organisasjon | person | nettverk | gaard | institusjon | prosjekt | ordning`.
`domain`-verdier: `lokale-verdikjeder | regenerativ-praksis | permakultur-fleraarige | institusjon-finansiering`.

---

## 2. Forutsetninger (sjekk før start)

- `DATABASE_URL` peker til riktig DB (`.env`/`.env.local`). Prod-Postgres er **ikke** nåbar fra build-containeren; import kjøres mot DB-en du har tilgang til, og DB-deriverte artefakter committes separat (jf. CLAUDE.md).
- `npx tsx` virker; `npm run db:audit` kjører rent på utgangspunktet.
- Nett-tilgang for kildearkivering og for å lukke de åpne verifiseringspunktene.

---

## 3. Datamodell-mapping (CSV → Prisma)

Per `.claude/database.md`:

| CSV-node | Prisma-modell | Import-script | Unik nøkkel |
|---|---|---|---|
| `node_type` ≠ person (org/nettverk/gård/institusjon/prosjekt/ordning) | **`Actor`** | `import-actors.ts` (`db:import:actors`) | `slug` (bruk `node_id`) |
| `node_type` = person (Barstow, McMillion) | **`PersonProfile`** | `import-person-profiles.ts` (`db:import:persons`) | `personKey` (normalisert) |
| `key_people` på en Actor | **`ActorContact`** | (samme som Actor) | — |
| nettverkskoblinger (§ nedenfor) | **`ActorRelationship`** | (samme som Actor) | — |
| kobling node → kunnskapsnotatet | **`ActorDocumentRef`** | — | `[actorId, documentId]` |

**Felt-mapping for `Actor`:**
- `slug` ← `node_id`
- `name` ← `name`
- `actorType` ← utled av `node_type` (f.eks. `movement`, `ngo`, `network`, `farm`, `research_institution`, `project`, `public_scheme` — bruk eksisterende `actorType`-vokabular i `import-actors.ts`; ikke finn opp nye uten å sjekke)
- `country` ← `country` (NO/SE/DK/FI/IS; «Nordic» → behandle som regional, sett egen verdi eller `null` + tag)
- `themeTags` ← `[domain]` + ev. `regenerativt`, `permakultur`, `lokalmat`, `froebevaring`
- biografi/beskrivelse ← `description`

**Felt-mapping for `PersonProfile`** (kun Barstow, McMillion):
- `personKey` ← normalisér `name` (lowercase, NFD, strip diakritikk, mellomrom→bindestrek) — **bruk samme normalisering som eksisterende import-scripts** (se `.claude/data-imports.md` §«Adding Person Profiles»). Forventet: `stephen-barstow`, `andrew-mcmillion`.
- `biography` ← `description`
- `roles` ← `[{companyName: 'KVANN', role: '...', fromYear: ...}]` der kjent
- `affiliations`/`tags` ← domener + `KVANN`, `permakultur`

**ID-regler (jf. `.claude/company-registry.md`):** ikke-norske aktører bruker landprefiks (`SE-`, `DK-`, `FI-`, `IS-`) hvis du oppretter `Company`-rader; for `Actor` brukes `slug` + `country`-felt.

**`ActorRelationship`-koblinger å opprette** (fra notatets §6 «koblinger»):
- `kvann` ↔ `stephen-barstow`, `andrew-mcmillion`, `solhatt`, `schubelers-hager`, `fra-froe-til-fat`, `multistrata-gjoeding` (type: `member`/`affiliation`)
- `reko-norge` ↔ `nbs-lokalmat` (type: `spun_off_from`/`coordinated_by`)
- `regenerativt-norge` ↔ `holistic-management-no` + `holistic-management-sverige` (type: `network`; Savory)
- `regenerativt-norge` ↔ `regenerativt-sverige`, `regenerativt-jordbrug-dk` (type: `sister_org`)
- `lets-liberate-diversity` ↔ `kvann`, `sesam`, `froesamlerne-dk` (type: `member`)
- `nordgen` ↔ Svalbard Global Seed Vault (drift)
- `hurdal-klynge` er en **syntese-node** (`internal_construct`/`synthesis`) — merk som forskningskonstrukt, ikke registervirksomhet.

---

## 4. FASE 1 — SHA-256-arkivering av kilder (obligatorisk før whitepaper)

Per `.claude/source-attribution-policy.md` skal git bære metadata + tekstuttrekk + URL + `accessedAt` + SHA-256; store rådokumenter ligger i artifact storage (ikke som tracked PDF).

Per kilde brukt til en **sentral** påstand:
1. Hent siden, lagre tekstuttrekk/HTML i artifact storage (ikke commit rå PDF til `research/**`).
2. Beregn SHA-256, lagre i et `SourceCitation`/`SourceDoc`-felt eller manifest.
3. For ustabile websider (org.-sider, presse, lokalavis som Huldravisa): legg ved Wayback-/arkivlink.
4. DOI-kilder (NIBIO Rapport 12(65), Ambio 2020) trenger ikke Wayback.

**Minimum `SourceCitation` per påstand** (policy §«Minimum for ny import»): `sourceClass`, `citationText`, `accessedAt` (ISO `YYYY-MM-DD`), minst én lokator (`url`/`localPath`/`sourceDocId`/`documentId`), `verificationStatus` (minst `unverified`), `fieldPath` der citationen gjelder ett felt.

CSV-en har allerede `sourceClass`, `verificationStatus`, `confidence`, `accessedAt` (2026-06-19) og `locator_url` per node — bruk disse direkte som citation-grunnlag.

---

## 5. FASE 2 — Lukk de 3 åpne verifiseringspunktene

| Punkt | Status nå | Hva som trengs |
|---|---|---|
| **Multistrata Agroforestry** (EU-prosjekt, Gjøding/KVANN) | `disputed` — ingen EU-database-treff (re-bekreftet 2026-06-19, §5b) | Kontakt KVANN/Andrew McMillion direkte for prosjekt-ID/GA, program (Erasmus+/Interreg?), partnernavn. Inntil da: importér `disputed`/`confidence=lav`, eller hold tilbake. **NB:** ikke konflatér med Arche Noah-ledet Erasmus+ KA1 (~2021) eller Hurdal kommunes Grønt fond (kommunalt, ikke EU) — det er separate aktiviteter (§5b). |
| **REKO Norge 2025/26-tall** | siste offisielle feb. 2022 | Hent fra REKO Norge årsmøte mars 2026 / årsmelding 2025 (org.nr. 935 472 350). Inntil da: behold 2022-tall merket «siste offisielle». |
| **Andelslandbruk dagens antall** | anslag 80–90 (2024+) | Ingen offisiell telling etter 2023 (93 i drift). Behold som anslag eller kontakt Økologisk Norge. |

**Regel:** disse skal **ikke** importeres som `machine_verified`/`human_verified`. Enten lukk mot primærkilde og oppgrader, eller importér med `disputed`/`unverified` og `confidence` som i CSV.

### 5b. Primærverifisering av de 3 `disputed` CSV-nodene — resultat (2026-06-19, andre runde)

De tre `disputed`/grenseverdi-nodene i CSV-en ble re-verifisert mot primærkilder 2026-06-19. **Konklusjon: ingen oppgraderes til `machine_verified` på dagens kildegrunnlag** — importér med status og `confidence` nøyaktig som i CSV, og bruk formuleringene under.

**NODE 1 — `multistrata-gjoeding` (Multistrata Agroforestry): STATUS `disputed` opprettholdt — IKKE EU-verifiserbar.**
- Ingen treff i CORDIS, Erasmus+ Project Results Platform eller Interreg/keep.eu for Gjøding-piloten. «Multistrata agroforestry» er en *metodebeskrivelse*, ikke et registrert prosjektakronym.
- Påstanden (3-årig EU-finansiert, 6 organisasjoner, DE/FI/PT/NO) stammer fra **én norsk lokalavis (huldravisa.no)** — ingen sporbar EU-oppføring, intet GA-nummer, ingen partnernavn (kun 4 land nevnt, 0 organisasjonsnavn).
- **Ikke konflatér:** (a) en separat **Arche Noah-ledet Erasmus+ KA1** utdanningsaktivitet (~2021) med KVANN-styremedlemmer, og (b) **Hurdal kommunes Grønt fond** (kommunal, *ikke* EU) som McMillions egen side krediterer for regenerativ-gård-arbeidet. Begge er andre aktiviteter enn Gjøding-6-partnerpiloten.
- **Import:** behold `secondary`/`disputed`/`confidence=lav`. Eksponér **ikke** som EU-prosjekt whitepaper-klart. Oppgrader kun mot CORDIS/Erasmus+-oppføring eller GA-nummer direkte fra KVANN/McMillion.
- Kilder: `huldravisa.no/...garden-gar-inn-i-en-ny-fase/` (primær lokalavis-påstand); `mcmillion.no/2024/12/13/co-creating-a-regenerative-farm-in-hurdal/` (Grønt fond, ikke EU); `edimentals.com/blog/?tag=kvann` (Arche Noah KA1-kontekst); `cordis.europa.eu` + `erasmus-plus.ec.europa.eu/projects/search` (ingen treff).

**NODE 2 — `reko-sverige` (REKO-ringar Sverige): STATUS `disputed` opprettholdt — ingen ferskere primærtall enn 2021.**
- Siste tall knyttet til den offisielle telleren: **~220 aktive ringer / >800 000 FB-medlemmer (jan. 2021)** — Hushållningssällskapet (primær). HS' REKO-oppdrag **opphørte høsten 2021**; siden er frosset med stale-content-merknad. Ingen aktør fører lenger samlet statistikk.
- Ferskeste indikasjon: **«godt over 200 ringer» (2023)** — men **uattribuert sekundær** (gjengitt i Mat och Klimat, publ. 17.02.2025; ingen navngitt studie/organisasjon bak). Styrker ikke 2021-tallet.
- LRF publiserer **ingen** ring-telling. Sekundærmedia antyder post-pandemisk nedgang/enkelte ring-nedleggelser — retning etter 2021 er uviss.
- **Import:** behold `~220 ringer / ~800 000 FB-medlemmer (jan. 2021)` som siste offisielle, eksplisitt merket «HS sluttet å telle h.2021». «200+ (2023)» kun som uattribuert sekundæranslag. `secondary`/`disputed`/`confidence=middels` som i CSV.
- Kilder: `hushallningssallskapet.se/tjanster/landsbygd/reko/` (primær, 220/800k jan. 2021); `matochklimat.nu/reko-ringar-koncept-som-kommit-for-att-stanna/` (sekundær, «200+» 2023).

**NODE 3 — `reko-danmark` (REKO i Danmark): STATUS bekreftet negativt funn — IKKE aktiv node.**
- Re-bekreftet: REKO fikk aldri fotfeste i Danmark. Første ring **REKO-Ring Køge** (Facebook, 01.11.2018, lokalt initiativ via Stevns Fødevarenetværk — ikke nasjonal utrulling) gikk **i dvale ~08.04.2020** (økonomisk ikke bærekraftig).
- **Ingen organisert «REKO Danmark»-paraply** finnes; hver ring opererte selvstendig. **0 bekreftede aktive ringer 2024–2026** (slutning fra fravær av motbevis — ingen register/oversikt eksisterer å telle mot).
- L&F-sitat bekreftet: chefkonsulent **Anders Nicolajsen** (Landbrug & Fødevarer), LandbrugsAvisen 28.11.2023: «Vi vil gerne lege med, hvis nogen vil forsøge at få det i gang.»
- **Import:** behold `machine_verified` som **negativt funn** (`confidence=middels`). Fremstill **ikke** som aktiv REKO-node; formuler som negativt eksempel (konseptet etablerte seg ikke).
- Kilder: `landbrugsavisen.dk/chefkonsulent-om-reko-ring-i-danmark-...` (primær for L&F-posisjon; sekundær-journalistisk for negativt funn); `sn.dk/art1223954/...ringen-er-sluttet-for-reko-ring/` (primær for Køge-dvale 2020); `okonu.dk/mad-og-marked/flere-reko-ringe-er-pa-vej-i-danmark` (sekundær).

**Fortsatt uverifiserbart (carry-over):** Multistrata EU-prosjekt-ID/GA/partnernavn (krever KVANN/McMillion); REKO Sverige-tall 2024–2026; om noen hyperlokal dansk REKO-FB-gruppe stille består; REKO Norge 2025/26-tall.

---

## 6. FASE 3 — Skriv import-scriptet

Opprett `scripts/import-regenerativ-lokalmat-actors.ts` etter mønsteret i `.claude/data-imports.md`:

```typescript
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { parse } from 'csv-parse/sync'        // eller prosjektets eksisterende CSV-helper
import { readFileSync } from 'node:fs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const CSV = 'research/_status/regenerativ-permakultur-lokalmat-node-kandidater-2026-06-19.csv'
const SOURCE_DOC = 'regenerativ-permakultur-lokalmat-norge-kartlegging-2026-06-19' // Document.slug

async function main() {
  const rows = parse(readFileSync(CSV), { columns: true, skip_empty_lines: true })
  for (const r of rows) {
    if (r.node_type === 'person') continue   // håndteres av import-person-profiles.ts
    await prisma.actor.upsert({
      where: { slug: r.node_id },
      update: { name: r.name, actorType: mapActorType(r.node_type), country: r.country || null,
                themeTags: [r.domain] },
      create: { id: r.node_id, slug: r.node_id, name: r.name, actorType: mapActorType(r.node_type),
                country: r.country || null, themeTags: [r.domain] },
    })
    // + ActorContact for r.key_people, + SourceCitation (sourceClass/verificationStatus/accessedAt/url)
    // + ActorDocumentRef → Document(slug = SOURCE_DOC)
  }
  // + ActorRelationship-koblinger (se §3)
}

main().catch((e) => { console.error('Import failed:', e); process.exit(1) })
     .finally(() => prisma.$disconnect())
```

**Krav:**
- **Idempotent** (upsert på `slug`/`personKey`) — skal kunne kjøres flere ganger.
- **Person-noder** (Barstow `stephen-barstow`, McMillion `andrew-mcmillion`) går via `import-person-profiles.ts`-mønsteret (`db:import:persons`), ikke som `Actor`.
- **SourceCitation per node** med `sourceClass`/`verificationStatus`/`accessedAt`/`url` fra CSV.
- **Koble alle noder til kunnskapsnotatet** via `ActorDocumentRef` (krever at notatet finnes som `Document` — kjør `db:import:docs`/`db:import:root` hvis ikke).
- Registrér ev. nye npm-script-alias i `package.json` (`db:import:regenerativ-lokalmat`) i samme stil som de øvrige.

---

## 7. FASE 4 — Kjør import + audits

```bash
# 1. Import
npm run db:import:actors        # eller ditt nye alias db:import:regenerativ-lokalmat
npm run db:import:persons       # Barstow + McMillion

# 2. Integritet
npm run db:audit

# 3. Kildegate (claim-lock) — jf. CLAUDE.md «Verification Defaults»
npm run audit:citable           # citable knowledge-base status
npm run gate:overclaim          # blokkerer overclaim mot kildegrunnlag

# 4. Forskningsartefakt-guardrail (ingen rå PDF / filer >=50 MB i diff)
npm run audit:research-artifacts -- --base=origin/main

# 5. Hvis DB-deriverte chart/coverage-artefakter påvirkes
npm run compute-metrics:full    # regenererer public/data/coverage/profiles.json + data/konsern-coverage.json
```

Forventet: `db:audit` rent; `audit:citable`/`gate:overclaim` uten nye `legacy_unsourced`/`disputed`-brudd (disputed-nodene må være eksplisitt merket, ikke whitepaper-eksponert).

---

## 8. FASE 5 — Commit / PR

- Branch + commit med sporbar melding, f.eks. `feat(actors): importer regenerativ/permakultur/lokalmat-noder (NO+Norden)`.
- Inkludér: import-script, ev. `package.json`-alias, regenererte DB-deriverte artefakter (hvis §7 pkt. 5 kjørte), og dette handover-dokumentet + CSV + notat hvis ikke allerede committet.
- **Ikke** commit rå PDF-er til `research/**`/`docs/**` eller tracked filer ≥50 MB (blokkeres av `audit:research-artifacts`).
- Deploy: **Coolify på Hetzner via GitHub `justaride` — aldri Vercel.**

---

## 9. Definition of Done

- [ ] Alle 56 ikke-disputed noder finnes som `Actor`/`PersonProfile` med `SourceCitation` og `ActorDocumentRef` til notatet.
- [ ] Barstow + McMillion importert som `PersonProfile` med korrekt `personKey` og KVANN-rolle.
- [ ] `ActorRelationship`-koblingene i §3 opprettet.
- [ ] De 3 disputed/åpne nodene enten primærverifisert og oppgradert, ELLER importert eksplisitt som `disputed`/`unverified`.
- [ ] Kilder arkivert med SHA-256 (Fase 1).
- [ ] `db:audit`, `audit:citable`, `gate:overclaim`, `audit:research-artifacts` kjører rent.
- [ ] Committet på branch; PR åpnet; ingen rå binær/PDF i diff.

---

## 10. Faste forbehold (carry-over fra verifiseringen)

1. **SUM ≠ NMBU** — Senter for utvikling og miljø tilhører UiO. Ikke koble til NMBU.
2. **«Maad seeds» finnes ikke** — utelatt; tiltenkt aktør er `kvann`.
3. **REKO Danmark** = negativt funn (konseptet fikk ikke fotfeste) — ikke importér som aktiv node. Re-bekreftet 2026-06-19: Køge-ringen i dvale 08.04.2020, ingen paraply, 0 aktive ringer 2024–26 (§5b).
4. **Demeter Norge i krise** — 12 gårder (2025), RVUD trakk seg 01.01.2026, «Demeter Norge» fryst; bruk forsiktig formulering.
5. **Multistrata Agroforestry** — ingen offisiell EU-kilde (re-bekreftet 2026-06-19, §5b); `disputed` til KVANN bekrefter prosjekt-ID/GA. Ikke konflatér med Arche Noah Erasmus+ KA1 (~2021) eller Hurdal kommunes Grønt fond (kommunalt, ikke EU).
7. **REKO Sverige** — siste primærtall ~220 ringer / ~800 000 FB-medlemmer (jan. 2021, Hushållningssällskapet); HS sluttet å telle h.2021; «200+ (2023)» er uattribuert sekundær. Ingen ferskere offisiell telling (§5b).
6. **Finansieringsbeløp** (Matnasjonen 25 mrd./2035, Utviklingsprogrammet 254 mill.) er primærverifisert; proveniens korrigert (25 mrd. = 2025-veilederen, ikke 2021-strategien).

---

## 11. Node-inventar (oppsummert)

- **Totalt:** 59 noder. Per land: NO 36, SE 7, DK 5, FI 5, IS 2, Nordic 4.
- Per domene: institusjon-finansiering 19, permakultur-flerårige 17, regenerativ-praksis 13, lokale-verdikjeder 10.
- Per verifiseringsstatus: `machine_verified` 32, `unverified` 22, `disputed` 3, `human_verified` 2 (Barstow, McMillion).
- **2 personer** (PersonProfile), **resten Actor**.
- Høyest-verdi nav for plattformen: `kvann` (binder Barstow/McMillion/Solhatt/Schübeler/Multistrata), `regenerativt-norge` (Savory/EOV-aksen), `hurdal-klynge` (geografisk hotspot, syntese-node).
