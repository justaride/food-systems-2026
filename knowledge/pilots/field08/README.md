# Gate 2B — Field 08 research candidates

This directory is the first substantive research pilot for legacy field `legacy_field.f08`: circularity, food waste, side streams and N-P-K.

It does not assess or promote a coverage cell. It records a reviewable intake floor between navigation and evidence ingestion.

## What is controlled

- `field08-research-source-map.v1.json` is the reviewed source input: authoritative source leads, exact candidate locators, source-to-cell bindings, bounded observation candidates, territorial limitations, explicit unknowns and next actions.
- Every source binding must resolve to at least one bounded observation candidate, with candidate-use, observation-type and quantitative-metadata consistency checked before generation.
- `field08-research-candidate-register.v1.json` is generated. It reproduces the input and expands all 34 Field 08 ontology facets across eight political geographies and the separate Sápmi scope.
- `field08-research-candidate-report.v1.md` is the generated human readout.
- `field08-research-generation-manifest.v1.json` is written last and pins the source commit, input snapshots and output hashes.

Generated files must not be edited by hand.

## Candidate semantics

A candidate source or observation is not evidence in the coverage ledger. Every record remains:

- `draft_candidate_only`;
- `unassessed` at the coverage-cell level;
- locator-only and not archived in the evidence store;
- pending source-byte capture, identity resolution, claim or measurement ingestion, appraisal and human review;
- blocked from external use and readiness promotion.

The facet matrix uses six lead states:

- `substantive_candidate_identified` — a direct measurement lead exists, but has not passed evidence gates;
- `method_candidate_identified` — a method or reporting definition exists;
- `context_candidate_identified` — policy, legal, operational or data-gap context exists;
- `boundary_reconciliation_required` — the source cannot yet be assigned without resolving a territorial or system boundary;
- `rights_holder_route_required` — only an authority, consent or governance route is identified;
- `no_candidate_identified` — this pilot located no candidate lead.

None of these states means represented, verified, citable, complete or not applicable.

If several bindings target the same facet, unresolved boundary reconciliation takes precedence over substantive, method or context leads. This preserves the most conservative review state instead of hiding a territorial or system-boundary conflict behind a stronger-looking candidate.

## Geography boundary

The political register contains Norway, Sweden, Denmark, Finland, Iceland, the Faroe Islands, Greenland and Åland. Finland and Åland remain non-additive wherever a whole-country Finnish source includes or may include Åland.

Sápmi is a separate 34-row projection. Its desk-research records identify possible authority, consent, data-governance and rights-holder review routes only. Political-country evidence receives zero Sápmi subject-coverage credit.

## Run

After committing source-map, schema, generator, tests and documentation changes:

```bash
npm run knowledge:field08:generate
npm run knowledge:field08:check
```

The generation manifest deliberately points to the source commit rather than the later output commit. `knowledge:field08:check` replays that pinned input and fails on source or output drift.

## Next gate

Gate 2C is implemented in [`gate2c/`](gate2c/README.md) as a bounded five-source evidence-ingestion tranche. It captures immutable source bytes and API request receipts, creates stable source and locator identities, splits compound quantitative statements into typed measurements, preserves contradictions, drafts source appraisals and enumerates pending review gates.

Gate 2C remains internal and human-review pending. It creates no coverage assessment, readiness result or Sápmi subject evidence. Only a later append-only assessment event may change a coverage cell.
