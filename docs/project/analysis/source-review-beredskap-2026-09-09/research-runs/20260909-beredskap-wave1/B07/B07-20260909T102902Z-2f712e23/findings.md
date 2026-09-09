# B07 findings — Finland: eksakt korn-, fukt- og revisjonsbro

- programRunId: `20260909-beredskap-wave1`
- packageId: `B07`
- runId: `B07-20260909T102902Z-2f712e23`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- headCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- terminalStatus: `waiting_source`
- human_verified: false
- createdAt: `2026-09-09T10:45:00Z` (UTC)

## Scope

2018 residuals for Finnish wheat/barley and related Finnish method/yield alerts (FI C1100 2020; FI C1300 2016). Candidate areas C1/C5; purposes P1/P3. No emails, no publishing, no edits to `research-plan/` or prior rounds.

**Stop rule applied:** Conditional package — without a concrete new bridge/version, deliver `waiting_source` with exact document requirements. No broad searches. One common moisture factor alone is already insufficient in the executed round-005 control.

## Question 1 — Finnes datert 2018-overføring/revisjonslogg mellom Luke og Eurostat?

**Answer (precise stop):** **Not in authorized channels.** Round-005 `DEFINISJONER.md` already states Stopp R4-G001. Re-verified frozen R5-S08 (2018 release, published 14.3.2019) and R5-S09 (method/quality description). R5-S09 is explicitly **not** a timestamped 2018 transfer form. Round-005 private FI inventory on this machine contains `fi-2018-release.*` and `fi-method.*` only — **no named transfer/revision annex**.

**Known:** National release identity; method page concepts for dried yield and fresh-grain classes; Eurostat metadata notes G9100 deviation.  
**Unknown:** Dated transmission/revision log with version IDs for 2018 wheat/barley cells.  
**Next step:** Acquire the named annex (Luke / FI Eurostat correspondent). No contact sent in this run.

Evidence: `B07-C01`; sources `R5-DEFINISJONER`, `R5-S08`, `R5-S09`.

## Question 2 — Standardfukt per vare og kvantitativ bro tørt/ferskt ↔ C1100/C1300/G9100?

**Answer (precise stop):** **Exact national standard moisture % for 2018 wheat/barley is unknown** (`observed_national_moisture_pct: null` in frozen `calculations.json`). Official quality report + national Eurostat metadata were already examined under DKFI-G001 without establishing the percentage.

Frozen dual series (do not overwrite):

| Crop | Luke kt | Eurostat kt | Residual EU−Luke kt | EU/Luke ratio |
|---|---:|---:|---:|---:|
| Wheat | 494.7 | 501.6 | +6.90 | ≈1.013948 |
| Barley | 1336.1 | 1353.19 | +17.09 | ≈1.012791 |

`commonMoistureOnlyFactorCompatibleWithBoth: false` under conservative ±0.05 kt bounds (non-overlapping ratio intervals). **One shared moisture-only factor is insufficient.** Crop-specific moisture, coverage, or version effects are not rejected. Inverse-implied moisture remains diagnostic only and is **not** recorded as measured national moisture.

DKFI-S008 documents that G9100 includes grain cereals harvested before maturity (Handbook guides toward C0000), but **gives no 2018 tonne allocation** of the residuals to that boundary. R5-S09 describes dried yield reporting and fresh-grain classes (tuorevilja etc.) without a quantitative 2018 bridge to C1100/C1300/G9100.

Evidence: `B07-C02`, `B07-C03`; sources `R5-CALC`, `DKFI-S004`, `R4-EU-S001`, `DKFI-S006`, `DKFI-S008`, `R5-S09`.

## Question 3 — Hva forklarer finske avlingsvarsler 2016/2020 uten å overskrive rapporterte celler?

**Answer (precise stop):** **Not explained** without the same moisture/item bridge. Frozen diagnostics:

- FI C1100 2020: reported 3.46 t/ha vs P/A ≈3.453823 t/ha; residual ≈+6.177 kg/ha; Luke 677.4 kt / 198.8 kha / 3410 kg/ha.
- FI C1300 2016: reported 3.68 t/ha vs P/A ≈3.672677 t/ha; residual ≈+7.323 kg/ha; Luke 1580.7 kt / 435.9 kha / 3630 kg/ha; year also crosses Luke §2.1 harvested-area method change (from 2016 sample-estimated harvest area).

**Rule retained:** do **not** overwrite reported Eurostat yield cells with P/A or fill missing cells with calculated values under the same name.

Evidence: `B07-C04`; sources `R5-CALC`, `R5-DEFINISJONER`, `R5-S09`.

## Owned gap dispositions

| Gap ID | Disposition | semanticGapClosed | Owner role |
|---|---|---|---|
| R4-G001 | `waiting_source_exact_document_required` | false | Luke transmission/method + FI Eurostat correspondent |
| DKFI-G001 | `waiting_source_exact_document_required` | false | Luke method owner |
| DKFI-G003 | `waiting_source_exact_document_required` | false | Luke / FI Eurostat correspondent |

New subgap: `B07-B07-20260909T102902Z-2f712e23-G01` — named transfer/revision file identity still missing.

## Exact document requirement (unsent)

Required: dated 2018 Luke↔Eurostat cereal transfer/revision annex containing version IDs; standard moisture % per crop (wheat, barley) for national and Eurostat bases; tonne-level dry/fresh ↔ C1100/C1300/G9100 mapping that explains or formally attributes +6.90/+17.09 kt; method note for FI 2016/2020 yield alerts **without** cell overwrite.

Unacceptable substitutes: one common moisture factor; inverse-implied moisture as measured; undated method pages; research-paper moisture leads.

Private checklist: `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/research-runs/20260909-beredskap-wave1/B07/B07-20260909T102902Z-2f712e23/required-document-B07.json` (sha256 `7fb3219bb91bf3c075c20b8a2b9a32172f3e37a1ccc3e5e9dfd7b39fa8335a33`).

## Limitations

- KI candidate only; `human_verified: false`.
- Private raw bytes live under round-004/005 artifact paths on this machine; portability requires authorized access to the same bytes.
- No new live fetches; no broad search; no owner contact.
- No new arithmetic beyond citing frozen round-005 calculation outputs.
- B09 may depend on this hash-bound terminal even while waiting_source.

## Coordination

No package start-dependency. Coordinate surfaces with coordinator only. Dual Luke/Eurostat series remain unharmonized until the annex arrives.
