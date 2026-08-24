# Food Systems 2026

Knowledge and analysis platform for Norwegian and Nordic food systems, with structured research on actors, corporate ownership, supply chains, policy, circular practices, and evidence quality.

| Field | Value |
|---|---|
| **Status** | Active; controlled internal decision support and validation phase |
| **Last reviewed** | 2026-08-12 |
| **Canonical repository** | `justaride/food-systems-2026` |
| **Production site** | `https://food-systems.naturalstateproject.com` |
| **Deployment** | Coolify on Hetzner; this project must not be deployed through Vercel |
| **Working ownership** | Natural State and the NCH Food Transition Group; formal long-term ownership remains an open governance gate |
| **External publication** | Broad claims are not automatically publication-ready |
| **File location** | `.github/README.md`. GitHub renders this as the repository README. The repository root is deliberately kept free: a root `README.md` collides with the research-corpus locator, which resolves the corpus record named `README.md` to `research/README.md` and fails closed as `ambiguous_locator` when both exist. |

> [!IMPORTANT]
> The application is production-deployed, but deployment health is not the same as evidence quality or permission to publish. As of the controlled assessment dated 2026-08-11, internal decision support is **GO**, targeted validation is **conditional GO**, and broad external fact, person, outcome, partner, or commitment claims remain **NO-GO** until review, rights, governance, and publication gates are closed.

## Start here

Use these documents in this order:

1. [`docs/project/status/food-systems-completion-register-2026-07-15.md`](docs/project/status/food-systems-completion-register-2026-07-15.md) — canonical completion and status register
2. [`docs/project/status/food-systems-phase-readiness-2026-08-11.md`](docs/project/status/food-systems-phase-readiness-2026-08-11.md) — current readiness assessment and open gates
3. [`research/_status/information-gap-register-2026-08-11.jsonl`](research/_status/information-gap-register-2026-08-11.jsonl) — machine-readable work queue under the completion register
4. [`research/CITABLE-KNOWLEDGE-BASE-STATUS.md`](research/CITABLE-KNOWLEDGE-BASE-STATUS.md) — citable-knowledge status and verification sequence
5. [`CLAUDE.md`](CLAUDE.md) — project and agent operating context

Do not treat an older plan, status report, dashboard count, or generated artifact as a parallel source of truth when it conflicts with the completion register.

## Purpose and scope

The platform supports:

- mapping organizations, companies, ownership, and relationships
- exploring food production, retail, distribution, subsidies, and supply chains
- documenting circular-food-system practices and transition opportunities
- building source-linked research, insights, dossiers, and project profiles
- identifying evidence gaps rather than silently filling them with proxies
- supporting the Food Transition Group's internal prioritization and validation work

The platform does **not** by itself establish that:

- a company, person, project, or partner has been independently verified
- a reported outcome is causal, current, complete, or externally publishable
- a project dossier represents a pilot commitment, funding commitment, or partner approval
- database size, route health, or source reputation proves a claim
- the system is a fully automated Nordic food-systems observatory

## Current state

The current repository combines four capabilities:

1. a deployed Next.js knowledge application
2. a PostgreSQL/Prisma data model and controlled import workflows
3. a fail-closed evidence and claim-validation layer
4. a Nordic project landscape with explicit quality and coverage limits

The 2026-08-11 readiness review describes the technical platform and release chain as operational while governance, human review, rights, appraisal, external evaluation, and long-term operating ownership remain incomplete. Read the linked assessment before making a production, research, or publication decision.

## Quick start

### Prerequisites

- Node.js supported by the repository lockfile and deployment image
- npm
- PostgreSQL for database-backed development and imports

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

The committed [`.env.example`](.env.example) documents the required database variable:

| Variable | Required | Purpose |
|---|:---:|---|
| `DATABASE_URL` | Yes for database-backed routes and imports | Server-side PostgreSQL connection used by Prisma |

Never commit production credentials. Use the deployment secret store and a least-privilege database role.

### Common commands

