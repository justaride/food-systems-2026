---
tittel: Food TG — Lokal kjøre-/commit-guide for vei 1 + vei 2 (2026-06-14)
status: Operator-guide
eier: Gabriel
dato: 2026-06-14
formål: Lukke begge dybdeanalyse-veiene på din maskin (DB + Aksjonærregister er lokale). Alt av kode, tester, data og docs er allerede laget og verifisert i sandbox; dette er stegene som krever din lokale Postgres og et bestilt registeruttrekk.
relaterte_filer:
  - docs/project/analysis/food-tg-ap1-dekningsutvidelse-funn-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-bronnoysund-stikkprove-2026-06-14.md
  - scripts/extend-board-coverage-brreg.ts
  - scripts/verify-ownership-aksjonaerregister.ts
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
---

# Lokal kjøre-/commit-guide — vei 1 + vei 2

Hvorfor lokalt: DB-en kjører på `localhost:5432`, og Aksjonærregisteret er et bestilt uttrekk. Koden, testene, datasettene og funnnotatene er ferdige og grønne i repoets faktiske gater (`npm test` 504/504, `npm run lint`, `npm run build`, `git diff --check`). Stegene under er det som gjenstår på din maskin.

## Vei 2 — Lukk styre-dekningshullet (task #22)

```bash
# 1. Forhåndsvis hullet + planlagte skrivinger (ingen DB-skriving)
npx tsx scripts/extend-board-coverage-brreg.ts --dry-run

# 2. Apply — velg én:
#    (a) live mot Brønnøysund:
npx tsx scripts/extend-board-coverage-brreg.ts
#    (b) offline/reproduserbart fra snapshotet:
npx tsx scripts/extend-board-coverage-brreg.ts \
  --snapshot-in=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json

# 3. KRITISK: konsolider personKey (kanonisk) på tvers av historiske + nye rader
npx tsx scripts/dedupe-person-keys.ts --commit

# 4. Re-kjør AP-1 og skriv nytt aggregat
npx tsx scripts/analyze-board-interlocks.ts --out=research/analyse/ap1-styreoverlapp.json
```

**Forventet:** dekning 35,6 % (98/275) → ~47 % (≈129/275); nye sjømat-/fôr-broer inkl. Møgster-klyngen og inputs↔sjømat-broene (Vindheim, Bergjord). Steg 3 er ikke valgfritt — uten det risikerer `gustav-witzoee` (historisk) å ikke lenke mot `gustav-witzo` (kanonisk).

**Etter kjøring:** oppdater `src/lib/data/dybdeanalyse.ts` (`ins-ap1-001` → `coverageNote`) til de faktiske tallene fra det nye aggregatet. Ikke før (ikke surface projeksjon som realisert).

## Vei 1 — Eierandel-% primærsjekk (AP-5)

Brønnøysund-stikkprøven (form + styrekontroll) er allerede gjort. Det som gjenstår er aksjeandel-%:

```bash
# 1. Bestill uttrekk (e-postlenke gyldig 1 uke). Velg spesifikke orgnr eller alle.
#    https://www.skatteetaten.no/en/deling/aksjonarregisteret/
#    Målorgnr (AS/ASA) ligger i EXPECTED_OWNERS i scripts/verify-ownership-aksjonaerregister.ts:
#    819731322 914526647 914224314 929228723 975350940 929975200 960514718 964118191 910747711

# 2. Kjør verifikasjonen mot den nedlastede CSV-en
npx tsx scripts/verify-ownership-aksjonaerregister.ts \
  --file=<sti/til/aksjonaerregister.csv> \
  --out=research/analyse/ap5-eierandel-verifikasjon-2026.json
```

**Forventet:** `bekreftet`/`avvik` per selskap mot AP-5-forventningene (NorgesGruppen 74,4 % Johannson, Austevoll 52,7 % av Lerøy, Laco 52,7 % av Austevoll, Witzøe/Kverva ~41,3 % av SalMar, osv.). Samvirkene (Coop/TINE/Nortura/Felleskjøpet SA) flagges N/A — allerede bekreftet av SA-formen. Oppdater `CL-AP5-001` eierandel-status + `PCQ-MAKT-001` fra resultatene.

## Citable-port (operator-sekvens) — før noe brukes eksternt

DB-avhengig; kjør etter vei 2-importen. Fail-closed gate fra `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`:

```bash
npm test
npm run lint
npm run db:audit
npm run db:audit:strict-sources
npm run audit:citable-reports
npm run research:citation-readiness-queue
npm run research:citable-acceptance-pack
npm run build
```

De nye styre-radene bærer `source = Brønnøysundregistrene roller i virksomheten` + `sourceUrl` + `verifiedAt`, så selve dekningsutvidelsen skal ikke introdusere nye `BoardMember`-kildehull. Merk at dagens DB fortsatt kan ha eldre strict-source-hull; skill derfor mellom «nye rader er kildebelagt» og «hele strict-source-gaten er grønn».

## Commit / push

Deploy er Coolify på Hetzner via GitHub `justaride` — **aldri Vercel**.

```bash
# Verifiser før commit
git diff --check
npm test            # forvent grønt (sandbox kjørte 504/504 inkl. de nye testene)

# Foreslåtte commits (kode + data + docs er allerede i arbeidstreet):
git add src/lib/brreg-roles.ts scripts/extend-board-coverage-brreg.ts \
        scripts/verify-ownership-aksjonaerregister.ts tests/lib/brreg-roles.test.ts \
        tests/scripts/extend-board-coverage-brreg.test.ts \
        tests/scripts/verify-ownership-aksjonaerregister.test.ts
git commit -m "feat(ap1/ap5): board-coverage gap-closer + ownership-% + brreg primary-check tooling"

git add research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json \
        research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json \
        docs/project/analysis/ docs/project/mandates/primary-check-queue-food-tg-v0.1.md \
        docs/project/status/food-tg-lokal-kjoere-commit-guide-2026-06-14.md
git commit -m "docs(maktkart): AP-1 dekningsutvidelse + Brønnøysund stikkprøve + claim-status"

git push    # til justaride; Coolify deployer
```

**Build-merknad (CLAUDE.md):** `npm run build` kjører DB-fri metrics. Hvis vei 2-importen endrer DB-avledede artefakter, kjør `npm run compute-metrics:full` lokalt og commit regenerert `public/data/coverage/profiles.json` + `data/konsern-coverage.json` separat. De seks nye filene (lib/skript/tester) påvirker ikke metrics og kan pushes uavhengig.

## Rekkefølge-anbefaling

1. Vei 2 steg 1–4 (rask, gir umiddelbar dekningsgevinst + nye broer).
2. Operator-sekvensen (bekreft at strict-source fortsatt er grønn etter de nye radene).
3. Commit + push av kode/docs.
4. Vei 1: bestill registeruttrekk (1 ukes lenke), kjør eierandel-sjekken når CSV-en er nede, oppdater claim-status.
5. Etter begge: vurder om CL-MAKTKART-001 kan løftes fra `klar-med-forbehold` mot citable (gjenstår fortsatt §8 steg 3–4: markedscensus for HHI, 2024-tilskudd).
