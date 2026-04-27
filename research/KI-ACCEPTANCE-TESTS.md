# KI Acceptance Tests — Data Readiness Fase D

> Datert: 2026-04-27
> Status: utkast — 10 starter-tester basert på høy-prioritet-materiale i KI-PRIORITY.csv
> **Action:** Bruker bør validere/justere/legge til. Disse blir CI-tester når RAG-systemet implementeres.

## Bruk

Hver test definerer et spørsmål og forventet kildebruk. KI må svare på spørsmålet OG referere minst én av de forventede kildene (helst med eksakt sitering). Tester kjøres som:

```
KI svar = run_rag(test.question)
forall test.expectedSources: assert source in KI svar.citations
forall test.expectedKeywords: assert keyword in KI svar.text
```

Ved første kjøring: forventer at minst 8/10 passer — feil-kombinasjoner avslører enten dårlig retrieval eller manglende kilder. Skal kjøres som CI etter hver `db:import` for å fange regresjoner.

## Test 1: EMV-konsentrasjon i norsk dagligvare

**Spørsmål:** "Hva er hovedfunnene om konsentrasjonen i norsk dagligvare og leverandørenes posisjon i forhold til kjedene?"

**Forventede kilder (minst én):**
- `dagligvarerapport-2024` (Konkurransetilsynet, KI-priority 5.0)
- `jacobsen-jansson-2022` (NHH master, "Norway — the Black Sheep")
- `dlf-leverandor-2025` (DLF posisjoner)

**Forventede nøkkelord:** `konsentrasjon`, `EMV` eller `egne merkevarer`, `lavpris` eller `Kiwi/Rema/Extra`

**Notat:** Klassisk RAG-test som dekker konkurransetilsyn + akademia + bransje samtidig.

## Test 2: Restriktive eiendomsservitutter

**Spørsmål:** "Hvordan har servitutter på eiendom fungert som etableringshindringer i norsk dagligvare?"

**Forventede kilder:**
- `nguyen-hartmann-2024` (NHH master, award-winning, KI-priority 5.0)

**Forventede nøkkelord:** `servitutt`, `etableringshindring`, `2024-loven` eller `lovforbud`

**Notat:** Avgrenset spørsmål med én primærkilde — tester at KI finner riktig thesis selv om data er stort.

## Test 3: Matsvinn — Norges politikk

**Spørsmål:** "Hva er Matsvinnutvalgets hovedanbefalinger for å redusere matsvinn?"

**Forventede kilder:**
- `matsvinnutvalget-2024` (Norges offisielle utredning, KI-priority 5.0)

**Forventede nøkkelord:** `matsvinn`, `helhetlige tiltak`, `virkemidler`

**Notat:** Tester direkte sitering fra primærkilde med korrekt path-remap (matsvinnutvalget var 1 HIGH severity før Group A-fix).

## Test 4: Marginstudier

**Spørsmål:** "Hva sier marginstudiene fra Konkurransetilsynet om norske dagligvarekjeders prising på produktnivå?"

**Forventede kilder:**
- `marginstudie-2025-del2-offisiell` eller `marginstudie-2024-del1-offisiell`

**Forventede nøkkelord:** `produktnivå`, `marginer`, `kartlegging`

**Notat:** Sjekker at KI velger riktig versjon (del 1 vs del 2) basert på spørsmålets fokus.

## Test 5: Nordisk konkurranseregulering — Salling/Coop

**Spørsmål:** "Hvordan vurderte danske Konkurrencerådet Salling Groups oppkjøp av deler av Coop Danmark?"

**Forventede kilder:**
- `salling-coop-danmark-2025` eller tilsvarende `kfst`-rapport
- Optional: relevant akademisk thesis (`huynh-mortensen-2025`)

**Forventede nøkkelord:** `Salling Group`, `Coop Danmark`, `Konkurrencerådet`

**Notat:** Tester nordisk søk på tvers av land og at KI bruker Konkurrencerådets vurdering, ikke bare nyhetsoppslag.

## Test 6: EU-regulering — EUDR

**Spørsmål:** "Hvordan påvirker EUDR (EU Deforestation Regulation) norske dagligvarekjeder?"

**Forventede kilder:**
- `eudr-norsk-dagligvare`

**Forventede nøkkelord:** `EUDR`, `avskoging`, `due diligence`

