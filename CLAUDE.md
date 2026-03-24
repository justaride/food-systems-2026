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
-- ASKO system (NorgesGruppen logistics) --
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
-- NorgesGruppen tree (Sprint 1) --
819731322 | NorgesGruppen ASA      | retail      | family (Johannson 74.4%)
975959171 | Kiwi Norge AS          | retail      | family (NG 100%)
985131406 | Kiwi Minidrift AS      | retail      | family (Kiwi Norge 100%)
977066727 | MENY AS                | retail      | family (NG 100%)
989578790 | Meny Butikkdrift AS    | retail      | family (MENY 100%)
977263646 | Kjopmannshuset Norge AS| retail      | family (NG 100%)
995915820 | Kjopmannshuset Butikkdrift AS | retail | family (Kjopmannshuset 100%)
976769511 | NG Servicehandel AS    | retail      | family (NG 100%)
985402779 | Deli de Luca Norge AS  | retail      | family (NG Servicehandel 100%)
882578402 | NG Detalj AS           | retail      | family (NG 100%)
997732812 | NG Merkevare AS        | processing  | family (NG 100%)
913283805 | Joh. Johannson Kaffe AS| processing  | family (NG Merkevare 100%)
914183332 | Bakehuset AS           | processing  | family (NG Merkevare 100%)
983392970 | NG Fellestjenester AS  | retail      | family (NG 100%)
971047917 | NorgesGruppen Data AS  | retail      | family (NG Fellestjenester 100%)
883743512 | NorgesGruppen Regnskap AS | retail   | family (NG Fellestjenester 100%)
997747054 | NG Eiendom Holding AS  | retail      | family (NG 100%)
976542223 | NorgesGruppen Eiendom AS | retail    | family (NG Eiendom Holding 100%)
989009001 | NG Eiendomskapital AS  | retail      | family (NG Eiendom Holding 100%)
995666553 | NG Eiendomsutvikling AS| retail      | family (NG Eiendom 100%)
920341659 | NG Finans Holding AS   | retail      | family (NG 100%)
920428959 | NorgesGruppen Finans AS| retail      | family (NG Finans Holding 100%)
885316522 | Unil AS                | processing  | family (NG Merkevare 100%)
930258008 | Storcash Norge AS      | foodservice | family (ASKO Norge 100%)
-- Coop system (Sprint 1) --
936560288 | Coop Norge SA          | retail      | cooperative
988445177 | Coop Norge Eiendom AS  | retail      | cooperative (Coop Norge 100%)
931186744 | Norsk Butikkdrift AS   | retail      | cooperative (Coop Norge 100%)
882722422 | Coop Norge Kaffe AS    | processing  | cooperative (Coop Norge 100%)
919784725 | Coop Norge Trondheim Eiendom AS | retail | cooperative (Eiendom 100%)
919784814 | Coop Norge Langhus Eiendom AS | retail | cooperative (Eiendom 100%)
989085557 | Coop Norge Stavanger Eiendom AS | retail | cooperative (Eiendom 100%)
997800419 | Coop Norge Tromsoe Eiendom AS | retail | cooperative (Eiendom 100%)
819784922 | Coop Norge Stavanger Eiendom II AS | retail | cooperative (Eiendom 100%)
938786054 | Coop Midt-Norge SA     | retail      | cooperative (member of Coop Norge)
948432617 | Coop Oest SA           | retail      | cooperative (member of Coop Norge)
966833300 | Coop Soervest SA       | retail      | cooperative (member of Coop Norge)
942763654 | Coop Nordvest SA       | retail      | cooperative (member of Coop Norge)
938497257 | Coop Nord SA           | retail      | cooperative (member of Coop Norge)
982594421 | Coop Hordaland SA      | retail      | cooperative (member of Coop Norge)
946231819 | Coop Nordland SA       | retail      | cooperative (member of Coop Norge)
979419287 | Coop Innlandet SA      | retail      | cooperative (member of Coop Norge)
953452626 | Coop Oekonom SA        | retail      | cooperative (member of Coop Norge)
950264799 | Coop Vestviken SA      | retail      | cooperative (member of Coop Norge)
981397568 | Coop Finnmark SA       | retail      | cooperative (member of Coop Norge)
-- Reitan system (Sprint 1) --
912609987 | Reitan AS              | retail      | family (Odd Reitan 33.33% A-shares)
914526647 | Reitan Retail AS       | retail      | family (Reitan AS 100%)
883409442 | REMA 1000 AS           | retail      | family (Reitan Retail 100%)
982254604 | REMA 1000 Norge AS     | retail      | family (REMA 1000 AS 100%)
983415652 | Reitan Convenience AS  | retail      | family (Reitan Retail 100%)
983415660 | Reitan Convenience Norway AS | retail | family (Reitan Convenience 100%)
988247111 | Uno-X Mobility AS      | retail      | family (Reitan Retail 100%)
921757131 | Uno-X Mobility Norge AS| retail      | family (Uno-X Mobility 100%)
928211398 | Uno-X E-Mobility Norge AS | retail   | family (Uno-X Mobility 100%)
917114684 | Reitan Kapital AS      | retail      | family (Reitan AS 100%)
915994415 | Reitan Eiendom AS      | retail      | family (Reitan AS 72.23%)
915990487 | Odd Reitan Private Holding AS | retail | family (Odd Reitan 100%)
-- Orkla system (Sprint 2) --
910747711 | Orkla ASA              | processing  | family (Hagen/Canica 25.1%)
930097705 | Orkla Foods AS         | processing  | family (Orkla 100%)
916170858 | Orkla Foods Norge AS   | processing  | family (Orkla Foods 100%)
930097748 | Orkla Snacks AS        | processing  | family (Orkla 100%)
940712580 | Orkla Snacks Norge AS  | processing  | family (Orkla Snacks 100%)
911161419 | Orkla Food Ingredients AS | processing | family (Orkla 100%)
930097683 | Orkla Health Holding AS| processing  | family (Orkla 100%)
986519904 | Orkla Health AS        | processing  | family (Health Holding 100%)
911161230 | Orkla Home and Personal Care AS | processing | family (Orkla 100%)
996888142 | Orkla House Care Norge AS | processing | family (HPC 100%)
912692094 | Pierre Robert Group AS | processing  | family (Orkla 100%)
932176076 | Orkla Eiendom AS       | processing  | family (Orkla 100%)
991742255 | Orkla IT AS            | processing  | family (Orkla 100%)
-- Nortura system (Sprint 2) --
938752648 | Nortura SA             | processing  | cooperative
995643316 | Norilia AS             | processing  | cooperative (Nortura 100%)
997754123 | Norfersk AS            | processing  | cooperative (Nortura 100%)
885209432 | Prima Slakt AS         | processing  | cooperative (Nortura 100%)
962977006 | Norsk Dyremat AS       | processing  | cooperative (Nortura 100%)
921042434 | Biosirk Norge AS       | processing  | cooperative (Nortura 67%)
976502744 | Fjordkjoekken AS       | processing  | cooperative (Nortura 56.5%)
919117060 | Animalia AS            | research    | cooperative (Nortura 66%)
992318899 | Noridane Foods AS      | processing  | cooperative (Nortura 65%)
936661386 | Fjordland AS           | processing  | JV (TINE 51.1%, Nortura 38.9%, Hoff 10%)
987390689 | Telespor AS            | inputs      | cooperative (Nortura 99.7%)
913755855 | NorPri AS              | processing  | cooperative (Nortura 49%)
-- TINE system (Sprint 2) --
947942638 | TINE SA                | processing  | cooperative
984460198 | Diplom-Is AS           | processing  | cooperative (TINE 100%)
821186382 | Mimiro Holding AS      | inputs      | cooperative (TINE 56.6%)
921761929 | Kukraft AS             | inputs      | cooperative (TINE 100%)
-- Felleskjøpet system (Sprint 2) --
911608103 | Felleskjopet Agri SA   | inputs      | cooperative
885719422 | Norgesmollene AS       | processing  | cooperative (FK 100%)
958457952 | Cernova AS             | processing  | cooperative (FK 100%)
912589455 | Cernova Trading AS     | processing  | cooperative (Cernova 100%)
916329717 | Strand Unikorn AS      | inputs      | cooperative (FK 100%)
998232058 | Felleskjoepet Forutvikling AS | research | cooperative (FK 100%)
975871096 | Norgesfor AS           | inputs      | cooperative (FK 100%)
915442552 | Felleskjoepet Rogaland Agder SA | inputs | cooperative (sister)
975856844 | Fiskaa Molle AS        | inputs      | cooperative (FKRA 100%)
-- Mowi system (Sprint 3) --
964118191 | Mowi ASA               | seafood     | listed (Fredriksen 14.4%)
921668236 | Mowi Seawater Norway AS| seafood     | listed (Mowi 100%)
916146337 | Mowi Markets Norway AS | seafood     | listed (Mowi 100%)
911610744 | Mowi Feed AS           | inputs      | listed (Mowi 100%)
919441879 | Mowi Norway FoU AS     | research    | listed (Mowi 100%)
-- SalMar system (Sprint 3) --
960514718 | SalMar ASA             | seafood     | family (Witzoee/Kverva 44.3%)
966840528 | SalMar Farming AS      | seafood     | listed (SalMar 100%)
952662813 | SalmoNor AS            | seafood     | listed (SalMar 100%)
919818824 | Kverva AS              | seafood     | family (Witzoee 92.5%)
960329856 | Kverva Industrier AS   | seafood     | family (Kverva 100%)
-- Leroey system (Sprint 3) --
975350940 | Leroey Seafood Group ASA| seafood    | listed (Austevoll 52.7%)
914353561 | Hallvard Leroey AS     | seafood     | listed (LSG 100%)
985940460 | Leroey Aurora AS       | seafood     | listed (LSG 100%)
985848718 | Leroey Midt AS         | seafood     | listed (LSG 100%)
886813082 | Leroey Vest AS         | seafood     | listed (LSG 100%)
986392858 | Leroey Havfisk AS      | seafood     | listed (LSG 100%)
995548194 | Leroey Norway Seafoods AS | seafood  | listed (LSG 100%)
927894254 | Sjoetroll AS           | seafood     | listed (Leroey Vest 100%)
-- Austevoll/Moegster holding (Sprint 3) --
929975200 | Austevoll Seafood ASA  | seafood     | listed (Laco 55.55%)
937305354 | Laco AS                | seafood     | family (Moegster family)
-- BAMA system (Sprint 4) --
914224314 | BAMA Gruppen AS        | logistics   | family (NG 46%, REMA 20%, Banan 34%)
976565967 | BAMA Industri AS       | processing  | family (BAMA 100%)
995518333 | BAMA Storkjoekken AS   | foodservice | family (BAMA 100%)
965437150 | BAMA Logistikk AS      | logistics   | family (BAMA 100%)
995244071 | BAMA Pakkerier AS      | processing  | family (BAMA 100%)
959657769 | BAMA International AS  | logistics   | family (BAMA 100%)
981384016 | BAMA Blomster Holding AS| logistics  | family (BAMA 100%)
992714409 | BAMA Blomster Sourcing AS| logistics  | family (Blomster Holding 100%)
-- Kavli system (Sprint 4) --
913344162 | Kavli Holding AS       | processing  | foundation (O. Kavli Fond)
985461791 | Kavli Norge AS         | processing  | foundation (Kavli Holding 100%)
971142138 | O Kavli AS             | processing  | foundation (Kavli Norge 100%)
982423767 | Q-Meieriene AS         | processing  | foundation (Kavli Norge 100%)
-- Other Norwegian companies --
815664582 | Holdbart AS            | circular    | private
919702974 | Matsentralen Norge     | circular    | nonprofit
997898397 | Matvett AS             | circular    | private (NHO Mat og Drikke)
989278835 | Nofima AS              | research    | state (NFD 56.8%)
932256134 | Oda                    | retail      | private (Softbank/Kinnevik)
988044113 | Skretting AS           | inputs      | foreign (Nutreco/SHV 100%)
917203261 | Too Good To Go Norge AS| circular    | foreign (TGTG ApS, DK)
986228608 | Yara International ASA | inputs      | state (36.2%)
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
| `import-norgesgruppen-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:ng-tree` |
| `import-coop-tree.ts` | Company, CompanyFinancial, CompanyOwnership, CompanyProperty, BoardMember, PersonProfile | `db:import:coop-tree` |
| `import-reitan-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:reitan-tree` |
| `import-orkla-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:orkla-tree` |
| `import-nortura-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember | `db:import:nortura-tree` |
| `import-tine-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember | `db:import:tine-tree` |
| `import-felleskjopet-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:fk-tree` |
| `import-mowi-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:mowi-tree` |
| `import-salmar-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:salmar-tree` |
| `import-leroy-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:leroy-tree` |
| `import-seafood-holdings-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:seafood-holdings` |
| `import-bama-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:bama-tree` |
| `import-kavli-tree.ts` | Company, CompanyFinancial, CompanyOwnership, BoardMember, PersonProfile | `db:import:kavli-tree` |
| `import-remaining-deep.ts` | BoardMember, PersonProfile | `db:import:remaining-deep` |

