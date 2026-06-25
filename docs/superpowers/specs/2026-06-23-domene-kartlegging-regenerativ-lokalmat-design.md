# Spec: Systematisk domene-kartlegging — regenerativt/permakultur/lokalmat/frøbevaring

> **Dato:** 2026-06-23
> **Status:** Design godkjent — klar for implementeringsplan
> **Forløper:** Importrunden 2026-06-19 (59 noder, PR #200) + handover `research/_status/HANDOVER-regenerativ-permakultur-lokalmat-import-2026-06-19.md`

## 1. Problem & mål

Feltet rundt regenerativt landbruk, permakultur, lokale verdikjeder og frøbevaring er stort — mange personer, selskaper, organisasjoner, nettverk og prosjekter som vi vil ha oversikt over. Dagens dekning er en enkeltstående kartleggingsrunde (59 noder). Vi trenger et **gjentakende, dekningsstyrt rammeverk** som lar oss vokse bredden systematisk uten å bryte kildedisiplinen.

**Primær bruk (valgt):** (1) intern oversikt + research-styring, (2) offentlig atlas/katalog, (3) nettverks-/maktkart. **Ikke** primært dypt whitepaper-grunnlag — bredde-først.

**Geografi:** Norge uttømmende; Norden som kontekst (tas med der det kobler til norske aktører).

**Oppdagelsesmotor:** hybrid — registre/lister som strukturert ryggrad + research-agenter for det uformelle praktikerlaget.

**Kildeterskel per node:** lett stub + statusflagg. Hver node: navn, type, domene, minst én lokator, eksplisitt `verificationStatus`. `disputed`/`unverified` vises tydelig merket og er aldri whitepaper-eksponert.

## 2. Ikke-mål (YAGNI)

- Ingen full atlas-UI (kart/nettverksgraf) i denne spec-en — egen senere spec hvis ønsket.
- Ingen internasjonal bredde utover nordiske koblinger.
- Ingen ny Prisma-modell — alt via eksisterende modeller + `themeTags`/`metadata`.
- Ikke alle underdomener i denne spec-en — kun rammeverk + én bevis-runde.

## 3. Dekomponering

Spec-en leverer **rammeverket** og **én komplett bevis-runde** ende-til-ende, før skalering til alle celler.

**Leveres:**
1. Domene-taksonomi + dekningsbok (artefakt + generert profil-JSON).
2. Generalisert import: `scripts/import-domain-actors.ts` (parameterisert, idempotent).
3. Dekningsaudit: `scripts/audit-domain-coverage.ts`.
4. Én komplett runde for første bevis-celle.

**Første bevis-runde:** underdomene under `lokale-verdikjeder` (NO) — klarest registre (REKO-ringer, Bondens marked-lokallag, andelslandbruk.no-kart, HANEN) *og* et uformelt lag (gårdsutsalg, market gardens), så begge halvdeler av hybriden testes. Permakultur/frøbevaring (KVANN/NPF) er definert nr. 2.

## 4. Taksonomi & dekningsbok

### 4.1 Taksonomi
Gjenbruker de 4 eksisterende domenene som rygg, hvert delt i et fåtall underdomener. Akser per celle: **underdomene × aktørtype × geografi**.

- **Domener:** `lokale-verdikjeder`, `regenerativ-praksis`, `permakultur-fleraarige`, `institusjon-finansiering`.
- **Aktørtyper:** `organisasjon | person | nettverk | gaard | institusjon | prosjekt | ordning | selskap`.
- **Geografi:** `NO` (primær); `SE/DK/FI/IS/Nordic` (kontekst).

Underdomene-listen fastsettes i implementeringsplanen per domene (f.eks. `lokale-verdikjeder` → `reko`, `bondens-marked`, `andelslandbruk`, `gaardsutsalg`, `markedshager`). Dette er den eneste «åpne» listen og defineres eksplisitt ved planstart.

### 4.2 Dekningsbok
- **Committet artefakt:** `research/_status/domene-dekningsbok.csv` — kolonner: `domain, subdomain, geo, estimated_universe, universe_source, universe_confidence, mapped_count, gap, last_updated`.
- **Generert profil:** `public/data/coverage/domene-profiles.json` (skrevet av dekningsaudit).
- **`estimated_universe`:** grovt, kildebelagt tall der mulig (f.eks. «~93 andelslandbruk 2023», «~140 REKO-ringer feb. 2022»), ellers merket estimat med `universe_confidence=lav`.
- **`mapped_count`:** beregnes av dekningsaudit fra DB (ikke håndvedlikeholdt).

### 4.3 Dekningsaudit — `scripts/audit-domain-coverage.ts`
Søsken til `scripts/audit-konsern-coverage.ts`.
- Teller kartlagte noder per celle fra DB via `themeTags` (`domene:*`/`subdomene:*`) + `metadata.domain/subdomain/geo`.
- Sammenligner mot `estimated_universe` fra dekningsboka.
- Skriver `public/data/coverage/domene-profiles.json` + en markdown hull-rapport (`research/_status/domene-dekning-hull-<dato>.md`) som lister tynne celler sortert etter hull. Dette er research-styrings-utdataet.
- Kjøres DB-fritt der mulig; hvis DB-avhengig, dokumenteres som `compute-metrics:full`-klasse (committes separat, ikke i build).

## 5. Datamodell-tilpasning (ingen schema-endring)

- **Gjenbruk:** `Actor` (org/nettverk/gård/institusjon/prosjekt/ordning), `PersonProfile` (personer), `Company` (kommersielle aktører m/ org.nr der relevant), `ActorRelationship` (nettverk), `ActorDocumentRef` (kunnskapsnotat-kobling).
- **Domene-markør per node:**
  - `themeTags`: `['domene:<domain>', 'subdomene:<subdomain>', '<dataset-tag>']`.
  - `metadata`: `{ dataset, domain, subdomain, geo, sourceClass, verificationStatus, confidence, locatorUrl, accessedAt, orgNr?, keyPeople?, scaleMetricYear? }` — mønsteret fra de 59 nodene.
- **Tiered status:** `verificationStatus ∈ {unverified, machine_verified, disputed, human_verified}`. Stub-default `unverified`/`machine_verified`; `disputed` merkes eksplisitt.
- **Dedup-førstelinje (obligatorisk før import):** match mot eksisterende `Actor.slug`, `Actor.name`, `Company.orgNr`, `PersonProfile.personKey`. Treff → **additiv berikelse** (themeTags-union + dok-ref), aldri dupliser eller klobb kuraterte felter. (Som de 6 maktkart-aktørene i forrige runde.)

## 6. Hybrid ingestion-pipeline (runde-mekanikk)

Hver runde drives av én hull-celle fra dekningsboka:

1. **Registreringspass** — hent strukturerte lister for cellen → kandidat-CSV (15-kolonners skjema fra forrige runde: `node_id, name, node_type, domain, country, description, key_people, scale_metric_year, org_nr, locator_url, sourceClass, verificationStatus, confidence, accessedAt, notes`). Per kilde en liten henter/parser. Brreg gjenbruker eksisterende brreg-verktøy (NACE-koder); web-lister (REKO, andelslandbruk.no-kart, NPF-lokallag) hent+parse.
2. **Agent-fanout** — én research-agent per celle som finner det registrene *ikke* fanger (uformelle praktikere/nettverk), med streng «ikke gjett»-instruks → kandidatrader m/ `sourceClass`/`verificationStatus`. Agent skriver til samme kandidat-CSV-skjema.
3. **Dedup + review** — slå sammen kandidater, dedup mot DB, marker `nye` vs. `berik-eksisterende` → review-CSV. Samme `preview → review → import`-mønster som `import-food-research-process-intake.ts` (menneske-review-steg før import).
4. **Import** — `scripts/import-domain-actors.ts`: generalisert, idempotent. Upsert `Actor`/`PersonProfile`; `ActorContact` for `key_people`; `ActorRelationship` for definerte koblinger; `ActorDocumentRef` til rundens kunnskapsnotat. Parameterisert på CSV-sti + `dataset`-tag (CLI-arg eller config-objekt).
5. **Reconcile** — `audit-domain-coverage.ts` oppdaterer dekningsboka + profiler; runden logges i mottakslogg (som R4/R5-rundene).

### 6.1 Generalisert importer — kontrakt
- Input: kandidat/review-CSV + `dataset`-tag + domene/geo-default.
- `node_type=person` → `PersonProfile` (`canonicalPersonKey`); ellers `Actor` (slug = `node_id`).
- Idempotent: upsert på `Actor.id`/`PersonProfile.personKey`; kontakter, dok-refs og relasjoner scoped-slettet+gjenopprettet per dataset.
- Relasjons-`source` peker til kunnskapsnotatet som `document:<slug>` (direkte lokator, klarerer source-audit).
- npm-alias `db:import:domene-<celle>` + innlemmet i `db:prod-sync`.

## 7. Offentlig flate + kildedisiplin i skala

- **Offentlig flate (lean):** utvid `/aktorer` med et **domene-objektiv** — filter på `domene:`-tag + `verificationStatus`-badge («ubekreftet»/«omstridt»). Nettverk vises allerede på aktør-detaljsiden. Egen `/bevegelsen`-side (kart/graf) = senere spec, ikke nå.
- **Gates beskytter automatisk:**
  - `disputed`/`unverified` rendres med merke og **ekskluderes fra `audit:citable`/`gate:overclaim`** (dataset-tagget ikke-citable by default). Bredde kan vokse fritt uten å lekke uverifiserte påstander til whitepaper-laget.
  - `audit:research-artifacts` fanger fortsatt rå binær / filer ≥50 MB.

## 8. Kadens & eierskap

- **Kadens:** gjentakende runder, én hull-celle av gangen, prioritert av dekningsboka. Hver runde selvstendig (egen kandidat-CSV + mottakslogg + dekningsdelta) — samme rytme som R4/R5.
- **Eierskap:** rammeverket + første runde kan kjøres ende-til-ende av en agent med fulle tillatelser (handover-mønsteret fra forrige runde). Dekningsboka gjør det selv-dokumenterende hvor neste agent setter inn.

## 9. Success criteria (verifisering)

- [ ] Domene-taksonomi + `domene-dekningsbok.csv` opprettet med universe-anslag for første domene.
- [ ] `audit-domain-coverage.ts` kjører rent, produserer `domene-profiles.json` + hull-rapport.
- [ ] `import-domain-actors.ts` idempotent (kjørbar 2×, ingen duplikater); første bevis-celle importert med dedup mot eksisterende noder.
- [ ] Første rundes noder synlige under domene-objektivet i `/aktorer` med korrekte status-badges.
- [ ] `disputed`/`unverified` bekreftet ekskludert fra `audit:citable`/`gate:overclaim`.
- [ ] `db:audit`, `db:audit:strict-sources`, `audit:research-artifacts --base=origin/main`, `tsc --noEmit`, `eslint` rene.
- [ ] Runden committet på egen branch; PR åpnet mot `main`; ingen rå binær i diff. Deploy via Coolify/`justaride`.

## 10. Risikoer & forbehold

1. **Univers-anslag er grove** — `estimated_universe` er ofte utdatert/sekundært (jf. REKO-tallene). Merk `universe_confidence` ærlig; hull-rapporten er retningsgivende, ikke fasit.
2. **Register-skraping** — ToS/stabilitet varierer; foretrekk offisielle API-er (Brreg) og arkivér ustabile web-lister (Wayback) ved behov.
3. **Agent-støy** — agent-fanout kan produsere usikre/feilaktige noder; «ikke gjett»-instruks + review-steg + `unverified`-default demper. Aldri agent-funn rett til `machine_verified`.
4. **Dedup-disiplin** — eksisterende kuraterte maktkart-aktører må berikes additivt, aldri klobbes (samme felle som de 6 i forrige runde).
5. **Norden-avgrensning** — ta kun med nordiske noder som faktisk kobler til norske aktører, ellers vokser universet ukontrollert.

## 11. Forløper-kontekst (carry-over fra forrige runde)

- SUM ≠ NMBU (UiO). «Maad seeds» finnes ikke (= KVANN). REKO Danmark = negativt funn (ikke aktiv node). Multistrata Agroforestry = `disputed` til KVANN bekrefter EU-prosjekt-ID. REKO Sverige = 2021-tall siste primær (HS sluttet å telle h.2021).
