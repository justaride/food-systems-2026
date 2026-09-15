# Source-linked wiki pilot: two questions, one working correction loop

Status: **internal candidate preview**, built 15 September 2026. No human review,
canonical data, coverage or publication approval is created by this work.
Base repository commit: `06013339a6dcd5920ad5075c6f9c02b48e303040`.

## Read the actual explanations

- [Norwegian retail concentration, 2024](../../wiki/pilots/source-linked-v1/releases/fed44be167006437b779b9587fd827da030eb705246270fcd8d127c6ff42f649/norway-retail-2024.md): a bounded historical calculation from the competition authority's revenue shares.
- [From grain reserves to meals](../../wiki/pilots/source-linked-v1/releases/fed44be167006437b779b9587fd827da030eb705246270fcd8d127c6ff42f649/grain-to-meals.md): observed stock versus targets and contracts, programme organisation, the conversion chain, competence, counterarguments and explicit evidence gaps.

These links identify the initial immutable candidate release, not an always-current
page. `knowledge/wiki/pilots/source-linked-v1/current.json` selects the latest
written release. Historical files are retained. Use the checked query command for
a current-input answer rather than treating an old Markdown link as current.

## What is implemented

A dependency-free TypeScript compiler consumes [input.v1.json](input.v1.json) and
creates source-linked Markdown pages and a content-addressed source/claim snapshot.
It supports 2 topics, 6 source records, 7 evidence records, 13 claims, 7 bounded gaps
and 16 registered questions. Twelve claims are evidence-linked candidates; the
annual-report inventory claim is blocked. These are pilot counts, not corpus coverage.

The compiler binds claims to hashes of **project-authored extraction records and
source metadata**. A changed record invalidates the bound claim and its dependent
interpretations until an explicit new candidate binding is supplied. Rebinding
is not factual approval. An impact preview lists affected claims, topics and questions.

The checked query refuses mismatched periods and evidence kinds, stale generated
outputs, tampered release files, withdrawn or inaccessible sources, missing numeric
inputs, historical/disputed claims and every request for external use. It reconstructs
HHI and CR3 from rounded revenue shares without confusing percentages and indices.

`candidate_linked` means dependency and record-binding checks pass. It does **not**
mean the source entails the claim, the research is exhaustive, or an expert reviewed it.
Inferences are explicitly labelled; their citations identify premises, not empirical
proof of the inference. `partial` preserves an explanation alongside its open gaps.

## Run in an existing repository checkout

The repository already uses `tsx`. From its root, with its dependencies installed:

```bash
# Tests: also included by the repository's normal npm test discovery.
node --import=tsx --test tests/lib/source-linked-pilot.test.ts

# No writes by default: inspect candidate changes first.
npx --no-install tsx scripts/knowledge/source-linked-pilot.ts --as-of=2026-09-15

# Create a new candidate release only; never changes the database or production.
npx --no-install tsx scripts/knowledge/source-linked-pilot.ts --as-of=2026-09-15 --write

# Verify current input, compiler hash, as-of date and every generated file.
npx --no-install tsx scripts/knowledge/source-linked-pilot.ts --as-of=2026-09-15 --check

# The fixed registry is not a general-purpose language model or free-text search.
npx --no-install tsx scripts/knowledge/source-linked-pilot.ts --as-of=2026-09-15 --question=retail-hhi
npx --no-install tsx scripts/knowledge/source-linked-pilot.ts --as-of=2026-09-15 --question=grain-chain
npx --no-install tsx scripts/knowledge/source-linked-pilot.ts --as-of=2026-09-15 --question=grain-days
```

The as-of argument is mandatory: it is the evaluation date, not evidence of fresh
source access. Changing it does not change the dates of observations or source reads.
After the proposed source recheck date, linked claims become stale. The compiler
makes **no network requests** and cannot notice an upstream website changing by
itself. A source read and recorded evidence update are separate research steps.

## Correction experiment

Use a throwaway checkout or a test fixture; never invent revised figures in real data.
The tests demonstrate both halves of correction: a changed value with its old binding
blocks the answer; an explicitly rebound candidate recomputes its number. They also
test transitive impact, target-versus-stock confusion, period mismatches, missing
values, history retention, preserved human notes, compiler drift and tampering.

A production correction still requires reading the new source, recording the exact
locator and limits, inspecting the affected explanations and completing the required
review. This pilot has no auto-approval operation. Keep human notes in a separate
`notes.md` beside `current.json`; the generator never writes that file. Generated
release pages are wholly machine-owned and must not be edited by hand.

## Evidence boundary of the grain explanation

Five source records are first-party leads, and A1 is explicitly an existing internal
synthesis. The agency's HTML sources were opened for this pass. The 2025 annual-report
PDF could not be retrieved by the browsing tools because of response-size limits.
A1's inherited 30,000-tonne end-2025 candidate is retained with its page locator, but
blocked here pending direct inspection; that access failure does not disprove or
retract A1. The directly read 15,000-tonne end-2024 observation is labelled historical,
not presented as the latest inventory. No source bytes are archived by this pilot.

Current September 2026 inventory, disruption-specific milling throughput, release
lead time, staffing/competence evidence and delivered-meal duration remain unknown.
The chain explanation is a candidate mechanism, not a simulated or demonstrated
crisis outcome. The gap register names the evidence needed and the bounded search,
without claiming that data do not exist anywhere.

## Integration boundary

This is a file-backed preview adapter, **not** a replacement for the existing candidate
history writer or canonical knowledge-object schema. It does not import into Prisma,
write review receipts, alter existing claims, update the Obsidian vault, change app/MCP
retrieval, deploy a UI or implement the entire compiled-wiki operating contract.
No existing research or canonical status file is rewritten. Only the wiki index gains
a candidate-pilot entry point. Connecting the existing typed evidence authority to
this compiler is a later, separately verified integration.

## Verification performed here

- Isolated strict TypeScript compilation against Node types: passed.
- Node test runner: **26 tests passed**, including all 16 real registered-question boundaries.
- CLI dry run: produced no release; explicit write followed by repeated write and check: passed.
- Current-data question checks: HHI/CR3 available as historical candidates; current
  grain inventory and delivery days unknown; inaccessible annual-report claim blocked.
- No live database, private archive, complete application test suite, repo-wide lint,
  application build, deployment or independent human review was exercised locally.
  The execution environment could not resolve GitHub for a full clone; repository
  reads and proposed branch writes use the authorised connector.

The reusable deliverable is a tested candidate source-to-answer loop plus a substantive
first explanation—not a claim that the entire knowledge base is now operational.
