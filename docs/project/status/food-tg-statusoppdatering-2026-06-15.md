---
tittel: Food TG — statusoppdatering etter Strøm A-lukking (2026-06-15 kveld)
status: Statusnotat — oppdatert etter lokal DB/operator-kjøring på claude/strom-a-strict-sources
eier: Gabriel
dato: 2026-06-15
formål: Fange faktisk nåtilstand etter at Strøm A ble kjørt lokalt: strict-sources er lukket, CL-MAKTKART-001 er løftet til citable_with_note, og PR #192 er merget (8bd2a1b) + deployet live. Gjenstår: B4-sideverifisering, Brønnøysund-triage og Strøm E.
plattform: https://food-systems.naturalstateproject.com
relaterte_filer:
  - docs/project/status/food-tg-ukesrapport-2026-06-15.md
  - docs/project/status/food-tg-master-handover-sluttrapport-2026-06-15.md
  - docs/project/plans/food-tg-finishlinje-plan-og-forskningsprompts-2026-06-15.md
  - docs/project/status/food-tg-strom-a-runbook-2026-06-15.md
  - docs/project/status/food-tg-cl-maktkart-citable-lift-prep-2026-06-15.md
  - research/BRREG-VALIDATION-AUDIT.md
---

# Statusoppdatering — 15. juni 2026 kveld

## 1. Kort sagt

Strøm A er kjørt ferdig lokalt, og PR #192 (`Close Food TG Stream A citable gate`) er nå **merget til `main` (`8bd2a1b`) og deployet til prod** (bygget 2026-06-15T19:59:17Z, verifisert via `/api/version` med cache-bust). Den tidligere kritiske blokkeren — `db:audit:strict-sources` rød / operator-sekvens ikke kjørt mot lokal DB — er lukket.

Det samlede maktkartet er dermed løftet fra `klar-med-forbehold` til **`citable_with_note`** i syntese, whitepaper, PCQ og acceptance-pakke — og er nå live på plattformen. Deploy-helse bekreftet: `/api/data-status` `ok/dbOk/pageGatesOk`, og GitHub Actions (Coolify SHA Sync + Schema migration guard) grønne. Gjenstår før endelig ferdig: B4-sideverifisering og Brønnøysund-triage (se §5).

Hovedfunnet er uendret: markedskonsentrasjonen i norsk matsystem topper oppstrøms i foredling — særlig i samvirke-nodene meieri/TINE og egg/kjøtt/Nortura — ikke først og fremst i dagligvareleddet.

## 2. Hva som ble lukket etter ukesrapporten

- **Eierandel-% (AP-5 / vei 1)** er verifisert mot offentlige primærkilder (selskapenes IR/årsrapporter), uten å vente på Skatteetatens Aksjonærregister. CL-AP5-001 står som `citable_with_note`. Restforbehold: BAMAs eksakte NG/Reitan-split og valgfritt register-kryss.
- **Strict-sources** er lukket på lokal DB: `db:audit:strict-sources` passerer med 0 brudd. De siste resolver-gapene ble håndtert i `src/lib/row-source-locators.ts`, og rader uten direkte primærlokator ble eksplisitt holdt som intern/blocked provenance.
- **Citation readiness-køen** er regenerert til P0=0, P1=0, P2=1, P3=0. Den ene P2-raden er `agrianalyse-bondens-andel-2025`, som fortsatt holdes utenfor ekstern evidensbruk.
- **Acceptance-pakken** er oppdatert med CA-016 for CL-MAKTKART-001. Resultat etter regenerering: 10/16 cite-ready, 6 blocked.
- **Brønnøysund-validering** er kjørt og dokumentert i `research/BRREG-VALIDATION-AUDIT.md`: 254 validert, 222 avvik, 35 hoppet over. Avvikene er triage, ikke autoskriving.

## 3. Hva som ligger i PR #192

Draft PR #192 (`claude/strom-a-strict-sources` -> `main`) inneholder:

- resolver- og testendringer for de siste strict-source-radene
- regenerert `research/citation-readiness-queue-2026-05-20.csv`
- regenerert citable acceptance-pack med CA-016
- statusløft i syntese, whitepaper, PCQ og figurtekst
- korrigerte runbook-/kommandoark-kommandoer for DB-sjekk og `pg_dump`
- Brønnøysund-auditrapport og maskinlesbare auditfiler

Commit på branchen: `ec81bfe chore(food-tg): close stream a citable gate`.

## 4. Verifikasjon kjørt på branchen

Følgende full operator-sekvens er kjørt med exit 0 etter løftet:

```bash
npm test
npm run lint
npm run db:audit
npm run db:audit:strict-sources
npm run audit:citable-reports
npm run research:citation-readiness-queue
npm run research:citable-acceptance-pack
npm run build
git diff --check
```

Nøkkelresultater:

