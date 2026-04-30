# Datagap-tetteplan 2026-04-29

Status: operativt arbeidsgrunnlag etter gjennomgang av `datagap-rapport-2026-04-29.html`.

Formål: gjøre gaprapporten styrbar før ny innhenting. Planen skiller mellom korrigering av selve gapregisteret, intern datainnhenting, modellbygging, intake-promotering og ekstern validering.

## Arbeidsfiler

- Normalisert register: `research/_plans/gap-master-2026-04-29.csv`
- Datainnhentingsplan: `docs/project/DATAGAP-DATAINNHENTINGSPLAN-2026-04-29.md`
- Kilderapport: `datagap-rapport-2026-04-29.html`
- Bærekraftsrapport: `baerekraft-norsk-matsektor-2026.html`
- Eksisterende gapkilder:
  - `research/whitepaper/gap-list.md`
  - `research/intake/perplexity-2026-04-20/circularity-gaps.json`
  - `research/intake/food-research-process-2026-04-20/project-fit-p2-gap-worklist.csv`
  - `research/_plans/RESEARCH-MISSIONS.md`

## Verifisert før plan

Lokale checks kjørt:

- `npm run db:verify`: OK, alle hovedtabeller over baseline.
- `npm run db:audit`: OK, ingen referansebrudd i eierskap, relasjoner, properties, styremedlemmer, aktørrelasjoner eller personroller.
- Food Research Process-kontrollrapport viser fortsatt reelle intake-restanser: 25 hold-rader, 17 tittelproblemer og 8 promoteringsblokker.

Eksterne spot-checks fra primær-/nær-primærkilder:

- NORSUS/Matvett 2024 støtter 407 100 tonn matsvinn og 73,4 kg/innbygger, men husholdningstallene er sist målt i 2023.
- Lovdata viser matsvinnloven som kunngjort 20.06.2025, men ikke i kraft uten kongelig ikrafttredelse.
- Circle Economy støtter 2,4 prosent sirkularitet, mulig 45,8 prosent og 63 prosent karbonfotavtrykk-kutt.
- Konkurransetilsynets Dagligvarerapport 2024 støtter høy konsentrasjon og omtrent 95 prosent hos de tre store, men lokal appberegning har HHI 3445, ikke 3438.

## Normalisert status

Gaprapportens sammendrag må korrigeres før det brukes som styringsdokument.

Maskinell opptelling av HTML-en gir:

| Mål | Antall |
| --- | ---: |
| Eksplisitte gap-ID-er | 59 |
| Kritiske | 13 |
| Viktige | 36 |
| Strukturelle | 10 |
| Gap-card-poster uten B/G-tabeller | 43 |

Fordeling per område:

| Område | Antall |
| --- | ---: |
| A Bærekraftsdata | 9 |
| B Whitepaper/leveranse | 12 |
| C Sirkulær KPI/næringsstoff | 13 |
| D Tematisk intake | 4 |
| E Partner/stakeholder | 7 |
| F Sosial/folkehelse | 5 |
| G Systemisk/makro | 9 |

Viktig avvik fra rapporttekst:

- `circularity-gaps.json` har 25 poster, ikke 19.
- `gap-list.md` har 12 tydelige gap, ikke 14.
- `project-fit-p2-gap-worklist.csv` har 31 rader, ikke 32+.
- Nåværende norske butikkdata har 3 849 butikker og parent-HHI 3445. HHI 3438 er en eldre formulering.
- Nyere prosjektstatus viser 660 prisrader i `research/data/nordic/core-series/`, ikke 134 som total prisdekning.

## Styringsprinsipper

1. Ikke behandle rapportens tall som kanon før `gap-master` er godkjent.
2. Ikke bland `Utført internt` og `Validert eksternt`.
3. Ikke promoter Perplexity-/intake-materiale direkte til evidens uten kilde- og metadatareview.
4. Ikke starte DB-import før preflight viser hvilke rader som skal inn, hvor de skal inn, og hvilke som fortsatt er hold.
5. Ikke bruke "resolved" før gapet har en faktisk lukking: data importert, syntese skrevet, kilde koblet, eller ekstern bekreftelse logget.

