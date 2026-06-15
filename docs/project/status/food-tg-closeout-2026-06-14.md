---
tittel: Food TG — Closeout-playbook: strict-source-opprydding + siste mil (2026-06-14)
status: Operator-playbook (siste mil)
eier: Gabriel
dato: 2026-06-14
formål: Dra AP-1/AP-5/maktkart-sporet helt i land. Den pushede pakken er landet; dette lukker det som gjenstår lokalt — først og fremst den røde strict-source-gaten som blokkerer hele citable operator-sekvensen.
relaterte_filer:
  - docs/project/status/food-tg-lokal-kjoere-commit-guide-2026-06-14.md
  - scripts/verify-data-integrity.ts
  - scripts/enrich-offentligdata.ts
  - scripts/backfill-board-member-provenance.ts
  - scripts/prune-unverified-board-members.ts
  - scripts/correct-board-member-source-data.ts
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
---

# Closeout-playbook — siste mil

Den pushede pakken (`bccb924` + `0501c0a`) er på `main` og deployer. Det som gjenstår er lokalt (DB + registeruttrekk). Den eneste **harde blokkeren** for citable er at `db:audit:strict-sources` er rød med 9 brudd. Resten er sekvensiell rutine.

## 0. Hva de 9 bruddene faktisk er

`db:audit:strict-sources` (= `scripts/verify-data-integrity.ts --strict-sources`) flagger en `BoardMember`-rad når den **mangler kilde** (verken `sourceUrl` eller en oppløsbar `source`) **og/eller mangler `verifiedAt`**. Det er de gamle tre-import-radene (f.eks. `import-*-tree.ts`) som ble opprettet som `{companyId, personName, role, personKey}` uten provenans. Ikke noe pushen introduserte — de nye brreg-radene bærer full provenans.

**List opp de skyldige radene først** (så du vet hvilke selskaper/sektorer de ligger i):

```bash
npx tsx -e "import 'dotenv/config'; import { PrismaPg } from '@prisma/adapter-pg'; import { PrismaClient } from './src/generated/prisma/client'; \
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})}); \
p.boardMember.findMany({where:{OR:[{AND:[{source:null},{sourceUrl:null}]},{verifiedAt:null}]}, \
select:{id:true,personName:true,role:true,source:true,sourceUrl:true,verifiedAt:true,company:{select:{name:true,orgNr:true,country:true,valueChainStage:true}}}}) \
.then(r=>{console.log('brudd:',r.length); for(const m of r) console.log(' ',m.company.orgNr,m.company.name,'['+(m.company.valueChainStage||'?')+']','—',m.personName,m.role,'| src:',m.sourceUrl||m.source||'NULL','| verifiedAt:',m.verifiedAt||'NULL')}).finally(()=>p.\$disconnect())"
```

Sorter hver rad i én av tre bøtter ut fra outputen, og bruk riktig verktøy:

| Bøtte | Kjennetegn | Verktøy |
|---|---|---|
| **A. NO-selskap, gyldig orgnr, finnes i Brønnøysund** | norsk orgnr (9 siffer), aktivt | `enrich-offentligdata.ts --companies-only --orgnr=…` (gir ekte brreg-provenans: `source`+`sourceUrl`+`verifiedAt`) |
| **B. Overflødig seed-rad allerede erstattet av en brreg-verifisert rad** (samme person+rolle) | det finnes en verifisert søsken-rad | `prune-unverified-board-members.ts` (sletter kun superseder-te seeds) |
| **C. Ikke i brreg (utenlandsk / utgått / person ute av sittende styre), men selskapet har årsrapport-kilde** | DK/SE-orgnr, eller fratrådt person | `backfill-board-member-provenance.ts` (årsrapport-locator) — eller `correct-board-member-source-data.ts` hvis selve rosteret er feil |

## 1. Strict-source-opprydding (rekkefølge — dry-run alltid først)

Alle tre skriptene støtter `--dry-run`; uten flagg skriver de til DB.

```bash
# (a) Gi ekte brreg-provenans til de berørte selskapene (bøtte A).
#     Bruk orgnr-ene fra steg 0. enrich-offentligdata oppdaterer matchende
#     rader med source/sourceUrl/verifiedAt og oppretter manglende.
npx tsx scripts/enrich-offentligdata.ts --companies-only --dry-run --orgnr=<orgnr1,orgnr2,...>
npx tsx scripts/enrich-offentligdata.ts --companies-only --orgnr=<orgnr1,orgnr2,...>

# (b) Fjern overflødige, nå-supederte seed-rader (bøtte B).
npx tsx scripts/prune-unverified-board-members.ts --dry-run
npx tsx scripts/prune-unverified-board-members.ts

# (c) Backfill årsrapport-provenans for det som gjenstår (bøtte C).
npx tsx scripts/backfill-board-member-provenance.ts --dry-run
npx tsx scripts/backfill-board-member-provenance.ts

# (d) Kun hvis et selskaps roster er feil og ligger i correctionslista:
npx tsx scripts/correct-board-member-source-data.ts --dry-run
# (legg ev. selskapet til i `corrections` i skriptet først)

# (e) Verifiser grønt
npm run db:audit:strict-sources
```

