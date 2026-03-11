#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).resolve().parent
CORE_DIR = DATA_DIR / "nordic" / "core-series"
OUTPUT_DIR = DATA_DIR / "nordic" / "analysis-panel"

CORE_FILES = [
    CORE_DIR / "prices_hicp_food_monthly.csv",
    CORE_DIR / "trade_monthly_first_panel.csv",
    CORE_DIR / "production_annual_first_panel.csv",
]

FIELDNAMES = [
    "theme",
    "comparison_group",
    "comparability_flag",
    "comparability_reason",
    "analysis_mode",
    "series_id",
    "series_family",
    "country",
    "period",
    "frequency",
    "flow",
    "source_name",
    "dataset_or_table_id",
    "metric",
    "coverage",
    "unit_raw",
    "value_raw",
    "unit_standardized",
    "value_standardized",
    "value_index_base100",
    "index_base_period",
    "analysis_unit",
    "analysis_value",
    "notes",
]

SUMMARY_FIELDS = [
    "series_id",
    "country",
    "theme",
    "series_family",
    "comparison_group",
    "comparability_flag",
    "analysis_mode",
    "start_period",
    "end_period",
    "observations",
    "frequency",
    "flow",
    "metric",
    "coverage",
    "unit_raw",
    "unit_standardized",
    "index_base_period",
    "notes",
]


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, payload: Any) -> None:
    with path.open("w") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=True)


def load_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for path in CORE_FILES:
        if not path.exists():
            raise FileNotFoundError(f"Missing core-series file: {path}")
        with path.open() as handle:
            rows.extend(csv.DictReader(handle))
    return rows


def period_sort_key(period: str) -> tuple[int, int, int]:
    if re.fullmatch(r"\d{4}-\d{2}", period):
        return (0, int(period[:4]), int(period[5:7]))
    if re.fullmatch(r"\d{4}-Q\d", period):
        return (1, int(period[:4]), int(period[-1]))
    if re.fullmatch(r"\d{4}", period):
        return (2, int(period), 0)
    return (9, 0, 0)


def numeric_string(value: float | None, decimals: int = 3) -> str:
    if value is None:
        return ""
    return f"{value:.{decimals}f}"


def find_base_value(series_rows: list[dict[str, str]]) -> tuple[str, float] | tuple[str, None]:
    for row in sorted(series_rows, key=lambda item: period_sort_key(item["period"])):
        value = float(row["value"])
        if value != 0:
            return row["period"], value
    if series_rows:
        return series_rows[0]["period"], None
    return "", None


def comparison_profile(row: dict[str, str]) -> dict[str, str]:
    if row["theme"] == "prices":
        return {
            "comparison_group": "nordic_food_price_index",
            "comparability_flag": "level_comparable",
            "comparability_reason": "Shared Eurostat HICP food index with common methodology and common 2015=100 base.",
            "analysis_mode": "level",
        }

    if row["series_family"] == "oats_production_quantity":
        return {
            "comparison_group": "nordic_oats_production_volume",
            "comparability_flag": "level_comparable",
            "comparability_reason": "FI, NO and SE are aligned to oats production in 1,000 tonnes.",
            "analysis_mode": "level",
        }

    if row["series_family"] == "total_goods_trade_monthly":
        return {
            "comparison_group": "nordic_total_goods_trade_change",
            "comparability_flag": "index_only",
            "comparability_reason": "Native currencies and source construction differ, so use rebased movement rather than raw levels.",
            "analysis_mode": "index",
        }

    if row["series_family"] == "agri_food_trade_monthly":
        return {
            "comparison_group": "fi_agri_food_trade_fallback",
            "comparability_flag": "fallback_only",
            "comparability_reason": "Coverage is Finland agri-food only, not total-goods trade, so it should not be pooled with the Nordic trade comparison.",
            "analysis_mode": "fallback",
        }

    if row["series_family"] == "cereals_output_value":
        return {
            "comparison_group": "dk_cereals_output_value_fallback",
            "comparability_flag": "fallback_only",
            "comparability_reason": "Value-based Danish cereals output is useful context but not directly comparable with the oats volume subgroup.",
            "analysis_mode": "fallback",
        }

    if row["series_family"] == "beef_production_quantity":
        return {
            "comparison_group": "is_beef_production_fallback",
            "comparability_flag": "fallback_only",
            "comparability_reason": "Iceland fallback is beef output, not oats, so it should be analyzed separately.",
            "analysis_mode": "fallback",
        }

    return {
        "comparison_group": "unclassified",
        "comparability_flag": "fallback_only",
        "comparability_reason": "No harmonization rule defined for this series.",
        "analysis_mode": "fallback",
    }


def standardize_value(row: dict[str, str]) -> tuple[str, str]:
    value = float(row["value"])
    unit = row["unit"]

    if unit in {"index (2015=100)", "1,000 tonnes"}:
        return unit, numeric_string(value)
    if unit == "tonnes":
        return "1,000 tonnes", numeric_string(value / 1000.0)
    return "", ""