## Arbeidslaner

### Lane 0 - Registerfrys og retting

Mål: gjøre gaprapporten konsistent før datainnhenting starter.

Oppgaver:

- Bruk `research/_plans/gap-master-2026-04-29.csv` som foreløpig styringsregister.
- Oppdater rapportens sammendrag fra 52/12/23/17 til 59/13/36/10, eller bestem at B- og D-tabellene skal holdes utenfor gap-totalen.
- Marker `datagap-rapport-2026-04-29.html` som "ikke-kanonisk før normalisert".
- Legg inn felt for `owner`, `due_date`, `artifact_path`, `resolved_evidence` når vi begynner utførelse.

Ferdig når: masterregisteret har én definisjon av total, prioritet og status.

### Lane 1 - Leveranseblokkering

Mål: lukke gap som blokkerer juni-leveransen.

Rader:

- B1: TG Charter.
- B2: Stakeholder Commitment Map.
- B3: Nordic Data Validation.
- E1-E3: leverandørstemme, Anders Nordstad, NMBU-akademiker.
- A1-A3: Scope 3, husholdningsmatsvinn-drivere, marint restråstoff.
- C1-C2/C5-C6: R0/R1 KPI, nutrient budget og oppdrettsnæringsstoffer.

Arbeidsmåte:

- Egen intern sprint for B1-B2 med Gabriel/Cathrine/Einar.
- Egen partnerpakke for B3, E5 og E6.
- Egen intervjupakke for E1-E4.
- Egen kildesprint for A1-A3, med kildelogg og tydelig metodeforbehold.
- Egen modellnotat-sprint for C5/C6, ikke DB-import først.

Ferdig når: hvert gap har et artefakt, en kildepakke og status `Utført internt` eller `Validert eksternt`.

### Lane 2 - Hurtige plukk

Mål: hente inn lav-friksjonsdata som styrker rapportene raskt.

Rader:

- A4: biogass anlegg/status/virkemidler.
- A6: plastemballasje.
- A7: Klimakur-framdrift.
- B10: municipal HHI.
- B11: omsetningsandeler 10-15 år.
- B12: PPP faktisk prisnivå.
- G3: selvforsyningsgrad justert for sjømateksport.

Arbeidsmåte:

- Start med lokale data og offentlige tabeller.
- Skriv ett kort evidence card per gap.
- Skill beregnede proxyer fra primærstatistikk.
- Legg resultater i `research/evidence-pack/` eller relevant `research/norden/`-mappe før app/UI.

Ferdig når: hvert gap har kilde, metode, tall og en anbefaling om videre bruk.

Status 2026-04-29:

- Opprettet første evidence cards for alle Lane 2-rader: A4, A6, A7, B10, B11, B12 og G3 i `research/evidence-pack/gap-cards/`.
- A4, A6, A7, B12 og G3 er markert `initial-card` i `research/_plans/gap-master-2026-04-29.csv`; B10 og B11 er oppgradert til dataartefaktstatus.
- B10 har en persistet butikkantall-proxy for kommune-HHI i `research/data/nordic/municipal-hhi/municipal-hhi-store-count-proxy-2026-04-29.csv`. Norge/Sverige/Danmark er teknisk robuste; Finland/Island må merkes som svakere på grunn av uassignerte butikkpunkt/geometriproblemer.
- B11 har en maskinlesbar 2020-2024-serie i `research/data/nordic/market-share/no-grocery-market-share-2020-2024.csv`. Full 10-15-årslukking mangler fortsatt 2017-2019/eldre sammenlignbare år.
- B12 har lokal 2015-2024 PPP-serie og SSB/Eurostat 2024-kontrollpunkt.
- G3 har NIBIO/Helsedirektoratet 2024-anker, men mangler valgt sjømateksport-scenario.
- A4, A6 og A7 har kildeanker, men må fortsatt få henholdsvis anleggstabell, matemballasjeavgrensning og tiltakstabell.

