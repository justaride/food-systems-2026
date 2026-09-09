# B03 findings — Furuset produksjon, behov og bulkmottak

- programRunId: `20260909-beredskap-wave1`
- packageId: `B03`
- runId: `B03-20260909T101901Z-1e1d2425`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- terminalStatus: `waiting_owner`
- human_verified: false
- createdAt: `2026-09-09T10:24:48Z` (UTC)

## Scope

One recipient at Søren Bulls vei 27 after the Mat i Farta rebuild (case `R5-C1-FURUSET-Q1-T72`). No relocation of the analytic case to Økern, bagged flour, or finished baked goods.

## Question 1 — What is still produced on site, and does it actually use Q1 flour?

**Precise stop / unknown operational state.**

Known from hash-verified sources:

- Applicant cover letter (R6-S17) describes Mat i Farta with bakery and pastry remaining while parts of the bakery move to Økern, plus conversion of former bakery areas toward food preparation for wraps/sandwiches etc. (candidate B03-O02).
- Public department page (R6-S03) still markets rustic stone-oven bread at the Furuset address (B03-O02).

Unknown (not zero):

- Dated current line/product/recipe plan on site after rebuild (R6-G01 / intake G01 all null).
- Whether remaining activity uses Q1 bulk flour (Regal 160105 reference) versus other flour forms or purchased baked goods (R6-G04, R5-G05).
- Any batch Q1 net need (R5-G01, R6-G07).

Next step: authorized owner response to unsent R6 intake G01/G04/G07 — no email sent in this run.

## Question 2 — Where are silos and the blow-in point after the described move, and what does as-built show?

**Precise stop within PBE public channel; waiting owner for as-built.**

Known with role boundaries (B03 stop rule):

- Historical/application: east-facade flour silos; proposal to dismantle/move them for CO2 rig and convert silo room to freezer (R6-S17 → B03-O01). This is **not** current inventory.
- Temporary use permit 17.04.2026 and applicant ferdigattest request 13.08.2026 document permit/completion claims, **not** as-built silo layout or reception performance (B03-O03).
- Live PBE index re-fetch matched R6-S12/R6-S15 byte-for-byte; no public attachment title names as-built silo, innblåsingspunkt, or bulk reception test (B03-O04). Login-gated facade drawings were not read.

Unknown:

- Post-move silo IDs, location, product service, m³, max vs available tonnes, receiving-point ID (R6-G05).
- Municipal ferdigattest decision distinct from applicant søknad (new subgap `B03-B03-20260909T101901Z-1e1d2425-G02`).

## Question 3 — Which recipe/batch needs, acceptance rules, stock, quarantines, and deadlines can be documented?

**None as measured values.** Intake G04/G05/G07 and related R5 gaps remain null (B03-O05). Per MAALEPROTOKOLL and case.json, missing need/stock/buffer stays **unknown**, never numeric zero. No acceptance tickets or bake outcomes exist in authorized channels.

## Owned gap dispositions (summary)

| Gap ID | Disposition |
|---|---|
| A1-G006 | remains_open_waiting_owner |
| R5-G01 | remains_open_waiting_owner |
| R5-G02 | remains_open_waiting_owner |
| R5-G05 | remains_open_waiting_owner |
| R5-G09 | remains_open_waiting_owner |
| R6-G01 | remains_open_waiting_owner |
| R6-G04 | remains_open_waiting_owner |
| R6-G05 | remains_open_waiting_owner_and_source |
| R6-G07 | remains_open_waiting_owner |

New precise subgaps: `B03-B03-20260909T101901Z-1e1d2425-G01` (public as-built reception attachment), `B03-B03-20260909T101901Z-1e1d2425-G02` (municipal ferdigattest decision). No semantic gap closed. No `candidate_resolution_proposed` for closure.

## Coordination notes (not start dependencies)

- B01/B02: mill specs still needed for Q1 equivalence once recipient acceptance exists (R5-G05/R6-G04).
- B06: energy/water/transport/unload interface still blocked on unknown receiving point (R6-G05).

## Authority / non-actions

No emails, no publishing, no edits to `research-plan/` or prior rounds, no canonical promotion, no readiness change, no human review recorded. Raw only under private artifact root.