def build_panel(rows: list[dict[str, str]]) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    by_series: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        by_series.setdefault(row["series_id"], []).append(row)

    base_lookup: dict[str, tuple[str, float | None]] = {
        series_id: find_base_value(series_rows) for series_id, series_rows in by_series.items()
    }

    panel_rows: list[dict[str, str]] = []
    summary_rows: list[dict[str, str]] = []

    for series_id, series_rows in sorted(by_series.items()):
        ordered_rows = sorted(series_rows, key=lambda item: period_sort_key(item["period"]))
        base_period, base_value = base_lookup[series_id]

        for row in ordered_rows:
            profile = comparison_profile(row)
            standardized_unit, standardized_value = standardize_value(row)
            raw_value = float(row["value"])
            value_index = None
            if base_value not in (None, 0):
                value_index = (raw_value / base_value) * 100.0

            analysis_unit = ""
            analysis_value = ""
            if profile["analysis_mode"] == "level":
                analysis_unit = standardized_unit or row["unit"]
                analysis_value = standardized_value or numeric_string(raw_value)
            elif profile["analysis_mode"] == "index":
                analysis_unit = "index (series base=100)"
                analysis_value = numeric_string(value_index) if value_index is not None else ""
            else:
                if standardized_unit:
                    analysis_unit = standardized_unit
                    analysis_value = standardized_value
                elif value_index is not None:
                    analysis_unit = "index (series base=100)"
                    analysis_value = numeric_string(value_index)
                else:
                    analysis_unit = row["unit"]
                    analysis_value = numeric_string(raw_value)

            panel_rows.append(
                {
                    "theme": row["theme"],
                    "comparison_group": profile["comparison_group"],
                    "comparability_flag": profile["comparability_flag"],
                    "comparability_reason": profile["comparability_reason"],
                    "analysis_mode": profile["analysis_mode"],
                    "series_id": series_id,
                    "series_family": row["series_family"],
                    "country": row["country"],
                    "period": row["period"],
                    "frequency": row["frequency"],
                    "flow": row["flow"],
                    "source_name": row["source_name"],
                    "dataset_or_table_id": row["dataset_or_table_id"],
                    "metric": row["metric"],
                    "coverage": row["coverage"],
                    "unit_raw": row["unit"],
                    "value_raw": numeric_string(raw_value),
                    "unit_standardized": standardized_unit,
                    "value_standardized": standardized_value,
                    "value_index_base100": numeric_string(value_index),
                    "index_base_period": base_period,
                    "analysis_unit": analysis_unit,
                    "analysis_value": analysis_value,
                    "notes": row["notes"],
                }
            )

        first = ordered_rows[0]
        summary_profile = comparison_profile(first)
        summary_unit, _ = standardize_value(first)
        summary_rows.append(
            {
                "series_id": series_id,
                "country": first["country"],
                "theme": first["theme"],
                "series_family": first["series_family"],
                "comparison_group": summary_profile["comparison_group"],
                "comparability_flag": summary_profile["comparability_flag"],
                "analysis_mode": summary_profile["analysis_mode"],
                "start_period": ordered_rows[0]["period"],
                "end_period": ordered_rows[-1]["period"],
                "observations": str(len(ordered_rows)),
                "frequency": first["frequency"],
                "flow": first["flow"],
                "metric": first["metric"],
                "coverage": first["coverage"],
                "unit_raw": first["unit"],
                "unit_standardized": summary_unit,
                "index_base_period": base_period,
                "notes": summary_profile["comparability_reason"],
            }
        )

    return panel_rows, summary_rows


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    rows = load_rows()
    panel_rows, summary_rows = build_panel(rows)

    harmonized_path = OUTPUT_DIR / "nordic_harmonized_panel.csv"
    comparable_path = OUTPUT_DIR / "nordic_comparable_panel.csv"
    change_path = OUTPUT_DIR / "nordic_change_comparison_panel.csv"
    summary_path = OUTPUT_DIR / "nordic_series_summary.csv"

    comparable_rows = [row for row in panel_rows if row["comparability_flag"] == "level_comparable"]
    change_rows = [
        row
        for row in panel_rows
        if row["comparability_flag"] in {"level_comparable", "index_only"}
    ]

    write_csv(harmonized_path, panel_rows, FIELDNAMES)
    write_csv(comparable_path, comparable_rows, FIELDNAMES)
    write_csv(change_path, change_rows, FIELDNAMES)
    write_csv(summary_path, summary_rows, SUMMARY_FIELDS)

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dependency": str((DATA_DIR / "fetch_nordic_core_series.py").relative_to(DATA_DIR.parent.parent)),
        "input_files": [str(path.relative_to(DATA_DIR.parent.parent)) for path in CORE_FILES],
        "output_files": {
            "harmonized_panel": str(harmonized_path.relative_to(DATA_DIR.parent.parent)),
            "comparable_panel": str(comparable_path.relative_to(DATA_DIR.parent.parent)),
            "change_panel": str(change_path.relative_to(DATA_DIR.parent.parent)),
            "series_summary": str(summary_path.relative_to(DATA_DIR.parent.parent)),
        },
        "row_counts": {
            "harmonized_panel": len(panel_rows),
            "comparable_panel": len(comparable_rows),
            "change_panel": len(change_rows),
            "series_summary": len(summary_rows),
        },
        "flag_definitions": {
            "level_comparable": "Raw or unit-standardized levels can be compared directly across the intended country group.",
            "index_only": "Compare rebased movement, not raw levels, because currencies or source construction differ.",
            "fallback_only": "Useful context series that should stay outside the pooled cross-country comparison.",
        },
    }
    write_json(OUTPUT_DIR / "panel_manifest.json", manifest)


if __name__ == "__main__":
    main()