- `npm test`: 519 tester passerte.
- `db:audit:strict-sources`: alle håndhevede source-gater passerte.
- `audit:citable-reports`: ingen issues.
- `research:citation-readiness-queue`: P0=0.
- `research:citable-acceptance-pack`: 10/16 cite-ready, 6 blocked.
- `build`: Next.js production build passerte.

## 5. Hva som gjenstår

| # | Spor | Hva | Status |
|---|---|---|---|
| 1 | Review/merge | PR #192 merget til `main` (`8bd2a1b`) | ✅ Utført |
| 2 | Deploy-verifikasjon | Prod `/api/version` = `8bd2a1b` (cache-bustet), bygget 19:59:17Z; `data-status` ok/dbOk/pageGatesOk; GH Actions grønne | ✅ Utført |
| 3 | B4 | Prod-sveip: `/graf`, `/styremedlemmer`, `/personer`, `/selskap` ✅ rendrer med data; **`/eierskap` feilet** → rotårsak + fiks i §5b; `graph:audit` gjenstår lokalt | 4/5 ✅; eierskap-fiks klar |
| 4 | D3/D4 | Brønnøysund-triage **utført** (se `docs/project/analysis/food-tg-brreg-triage-2026-06-15.md`): 222 avvik = navneform/rolletittel/vintage, **null maktkart-effekt**. personKey-normalisering **implementert + testet** i validatoren (432→42 mot ekte data); **21 import-skript migrert til delt `canonicalPersonKey`** (ESLint, Next build og 544/544 tester grønne; full `tsc --noEmit` har pre-eksisterende test-typing-funn). Rest: 6 orgnr-saker + lokal `db:import` + `dedupe-person-keys` for å re-nøkle eksisterende rader | Triagert; validator + import-align klart; DB-reimport gjenstår |
| 5 | Strøm E | Needs-data-lenser: presise node-andeler, fôr->oppdrett-PPI, restråstoffvolum, per-aktør volum↔margin | Lavere prioritet |

## 5b. B4-sveip + /eierskap-fiks (kveld 2026-06-15)

Visuell B4-sjekk på prod (`8bd2a1b`): `/styremedlemmer`, `/selskap`, `/personer`, `/graf` rendrer med data (graf: 1011 koblede noder, NorgesGruppen/Reitan/Coop/BAMA topper interlock-lista; styremedlem-uten-grafnode = 0; selskap-orgnr-duplikater = 0). **`/eierskap` feilet** med en Server Components render-feil (digest skjult i produksjon).

**Rotårsak (verifisert i repo):** `/eierskap` → `getKonsernIndex()`/`getKonsernDossier()` → `loadCoverage()` leser `data/konsern-coverage.json` via `readFileSync(process.cwd()+…)` ved kjøretid. Dockerfilen kopierer `public`, `content`, `research/…` m.m., men **aldri `data/`** → filen mangler i containeren → ENOENT → RSC-feil. `/eierskap` er den eneste runtime-leseren av `data/` og har ingen fallback-flate — derfor eneste side som faller. Pre-eksisterende pakkings-gap (både Dockerfile og `ownership.ts` uendret i deploy-vinduet), avdekket nå under B4.

**Fiks (lagt til i `Dockerfile`, build-verifisert lokalt):** `COPY data ./data` i builder-stage + `COPY --from=builder … /app/data ./data` i runner-stage. Lavrisiko (legger kun til to små JSON-filer, 24 KB). Review → commit → deploy → re-sjekk at `/eierskap` rendrer og `/api/version` = ny SHA.

## 6. Ekstern bruk nå

På branchen er CL-MAKTKART-001 `citable_with_note`, ikke `citable_external`. Ekstern tekst skal derfor fortsatt bære forbeholdene:

- «makt»/«kontroll»/«konsentrasjon» betyr strukturell posisjon i data, ikke intensjon, samordning eller ulovlighet
- ikke bland år, markedsbaser eller HHI-proxyer
- ikke framstill estimerte utfordrer-andeler som kildebelagte punktverdier
- ikke bruk AP-1-styrebroer alene som ekstern maktpåstand; den siterbare ruten er trianguleringen AP-1 + AP-5 + kryss-node-HHI
- BAMA-split og enkelte presise utfordrer-andeler er fortsatt presisjonsforbehold

## 7. Done-kriterium for endelig ferdig

Arbeidet er operatørgrønt på branch. Endelig ferdig-status krever fortsatt:

- [x] PR #192 review'd og merget til `main` (`8bd2a1b`).
- [x] Deploy ferdig og `/api/version` bekrefter ny SHA (`8bd2a1b`, 19:59:17Z; cache-bust nødvendig pga. edge-cache).
- [ ] Post-deploy sidetest / B4 utført.
- [x] Brønnøysund-avvik triagert (`food-tg-brreg-triage-2026-06-15.md`): kosmetisk navneform/rolletittel/vintage; 6 orgnr-saker + personKey-normalisering gjenstår som import-hygiene (ikke maktkart-blokker).
