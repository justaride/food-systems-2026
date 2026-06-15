---
tittel: Runbook — Strøm A lokal DB-lukking (vei 2 + strict-source + operator-sekvens + vei 1)
status: Operator-runbook — paste-and-run terminal-sjekkliste for din lokale maskin
eier: Gabriel
dato: 2026-06-15
forutsetning: Kjøres på din maskin med lokal Postgres (`localhost:5432`) + et bestilt Aksjonærregister-uttrekk. Sandboxen kan ikke nå prod-DB, så dette MÅ kjøres lokalt. All kode/tester/datasett er allerede på main.
relaterte_filer:
  - docs/project/status/food-tg-closeout-2026-06-14.md
  - docs/project/status/food-tg-lokal-kjoere-commit-guide-2026-06-14.md
  - docs/project/status/food-tg-master-handover-sluttrapport-2026-06-15.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
---

# Runbook — Strøm A (lokal DB-lukking)

**Mål:** lukke den ene harde citable-blokkeren — `db:audit:strict-sources` rød (9 brudd) — pluss styre-dekningsutvidelsen og eierandel-%, så CL-AP1-001/CL-AP5-001 kan løftes til citable for strukturpåstanden.

**Viktig oppdatering siden de gamle operator-docene:** §8 steg 3 (markeds-HHI) og steg 4 (2024-tilskudd) er **nå lukket** (kryss-node-HHI + AP-3 18,61 mrd, deployert på main 3c5a5f3). Det betyr at den **eneste gjenstående blokkeren** for å løfte CL-MAKTKART-001 mot citable er det denne runbooken dekker: **eierandel-% (vei 1) + operator-sekvensen grønn**. Se §6.

> **Sikkerhet:** Alle DB-skrivende skript støtter `--dry-run`. Kjør ALLTID dry-run først, les diff-en, kjør så uten flagg. Ta en DB-backup før skrivefasen (§0). Jobb gjerne på en branch.

---

## 0. Pre-flight (verifiser miljø + grønn baseline)

```bash
cd <repo>                                   # din lokale klone
git checkout main && git pull               # vær på 3c5a5f3 eller nyere
git checkout -b chore/strom-a-closeout      # jobb på branch, ikke main

# Prisma-klient generert
npm run db:generate

# Gjør DATABASE_URL tilgjengelig både for Node-sjekken og pg_dump
export DATABASE_URL="$(node -e 'require("dotenv").config({ quiet: true }); process.stdout.write(process.env.DATABASE_URL || "")')"
test -n "$DATABASE_URL"   # NB: quiet:true er nødvendig — dotenv v17 logger banneret til stdout og forurenser ellers verdien

# DB når? (skal printe "DB OK" og feile hardt hvis DATABASE_URL/DB er feil)
npx tsx -e 'import "dotenv/config"; import { PrismaPg } from "@prisma/adapter-pg"; import { PrismaClient } from "./src/generated/prisma/client"; const url = process.env.DATABASE_URL; if (!url) throw new Error("DATABASE_URL mangler"); const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }); try { await p.$queryRaw`SELECT 1`; console.log("DB OK"); } finally { await p.$disconnect(); }'

# DB-backup FØR noen skriving (rull tilbake hit ved behov)
pg_dump "$DATABASE_URL" > ~/foodsystems-backup-$(date +%Y%m%d-%H%M).sql

# Baseline-gater (forvent grønt)
npm test && npm run lint && npm run build
```

**Gate:** DB OK · backup tatt · tester grønne. Ikke gå videre hvis DB FAIL — da er `DATABASE_URL` feil eller Postgres nede.

---

## 1. Fase 1 — Vei 2: styre-dekningsutvidelse (kjør først)

Dette gir samtidig brreg-provenans til inputs/sjømat-radene, så det lukker en del av strict-source-bruddene «gratis».

```bash
# 1a. Forhåndsvis hullet + planlagte skrivinger (ingen DB-skriving)
npx tsx scripts/extend-board-coverage-brreg.ts --dry-run

# 1b. Apply — velg én:
npx tsx scripts/extend-board-coverage-brreg.ts                    # live mot Brønnøysund
#   ELLER offline/reproduserbart fra snapshotet:
npx tsx scripts/extend-board-coverage-brreg.ts \
  --snapshot-in=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json

# 1c. KRITISK: kanonisk personKey på tvers av historiske + nye rader
#     (uten dette risikerer f.eks. gustav-witzoee å ikke lenke mot gustav-witzo)
npx tsx scripts/dedupe-person-keys.ts --commit

# 1d. Re-kjør AP-1 og skriv nytt aggregat
npx tsx scripts/analyze-board-interlocks.ts --out=research/analyse/ap1-styreoverlapp.json
```

