# Mote- og Transkripsjonsaudit

**Dato:** 18. mars 2026  
**Scope:** `9, mars 2026 FOOD.md`, `Speaker 1.md`, `Speaker 1 (1).md`, `Strategisk ledergruppe Marked 16 mars 2026.md`, `src/lib/data/meetings.ts`, `src/lib/data/sources.ts`, importskriptene og visningen i `/moter`.

## Hva som fungerer i dag

- Prosjektet har allerede et kuratert lag i `src/lib/data/meetings.ts` med sammendrag, beslutninger, aksjonspunkter og nokkelfunn.
- `/moter` viser et komprimert beslutningslag istedenfor fulle transkripsjoner.
- `research/meeting-4-research-focus.md` viser at transkripsjoner kan destilleres videre til et nyttig arbeidsdokument.

## Viktigste problemer

### 1. Tre forskjellige kunnskapsnivåer er blandet

- Ratranskripsjon, kuratert motesammendrag og analytisk oppfolging er ikke tydelig skilt i filstruktur eller metadata.
- Dette gjor det lett a forveksle primarkilde med avledet tolkning.

### 2. Ratranskripsjonene inneholder mye stoy

- `Strategisk ledergruppe Marked 16 mars 2026.md` inneholder Zoom-lenke, passcode, deltakerstatus og annen invitasjonsmetadata.
- `Speaker 1 (1).md` inneholder avsporing om harddisk, iCloud og maskinlagring.
- `9, mars 2026 FOOD.md` blander manuelle notater, action items, sammendrag og full transkripsjon i samme fil.
- Slike partier er nyttige i arkiv, men svekker signalstyrken dersom de brukes direkte i analyse, sok eller embedding.

### 3. Integrasjonen med resten av prosjektet har hatt hull

- Moter ble lagret som egne `Meeting`-records, men ikke som egne `Document`-records i biblioteket.
- `scripts/import-research-docs.ts` importerer bare `research/**/*.md`, sa rotlagte motefiler ble ikke del av dokumentsok, bibliotek eller embeddings.
- `meeting-4` manglet egen `SourceDoc` for selve transkripsjonen.

### 4. Kildemappingen hadde en konkret feil

- `meeting-2` og `meeting-3` var koblet mot feil `SourceDoc`-ID-er for `Speaker 1.md` og `Speaker 1 (1).md`.
- Beskrivelse og relevans i `src/lib/data/sources.ts` var ogsa speilvendt for de to filene.

## Endringer gjort i denne runden

- Rettet kildebytte mellom `meeting-2` og `meeting-3`.
- Rettet metadata for `Speaker 1.md` og `Speaker 1 (1).md` i kilde-registeret.
- Lagt inn `SourceDoc` for `Strategisk ledergruppe Marked 16 mars 2026.md`.
- Oppdatert `importMeetings()` slik at motekilder resynkes rent ved import, i stedet for a akkumulere gamle `SourceRef`-rader.
- Lagt inn genererte `Document`-records for alle moter, basert pa det kuraterte laget i `src/lib/data/meetings.ts`.
- Tydeliggjort i UI at `/moter` viser kuraterte sammendrag, ikke ratranskripsjoner.

## Anbefalt modell videre

### Lag 1: Arkiv

- Behold ratranskripsjon uendret som sporbar primarkilde.
- Ikke bruk arkivlaget direkte til presentasjon eller embedding uten rensing.
- Fjern eller skjerm sensitiv invitasjonsmetadata dersom filene skal deles bredt.

### Lag 2: Kuratert motegrunnlag

- Ett standardisert moteobjekt per mote:
  - sammendrag
  - beslutninger
  - aksjonspunkter
  - nokkelfunn
  - primarunderlag
  - relaterte kilder
- Dette laget bor vare source of truth for app, bibliotek og sok.

### Lag 3: Analyse

- Avledede dokumenter som `research/meeting-4-research-focus.md` bor eksplisitt markeres som analyse, ikke transkripsjon.
- Analyselag kan gjerne vere mer tolkende og tematisk, men ma alltid kunne spores tilbake til lag 1 og 2.

## Praktisk kvalitetsregel for komprimering

Behold:

- beslutninger
- aksjonspunkter
- rolleavklaringer
- tidsfrister
- hypoteser og paastander som skal etterproves
- nevnte datasett, verktroy, partnere og integrasjoner

Fjern eller de-prioriter:

- moteinvitasjoner, passcodes, deltakerstatuser
- teknisk smaprat om maskin, lagring og iCloud
- sosial prat uten konsekvens for prosjektet
- gjentakelser som ikke tilfører ny beslutning eller ny innsikt

## Minimumsstandard for nye moter

Hver ny mote bor ha:

- ett raopptak eller ratranskripsjon
- ett kuratert sammendrag pa 150-300 ord
- 3-7 beslutninger
- 3-10 aksjonspunkter med eier der det er kjent
- 3-7 nokkelfunn eller hypoteser
- tydelig peker til primarunderlag

## Neste naturlige steg

- Flytt ratranskripsjoner til en tydeligere arkivmappe nar andre prosesser i prosjektet tillater det.
- Introduser en eksplisitt status per motefil, for eksempel `raw`, `curated`, `analysis`.
- Vurder en lett sanitiseringsjobb for a strippe invite-metadata og opplagt stoy for videre intern bruk.
- Koble meeting-dokumentene inn i videre referanseberikelse og embedding-kjoring nar databasen oppdateres neste gang.