---

## Graph System

`src/lib/queries/graph.ts` provides the knowledge graph:

- `GraphNode` types: document, insight, thesis, company, source, actor, person, property
- `GraphEdge` types: refType, insight-ref, company-ref, actor-ref, company-link, thesis-doc, subsidiary/joint-venture/minority-stake, supplier/buyer/distributor/etc, person-role, owns-property, leases-property
- `getFullGraph()` returns all nodes and edges
- `getDocumentGraph(id)` returns a document-centered subgraph
- Visualized in `src/components/charts/KnowledgeGraph.tsx` using react-force-graph-2d

---

## Current Record Counts (as of Sprint 4 — remaining deep)

| Entity | Count |
|---|---|
| Companies | 198 |
| CompanyFinancial | 314 |
| Actors | 84 |
| Documents | 394 |
| Theses | 32 |
| Reports | 61 |
| Source Docs | 126 |
| Insights | 86 |
| CompanyOwnership | 135 |
| CompanyProperty | 126 |
| BusinessRelationship | 73 |
| CountryMetric | 243 |
| BoardMembers | 614 (+33 HORECA boards: Compass Group, Sodexo, ISS, Servicegrossistene, 4Service) |
| PersonProfile | 140 (+5 new: Nofima CEO/styreleder, Yara styreleder, Skretting CEO, HORECA CEOs) |

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
