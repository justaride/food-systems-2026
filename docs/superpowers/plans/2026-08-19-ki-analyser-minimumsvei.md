# Minimumsvei: KI-analyser med kildeføring og menneskelig review

- **Dato:** 2026-08-19
- **Status:** Utkast til godkjenning
- **Mål:** KI analyserer kildemateriale i stort volum, flere ganger per kilde, med full historikk og kildeføring. Et menneske godkjenner før noe blir sitérbart.
- **Erstatter:** `2026-08-19-autonomous-ai-candidate-semantic-attestation-design.md` som neste skive. Den grenen blir stående umerget.

## Utgangspunkt

Dette finnes og virker i produksjon i dag:

| Finnes | Hvor |
|---|---|
| Kandidatmodell med KI-output og reviewstatus | `LibraryAnalysisRecord` (`prisma/schema.prisma:298`) |
| Kontrakt for KI-output | `validateLibraryAiCard` (`src/lib/library-analysis.ts`) |
| Kvalitetsporter | `npm run audit:citable`, `npm run gate:overclaim`, `db:audit:strict-sources` |
| Kildeverifisering | `db:verify:filehash`, `db:verify:url-health` |
| Review-kø | `src/lib/library-analysis-decision-queue.ts` |
| Flater | `/ai-kunnskap`, `/bibliotek` |

**Det ene hullet:** skriveveien er en upsert på `sourceKind_sourceKey`
(`src/lib/library-analysis-processing.ts:11`). Det gir én analyse per kilde, og
en ny kjøring overskriver den forrige. Derfor kan man ikke kjøre flere modeller
mot samme dokument og sammenligne, og historikken går tapt.

Alt annet i denne planen er å tette det hullet og deretter faktisk produsere analyser.

## Steg 1 — Append-only kjøringshistorikk

Ny tabell `LibraryAnalysisRun`:

- identitet: `sourceKind`, `sourceKey`, `sourceDocId`, `documentId`
- kjøring: `runId`, `model`, `promptVersion`, `analysisTier`, `createdAt`
- innhold: `aiCard`, `aiSummary`, `keyFindings`, `claimCandidates`, `gaps`, `riskFlags`
- sporbarhet: `contentHash` (kilden), `payloadHash` (outputen), `wordCount`
- **ingen** unique på `(sourceKind, sourceKey)` — flere rader per kilde er hele poenget
- én trigger som avviser `UPDATE` og `DELETE`

`LibraryAnalysisRecord` beholdes uendret som «gjeldende visning», med en peker til
valgt run. Ingen av de ~7 700 linjene som allerede bruker den brekker.

**Verifisering:** `tests/lib/library-analysis-schema.test.ts` utvides, `npx prisma validate`,
migrasjon kjørt mot lokal Postgres 16.

## Steg 2 — Skriveveien blir append

`library-analysis-processing.ts` får en funksjon som bygger en run-rad ved siden av
dagens upsert-payload. Dagens upsert beholdes for «gjeldende», men får aldri
slette eller overskrive historikk.

**Verifisering:** `tests/lib/library-analysis-processing.test.ts` — to kjøringer mot
samme kilde gir to run-rader og én oppdatert record.

## Steg 3 — Begrenset databasebruker (rekkverk, valgfritt)

Én migrasjon med `GRANT`: rollen får `INSERT` på `LibraryAnalysisRun` og `SELECT` på
kildetabellene. Ingen skriverett på kanoniske data, coverage eller publication.

Ingen bootstrap-skript, intet sikkerhetsmanifest, ingen attestasjon. Samme
tillitsnivå som alle andre importer i dette repoet.

## Steg 4 — Adapter: KI leser, KI skriver kandidat

`scripts/run-library-analysis.ts`:

- tar inn en liste dokumenter/`SourceDoc`
- kaller modellen, validerer output mot `validateLibraryAiCard`
- **krever at hver `claimCandidate` har kildereferanse** (`sourceDocId` + lokator) —
  ellers avvises analysen
- skriver én run-rad per dokument
- kildeføring går gjennom eksisterende `SourceCitation`-vei

**Verifisering:** enhetstest på validering og avvisning, dry-run mot 3 dokumenter.

## Steg 5 — Pilot melk/kjøtt

Kjør adapteren på det avgrensede melk/kjøtt-utvalget.

**Akseptanse:** alle analyser har sporbar kilde, ingen kanoniske tabeller er berørt,
`npm run audit:citable` er grønn.

## Steg 6 — Review-flate

Utvid `/ai-kunnskap`: kandidater per kilde, flere kjøringer side om side, godkjenn/avvis.
Gjenbruk `library-analysis-decision-queue`.

## Porter som ikke endres

`audit:citable` og `gate:overclaim` er kvalitetssikringen. Ingenting blir sitérbart
uten dekning. KI får aldri promoteringsrett — ikke fordi databasen hindrer det,
men fordi kodeveien ikke finnes.

## Hva denne planen bevisst ikke gjør

- 11 nye tabeller
- 27 navngitte databasetriggere
- egne kandidatroller med bootstrap/enable/verify-skript
- sikkerhetsmanifest og semantisk attestasjon av databasekode

Trengs den ekte sandkassen senere — for eksempel når en KI skal kjøre uten tilsyn
over tid — ligger `codex/autonomous-ai-candidate-design` umerget og klar.

## Rekkefølge

Steg 1–2 er kjernen og blokkerer alt annet. Steg 4–5 er der frukten kommer.
Steg 3 og 6 kan tas når som helst etter steg 2.
