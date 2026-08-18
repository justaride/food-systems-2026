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

## Candidate-history boundary

Candidate history follows the [autonomous analysis contract](../knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md), not the idempotent import pattern above. Use only `src/lib/knowledge/candidate-analysis-writer.ts` for `CandidateAnalysisRun` and related append-only candidate events. Never use generic upsert or update for candidate history; never delete or use raw SQL against it.

Candidate writes remain `candidate` only. They must not create or modify human review, canonical data, publication, coverage or target-promotion records.

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
