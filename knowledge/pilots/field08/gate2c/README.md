# Gate 2C — Field 08 controlled evidence intake

Gate 2C turns a deliberately small part of the Gate 2B candidate map into reproducible, reviewable internal evidence. It does not claim that Field 08, a geography, or the Nordic food system is complete.

## Bounded tranche

The tranche contains five official source identities:

- Eurostat food-waste data for Denmark and the unresolved `FI` reporting geography;
- Luke nitrogen and phosphorus balances for whole Finland including Åland and for Åland separately;
- Landbruksdirektoratet's 2024 agricultural food-waste report for Norway;
- ÅSUB's 2024 waste-statistics report for Åland; and
- the Environment Agency of Iceland's 2022 food-waste report.

The tracked API response bytes, reproducible API request definitions, detached PDF-capture manifest and committed PDF inspection extracts are stored in [`research/evidence-pack/field08-gate2c-2026-07-28/`](../../../../research/evidence-pack/field08-gate2c-2026-07-28/README.md). The PDF bytes themselves remain ignored local files.

## Source and generated artifacts

- `field08-evidence-intake.v1.json` is the reviewed source input. It contains locator-level acquisitions, subject and indicator definitions, claim and measurement candidates, open contradiction sets, deferred candidates, child-dimension requirements, appraisal drafts and pending review gates.
- `research/evidence-pack/field08-gate2c-2026-07-28/external-captures.v1.json` is the detached three-PDF manifest. It records exact URLs, timestamps, ignored local paths, hashes, sizes, PDF magic, `local_only_at_risk` durability, pending reuse review and hash-bound inspection extracts.
- `field08-acquisition-receipts.v1.jsonl` binds each locator-level acquisition to its source identity, capture path, byte length, SHA-256 hash and source commit.
- `field08-evidence-register.v1.json` and `field08-evidence-report.v1.md` are the machine-readable and human-readable generated views.
- `field08-appraisal-review-manifest.v1.json` and `field08-reviewer-brief.v1.md` define the later human work without pretending that review has occurred.
- `knowledge/objects/field08-gate2c.v1.json` contains internal-candidate source, subject, indicator, claim and observation objects.
- `field08-evidence-generation-manifest.v1.json` is written last and pins all committed inputs, detached external-capture receipts and generated output hashes. It does not imply that ignored local PDFs are stored in Git.

Generated files must not be edited by hand.

## Interpretation stoplines

- Capture hashes and committed inspection-text hashes can be machine-checked. The detached manifest records the extraction tool and arguments, but Gate 2C does not re-run `pdftotext`; extract derivation, source appraisal, method acceptance and publication readiness require a named human review receipt.
- Every generated claim and observation remains internal context, aggregation-blocked and unavailable for external use.
- An open contradiction blocks only its affected claims and observations. It does not invalidate unrelated values from the same source.
- The Eurostat `FI` capture creates no measurement because Finland–Åland inclusion is unresolved.
- Luke's whole-country rates include Åland and are non-additive with the Åland rates. Per-hectare subtraction is prohibited.
- ÅSUB recovery codes are treatment classifications, not proof of closed-loop nutrient recovery.
- Iceland's aquaculture false zero is an unknown caused by missing data, never a numeric zero.
- Political-country evidence creates no Sápmi subject evidence or rights-holder approval.
- No generated Gate 2C artifact is a coverage assessment event or readiness result.

## Two-commit generation contract

Commit the source intake, schema, generator, tests, documentation, API response bytes, API request receipts, detached PDF manifest and inspection extracts first. Do not force-add the ignored PDFs. Then, with the three exact local PDFs present, generate outputs from that exact source commit:

```bash
npm run knowledge:field08:evidence:generate
npm run knowledge:field08:evidence:check
```

Commit generated outputs separately. Initial generation requires and hash-checks the local PDFs. A fresh-clone or CI check may accept an absent PDF only when its capture is declared `local_external`; it still verifies the committed detached receipt, tracked inputs and generated outputs, and fails if present local bytes drift. A local full-capture check remains the stronger evidence-byte verification.

The current PDF captures are `local_only_at_risk`, not durably archived. Their official recovery URLs and exact hashes support recovery, but Gate 2C retains an archive-durability gap until an approved content-addressed external or backed-up artifact store holds those bytes. Reuse and redistribution remain pending separate human review.

## Remaining gate

A later named human must review each source appraisal, territorial and method boundary, and open contradiction. That review may authorize revised internal or external citation states, but coverage can change only through a separate append-only coverage-assessment event.
