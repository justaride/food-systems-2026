# Nordic Analysis Panel: First Findings

**Generated from:** `research/data/nordic/analysis-panel/nordic_harmonized_panel.csv`

## Price signal

Latest common price month in the harmonized food HICP panel is **2025-12**.

- Highest food price index: **IS** at **154.3**, or **54.4%** above the 2015 base.
- Lowest food price index: **FI** at **126.6**, or **26.6%** above the 2015 base.
- Ranking in the latest month: **IS > SE > NO > DK > FI**.

## Trade signal

The trade comparison is **index-only**, not level-comparable, because currencies and source construction differ. The safest shared window is **2022-01 to 2025-12**, rebased to **2022-01 = 100**.

- Strongest import growth in the common window: **IS** at **140.9** in **2025-12**.
- Strongest export growth in the common window: **SE** at **115.9** in **2025-12**.
- Sharpest export decline in the common window: **NO** at **78.1** in **2025-12**.

## Production signal

The directly comparable production subgroup is oats output in **FI/NO/SE**, standardized to **1,000 tonnes**.

- Latest oats leader in absolute volume: **FI** with **1207.5** thousand tonnes in **2024**.
- Common latest step from **2023 to 2024**: **FI +19.8% ; NO +45.4% ; SE +51.3%**.
- Change since 2010: **FI +49.1% ; NO -18.5% ; SE +11.3%**.
- Norway is the only oats series extending to **2025** in the current panel; Finland and Sweden currently end in **2024**.

## Fallback series

The panel also keeps country-specific fallback series outside the pooled comparison:

- Finland agri-food trade imports index: **151.499** in **2024-12**.
- Finland agri-food trade exports index: **173.437** in **2024-12**.
- Denmark cereals output value fallback: **11534.000 m DKK** in **2024**.
- Iceland beef production fallback: **4.674 1,000 tonnes** in **2025**.

## Caveats

- `level_comparable` rows can be compared directly across countries.
- `index_only` rows should be read as movement from each series' own base period, not as raw cross-country levels.
- `fallback_only` rows are retained for context but should not be pooled into the main Nordic comparison.
