# Food Systems 2026

## Project Overview

Knowledge base + analysis app for Norwegian/Nordic food systems. Maps corporate structures, power dynamics, supply chains, and policy landscape across the food retail and production sector.

**Stack**: Next.js 16 (App Router) + TypeScript + Prisma 7 + PostgreSQL (pgvector) + Tailwind + Leaflet/Turf + Recharts/Nivo + react-force-graph-2d

**Deploy**: Coolify on Hetzner (never Vercel). Push to GitHub `justaride` -> auto-deploy.

---

## Database Schema Quick Reference

### Core Entities (established)

| Model | Key Fields | Unique Key |
|---|---|---|
| `Document` | slug, filePath, title, content, tags, embedding | slug, filePath |
| `SourceDoc` | id (src-N), filename, sourceType | id |
| `Insight` | id (ins-N), title, insightType, tags | id |
| `Thesis` | id, authors, institution, year, tags | id |
| `Report` | id, title, reportCategory, country | id |
| `Company` | name, orgNr, country, ownershipType, valueChainStage | orgNr |
| `Actor` | id, slug, name, actorType, country, themeTags | slug, [country,name] |

### Company Sub-models

| Model | Purpose | Unique Key |
|---|---|---|
| `CompanyFinancial` | Revenue, margins, employees by year | [companyId, year] |
| `Shareholder` | Ownership stakes | - |
| `BoardMember` | Board/exec roles, personKey for interlocks | - |
| `Subsidy` | Government subsidies | - |
| `CompanyDocumentRef` | Company <-> Document links | [companyId, documentId] |

### Deep Research Models (Session 1 - new)

| Model | Purpose | Unique Key |
|---|---|---|
| `CompanyOwnership` | Parent->child corporate trees | [parentCompanyId, childCompanyId] |
| `CompanyProperty` | Physical assets, self-leasing detection | - |
| `BusinessRelationship` | Inter-company relationships | [fromCompanyId, toCompanyId, relationshipType] |
| `PersonProfile` | Stakeholder profiles with role arrays | personKey |

#### CompanyOwnership fields
- `parentCompanyId`, `childCompanyId` (FK -> Company)
- `ownershipPct` (Float?), `ownershipType` ('subsidiary' | 'joint-venture' | 'minority-stake')
- `effectiveFrom/To` (DateTime?), `source`, `metadata` (Json?)

#### CompanyProperty fields
- `companyId` (FK -> Company), `propertyType` ('warehouse' | 'retail' | 'office' | 'production' | 'logistics')
- `address`, `municipality`, `county`, `country` (default 'NO')
- `lat/lng` (Float?), `sqMeters` (Float?), `acquiredYear` (Int?)
- `selfLeased` (Boolean) -- key flag for self-dealing detection
- `tenantCompanyId` (FK -> Company, nullable)
- `source`, `metadata` (Json?)

#### BusinessRelationship fields
- `fromCompanyId`, `toCompanyId` (FK -> Company)
- `relationshipType` ('supplier' | 'buyer' | 'distributor' | 'franchisor' | 'self-dealing' | 'joint-venture')
- `description`, `sector`, `estimatedValue` (Float?), `source`, `metadata` (Json?)

#### PersonProfile fields
- `name`, `personKey` (unique, normalized)
- `roles` (Json[]) -- array of `{companyId, companyName, role, fromYear, toYear}`
- `biography`, `linkedInUrl`, `photoUrl`
- `affiliations` (String[]), `tags` (String[]), `metadata` (Json?)

### Relationship Models

| Model | Purpose |
|---|---|
| `DocumentRef` | Document cross-references (cites/supports/contradicts) |
| `InsightDocumentRef` | Insight <-> Document |
| `ActorDocumentRef` | Actor <-> Document |
| `ActorRelationship` | Actor <-> Actor (dependency, ally, oversight) |
| `ActorContact` | Contact persons for actors |

---

## Existing Companies (orgNr registry)

