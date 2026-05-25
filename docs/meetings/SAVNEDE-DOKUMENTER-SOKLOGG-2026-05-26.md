# Søkelogg: savnede dokumenter fra MØTEOVERSIKT

Date: 2026-05-26
Metoder: Repo-fritekst-grep, Notion-sync-gjennomgang, web-søk (WebSearch + WebFetch).

## Bakgrunn

7 dokumenter listet som "Mangler" i `MØTEOVERSIKT.md`. Etter første runde (PR #80) ble disse reklassifisert:
- 3 delvis dekket av nyere repo-materiale (NMBU, Kaffeprosjekt, UN Circular Cities)
- 1 uavklart (Helsinki summit)
- 3 fortsatt fullstendig savnet (FUD, E-Klei, CityLife)

Denne runden: aggressivt web-søk på de 3 savnede + Helsinki, for å se om noen er offentlig tilgjengelige.

## Funn per dokument

### 1. CityLife EU-prosjekt (Trondheim) — **kontekst funnet**

**Søkt:** "CityLife Horizon Europe Trondheim", "Circle City Life Trondheim Horizon", "Circular City Life Natural State 150 million Horizon September 2025"

**Funnet:**
- `Circle City Life` finnes som en session/track på Nordic Circular Summit (URL `nordiccircularsummit.com/eventsessions/circularcitylife` redirecter til `nordiccircularhotspot.org/summit` som returnerer 403)
- Det er **ikke** et navngitt Horizon Europe-prosjekt
- Trondheim er separat dekket via **NetZeroCities Pilot City-programmet** (Horizon Europe grants 101121530 og 101139652) med fokus på Carbon Capture i waste-to-energy
- "150 mill NOK Horizon-søknad" fra møte 1 refererer sannsynligvis til en planlagt fremtidig søknad mot CCRI (Circular Cities and Regions Initiative) eller HORIZON-MISS-2025-04-CIT-01

**Konklusjon:** "CityLife" er sannsynligvis NS-internt arbeidstittel for et planlagt søknads-/strategi-spor, ikke et eksisterende EU-prosjekt med det navnet. Originale strategi-dokumenter fra Einar/NS forblir savnet.

### 2. E-Klei møtereferat (feb 2025) — **ikke web-findbart**

**Søkt:** "Eklei OR E-Klei Natural State", "Eklipse EKLE Cathrine Barth", "Ekie Eki ekkelin circular city"

**Beskrivelse i repo:** "E-Klei (sirkulær by-aktør, internasjonalt) — arbeidsmøte februar 2025" (`TRANSITION GROUPS - Møte 13-04-26.md:56`)

**Funnet:** Ingen treff for noen av staveversjonene. Sannsynlig forklaringer:
- Stavefeil/mistranskribering fra møte-transkripsjon (siden mange møtereferater ble laget fra opptak)
- Internt kodenavn / forkortelse uten offentlig fotavtrykk
- Personnavn (E. Klei eller lignende)

**Konklusjon:** Trenger Cathrine å bekrefte korrekt stavemåte før videre søk er meningsfullt.

### 3. FUD-søknader (mat) — **internt NS, ikke web-tilgjengelig**

**Søkt:** Repo-fritekst-grep
**Repo-kontekst (`Speaker 1 (1).md:113`):**
> «Egentlig det som skjedde av var at den hadde jo den store søknaden der først, og den gikk ikke inn... Så tok vi inn FUD, vi la med tre andre transition group, og søkte om å bare få sette i gang bakgrunnsmaterialet for fire ulike grupper»

**Konklusjon:** Dette er Natural States interne søknadsdokumenter til Forskning og Utviklings-finansiering (Nordic Innovation FUD-instrument). Ikke offentlig tilgjengelig. Krever Cathrine/Einar.

### 4. Helsinki summit (bonus-undersøkt)

**Søkt:** Repo-fritekst
**Repo-kontekst (`docs/transcripts/transkripsjon-untitled.md`):**
> «Vi har 80 personer på workshop-lista som har med oss å starte dette initiativet i november i Helsinki»

**Funnet i repo:** `research/bibliotek/nordisk/nordic-food-innovation-summit-2024.md` — Nordic Food Innovation Summit 2024 i **Malmö** (ikke Helsinki). Annet event.

**Konklusjon:** "Helsinki summit-materiale" som Einar refererte til er sannsynligvis ennå-ikke-avholdt workshop i Helsinki november 2025 (eller november 2026), ikke en eldre dokumentert summit. Trenger avklaring.

## Anbefaling

| Dokument | Tiltak |
|---|---|
| FUD-søknader | Be Cathrine/Einar dele NS FUD-arkivet via shared drive eller direkte fil-deling |
| E-Klei møtereferat | Be Cathrine bekrefte korrekt stavemåte og organisasjon før videre søk |
| CityLife EU-prosjekt | Be Einar avklare: er det en planlagt 2026-2027 CCRI-søknad? Eksisterer det et internt strategimemo? Hvis ja, importer som plan-dokument |
| Helsinki summit | Be Einar avklare hvilket event (workshop nov 2025/2026 eller dokumentert summit) |

Disse 4 krever alle direkte input fra Einar/Cathrine. Web-søk + repo-undersøkelse har uttømt det jeg kan finne uten den input.
