---
tittel: JT uke 25 sendepakke
status: Klar til operatorbruk
eier: Gabriel
dato: 2026-06-15
scope: Sendeklar, intern operatorpakke for JT-beslutningsmote, DASK-0906-001/002 og responslogging i uke 25.
bruksregel: Ikke send eksternt. Dette er intern mote- og dokumentaskpakke. Faktatall fra operatorgater brukes ikke eksternt foer PR #159 er merget, deployet og operatorsekvensen er re-kjort.
relaterte_filer:
  - docs/project/status/jt-statusnotat-uke-25-2026-06-15.md
  - docs/project/status/jt-moteinvitasjon-uke-25-2026-06-15.md
  - docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md
  - docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/food-tg-minimumsvedtak-casekort-2026-06-09.md
---

# JT uke 25 sendepakke

## 1. Bruksregel

Denne pakken skal gjore uke 25-lopet sendeklart uten a late som at noe er sendt eller besluttet.

Den kan brukes til tre interne handlinger:

1. Booke JT-beslutningsmote.
2. Sende DASK-0906-001 og DASK-0906-002 internt etter godkjenning.
3. Logge svar slik at casekort, PCQ, source-shortlist og claim-lock kan oppdateres uten overclaiming.

Den skal ikke brukes til ekstern outreach. AASK-sporsmalene holdes tilbake til minimumsvedtak eller separat outreach-gate apner dem.

## 2. Operatorrekkefolge

| Steg | Handling | Eier | Ferdigkriterium | Stoppsignal |
|---|---|---|---|---|
| 1 | Send moteinvitasjon til JT. | Gabriel | Moteforesporsel sendt med agenda og vedlegg. | Ingen tilgjengelig uke 25-slot. Eskaler til skriftlig beslutning. |
| 2 | Legg ved beslutningsgrunnlag. | Gabriel | Statusnotat, beslutningssaker og slide-manus er vedlagt/lenket. | Ikke legg ved tall som krever ny operatorsekvens for ekstern bruk. |
| 3 | Be om fire motevedtak. | Gabriel/JT | Sak 1-4 har tydelig ja/endring/nei i motet eller skriftlig. | Motet blir orientering uten vedtak. |
| 4 | Hvis Sak 4 godkjennes: send DASK-0906-001/002 internt. | Gabriel | Begge interne dokumentasker sendt til relevante dokumenteiere. | Ikke send til eksterne aktorer. |
| 5 | Logg respons. | Gabriel | Responsrad fylt med dokument, rolle, bruksrett, status og neste gate. | Muntlig signal uten dokumenteier/bruksrett behandles bare som intern hypotese. |
| 6 | Oppdater kontrollfiler. | Gabriel/Codex | PCQ/source-shortlist/claim-lock/casekort oppdateres bare etter dokumentert respons. | Ikke loft claim uten locator og claim-lock. |

## 3. Copy-ready moteinvitasjon

**Emne:** Food TG beslutningsmote uke 25 - casekort, H1/H2 og Port E

```text
Hei,

Jeg foreslar at vi setter opp et Food TG beslutningsmote i uke 25.

Formael: laase de beslutningene som trengs for aa levere roadmap v0.1 og offentlig online event innen kontraktsfristen 31.07.2026.

Foreslatt agenda:
1. Kort status siden 26.05 og hva plattformloeftet har gjort mulig
2. Minimumsvedtak casekort
3. H1/H2-todeling av leveransen
4. Port E: eventdato, format og Thea-aktivering
5. DASK-0906-001/002 og neste 14 dager

Einar boer vaere med paa H1/H2 og Port E. Thea boer vaere med hvis vi skal ta event-go og kommunikasjonskapasitet i samme mote.

Forslag: onsdag-fredag uke 25.

Vedlegg/lenker:
- Statusnotat til JT uke 25
- Beslutningssaker JT uke 25
- Deck v0.1 slide-manus
```

## 4. Kort folgetekst til vedlegg

```text
Kort leseretning:

Dette er et beslutningsmote, ikke en ren orientering.

Vi ber om fire vedtak:
1. Minimumsvedtak for intern casekort- og researchsprint.
2. Bekreftelse av H1/H2-todelingen fram mot 31.07.
3. Port E-valg for offentlig online event.
4. Godkjenning til aa sende DASK-0906-001/002 internt naa.

Plattformstacken ligger separat i PR #159 og er teknisk groenn, men den krever egen Gabriel-review av G-06/G-10/G-11 foer merge/deploy.
```

## 5. DASK-0906-001: Brasil/kaffe MOU

**Sendes bare hvis Sak 4 er godkjent.**

**Mottakerforslag:** JT, Cathrine, Einar eller NCH/WCEF/Natural State-dokumenteier.

**Emne:** DASK-0906-001 - intern dokumentask Brasil/kaffe

