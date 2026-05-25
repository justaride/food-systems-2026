# Kritisk analyse — database, datagrunnlag, akademisk kildeføring og validering

Date: 2026-05-26
Scope: Prisma-schema, seed-data, citation-modeller, audit-skripts, testdekning. Måling fra repo-state, ikke fra prod-DB.

Tone: kritisk. Mål er å avdekke svakheter, ikke å rosesnore det som fungerer.

---

## 1. Databasestruktur (47 modeller, 11 migrasjoner)

**Det som fungerer:**
- Egen citation-domene med 5 modeller: `SourceDoc`, `SourceRef`, `SourceCitation`, `FieldCitation`, `DocumentRef`
- Polymorphic `FieldCitation` (entityType+entityId) gir fleksibilitet på tvers av modeller
- Enum-typing: `SourceClass` (10 verdier), `CitationReadiness` (4), `VerificationStatus` (9)
- Migrasjonshistorikk viser modenhet: `source_citations`, `board_member_provenance`, `shareholder_provenance` lagt til i mai

**Det som ikke fungerer:**
- **Polymorphic FieldCitation har ingen FK-tvang** — entityType/entityId kan peke til ikke-eksisterende rader. `entityExists`-funksjon eksisterer i `citation-audit.ts` som *audit*, men ingen DB-constraint.
- **`legacy_unsourced` enum-verdi** signaliserer at en betydelig del av kilde-arv er importert uten kildelokator. Vi har normalisert dette i type-systemet i stedet for å rydde det opp.
- **`unknown` SourceClass** — kilder uten klassifikasjon godtas. Burde vært påkrevd ved insert.
- **Producer-modellen har null kobling til kilder.** 55k+ produsenter (fra Landbruksdirektoratet) er fullstendig avhengig av import-tidspunkt — ingen `verifiedAt`, ingen `sourceCitation`. Hvis registeret endrer seg, har vi ikke et "som var"-snapshot.
- **`search_vector Unsupported("tsvector")`** — FTS-kolonner er manuelt vedlikeholdt utenfor Prisma. Drift mellom DB og kode er en kjent risiko.

---

## 2. Akademisk kildeføring — kvantitative gap

### Reports (n=129)

| Metadata | Dekning | Vurdering |
|---|---|---|
| year | 129/129 (100%) | ✅ |
| institution | 126/129 (98%) | ✅ |
| sourceUrl | 118/129 (91%) | 🟡 11 mangler — verifiserbarhet sviktet |
| author | 29/129 (22%) | 🔴 **78% mangler forfatter** — kildeintegritet kompromittert |
| DOI | 20/129 (16%) | 🔴 Akademiske rapporter uten DOI er vanskelige å re-finne om URL dør |
| ISBN | 1/129 (1%) | 🔴 |
| ISSN | 0/129 (0%) | 🔴 Ingen journal-artikler distinguert |

**Største problem:** 78% av Reports har ingen forfatter-felt. Det er en institusjonell rapport-forventning som åpner for type «NIBIO 2024» uten siteringsmulighet på personnivå.

### Theses (n=78)

| Metadata | Dekning | Vurdering |
|---|---|---|
| year | 78/78 (100%) | ✅ |
| method | 78/78 (100%) | ✅ |
| url | 78/78 (100%) | ✅ |
| DOI | 36/78 (46%) | 🟡 Akademisk standard burde være 100% for nyere arbeider |
| accessDate | 0/78 (0%) | 🔴 **Ingen tilgangsdato** — kan ikke verifiseres "som var" |
| archivedUrl | 0/78 (0%) | 🔴 **Null link-rot-beskyttelse** |

### SourceDocs (n=176)

| Metadata | Dekning | Vurdering |
|---|---|---|
| year | 165/176 (94%) | ✅ |
| author | 162/176 (92%) | ✅ |
| url | 98/176 (56%) | 🔴 44% har ingen lenke |
| DOI | 6/176 (3%) | 🔴 Faktisk skadelig lav |
| accessedAt | 0/176 (0%) | 🔴 |
| archivedUrl | 0/176 (0%) | 🔴 |

**Sammendrag:** 383 akademiske kilder, **0** har `archivedUrl`. Hvis Norden-tjenester/Regjeringen/universitets-PDFer går offline, har vi ingen redundans. Standard digital humaniora-praksis (`archive.org`-snapshot ved import) er fullstendig fraværende.

---

