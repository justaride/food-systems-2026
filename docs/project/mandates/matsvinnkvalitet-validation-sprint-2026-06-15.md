---
tittel: "Matsvinnkvalitet validation sprint — dag 0"
status: Aktivert internt — ingen aktørsvar registrert
eier: Gabriel
dato: 2026-06-15
scope: B/C adoption-kandidat innen Food TG 2A-minimumsvedtak
relaterte_filer:
  - docs/project/mandates/food-tg-scope-minimumsvedtak-2026-06-08.md
  - docs/project/mandates/food-tg-validation-sprint-log-2026-05.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
---

# Matsvinnkvalitet validation sprint — dag 0

## Formål

Avklare om matsvinnkvalitet i butikk, HORECA eller offentlig kjøkken kan modnes som adoption-/driftscase uten overclaiming. Sprinten skal teste om aktører kan dokumentere hvor ferskvarer taper redistribusjonsverdi, og hvilke rutiner eller data som kan flytte dem opp i kaskaden.

Dette er ikke pilotcommitment, effektclaim eller ekstern validering. Alle berørte claims beholder status `needs-actor-validation` til svar er logget med dato, kontaktrolle, bruksrett og kildegrunnlag.

## Claim-scope

| ID | Bruk i sprinten | Må ikke brukes som |
|---|---|---|
| `CL-B-022` | Hovedanker: matsvinnkvalitet kan bli rask adoption-pilot hvis baseline, kategori, tidsvindu, rutineendring og KPI-er kan valideres. | Effektbevis eller pilotklarhet. |
| `CL-C-012` | Governance-gate: forebygging, redistribusjon og restbehandling krever ulike virkemidler. | Ett generelt matsvinntiltak for alle strømmer. |
| `CL-C-014` | Adoption-mekanisme: praksis, rutiner og beslutningssituasjoner styrer om data blir handling. | Teknologi- eller app-effekt uten driftsendring. |
| `CL-C-015` | KPI-gate: hvert tall må ha definisjon, år, geografi, enhet, kilde, dataeier og frekvens. | Sammenlignbar KPI før dataeier/metode er bekreftet. |

## Første aktørrekke

| Prioritet | Aktørtype | Hvorfor | Minimumssvar |
|---:|---|---|---|
| 1 | Matvett | Norsk bransjeavtale, rapportering og kategoriforståelse. | Hvilke kategorier og målepunkter gir beslutningsrelevant kvalitetstap, ikke bare volum. |
| 2 | Too Good To Go | Tidsvindu, pris-/donasjonsrutiner og adopsjonsdata. | Hva flytter varer fra restfraksjon til salg/donasjon, og hvilke data kan deles. |
| 3 | Dagligvare/HORECA/offentlig kjøkken | Driftsvalidering av rutineendring og kontrafaktisk. | Kategori, tidsvindu, nåværende avsetning, ansvar, rutineendring og mulig KPI. |
| 4 | Dataeier/systemleverandør | Målebarhet og rapporteringsfrekvens. | Datafelt, definisjon, uttrekksmulighet, bruksrett og anonymiseringsbehov. |

## Spørsmålspakke

### 1. Baseline og kategori

- Hvilke ferskvarekategorier eller måltidstyper har størst kvalitetstap før redistribusjon eller høyverdig bruk?
- Hvilket år, hvilken geografi og hvilket målepunkt kan brukes som baseline?
- Skiller dere mellom matsvinn, overskuddsmat, donasjon, nedsalg, dyrefôr, biogass og restavfall?

### 2. Tidsvindu

- Når i løpet av dag/uke/holdbarhetsløp faller varen under terskel for salg, donasjon eller annen høyverdig bruk?
- Hvilke beslutninger tas for sent i dagens drift?
- Finnes det data på tidsstempel, temperatur, holdbarhetsdato, prisendring eller disponering?

### 3. Rutineendring

- Hvilken konkret rutine kan endres uten ny stor investering?
- Hvem eier beslutningen: butikk, kjøkken, grossist, kategoriansvarlig, leverandør eller plattform?
- Hvilke insentiver eller ansvarshindre stopper endringen i dag?

### 4. Kontrafaktisk og KPI

- Hva ville skjedd med varen uten tiltaket: nedsalg, donasjon, fôr, biogass, forbrenning eller avfall?
- Hvilken KPI er mulig å måle månedlig uten tung manuell rapportering?
- Kan data deles eksternt, internt, aggregert, anonymisert eller kun som bakgrunn?

## Loggformat for svar

| Felt | Krav |
|---|---|
| Kontakt | Navn, rolle, organisasjon, dato og kanal. |
| Bruksrett | Ekstern sitatbruk, intern bruk, kun bakgrunn eller ikke bruk. |
| Tall | Definisjon, år, geografi, enhet, kilde, dataeier og frekvens. |
| Svarstatus | Bekreftet, avkreftet, delvis bekreftet, kan ikke deles eller krever oppfølging. |
| Claim-effekt | Ingen statusløft, styrket hypotese, svekket hypotese, ny primary-check eller go/no-go. |

## Go/no-go etter første runde

| Utfall | Kriterium | Neste handling |
|---|---|---|
| Go til pilotdesign v0.1 | Minst én driftsaktør kan gi baseline, kategori, tidsvindu, rutineendring og kontrafaktisk med intern bruksrett. | Lag quality-window-kart og minimum pilotdesign. |
| Hold som intervjucase | Matvett/TGTG kan gi mekanisme og kategori, men ingen driftsaktør deler baseline. | Bruk som adoption-læring, ikke pilot. |
| Parkér | Ingen aktør kan dokumentere baseline eller kontrafaktisk. | Behold som hypotese og prioriter neste B-kandidat. |

## Dag-0 neste handling

1. Navngi første kontakt hos Matvett og Too Good To Go.
2. Velg én driftsaktør for praktisk validering.
3. Send kort forespørsel med spørsmålspakken over og eksplisitt bruksrettsspørsmål.
4. Før svar i `food-tg-validation-sprint-log-2026-05.md` før noen claimtekst oppdateres.