```text
Hei,

Vi jobber med intern Food TG casekort- og researchsprint, og trenger aa avklare ett dokumentpunkt foer Brasil/kaffe brukes videre som relasjonscase.

Ask: DASK-0906-001 - Brasil/kaffe MOU

Kan du sjekke om det finnes avtale, MOU, motenotat, programside, presentasjon eller annen dokumentasjon som kobler Brasil til kaffe, WCEF/Nordic Night/NCH/Natural State eller Food TG?

Hvis noe finnes, trenger vi:
- dokument/URL/fil/presentasjon/motenotat
- dato og dokumenteier
- partsliste eller aktoerrolle
- scope: hva dokumentet faktisk dekker
- om kaffe, bacalhau eller foer er eksplisitt nevnt
- bruksrett: intern bruk, ekstern omtale, sitatbruk eller kun bakgrunn
- eventuelle forbehold eller ting vi ikke skal si

Hvis dokumentet ikke finnes eller ikke kan brukes, er det ogsaa et nyttig svar. Da parkerer eller nedgraderer vi caset i stedet for aa overclaime.
```

**Stoppsignal:** Ingen dokumenteier, ingen avtaletekst, uklar partsliste eller ingen bruksrett.

## 6. DASK-0906-002: Elfenbenskysten/kakao

**Sendes bare hvis Sak 4 er godkjent.**

**Mottakerforslag:** JT, Cathrine, Einar eller NCH/WCEF/Natural State-dokumenteier.

**Emne:** DASK-0906-002 - intern dokumentask Elfenbenskysten/kakao

```text
Hei,

Vi jobber med intern Food TG casekort- og researchsprint, og trenger aa avklare ett dokumentpunkt foer kakao-/Elfenbenskysten-sporet brukes videre som relasjonscase.

Ask: DASK-0906-002 - Elfenbenskysten/kakao

Kan du sjekke om det finnes avtale, relasjon, organisasjonsnavn, motenotat, programside, presentasjon eller annen dokumentasjon som kan baere kakao-/Elfenbenskysten-sporet?

Hvis noe finnes, trenger vi:
- dokument/URL/fil/presentasjon/motenotat
- organisasjonsnavn og motpart
- dato og dokumenteier
- tematisk scope: hva dokumentet faktisk dekker
- kontaktpunkt hvis relevant
- bruksrett: intern bruk, ekstern omtale, sitatbruk eller kun bakgrunn
- eventuelle forbehold eller ting vi ikke skal si

Hvis dokumentet ikke finnes eller ikke kan brukes, er det ogsaa et nyttig svar. Da parkerer eller nedgraderer vi caset i stedet for aa overclaime.
```

**Stoppsignal:** Ingen organisasjonsnavn, dato, scope eller dokument.

## 7. Responslogg

Fyll en rad per svar. Ikke oppdater claim-status uten dokumentert respons.

| Respons-ID | Ask-ID | Dato | Svar fra | Rolle | Dokument/kilde | Status | Bruksrett | Paavirker | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| RESP-0906-001 | DASK-0906-001 |  |  |  |  | Bekrefter / delvis / avkrefter / ukjent / kan ikke deles | Intern / ekstern omtale / sitat / bakgrunn / ikke bruk | DRO-0906-001 / SRC-0906-001 / PCQ-0906-001 / claim-lock |  |
| RESP-0906-002 | DASK-0906-002 |  |  |  |  | Bekrefter / delvis / avkrefter / ukjent / kan ikke deles | Intern / ekstern omtale / sitat / bakgrunn / ikke bruk | DRO-0906-002 / SRC-0906-002 / PCQ-0906-002 / claim-lock |  |

## 8. Vedtakstekster til logg

Hvis Sak 1 godkjennes med anbefalt alternativ:

```text
2026-06-15: Godkjent intern casekort- og researchsprint for Food TG basert paa 09.06-samtalen. A+B/C beholdes som arbeidsramme. Syv caseanker kan sorteres og kildejages internt, men ekstern outreach og claim-loeft krever separat beslutning.
```

Hvis Sak 4 godkjennes:

```text
2026-06-15: Godkjent at DASK-0906-001 og DASK-0906-002 sendes internt til relevante dokumenteiere. Dette er intern dokumentinnhenting, ikke ekstern outreach. Svar skal logges med dokument, rolle, bruksrett, status og neste gate foer de paavirker casekort, PCQ, source-shortlist eller claim-lock.
```

## 9. Ikke si

- Ikke si at Brasil/kaffe har MOU, partsliste eller partnerrolle foer DASK-0906-001 svarer med dokument og bruksrett.
- Ikke si at kakao-/Elfenbenskysten-sporet har relasjon, organisasjonsnavn eller dokument foer DASK-0906-002 svarer.
- Ikke send AASK-sporsmal eksternt foer minimumsvedtak eller outreach-gate apner det.
- Ikke bruk ferske gate-/strict-source-tall eksternt foer PR #159 er merget/deployet og operatorsekvensen er re-kjort.
- Ikke behandle muntlige signaler som faktastemme uten dokumenteier, dato, scope og bruksrett.

## 10. Etter sending

1. Lagre faktisk sendetidspunkt og mottakere i responsloggen eller `decision-log-food-tg.md`.
2. Nar svar kommer: klassifiser responsen som bekrefter, delvis, avkrefter, ukjent eller kan ikke deles.
3. Oppdater bare de kontrollfilene responsen faktisk berorer.
4. Hvis dokument ikke finnes: parker eller nedgrader caset i claim-lock/casekort i stedet for aa fylle med web-research.
5. Hvis dokument finnes med bruksrett: vurder source-shortlist/PCQ-oppdatering og eventuell senere AASK-gate.
