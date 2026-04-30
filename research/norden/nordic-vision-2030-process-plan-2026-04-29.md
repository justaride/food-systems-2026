# Nordic Vision 2030 x Food Systems 2026: videre prosess

**Dato:** 2026-04-29  
**Status:** Operativ prosessplan  
**Eierflate:** `research/norden/`  
**Formål:** Gjøre Nordic Vision 2030 brukbar som policy- og dataramme for Food Systems 2026 uten å blande strategisk rammeverk, uvalidert notatstoff og siterbar evidens.

## Kort konklusjon

Prosjektet har allerede brukt Nordic Vision 2030 som strategisk ramme, og har mye relevant nordisk data og analyse. Det mangler likevel en ryddig kobling mellom:

1. offisielle Vision 2030-kilder
2. prosjektets nordiske datasett og analyser
3. siterbare kilder i `SourceDoc`/`Report`/`Document`
4. beslutningsspørsmål for Food TG og videre plattformarbeid

Denne prosessen skal lukke det gapet gjennom en liten, kontrollert kilde- og syntesesprint.

## Arbeidsregel

| Lag | Bruksstatus | Regel |
|---|---|---|
| Offisiell NMR-kilde | Siterbar når URL/fulltekst er kontrollert | Kan brukes i brief og rapporter |
| Lokal `SourceDoc`/`Report` med full `Document`-kobling | Siterbar etter kontroll mot primærkilde | Kan brukes i analyse og app |
| Lokal analyse/notat | Intern syntese | Må kildebindes før eksternt bruk |
| Perplexity/forskningsrunde/notatinput | Navigasjon | Ikke evidens uten primærkildesjekk |
| Strukturert CSV/API-uttrekk | Datagrunnlag | Kan brukes i figurer hvis metadata og sammenlignbarhet er dokumentert |

## Relevante eksisterende prosjektfiler

| Fil | Bruk i denne prosessen |
|---|---|
| `docs/project/NORDISK-MATSYSTEM-KILDESTATUS-2026-04-29.md` | Overordnet status på nordiske kilder, DB-dekning og source-only kø |
| `research/norden/notat-analyser-kildedata-audit-2026-04-29.md` | Datagap-audit for nordiske bærekraftsnotater |
| `research/norden/notat-analyser-source-import-queue-2026-04-29.csv` | Import-/promoteringskø for nordiske kilder |
| `research/norden/nordic-analysis-panel-first-findings.md` | Første funn fra harmonisert nordisk datapanel |
| `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv` | Maskinlesbar mapping av 45 Vision-indikatorer til Food Systems-dekning |
| `research/norden/nordic-vision-2030-organic-agriculture-integration-2026-04-29.md` | Runtime-integrasjon av Vision 1.4.2 / økologisk jordbruksareal |
| `research/norden/nordic-vision-2030-intra-nordic-import-integration-2026-04-29.md` | All-country runtime-integrasjon av Vision 2.5.2 / intra-nordisk matimport |
| `research/norden/nordic-vision-2030-intra-nordic-import-queue-2026-04-29.csv` | Partnerdata-kø for Vision 2.5.2 / import fra nordiske land |
| `research/data/nordic/trade-groups/normalized/is-intra-nordic-food-import-share-annual.csv` | Partial Island-panel for intra-nordisk matimportandel |
| `research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.csv` | All-country panel for intra-nordisk matimportandel |
| `research/data/nordic/trade-groups/normalized/partial-intra-nordic-food-import-share-annual.csv` | Legacy-kompatibilitetsnavn for samme all-country panel |
| `scripts/fetch-intra-nordic-food-imports.ts` | DK/FI/NO/SE partner-refetch og all-country panelgenerator |
| `research/data/nordic/analysis-panel/` | HICP matpris, handel og produksjon |
| `research/data/nordic/trade-groups/` | Importpanel for brede matvaregrupper |
| `research/norden/verdikjede/10-kryss-analyse.md` | Beste tverrgående analyse av makt, flaskehalser og systemrisiko |
| `src/lib/data/sources.ts` | Statisk SourceDoc-register, inkl. `src-92` |
| `research/stale-document-fix-log.csv` | Historisk audit som viste at `external-nmr-vision-2030` manglet `filePath`; `src-92` er nå reparert i DB |

## Kildestatus for Vision 2030-sporet