```
--- Norway (NO) ---
929228723 | ASKO Norge AS          | logistics   | family (NorgesGruppen 100%)
930622974 | ASKO Oslofjord AS      | logistics   | family (ASKO Norge 100%)
979487916 | ASKO Vest AS           | logistics   | family (ASKO Norge 100%)
918710507 | ASKO Hedmark AS        | logistics   | family (ASKO Norge 100%)
923622845 | ASKO Rogaland AS       | logistics   | family (ASKO Norge 100%)
979334109 | ASKO Midt-Norge AS     | logistics   | family (ASKO Norge 100%)
913117883 | ASKO Agder AS          | logistics   | family (ASKO Norge 100%)
933129950 | ASKO Vestfold Telemark AS | logistics | family (ASKO Norge 100%)
912015238 | ASKO Oest AS           | logistics   | family (ASKO Norge 100%)
979655215 | ASKO Nord AS           | logistics   | family (ASKO Norge 100%)
813612992 | ASKO Molde AS          | logistics   | family (ASKO Norge 100%)
999320600 | ASKO Transport AS      | logistics   | family (ASKO Norge 100%)
925216534 | ASKO Maritime AS       | logistics   | family (ASKO Norge 100%)
916286074 | ASKO Fornybar AS       | logistics   | family (ASKO Norge 100%)
925109185 | ASKO Mat AS            | logistics   | family (ASKO Norge 100%)
884133572 | ASKO Bygg Vestby AS    | logistics   | family (ASKO Norge 100%)
929975200 | Austevoll Seafood ASA  | seafood     | listed (Møgster 52.7%)
914224314 | BAMA Gruppen AS        | logistics   | family (NG 46%, REMA 20%, Bama 34%)
936560288 | Coop Norge SA          | retail      | cooperative
911608103 | Felleskjøpet Agri SA   | inputs      | cooperative
815664582 | Holdbart AS            | circular    | private
913344162 | Kavli Holding AS       | processing  | foundation (O. Kavli Fond)
975350940 | Lerøy Seafood Group ASA| seafood     | listed (Møgster 52.7%)
919702974 | Matsentralen Norge     | circular    | nonprofit
997898397 | Matvett AS             | circular    | private (NHO Mat og Drikke)
964118191 | Mowi ASA               | seafood     | listed (Fredriksen 14.4%)
989278835 | Nofima AS              | research    | state (NFD 56.8%)
819731322 | NorgesGruppen ASA      | retail      | family (Johannson 74.4%)
938752648 | Nortura SA             | processing  | cooperative
932256134 | Oda                    | retail      | private (Softbank/Kinnevik)
910747711 | Orkla ASA              | processing  | family (Hagen/Canica 25.1%)
982254604 | REMA 1000 Norge AS     | retail      | family (Reitan 100%)
914526647 | Reitan Retail AS       | retail      | family (Reitan 100%)
960514718 | SalMar ASA             | seafood     | family (Witzøe 41.3%)
988044113 | Skretting AS           | inputs      | foreign (Nutreco/SHV 100%)
947942638 | TINE SA                | processing  | cooperative
917203261 | Too Good To Go Norge AS| circular    | foreign (TGTG ApS, DK)
885316522 | Unil AS                | processing  | private (NorgesGruppen 100%)
986228608 | Yara International ASA | inputs      | state (36.2%)
930258008 | Storcash Norge AS      | foodservice | family (NorgesGruppen 100%)
952507729 | Compass Group Norge AS | foodservice | foreign (Compass Group plc UK)
932144336 | Sodexo AS              | foodservice | foreign (Sodexo SA FR)
914791723 | ISS Facility Services AS| foodservice | foreign (ISS A/S DK)
897392232 | 4Service Gruppen AS    | foodservice | foreign (Compass Group plc UK)
933444724 | Servicegrossistene AS  | foodservice | cooperative

--- Sweden (SE) ---
SE-556048-2837  | ICA Gruppen AB    | retail | listed (Nasdaq Stockholm)
SE-556542-5353  | Axfood AB         | retail | listed (Axel Johnson 50.1%)
SE-702001-3469  | Coop Sverige AB   | retail | cooperative
SE-969697-6594  | Lidl Sverige KB   | retail | foreign (Schwarz Group DE)
SE-556559-1135  | Martin & Servera AB | foodservice | family (Axel Johnson AB)
SE-556424-2537  | Menigo Foodservice AB | foodservice | foreign (Sysco US)

--- Denmark (DK) ---
DK-36471411     | Salling Group A/S | retail | family (Sallings Fond)
DK-36004412     | Coop Danmark A/S  | retail | cooperative
DK-14705627     | REMA 1000 A/S     | retail | foreign (Reitan Retail NO)
DK-25395644     | Dagrofa A/S       | retail | private (NorgesGruppen 48.9%)
DK-29215079     | Euro Cater A/S    | foodservice | family
DK-28316745     | ISS A/S           | foodservice | listed (Nasdaq Copenhagen)

--- Finland (FI) ---
FI-0116323-9    | SOK / S Group     | retail | cooperative (2.7M members)
FI-0110456-8    | Kesko Oyj         | retail | listed (Nasdaq Helsinki)
FI-1615492-7    | Lidl Suomi Ky     | retail | foreign (Schwarz Group DE)
FI-0944086-0    | Meira Nova Oy     | foodservice | cooperative (S-Group 100%)
FI-2646674-9    | Wolt Enterprises Oy | foodservice | foreign (DoorDash US)
FI-1922768-5    | Leijona Catering Oy | foodservice | state

--- Iceland (IS) ---
IS-510199-2859  | Hagar hf          | retail | listed (Nasdaq Iceland)
IS-640907-1670  | Samkaup hf        | retail | cooperative
IS-510298-3199  | Festi hf          | retail | listed
```

Norwegian companies use numeric orgNr from Brønnøysund. Nordic companies use country-prefixed IDs (SE-/DK-/FI-/IS-).

---

## Import Script Patterns

All scripts follow the same pattern:

