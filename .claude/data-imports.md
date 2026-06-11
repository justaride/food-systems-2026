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
- Run the full approved import chain with `npm run db:import:full`
- Treat `npm run db:import` as the smaller legacy/core seed chain; it does not include the later konserntre-, HORECA-, register-, Nordic-, or April 2026 imports
- Run `npm run db:audit` after major import changes when you need an integrity check
- Prefer Prisma upserts so imports stay idempotent
- Run `npm run db:backfill:financials-brreg` to dry-run BRREG Regnskapsregisteret financial backfill; run `npm run db:backfill:financials-brreg:apply` to upsert `CompanyFinancial` rows and mark explicit missing reasons
- For company entities, check [Company Registry](company-registry.md) before adding new records

## Full Approved Chain

Use `npm run db:import:full` when a DB needs the complete approved org/company corpus. The command delegates to `db:import:approved-corpus`, then writes reconciliation artifacts and regenerates konsern coverage:

1. Core corpus: thesis/report data, research docs, root docs, external/source docs, barekraft sources, company data, ownership, person profiles, actors, transcripts, market metrics.
2. Relationship and deepening imports: session 5, session 10, ASKO, NorgesGruppen, Coop, Reitan, Orkla, Nortura, TINE, Felleskjopet, Mowi, SalMar, Leroy, Austevoll/seafood holdings, BAMA, Kavli, HORECA, April 2026 research, Nordic deepening, remaining deepening.
3. Register and intake imports: landbruksregister, produksjonstilskudd, akvakulturregister, akvakultursoknader, leveransedata, food process intake, company extraction candidates.
4. Verification/artifacts: `db:verify`, `db:reconcile:imports:strict`, and `audit:konsern`.

`db:import:fiskehelse` is not part of `db:import:full` because it requires BarentsWatch API credentials (`BARENTSWATCH_CLIENT_ID` and `BARENTSWATCH_CLIENT_SECRET`) and does not add org.nr. to the import corpus. Run it separately in environments that have those secrets.

Post-run artifacts:

- `data/import-reconciliation.json` compares static org.nr. references in `scripts/import-*.ts` against the `Company` table and separates loaded, missing, and explicitly excepted rows per script.
- `data/konsern-tree-size-expectations.json` is the checked-in expectation table for konsern `treeSize`, derived from static `parentOrgNr -> childOrgNr` ownership links in the import corpus.
- `data/konsern-coverage.json` is regenerated from the DB and should match the checked-in tree-size expectations unless an intentional exception is documented in the PR.

## Import Script Inventory

| Script | Models | npm command |
|---|---|---|
| `reconcile-import-corpus.ts` | Audit artifact only: `Company` lookup plus static import-corpus/org.nr. parser | `db:reconcile:imports` / `db:reconcile:imports:strict` |
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
| `backfill-financials-brreg.ts` | `CompanyFinancial` upsert from BRREG Regnskapsregisteret plus `Company.metadata.financials.missingReason` markers | `db:backfill:financials-brreg` / `db:backfill:financials-brreg:apply` |

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
