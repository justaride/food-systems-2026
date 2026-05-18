# Data Imports

Use this guide for any task that creates, updates, or audits imported data.

## Import Script Pattern

All import scripts follow the same structure:

```typescript
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  for (const item of data) {
    await prisma.model.upsert({
      where: { uniqueKey: item.key },
      update: { ...fields },
      create: { ...fields },
    })
  }
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

## Key Patterns

- Resolve companies by `orgNr` with `prisma.company.findUnique({ where: { orgNr } })`
- Normalize `personKey` with lowercase text, NFD decomposition, diacritic stripping, and spaces replaced by hyphens
- Run one-off scripts with `npx tsx scripts/script-name.ts`
- Run the full import chain with `npm run db:import`
- Run `npm run db:audit` after major import changes when you need an integrity check
- Prefer Prisma upserts so imports stay idempotent
- For company entities, check [Company Registry](company-registry.md) before adding new records

## Source Attribution Requirements

New imports must follow [Source Attribution Policy](source-attribution-policy.md). The canonical pattern is:

1. Create or update the entity with a Prisma upsert.
2. Create or update one `SourceCitation` with `sourceClass`, `citationText`, `accessedAt`, and at least one locator (`url`, `localPath`, `sourceDocId`, or `documentId`) unless the source is an `internal_construct`.
3. Link the citation to the whole record or exact field with `FieldCitation`.
4. Set verification metadata only when the source actually proves the field being written.

Use `scripts/lib/import-helpers.ts` for new DB-writing import paths:

```typescript
await upsertWithCitation(
  prisma,
  'Company',
  tx => tx.company.upsert({
    where: { orgNr: item.orgNr },
    update: item.companyData,
    create: item.companyData,
  }),
  {
    sourceClass: 'registry_snapshot',
    citationText: item.citationText,
    url: item.url,
    localPath: item.localPath,
    accessedAt: item.accessedAt,
    contentHash: item.sha256,
    captureMethod: 'api_snapshot',
    verificationStatus: 'machine_verified',
    confidence: 95,
  },
  ['legalForm', 'naceCode', 'employees', 'registryVerifiedAt'],
)
```

Rules for common source classes:

- `registry_snapshot`: use raw API/PDF/HTML snapshots saved under `research/evidence-pack/` with SHA-256 when possible.
- `primary`: use original reports, annual accounts, government decisions, regulations, or official datasets.
- `secondary`: use analysis/media only for claims the secondary source actually supports.
- `synthesis` and `internal_construct`: must explain the project-side method and should link to a document or local research note.
- `legacy_unsourced`: transition state only. Do not introduce it in new imports.

Do not use Brønnøysund entity snapshots for revenue or EBITDA unless the exact values are present in the response. Use annual reports, Regnskapsregisteret extracts, OffentligData financial statements, Proff where legally available, or another explicit accounting source.

For citation application packets generated from manual source checks, run the fail-closed preflight before any DB mutation:

```bash
npm run audit:citation-application-packet
npm run audit:citation-application-packet -- --approve-action=SH-BAMA-2024
```

The packet gate treats `apply_allowed=no` as a hard stop. If a blocked action ID is passed to `--approve-action`, the command exits non-zero and lists the refused approval. `conditional` only means "eligible for the next implementation step after the named value/name/model decision"; it does not override the source-attribution policy.

After import changes, run:

```bash
npm test
npm run db:audit
npm run audit:source-strings -- --baseline research/source-string-taxonomy-baseline.csv --fail-on-new-action-needed
```

## Import Script Inventory

| Script | Models | npm command |
|---|---|---|
| `import-ts-data.ts` | `Thesis`, `Report` | `db:import:ts` |
| `import-research-docs.ts` | `Document` | `db:import:docs` |
| `import-root-docs.ts` | `Document` | `db:import:root` |
| `import-external-sources.ts` | `SourceDoc`, `Document` | `db:import:external` |
| `import-company-data.ts` | `Company`, `CompanyFinancial`, `Shareholder`, `BoardMember`, `Subsidy`, `CompanyProperty` | `db:import:companies` |
| `import-company-ownership.ts` | `CompanyOwnership`, `BusinessRelationship` | `db:import:ownership` |
| `import-person-profiles.ts` | `PersonProfile` | `db:import:persons` |
| `import-actors.ts` | `Actor`, `ActorContact`, `ActorRelationship` | `db:import:actors` |
| `import-transcripts.ts` | `Document` | `db:import:transcripts` |
| `import-session5-supply-chain.ts` | `Company`, `CompanyProperty`, `CompanyOwnership`, `BusinessRelationship` | `db:import:session5` |
| `import-horeca-companies.ts` | `Company`, `CompanyOwnership`, `BusinessRelationship` | `db:import:horeca` |
| `import-asko-corporate-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `CompanyProperty`, `BoardMember`, `PersonProfile` | `db:import:asko` |
| `import-norgesgruppen-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:ng-tree` |
| `import-coop-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `CompanyProperty`, `BoardMember`, `PersonProfile` | `db:import:coop-tree` |
| `import-reitan-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:reitan-tree` |
| `import-orkla-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:orkla-tree` |
| `import-nortura-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember` | `db:import:nortura-tree` |
| `import-tine-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember` | `db:import:tine-tree` |
| `import-felleskjopet-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:fk-tree` |
| `import-mowi-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:mowi-tree` |
| `import-salmar-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:salmar-tree` |
| `import-leroy-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:leroy-tree` |
| `import-seafood-holdings-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:seafood-holdings` |
| `import-bama-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:bama-tree` |
| `import-kavli-tree.ts` | `Company`, `CompanyFinancial`, `CompanyOwnership`, `BoardMember`, `PersonProfile` | `db:import:kavli-tree` |
| `import-barekraft-sources.ts` | `Document`, `SourceDoc` (full-text SEC-MAT + SA-02) | `db:import:barekraft` |
| `import-remaining-deep.ts` | `BoardMember`, `PersonProfile` | `db:import:remaining-deep` |
| `import-nordic-deepening.ts` | `Company`, `CompanyOwnership`, `PersonProfile`, `BusinessRelationship` | `db:import:nordic-deep` |
| `import-research-20260420.ts` | `Company`, `CompanyOwnership`, `CompanyProperty`, `BusinessRelationship`, `PersonProfile` (April 2026 forskningsrunde: eiendomsgrener, alt-distribusjon, HORECA-grossister, failed entrants, benchmarks) | `db:import:research-20260420` |
| `preview-food-research-process-intake.ts` | Ingen DB-skriving. Genererer `review.csv`, `manifest.json` og `SUMMARY.md` for manuell vurdering av `research/arkiv-sortert/` | `research:intake:food-process:preview` |
| `import-food-research-process-intake.ts` | `Document` (staged intake fra godkjente rader i review-CSV) | `db:import:food-process-intake` |
| `fix-nordic-orgnr.ts` | `Company` orgNr migration | `db:fix:nordic-orgnr` |

## Adding New Companies

1. Create the `Company` record with a real org number or country-prefixed identifier.
2. Set `country` for non-Norwegian companies (`SE`, `DK`, `FI`, `IS`).
3. Add financial data, shareholders, and board members as typed sub-arrays where relevant.
4. Add a `CompanyOwnership` record when the company has a parent.
5. Add `CompanyProperty` records for key real estate or operational assets.
6. Add `BusinessRelationship` records for supplier, buyer, distributor, JV, or self-dealing links.

## Adding Person Profiles

1. Generate `personKey` with the same normalization used by the existing import scripts.
2. Include all known roles with `companyId` references whenever possible.
3. Tag interlocking directors with `interlocking-director`.
