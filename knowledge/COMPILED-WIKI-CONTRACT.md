# Compiled-wiki operating contract

Version: 1.0.0

Status: design contract; the existing Obsidian generator does not yet implement this contract

## Model

The compiled wiki is a maintained explanatory layer between structured evidence and reader-facing tools. It follows the ingest → query → lint loop described in [Andrej Karpathy’s LLM Wiki sketch](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), adapted to the repository’s fail-closed evidence rules.

```text
raw source -> evidence extraction -> claim reconciliation -> compiled pages -> query
      ^                                                       |
      +--------------- lint, review and writeback ------------+
```

## Page classes

- `concept` — definition, boundaries, synonyms and related concepts;
- `entity` — stable actor, institution, person, place or infrastructure identity;
- `source` — immutable source identity, provenance, access/licensing state, hash and citation inventory;
- `claim` — exact proposition with evidence, contradiction and validity state;
- `observation` — a dated or period-bound measurement, stock or qualitative observation with method and boundary;
- `geography` — system synthesis for a country, territory, Sápmi or region;
- `stage` — value-chain process synthesis;
- `commodity` — commodity-system synthesis across stages and geographies;
- `flow` — a physical material or energy transfer with quantity, unit and boundary;
- `relationship` — ownership, control, information, contractual or human relationship without a fabricated commodity quantity;
- `stock` — material, biological, infrastructure or financial stock at a stated time and boundary;
- `policy` — instrument, law, institution and implementation record;
- `metric` — definition, unit, method, series and comparability limits, including prices, costs and margins;
- `case` — intervention or observed system change with realization and maturity state;
- `comparison` — harmonized multi-geography or multi-period analysis;
- `gap` — precise unknown, blocker, owner and closure route;
- `synthesis` — cross-page narrative that resolves to stable claims.

## Stable identity

Suggested identity forms:

```text
fs:company:<org-number>
fs:company:research:<key>
fs:person:<person-key>
fs:source:<source-id>
fs:citation:<citation-id>
fs:claim:<persistent-id>
fs:concept:<persistent-key>
fs:geo:<ontology-id>
fs:coverage:<cell-id>
```

Paths and titles are mutable display properties. Redirects resolve old paths to identities.

## Managed content

Before the current vault is compiled, its scalar-only frontmatter parser must be replaced with a full YAML parser. During migration, the existing `type`, `status`, `kilde` and `siterbarhet` fields remain available for dual-read compatibility.

The compiler may own only a named block:

```markdown
<!-- BEGIN COMPILED:fs-wiki-v1 -->
Generated content linked to stable claims and sources.
<!-- END COMPILED:fs-wiki-v1 -->

## Human review

## Notater
```

Everything outside its named block is human-owned. Byte-for-byte preservation is required.

## Ingest workflow

1. Register source identity, provenance, access metadata, license and immutable hash.
2. Deduplicate using DOI, canonical URL, file hash, registry identity or another approved stable key.
3. Extract claim and measurement candidates with exact locators.
4. Link evidence to existing claims or create explicit candidate claims.
5. Detect support, challenge, contradiction, supersession and scope differences.
6. Resolve the affected entities, concepts, geographies, stages, commodities, flows, comparisons, gaps and syntheses.
7. Produce a dry-run receipt listing semantic changes and gates.
8. Route ambiguity, sensitivity, causal interpretation and external-readiness changes to human review.
9. Apply atomically, append the receipt and log entry, then compile twice to prove idempotence.

## Query and writeback workflow

1. Read the generated index and coverage state.
2. Use broad search for discovery only.
3. Trace every factual response through claim and citation records.
4. Fail closed for an external audience when exact support or required appraisal is absent.
5. If a query produces durable new synthesis, file it as a draft page linked to the resolved claims and open questions.
6. Never treat query prose as a source or let it self-cite.

## Lint contract

Structural lint checks IDs, schemas, managed markers, normalized-name collisions, links, redirects, canvases and orphans.

Provenance lint checks exact claim-to-citation locators, synthesis-to-claim resolution, source identity and archive state.

Semantic lint checks contradictions, supersession cycles, duplicated claims, entity collisions, hidden scope changes and unsupported readiness promotion.

Freshness lint checks source age, validity periods, stale measurements, DB-export age and monitoring deadlines.

Coverage lint checks that every expected cell exists, unknowns remain explicit, and assessed cells have limits, next actions, owners and review dates.

Drift lint checks source hashes, manifest/page parity, generator versions and idempotence.

## Destructive-action boundary

The compiler may delete only an artifact carrying its own generator identity and only when no human-owned content exists. It cannot mass-rename, retire legacy pages or change external-readiness state without an approved migration receipt and human authorization.
