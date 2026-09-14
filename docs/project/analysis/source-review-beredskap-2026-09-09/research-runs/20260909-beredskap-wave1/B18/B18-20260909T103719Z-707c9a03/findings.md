# B18 findings — Marked, kjøperrelasjoner og kostnader som relevant bakgrunn

- programRunId: `20260909-beredskap-wave1`
- packageId: `B18`
- runId: `B18-20260909T103719Z-707c9a03`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- headCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- terminalStatus: `complete_within_scope`
- human_verified: false
- createdAt: `2026-09-09T10:55:00Z` (UTC)
- ownedGapIds: none (market/cost background only; FS-02/04/09 historical research needs)

## Scope

Chapters 4–5 only: structures that affect a **named chain** or **economic food access**. Coordination surfaces B04/B13 noted, no mutual waiting. **Stop rule applied:** no app or accounting mutation; internal error/status not treated as fresh truth; named data-owner/editorial choices left open; **Holdbart precision choice not made by agent**.

## Question 1 — Documented buyer/owner relations, years, units, denominators?

**Answer:** **No verified buyer-share series** with year, unit and denominator for a named chain was found in authorized B18 channels.

**Known:**
- Round-003 ch.4 explicitly did **not** perform a new market-power/buyer-relation control and kept the prior gap (`B18-C01`).
- FS-02 historical need: undocumented buyer shares were removed; **60310** primary-delivery rows are cited as an existing count — not a buyer-share (`B18-C02`).
- Synthesis §4.3: ownership/vertical links exist in the knowledge base as a class, but each **named** relation still requires row-level source, date and type before external use (`B18-C03`).

**Unknown / open:** documented buyer/off-taker rows for named chains (new gap `…-G01`); row-level ownership publication fields (`…-G04`).

**Next step:** Unsent owner intake for named-chain buyer rows; do not allocate volumes by assumed market power. Coordinate with B04 only on chain naming surfaces.

Evidence: `B18-C01`–`C03`; sources `B18-S01`–`S03`, `B18-S09`.

## Question 2 — Costs/prices separable from physical capacity and causal margin claims?

**Answer:** **Yes — several bound series/rules separate cleanly.**

**Separable as economic access / method (not physical tonnes, not causal margin):**
- Method rule: KPI/PPI difference is **not** a margin; causal July-margin / hidden-fee claims need product-level contracts/accounts (`B18-C04`).
- Ch.5 assessment: price/access is an outcome; do not derive physical supply or causal margin from indexes; add StatFin + SIFO provenance as economic access (`B18-C09`).
- Frozen **D-O001** StatFin cells (15 cells, 2021–2025, percent households) match prior candidates when table/group/measure bound (`B18-C05`).
- Frozen **D-O005** SIFO 7-2025 provenance (byte-identical multi-channel) — identity binding, not new prevalence (`B18-C06`).
- Holdbart 2024 **accounting cost lines / operating result** are monetary accounts for one company-year — separable from physical capacity — but exact NOK remains human-open (`B18-C07`).

**Not permitted from these alone:** chain margin, Nordic price ranking, physical preparedness tonnes.

Evidence: `B18-C04`–`C07`, `B18-C09`; sources `B18-S01`, `S02`, `S04`–`S08`, `S12`. Detailed SIFO microdata fields remain B13’s surface.

## Question 3 — Duplicates / currency / group scope / uncertainties before summing?

**Answer:** **Retain at least the following before any cross-entity sum** (`B18-C08`):
1. **Parallel company identities** (FS-04): one chosen economic entity once per agreed scope and year; no double-counting subsidies.
2. **Holdbart 2024 1 NOK internal inconsistency** between expense components (556 138 448) and displayed subtotal (556 138 449); OR 22 973 972 vs 22 973 971 — human precision choice open (`…-G02`); agent does not choose.
3. **Ownership overview / freshness / remaining identity–scope–currency reconciliation** (FS-09 class) (`…-G03`).
4. **Company vs group, year alignment, FX basis** as warned in financial reconciliation notes — accounts must not be summed to a market size without controls.

**No new multi-entity sum was computed in B18.**

Evidence: `B18-C07`–`C08`; sources `B18-S03`–`S06`, `S10`–`S11`.

## Contradictions

- Holdbart AS 2024 PDF presents two operating-result figures differing by 1 NOK (documented, not resolved).

## Limitations

- No owned historical gap IDs to close; FS-02/04/09 cited only as historical research needs.
- No fresh Konkurransetilsynet share re-audit (forbidden by ch.4 round003Action / B18 scope).
- Round-006 `target-profile.json` is flour-chain C1; B18 uses a **candidate** market/cost target profile instead.
- Model attestation unavailable in executor subagent metadata.

## Terminal disposition

`complete_within_scope`: all three questions answered within chapters 4–5 background boundary with hash-bound evidence or precise stops; gaps recorded; no publish; no research-plan/prior-round edits; Holdbart choice left open per stop rule.
