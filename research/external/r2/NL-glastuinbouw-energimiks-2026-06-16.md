# NL glastuinbouw — energimiks (benchmark context, NL — IKKE Nordisk bevis)

**Task:** DRO-R2-06 · Closing data gap: energy mix of Dutch greenhouse horticulture (glastuinbouw) as a benchmark/contrast case for Norway.
**Date:** 2026-06-16
**Status label:** All figures below are **benchmark context (NL)** — factual NL statistics. They are NOT to be used as Nordic effectiveness / pilot-maturity proof. (Guardrail note: this file uses Wageningen Economic Research *statistical energy data* only; it does NOT invoke the WUR-score or Moerman ladder.)

---

## Method note

**Two distinct source families — do NOT blend them:**

1. **CBS official statistics (StatLine OData).**
   - **Primary structural table: `80382ned` — "Energieverbruik land- en tuinbouw 1990-2013"** (`https://opendata.cbs.nl/ODataApi/odata/80382ned/`). This is the only CBS StatLine table that gives a clean PJ-by-source split *for the glastuinbouw sub-sector* (`totglas`). **It is DISCONTINUED after reference year 2013** (CBS switched to utility customer files in 2015). Used here only to show CBS's source structure and the last CBS sub-sector breakdown; the values are 2013, not current.
   - **CBS API GET worked.** `DataProperties` + `TypedDataSet?$filter=...&$select=...` both returned clean JSON. No POST needed.
   - **Current CBS gas figure for glastuinbouw** comes from CBS's additional-statistics longread **"Aardgasverbruik glastuinbouw in Nederland" (2023)** (`https://www.cbs.nl/nl-nl/longread/aanvullende-statistische-diensten/2023/aardgasverbruik-glastuinbouw-in-nederland`). This is a CBS–WUR reconciliation study covering **only area + natural-gas use** (explicitly *not* heat/electricity/geothermal). General agricultural energy now sits in the Energiebalans tables (`83989NED`, `83140NED`), where the glastuinbouw *gas* line is split out — but those tables do not reproduce the full glastuinbouw source mix.
   - **CBS does NOT publish a current standalone "glastuinbouw energy-source mix" table.** For the full source split (WKK / aardwarmte / restwarmte / duurzaam), the authoritative source is the WUR monitor below.

2. **WUR Energiemonitor (authoritative for the source split).**
   - **Edition: "Energiemonitor van de Nederlandse glastuinbouw 2024", Pepijn Smit, Wageningen Social & Economic Research, Rapport 2025-150, oktober 2025, 48 pp.** PDF: `https://edepot.wur.nl/702373` · DOI `https://doi.org/10.18174/702373`. Commissioned by Stichting Kennis in je Kas (Glastuinbouw Nederland) + ministry LVVN, programme *Kas als Energiebron*.
   - Reference year **2024 = voorlopig (provisional)**; 2023 = definitief. Earlier edition (2023) PDF: `https://www.kasalsenergiebron.nl/content/onderzoeken/2024/Energiemonitor_Glastuinbouw_2023.pdf`.

---

## Table A — CBS official statistics (StatLine `80382ned`, glastuinbouw `totglas`)

| Indicator | Value | Unit | Year | Geography | Source owner | Realized/Target |
|---|---|---|---|---|---|---|
| Aardgas (natural gas), PJ | 120.2 | PJ | 2013 | NL glastuinbouw | CBS | REALIZED (discontinued series) |
| Aardgas, physical | 3,797 | mln m³ | 2013 | NL glastuinbouw | CBS | REALIZED |
| Aanvoer warmte van buiten de landbouw (external/residual heat incl. third-party CHP) | 4.2 | PJ | 2013 | NL glastuinbouw | CBS | REALIZED |
| Elektriciteit (net, negative = sector is net producer) | −15.3 | PJ | 2013 | NL glastuinbouw | CBS | REALIZED |
| Elektriciteit, physical (net) | −4,257 | mln kWh | 2013 | NL glastuinbouw | CBS | REALIZED |
| Overige fossiele brandstof voor warmte | 0.0 | PJ | 2013 | NL glastuinbouw | CBS | REALIZED |

Source URL (data): `https://opendata.cbs.nl/ODataApi/odata/80382ned/TypedDataSet?$filter=startswith(Perioden,'2013')`
Locator: row `SectorenEnBedrijfstypen = "totglas"`, `Perioden = "2013JJ00"`.
**Note:** CBS `80382ned` has **no separate geothermal (aardwarmte) line** — geothermal is implicit and only itemised by WUR. The negative electricity confirms glastuinbouw is a **net electricity producer** via aardgas-WKK (since 2006).

