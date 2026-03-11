#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent
SSB_API_ROOT = "https://data.ssb.no/api/v0/en/table"
EUROSTAT_API_ROOT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data"

START_SSB_MONTH = "2015M01"
START_EUROSTAT_MONTH = "2015-01"
START_EUROSTAT_YEAR = "2015"
REBASE_MONTH = "2020-01"
COUNTRIES = ["DK", "FI", "NO", "SE"]
COUNTRY_NAMES = {
    "DK": "Denmark",
    "FI": "Finland",
    "NO": "Norway",
    "SE": "Sweden",
}


def curl_json(url: str, payload: dict | None = None) -> dict:
    cmd = ["curl", "-sS", url]
    if payload is not None:
        cmd = [
            "curl",
            "-sS",
            "-X",
            "POST",
            url,
            "-H",
            "Content-Type: application/json",
            "--data",
            json.dumps(payload),
        ]
    output = subprocess.check_output(cmd, text=True)
    return json.loads(output)


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def ssb_metadata(table: str) -> dict:
    return curl_json(f"{SSB_API_ROOT}/{table}/")


def ssb_dimension_values(metadata: dict, code: str) -> list[str]:
    variable = next(item for item in metadata["variables"] if item["code"] == code)
    return variable["values"]


def ssb_base_period(metadata: dict, content_code: str) -> str | None:
    for variable in metadata["variables"]:
        if variable["code"] == "ContentsCode":
            payload = variable.get("extension", {}).get("basePeriod", {})
            return payload.get(content_code)
    return None


def month_code_to_date(code: str) -> str:
    return f"{code[:4]}-{code[5:7]}"


def date_to_month_code(date_value: str) -> str:
    year, month = date_value.split("-")
    return f"{year}M{month}"


def float_or_blank(value: float | None) -> str:
    if value is None:
        return ""
    return f"{value:.3f}"


def fetch_ssb_series(
    *,
    table: str,
    dimension_code: str,
    dimension_value: str,
    content_code: str,
    extra_dimensions: list[tuple[str, str]] | None = None,
    start_month: str = START_SSB_MONTH,
) -> tuple[list[dict], dict]:
    metadata = ssb_metadata(table)
    months = [value for value in ssb_dimension_values(metadata, "Tid") if value >= start_month]
    query = []
    if extra_dimensions:
        for code, value in extra_dimensions:
            query.append(
                {
                    "code": code,
                    "selection": {"filter": "item", "values": [value]},
                }
            )
    query.extend(
        [
            {
                "code": dimension_code,
                "selection": {"filter": "item", "values": [dimension_value]},
            },
            {
                "code": "ContentsCode",
                "selection": {"filter": "item", "values": [content_code]},
            },
            {
                "code": "Tid",
                "selection": {"filter": "item", "values": months},
            },
        ]
    )
    payload = {"query": query, "response": {"format": "json-stat2"}}
    dataset = curl_json(f"{SSB_API_ROOT}/{table}/", payload)

    time_index = dataset["dimension"]["Tid"]["category"]["index"]
    ordered_months = sorted(time_index, key=time_index.get)
    values = dataset["value"]
    if len(ordered_months) != len(values):
        raise RuntimeError(f"Unexpected value count for SSB table {table}")

    rows = []
    for month_code, raw_value in zip(ordered_months, values):
        rows.append(
            {
                "Date": month_code_to_date(month_code),
                "MonthCode": month_code,
                "Value": float(raw_value),
            }
        )

    series_meta = {
        "table": table,
        "updated": dataset.get("updated"),
        "label": dataset.get("label"),
        "notes": dataset.get("note", []),
        "base_period": dataset["dimension"]["ContentsCode"]
        .get("extension", {})
        .get("basePeriod", {})
        .get(content_code, ssb_base_period(metadata, content_code)),
        "row_count": len(rows),
        "start": rows[0]["Date"],
        "end": rows[-1]["Date"],
    }
    return rows, series_meta


def unravel_index(flat_index: int, sizes: list[int]) -> list[int]:
    coords: list[int] = []
    remainder = flat_index
    for size in reversed(sizes):
        coords.append(remainder % size)
        remainder //= size
    return list(reversed(coords))


def eurostat_cube(url: str) -> dict:
    return curl_json(url)