### Lane 3 - Intake-promotering

Mål: rydde eksisterende Food Research Process-restanser før vi henter mer.

Rader:

- G-01: side-stream valorization.
- G-02: nutrient loops.
- G-03: alternative feed.
- G-04: fermentation and scale.

Arbeidsmåte:

- Start med `research/intake/food-research-process-2026-04-20/CONTROL-REPORT.md`.
- Avklar de 25 hold-radene: behold hold, promoter, eller arkiver.
- Løs 17 tittelproblemer, særlig 4 manual-only.
- Kjør promotion preview på nytt før import.
- Promoter kun rader med ren target og metadata.

Ferdig når: kontrollrapporten ikke har uløste tittelblokker for rader vi faktisk vil bruke.

### Lane 4 - Sirkulær KPI og nutrient/MFA

Mål: gjøre sirkularitetsgapene analytisk brukbare, ikke bare beskrive at indikatorer mangler.

Rader:

- C1-C13.
- G1-G2.
- A9.

Arbeidsmåte:

- Del i to produkter:
  - KPI-register for R0-R9 og emballasje/sidestream.
  - Nordic Nutrient Budget/MFA-notat.
- Marker alle antakelser som proxy, estimate eller primary.
- Koble til eksisterende `circularity-loops.json` og value-chain data der det er forsvarlig.

Ferdig når: hvert KPI-/MFA-gap har et foreslått målepunkt, datakilde, metode og "kan brukes/kan ikke brukes ennå".

### Lane 5 - Sosial bærekraft og makro

Mål: få sosial bærekraft og bredere systemrisiko inn i kunnskapsbasen uten å overprioritere dem foran juni-blokkere.

Rader:

- F1-F5.
- G4-G9.

Arbeidsmåte:

- Første pass er kun kildejakt og claim-framing.
- Ingen store importløp før vi har bestemt hvilke av disse som faktisk skal inn i hovedleveransen.
- Sosial bærekraft bør få egen mini-matrix: data, kilde, relevans for Food TG, mulig policy-løft.

Ferdig når: hvert gap enten har kildegrunnlag eller er eksplisitt parkert til fase 2.

## Foreslått 4-ukers sekvens

### Uke 1 - Frys og raske fakta

- Ferdigstill Lane 0.
- Kjør Lane 2 for A4, A6, A7, B12 og G3.
- Start B1-B2 workshop-forberedelse.
- Start partnerpakke for B3/E5/E6.

### Uke 2 - Leveranseblokkere og intake

- Gjennomfør B1-B2 workshop.
- Lag første versjon av stakeholder commitment map.
- Start intervjupakker E1-E4.
- Rydd G-01 til G-04 intake-restanser til ny kontrollrapport.

### Uke 3 - Hovedmodeller

- Bygg A1 Scope 3-komparabilitetstabell.
- Lag A2 husholdningsmatsvinn-driverkort.
- Lag A3 marint restråstoff kilde- og verdikjedekart.
- Start C5/C6 nutrient budget-notat.

### Uke 4 - Konsolidering

- Oppdater gap-master med faktisk status.
- Flytt lukkede interne gap til `Utført internt`.
- Flytt partnerbekreftede gap til `Validert eksternt`.
- Lag en kort statusrapport: lukket, delvis lukket, fortsatt blokkert, fase 2.

## Umiddelbar neste arbeidsordre

Hvis vi skal begynne utførelse nå, start med denne rekkefølgen:

1. Patch `datagap-rapport-2026-04-29.html` eller lag en korrigert v2 med riktig telling og forbehold.
2. Utvid `gap-master-2026-04-29.csv` med owner/due/artifact-felt.
3. Kjør Lane 2 hurtig-plukk som første datainnhentingsrunde.
4. Kjør Lane 3 intake-promotering parallelt før mer ekstern kildejakt.
5. Start partner-/intervjupakker, men ikke marker dem validert før svar foreligger.