**Current CBS gas figure (separate source):** CBS found **~3.9 billion m³** natural gas for glastuinbouw in **2021** (vs WEcR preliminary **3.7 billion m³**); the reconciliation study confirms "ten minste 3 miljard m³ aardgas" is consumed by the sector. Source: CBS longread *Aardgasverbruik glastuinbouw in Nederland*, 2023 (lines on the 3.9 vs 3.7 mld m³ discrepancy). **CBS official, area+gas only — does not give the full mix.**

---

## Table B — WUR Energiemonitor 2024 energy-source split (the authoritative mix)

Geography = NL glastuinbouw; Source owner = Wageningen Social & Economic Research (Rapport 2025-150); Year = **2024 (provisional)** unless noted. All REALIZED.

| Item | Value | Unit | Locator (page / table / fig) |
|---|---|---|---|
| **Total energy use** | ~95 (≈94.6) | PJ | Samenvatting p.6 / §2.3 p.19 (+2.6%, +2.4 PJ vs 2023) |
| Energy use per m² (temp-corrected) | 0.99 | GJ/m² | §2.3 p.19 |
| **Gas / WKK (CHP)** — sector runs CHP on ~60–65% of area; gas-WKK is the backbone | 60–65% of area on WKK | % of area | §4.1 p.31 |
| WKK installed electrical capacity | 2,700–2,800 | MWel (+4%) | §4.2 p.31 (fig 4.1) |
| WKK full-load running hours | ~3,600 | h/yr (stable) | §4.2 p.33 (fig 4.2) |
| WKK electricity **production** | 10 | billion kWh (+4%) | §4.3 p.33 |
| Electricity **purchase** (inkoop) | 2.8 | TWh (−14%) | Tabel 2.1 p.19 |
| Electricity **sale** (verkoop, net producer) | 6.4 | TWh (−3%) | Tabel 2.1 p.19 |
| **Aardwarmte (geothermal) — total** | 7.1 | PJ (+9%) | §3.2.2 p.27; 17 projects in operation |
| — of which own-risk projects | 3.6 | PJ | §3.2.2 p.27 / Tabel 3.1 |
| — of which purchased external | 3.5 | PJ | §3.2.2 p.27 |
| **Restwarmte / inkoop niet-duurzame warmte van derden** (purchased non-renewable heat) | 1.8 | PJ (+6%) | Tabel 2.1 p.19 |
| Biobrandstof (biomass heat) | 4.9 | PJ (~stable) | §3.2.2 p.27 / Tabel 3.1 |
| Zonne-energie (solar heat+PV) | ~0.9 | PJ (+2%) | §3.2.2 p.27 |
| **Total duurzame energie (renewables) use** | 14.3 | PJ (+10%, +1.4 PJ) | §2.5.2 p.22 / §3.2.1 p.24 |
| **Duurzame energie share** | **15.1%** | % of total energy use | §2.5.2 p.22 / fig 2.9 (was 14.0% in 2023) |
| — renewable split: heat / electricity | 89% / 11% | % | §3.2.2 p.25 |
| — own production / purchased | 48% / 52% | % | §3.2.1 / Tabel 3.1 |
| Share energy *without CO2-emission for sector* (renewables + purchased heat + purchased elec) | ~26% (24.9 PJ) | % / PJ | §2.5.1 p.22 (−1.7 pp vs 2023) |
| **Total CO2 emission** | 5.2 | Mton (+0.1) | Samenvatting p.6 (still below pre-2022) |
| CO2 per m² (cultivation, temp-corrected) | ~37 | kg CO2/m² (+2) | Samenvatting p.6 |
| Total greenhouse-gas emission (incl. CH4 slip) | 6.3 | Mton CO2-eq (+2.7%) | §2.1 p.18 (5.2 Mt CO2 + 1.1 Mt methane-slip, 100% WKK) |
| **External CO2 purchase (OCAP-type supply to greenhouses)** | 0.73 | Mton (+12%) | §3.4 p.30 (fig 3.6); >¾ of area doses CO2; ~7 kg/m² sector-avg, 20–30 kg/m² where applied |

**National context for the renewable share:** NL as a whole was 19.8% renewable in 2024 (CBS); glastuinbouw lags at 15.1% because its demand is heat-dominated and the heat transition is slower than the electricity transition (§2.5.2 p.22).

---

## What is Nordic-relevant mechanism vs NL-specific