**Notat:** Juridisk kategori (KI-priority 4.5+).

## Test 7: Reitan-systemets struktur (aktørspørring)

**Spørsmål:** "Hvordan er Reitan-systemet strukturert, hvilke selskaper inngår, og hvem er styreleder i hvert?"

**Forventede strukturerte data:**
- `Company` med navn `Reitan*` (Reitan, Reitangruppen, Rema 1000, Reitan Eiendom, etc.)
- `CompanyOwnership` for parent/child-relasjoner
- `BoardMember` med personKey for styreverv
- `PersonProfile` for biografisk kontekst

**Forventede nøkkelord:** `Reitan`, `Rema 1000`, `Reitan Eiendom`, navn på minst én styreleder

**Notat:** Tester aktør/relasjons-spørring (KI-bruksprofil #3, "gratis" — strukturert data finnes).

## Test 8: God handelsskikk og Dagligvaretilsynet

**Spørsmål:** "Hvilken rolle har Dagligvaretilsynet hatt, og hva er debatten om Konkurransetilsynet skal overta funksjonene?"

**Forventede kilder:**
- `dlf-leverandor-2025` (DLF posisjon, composite source)
- `samarbeidsklima-undersokelsen-2025` eller tilsvarende
- Regjeringen-høringer som supportingSources

**Forventede nøkkelord:** `Dagligvaretilsynet`, `god handelsskikk`, `Konkurransetilsynet`, `høring`

**Notat:** Composite source-test — KI må sitere korrekt fra DLF + supplerende offentlig høringsinformasjon.

## Test 9: Islands matsuverenitet (referert ekstern artikkel)

**Spørsmål:** "Hva er Islands utfordringer med matsikkerhet og hvilken rolle har Kornax-melmøllen?"

**Forventede kilder:**
- `beredskap-island-melmolle-2025` (external_article)
- Direkte sitering fra extracted MD: `research/evidence-pack/beredskap/beredskap-island-melmolle-2025.md`

**Forventede nøkkelord:** `Kornax`, `melmølle`, `Island`, `matsuverenitet`

**Notat:** Tester chunk-level provenance — KI må kunne sitere fra extracted MD (Fase C Group N output), ikke bare HTML.

## Test 10: Markedsundersøkelse §14 — status

**Spørsmål:** "Hva er status for Konkurransetilsynets markedsundersøkelser etter §14 om konkurranseloven?"

**Forventede kilder:**
- `markedsundersokelser-14-status` (KI-priority 5.0)

**Forventede nøkkelord:** `§14`, `markedsundersøkelse`, `konkurranseloven`

**Notat:** Tester at den nyeste tilgjengelige rapport (2026) blir brukt fremfor eldre versjoner.

## Hvordan kjøre testene

Når RAG-systemet er implementert, bør runner-skriptet:

1. Lese denne filen som JSON-strukturert (egen `.test.json`-fil senere)
2. For hver test:
   - Kjøre RAG-spørringen
   - Sjekke at minst én forventet kilde er referert
   - Sjekke at alle forventede nøkkelord finnes i svaret
3. Output: pass/fail per test + sammendrag (X/10 passer)
4. Fail hvis < 8/10 passer (terskel kan justeres)

Dette gir et målbart kvalitetsmål for "KI-klar"-status og fanger regresjoner i datasettet før det treffer prod.

## Validering av testdefinisjoner (uten RAG)

For å sjekke at testene minst er "well-formed":

- Hver `expectedSources`-ID må finnes i `Report.id` eller `Thesis.id` eller `Document.slug`
- Hver kilde må ha KI-PRIORITY ≥ 3.0 (ellers svakt grunnlag for sitering)
- Aktør-tester må referere til faktiske `Company.name` eller `Actor.slug` som finnes i DB

Et enkelt valideringsskript (TODO) kan kjøre disse sjekkene som pre-flight før RAG-runner.

## Bruker-justeringer

Disse 10 testene er starters basert på høy-prioritet-materiale. Brukeren bør:

- Legge til tester for spesifikke analytiske spørsmål de vil at KI skal håndtere
- Fjerne tester som dekker ikke-prioriterte temaer
- Justere expected-kilder hvis ønsket KI-svar skal foretrekke andre primærkilder
- Vurdere om tester bør være "soft" (KI velger fra flere likeverdige kilder) eller "hard" (én spesifikk kilde må refereres)