**Forventet:** dekning 35,6 % (98/275) → ~47 % (≈129/275); nye sjømat-/fôr-broer (Møgster-klyngen, inputs↔sjømat).

**Etter kjøring:** oppdater `src/lib/data/dybdeanalyse.ts` (`ins-ap1-001` → `coverageNote`) til de **faktiske** tallene fra det nye aggregatet — ikke før (ikke surface projeksjonen 46,9 % som realisert).

**Gate:** steg 1c kjørte med `--commit`; nytt `ap1-styreoverlapp.json` skrevet; surfacing oppdatert fra faktiske tall.

---

## 2. Fase 2 — Strict-source-opprydding (den harde blokkeren)

### 2a. List opp de skyldige radene først

```bash
npx tsx -e "import 'dotenv/config'; import { PrismaPg } from '@prisma/adapter-pg'; import { PrismaClient } from './src/generated/prisma/client'; \
const p=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})}); \
p.boardMember.findMany({where:{OR:[{AND:[{source:null},{sourceUrl:null}]},{verifiedAt:null}]}, \
select:{id:true,personName:true,role:true,source:true,sourceUrl:true,verifiedAt:true,company:{select:{name:true,orgNr:true,country:true,valueChainStage:true}}}}) \
.then(r=>{console.log('brudd:',r.length); for(const m of r) console.log(' ',m.company.orgNr,m.company.name,'['+(m.company.valueChainStage||'?')+']','—',m.personName,m.role,'| src:',m.sourceUrl||m.source||'NULL','| verifiedAt:',m.verifiedAt||'NULL')}).finally(()=>p.\$disconnect())"
```

### 2b. Sorter hver rad i én av tre bøtter, bruk riktig verktøy

| Bøtte | Kjennetegn | Verktøy |
|---|---|---|
| **A** NO-selskap, gyldig orgnr, i Brønnøysund | norsk orgnr (9 siffer), aktivt | `enrich-offentligdata.ts --companies-only --orgnr=…` |
| **B** Overflødig seed-rad allerede erstattet av brreg-verifisert rad | verifisert søsken-rad finnes (samme person+rolle) | `prune-unverified-board-members.ts` |
| **C** Ikke i brreg (utenlandsk/utgått), men selskapet har årsrapport-kilde | DK/SE-orgnr, eller fratrådt person | `backfill-board-member-provenance.ts` (eller `correct-board-member-source-data.ts` hvis rosteret er feil) |

### 2c. Kjør oppryddingen (dry-run alltid først)

```bash
# A. Ekte brreg-provenans til berørte selskaper (orgnr fra 2a)
npx tsx scripts/enrich-offentligdata.ts --companies-only --dry-run --orgnr=<orgnr1,orgnr2,...>
npx tsx scripts/enrich-offentligdata.ts --companies-only        --orgnr=<orgnr1,orgnr2,...>

# B. Fjern overflødige, nå-superseder-te seed-rader
npx tsx scripts/prune-unverified-board-members.ts --dry-run
npx tsx scripts/prune-unverified-board-members.ts

# C. Backfill årsrapport-provenans for resten
npx tsx scripts/backfill-board-member-provenance.ts --dry-run
npx tsx scripts/backfill-board-member-provenance.ts

# D. KUN hvis et selskaps roster er feil (legg selskapet til i `corrections` i skriptet først)
npx tsx scripts/correct-board-member-source-data.ts --dry-run

# E. Verifiser grønt
npm run db:audit:strict-sources
```

**Gate (hard):** `db:audit:strict-sources` = **0 brudd**, eller kun bevisst dokumenterte `internal_context`-unntak (jf. `CITABLE-KNOWLEDGE-BASE-STATUS.md`). Et brudd som ikke kan kildebelegges (ingen brreg, ingen årsrapport, ingen supersedering) → fjern raden eller marker den eksplisitt intern; ikke la den stå som blokkert ekstern evidens.

---

## 3. Fase 3 — Operator-sekvens → citable-grønt → commit/push

```bash
npm test && npm run lint && npm run db:audit && npm run db:audit:strict-sources \
  && npm run audit:citable-reports && npm run research:citation-readiness-queue \
  && npm run research:citable-acceptance-pack && npm run build
```

Hvis DB-importen endret DB-avledede artefakter og `build` regenererer `chart-metrics.json`: kjør `npm run compute-metrics:full` og **commit regenerert `public/data/coverage/profiles.json` + `data/konsern-coverage.json` separat** (CLAUDE.md-regelen — disse skal ikke endres for hånd).

```bash
git diff --check
git status --short
git add src/lib/data/dybdeanalyse.ts research/analyse/ap1-styreoverlapp.json
git status --short        # bekreft at KUN tiltenkte filer er staget før commit
git commit -m "feat(ap1): board-coverage extension applied + strict-sources green"
git push    # til justaride; Coolify deployer (ALDRI Vercel)
```