- **Transferable mechanism (relevant to Norway):**
  - **Geothermal (aardwarmte) as a baseload greenhouse heat source** — 7.1 PJ from 17 operating projects, with a shared-risk participation model (own vs purchased ~50/50). The *project + risk-sharing + heat-grid* structure is the portable lesson, not the absolute tonnage.
  - **Purchased residual heat (restwarmte) from industry/power plants** (1.8 PJ non-renewable + part of the 6.0 PJ purchased sustainable heat) — i.e. greenhouses as a heat sink for industrial waste heat.
  - **External CO2 supply (OCAP) as an enabling input for decarbonisation** — the key NL insight is that phasing out gas removes flue-gas CO2 needed for plant growth, so a *separate CO2 supply chain* is a prerequisite for the heat transition. Directly relevant to any Norwegian greenhouse decarbonisation plan.
- **NL-specific (do NOT generalise to Norway):**
  - The **aardgas-WKK net-electricity-exporter** model (sector sells 6.4 TWh, net producer since 2006) is a Dutch-gas-market and grid artefact. Norway's near-zero-carbon hydropower grid makes the "CHP for grid balancing + electricity sales" logic largely irrelevant. NL renewable share is *held back* precisely because cheap gas-WKK competes with geothermal; Norway's starting point (clean grid electricity) is structurally different.
  - Absolute scale (~95 PJ, 10,038 ha) is an order of magnitude beyond Norwegian greenhouse horticulture.

---

## Target 3 — side-stream valorisation national overview (gap status)

**Status: CONFIRMED — no single national open NL source aggregates *tonnes of food side-stream valorisation* across actors.** (Matches prior round.)

- The closest national instrument is the **Monitor Voedselverspilling** (food-waste monitor), which reports total food residual streams **by destination** (animal feed, anaerobic digestion, composting, incineration, landfill) — i.e. *disposal/destination* tonnage, not a clean "valorised tonnes" aggregate, and framed around waste rather than valorisation.
- **Topsector Agri & Food / TKI** and **RVO** document *projects and subsidies* for valorisation (e.g. MIT, KIA Missie 4 Voedsel), but publish no consolidated national tonnage.
- No CBS StatLine table aggregates cross-actor valorisation tonnage.
- **Verdict:** gap remains open; do not force a number.

Sources: `https://samentegenvoedselverspilling.nl/kennisbank/voedselverwerking-sector` · `https://topsectoragrifood.nl/over/` · `https://www.kia-landbouwwatervoedsel.nl/missie-4-voedsel/missie-4-voedsel/`

---

## Still missing / "ikke hentet"

- **CBS current (2020–2024) glastuinbouw *full source mix* in one official table** — does not exist; CBS only publishes the gas line currently (Energiebalans `83989NED`/`83140NED`) + the 2021 reconciliation. *Ikke hentet* (because not published).
- **CBS Energiebalans `83989NED` exact glastuinbouw aardgas PJ value for 2023/2024** — table exists and splits glastuinbouw gas, but the specific cell was not pulled here. *Ikke hentet.*
- **WUR exact total energy-use PJ to 1 decimal for 2024** — report states "bijna 95 PJ" / "+2.4 PJ vs 2023"; exact decimal in Bijlage 3 not transcribed. *Ikke hentet (approx ~94.6 PJ).*
- **Number of aardwarmte projects vs doublets/triplets detail** — 17 projects stated; sub-count not fully itemised. Partly retrieved.
- **OCAP-specific (the named pipeline operator) volume** — report gives total external CO2 (0.73 Mton) split central/local, not OCAP-by-name. *Ikke hentet (OCAP not separately named in the figure).* 

---

## Source URLs (exact)

- CBS `80382ned` table: `https://www.cbs.nl/nl-nl/cijfers/detail/80382ned` · OData root `https://opendata.cbs.nl/ODataApi/odata/80382ned/`
- CBS DataProperties: `https://opendata.cbs.nl/ODataApi/odata/80382ned/DataProperties`
- CBS TypedDataSet (2013 glastuinbouw): `https://opendata.cbs.nl/ODataApi/odata/80382ned/TypedDataSet?$filter=startswith(Perioden,'2013')`
- CBS Energiebalans, sector: `https://www.cbs.nl/nl-nl/cijfers/detail/83989NED`
- CBS Aardgasverbruik glastuinbouw longread (2023): `https://www.cbs.nl/nl-nl/longread/aanvullende-statistische-diensten/2023/aardgasverbruik-glastuinbouw-in-nederland?onepage=true`
- WUR Energiemonitor 2024 (Rapport 2025-150) PDF: `https://edepot.wur.nl/702373` · DOI `https://doi.org/10.18174/702373`
- WUR Energiemonitor 2023 PDF: `https://www.kasalsenergiebron.nl/content/onderzoeken/2024/Energiemonitor_Glastuinbouw_2023.pdf`
- Kamerbrief Energiemonitor 2023: `https://www.rijksoverheid.nl/documenten/kamerstukken/2024/11/19/energiemonitor-glastuinbouw-2023`