```bash
npm run dev                       # Next.js development server
npm run lint                      # ESLint
npm test                          # Node/TypeScript test suite
npm run build                     # Prisma generate, DB-free metrics, Next.js build
npm run compute-metrics           # DB-free chart metrics used by the build
npm run compute-metrics:full      # DB-backed refresh and committed generated artifacts
npm run db:generate               # Generate Prisma client
npm run db:import                 # Full controlled import sequence
npm run knowledge:check           # Knowledge-foundation and corpus gates
npm run audit:citable             # Citable-knowledge audit
npm run gate:overclaim            # Overclaim/publication-language gate
npm run verify:platform-stack-main
```

`npm run build` must not depend on a live production database. Database-derived artifacts are refreshed separately and committed only after their relevant audits pass.

## Architecture

```text
src/app/                    Next.js routes and API surfaces
src/lib/                    application, evidence, data, and domain logic
prisma/                     PostgreSQL schema and migration history
scripts/                    metrics, imports, audits, release, and maintenance tools
research/                   source-linked research, evidence packs, and status ledgers
knowledge/                  corpus-processing and review artifacts
docs/project/               mandates, plans, references, status, and release receipts
public/data/                 committed generated datasets used by the application
mcp/                        Food Systems knowledge-base MCP server
tests/                      platform, data, evidence, MCP, and release tests
```

The application reads both database-backed records and committed generated artifacts. Import, appraisal, claim, source-locator, and review states must remain distinct throughout the pipeline.

## Data, provenance, and evidence boundaries

The project uses a fail-closed model:

```text
source or observation
  → identity and locator
  → extraction
  → appraisal
  → claim or field linkage
  → named review
  → controlled import/readback
  → completion-register update
```

A record may be collected, staged, extracted, imported, citable for internal context, reviewed, or externally publishable. These states are not interchangeable.

For source or public-facing work:

- read [`.claude/source-attribution-policy.md`](.claude/source-attribution-policy.md)
- preserve source identity, URL or archival locator, dates, and access context
- distinguish primary, official, independent, stakeholder, company, media, and internal sources
- record null findings and open gaps explicitly
- run the relevant citable and overclaim gates
- obtain rights, privacy, and qualified human review before external publication

## Privacy, rights, and publication

The repository can contain information about people, organizations, ownership, interviews, correspondence, research documents, and potentially restricted source material.

Before using or publishing such material:

- confirm the lawful basis, usage rights, and retention rule for the data class
- minimize personal data and avoid unnecessary profile claims
- preserve correction, retraction, and provenance history
- keep private recovery/acquisition material out of public artifacts
- use named reviewers for rights- or publication-sensitive decisions
- do not describe a candidate, dossier, or relationship as confirmed without its required evidence and review state

The open governance and publication requirements are tracked in the canonical completion and gap registers.

## Verification

Choose verification based on the change:

### Code and UI

```bash
npm run lint
npm test
npm run build
```

### Data and imports

Run the specific `db:import:*` or dry-run command, then the relevant database and source audits. Do not run broad imports against production without the documented operating procedure and a verified backup/restore path.

### Knowledge, claims, and publication

```bash
npm run knowledge:check
npm run audit:citable
npm run gate:overclaim
```

### Full platform gate

```bash
npm run verify:platform-stack-main
```

The full gate requires the environment and services documented by the project. A passing build alone is not production, database, evidence, or publication proof.

## Deployment and operations

The repository's operating instructions specify Coolify on Hetzner through the connected GitHub repository. Vercel is not a supported deployment target.

Production changes must preserve:

- exact commit-to-deployment traceability
- a build that does not need live production database access
- separate migration and runtime identities with least privilege
- database and generated-artifact readback
- backup and restore evidence
- explicit status receipts for code, database, knowledge, and open governance gates

Use current release and infrastructure documents under `docs/project/status/` and `docs/project/reference/`; do not copy secret values or private infrastructure identifiers into this README.

## MCP server

The repository includes a Food Systems knowledge-base MCP server:

```bash
npm run mcp:kb
npm run mcp:kb:test
npm run mcp:kb:acceptance
```

MCP availability does not bypass source, appraisal, rights, review, or publication gates.

## Maintenance rule

Update this README when the canonical status hierarchy, working ownership, publication boundary, production URL, supported deployment, runtime requirements, or full verification sequence changes. Keep detailed session notes, counts, release receipts, and dated assessments in their existing status documents rather than expanding this entry point.
