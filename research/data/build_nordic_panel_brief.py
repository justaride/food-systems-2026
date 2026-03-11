#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent
PANEL_PATH = DATA_DIR / "nordic" / "analysis-panel" / "nordic_harmonized_panel.csv"
TABLE_DIR = DATA_DIR / "nordic" / "analysis-panel" / "tables"
NOTE_PATH = DATA_DIR.parent / "norden" / "nordic-analysis-panel-first-findings.md"


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def load_rows() -> list[dict[str, str]]:
    with PANEL_PATH.open() as handle:
        return list(csv.DictReader(handle))


def latest_by_country(rows: list[dict[str, str]], group: str) -> list[dict[str, str]]:
    output: list[dict[str, str]] = []
    countries = sorted({row["country"] for row in rows if row["comparison_group"] == group})
    for country in countries:
        subset = [row for row in rows if row["comparison_group"] == group and row["country"] == country]
        latest_period = max(row["period"] for row in subset)
        output.append(next(row for row in subset if row["period"] == latest_period))
    return output


def build_price_snapshot(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    price_rows = [row for row in rows if row["comparison_group"] == "nordic_food_price_index"]
    latest_period = max(row["period"] for row in price_rows)
    latest = [row for row in price_rows if row["period"] == latest_period]
    ranked = sorted(latest, key=lambda row: float(row["analysis_value"]), reverse=True)

    output: list[dict[str, str]] = []
    for rank, row in enumerate(ranked, start=1):
        index_value = float(row["analysis_value"])
        output.append(
            {
                "rank": str(rank),
                "country": row["country"],
                "latest_period": latest_period,
                "hicp_food_index_2015_100": f"{index_value:.3f}",
                "change_since_2015_pct": f"{index_value - 100:.3f}",
            }
        )
    return output


def build_trade_snapshot(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    trade_rows = [row for row in rows if row["comparison_group"] == "nordic_total_goods_trade_change"]
    output: list[dict[str, str]] = []
    common_base_period = "2022-01"
    common_latest_period = "2025-12"
    for flow in ["imports", "exports"]:
        subset = [row for row in trade_rows if row["flow"] == flow]
        for country in sorted({row["country"] for row in subset}):
            country_rows = [row for row in subset if row["country"] == country]
            base = next(row for row in country_rows if row["period"] == common_base_period)
            latest = next(row for row in country_rows if row["period"] == common_latest_period)
            base_value = float(base["value_raw"])
            latest_value = float(latest["value_raw"])
            rebased_index = (latest_value / base_value) * 100.0
            output.append(
                {
                    "flow": flow,
                    "country": country,
                    "latest_period": common_latest_period,
                    "base_period": common_base_period,
                    "trade_index_common_base_2022_01_100": f"{rebased_index:.3f}",
                    "change_from_base_pct": f"{rebased_index - 100:.3f}",
                }
            )
    return output


def build_oats_snapshot(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    oats_rows = [row for row in rows if row["comparison_group"] == "nordic_oats_production_volume"]
    output: list[dict[str, str]] = []
    for country in sorted({row["country"] for row in oats_rows}):
        country_rows = [row for row in oats_rows if row["country"] == country]
        latest_period = max(row["period"] for row in country_rows)
        latest = next(row for row in country_rows if row["period"] == latest_period)
        base = next(row for row in country_rows if row["period"] == "2010")
        latest_value = float(latest["analysis_value"])
        base_value = float(base["analysis_value"])
        value_2023 = next((row for row in country_rows if row["period"] == "2023"), None)
        value_2024 = next((row for row in country_rows if row["period"] == "2024"), None)
        output.append(
            {
                "country": country,
                "latest_period": latest_period,
                "oats_production_1000_tonnes": f"{latest_value:.3f}",
                "base_period": "2010",
                "change_since_2010_pct": f"{((latest_value / base_value) - 1) * 100:.3f}",
                "value_2023_1000_tonnes": value_2023["analysis_value"] if value_2023 else "",
                "value_2024_1000_tonnes": value_2024["analysis_value"] if value_2024 else "",
                "change_2023_2024_abs_1000_tonnes": (
                    f"{float(value_2024['analysis_value']) - float(value_2023['analysis_value']):.3f}"
                    if value_2023 and value_2024
                    else ""
                ),
                "change_2023_2024_pct": (
                    f"{((float(value_2024['analysis_value']) / float(value_2023['analysis_value'])) - 1) * 100:.3f}"
                    if value_2023 and value_2024
                    else ""
                ),
            }
        )
    return output


def build_fallback_snapshot(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    fallback_rows = [row for row in rows if row["comparability_flag"] == "fallback_only"]
    keep_series = [
        "fi_agri_food_imports",
        "fi_agri_food_exports",
        "dk_cereals_output_value",
        "is_beef_production",
    ]
    output: list[dict[str, str]] = []
    for series_id in keep_series:
        series_rows = [row for row in fallback_rows if row["series_id"] == series_id]
        latest_period = max(row["period"] for row in series_rows)
        latest = next(row for row in series_rows if row["period"] == latest_period)
        display_value = latest["analysis_value"]
        display_unit = latest["analysis_unit"]
        if series_id == "dk_cereals_output_value":
            display_value = latest["value_raw"]
            display_unit = latest["unit_raw"]
        output.append(
            {
                "series_id": series_id,
                "country": latest["country"],
                "latest_period": latest_period,
                "metric": latest["metric"],
                "analysis_value": latest["analysis_value"],
                "analysis_unit": latest["analysis_unit"],
                "display_value": display_value,
                "display_unit": display_unit,
                "comparability_flag": latest["comparability_flag"],
            }
        )
    return output


def write_note(
    *,
    price_snapshot: list[dict[str, str]],
    trade_snapshot: list[dict[str, str]],
    oats_snapshot: list[dict[str, str]],
    fallback_snapshot: list[dict[str, str]],
) -> None:
    latest_price_period = price_snapshot[0]["latest_period"]
    top_price = price_snapshot[0]
    bottom_price = price_snapshot[-1]
    oats_change_line = " ; ".join(
        f"{row['country']} {float(row['change_since_2010_pct']):+.1f}%"
        for row in oats_snapshot
    )
    oats_2024_line = " ; ".join(
        f"{row['country']} {float(row['change_2023_2024_pct']):+.1f}%"
        for row in oats_snapshot
        if row["change_2023_2024_pct"]
    )

    imports = sorted(
        [row for row in trade_snapshot if row["flow"] == "imports"],
        key=lambda row: float(row["trade_index_common_base_2022_01_100"]),
        reverse=True,
    )
    exports = sorted(
        [row for row in trade_snapshot if row["flow"] == "exports"],
        key=lambda row: float(row["trade_index_common_base_2022_01_100"]),
        reverse=True,
    )

    oats_ranked = sorted(
        oats_snapshot,
        key=lambda row: float(row["oats_production_1000_tonnes"]),
        reverse=True,
    )

    note = f"""# Nordic Analysis Panel: First Findings

**Generated from:** `research/data/nordic/analysis-panel/nordic_harmonized_panel.csv`

## Price signal

Latest common price month in the harmonized food HICP panel is **{latest_price_period}**.

- Highest food price index: **{top_price['country']}** at **{float(top_price['hicp_food_index_2015_100']):.1f}**, or **{float(top_price['change_since_2015_pct']):.1f}%** above the 2015 base.
- Lowest food price index: **{bottom_price['country']}** at **{float(bottom_price['hicp_food_index_2015_100']):.1f}**, or **{float(bottom_price['change_since_2015_pct']):.1f}%** above the 2015 base.
- Ranking in the latest month: **{' > '.join(row['country'] for row in price_snapshot)}**.

## Trade signal

The trade comparison is **index-only**, not level-comparable, because currencies and source construction differ. The safest shared window is **2022-01 to 2025-12**, rebased to **2022-01 = 100**.

- Strongest import growth in the common window: **{imports[0]['country']}** at **{float(imports[0]['trade_index_common_base_2022_01_100']):.1f}** in **{imports[0]['latest_period']}**.
- Strongest export growth in the common window: **{exports[0]['country']}** at **{float(exports[0]['trade_index_common_base_2022_01_100']):.1f}** in **{exports[0]['latest_period']}**.
- Sharpest export decline in the common window: **{exports[-1]['country']}** at **{float(exports[-1]['trade_index_common_base_2022_01_100']):.1f}** in **{exports[-1]['latest_period']}**.

## Production signal

The directly comparable production subgroup is oats output in **FI/NO/SE**, standardized to **1,000 tonnes**.

- Latest oats leader in absolute volume: **{oats_ranked[0]['country']}** with **{float(oats_ranked[0]['oats_production_1000_tonnes']):.1f}** thousand tonnes in **{oats_ranked[0]['latest_period']}**.
- Common latest step from **2023 to 2024**: **{oats_2024_line}**.
- Change since 2010: **{oats_change_line}**.
- Norway is the only oats series extending to **2025** in the current panel; Finland and Sweden currently end in **2024**.

## Fallback series

The panel also keeps country-specific fallback series outside the pooled comparison:

- Finland agri-food trade imports index: **{next(row['analysis_value'] for row in fallback_snapshot if row['series_id'] == 'fi_agri_food_imports')}** in **{next(row['latest_period'] for row in fallback_snapshot if row['series_id'] == 'fi_agri_food_imports')}**.
- Finland agri-food trade exports index: **{next(row['analysis_value'] for row in fallback_snapshot if row['series_id'] == 'fi_agri_food_exports')}** in **{next(row['latest_period'] for row in fallback_snapshot if row['series_id'] == 'fi_agri_food_exports')}**.
- Denmark cereals output value fallback: **{next(row['display_value'] for row in fallback_snapshot if row['series_id'] == 'dk_cereals_output_value')} {next(row['display_unit'] for row in fallback_snapshot if row['series_id'] == 'dk_cereals_output_value')}** in **{next(row['latest_period'] for row in fallback_snapshot if row['series_id'] == 'dk_cereals_output_value')}**.
- Iceland beef production fallback: **{next(row['display_value'] for row in fallback_snapshot if row['series_id'] == 'is_beef_production')} {next(row['display_unit'] for row in fallback_snapshot if row['series_id'] == 'is_beef_production')}** in **{next(row['latest_period'] for row in fallback_snapshot if row['series_id'] == 'is_beef_production')}**.

## Caveats

- `level_comparable` rows can be compared directly across countries.
- `index_only` rows should be read as movement from each series' own base period, not as raw cross-country levels.
- `fallback_only` rows are retained for context but should not be pooled into the main Nordic comparison.
"""

    NOTE_PATH.write_text(note)


def main() -> None:
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    NOTE_PATH.parent.mkdir(parents=True, exist_ok=True)

    rows = load_rows()

    price_snapshot = build_price_snapshot(rows)
    trade_snapshot = build_trade_snapshot(rows)
    oats_snapshot = build_oats_snapshot(rows)
    fallback_snapshot = build_fallback_snapshot(rows)

    write_csv(
        TABLE_DIR / "latest_food_price_snapshot.csv",
        price_snapshot,
        ["rank", "country", "latest_period", "hicp_food_index_2015_100", "change_since_2015_pct"],
    )
    write_csv(
        TABLE_DIR / "trade_index_snapshot.csv",
        trade_snapshot,
        ["flow", "country", "latest_period", "base_period", "trade_index_common_base_2022_01_100", "change_from_base_pct"],
    )
    write_csv(
        TABLE_DIR / "oats_production_snapshot.csv",
        oats_snapshot,
        [
            "country",
            "latest_period",
            "oats_production_1000_tonnes",
            "base_period",
            "change_since_2010_pct",
            "value_2023_1000_tonnes",
            "value_2024_1000_tonnes",
            "change_2023_2024_abs_1000_tonnes",
            "change_2023_2024_pct",
        ],
    )
    write_csv(
        TABLE_DIR / "fallback_series_snapshot.csv",
        fallback_snapshot,
        [
            "series_id",
            "country",
            "latest_period",
            "metric",
            "analysis_value",
            "analysis_unit",
            "display_value",
            "display_unit",
            "comparability_flag",
        ],
    )

    write_note(
        price_snapshot=price_snapshot,
        trade_snapshot=trade_snapshot,
        oats_snapshot=oats_snapshot,
        fallback_snapshot=fallback_snapshot,
    )


if __name__ == "__main__":
    main()