## 3. Insight — eneste modell med moden citation-modell

```ts
Insight {
  primaryCitationId   // ← peker til SourceCitation
  sourceDocLinks      // ← many-to-many SourceDoc
  sourceRefs          // ← inline SourceRef
  documentRefs        // ← InsightDocumentRef (separat join-tabell)
}
```

Insights har fire ulike måter å vise kilde på. Det er overdesignet for én modell og samtidig **understandard for de andre 46**. Producer, Company, BoardMember, Shareholder, BusinessRelationship — ingen av dem har en `primaryCitationId`-felt.

`row-source-locators.ts` (1 765 linjer) dekker 10 modeller via funksjonell uthenting av kildelokator fra felt-konvensjoner. Dette er en kompenseringsmekanisme — burde vært strukturelle FK-er.

---

## 4. Valideringsverktøy — bred, men trenger granskning

**Aktive audits (14 skripts referert i package.json):**
- `audit:konsern` (coverage på konsern)
- `audit:citations` = `verify-data-integrity.ts --strict-sources`
- `audit:citable` (kombo: `db:audit && audit:citations && audit:citable-reports && research:citation-readiness-queue`)
- `audit:citable-reports`
- `audit:circular-leverage`
- `audit:research-artifacts`
- `audit:source-coverage-gaps`
- `db:audit` (`verify-data-integrity.ts`)
- `db:verify` (`verify-prod-counts.ts`)
- `db:backfill:*` (4 backfill-skripts for provenance)
- `db:refresh:source-citation-readiness`

**57 test-filer**, herav minst 10 citation-relaterte.

**Det som er svakt:**
- **Backfill-skripts er en kompenseringsmekanisme** — antyder mye legacy data uten kildelokator. Vi har gjort verktøy for å gjette retroaktivt, ikke krevd det fremover.
- **Ingen test for `archivedUrl`-dekning** — siden ingen rader har det, finnes ingen test som ville feile om alle plutselig fikk det.
- **Ingen lint-/CI-regel som blokkerer commits som introduserer rader uten kildelokator** — auditen kjører post-hoc, ikke som gate.
- **`verify-prod-counts.ts` baselines er svært lave** — `BusinessRelationship` baseline 40, `Communication` baseline 0 (seedEmpty). En produksjons-DB med 40 business-relasjoner er svært tynt for et nordisk matsystem-prosjekt.

---

## 5. Datagrunnlag — kritiske observasjoner

Per `verify-prod-counts.ts`:

| Modell | Baseline |
|---|---|
| Document | 900 |
| SourceDoc | 150 |
| Report | 100 |
| Insight | 100 |
| Thesis | 60 |
| Company | 50 |
| Actor | 150 |
| BoardMember | 300 |
| PersonProfile | 30 |
| Meeting | 5 |
| Communication | 0 |

**Observasjoner:**
- **Communication-modellen er tom.** Tabellen finnes men brukes ikke. Dødvekt i schema.
- **PersonProfile = 30**, mens BoardMember = 300. Forholdet 1:10 betyr at 270 styremedlemmer (90%) har ingen profil-fil. Hver av dem er navngitt i en konsernstruktur uten verifiserbar bakgrunn.
- **Meeting = 5** (prod) vs 8 i kode-seed. **Tre møter fra dokumentene er ikke importert til prod**, eller import er ikke kjørt nylig.
- **Producer baseline mangler i `verify-prod-counts.ts`** — vi sjekker ikke om de 55k+ produsentene fortsatt er der.

---

## 6. Akademisk integritet — strukturelle problemer

### A. «Kilder uten kilder»

`SourceDoc` har 176 rader, og 12 av dem (`legacy_unsourced` enum) er per definisjon ikke en kilde — de er en plassholder. Resultatet er at noen kilde-id-er er tilbakelegde innførsler i kildesporing, ikke ekte kilder.

### B. Bruk av norsk Wikipedia / sekundærkilder uten primær-sjekk

`SourceClass.secondary` er en gyldig kategori. Ingen audit-regel sier «hvis claim X støttes utelukkende av en secondary, må det også finnes en primary-kobling». Vi kan ha forskningsclaims i `Insight` der hele evidence-kjeden er sekundær.

### C. Author-attribusjon kollaps

22% Reports har forfatter, 92% SourceDocs har forfatter. Asymmetrien er stor og inkonsistent. Når en bruker ser «NIBIO 2024-rapport» i UI, kan de ikke citere annerledes enn institusjonen — selv om rapporten har 5 forfattere.

