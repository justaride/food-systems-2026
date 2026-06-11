# Database Schema

## Core Entities

| Model | Key Fields | Unique Key |
|---|---|---|
| `Document` | `slug`, `filePath`, `title`, `content`, `tags`, `embedding` | `slug`, `filePath` |
| `SourceDoc` | `id` (`src-N`), `filename`, `sourceType` | `id` |
| `Insight` | `id` (`ins-N`), `title`, `insightType`, `tags` | `id` |
| `Thesis` | `id`, `authors`, `institution`, `year`, `tags` | `id` |
| `Report` | `id`, `title`, `reportCategory`, `country` | `id` |
| `Company` | `name`, `orgNr`, `country`, `ownershipType`, `valueChainStage` | `orgNr` |
| `Actor` | `id`, `slug`, `name`, `actorType`, `country`, `themeTags` | `slug`, `[country,name]` |

## Company Sub-models

| Model | Purpose | Unique Key |
|---|---|---|
| `CompanyFinancial` | Revenue, margins, and employees by year | `[companyId, year]` |
| `Shareholder` | Ownership stakes | - |
| `BoardMember` | Board and executive roles, plus `personKey` for interlocks | - |
| `Subsidy` | Government subsidies | - |
| `CompanyDocumentRef` | Company to document links | `[companyId, documentId]` |

## Deep Research Models

| Model | Purpose | Unique Key |
|---|---|---|
| `CompanyOwnership` | Parent to child corporate trees | `[parentCompanyId, childCompanyId]` |
| `CompanyProperty` | Physical assets and self-leasing detection | - |
| `BusinessRelationship` | Inter-company relationships | `[fromCompanyId, toCompanyId, relationshipType]` |
| `PersonProfile` | Stakeholder profiles with role arrays | `personKey` |

## Food TG Mandate Board

| Model | Purpose | Unique Key |
|---|---|---|
| `ClaimBoardEntry` | DB rows for the `/mandat` claim/evidence board | `id` |
| `OpportunityEntry` | DB rows for the `/mandat` opportunity radar | `id`, `rank` |
| `FoodTgBoardLedger` | Idempotent content-history ledger for board imports | `[entryType, entryId, contentHash]` |

### `ClaimBoardEntry`

- DB-backed rows for the `/mandat` claim/evidence board.
- Seeded from `src/lib/data/food-tg-mandate.ts` via `npm run db:import:food-tg-board`.
- `updatedAt` is the UI row timestamp; `sourceUpdatedAt` records the static seed's mandate date.
- The static mandate file remains a marked fallback only when DB rows are unavailable.

### `OpportunityEntry`

- DB-backed rows for the `/mandat` opportunity radar.
- `rank` preserves the static radar order and is unique.
- `statuses`, `claimIds`, `evidenceIds`, and `sourceIds` preserve the current claim-lock references.

### `FoodTgBoardLedger`

- Idempotent import ledger for claim-board and opportunity-radar snapshots.
- Unique by `[entryType, entryId, contentHash]` so unchanged imports do not create duplicate history.

## Deep Research Field Notes

### `CompanyOwnership`

- `parentCompanyId`, `childCompanyId` reference `Company`
- `ownershipPct` is optional `Float`
- `ownershipType`: `subsidiary` | `joint-venture` | `minority-stake`
- `effectiveFrom`, `effectiveTo`, `source`, `metadata` are optional

### `CompanyProperty`

- `companyId` references `Company`
- `propertyType`: `warehouse` | `retail` | `office` | `production` | `logistics`
- Location fields: `address`, `municipality`, `county`, `country` (default `NO`)
- Optional metrics: `lat`, `lng`, `sqMeters`, `acquiredYear`
- `selfLeased` is the key flag for self-dealing detection
- `tenantCompanyId` is nullable
- `source` and `metadata` are optional

### `BusinessRelationship`

- `fromCompanyId` and `toCompanyId` reference `Company`
- `relationshipType`: `supplier` | `buyer` | `distributor` | `franchisor` | `self-dealing` | `joint-venture`
- Optional detail fields: `description`, `sector`, `estimatedValue`, `source`, `metadata`

### `PersonProfile`

- `personKey` is normalized and unique
- `roles` is a `Json[]` array of `{companyId, companyName, role, fromYear, toYear}`
- Optional profile fields: `biography`, `linkedInUrl`, `photoUrl`
- `affiliations`, `tags`, and `metadata` are optional

## Relationship Models

| Model | Purpose |
|---|---|
| `DocumentRef` | Document cross-references (`cites`, `supports`, `contradicts`) |
| `InsightDocumentRef` | Insight to document links |
| `ActorDocumentRef` | Actor to document links |
| `ActorRelationship` | Actor to actor links such as dependency, ally, or oversight |
| `ActorContact` | Contact persons for actors |

## Data Integrity

- Use `npm run db:audit` when you need current counts or integrity status
- Treat historical record counts in notes as snapshots, not stable instructions
