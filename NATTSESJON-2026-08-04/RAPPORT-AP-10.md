# RAPPORT AP-10 — locatorjakt og ukjente roller

**Status:** DELVIS GJENNOMFØRT, med alle stoppbetingelser rapportert

**Utført:** 2026-08-04, etter AP-6

**Utførende:** Codex

**Arbeidsrekkefølge:** A1/A2 → A3 → B1/B2 → B3

## Worktree og avgrensning

AP-10 ble utført fra eget worktree:

- gren: `codex/nattsesjon-ap10-locator`
- worktree: `.worktrees/nattsesjon-ap10-locator`
- utgangspunkt: `733ad96` på `codex/nordic-knowledge-canonical-v1`

De tre AP-10-leveransene er skrevet til den eksplisitt angitte `NATTSESJON-2026-08-04/`-mappen:

- `NOTAT-LOCATORER.md`
- `NOTAT-UKJENTE-ROLLER.md`
- `RAPPORT-AP-10.md`

Det ble ikke commit-et kode eller kødata. Den midlertidige `package-lock.json`-differansen fra `npm install` ble gjenopprettet. AP-10-worktree-en skal bevares med de tre ukommitterte leveransefilene (`NOTAT-LOCATORER.md`, `NOTAT-UKJENTE-ROLLER.md` og `RAPPORT-AP-10.md`); aktuell status er derfor ikke ren, og filene skal ikke fjernes som del av denne økten.

## Del A — 29 manglende kilder

Alle 29 køposter ble gjennomgått:

- 11 `missing`: private capture finnes, men alle har `privateCaptureRightsState=pending_not_cleared`.
- 18 `no_locator`: ingen privat capture og ingen repo-bytes.

For de 11 ble det dokumentert hva kilden er, restaureringsverdi, offentlig locator der den kunne finnes, og hvilken rettighetsgate som må avklares. Det ble ikke åpnet, kopiert eller importert private captures.

For de 18 ble offentlige utgiver-, institusjons-, DOI-, URN- og rapportportaler undersøkt. Resultatet er flere sterke locators:

- Future Nordic Diets, KKV-etablering, KKV-lønnsomhet, Solutions Menu, Reitan årsrapport, OECD FLW, Greenpeace Feeding a Monster, Turku-artikkelen, Nested circularity, Regjeringens sirkulærøkonomiplan og flere NordPub-/myndighetsrapporter.
- ETMV 2024 er nå bundet til den offisielle Ruokavirasto-PDF-en
  *Elintarvikemarkkinavaltuutetun toimintakertomus 2024*; rights/restore er
  fortsatt en separat gate.
- Bornholm-oppgaven har et mulig ReadKong-speil og et separat offentlig
  Aalborg University/BOFA-affiliasjonsspor, men ingen autoritativ
  institusjonell locator for selve thesis-posten.
- `source_doc:src-78` har nå en offisiell Konkurrensverket-side og PDF-locator
  for rapport 2024:4, men den lokale alias-tittelen er ikke identisk med
  rapporttittelen og holdes derfor separat til metadatarevisjon/eierkvittering.

Identiteter som kan være samme publikasjon, blant annet Future Nordic Diets-radene, er markert som duplicate suspicion. Ingen identiteter er flettet.

Detaljert tabell finnes i [NOTAT-LOCATORER.md](NOTAT-LOCATORER.md).

## Del B — ukjente roller

Live køkontroll av `corpus-role-classification-queue.v1.jsonl` viste et avvik fra AP-10-briefen:

- briefens forventning: 123
- faktisk live antall: 124
- `no_unambiguous_role_rule`: 122
- `known_legacy_alias_identity_mismatch`: 2

Det ble kontrollert om filene faktisk finnes i AP-10-worktree-en:

- 48 lesbare filer
- 76 manglende stier/bytestreams

De 48 lesbare filene fikk innholdsbaserte, provisoriske forslag:

- interne søknader/notater: `internal_synthesis`
- lokale `research/report-*.md`-snapshots med remediation-header: `internal_synthesis`
- case-avsjekk/deep-research-filer med intern analyse-/claim-lock-kontekst: `internal_synthesis`
- kjøreordre, mottakslogg og eksplisitt karantene-placeholder: `operational_control`

De 76 manglende filene ble beholdt som `unknown`, lav konfidens. Tittel eller filsti ble ikke behandlet som tilstrekkelig bevis for innholdsrolle. De to alias-mismatch-filene under `research/evidence-pack/` ble heller ikke gjenopprettet eller omtolket.

Detaljert oversikt over alle 124 rader finnes i [NOTAT-UKJENTE-ROLLER.md](NOTAT-UKJENTE-ROLLER.md).

## Verifikasjon og sideeffekter

- `npm install` ble kjørt som lokal worktree-forberedelse.
- Den eneste package-lock-endringen ble gjenopprettet; `git diff --exit-code -- package-lock.json` er grønn.
- Ingen test-/processing-contract-kjøring ble nødvendig for AP-10 fordi ingen kildekode eller kontrakt ble endret.
- Det ble ikke kjørt DB-kommandoer, `--apply`, registeroppdatering, køoppdatering eller import.
- Ingen kilder ble lastet ned til repoet.
- Ingen merge, deploy eller branch-bytte ble utført.

## Oppdatert locator-kontroll 2026-08-04

En ny målrettet offentlig søkekontroll bandt ETMV 2024 til den offisielle
Ruokavirasto-PDF-en og fant både offisiell side og PDF-locator for
Konkurrensverket rapport 2024:4. En ytterligere målrettet kontroll mot
AAU-prosjekt-/forskningsflater, AAU-biblioteksøk og danske studentarkiv ga
ingen treff på Bornholm-oppgavens eksakte tittel eller forfatter. Bornholm-
sporet har i tillegg et offentlig Aalborg University/BOFA-affiliasjonstreff,
men selve thesis-recorden er fortsatt ikke funnet. `source_doc:src-78` har en
plausibel locator, men alias-tittelen er ikke identisk med rapporttittelen.
Ingen identitet er flettet.

## Gjenstående stopp og beslutninger

1. 11 private captures er ikke repository-klare før rettigheter og content-bound receipt er behandlet i kontrollert intern arbeidsflyt.
2. 18 locators er ikke alle like sikre; Bornholm mangler autoritativ record og `src-78` trenger eksplisitt metadata-/eierbinding. ETMV-locator er bundet, men rights/restore er åpen.
3. Den levende rollekøen har 124, ikke 123, ukjente rader. Dette må avstemmes av eier før noen massebekreftelse.
4. 76 rollekøfiler mangler i den kanoniske worktree-en. De kan ikke leses eller klassifiseres uten autoritativ bytes-tilgang.
5. Ingen av disse stoppene er omgått ved å endre kø, register, database eller evidence-pack.

## Leveransestatus

AP-10 er gjennomført som en kontrollert research- og triageleveranse. Locatorene, rettighetsportene, identitetsusikkerheten og den faktiske 124/48/76-fordelingen er dokumentert; resterende avgjørelser er eksplisitt lagt igjen til eier-/kildegate.
