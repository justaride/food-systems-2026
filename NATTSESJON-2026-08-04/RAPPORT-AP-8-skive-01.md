# AP-8 triage-rapport — skive 01

Dato: 2026-08-04  
Produksjon: `nattsesjon-2026-08-04`  
Manifestutvalg: `triage-manifest.jsonl` med `slice == 1`

## Status

Skive 01 inneholder 24 manifestenheter og 24 AP-8-poster. Alle postene er foreløpige (`provisional: true`) og produsert av `nattsesjon-2026-08-04`. Manifestets `identityKey`, `queueId` og `resolvedPath` matcher triagepostene i alle 24 tilfeller.

Lesestatus:

- 22 `read_fully`
- 1 `read_partially`: SOU 2024:8. Sammendrag, innholdsfortegnelse, metode-/oppdragsdel og relevante beredskaps-, import-, produksjons-, innkjøps- og overvåkingskapitler er lest; ikke hvert ord i den 364-siders rapporten.
- 1 `unreadable`: De Silva-kilden er lokalt bare en 55-ords locator; lenket akademisk fulltekst er ikke tilgjengelig i lesekatalogen.

Ingen post er hoppet over. Den delvis leste PDF-en er merket ærlig; locator-en er ikke behandlet som lest fulltekst.

## Kontrollsummer

- Manifestenheter: 24
- Triage-poster: 24
- JSONL: gyldig, ett komplett JSON-objekt per manifestrad
- Poster med alle obligatoriske AP-8-felt: 24
- `provisional == true`: 24
- `producedBy == "nattsesjon-2026-08-04"`: 24
- `slice == 1`: 24
- Manifestkobling (`identityKey`, `queueId`, `resolvedPath`): 24 av 24
- `machineRoleWasCorrect == false`: 16
- Foreslått rolle: 12 `internal_synthesis`, 8 `primary_evidence`, 3 `operational_control`, 1 `unknown`
- Eierverdict: 10 `prioriter`, 9 `standard`, 5 `ut_av_omfang`
- `qualityDimensions`: alle poster har nøyaktig `bredde`, `dybde`, `ferskhet`, `kausalitet`, og verdiene er bare `sterk`, `middels`, `svak` eller `ikke_relevant`

## DATAGAP-dekning

Forekomst av `datagapFields` i postene:

- `materialstrommer`: 17
- `aktordybde`: 16
- `beredskap_import`: 14
- `nordisk_dybde`: 13
- `makt_eierskap`: 10
- `kausalitet`: 10
- `lokale_verdikjeder`: 9
- `offentlig_innkjop`: 7
- `kvalitativt_lag`: 6
- `okologi_jordhelse`: 4
- `alternativt_protein`: 3

Berørte gaptyper er A: 21 poster, B: 17 poster og C: 11 poster. Dette er triageindikatorer, ikke en påstand om at gapene er lukket.

## Tre mest verdifulle funn for videre eierarbeid

1. `document:cmp8xyof600k7vvvmc5plwxk6` — SOU 2024:8 gir et omfattende svensk beredskapsanker for primærproduksjon, innsatsvarer, import, distribusjon, offentlige måltider, lagring og aktøransvar, men forslag og eldre tall må skilles fra gjeldende rett og nordisk nåstatus. Lesingen er derfor registrert som delvis.

2. `document:cmp8xypmg00msvvvm65crp6ti` — Stockholm Resilience-rapporten gir et metodisk tydelig nordisk baselineperspektiv på kosthold, import, miljøavtrykk og matsvinn, men hovedgrunnlaget er eldre og flere indikatorer har eksplisitte datagap.

3. `document:cmql0596700qu76vmlugtzzvs` — R5-A1 er et nyttig claim-lock for Norge–Brasil-handels- og fôrspor fordi den dokumenterer en avgrenset SSB-varekurv og samtidig lar Brasil-spesifikk Scope 3-allokering stå åpen.

## Duplikat- og overlappsmistanker

- `document:cmqfqrtxe00pd2hvmt8y1ker7` og `document:cmqfqru2l00q42hvmb6eqdnzm` gjelder overlappende Wiig/Green Horizon-status og innsynsbehov. De er beholdt som separate identiteter; ingen identitetsfletting er gjort.
- De to Transition Groups-møtekildene har tematisk overlapp, men er forskjellige møtedokumenter med ulik dato og ulik funksjon.
- `research/external-meld-st-25-2024-2025-sirkular.md` er behandlet som provenance-/coveragekontroll fordi snapshotens tittel og URL-uttrekk ikke gir et verifisert grunnlag for den oppgitte sirkulærøkonomiske tittelen.

## Begrensninger og avgrensning

Interne møter, arbeidslogger, claim-locks, source-shortlists og gate-/indeksnotater er ikke behandlet som primær sannhet. Selskapssider og journalistikk er merket med egenrapporterings- eller sekundærkildebegrensninger. Den generiske Helsedirektoratet-enheten og den manglende De Silva-fullteksten er satt ut av omfang for evidensbruk.

Det er ikke skrevet til `knowledge/corpus/`, register, køer eller `research/evidence-pack/`. Ingen identiteter er flettet, og ingen private stier, databaseopplysninger eller nøkkelmateriale er tatt inn i postene.