**Verifiser deploy** (bytter SHA når Coolify er ferdig):
```bash
curl -s https://food-systems.naturalstateproject.com/api/version | grep -o '"shortSha":"[^"]*"'
```

---

## 4. Fase 4 — Vei 1: eierandel-% (uavhengig spor, kan startes parallelt)

```bash
# 1. Bestill uttrekk (e-postlenke gyldig 1 uke; AS/ASA):
#    https://www.skatteetaten.no/en/deling/aksjonarregisteret/
#    Målorgnr ligger i EXPECTED_OWNERS i scripts/verify-ownership-aksjonaerregister.ts:
#    819731322 914526647 914224314 929228723 975350940 929975200 960514718 964118191 910747711

# 2. Kjør verifikasjonen mot nedlastet CSV
npx tsx scripts/verify-ownership-aksjonaerregister.ts \
  --file=<sti/til/aksjonaerregister.csv> \
  --out=research/analyse/ap5-eierandel-verifikasjon-2026.json
```

**Forventet:** `bekreftet`/`avvik` per selskap (NorgesGruppen 74,4 % Johannson, Austevoll 52,7 % av Lerøy, Witzøe/Kverva ~41,3 % av SalMar, …). Samvirkene (Coop/TINE/Nortura/Felleskjøpet SA) flagges N/A (SA-form). **Etter:** oppdater `CL-AP5-001` eierandel-status + `PCQ-MAKT-001` fra resultatene, commit/push.

---

## 5. Fase 5 — D4: brreg-validering + utgåtte sjømat-orgnr

```bash
npm run validate:brreg     # nå committet på main
```

Vurder om avviksrapporten avdekker selskaper som bør orgnr-korrigeres — særlig de 3 utgåtte sjømat-orgnrene (NTS / SalmoNor / Hallvard Lerøy, konsolidert under SalMar). Korriger i import-skriptene **før** neste `db:import`.

---

## 6. Done-kriterier + CL-MAKTKART-001-status

- [ ] §0 backup tatt; baseline grønn
- [ ] §1 AP-1 re-kjørt; faktisk dekning + surfacing oppdatert fra aggregatet
- [ ] §2 `db:audit:strict-sources` grønn (0 brudd / dokumenterte unntak)
- [ ] §3 full operator-sekvens grønn; ev. metrics committet; pushet + deployet
- [ ] §4 eierandel-% verifisert; CL-AP5-001 + PCQ-MAKT-001 oppdatert
- [ ] §5 `validate:brreg` kjørt; orgnr-korreksjoner vurdert

**Når §2–§4 er grønne:** CL-AP1-001 og CL-AP5-001 kan løftes til citable for strukturpåstanden. Og fordi §8 steg 3–4 allerede er lukket (denne sesjonens kryss-node-HHI + AP-3 2024), er da **alle** blokkere for CL-MAKTKART-001 borte — den kan løftes fra `klar-med-forbehold` mot citable. Det er det samlende uttaket whitepaper-kapittelet (`food-tg-maktkart-whitepaper-kapittel-2026-06-15.md`) er forberedt for.

---

## Feilsøking

- **`.git/index.lock` uten kjørende git-prosess:** `rm -f .git/index.lock`.
- **DB FAIL i §0:** sjekk `DATABASE_URL` i `.env` (lokal = `postgresql://foodsystems:foodsystems@localhost:5432/foodsystems`), at Postgres kjører, og at `npm run db:generate` er kjørt.
- **`dedupe-person-keys` hoppet over:** den er KRITISK før AP-1 re-kjøres (steg 1c) — uten `--commit` skriver den ikke. Symptom: historiske personKeys lenker ikke mot kanoniske → interlock-tall ser for lave ut.
- **Strict-source fortsatt rød etter §2:** kjør 2a på nytt og se hvilke rader som gjenstår; en rad uten noen mulig kilde skal fjernes eller eksplisitt merkes intern, ikke stå som blokkert ekstern evidens.
- **`build` regenererer chart-metrics med ny timestamp men identisk data:** `git checkout -- public/data/food-systems/*/chart-metrics.json` for å unngå støy-diff.

## Rollback

- **Kode/docs:** jobb på branch; `git restore .` eller forkast branchen.
- **DB-skriving:** gjenopprett fra §0-backupen: `psql "$DATABASE_URL" < ~/foodsystems-backup-<ts>.sql` (etter `DROP/CREATE` av schema, eller mot en ren DB). Dette er grunnen til at backup i §0 ikke er valgfri.

## Eskalering

Hvis operator-sekvensen ikke blir grønn etter §2, eller eierandel-avvikene er store (AP-5-forventningene bommer systematisk): stopp, ikke push, og ta det som eget spor — det kan bety at enten import-korpuset eller AP-5-forventningstallene må revideres før citable.
