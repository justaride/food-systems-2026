# Food Systems 2026 knowledge constitution

Status: proposed foundation; awaiting authorized review

Version: 1.0.0

Proposal date: 2026-07-26

Audience: internal until an authorized review changes the relevant evidence records

## 1. Purpose

Food Systems 2026 shall maintain a durable, compounding knowledge system for how Nordic food systems function, change and distribute value, power, risk and outcomes.

The system must make four things separately visible:

1. what is known;
2. what evidence supports it;
3. what is uncertain, disputed or stale;
4. what has not yet been assessed or cannot currently be measured.

“Complete” means complete against an explicit scope contract. It never means omniscient, and it never follows from note volume, graph density, source count or a green structural check.

## 2. Scope contract

The mandatory Nordic political geography comprises Norway, Sweden, Denmark, Finland, Iceland, the Faroe Islands, Greenland and Åland. Sápmi is assessed as a separate, overlapping, cross-border Indigenous geography rather than treated as a ninth political unit or a footnote.

The political-Nordic macro coverage unit is:

```text
political geography × explicit value-chain function × analytical domain
```

Sápmi uses a separate, overlapping profile with the same analytical axes. Its cells are never added to political-Nordic totals. Every cell must eventually state represented, missing and not-applicable commodities, actors, flows, outcomes and geographies; period and system boundary; evidence and review state; limitations; next action; owner; and monitoring cadence.

The core grid is tier 1, not the finish line. A cell that contains material spatial, commodity, actor, flow, outcome or temporal variation must declare required tier-2 child cells. Tier 3 contains the underlying observations, claims, measurements and relationships. A tier-1 cell cannot be complete for a readiness profile while required child dimensions remain merely implicit.

The system also records EU/EEA, Arctic, Baltic and global dependencies when they materially affect a Nordic cell. A Norway proxy may never be rendered as Nordic coverage.

The thirteen existing Obsidian fields remain curated navigation views. They are not the canonical ontology because they mix stages, analytical domains, geography, governance and evidence method.

## 3. Authority and truth layers

Authority is field-specific, not a single folder hierarchy:

1. **Raw evidence authority** — immutable source bytes or snapshots, hashes, manifests and legal/access metadata in approved artifact storage or `research/` metadata.
2. **Structured evidence authority** — typed source, citation, claim, measurement, relationship, appraisal and review records in PostgreSQL/Prisma.
3. **Compiled knowledge authority** — deterministic Markdown synthesis that resolves factual statements to stable claim and source identities.
4. **Presentation authority** — Obsidian maps, canvases, the application, MCP responses and exports as projections of the layers above.
5. **Operational-status authority** — the completion register and approved work queues for delivery state, gates and next actions.
6. **Scope authority** — this constitution, ontology and coverage-cell definitions.

No presentation, synthesis or status document is primary evidence for an external factual claim.

## 4. Identity rules

- Machine identities are immutable; labels and paths may change.
- A filename or Obsidian basename is never sufficient identity.
- Renames preserve the ID and create a redirect record.
- Company identity uses a verified organization number where available; research constructs use an explicit research namespace.
- Person identity uses a stable `personKey` after identity review.
- Claims, sources, citations, concepts, coverage cells and assessments receive persistent IDs.
- Entity deduplication happens in the authoritative evidence layer before generated projections are merged.

## 5. Evidence rules

The repository [source-attribution policy](../.claude/source-attribution-policy.md) remains binding.

- Observed, verified, citable, complete and externally publishable are distinct states.
- Every factual claim requires a named source and exact locator, unless it is explicitly blocked as unsourced.
- A quantified statement additionally requires geography, period, unit, numerator, denominator or universe, method and system boundary.
- `exhaustive` requires a frozen universe definition and a defensible enumeration method. A target estimate or run floor is not exhaustive.
- Academic, causal, intervention-effect, health and environmental-effect claims require reviewed appraisal and explicit limitations before external use.
- Negative findings require a documented search boundary, sources checked, an as-of date and a recheck date. Unknown never renders as zero.
- Contradictory claims coexist through explicit `supports`, `challenges`, `contradicts` or `supersedes` relations; compilers do not silently overwrite them.
- Machine ingestion cannot promote human review, citation readiness or external eligibility.
- A compiled page cannot cite itself or another synthesis as a substitute for missing primary support.

## 6. Coverage semantics

Coverage is a vector, not a percentage. Each assessment records at least:

- scope state;
- inventory state;
- knowledge depth;
- verification state;
- citation readiness;
- appraisal state;
- freshness;
- temporal depth;
- archive durability;
- confidence;
- gap route;
- workflow stage.

`complete_for_profile` is computed against a named readiness profile. It is never manually asserted or averaged across unrelated dimensions.

The initial macro grids are deliberately `unassessed`. The thirteen legacy fields are registered in separate political-Nordic and Sápmi migration profiles, but registration is not an assessment of their subject-matter coverage. Artifacts and evidence must be mapped cell by cell before any promotion.

## 7. Compiled-wiki rules

The compiled wiki follows [the compiled-wiki contract](COMPILED-WIKI-CONTRACT.md).

- Raw sources are immutable inputs.
- Compilation reconciles a source across every affected claim, entity, concept, geography, comparison and synthesis page.
- Compilation is deterministic and idempotent.
- Human-owned sections are never overwritten.
- Valuable query results may return as draft syntheses, but they do not become sources or claim-ready without the normal evidence gates.
- Every applied ingest appends a machine receipt and a human-readable log entry.

## 8. Obsidian, database, app and MCP boundaries

- PostgreSQL/Prisma is the eventual canonical store for typed entities, claims, measurements, relations, assessments, reviews and monitoring rules.
- Git Markdown is the canonical compiled explanatory layer.
- Obsidian is the human/LLM knowledge IDE and visual browser.
- The application and MCP are query and delivery surfaces.
- The existing 786-note vault is preserved during migration. No mass rename, re-foldering or deletion occurs before stable IDs, redirects and parity checks exist.

## 9. Indigenous and human evidence

Sápmi, Indigenous knowledge, producer experience, worker experience, household experience and partner validation require an explicit human-evidence route. Desk research may identify questions and sources; it cannot substitute for consented participation, rights-holder interpretation or named review.

Privacy, consent, licensing, safety and legal gates remain independent of technical completeness.

## 10. Change control

- Ontology changes require a version bump, migration note and compatibility check.
- Coverage assessments become append-only observations when a baseline is formally adopted. Before adoption they are explicitly draft proposals. After adoption, corrections require content-addressed events that supersede earlier assessments; they do not erase history.
- Human review receipts are immutable.
- Every compiler or generator writes its version and produces a deterministic dry-run diff.
- Retiring a page requires zero unresolved inbound references, redirect coverage, parity validation and human approval.
- External publication requires the repository’s claim, source, appraisal, privacy and approval gates in addition to passing this contract.

## 11. Completion definition

The knowledge foundation may be declared operational only when:

1. every expected core cell has an explicit assessment or remains visibly `unassessed`;
2. every assessed cell has evidence, limits, next action, owner and review cadence;
3. every factual compiled statement resolves to stable claim and source records;
4. contradictions, staleness and missing evidence are visible queues;
5. Nordic and territorial comparisons disclose represented and missing geographies;
6. generators are deterministic and preserve human work;
7. no internal navigation milestone is represented as external evidence readiness.
