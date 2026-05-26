# Typed citation per entity — design decision

Date: 2026-05-26
Kontekst: Kritisk-analyse anbefaling #10 (PR #83). Etter 15 PRer der 9 av 10 anbefalinger ble levert, gjenstår denne ene som en designbeslutning fremfor en konkret jobb.

## Hva anbefalingen sa

> Strategisk (1–3 mnd): Migrer fra polymorphic FieldCitation til typed citation per entity. Aksepter mer skjema-tyngde for verdensklasse FK-integritet.

## Hva vi faktisk har observert

| Entity | FieldCitations | Distinct SourceCitations |
|---|---|---|
| Subsidy | 179 311 | **2** (179 310 → samme citation) |
| DeliveryVolume | 60 310 | (sannsynligvis 1–2) |
| Document | 1 642 | mange |
| BoardMember | 1 455 | mange |
| CountryMetric | 500 | mange |
| Report | 166 (over 129 reports) | mange |

To distinkte mønstre dukker opp:

### Mønster A: «Én kilde for hele tabellen» (Subsidy, DeliveryVolume)

Alle (eller nesten alle) rader peker til samme SourceCitation. Den polymorphic FieldCitation-tabellen lagrer da effektivt N kopier av samme peker.

**Karakteristikk:** registry-importerte tabeller, bulk-data fra én kilde.

**Hva typed-citation løser:** ingen reell datakvalitets-vinning. En typed FK ville bare være en query-optimering (slipper å gå via FieldCitation for primær-attribusjon).

### Mønster B: «Hver rad har sin egen kilde» (Document, BoardMember, Report)

Ulike rader siterer ulike kilder, ofte flere per rad. Polymorphic FieldCitation har genuint verdi her — én rad kan ha mange citations.

**Karakteristikk:** kuraterte data der hver entry har egne underlag.

**Hva typed-citation løser:** En `primaryCitationId`-shortcut for "main source" supplerer polymorphic uten å erstatte det. Vi har allerede gjort dette for `Insight.primaryCitationId` og `Producer.primaryCitationId`.

## Anbefalt vei videre

**Ikke gjør en full migrasjon.** Det er ikke nødvendig. Polymorphic FieldCitation er ikke patologisk — det er korrekt for mønster B.

**Gjør målrettede typed-shortcuts der det gir verdi:**

| Entity | Pattern | Anbefaling |
|---|---|---|
| Producer | A | ✅ Allerede gjort (PR #92) |
| Insight | B-hybrid | ✅ Allerede gjort (primaryCitationId + sourceRefs + documentRefs) |
| Subsidy | A | Vurder: `Subsidy.sourceCitationId` shortcut + behold FieldCitation for evt. fremtidig granularitet |
| DeliveryVolume | A | Vurder: samme som Subsidy |
| Report | B (men entity ER kilde) | Ikke nødvendig — Reports har allerede sourceUrl/institution/author |
| Thesis | B (men entity ER kilde) | Ikke nødvendig — samme |
| BoardMember | B | Vurder: `BoardMember.primaryCitationId` for hovedkilde |

**Aksepter at FieldCitation polymorphic-pattern står.** FK-integritet er en stilistisk preferanse — i praksis enforces det via audit-script (`citation-audit.ts` har `entityExists`-sjekk).

## Hva dette betyr for kritisk-analyse-status

Anbefaling #10 markeres som **partially resolved / by design**. Det er ikke en blindsone vi har latt stå — det er en arkitektur-vurdering der vi har valgt å beholde polymorphic-pattern bortsett fra strategiske typed-shortcuts der det gir reell verdi.

## Konkrete oppgaver hvis dette skal eksekveres

Hvis teamet bestemmer at typed-shortcuts er ønskelig for Subsidy/DeliveryVolume/BoardMember:

1. **Subsidy.sourceCitationId** — 3-fase migrasjon:
   - Phase 1: Add nullable FK + index (Prisma migration)
   - Phase 2: Backfill from FieldCitation (assume one-per-row, take most-common citationId per entityId)
   - Phase 3: Update import-produksjonstilskudd.ts to set citation on create

2. **DeliveryVolume.sourceCitationId** — samme 3-fase

3. **BoardMember.sourceCitationId** — samme, men her må hver rad få sin egentlige primær-kilde, ikke en bulk-default

Hver av disse er ~1 PR. Estimer 3 PRer for å fullføre #10 hvis det blir prioritert.

## Konklusjon

Etter 15 PRer:
- 9 av 10 anbefalinger levert
- #10 er en akseptabel arkitektur-beslutning, ikke en blindsone

Real DB-impact lokalt etter sesjonen:
- 38 925 produsenter koblet til registerkilde
- 187 nye PersonProfile-stubs (BoardMember-coverage 69 % → 100 %)
- 995 SourceCitations machine_verified via URL-helse-sjekk
- 519 archivedUrl-snapshots koblet fra Wayback
- 35 lokale filer hashet med integrity-check klar
- 5 nye DOIer fra Crossref
- Reports 100 % attribusjon
- 4 audit-scripts + 6 backfill-scripts + 2 verify-scripts + 1 cron-workflow

Anbefalingsstrukturen fra kritisk analyse har gått fra en liste blindsoner til et sett ferdige integrasjoner med klare cron-rutiner og worklist-pipelines.