| Kilde | Lokal status | Vurdering | Neste handling |
|---|---|---|---|
| `Our Vision 2030` / `src-165` | Lokal kildefil, SourceDoc, Document og SourceRef er opprettet | Primær policykilde | Klar for bruk som toppnivå policyanker |
| `Action plan for Vision 2030` / `src-166` | Lokal kildefil, SourceDoc, Document og SourceRef er opprettet | Operasjonaliserer tre prioriteringer og 12 mål | Klar for indikator-/målmapping |
| `Nordic indicators for Our Vision 2030` / `src-167` | Lokal kildefil, SourceDoc, Document og SourceRef er opprettet | Relevant for gap mot offisielle indikatorer | Maskinlesbar indikator-map er opprettet; neste steg er kort beslutningsbrief |
| `Status Report 2023` / `src-168` | Lokal kildefil, SourceDoc, Document og SourceRef er opprettet | Viser at grønn dimensjon har forbedringsrom | Bruk som statuskontekst, ikke matsystemspesifikk fasit |
| `FJLS Co-operation Programme 2025-2030` / `src-169` | Lokal kildefil, SourceDoc, Document og SourceRef er opprettet | Mest direkte mat-, jordbruk-, fiskeri- og bioøkonomikilde | Klar for Food Systems-brief |
| `Nordic Bioeconomy Programme` / `src-92` | Lokal kildefil, statisk URL, DB Document.filePath og SourceRef er gjenopprettet | Relevant bioøkonomi- og sidestrømsramme | Klar for intern syntese; arkiver PDF ved ekstern tung sitering |
| `Policy tools for sustainable and healthy eating` | DB-linked `Report` + `SourceDoc` + lokal PDF-`Document` | Relevant for forbruk og matmiljø | Klar for intern bruk; bruk original PDF for sidetall ved ekstern sitering |
| `Breaking Barriers` / nordisk matsvinn | DB-linked `Report` + `SourceDoc` + lokal PDF-`Document` | Relevant for matsvinn/sirkularitet | Klar for intern bruk; bruk original PDF for sidetall ved ekstern sitering |
| `NORMO 2025` | DB-lenket `Report` til lokal note; Appendix 6 raw workbook og normalisert CSV er arkivert | Relevant som helse-/kostholdsdata | Første landvise `CountryMetric`-uttrekk er klart; utvid med aktivitet/sosial ulikhet hvis scope krever det |
| `NNR 2023` | Lokal note finnes; report-status bør ryddes | Normativt rammeverk for sunn/bærekraftig diett | Promoter/normaliser rapport og bakgrunnsartikler |
| Matsvinn per land | Runtime snapshot opprettet fra `CountryMetric` | Relevant for responsible consumption/production | Bruk 2020/2022 per-capita for alle land internt; hent DK/FI/IS ledddata før ekstern verdikjedeclaim |

## Sprintstruktur

### Gate 0: Avgrensning

**Mål:** Låse hva Vision 2030 skal brukes til i prosjektet.

Leveranser:

- denne planfilen
- `research/norden/nordic-vision-2030-alignment-matrix-2026-04-29.md`

Akseptkriterier:

- det er klart hvilke kilder som er siterbare nå
- `src-92` er eksplisitt klassifisert som reparert DB-kobling, med full PDF-arkiv som eget eksternt leveransegap
- ingen claims løftes fra notater uten primærkilde

### Gate 1: Kilderydding

**Mål:** Gjøre kjernematerialet siterbart.

Arbeid:

1. Fullført: `src-92` er reparert med offisiell URL, lokal kildefil, `Document.filePath` og `SourceRef`.
2. Fullført: `Our Vision 2030`, `Action plan`, `Indicators`, `Status Report 2023` og `FJLS 2025-2030` er opprettet som `src-165` til `src-169`.
3. Gjenstår bare full PDF-arkiv hvis kildene skal brukes tungt i ekstern leveranse.

Output:

- oppdatert source-kø eller ny `vision-2030-source-status`-fil
- konkret liste over DB-fikser som kan kjøres senere

### Gate 2: Koblingsmatrise

**Mål:** Vise hvordan Vision 2030 faktisk angår Food Systems 2026.

Arbeid:

1. Map tre hovedprioriteringer:
   - grønt Norden
   - konkurransedyktig Norden
   - sosialt bærekraftig Norden
2. Bryt dem ned i matnære tema:
   - sirkulær/bio-basert økonomi
   - matsvinn og sidestrømmer
   - kosthold og helse
   - matsikkerhet og beredskap
   - verdikjede- og markedskonsentrasjon
   - offentlig innkjøp og matmiljø
   - arbeidsliv og sosial bærekraft
3. Koble hvert tema til eksisterende prosjektdata og gjenstående hull.

Output:

- `research/norden/nordic-vision-2030-alignment-matrix-2026-04-29.md`

### Gate 3: Data-diff mot offisielle indikatorer

**Mål:** Skille hva prosjektet kan måle nå fra hva NMR måler i Vision 2030.

Arbeid:

1. Les NMRs indikatorliste.
2. Marker indikatorer som er direkte matrelevante, indirekte relevante eller utenfor scope.
3. Sammenlign mot eksisterende:
   - `research/data/nordic/analysis-panel/`
   - `research/data/nordic/trade-groups/`
   - `CountryMetric`
   - matsvinn-/kostholdsnotater
