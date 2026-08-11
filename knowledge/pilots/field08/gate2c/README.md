# Gate 2C — Field 08 controlled evidence intake

Gate 2C turns a deliberately small part of the Gate 2B candidate map into reproducible, reviewable internal evidence. It does not claim that Field 08, a geography or the Nordic food system is complete.

## Bounded tranche

The tranche contains five official source identities:

- Eurostat food-waste data for Denmark and the unresolved `FI` reporting geography;
- Luke nitrogen and phosphorus balances for whole Finland including Åland and for Åland separately;
- Landbruksdirektoratet's 2024 agricultural food-waste report for Norway;
- ÅSUB's 2024 waste-statistics report for Åland; and
- the Environment Agency of Iceland's 2022 food-waste report.

## Evidence custody and rights boundary

The evidence pack is stored in [`research/evidence-pack/field08-gate2c-2026-07-28/`](../../../../research/evidence-pack/field08-gate2c-2026-07-28/README.md). The official API responses and reproducible request definitions are tracked in Git. The three official PDF captures are not tracked in Git.

For each PDF, the repository contains a short, project-authored inspection note with document identity, factual values, exact page or table locators, contradictions and limitations. These notes contain neither full source text nor a substitute reproduction. The detached capture manifest binds each note and private PDF to its exact SHA-256 hash, byte length, source URL and capture time. The PDF bytes remain the source authority.

The exact three PDF captures currently have two restricted, content-addressed filesystem copies: one project-private copy and one copy on a separate private storage volume. This is `archive_partial_not_durable`, not a durable-archive claim: neither copy has object lock or an independently verified retention guarantee. The original `local_only_at_risk` value in the immutable capture manifest records acquisition-time state; later storage evidence belongs in the append-only archive/rights receipt log.

Storage does not grant reuse or redistribution rights. Rights review remains pending and fail-closed for every PDF and its components.

## Source and generated artifacts

- `field08-evidence-intake.v1.json` is the reviewed source input. It contains locator-level acquisitions, subject and indicator definitions, claim and measurement candidates, open contradiction sets, deferred candidates, child-dimension requirements, appraisal drafts and pending review gates.
- `research/evidence-pack/field08-gate2c-2026-07-28/external-captures.v1.json` is the detached three-PDF manifest. It records exact source locators, capture identity, ignored local paths, hashes, sizes, PDF magic, acquisition-time archive state, pending reuse review and rights-safe inspection-note provenance.
- `field08-acquisition-receipts.v1.jsonl` binds each locator-level acquisition to its source identity, capture identity, byte length, SHA-256 hash and source commit.
- `field08-evidence-register.v1.json` and `field08-evidence-report.v1.md` are machine-readable and human-readable generated views.
- `field08-appraisal-review-manifest.v1.json` and `field08-reviewer-brief.v1.md` define pending human work without pretending that review has occurred.
- `knowledge/objects/field08-gate2c.v1.json` contains internal-candidate source, subject, indicator, claim and observation objects.
- `field08-evidence-generation-manifest.v1.json` is written last and pins all committed inputs, detached capture receipts and generated output hashes. It does not imply that the private PDFs are stored in Git.

Generated files must not be edited by hand.

## Human-review workflow

The ordinary human-review gate covers 85 explicit targets: 5 sources, 17 acquisitions, 34 claims and 29 observations. A valid ordinary-review receipt must additionally record all 17 locator decisions, each bound to its acquisition, citation, exact locator and capture hash. Boundary reconciliation, contradiction resolution and method appraisal remain separate gates so one review type cannot silently resolve another.

The review workflow produces the following artifacts for the immutable Gate 2C v1 evidence-package hash:

- four immutable pending JSON templates, one for each review gate;
- `review/field08-human-review-packet.v1.md`, grouped by the five sources and showing the exact locator, claims, observations, contradictions and appraisal material a reviewer must inspect;
- the append-only human receipt log at `review/field08-human-review-receipts.v1.jsonl`; and
- the deterministic derived status projection at `review/field08-human-review-status.v1.json`.

