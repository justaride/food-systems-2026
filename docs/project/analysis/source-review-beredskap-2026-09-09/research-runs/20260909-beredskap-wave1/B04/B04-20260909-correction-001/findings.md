# Korrigert kandidatretur B04-20260909-correction-001

- B04-C04: subset line numbers replaced by fulltext 512–545 and 1403–1412. Selected passage hashes are unchanged.

Resten av den historiske fagteksten er videreført fra B04-20260909T102531Z-f14ff7f2. Dette er ingen ny datainnhenting eller menneskelig godkjenning.

# B04 findings — Norsk kornkjede: fysisk lager, uttaksrett og foredling

- programRunId: `20260909-beredskap-wave1`
- packageId: `B04`
- runId: `B04-20260909T102531Z-f14ff7f2`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- terminalStatus: `waiting_owner`
- human_verified: false
- asOf: 2026-09-09T10:40:00Z

## Scope

Norwegian reserve/mill chain with Bjølsen case relevance; national aggregates kept separate from case-usable allocation. Stop rule applied: no conversion of plan/contract volume to stock at t0; no normal production as available crisis capacity; production measurements outside mandate.

## Question 1 — Datert fysisk beholdning, matklasse, lokasjon, eier, uttaksrett og bindende annen allokering?

**Answer (precise stop): Not available for 2026-09-08 / t0 in authorized channels.**

Known:
- Hash-verified A1-S001: **30 000 tonn mathvete** innkjøpt og lagt på lager **ved utgangen av 2025** (lines 3289–3297). Storage at grain traders and flour mills; no site split in cited passage (B04-C01).
- Contract/target pages: 82 500 tonn by 2029; 15 000 t/year; contract rounds 30 000 + 30 000 + 22 500; state owns grain not storage capacity; end-2024 note of 15 000 t on one page (B04-C02). **Not t0 stock.**
- Bjølsen advertorial «rundt 3 000 tonn beredskapskorn» lacks quality, ownership, release right, competing allocation, and t0 timestamp (B04-C05).
- R6-INTAKE-001 R6-G08 fields all null / unsent (B04-C06).

Unknown / stop:
- Physical tonnes at 2026-09-08 by location, food class, operator, state ownership, rotation.
- Binding non-overlapping allocation and release instrument to any named mill/bakery.

Next step: authorized owner intake (Ldir register + operator ledgers / R6-G08). No email from this package.

## Question 2 — Faktisk råvareinntak, godkjent mel/time, oppstart, utmaling/tap, pakking og tilgjengelig kapasitet?

**Answer (precise stop): No scenario-usable milling capacity established.**

Known:
- Advertorial intake claim 360 t grain/day at Bjølsen — normal-operations marketing figure; stop rule excludes as crisis capacity (B04-C05).
- 2023 historical unused-storage estimates (~107 270 / 63 400 / ~42 000 t) are not 2026 functional free capacity (B04-C04).
- Expert group started 2026-09-03; **final report due 15 March 2027** per appointment/mandate PDFs (B04-C03). News page omits year.
- status-delta operational quantities all null; R6-G09 null (B04-C06).

Unknown / stop:
- Grain t/h and approved flour t/h under scenario; startup; yield/bran/loss mass balance; packaging; reserves (power/fuel/water/staff).

## Question 3 — Hva kan knyttes til én mottaker og del-frist; hva mangler utover kontrakter/2029-mål?

**Answer: Nothing case-bound to Furuset Q1-T72 beyond commercial identity of Bjølsen as mill arm A; contracts/2029 target are not recipient allocations.**

Known:
- Case design (MAALEPROTOKOLL) requires R5-G03/G06 fields before any delivery claim.
- B03 finished `waiting_owner` for Furuset need/stock/reception — explicit interface gap `B04-B04-20260909T102531Z-f14ff7f2-G01` (no mutual wait).
- B01 delivery incomplete at start; Q1 method/limits interface recorded as `B04-B04-20260909T102531Z-f14ff7f2-G02`.
- 2023 offtake **design** exists; no demonstrated link state stock → named mill → Furuset (B04-C04/C06).

Missing beyond contracts/2029 target:
- Dated physical lots + release rights; non-overlapping allocation book; scenario milling/yield; timed offtake; recipient need/stock/reception (B03); Q1 acceptance bridge (B01/B03).

## Owned gap disposition

| gapId | disposition | semanticGapClosed |
|---|---|---|
| A1-G001 | remains_open_waiting_owner | false |
| A1-G002 | remains_open_waiting_owner | false |
| A1-G003 | remains_open_waiting_source_and_owner | false |
| A1-G004 | remains_open_waiting_owner | false |
| A1-G005 | remains_open_waiting_owner | false |
| A1-G007 | remains_open_waiting_owner | false |
| A1-G009 | remains_open_waiting_source | false |
| A1-G010 | remains_open_waiting_owner | false |
| R5-G03 | remains_open_waiting_owner | false |
| R5-G06 | remains_open_waiting_owner | false |
| B04-B04-20260909T102531Z-f14ff7f2-G01 | new_subgap_open_waiting_owner_and_coordination | false |
| B04-B04-20260909T102531Z-f14ff7f2-G02 | new_subgap_open_waiting_coordination | false |
| B04-B04-20260909T102531Z-f14ff7f2-G03 | new_subgap_open_waiting_owner | false |

No automatic gap closure. No `candidate_resolution_proposed` (operative t0 evidence absent).

## Limitations and contradictions

- End-2025 30 000 t (A1-S001) vs end-2024 15 000 t (B04-S005) are **different dates**, not treated as conflict.
- News «15. mars» vs PDFs «15. mars **2027**»: PDFs control deadline year.
- Felleskjøpet/other operator portfolio claims from A1 not re-used as national stock without re-hash in this run.
- Public negative finding ≠ proof private registers absent.
- No contacts, emails, publish, research-plan/round edits, or human_verified claims.

## Coordination notes

- **B01:** Q1/Regal method profile needed before milling output can be classified case-usable (`B04-B04-20260909T102531Z-f14ff7f2-G02`).
- **B03:** Furuset need/stock/reception waiting_owner; interface recorded, no mutual wait.
- **B06/B09:** Transport/packaging interfaces remain open; no quantities asserted here.