4. Lag gapliste.

Output:

- `research/norden/nordic-vision-2030-indicator-gap-2026-04-29.md`
- `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv`

### Gate 4: Beslutningsbrief

**Mål:** Lage et kort notat som kan brukes av prosjektet, ikke bare som arkiv.

Arbeid:

1. Skriv et beslutningsnotat med 5-7 funn.
2. Skill mellom:
   - etablert evidens
   - indikasjoner fra interne analyser
   - datagap
   - anbefalt neste kildeinnhenting
3. Vis hvor Norge skiller seg fra Norden.

Output:

- `research/norden/nordic-vision-2030-food-systems-brief-2026-04-29.md`

## Foreløpige beslutningsspørsmål

| Spørsmål | Hvorfor det er relevant |
|---|---|
| Hva betyr "sustainable circular and bio-based economy" konkret for mat i Norden? | Avgjør om vi prioriterer matsvinn, fôr, biogass, sidestrømmer eller kosthold først |
| Har prosjektet data som viser om Norden beveger seg mot grønn matsystemomstilling? | Binder Vision 2030 til målbare indikatorer, ikke bare språk |
| Hvor skiller Norge seg negativt eller positivt fra nordiske naboland? | Viktig for TG-anbefalinger og norsk policyrelevans |
| Hvilke NMR-kilder bør ligge i ekstern brief som siterbar policybase? | Hindrer at interne notater brukes som evidens |
| Hvor er nordisk merverdi reell, og hvor er det bare retorikk? | Skjerper prosjektets posisjonering mot NMR/Nordic Innovation/NCH |

## Første prioriterte arbeidskø

| Prioritet | Oppgave | Begrunnelse |
|---|---|---|
| P1 | Trekke ut maskinlesbar indikatorliste fra `src-167` | Utført i `research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv` |
| P1 | Lage første brief med `src-165` til `src-169` og `src-92` | Utført i `research/norden/nordic-vision-2030-food-systems-brief-2026-04-29.md` |
| P1 | Integrere økologisk landbruksareal som Vision 1.4.2-proxy | Utført som `CountryMetric.organicAgriculture` for DK/FI/NO/SE; Island holdes `needs_primary_check` |
| P1 | Bygge intra-nordisk matimportandel som Vision 2.5.2-proxy | Utført som all-country panel for DK/FI/IS/NO/SE og seedet til `CountryMetric.intraNordicImportShare` |
| P1 | Promotere `Policy tools for sustainable and healthy eating` | Utført/verifisert: `Report norden-policy-2024` og `SourceDoc src-food-d760f6d96053` peker på samme PDF-`Document` |
| P1 | Promotere nordisk matsvinnrapport/source-only | Utført/verifisert: `Report sirkularitet-matsvinn-2024` og `SourceDoc src-food-8047a53676d7` peker på samme PDF-`Document` |
| P1 | Lage indikator-diff mot NMRs 45 Vision-indikatorer | Viser hva vi faktisk kan måle |
| P1 | Koble NORMO 2025 til `CountryMetric` | Utført første uttrekk: 57 rader for DK/FI/IS/NO/SE + nordisk summary, med adult diet frequency og adult/child overweight-obesity |
| P1 | Lage matsvinn-dekningssnapshot per land | Utført i `research/norden/nordic-vision-2030-food-waste-coverage-2026-04-29.md` og `research/data/nordic/food-waste/normalized/nordic-food-waste-countrymetric-snapshot.csv`; viser intern brukbar per-capita-dekning og leddvise hull |
| P2 | Koble NNR 2023 og bakgrunnsartikler | Normativt grunnlag for kosthold |
| P2 | Bygge sidestrøm-/bioøkonomi source pack | Viktig hvis "circular bioeconomy" blir hovedspor |

## Bruk i plattformen

Ikke bygg ny UI før kildestatusen er ryddet. Når Gate 1-3 er ferdig kan dette bli:

- en seksjon på `/mandat` om nordisk policyforankring
- en egen `Nordisk Vision 2030`-modul i `/kilder`
- et datalag i `/sammenligning` eller nordisk landflate
- en TG-brief for hva prosjektet kan anbefale mot NMR/NCH/Nordic Innovation

## Ferdigdefinisjon

Denne prosessen er ferdig når:

1. `src-92` har lokal kildefil, primærkobling og oppdatert DB-kobling.
2. De 5-8 viktigste offisielle Vision/NMR-kildene er klassifisert.
3. Det finnes en koblingsmatrise fra Vision 2030 til Food Systems-data.
4. Det finnes en maskinlesbar indikator-map mot NMRs 45 Vision-indikatorer.
5. Det finnes en kort beslutningsbrief som bare bruker kontrollerte kilder for sterke claims.
6. Gjenstående hull er merket som `needs-primary-check`, `needs-data-extract` eller `archive/context-only`.