### D. Verifikasjon mot original ikke automatisert

`VerificationStatus.verified` er en manuell merkelapp. Det finnes ingen automatisert sjekk som:
- Henter URL
- Sammenligner sitatfrase med faktisk dokument-innhold
- Markerer `failed` hvis dokumentet er endret

`hashAlgorithm: sha256` og `fileHash` på `SourceCitation` antyder at hashing er forutsett, men dekningsgrad er ukjent — krever DB-query.

---

## 7. Topp 10 kritiske blindsoner

| # | Blindsone | Konsekvens |
|---|---|---|
| 1 | 0% `archivedUrl` på 383 akademiske kilder | Lenke-rot vil ramme alle kilder over tid |
| 2 | 0% `accessedAt` på SourceDoc + Thesis | Kan ikke verifiseres «som var» |
| 3 | DOI-dekning 3–46% | Akademisk standard sviktet |
| 4 | 78% Reports uten forfatter | Sitering-kvalitet kompromittert |
| 5 | Producer-modellen mangler kildesporing | 55k+ produsenter uten verifiseringstidspunkt |
| 6 | Polymorphic FieldCitation uten FK-tvang | Dangling refs mulig |
| 7 | 270/300 (90%) BoardMembers uten PersonProfile | Navn uten verifiserbar bakgrunn |
| 8 | `legacy_unsourced` normalisert i enum | Vi har designet rundt et datakvalitetsproblem |
| 9 | Ingen automatisk verifikasjon mot original-kilde | `verified`-flagg er menneskelig signering, ikke programmatisk sjekk |
| 10 | Backfill-skripts dominerer source-coverage-arbeidet | Vi rydder retroaktivt fremfor å kreve forhåndssitering |

---

## 8. Anbefalinger (prioritert)

### Quick wins (1–2 dager)

1. **CI-gate: pre-commit check** — ingen `Insight`, `Report`, eller `Thesis` lar seg importere uten `sourceUrl` ELLER `documentId`. Hindrer fremtidig legacy-arv.
2. **archive.org-snapshotting i import-scripts** — for hver ny URL importert, hent `web.archive.org/save/<url>` og lagre `archivedUrl`. Kost: <2 timer per skript.
3. **`Report.author` ble obligatorisk fra 2026-06-01** — tving manuell fylling av eksisterende rader.

### Strukturelle (1–2 uker)

4. **Drop `legacy_unsourced` over 6 måneder.** Sett deadline. Alle rader med denne klassen må enten få en kildelokator eller slettes/arkiveres.
5. **Producer får `sourceCitationId`-felt + backfill-script** mot Landbruksdirektoratet-snapshots med dato.
6. **`accessedAt` blir påkrevd** for nye SourceDoc/Thesis.
7. **DOI-resolver i import-pipeline** — for hver ny SourceDoc/Thesis/Report, prøv å hente DOI fra Crossref via tittel+author.

### Strategiske (1–3 mnd)

8. **Migrer fra polymorphic FieldCitation til typed citation per entity.** Aksepter mer skjema-tyngde for verdensklasse FK-integritet.
9. **Automatisert source-verification:** hver natt, hent en sample av URL-er, sammenlign sha256-hash med lagret `fileHash`. Marker driftede dokumenter som `disputed`.
10. **PersonProfile-dekning på BoardMember:** mål 100% dekning innen Q3 2026. Uten dette er styreoverlapp-analysen et kart over navn, ikke personer.

---

## 9. Hva som faktisk er imponerende

For å være ærlig: kildesporing-domenet er overlegent det jeg har sett i tilsvarende forskningsprosjekter. 5 modeller, 23 enum-verdier på citation-status, 14 audit-skripts, 10+ citation-tester. **Intensjonen er solid**. Problemet er **eksekvering**: vi har bygget infrastrukturen for streng kildeføring og deretter latt 90 %+ av kjerne-feltene være ufylte. Det er dyrere å ha sofistikerte tomme strukturer enn enkle fylte.

## 10. Anbefalt neste skritt

Mål en uke på å lukke topp 3 quick wins (archivedUrl, Report.author, accessedAt for nye rader). Kjør deretter `npm run audit:source-coverage-gaps` mot prod og publiser en baseline-rapport. Uten dette baseline-tallet vet vi ikke om vi forbedrer oss.
