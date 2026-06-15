---
tittel: Food TG — statusoppdatering etter Strøm A-lukking (2026-06-15 kveld)
status: Statusnotat — oppdatert etter lokal DB/operator-kjøring på claude/strom-a-strict-sources
eier: Gabriel
dato: 2026-06-15
formål: Fange faktisk nåtilstand etter at Strøm A ble kjørt lokalt: strict-sources er lukket, CL-MAKTKART-001 er løftet til citable_with_note på branch, og arbeidet ligger bak draft PR/review-gate før merge/deploy.
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

Strøm A er nå kjørt ferdig lokalt på `claude/strom-a-strict-sources` og ligger i draft PR #192 (`Close Food TG Stream A citable gate`). Den tidligere kritiske blokkeren — `db:audit:strict-sources` rød / operator-sekvens ikke kjørt mot lokal DB — er lukket på branchen.

Det samlede maktkartet er derfor løftet fra `klar-med-forbehold` til **`citable_with_note`** i syntese, whitepaper, PCQ og acceptance-pakke. Det er fortsatt ikke merget/deployet fra denne branchen; review, merge og deploy-verifikasjon gjenstår før dette kan regnes som live produksjonsstatus.

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
| 1 | Review/merge | Review draft PR #192, merge til `main` når godkjent | Gjenstår |
| 2 | Deploy-verifikasjon | Bekreft Coolify deploy og `/api/version` = ny SHA etter merge | Gjenstår |
| 3 | B4 | Verifiser at `/graf`, `/styremedlemmer`, `/personer`, `/eierskap`, `/selskap` reflekterer nye rader; `graph:audit` grønn | Etter merge/deploy |
| 4 | D3/D4 | Triage `validate:brreg`-avvik; vurder orgnr-korreksjon for NTS / SalmoNor / Hallvard Lerøy før neste import | Gjenstår |
| 5 | Strøm E | Needs-data-lenser: presise node-andeler, fôr->oppdrett-PPI, restråstoffvolum, per-aktør volum↔margin | Lavere prioritet |

## 6. Ekstern bruk nå

På branchen er CL-MAKTKART-001 `citable_with_note`, ikke `citable_external`. Ekstern tekst skal derfor fortsatt bære forbeholdene:

- «makt»/«kontroll»/«konsentrasjon» betyr strukturell posisjon i data, ikke intensjon, samordning eller ulovlighet
- ikke bland år, markedsbaser eller HHI-proxyer
- ikke framstill estimerte utfordrer-andeler som kildebelagte punktverdier
- ikke bruk AP-1-styrebroer alene som ekstern maktpåstand; den siterbare ruten er trianguleringen AP-1 + AP-5 + kryss-node-HHI
- BAMA-split og enkelte presise utfordrer-andeler er fortsatt presisjonsforbehold

## 7. Done-kriterium for endelig ferdig

Arbeidet er operatørgrønt på branch. Endelig ferdig-status krever fortsatt:

- [ ] PR #192 review'd og merget til `main`.
- [ ] Deploy ferdig og `/api/version` bekrefter ny SHA.
- [ ] Post-deploy sidetest / B4 utført.
- [ ] Brønnøysund-avvik triagert som enten dokumentert restavvik eller import-korreksjon.