def eurostat_wide_rows(dataset: dict, time_key: str, value_name: str) -> list[dict]:
    ids = dataset["id"]
    sizes = dataset["size"]
    dimensions = dataset["dimension"]

    codes_by_dim: dict[str, list[str]] = {}
    for dim in ids:
        inverse = {index: code for code, index in dimensions[dim]["category"]["index"].items()}
        codes_by_dim[dim] = [inverse[idx] for idx in range(len(inverse))]

    value_lookup = {int(index): value for index, value in dataset["value"].items()}
    output: dict[str, dict[str, str]] = {}

    for flat_index, value in value_lookup.items():
        coords = unravel_index(flat_index, sizes)
        coord_codes = {dim: codes_by_dim[dim][coord] for dim, coord in zip(ids, coords)}
        time_value = coord_codes[time_key]
        geo = coord_codes["geo"]
        output.setdefault(time_value, {time_key.title(): time_value})
        output[time_value][geo] = f"{float(value):.3f}"

    rows = []
    for time_value in sorted(output):
        row = output[time_value]
        ordered = {time_key.title(): time_value}
        for geo in COUNTRIES:
            ordered[geo] = row.get(geo, "")
        rows.append(ordered)
    return rows


def rebase(rows: list[dict], base_date: str) -> dict[str, float]:
    lookup = {row["Date"]: float(row["Value"]) for row in rows}
    base_value = lookup[base_date]
    return {date_value: (value / base_value) * 100 for date_value, value in lookup.items()}