```typescript
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ... define data arrays with typed interfaces ...

async function main() {
  // upsert pattern for idempotency
  for (const item of data) {
    await prisma.model.upsert({
      where: { uniqueKey: item.key },
      update: { ...fields },
      create: { ...fields },
    })
  }
}

main()
  .catch(e => { console.error('Import failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

### Key patterns
- **Resolve company by orgNr**: `prisma.company.findUnique({ where: { orgNr } })`
- **PersonKey normalization**: lowercase, NFD decompose, strip diacritics, replace spaces with hyphens
- **Run scripts**: `npx tsx scripts/script-name.ts`
- **Full import chain**: `npm run db:import`

### Import script inventory
| Script | Models | npm command |
|---|---|---|
| `import-ts-data.ts` | Thesis, Report | `db:import:ts` |
| `import-research-docs.ts` | Document | `db:import:docs` |
| `import-root-docs.ts` | Document | `db:import:root` |
| `import-external-sources.ts` | SourceDoc, Document | `db:import:external` |
| `import-company-data.ts` | Company, Financial, Shareholder, BoardMember, Subsidy, CompanyProperty | `db:import:companies` |
| `import-company-ownership.ts` | CompanyOwnership, BusinessRelationship | `db:import:ownership` |
| `import-person-profiles.ts` | PersonProfile | `db:import:persons` |
| `import-actors.ts` | Actor, ActorContact, ActorRelationship | `db:import:actors` |
| `import-transcripts.ts` | Document | `db:import:transcripts` |
| `import-session5-supply-chain.ts` | Company, CompanyProperty, CompanyOwnership, BusinessRelationship | `db:import:session5` |
| `import-horeca-companies.ts` | Company, CompanyOwnership, BusinessRelationship | `db:import:horeca` |
| `import-asko-corporate-tree.ts` | Company, CompanyFinancial, CompanyOwnership, CompanyProperty, BoardMember, PersonProfile | `db:import:asko` |

---

## Graph System

`src/lib/queries/graph.ts` provides the knowledge graph:

- `GraphNode` types: document, insight, thesis, company, source, actor, person, property
- `GraphEdge` types: refType, insight-ref, company-ref, actor-ref, company-link, thesis-doc, subsidiary/joint-venture/minority-stake, supplier/buyer/distributor/etc, person-role, owns-property, leases-property
- `getFullGraph()` returns all nodes and edges
- `getDocumentGraph(id)` returns a document-centered subgraph
- Visualized in `src/components/charts/KnowledgeGraph.tsx` using react-force-graph-2d

---

## Current Record Counts (as of Session 10 consolidation)

| Entity | Count |
|---|---|
| Companies | 89 (NO:30+8 session5+15 ASKO+6 HORECA, SE:6, DK:6, FI:6, IS:3, HORECA:7 non-NO) |
| CompanyFinancial | 219 (208 + 11 ASKO) |
| Actors | 84 (76 + 8 HORECA) |
| Documents | 394 |
| Theses | 32 |
| Reports | 61 |
| Source Docs | 126 |
| Insights | 86 (81 + 5 HORECA) |
| CompanyOwnership | 34 (10 + 4 HORECA + 15 ASKO + NorgesGruppen→ASKO 5) |
| CompanyProperty | 119 (109 + 10 ASKO warehouses) |
| BusinessRelationship | 73 (68 + 5 HORECA) |
| CountryMetric | 243 |
| BoardMembers | 425 (418 + 7 ASKO Norge) |
| PersonProfile | 34 (31 + 3 ASKO key people) |

---

## Deep Research Pipeline

See `DEEP-RESEARCH-PLAN.md` for the full 10-session plan.

**Status**: Sessions 1-10 complete.

Each session should use subagents (Agent tool) for parallel research. Data should be written into the import scripts as typed arrays, then run to populate the database.

### When adding new companies
1. Create a new company record with orgNr from Bronnoysund
2. Use `country` field for non-Norwegian companies (SE, DK, FI, IS)
3. Add financial data, shareholders, board members as sub-arrays
4. If the company has a parent, add a CompanyOwnership record
5. If the company has key properties, add CompanyProperty records
6. If there are inter-company relationships, add BusinessRelationship records

### When adding person profiles
1. Use `normalizePersonKey(name)` for the personKey
2. Include all known roles with companyId references
3. Tag interlocking directors with 'interlocking-director'

---

## MCP Servers Available

- **offentligdata**: Norwegian company/person registry data. Use `organisasjonsnummer_for_selskap` to find orgNr.
- **PubMed**: Academic article search, metadata, full text
- **Notion**: Project management integration
- **Figma**: Design context
- **Google Drive**: Document search

---

## Code Conventions

- TypeScript strict, `type` over `interface`
- 2-space indent, single quotes
- camelCase vars/functions, PascalCase types/components, UPPER_SNAKE constants
- Prisma upserts for idempotent imports
- No comments unless logic is non-obvious
- No documentation files unless requested