**Mål:** 0 brudd, eller at de gjenværende er bevisst dokumenterte `internal_context`-unntak (jf. `CITABLE-KNOWLEDGE-BASE-STATUS.md`). Hvis et brudd ikke kan kildebelegges (ingen brreg, ingen årsrapport, ingen seed-supersedering) → enten fjern raden eller marker den eksplisitt som intern, ikke la den stå som blokkert ekstern evidens.

## 2. Vei 2 — styre-dekning (kjør før/sammen med steg 1)

Dekningsutvidelsen gir samtidig provenans til inputs/sjømat-radene, så den lukker bøtte A for de sektorene «gratis»:

```bash
npx tsx scripts/extend-board-coverage-brreg.ts --dry-run
npx tsx scripts/extend-board-coverage-brreg.ts        # eller --snapshot-in=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json
npx tsx scripts/dedupe-person-keys.ts --commit         # KRITISK: kanonisk personKey før AP-1 re-kjøres
npx tsx scripts/analyze-board-interlocks.ts --out=research/analyse/ap1-styreoverlapp.json
```

Oppdater så `src/lib/data/dybdeanalyse.ts` (`ins-ap1-001` → `coverageNote`) til de **faktiske** tallene fra det nye aggregatet (ikke projeksjonen 46,9 %).

## 3. Full operator-sekvens → citable-grønt

Etter steg 1+2, kjør hele gaten og bekreft at strict-source nå er grønn:

```bash
npm test && npm run lint && npm run db:audit && npm run db:audit:strict-sources \
  && npm run audit:citable-reports && npm run research:citation-readiness-queue \
  && npm run research:citable-acceptance-pack && npm run build
```

Hvis `build` regenererer `public/data/.../chart-metrics.json`, og DB-importen endret DB-avledede artefakter: kjør `npm run compute-metrics:full` og commit regenerert `public/data/coverage/profiles.json` + `data/konsern-coverage.json` separat (CLAUDE.md-regelen).

## 4. Vei 1 — eierandel-% (uavhengig spor)

```bash
# Bestill uttrekk: https://www.skatteetaten.no/en/deling/aksjonarregisteret/ (1-ukes lenke; AS/ASA)
npx tsx scripts/verify-ownership-aksjonaerregister.ts --file=<csv> --out=research/analyse/ap5-eierandel-verifikasjon-2026.json
# → oppdater CL-AP5-001 eierandel-status + PCQ-MAKT-001 fra resultatene
```

## 5. Arbeidstre-rydding (beslutninger)

- **`validate-against-brreg`-pakken er uncommittet:** `scripts/validate-against-brreg.ts` (501 l) + `tests/scripts/validate-against-brreg.test.ts` (175 l) + den ene `package.json`-linjen (`"validate:brreg"`). De tre hører sammen — commit som én enhet (`git add` alle tre) eller hold som eget spor. **Ikke commit `package.json`-linjen alene** uten skriptet (bryter `npm run validate:brreg`). Kjør `npm test` + `git diff --check` før ev. commit.
- **Untracked sidespor:** `MCP-CONNECTOR-ANALYSIS-2026-06-14.md` og `PILOT-BRREG-NORGESGRUPPEN-2026-06-14.md` — egne spor, riktig holdt utenfor maktkart-committen. Commit separat hvis de skal bevares i repoet.
- **Stale `.git/index.lock`:** hvis lokal git klager på lås uten at en git-prosess kjører, slett `.git/index.lock`.

## 6. Når er «helt i land»?

- [ ] Steg 1: `db:audit:strict-sources` grønn (0 brudd / kun dokumenterte unntak).
- [ ] Steg 2: AP-1 re-kjørt; faktisk dekning + surfacing oppdatert fra aggregatet.
- [ ] Steg 3: full operator-sekvens grønn; ev. metrics committet.
- [ ] Steg 4: eierandel-% verifisert; CL-AP5-001 + PCQ-MAKT-001 oppdatert.
- [ ] Commit/push av steg 2–4-endringene (kode/docs) til `justaride`.
- [ ] **Da** kan CL-AP1-001/CL-AP5-001 løftes til citable for strukturpåstanden. CL-MAKTKART-001 trenger i tillegg §8 steg 3–4 (markedscensus for ekte node-HHI, 2024-tilskudd mot Landbruksdirektoratet) — egne arbeidspakker, ikke en del av denne siste milen.
