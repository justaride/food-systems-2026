# Data Readiness Status — Baseline

> Baseline-tag: `data-readiness-baseline`
> Lock-dato: 2026-04-27
> Forrige merge: `d5fc85b` (PR #9 Sirkulær-mat)

Lock-status før utførelse av data-readiness-arbeidsplanen. Mål: dokumentere hva som er bekreftet grønt og hvilke unntak som er kjente, slik at videre arbeid kan reverseres til denne baselinen ved behov.

## Grønne sjekker

| Sjekk | Status | Kommentar |
|---|---|---|
| `npm run lint` | ✓ | ingen lint-feil |
| `npx tsc --noEmit` | ✓ | ingen typefeil |
| `npm run db:audit` | ✓ | 240 879 records, alle integritetssjekker passer; 11 klassifiserte provenance-varsler |
| `npm run db:verify` | — | ikke kjørt på baseline; kan kjøres ved behov |
| `npm run build` | — | ikke kjørt på baseline; full Next.js build kjøres før deploy |

## Record-tall (db:audit, baseline)

| Entitet | Antall |
|---|---:|
| `Subsidy` | 179 312 |
| `Company` | 55 431 |
| `BoardMember` | 1 696 |
| `PersonProfile` | 1 354 |
| `Document` | 1 163 |
| `SourceDoc` | 307 |
| `CompanyFinancial` | 303 |
| `CountryMetric` | 243 |
| `Actor` | 191 |
| `ActorRelationship` | 157 |
| `Report` | 154 |
| `CompanyOwnership` | 150 |
| `BusinessRelationship` | 121 |
| `CompanyProperty` | 120 |
| `Shareholder` | 91 |
| `Thesis` | 86 |
| **Sum** | **240 879** |

## Kjente unntak (varsel, ikke feil)

11 rapporter har eksplisitt `provenanceType`-klassifisering uten kanonisk `sourceUrl`. Disse er klassifiserte som varsel i `db:audit`, ikke feil — de har resolvbare `supportingSources` eller er bevisst flagget som blokkert.

| ID | Type | Notat |
|---|---|---|
| `agrianalyse-bondens-andel-2025` | `blocked_source` | Publikasjon ikke funnet i AgriAnalyse-arkivet 2025; lokal PDF er HTML feil-lagret som PDF |
| `merkevarer-historie` | `internal_synthesis` | Lokalt faktaark Orkla/TINE |
| `nordisk-sammenligning-2024` | `composite_source` | Bygger på ICA, Axfood, Kesko årsrapporter |
| `verdibutikker-utfordrere` | `composite_source` | Normal + Europris regnskapsdata |
| `oversikt-nordisk-matmakt-historikk` | `internal_synthesis` | Egenkartlegging |
| `oversikt-sirkularitet-dyp` | `internal_synthesis` | Lokalt notat med 20+ kilder |
| `oversikt-tenketanker-ngo` | `internal_synthesis` | Landskapskartlegging |
| `oversikt-offentlig-rapportlogg` | `internal_register` | Register over offentlige rapporter |
| `oversikt-nordisk-avhandlingsregister` | `internal_register` | 70 avhandlinger fra flere repositorier |
| `oversikt-nordisk-mat-tenkere` | `internal_synthesis` | Person/miljø-kartlegging |
| `oversikt-nou-stortingsdok-juridisk` | `internal_register` | NOU-er, meldinger, EU-direktiv |

Detaljert vurdering per case: [REPORT-SOURCEURL-GAP-13.md](REPORT-SOURCEURL-GAP-13.md).

## Commits siden forrige merge

| SHA | Beskrivelse |
|---|---|
| `6716042` | chore(research): regenerate auto-catalogues after provenance work |
| `2069db5` | chore: thesis URL backfill + intake source-path resolver fix |
| `55c716f` | feat(reports): add provenance type system + classify 13 sourceUrl-gap reports |

## Migration state

- `20260427_report_provenance` — applikert lokalt og i repo

## Neste fase fra denne baselinen

1. **Definér KI-bruksprofil** — RAG/Q&A, tematisk analyse, sammendrag, utforskende søk? Påvirker IA-regler og hvilke felt som er obligatoriske
2. **Utvid provenance-mønster** til `Thesis`, `Document`, `SourceDoc`
3. **KI-prioriterings-rangering** (1-5) per Document/Report
4. **Fase B** parallell-undersøkelse: URL-helse + fildekning + PDF-kvalitet + HTML-triage → samlet `REMEDIATION-BACKLOG.csv`
5. **Fase C** kanonisering: semantisk dedup + IA-anvendelse + HTML→MD-ekstraksjon
6. **Fase D** validering: 5-10 KI-aksept-tester + utvidet `db:audit` + sluttrapport

## Rollback

Hele arbeidet etter baselinen kan tilbakestilles via:

```
git reset --hard data-readiness-baseline
```

Database-rollback krever også manuell SQL hvis `provenanceType`/`supportingSources` skal fjernes — men disse kolonnene er ikke-destruktive (kun additive), så normalt trenger man bare git-rollback.
