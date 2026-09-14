# B10 findings — Aass og sidestrøm til fôr: funksjonell substitusjon

- programRunId: `20260909-beredskap-wave1`
- packageId: `B10`
- runId: `B10-20260909T103158Z-3ca837d6`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- headCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- terminalStatus: `waiting_owner`
- human_verified: false
- createdAt: `2026-09-09T10:40:00Z` (UTC)

## Scope

One Aass spent-grain side-stream; bounded recipient type and actual ration (C2). No emails, no publish, no edits to `research-plan/` or prior rounds. **Stop rule applied:** full-text access search ended (no DOI/OA redirect retry); general brewery studies + liters alone give no Aass-specific soy/protein/beredskap effect; no sampling or feeding trials.

## Question 1 — Aass-spesifikke våtmasse-/tetthets-/tørrstoff-/nærings-/hygienedata og sesongvariasjon?

**Answer (precise stop):** **Not available** as Aass-specific numeric measurements in authorized open channels re-read 2026-09-09. Reports and landbruk/olbrygging pages give qualitative «næringsrik» / «svært fiberrik» language and process context only. Laboratory page is brew QC, not feed analysis. Seasonal/batch variation tables were not found.

**Known:** Process definition of feedable mask vs bitter non-feed post-boil residue; destination dyrefôr/storfôr.  
**Unknown:** wet mass kg, density, DM%, CP, NDF/ADF, fat, ash, energy, minerals, hygiene, seasonality (A2-G002).  
**Next step:** Unsent owner/lab intake (B10-INT-03); no sampling performed here.

Evidence: `B10-C03`; sources `B10-S01`–`B10-S07`.

## Question 2 — Hva erstattes i rasjonen, og hva skjer ved bortfall (lagring, tap, transport)?

**Answer (precise stop):** **Not documented** for actual Aass recipients. Open sources state dyrefôr/storfôr and bondelag distribution / pipe to pickup point / masksilo. They do **not** name the replaced ingredient, dose, storage time/temperature/loss, transport fleet, or fallback ration. Therefore **no** Aass-specific soy/protein substitution or preparedness effect may be derived from liter volumes.

**Known:** Physical flow chain; qualitative feed use; C2 test still has `numericEffect: null`.  
**Unknown:** A2-G003 ration/substitution/storage fields; A2-G005 continuity metrics; A2-G004 Aass-matched trials (fulltext access already stopped at 0).  
**Next step:** Unsent anonymized recipient intake; lawful full text only if newly authorized — do not retry DOI/OA loop.

Evidence: `B10-C04`, `B10-C05`, `B10-C06`; sources `B10-S05`, `B10-S06`, `B10-S09`, `B10-S10`.

## Question 3 — Kan årsvolum og nettsidens «over 8 millioner liter» avstemmes uten å blande perioder?

**Answer (precise stop):** **No — not without owner clarification.** Year-specific report series (8.3 / 7.9 / 7.8 / 7.7 million liters for 2022–2025) must be kept separate from the undated landbruk wording «over 8 millioner liter» per year. Re-fetch on 2026-09-09 still shows both statements; no public erratum reconciles them. Inventing a blended figure is forbidden.

**Known:** Year-labeled liter series; undated website formulation; 2023–2025 adjacent «Egne målinger» Kilde lines (2022 mask block lacks adjacent Egne-målinger Kilde in extract).  
**Unknown:** Website coverage year/definition (A2-G006); measurement point/uncertainty/recipient logs (A2-G001).  
**Contradiction:** website «over 8M» vs 2025 report 7.7M — unresolved.

Evidence: `B10-C01`, `B10-C02`; sources `B10-S01`–`B10-S05`.

## Gap dispositions (owned)

| Gap ID | Disposition | semanticGapClosed |
|---|---|---|
| A2-G001 | remains_open_waiting_owner | false |
| A2-G002 | remains_open_waiting_owner | false |
| A2-G003 | remains_open_waiting_owner | false |
| A2-G004 | remains_open_waiting_method_or_lawful_fulltext | false |
| A2-G005 | remains_open_waiting_owner | false |
| A2-G006 | remains_open_waiting_owner | false |
| B10-20260909T103158Z-3ca837d6-G01 | new_refinement_waiting_owner (non-merge rule) | false |

## Limitations

- KI candidate only; `human_verified: false`.
- Private raw/PDF/HTML bytes under `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/research-runs/20260909-beredskap-wave1/B10/B10-20260909T103158Z-3ca837d6`; portability needs authorized access to the same bytes.
- Prior non-Aass open trials retained only as negative/transfer-boundary context via A2/round-003 — not as Aass effect estimates.
- No calculations converting liters → kg → protein → soy tonnes.

## Coordination note

Interfaces with coordinator only; no package dependency. New owner documents require a new immutable runId.