Create or check the pending templates and reviewer packet without editing generated evidence:

```bash
npm run knowledge:field08:review:write
npm run knowledge:field08:review:check
```

Pending templates are work packets, not evidence that review occurred. Named-human decisions are appended to the fixed v1 receipt log and validated before regenerating the status projection:

```bash
npm run knowledge:field08:review:validate
npm run knowledge:field08:review:status:write
npm run knowledge:field08:review:status:check
```

The status timestamp is deterministic: it uses the later of the evidence-generation time and all receipt review times. Every receipt and projection remains `externalGatePassed: false` and `coveragePromotionAllowed: false`.

The append-only chain is scoped to one exact `evidencePackageHash`. A package revision starts a new versioned log and leaves the v1 log untouched; a receipt from the earlier package is never rehashed into the new chain. Each successor binds the prior receipt hash. Protected Git history is the external append-only anchor, and the validator can additionally compare a current log with an explicitly supplied prior snapshot using `--previous-log`.

Human review completion requires access to the exact private PDF bytes for all PDF-backed locators, not only their hashes or project-authored notes. The reviewer must verify those bytes and locators against the pinned capture identities. A fresh-clone metadata check cannot satisfy this requirement.

## Archive and rights receipts

Archive custody and component-level rights decisions use the separate append-only log at `archive/field08-archive-rights-receipts.v1.jsonl`. Each receipt binds the capture manifest, capture identity, source commit, private content-addressed locations, integrity verification, archive durability and component-level reuse decision. A later receipt in the same capture and manifest chain binds and supersedes the previous receipt hash; existing lines are never changed or removed. A changed capture manifest or source-package binding starts a new versioned log rather than invalidating or rewriting v1.

Validate the fixed log with:

```bash
npm run knowledge:field08:archive-rights:check
```

The current two-copy filesystem arrangement can be recorded only as `archive_partial_not_durable`. It cannot be promoted to `archive_complete_durable` without the stronger retention and object-lock evidence required by the receipt contract. Archive verification and rights clearance are distinct decisions.

The JSON Schemas define the serialized shapes. The TypeScript CLI validators are normative for cross-field identity, hash-chain, fail-closed status, archive durability and component-rights invariants that JSON Schema alone does not express.

## Evidence generation and checks

Commit the source intake, schemas, generator, tests, documentation, API response bytes, API request receipts, detached PDF manifest and project-authored inspection notes first. Do not force-add the ignored PDFs. Then, with the three exact private PDFs present, generate outputs from that exact source commit:

```bash
npm run knowledge:field08:evidence:generate
npm run knowledge:field08:evidence:check
npm run knowledge:field08:evidence:check:full
```

Initial generation and the full check require and hash-check the local PDFs. A fresh-clone or CI check may accept an absent PDF only when its capture is declared `local_external`; it still verifies committed metadata and generated outputs, and fails if present local bytes drift. That portability rule never authorizes human review completion without the exact PDF bytes.

## Interpretation stoplines

- Hash verification proves byte integrity, not source quality, methodology, rights clearance or publication readiness.
- Every generated claim and observation remains internal context, aggregation-blocked and unavailable for external use.
- An open contradiction blocks only its affected claims and observations. It does not invalidate unrelated values from the same source.
- The Eurostat `FI` capture creates no measurement because Finland–Åland inclusion is unresolved.
- Luke's whole-country rates include Åland and are non-additive with the Åland rates. Per-hectare subtraction is prohibited.
- ÅSUB recovery codes are treatment classifications, not proof of closed-loop nutrient recovery.
- Iceland's aquaculture false zero is an unknown caused by missing data, never a numeric zero.
- Political-country evidence creates no Sápmi subject evidence or rights-holder approval.
- No review, archive or rights receipt promotes coverage. Coverage can change only through a separate append-only coverage-assessment event.
