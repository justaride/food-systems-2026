# B16 findings — Island: foredlingsaktører og leverbar matkjede

- programRunId: `20260909-beredskap-wave1`
- packageId: `B16`
- runId: `B16-20260909T103514Z-5f548c04`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- headCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- terminalStatus: `complete_within_scope`
- human_verified: false
- createdAt: `2026-09-09T11:05:00Z` (UTC) / Europe/Oslo CEST 2026-09-09 13:05

## Scope

Actor identity/permit/current operations and one chain from grain to deliverable food under import interruption. C5; P1/P2/P3. Coordinate with B15 (no start dependency). No emails, no publish, no edits to research-plan/ or prior rounds.

**Stop rule applied:** Virksomhetsliste er ikke disponibel kapasitet. Aktør-/produktidentitet, mat/fôr og faktisk drift må skilles. Ingen nasjonal kapasitet fra ett gårdsanlegg.

## Question 1 — 2026-status Þorvaldseyri/Eyrarbúið og Korngrís?

**Answer:** Public 2026-accessible pages do **not** document these as verified active **food-cereal mills** with dated ops logs.

| Actor | 2026-09-09 evidence | Supports | Does not support |
|---|---|---|---|
| Þorvaldseyri site | Historical 2008–2009 Eyrarbúið/Kornax flour distribution; dryer history | Historical identity | 2025/2026 food-mill ops |
| Eyrarbúið / Lífland | Byggmjöl 20 kg; not for sale in webshop | Listing; onlinePurchaseAvailableAtRead=false | General availability; capacity; food permit |
| Eyrarbúið / MAST | **A981 Feed** Frum 3 — Óbein þurrkun á korni | Feed-permit identity | Food milling approval or capacity |
| Korngrís | Við munum selja; no products; no MAST/HD name hits | Marketing intent | Active production/capacity |
| BBL 2025-09-19 | Drying; ~half to beer; some byggmjöl to bakeries | Secondary nowcast | Primary capacity/food-permit proof |

Evidence: B16-C02, B16-C03, B16-C04.

## Question 2 — Matgodkjenninger og kapasitetsdefinisjoner?

**Answer:** Registers obtained (A4-L014 timeout cleared). Capacity definitions **absent**.

1. Municipal HD licenses plant-based food processors; MAST Food approved sections (2026-09-09) have **no cereal-milling section**.
2. Identity-only hits: A981 Eyrarbúið Feed Frum 3; A848 Sandhóll bú Feed Frum 3; SF-2669 Móðir Jörð plant packing class.
3. «korn» Food hits include address false friends (Korngarðar fish), not flour mills.
4. Secondary Húsavík dryer aim «hátt í fimm hundruð tonn» is **not** national capacity (stop rule).
5. KORNAX 2025-04-11: local wheat milling stopped; Valsemøllen DK thereafter.

Evidence: B16-C03, B16-C05, B16-C07, B16-C04.

## Question 3 — 1% teller/nevner og leveransekjede?

**1%:** **No** compatible reconstruction. `reconstructedShare=null`. Not updated to 2026.

**Chain:** Still missing linked reserve→dry→food mill/roll→pack→energy/transport/staff→activation→deliverable food. Lists/one-farm signals do not close A4-G007.

Evidence: B16-C01, B16-C06.

## Owned gap dispositions

| Gap ID | Disposition | Closed | Owner |
|---|---|---|---|
| A4-G003 | waiting_source_compatible_dataset | false | LBHI / Statistics Iceland |
| A4-G004 | waiting_source_capacity_definitions | false | Named processors |
| A4-G005 | partial_register_obtained_still_waiting_food_plant_completeness | false | MAST + municipal inspectors |
| A4-G006 | waiting_owner_dated_ops_evidence | false | Þorvaldseyri/Eyrarbúið; Korngrís |
| A4-G007 | waiting_source_linked_chain | false | Cross-ministry + MAST + processors |

New subgap: `B16-B16-20260909T103514Z-5f548c04-G01` — license PDF/codebook (A981.pdf 404).

## Exact document requirements (unsent)

Private: `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/research-runs/20260909-beredskap-wave1/B16/B16-20260909T103514Z-5f548c04/required-document-B16.json` sha256 `1da6016d226aa34e211aed2584df98266106e4ea23de2a583c0f9f3f9bd8e1be`.

## Limitations

- human_verified: false
- Private raw under `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/research-runs/20260909-beredskap-wave1/B16/B16-20260909T103514Z-5f548c04`
- No owner contact; no publish; no research-plan edits
- A4 Rit hash string typo vs verified bytes noted
- B15 coordination interface only; no mutual wait
