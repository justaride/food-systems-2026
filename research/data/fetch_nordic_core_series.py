#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


DATA_DIR = Path(__file__).resolve().parent
METADATA_DIR = DATA_DIR / "nordic" / "registry-metadata"
OUTPUT_DIR = DATA_DIR / "nordic" / "core-series"
RAW_DIR = OUTPUT_DIR / "raw"

USER_AGENT = "FoodSystems2026/core-series-harvester"
TIMEOUT_SECONDS = 90

MONTH_START = "2015-01"
MONTH_START_CODE = "2015M01"
YEAR_START = "2010"

EUROSTAT_API_ROOT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data"
STATBANK_DATA_URL = "https://api.statbank.dk/v1/data"

COMMON_FIELDS = [
    "theme",
    "series_family",
    "series_id",
    "country",
    "source_name",
    "dataset_or_table_id",
    "period",
    "frequency",
    "flow",
    "metric",
    "unit",
    "value",
    "coverage",
    "comparability",
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


def fetch_json(url: str, payload: dict[str, Any] | None = None) -> Any:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json, text/plain, */*"}
    data = None
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json; charset=utf-8"

    request = Request(url, data=data, headers=headers)
    with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode("utf-8"))


def statbank_query(table: str, variables: list[dict[str, Any]]) -> Any:
    payload = {
        "table": table,
        "format": "JSONSTAT",
        "lang": "en",
        "variables": variables,
    }
    return fetch_json(STATBANK_DATA_URL, payload)


def load_metadata_values(filename: str, variable_code: str) -> list[str]:
    path = METADATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing metadata file: {path}")

    payload = json.loads(path.read_text())["payload"]
    for variable in payload["variables"]:
        code = variable.get("code") or variable.get("id")
        if code != variable_code:
            continue

        values = variable.get("values", [])
        if values and isinstance(values[0], dict):
            return [item["id"] for item in values]
        return list(values)

    raise KeyError(f"Variable {variable_code} not found in {path}")


def dataset_from_jsonstat(payload: Any) -> dict[str, Any]:
    if isinstance(payload, dict) and "dataset" in payload:
        return payload["dataset"]
    if isinstance(payload, dict):
        return payload
    raise TypeError("Unsupported JSON-stat payload")


def jsonstat_dimensions(dataset: dict[str, Any]) -> tuple[list[str], list[int], dict[str, dict[str, Any]]]:
    dimension = dataset["dimension"]
    ids = dimension.get("id") or dataset.get("id")
    sizes = dimension.get("size") or dataset.get("size")
    if not ids or not sizes:
        raise KeyError("JSON-stat dataset missing dimension ids or sizes")
    return list(ids), list(sizes), dimension


def dimension_codes_and_labels(spec: dict[str, Any]) -> tuple[list[str], dict[str, str]]:
    category = spec["category"]
    index = category["index"]
    if isinstance(index, list):
        codes = [str(code) for code in index]
    else:
        codes = [""] * len(index)
        for code, position in index.items():
            codes[int(position)] = str(code)

    raw_labels = category.get("label", {})
    if isinstance(raw_labels, dict):
        labels = {str(code): str(label) for code, label in raw_labels.items()}
    else:
        labels = {}
    return codes, labels


def unravel_index(flat_index: int, sizes: list[int]) -> list[int]:
    coords: list[int] = []
    remainder = flat_index
    for size in reversed(sizes):
        coords.append(remainder % size)
        remainder //= size
    return list(reversed(coords))


def jsonstat_observations(payload: Any) -> list[dict[str, Any]]:
    dataset = dataset_from_jsonstat(payload)
    ids, sizes, dimensions = jsonstat_dimensions(dataset)

    codes_by_dim: dict[str, list[str]] = {}
    labels_by_dim: dict[str, dict[str, str]] = {}
    for dim_id in ids:
        codes, labels = dimension_codes_and_labels(dimensions[dim_id])
        codes_by_dim[dim_id] = codes
        labels_by_dim[dim_id] = labels

    raw_values = dataset["value"]
    if isinstance(raw_values, dict):
        items = sorted((int(index), value) for index, value in raw_values.items())
    else:
        items = [(index, value) for index, value in enumerate(raw_values) if value is not None]

    rows: list[dict[str, Any]] = []
    for flat_index, value in items:
        coords = unravel_index(flat_index, sizes)
        row: dict[str, Any] = {"value": float(value)}
        for dim_id, coord in zip(ids, coords):
            code = codes_by_dim[dim_id][coord]
            row[dim_id] = code
            row[f"{dim_id}__label"] = labels_by_dim[dim_id].get(code, code)
        rows.append(row)
    return rows


def normalize_period(value: str) -> str:
    if re.fullmatch(r"\d{4}M\d{2}", value):
        return f"{value[:4]}-{value[5:7]}"
    if re.fullmatch(r"\d{4}Q\d", value):
        return f"{value[:4]}-Q{value[-1]}"
    return value


def numeric_string(value: float, decimals: int = 3) -> str:
    return f"{value:.{decimals}f}"


def month_gte(period: str, start: str) -> bool:
    return period >= start


def year_gte(period: str, start: str) -> bool:
    return period >= start


def save_raw(name: str, payload: Any) -> str:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = RAW_DIR / f"{name}.json"
    write_json(path, payload)
    return str(path.relative_to(DATA_DIR.parent.parent))


def load_existing_summary(path: Path) -> dict[str, Any]:
    if path.exists():
        return json.loads(path.read_text())
    return {
        "generated_at": "",
        "dependency": str((DATA_DIR / "fetch_nordic_registry_metadata.py").relative_to(DATA_DIR.parent.parent)),
        "metadata_dir": str(METADATA_DIR.relative_to(DATA_DIR.parent.parent)),
        "output_dir": str(OUTPUT_DIR.relative_to(DATA_DIR.parent.parent)),
        "files": {},
        "rows": {},
        "series_manifest": [],
        "notes": [
            "Prices use Eurostat HICP food as the first cross-country comparable monthly backbone.",
            "Trade mixes total-goods monthly series with Finland's ready monthly agri-food series, so trade comparability is partial.",
            "Production contains one directly comparable oats-quantity subgroup (FI/NO/SE) and documented fallbacks for DK and IS.",
        ],
    }


def price_rows() -> tuple[list[dict[str, str]], dict[str, Any]]:
    params = [
        ("freq", "M"),
        ("unit", "I15"),
        ("coicop", "CP01"),
        ("geo", "DK"),
        ("geo", "FI"),
        ("geo", "IS"),
        ("geo", "NO"),
        ("geo", "SE"),
        ("sinceTimePeriod", MONTH_START),
    ]
    url = f"{EUROSTAT_API_ROOT}/prc_hicp_midx?{urlencode(params)}"
    payload = fetch_json(url)
    raw_file = save_raw("prices_hicp_food_monthly", payload)

    rows: list[dict[str, str]] = []
    for obs in jsonstat_observations(payload):
        period = normalize_period(obs["time"])
        rows.append(
            {
                "theme": "prices",
                "series_family": "food_hicp_monthly",
                "series_id": f"hicp_food_{obs['geo'].lower()}",
                "country": obs["geo"],
                "source_name": "Eurostat HICP monthly",
                "dataset_or_table_id": "prc_hicp_midx",
                "period": period,
                "frequency": "monthly",
                "flow": "",
                "metric": "HICP food and non-alcoholic beverages",
                "unit": "index (2015=100)",
                "value": numeric_string(obs["value"], 3),
                "coverage": "food and non-alcoholic beverages",
                "comparability": "cross-country comparable panel",
                "notes": "Eurostat COICOP CP01, used as the first comparable Nordic food-price backbone.",
            }
        )

    metadata = {
        "theme": "prices",
        "series_family": "food_hicp_monthly",
        "output_file": str((OUTPUT_DIR / "prices_hicp_food_monthly.csv").relative_to(DATA_DIR.parent.parent)),
        "raw_file": raw_file,
        "rows": len(rows),
        "countries": ["DK", "FI", "IS", "NO", "SE"],
    }
    return rows, metadata


def trade_rows() -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
    rows: list[dict[str, str]] = []
    manifest: list[dict[str, Any]] = []

    no_payload = fetch_json(
        "https://data.ssb.no/api/v0/en/table/08792/",
        {
            "query": [
                {
                    "code": "HovedVareStrommer",
                    "selection": {"filter": "item", "values": ["Itot", "Etot"]},
                },
                {
                    "code": "ContentsCode",
                    "selection": {"filter": "item", "values": ["VerdiUjustert"]},
                },
                {"code": "Tid", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    no_raw = save_raw("trade_no_total_goods_monthly", no_payload)
    no_rows = 0
    for obs in jsonstat_observations(no_payload):
        period = normalize_period(obs["Tid"])
        if not month_gte(period, MONTH_START):
            continue
        flow = "imports" if obs["HovedVareStrommer"] == "Itot" else "exports"
        rows.append(
            {
                "theme": "trade",
                "series_family": "total_goods_trade_monthly",
                "series_id": f"no_total_goods_{flow}",
                "country": "NO",
                "source_name": "SSB external trade main figures monthly",
                "dataset_or_table_id": "08792",
                "period": period,
                "frequency": "monthly",
                "flow": flow,
                "metric": "Trade value",
                "unit": "source units",
                "value": numeric_string(obs["value"], 3),
                "coverage": "all goods",
                "comparability": "monthly total-goods trade",
                "notes": "Direct total imports/exports from SSB table 08792.",
            }
        )
        no_rows += 1
    manifest.append(
        {
            "theme": "trade",
            "series_family": "total_goods_trade_monthly",
            "country": "NO",
            "source_name": "SSB external trade main figures monthly",
            "dataset_or_table_id": "08792",
            "rows": no_rows,
            "raw_file": no_raw,
            "notes": "Monthly total-goods imports/exports from SSB.",
        }
    )

    dk_payload = statbank_query(
        "SITC2R4",
        [
            {"code": "SITC", "values": ["TOT"]},
            {"code": "LAND", "values": ["W1"]},
            {"code": "INDUD", "values": ["1", "2"]},
            {"code": "UHBEGREB", "values": ["GP"]},
            {
                "code": "Tid",
                "values": [
                    value
                    for value in load_metadata_values(
                        "dk-trade-statbank-imports-and-exports-sitc-sitc2r4.json",
                        "Tid",
                    )
                    if value >= MONTH_START_CODE
                ],
            },
        ],
    )
    dk_raw = save_raw("trade_dk_total_goods_monthly", dk_payload)
    dk_rows = 0
    for obs in jsonstat_observations(dk_payload):
        period = normalize_period(obs["Tid"])
        if not month_gte(period, MONTH_START):
            continue
        flow = "imports" if obs["INDUD"] == "1" else "exports"
        rows.append(
            {
                "theme": "trade",
                "series_family": "total_goods_trade_monthly",
                "series_id": f"dk_total_goods_{flow}",
                "country": "DK",
                "source_name": "StatBank imports and exports SITC",
                "dataset_or_table_id": "SITC2R4",
                "period": period,
                "frequency": "monthly",
                "flow": flow,
                "metric": "Trade value",
                "unit": "DKK 1,000",
                "value": numeric_string(obs["value"], 3),
                "coverage": "all goods",
                "comparability": "monthly total-goods trade",
                "notes": "SITC=TOT, LAND=W1, UHBEGREB=GP.",
            }
        )
        dk_rows += 1
    manifest.append(
        {
            "theme": "trade",
            "series_family": "total_goods_trade_monthly",
            "country": "DK",
            "source_name": "StatBank imports and exports SITC",
            "dataset_or_table_id": "SITC2R4",
            "rows": dk_rows,
            "raw_file": dk_raw,
            "notes": "Monthly total-goods imports/exports from StatBank SITC TOT.",
        }
    )

    se_chapters = [
        code
        for code in load_metadata_values(
            "se-trade-scb-imports-and-exports-cn-monthly-impexpkntotman.json",
            "VarugruppKN",
        )
        if len(code) == 2 and code.isdigit()
    ]
    se_payload = fetch_json(
        "https://api.scb.se/OV0104/v1/doris/en/ssd/HA/HA0201/HA0201B/ImpExpKNTotMan",
        {
            "query": [
                {
                    "code": "VarugruppKN",
                    "selection": {"filter": "item", "values": se_chapters},
                },
                {
                    "code": "ContentsCode",
                    "selection": {"filter": "item", "values": ["HA0201AI", "HA0201AO"]},
                },
                {"code": "Tid", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    se_raw = save_raw("trade_se_total_goods_monthly", se_payload)
    se_totals: dict[tuple[str, str], float] = {}
    for obs in jsonstat_observations(se_payload):
        period = normalize_period(obs["Tid"])
        if not month_gte(period, MONTH_START):
            continue
        flow = "imports" if obs["ContentsCode"] == "HA0201AI" else "exports"
        key = (period, flow)
        se_totals[key] = se_totals.get(key, 0.0) + obs["value"]
    for (period, flow), value in sorted(se_totals.items()):
        rows.append(
            {
                "theme": "trade",
                "series_family": "total_goods_trade_monthly",
                "series_id": f"se_total_goods_{flow}",
                "country": "SE",
                "source_name": "SCB imports and exports CN monthly",
                "dataset_or_table_id": "ImpExpKNTotMan",
                "period": period,
                "frequency": "monthly",
                "flow": flow,
                "metric": "Trade value",
                "unit": "SEK thousand",
                "value": numeric_string(value, 3),
                "coverage": "all goods",
                "comparability": "monthly total-goods trade proxy",
                "notes": "Summed from all top-level 2-digit CN chapters because the ready metadata set has no single total-goods code.",
            }
        )
    manifest.append(
        {
            "theme": "trade",
            "series_family": "total_goods_trade_monthly",
            "country": "SE",
            "source_name": "SCB imports and exports CN monthly",
            "dataset_or_table_id": "ImpExpKNTotMan",
            "rows": len(se_totals),
            "raw_file": se_raw,
            "notes": "Summed from top-level 2-digit CN chapters.",
        }
    )

    fi_payload = fetch_json(
        "https://statdb.luke.fi/PXWeb/api/v1/en/LUKE/maa/05%20Maataloustuotteiden%20ulkomaankauppa/Luke_maa_Ukaup_kk.px",
        {
            "query": [
                {"code": "tuoteryhmä", "selection": {"filter": "item", "values": ["000"]}},
                {"code": "maa", "selection": {"filter": "item", "values": ["AA"]}},
                {"code": "muuttuja", "selection": {"filter": "item", "values": ["V1"]}},
                {"code": "suunta", "selection": {"filter": "item", "values": ["1", "2"]}},
                {"code": "kuukausi", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    fi_raw = save_raw("trade_fi_agri_food_monthly", fi_payload)
    fi_rows = 0
    for obs in jsonstat_observations(fi_payload):
        period = normalize_period(obs["kuukausi"])
        if not month_gte(period, MONTH_START):
            continue
        flow = "imports" if obs["suunta"] == "1" else "exports"
        rows.append(
            {
                "theme": "trade",
                "series_family": "agri_food_trade_monthly",
                "series_id": f"fi_agri_food_{flow}",
                "country": "FI",
                "source_name": "Luke agri-food foreign trade",
                "dataset_or_table_id": "Luke_maa_Ukaup_kk.px",
                "period": period,
                "frequency": "monthly",
                "flow": flow,
                "metric": "Trade value",
                "unit": "1000 EUR",
                "value": numeric_string(obs["value"], 3),
                "coverage": "agri-food total",
                "comparability": "monthly agri-food trade",
                "notes": "Luke product group 000, all countries together.",
            }
        )
        fi_rows += 1
    manifest.append(
        {
            "theme": "trade",
            "series_family": "agri_food_trade_monthly",
            "country": "FI",
            "source_name": "Luke agri-food foreign trade",
            "dataset_or_table_id": "Luke_maa_Ukaup_kk.px",
            "rows": fi_rows,
            "raw_file": fi_raw,
            "notes": "Monthly agri-food imports/exports, not full-goods trade.",
        }
    )

    is_countries = load_metadata_values(
        "is-trade-statistics-iceland-exports-and-imports-by-countries-uta06003-px.json",
        "Country",
    )
    is_payload = fetch_json(
        "https://px.hagstofa.is/pxen/api/v1/en/Efnahagur/utanrikisverslun/1_voruvidskipti/01_voruskipti/UTA06003.px",
        {
            "query": [
                {"code": "Country", "selection": {"filter": "item", "values": is_countries}},
                {"code": "Trade", "selection": {"filter": "item", "values": ["0", "1"]}},
                {"code": "Month", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    is_raw = save_raw("trade_is_total_goods_monthly", is_payload)
    is_totals: dict[tuple[str, str], float] = {}
    for obs in jsonstat_observations(is_payload):
        period = normalize_period(obs["Month"])
        if not month_gte(period, MONTH_START):
            continue
        flow = "exports" if obs["Trade"] == "0" else "imports"
        key = (period, flow)
        is_totals[key] = is_totals.get(key, 0.0) + obs["value"]
    for (period, flow), value in sorted(is_totals.items()):
        rows.append(
            {
                "theme": "trade",
                "series_family": "total_goods_trade_monthly",
                "series_id": f"is_total_goods_{flow}",
                "country": "IS",
                "source_name": "Statistics Iceland exports and imports by countries",
                "dataset_or_table_id": "UTA06003.px",
                "period": period,
                "frequency": "monthly",
                "flow": flow,
                "metric": "Trade value",
                "unit": "source units",
                "value": numeric_string(value, 3),
                "coverage": "all goods",
                "comparability": "monthly total-goods trade proxy",
                "notes": "Summed across all partner countries because the ready table exposes country detail rather than a single total code.",
            }
        )
    manifest.append(
        {
            "theme": "trade",
            "series_family": "total_goods_trade_monthly",
            "country": "IS",
            "source_name": "Statistics Iceland exports and imports by countries",
            "dataset_or_table_id": "UTA06003.px",
            "rows": len(is_totals),
            "raw_file": is_raw,
            "notes": "Summed across all partner countries.",
        }
    )

    return rows, manifest


def production_rows() -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
    rows: list[dict[str, str]] = []
    manifest: list[dict[str, Any]] = []

    no_payload = fetch_json(
        "https://data.ssb.no/api/v0/en/table/07479/",
        {
            "query": [
                {"code": "ContentsCode", "selection": {"filter": "item", "values": ["Havre"]}},
                {"code": "Tid", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    no_raw = save_raw("production_no_oats_annual", no_payload)
    no_count = 0
    for obs in jsonstat_observations(no_payload):
        period = normalize_period(obs["Tid"])
        if not year_gte(period, YEAR_START):
            continue
        rows.append(
            {
                "theme": "production",
                "series_family": "oats_production_quantity",
                "series_id": "no_oats_production",
                "country": "NO",
                "source_name": "SSB cereals and oil seeds production",
                "dataset_or_table_id": "07479",
                "period": period,
                "frequency": "annual",
                "flow": "",
                "metric": "Oats production",
                "unit": "1,000 tonnes",
                "value": numeric_string(obs["value"], 3),
                "coverage": "national",
                "comparability": "directly comparable with FI and SE oats quantity series",
                "notes": "SSB ContentsCode=Havre.",
            }
        )
        no_count += 1
    manifest.append(
        {
            "theme": "production",
            "series_family": "oats_production_quantity",
            "country": "NO",
            "source_name": "SSB cereals and oil seeds production",
            "dataset_or_table_id": "07479",
            "rows": no_count,
            "raw_file": no_raw,
            "notes": "Annual oats production in 1,000 tonnes.",
        }
    )

    se_payload = fetch_json(
        "https://api.scb.se/OV0104/v1/doris/en/ssd/JO/JO0601/SkordarL2",
        {
            "query": [
                {"code": "Region", "selection": {"filter": "item", "values": ["00"]}},
                {"code": "Groda", "selection": {"filter": "item", "values": ["50"]}},
                {"code": "ContentsCode", "selection": {"filter": "item", "values": ["000005G3"]}},
                {"code": "Tid", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    se_raw = save_raw("production_se_oats_annual", se_payload)
    se_count = 0
    for obs in jsonstat_observations(se_payload):
        period = normalize_period(obs["Tid"])
        if not year_gte(period, YEAR_START):
            continue
        rows.append(
            {
                "theme": "production",
                "series_family": "oats_production_quantity",
                "series_id": "se_oats_production",
                "country": "SE",
                "source_name": "SCB crop yields and total production",
                "dataset_or_table_id": "SkordarL2",
                "period": period,
                "frequency": "annual",
                "flow": "",
                "metric": "Oats production",
                "unit": "1,000 tonnes",
                "value": numeric_string(obs["value"] / 1000.0, 3),
                "coverage": "national",
                "comparability": "directly comparable with FI and NO oats quantity series",
                "notes": "SCB reports tonnes; values are converted to 1,000 tonnes.",
            }
        )
        se_count += 1
    manifest.append(
        {
            "theme": "production",
            "series_family": "oats_production_quantity",
            "country": "SE",
            "source_name": "SCB crop yields and total production",
            "dataset_or_table_id": "SkordarL2",
            "rows": se_count,
            "raw_file": se_raw,
            "notes": "Annual oats production converted from tonnes to 1,000 tonnes.",
        }
    )

    fi_payload = fetch_json(
        "https://statdb.luke.fi/PXWeb/api/v1/en/LUKE/maa/02%20Ravintotase/02_Ravintotase.px",
        {
            "query": [
                {"code": "Elintarvike", "selection": {"filter": "item", "values": ["Kaura"]}},
                {"code": "Tieto", "selection": {"filter": "item", "values": ["Tuotanto"]}},
                {"code": "Vuosi", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    fi_raw = save_raw("production_fi_oats_annual", fi_payload)
    fi_count = 0
    for obs in jsonstat_observations(fi_payload):
        period = normalize_period(obs["Vuosi"])
        if not year_gte(period, YEAR_START):
            continue
        rows.append(
            {
                "theme": "production",
                "series_family": "oats_production_quantity",
                "series_id": "fi_oats_production",
                "country": "FI",
                "source_name": "Luke food commodity balance",
                "dataset_or_table_id": "02_Ravintotase.px",
                "period": period,
                "frequency": "annual",
                "flow": "",
                "metric": "Oats production",
                "unit": "1,000 tonnes",
                "value": numeric_string(obs["value"], 3),
                "coverage": "national",
                "comparability": "directly comparable with NO and SE oats quantity series",
                "notes": "Luke commodity balance reports oats production in million kg, equivalent to 1,000 tonnes.",
            }
        )
        fi_count += 1
    manifest.append(
        {
            "theme": "production",
            "series_family": "oats_production_quantity",
            "country": "FI",
            "source_name": "Luke food commodity balance",
            "dataset_or_table_id": "02_Ravintotase.px",
            "rows": fi_count,
            "raw_file": fi_raw,
            "notes": "Annual oats production in 1,000 tonnes equivalent.",
        }
    )

    dk_payload = statbank_query(
        "JOEK1",
        [
            {"code": "PRODUKT", "values": ["010000"]},
            {"code": "PRISENHED", "values": ["00"]},
            {
                "code": "Tid",
                "values": load_metadata_values(
                    "dk-agriculture-statbank-economic-accounts-agriculture-joek1.json",
                    "Tid",
                ),
            },
        ],
    )
    dk_raw = save_raw("production_dk_cereals_output_annual", dk_payload)
    dk_count = 0
    for obs in jsonstat_observations(dk_payload):
        period = normalize_period(obs["Tid"])
        if not year_gte(period, YEAR_START):
            continue
        rows.append(
            {
                "theme": "production",
                "series_family": "cereals_output_value",
                "series_id": "dk_cereals_output_value",
                "country": "DK",
                "source_name": "StatBank economic accounts agriculture",
                "dataset_or_table_id": "JOEK1",
                "period": period,
                "frequency": "annual",
                "flow": "",
                "metric": "Cereals output",
                "unit": "m DKK",
                "value": numeric_string(obs["value"], 3),
                "coverage": "national",
                "comparability": "value-based fallback, not directly comparable with oats quantity series",
                "notes": "StatBank JOEK1 PRODUCT=010000, current prices.",
            }
        )
        dk_count += 1
    manifest.append(
        {
            "theme": "production",
            "series_family": "cereals_output_value",
            "country": "DK",
            "source_name": "StatBank economic accounts agriculture",
            "dataset_or_table_id": "JOEK1",
            "rows": dk_count,
            "raw_file": dk_raw,
            "notes": "Annual cereals output in current prices.",
        }
    )

    is_payload = fetch_json(
        "https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/landbunadur/landframleidsla/LAN10201.px",
        {
            "query": [
                {"code": "Kjöttegund", "selection": {"filter": "item", "values": ["1"]}},
                {"code": "Flokkar", "selection": {"filter": "item", "values": ["1"]}},
                {"code": "Ár", "selection": {"filter": "all", "values": ["*"]}},
            ],
            "response": {"format": "json-stat2"},
        },
    )
    is_raw = save_raw("production_is_beef_annual", is_payload)
    is_count = 0
    for obs in jsonstat_observations(is_payload):
        period = normalize_period(obs["Ár"])
        if not year_gte(period, YEAR_START):
            continue
        rows.append(
            {
                "theme": "production",
                "series_family": "beef_production_quantity",
                "series_id": "is_beef_production",
                "country": "IS",
                "source_name": "Statistics Iceland meat production",
                "dataset_or_table_id": "LAN10201.px",
                "period": period,
                "frequency": "annual",
                "flow": "",
                "metric": "Beef production",
                "unit": "tonnes",
                "value": numeric_string(obs["value"], 3),
                "coverage": "national",
                "comparability": "quantity fallback, not directly comparable with oats quantity series",
                "notes": "Statistics Iceland physical production fallback where ready cereal series are monetary rather than volumetric.",
            }
        )
        is_count += 1
    manifest.append(
        {
            "theme": "production",
            "series_family": "beef_production_quantity",
            "country": "IS",
            "source_name": "Statistics Iceland meat production",
            "dataset_or_table_id": "LAN10201.px",
            "rows": is_count,
            "raw_file": is_raw,
            "notes": "Annual beef production in tonnes.",
        }
    )

    return rows, manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=["prices", "trade", "production"])
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    prices_path = OUTPUT_DIR / "prices_hicp_food_monthly.csv"
    trade_path = OUTPUT_DIR / "trade_monthly_first_panel.csv"
    production_path = OUTPUT_DIR / "production_annual_first_panel.csv"
    summary_path = OUTPUT_DIR / "series_manifest.json"
    summary = load_existing_summary(summary_path)

    if args.only in (None, "prices"):
        prices, price_meta = price_rows()
        write_csv(prices_path, prices, COMMON_FIELDS)
        summary["files"]["prices"] = str(prices_path.relative_to(DATA_DIR.parent.parent))
        summary["rows"]["prices"] = len(prices)
        summary["series_manifest"] = [entry for entry in summary["series_manifest"] if entry.get("theme") != "prices"]
        summary["series_manifest"].append(price_meta)

    if args.only in (None, "trade"):
        trade, trade_meta = trade_rows()
        write_csv(trade_path, trade, COMMON_FIELDS)
        summary["files"]["trade"] = str(trade_path.relative_to(DATA_DIR.parent.parent))
        summary["rows"]["trade"] = len(trade)
        summary["series_manifest"] = [entry for entry in summary["series_manifest"] if entry.get("theme") != "trade"]
        summary["series_manifest"].extend(trade_meta)

    if args.only in (None, "production"):
        production, production_meta = production_rows()
        write_csv(production_path, production, COMMON_FIELDS)
        summary["files"]["production"] = str(production_path.relative_to(DATA_DIR.parent.parent))
        summary["rows"]["production"] = len(production)
        summary["series_manifest"] = [entry for entry in summary["series_manifest"] if entry.get("theme") != "production"]
        summary["series_manifest"].extend(production_meta)

    summary["generated_at"] = datetime.now(timezone.utc).isoformat()
    write_json(summary_path, summary)


if __name__ == "__main__":
    main()
