# Review-layer contract

Status: canonical internal contract

Version: 1.0.0

Effective date: 2026-08-02

Machine contract: [`review-layer-contract.v1.json`](review-layer-contract.v1.json)

## Purpose

Food Systems 2026 is researched primarily by Gabriel Freeman and AI. AI may acquire, read, extract, translate, compare, structure and check material. Gabriel is the project owner and makes the internal decisions. Independent experts, partners and rights-holders validate selected material later when the claim, use or scope requires their authority.

These are independent axes, not one ladder called “human review”. A positive result on one axis never silently satisfies another. Missing or unrecorded decisions fail closed.

## Candidate-analysis authority boundary

The [autonomous analysis contract](../candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md) defines `candidate`, `human_review` and `promotion` for autonomous candidate work. Candidate analysis is an `ai_processing` event only: it may append an exact hash-bound candidate result but may not create a human-review receipt, canonical record, publication decision, coverage assessment or target-promotion event.

Identity confidence (`exact`, `provisional` or `unresolved`) travels with a candidate and constrains later target-profile promotion. Confidence, repetition, reconciliation and model agreement are not authority and do not satisfy any review, rights, publication or coverage gate.

## Canonical layers

| Layer                           | What a receipt proves                                                                                                       | Authorized actor                                                                        | It does not prove                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ai_processing`                 | The declared bytes or records were processed using the recorded method and tooling.                                         | Identified AI system or deterministic automation.                                       | Owner acceptance, expertise, consent, rights, publication approval or coverage.                                          |
| `owner_review`                  | Gabriel has inspected the bound work package and accepted, limited, returned or rejected it for the declared internal use.  | Gabriel Freeman as named project owner.                                                 | Independent expert validation, partner or rights-holder validation, rights clearance, publication or coverage promotion. |
| `independent_expert_validation` | A qualified person independent of the project decision has evaluated the declared claim, method or interpretation.          | Named external expert with qualifications, affiliation and conflict declaration.        | Rights-holder authority, reuse rights, publication approval or coverage promotion.                                       |
| `partner_validation`            | A named partner or contributor has validated the operational, contextual or lived-experience scope declared in the receipt. | Named partner representative or consented contributor.                                  | Independence, rights-holder authority, rights clearance, publication or coverage promotion.                              |
| `rights_holder_validation`      | A recognized rights-holder or governance authority has validated the declared scope, consent conditions and interpretation. | Named rights-holder or Indigenous governance authority.                                 | General expert independence, copyright clearance, publication approval or coverage promotion.                            |
| `rights_clearance`              | The exact components and declared uses are licensed, permitted, restricted or denied.                                       | Licensor, rights-holder, rights officer or other documented authority for the decision. | Source quality, factual validity, publication approval or coverage promotion.                                            |
| `publication`                   | An authorized release decision covers an exact artifact, audience, channel and version.                                     | Named publication authority.                                                            | That evidence is complete, independently validated or coverage-promoted.                                                 |
| `coverage_promotion`            | A separate append-only assessment finds a named coverage cell ready for a named profile.                                    | Actor permitted by that readiness profile.                                              | Publication rights, general truth outside the declared cell/profile or permanent completeness.                           |

Every receipt is scoped to exact source or artifact identities, a decision, an actor or system, a timestamp and its applicable limitations. The same person may hold more than one role only when authority for each role is documented and each decision is recorded separately.

## Gabriel and AI

Gabriel may sign `owner_review` receipts after personally reviewing the bound sources, locators and decisions. AI assistance is allowed for preparation, extraction, translation, comparison, drafting and checks, but the receipt must disclose that assistance. The owner signature remains Gabriel’s decision; an AI run cannot create it.

Gabriel cannot classify his own owner decision as `independent_expert_validation`. Even where he has relevant knowledge, “independent” requires a separately named person outside the project decision, with relevant qualifications and a conflict-of-interest declaration. An owner receipt therefore means “accepted for the declared internal project use”, not “externally validated”.

## Gate 2C compatibility

Gate 2C v1 remains immutable and valid. Its existing names are interpreted at read time; they are not rewritten:

| Existing Gate 2C status                 | Canonical interpretation                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `machine_checked_human_review_pending`  | `ai_processing = ai_processed`; legacy human review remains pending and unclassified    |
| `human_review_pending`                  | Legacy human review pending; no canonical review layer assigned                         |
| `human_review_recorded_open`            | Legacy human review recorded as open; no canonical review layer assigned                |
| `human_review_recorded_action_required` | Legacy human review recorded with action required; no canonical review layer assigned   |
| `human_review_complete_internal_only`   | Legacy internal-only completion; no canonical review layer assigned from status alone   |

Gate 2C asked for qualified reviewers with different kinds of expertise; it was not designed as an owner-only workflow. A legacy `field08_human_review_receipt` must therefore be classified from the actual signer, the gate's required reviewer role, qualifications or authority, affiliation, conflict declaration and exact scope. Gabriel's receipt can become `owner_review`; a genuinely independent qualified signer can become `independent_expert_validation`; a partner or rights-holder can map only with documented role authority. Until that evidence is classified, the legacy receipt remains unclassified and satisfies no canonical review layer. Existing Gate 2C flags remain fail-closed: no legacy review status or unclassified receipt allows external use or coverage promotion.

## Sápmi and rights-holder boundary

Sápmi remains a separate, overlapping and non-additive scope. AI processing, desk research, owner review, independent expert validation and ordinary partner validation cannot substitute for a rights-holder-led route.

Before Sápmi or Indigenous knowledge can receive substantive validation or coverage credit, the project must record the recognized authority, consent and data-governance basis, permitted scope and rights-holder interpretation. A partner counts as a rights-holder only when that authority is explicitly documented and a separate `rights_holder_validation` receipt is issued. Political-country evidence creates no Sápmi evidence by inference.

Rights-holder validation and rights clearance are also separate. Participation or interpretation does not by itself grant storage, reuse or publication rights.

## Publication and coverage stoplines

External publication requires a separate publication decision plus owner review, rights clearance for the exact intended use, and every expert, partner, rights-holder, privacy, safety or legal gate required by the material. Publication approval is never inferred from a completed review.

Coverage can change only through a separate append-only coverage-assessment event bound to a named cell and readiness profile. No AI, owner, expert, partner, rights-holder, rights or publication receipt automatically promotes coverage. Publication is neither proof of coverage nor a prerequisite for every internal coverage assessment.

## Migration checklist

- [ ] Keep the existing Gate 2C v1 artifacts and receipt logs byte-for-byte unchanged.
- [ ] Preserve legacy human-review state without assigning a canonical review layer from status alone.
- [ ] Classify any completed legacy receipt from signer identity, gate role, qualifications or authority, affiliation, conflict declaration and exact scope.
- [ ] Use `owner_review_*` for new owner-workflow records and name Gabriel as the signer.
- [ ] Record whether and how AI assisted each new owner receipt.
- [ ] Persist expert, partner, rights-holder, rights, publication and coverage decisions on separate axes.
- [ ] Require actor authority, scope, evidence binding, limitations and conflicts appropriate to each receipt kind.
- [ ] Treat omitted gates as pending or explicitly not applicable with a rationale; never infer completion.
- [ ] Preserve the Sápmi non-additive profile and rights-holder-led scope, consent and interpretation route.
- [ ] Keep rights clearance, publication approval and coverage promotion as separate events.
- [ ] Version any projection or receipt-schema migration and retain the legacy read-time aliases.