def build_combined_series(
    kpi_current: list[dict],
    kpi_archive: list[dict],
    ppi: list[dict],
) -> tuple[list[dict], dict]:
    kpi_current_lookup = {row["Date"]: float(row["Value"]) for row in kpi_current}
    kpi_archive_lookup = {row["Date"]: float(row["Value"]) for row in kpi_archive}
    ppi_lookup = {row["Date"]: float(row["Value"]) for row in ppi}

    kpi_indexed = rebase(kpi_current, REBASE_MONTH)
    kpi_archive_indexed = rebase(kpi_archive, REBASE_MONTH)
    ppi_indexed = rebase(ppi, REBASE_MONTH)

    shared_dates = sorted(set(kpi_current_lookup) & set(ppi_lookup))
    rows = []
    bridge_deltas: list[float] = []

    for date_value in shared_dates:
        archive_value = kpi_archive_lookup.get(date_value)
        archive_indexed = kpi_archive_indexed.get(date_value)
        bridge_delta = None
        if archive_indexed is not None:
            bridge_delta = kpi_indexed[date_value] - archive_indexed
            bridge_deltas.append(abs(bridge_delta))

        rows.append(
            {
                "Date": date_value,
                "KPI_14700": f"{kpi_current_lookup[date_value]:.3f}",
                "KPI_03013": float_or_blank(archive_value),
                "PPI_12462": f"{ppi_lookup[date_value]:.3f}",
                "KPI_Indexed": f"{kpi_indexed[date_value]:.2f}",
                "PPI_Indexed": f"{ppi_indexed[date_value]:.2f}",
                "Spread": f"{kpi_indexed[date_value] - ppi_indexed[date_value]:.2f}",
                "KPI_Archive_Indexed": float_or_blank(archive_indexed),
                "KPI_Bridge_Delta": float_or_blank(bridge_delta),
            }
        )

    summary = {
        "rebase_month": REBASE_MONTH,
        "row_count": len(rows),
        "start": rows[0]["Date"],
        "end": rows[-1]["Date"],
        "bridge_overlap_months": len(bridge_deltas),
        "bridge_max_abs_delta": round(max(bridge_deltas), 4) if bridge_deltas else None,
        "bridge_mean_abs_delta": round(sum(bridge_deltas) / len(bridge_deltas), 4) if bridge_deltas else None,
    }
    return rows, summary


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    kpi_current_rows, kpi_current_meta = fetch_ssb_series(
        table="14700",
        dimension_code="VareTjenesteGrp",
        dimension_value="01",
        content_code="KpiIndMnd",
    )
    kpi_archive_rows, kpi_archive_meta = fetch_ssb_series(
        table="03013",
        dimension_code="Konsumgrp",
        dimension_value="01",
        content_code="KpiIndMnd",
    )
    ppi_rows, ppi_meta = fetch_ssb_series(
        table="12462",
        dimension_code="NaringUtenriks",
        dimension_value="SNN10",
        content_code="Indeksnivo",
        extra_dimensions=[("Marked", "01")],
    )

    hicp_dataset = eurostat_cube(
        f"{EUROSTAT_API_ROOT}/prc_hicp_midx"
        f"?lang=EN&freq=M&unit=I15&coicop=CP01&sinceTimePeriod={START_EUROSTAT_MONTH}"
        + "".join(f"&geo={country}" for country in COUNTRIES)
    )
    hicp_rows = eurostat_wide_rows(hicp_dataset, time_key="time", value_name="HICP")

    price_levels_dataset = eurostat_cube(
        f"{EUROSTAT_API_ROOT}/prc_ppp_ind"
        f"?lang=EN&freq=A&na_item=PLI_EU27_2020&ppp_cat=A0101&sinceTimePeriod={START_EUROSTAT_YEAR}"
        + "".join(f"&geo={country}" for country in COUNTRIES)
    )
    price_level_rows = eurostat_wide_rows(price_levels_dataset, time_key="time", value_name="PriceLevelIndex")

    combined_rows, combined_meta = build_combined_series(
        kpi_current=kpi_current_rows,
        kpi_archive=kpi_archive_rows,
        ppi=ppi_rows,
    )

    write_csv(
        DATA_DIR / "ssb_kpi_14700_food_non_alcoholic_beverages.csv",
        ["Date", "MonthCode", "Value"],
        kpi_current_rows,
    )
    write_csv(
        DATA_DIR / "ssb_kpi_03013_food_non_alcoholic_beverages.csv",
        ["Date", "MonthCode", "Value"],
        kpi_archive_rows,
    )
    write_csv(
        DATA_DIR / "ssb_ppi_12462_food_products_domestic_market.csv",
        ["Date", "MonthCode", "Value"],
        ppi_rows,
    )
    write_csv(
        DATA_DIR / "eurostat_hicp_food_monthly_2015_2026.csv",
        ["Time", *COUNTRIES],
        hicp_rows,
    )
    write_csv(
        DATA_DIR / "eurostat_price_level_indices_food_2015_2024.csv",
        ["Time", *COUNTRIES],
        price_level_rows,
    )
    write_csv(
        DATA_DIR / "prisindekser-2015-2026.csv",
        [
            "Date",
            "KPI_14700",
            "KPI_03013",
            "PPI_12462",
            "KPI_Indexed",
            "PPI_Indexed",
            "Spread",
            "KPI_Archive_Indexed",
            "KPI_Bridge_Delta",
        ],
        combined_rows,
    )

    metadata = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "ssb": {
            "14700": kpi_current_meta,
            "03013": kpi_archive_meta,
            "12462": ppi_meta,
        },
        "eurostat": {
            "prc_hicp_midx": {
                "updated": hicp_dataset.get("updated"),
                "label": hicp_dataset.get("label"),
                "row_count": len(hicp_rows),
                "start": hicp_rows[0]["Time"],
                "end": hicp_rows[-1]["Time"],
                "countries": {code: COUNTRY_NAMES[code] for code in COUNTRIES},
            },
            "prc_ppp_ind": {
                "updated": price_levels_dataset.get("updated"),
                "label": price_levels_dataset.get("label"),
                "row_count": len(price_level_rows),
                "start": price_level_rows[0]["Time"],
                "end": price_level_rows[-1]["Time"],
                "countries": {code: COUNTRY_NAMES[code] for code in COUNTRIES},
                "na_item": "PLI_EU27_2020",
                "ppp_cat": "A0101",
            },
        },
        "combined_series": combined_meta,
    }

    with (DATA_DIR / "price_series_metadata.json").open("w") as handle:
        json.dump(metadata, handle, indent=2)

    print("Wrote:")
    for filename in [
        "ssb_kpi_14700_food_non_alcoholic_beverages.csv",
        "ssb_kpi_03013_food_non_alcoholic_beverages.csv",
        "ssb_ppi_12462_food_products_domestic_market.csv",
        "eurostat_hicp_food_monthly_2015_2026.csv",
        "eurostat_price_level_indices_food_2015_2024.csv",
        "prisindekser-2015-2026.csv",
        "price_series_metadata.json",
    ]:
        print(f"  - {filename}")


if __name__ == "__main__":
    main()
