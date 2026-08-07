# Source-discovery contract

This contract makes the discovery protocol machine-readable without claiming that any search or research has been completed.

## Five separate states

The records keep five facts separate:

1. **Planned cell** — a geography × value-chain stage × analytical-domain combination exists in the declared search universe.
2. **Executed search** — an append-only run records one exact plan obligation: route × source system × source class × language × cell, including what was queried or navigated, when, by whom or what, and with which limits. A separate completion assessment binds the exact hashes of all required completed runs.
3. **Discovery candidate** — a result worth evaluating has been recorded, but it is not yet an acquired source or a factual claim.
4. **Formally received source** — a candidate is bound to an exact controlled acquisition receipt; database registration and identity verification have not happened here.
5. **Coverage claim** — deliberately absent from this layer. Every discovery record keeps coverage promotion off and the summary always reports zero coverage claims.

An empty ledger means no relevant event has been recorded. A planned or unexecuted cell therefore never counts as searched, and none of the first four states counts as evidence coverage.

## Declared universes

- `profile.canonical_political_macro`: 8 political reporting scopes × 33 value-chain stages × 23 domains = **6,072 planned cells**.
- `profile.canonical_sapmi_overlap_macro`: one separate, overlapping Sápmi scope × 33 stages × 23 domains = **759 planned cells**.

The two universes are non-additive. A Sápmi plan must carry a rights-holder governance record. Discovery v1 may record that an authorization receipt exists, but it cannot authenticate the rights holder or consent. It therefore fails closed: no Sápmi completion assessment can record `stopping_rule_met` until a later contract supplies externally verified authorization. This still has no coverage implication.

## Exact obligations and completion

Every plan must enumerate the full Cartesian set of its applicable routes, declared source systems, source classes, languages and cells. Every run binds exactly one obligation and exactly one route execution. A completed run must show complete pagination, positive inspection evidence, full inspection of the observed result set, captured response evidence or an explicit limitation, and no remaining action for that obligation.

Runs cannot assert global completion. Only a later `search_completion_assessed` event can record `stopping_rule_met`, and it must bind one exact, earlier, completed run hash for every obligation in the plan. Duplicate, missing, cross-plan or merely independent route/system/language sets fail closed.

## Files and integrity

The TypeScript contract is `src/lib/knowledge/source-discovery.ts`; its strict structural counterpart is `knowledge/schema/source-discovery.schema.v1.json`.

The deterministic generator `scripts/knowledge/generate-source-discovery-universe.ts` supports:

```text
npx tsx scripts/knowledge/generate-source-discovery-universe.ts --write
npx tsx scripts/knowledge/generate-source-discovery-universe.ts --check
```

It derives the universe from the canonical ontology and manages five artifacts under `knowledge/corpus/source-discovery/`:

- the deterministic universe JSONL;
- the append-only query ledger for plans and runs;
- the append-only result ledger for candidates and formal receipts;
- the derived summary;
- the generation manifest with exact input and output hashes.

Each universe cell and ledger event has a domain-separated canonical SHA-256 seal. The validator also anchors the exact canonical cell-ID set and versioned ontology bytes, so resealing a different 6,072/759-cell universe is insufficient. Each ledger is a contiguous predecessor-hash chain. Existing ledger bytes are treated as inputs and are never rewritten by `--write`; a non-canonical, broken, reordered or semantically invalid ledger fails closed. A non-empty ledger without its prior manifest anchor is rejected, and ledger bytes are re-read before the derived manifest is committed.

For every formal-source event, generation resolves the referenced acquisition-receipt file and verifies its file hash, internal receipt seal, receipt identity, acquisition type, exact content hash and size, chronology, and exact candidate locator. Receipt-verified bundles carry a canonical fingerprint that is rechecked before formal-source counts, so mutation after validation invalidates the receipt proof.

The generator performs no network request and no database mutation. It does not acquire files, verify source identities, analyze full text, grant external-use rights or promote coverage.
