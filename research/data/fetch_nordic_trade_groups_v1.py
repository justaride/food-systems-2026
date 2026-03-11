#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DATA_DIR = Path(__file__).resolve().parent
METADATA_DIR = DATA_DIR / "nordic" / "registry-metadata"
OUTPUT_DIR = DATA_DIR / "nordic" / "trade-groups"
RAW_DIR = OUTPUT_DIR / "raw-json"
NORMALIZED_DIR = OUTPUT_DIR / "normalized"
MANIFEST_CSV = OUTPUT_DIR / "manifest.csv"
RUN_SUMMARY_JSON = OUTPUT_DIR / "run-summary.json"

USER_AGENT = "FoodSystems2026/trade-groups-v1-harvester"
TIMEOUT_SECONDS = 120
START_MONTH = "2015-01"
START_MONTH_CODE = "2015M01"
COUNTRIES = ("NO", "DK", "SE", "FI", "IS")


@dataclass(frozen=True)
class GroupSpec:
    key: str
    label: str
    dk_codes: tuple[str, ...]
    se_codes: tuple[str, ...]
    fi_prefixes: tuple[str, ...]
    is_codes: tuple[str, ...]
    note: str = ""


GROUPS = (
    GroupSpec(
        key="meat",
        label="Meat and meat preparations",
        dk_codes=("01",),
        se_codes=("02",),
        fi_prefixes=("02",),
        is_codes=("01",),
    ),
    GroupSpec(
        key="dairy_eggs",
        label="Dairy products and eggs",
        dk_codes=("02",),
        se_codes=("04",),
        fi_prefixes=("04",),
        is_codes=("02",),
        note="HS/CN chapter 04 also includes honey in the SE/FI sources.",
    ),
    GroupSpec(
        key="fish_seafood",
        label="Fish and seafood",
        dk_codes=("03",),
        se_codes=("03",),
        fi_prefixes=("03",),
        is_codes=("03",),
    ),
    GroupSpec(
        key="cereals",
        label="Cereals and cereal preparations",
        dk_codes=("04",),
        se_codes=("10",),
        fi_prefixes=("10",),
        is_codes=("04",),
    ),
    GroupSpec(
        key="fruit_veg",
        label="Fruit and vegetables",
        dk_codes=("05",),
        se_codes=("07", "08"),
        fi_prefixes=("07", "08"),
        is_codes=("05",),
        note="SE/FI combine vegetables (07) and fruit or nuts (08) into one proxy basket.",
    ),
    GroupSpec(
        key="fats_oils",
        label="Fats and oils",
        dk_codes=("41", "42", "43"),
        se_codes=("15",),
        fi_prefixes=("15",),
        is_codes=("41", "42", "43"),
        note="SITC 41-43 mapped to HS/CN chapter 15 as a broad fats-and-oils proxy.",
    ),
)

PANEL_FIELDS = [
    "theme",
    "series_family",
    "series_id",
    "country",
    "commodity_group",
    "commodity_group_label",
    "source_name",
    "dataset_or_table_id",
    "period",
    "frequency",
    "flow",
    "metric",
    "unit",
    "value",
    "share_of_selected_food_basket",
    "selected_food_basket_total",
    "code_family",
    "source_code_rule",
    "coverage",
    "comparability",
    "notes",
]

MANIFEST_FIELDS = [
    "country",
    "status",
    "source_name",
    "dataset_or_table_id",
    "observations_fetched",
    "monthly_group_rows",
    "annual_group_rows",
    "raw_json",
    "note",
]


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned or "item"


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=True)


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def load_json(path: Path) -> Any:
    with path.open() as handle:
        return json.load(handle)


def fetch_json(url: str, *, payload: dict[str, Any] | None = None) -> tuple[Any, str, int]:
    headers = {
        "Accept": "application/json, text/json, text/plain, */*",
        "User-Agent": USER_AGENT,
    }
    data = None
    method = "GET"
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        headers["Content-Type"] = "application/json"
        method = "POST"

    for attempt in range(3):
        request = Request(url, data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                raw = response.read()
                content_type = response.headers.get("Content-Type", "")
                status_code = response.status
            return json.loads(raw.decode("utf-8")), content_type, status_code
        except HTTPError as error:
            if error.code not in {403, 429, 500, 502, 503, 504} or attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))

    raise RuntimeError(f"Unreachable retry state for {url}")


def metadata_payload(filename: str) -> dict[str, Any]:
    return load_json(METADATA_DIR / filename)["payload"]


def metadata_variable(payload: dict[str, Any], code: str) -> dict[str, Any]:
    for variable in payload["variables"]:
        key = variable.get("code") or variable.get("id")
        if key == code:
            return variable
    raise KeyError(f"Variable {code!r} not found")


def metadata_values(payload: dict[str, Any], code: str) -> list[str]:
    values = metadata_variable(payload, code)["values"]
    if values and isinstance(values[0], dict):
        return [item["id"] for item in values]
    return [str(value) for value in values]


def filtered_values(values: list[str], start: str) -> list[str]:
    return [value for value in values if value >= start]


def unwrap_jsonstat(payload: dict[str, Any]) -> dict[str, Any]:
    if "dataset" in payload and isinstance(payload["dataset"], dict):
        return payload["dataset"]
    return payload


def ordered_codes(category_index: dict[str, int] | list[str]) -> list[str]:
    if isinstance(category_index, list):
        return [str(code) for code in category_index]
    inverse = {int(index): str(code) for code, index in category_index.items()}
    return [inverse[idx] for idx in range(len(inverse))]


def dataset_dimensions(dataset: dict[str, Any]) -> tuple[list[str], list[int], dict[str, Any]]:
    dimensions = dataset["dimension"]
    ids = dataset.get("id")
    sizes = dataset.get("size")
    if ids is not None and sizes is not None:
        return list(ids), list(sizes), dimensions
    if isinstance(dimensions, dict) and "id" in dimensions and "size" in dimensions:
        ids = dimensions["id"]
        sizes = dimensions["size"]
        clean_dimensions = {key: value for key, value in dimensions.items() if key not in {"id", "size", "role"}}
        return list(ids), list(sizes), clean_dimensions
    raise KeyError("JSON-stat dataset is missing id/size metadata")


def unravel_index(flat_index: int, sizes: list[int]) -> list[int]:
    coords: list[int] = []
    remainder = flat_index
    for size in reversed(sizes):
        coords.append(remainder % size)
        remainder //= size
    return list(reversed(coords))


def jsonstat_rows(payload: dict[str, Any]) -> list[dict[str, Any]]:
    dataset = unwrap_jsonstat(payload)
    ids, sizes, dimensions = dataset_dimensions(dataset)

    codes_by_dim: dict[str, list[str]] = {}
    labels_by_dim: dict[str, dict[str, str]] = {}
    for dim in ids:
        category = dimensions[dim]["category"]
        codes_by_dim[dim] = ordered_codes(category["index"])
        labels = category.get("label", {})
        if isinstance(labels, dict):
            labels_by_dim[dim] = {str(code): str(label) for code, label in labels.items()}
        else:
            labels_by_dim[dim] = {}

    values = dataset["value"]
    if isinstance(values, dict):
        iterator = sorted(((int(index), value) for index, value in values.items()), key=lambda item: item[0])
    else:
        iterator = list(enumerate(values))

    rows: list[dict[str, Any]] = []
    for flat_index, value in iterator:
        if value is None:
            continue
        coords = unravel_index(flat_index, sizes)
        row: dict[str, Any] = {"value": float(value)}
        for dim, coord in zip(ids, coords):
            code = codes_by_dim[dim][coord]
            row[dim] = code
            row[f"{dim}_label"] = labels_by_dim[dim].get(code, "")
        rows.append(row)
    return rows


def jsonstat_group_sums(payload: dict[str, Any], *, code_dimension: str, country: str) -> tuple[dict[str, float], int]:
    dataset = unwrap_jsonstat(payload)
    ids, sizes, dimensions = dataset_dimensions(dataset)
    code_position = ids.index(code_dimension)
    code_values = ordered_codes(dimensions[code_dimension]["category"]["index"])

    values = dataset["value"]
    if isinstance(values, dict):
        iterator = ((int(index), value) for index, value in values.items())
    else:
        iterator = ((index, value) for index, value in enumerate(values))

    totals: dict[str, float] = {}
    observation_count = 0
    for flat_index, value in iterator:
        if value is None:
            continue
        coords = unravel_index(flat_index, sizes)
        code = code_values[coords[code_position]]
        spec = group_for_code(country, code)
        if spec is None:
            continue
        totals[spec.key] = totals.get(spec.key, 0.0) + float(value)
        observation_count += 1
    return totals, observation_count


def normalize_period(value: str) -> str:
    if re.fullmatch(r"\d{4}M\d{2}", value):
        return f"{value[:4]}-{value[5:7]}"
    return value


def numeric_string(value: float, decimals: int = 3) -> str:
    return f"{value:.{decimals}f}"


def month_gte(period: str, start: str) -> bool:
    return period >= start


def raw_output_path(slug: str) -> Path:
    return RAW_DIR / f"{slugify(slug)}.json"


def normalized_output_path(slug: str) -> Path:
    return NORMALIZED_DIR / f"{slugify(slug)}.csv"


def relative_to_project(path: Path) -> str:
    return str(path.relative_to(DATA_DIR.parent.parent))


def group_for_code(country: str, source_code: str) -> GroupSpec | None:
    for spec in GROUPS:
        if country == "NO" and any(source_code.startswith(prefix) for prefix in spec.fi_prefixes):
            return spec
        if country == "DK" and source_code in spec.dk_codes:
            return spec
        if country == "SE" and source_code in spec.se_codes:
            return spec
        if country == "FI" and any(source_code.startswith(prefix) for prefix in spec.fi_prefixes):
            return spec
        if country == "IS" and source_code in spec.is_codes:
            return spec
    return None


def source_code_rule(country: str, spec: GroupSpec) -> str:
    if country == "NO":
        return "commodity prefixes " + " + ".join(f"{prefix}*" for prefix in spec.fi_prefixes)
    if country == "DK":
        return "SITC " + " + ".join(spec.dk_codes)
    if country == "SE":
        return "CN chapter " + " + ".join(spec.se_codes)
    if country == "FI":
        return "tuoteryhma prefixes " + " + ".join(f"{prefix}*" for prefix in spec.fi_prefixes)
    if country == "IS":
        return "SITC " + " + ".join(spec.is_codes)
    raise ValueError(f"Unsupported country {country!r}")


def country_source_meta(country: str) -> tuple[str, str, str]:
    if country == "NO":
        return ("SSB external trade by commodity number", "08801", "Commodity number detail")
    if country == "DK":
        return ("StatBank imports and exports SITC", "SITC2R4", "SITC Rev.4 top-level")
    if country == "SE":
        return ("SCB imports and exports CN monthly", "ImpExpKNTotMan", "CN chapter")
    if country == "FI":
        return ("Luke agri-food foreign trade", "Luke_maa_Ukaup_kk.px", "HS-like product groups")
    if country == "IS":
        return ("Statistics Iceland imports by SITC and countries", "UTA06201.px", "SITC top-level")
    raise ValueError(f"Unsupported country {country!r}")


def value_unit(country: str) -> str:
    if country == "NO":
        return "NOK"
    if country == "DK":
        return "DKK 1,000"
    if country == "SE":
        return "SEK thousand"
    if country == "FI":
        return "1000 EUR"
    if country == "IS":
        return "source units (Import cif)"
    raise ValueError(f"Unsupported country {country!r}")


def monthly_coverage(country: str) -> str:
    if country == "NO":
        return "all partner countries summed from commodity-detail annual table"
    if country == "DK":
        return "rest of world, imports, border crossing principle"
    if country == "SE":
        return "imports, selected top-level CN chapters"
    if country == "FI":
        return "imports by countries of origin, all partner countries together"
    if country == "IS":
        return "imports, summed across all partner countries"
    raise ValueError(f"Unsupported country {country!r}")


def common_note(country: str, spec: GroupSpec) -> str:
    notes = ["Broad food-group import proxy harmonized from national source classifications."]
    if country == "NO":
        notes.append("Norway is annual-only in v1 and aggregated from detailed commodity-number codes in SSB table 08801.")
    if country == "DK":
        notes.append("Monthly coverage starts in 2022 in the ready SITC table.")
    if country == "IS":
        notes.append("Iceland is fetched in yearly API chunks because the endpoint blocks the full-span request.")
    if spec.note:
        notes.append(spec.note)
    return " ".join(notes)


def selected_codes_dk() -> list[str]:
    return sorted({code for spec in GROUPS for code in spec.dk_codes})


def selected_codes_se() -> list[str]:
    return sorted({code for spec in GROUPS for code in spec.se_codes})


def selected_codes_fi() -> list[str]:
    payload = metadata_payload("fi-trade-luke-agri-food-foreign-trade-luke-maa-ukaup-kk-px.json")
    all_codes = metadata_values(payload, "tuoteryhmä")
    prefixes = {prefix for spec in GROUPS for prefix in spec.fi_prefixes}
    return [code for code in all_codes if any(code.startswith(prefix) for prefix in prefixes)]


def selected_codes_is() -> list[str]:
    return sorted({code for spec in GROUPS for code in spec.is_codes})


@lru_cache(maxsize=1)
def no_08801_metadata() -> dict[str, Any]:
    response, _content_type, _status_code = fetch_json("https://data.ssb.no/api/v0/en/table/08801/")
    return response


def selected_codes_no() -> list[str]:
    values = metadata_values(no_08801_metadata(), "Varekoder")
    prefixes = ("02", "03", "04", "07", "08", "10", "15")
    return [value for value in values if value.startswith(prefixes)]


def annual_years_no() -> list[str]:
    return [value for value in metadata_values(no_08801_metadata(), "Tid") if value >= "2015"]


def land_codes_no() -> list[str]:
    return metadata_values(no_08801_metadata(), "Land")


def harvest_dk() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    time_values = filtered_values(
        metadata_values(metadata_payload("dk-trade-statbank-imports-and-exports-sitc-sitc2r4.json"), "Tid"),
        START_MONTH_CODE,
    )
    payload = {
        "table": "SITC2R4",
        "format": "JSONSTAT",
        "lang": "en",
        "variables": [
            {"code": "SITC", "values": selected_codes_dk()},
            {"code": "LAND", "values": ["W1"]},
            {"code": "INDUD", "values": ["1"]},
            {"code": "UHBEGREB", "values": ["GP"]},
            {"code": "Tid", "values": time_values},
        ],
    }
    response, content_type, status_code = fetch_json("https://api.statbank.dk/v1/data", payload=payload)
    raw_path = raw_output_path("dk-food-group-imports-monthly")
    write_json(
        raw_path,
        {
            "request": payload,
            "response_content_type": content_type,
            "response_status_code": status_code,
            "response": response,
        },
    )
    rows = []
    for row in jsonstat_rows(response):
        period = normalize_period(row["Tid"])
        if not month_gte(period, START_MONTH):
            continue
        rows.append({"country": "DK", "period": period, "source_code": row["SITC"], "value": row["value"]})
    return rows, {
        "country": "DK",
        "status": "ok",
        "source_name": "StatBank imports and exports SITC",
        "dataset_or_table_id": "SITC2R4",
        "observations_fetched": len(rows),
        "monthly_group_rows": 0,
        "annual_group_rows": 0,
        "raw_json": relative_to_project(raw_path),
        "note": "SITC imports, LAND=W1, UHBEGREB=GP.",
    }


def harvest_se() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    payload = {
        "query": [
            {"code": "VarugruppKN", "selection": {"filter": "item", "values": selected_codes_se()}},
            {"code": "ContentsCode", "selection": {"filter": "item", "values": ["HA0201AI"]}},
            {"code": "Tid", "selection": {"filter": "all", "values": ["*"]}},
        ],
        "response": {"format": "json-stat2"},
    }
    response, content_type, status_code = fetch_json(
        "https://api.scb.se/OV0104/v1/doris/en/ssd/HA/HA0201/HA0201B/ImpExpKNTotMan",
        payload=payload,
    )
    raw_path = raw_output_path("se-food-group-imports-monthly")
    write_json(
        raw_path,
        {
            "request": payload,
            "response_content_type": content_type,
            "response_status_code": status_code,
            "response": response,
        },
    )
    rows = []
    for row in jsonstat_rows(response):
        period = normalize_period(row["Tid"])
        if not month_gte(period, START_MONTH):
            continue
        rows.append({"country": "SE", "period": period, "source_code": row["VarugruppKN"], "value": row["value"]})
    return rows, {
        "country": "SE",
        "status": "ok",
        "source_name": "SCB imports and exports CN monthly",
        "dataset_or_table_id": "ImpExpKNTotMan",
        "observations_fetched": len(rows),
        "monthly_group_rows": 0,
        "annual_group_rows": 0,
        "raw_json": relative_to_project(raw_path),
        "note": "ContentsCode=HA0201AI, selected top-level CN chapters only.",
    }


def harvest_fi() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    payload = {
        "query": [
            {"code": "tuoteryhmä", "selection": {"filter": "item", "values": selected_codes_fi()}},
            {"code": "maa", "selection": {"filter": "item", "values": ["AA"]}},
            {"code": "muuttuja", "selection": {"filter": "item", "values": ["V1"]}},
            {"code": "suunta", "selection": {"filter": "item", "values": ["1"]}},
            {"code": "kuukausi", "selection": {"filter": "all", "values": ["*"]}},
        ],
        "response": {"format": "json-stat2"},
    }
    response, content_type, status_code = fetch_json(
        "https://statdb.luke.fi/PXWeb/api/v1/en/LUKE/maa/05%20Maataloustuotteiden%20ulkomaankauppa/Luke_maa_Ukaup_kk.px",
        payload=payload,
    )
    raw_path = raw_output_path("fi-food-group-imports-monthly")
    write_json(
        raw_path,
        {
            "request": payload,
            "response_content_type": content_type,
            "response_status_code": status_code,
            "response": response,
        },
    )
    rows = []
    for row in jsonstat_rows(response):
        period = normalize_period(row["kuukausi"])
        if not month_gte(period, START_MONTH):
            continue
        rows.append({"country": "FI", "period": period, "source_code": row["tuoteryhmä"], "value": row["value"]})
    return rows, {
        "country": "FI",
        "status": "ok",
        "source_name": "Luke agri-food foreign trade",
        "dataset_or_table_id": "Luke_maa_Ukaup_kk.px",
        "observations_fetched": len(rows),
        "monthly_group_rows": 0,
        "annual_group_rows": 0,
        "raw_json": relative_to_project(raw_path),
        "note": "maa=AA, muuttuja=V1, suunta=1.",
    }


def harvest_is() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    metadata = metadata_payload("is-trade-statistics-iceland-imports-by-sitc-and-countries-uta06201-px.json")
    country_values = metadata_values(metadata, "Country")
    month_values = filtered_values(metadata_values(metadata, "Month"), START_MONTH_CODE)
    months_by_year: dict[str, list[str]] = {}
    for month in month_values:
        months_by_year.setdefault(month[:4], []).append(month)

    rows = []
    raw_chunks = []
    for year in sorted(months_by_year):
        payload = {
            "query": [
                {"code": "SITC", "selection": {"filter": "item", "values": selected_codes_is()}},
                {"code": "Country", "selection": {"filter": "item", "values": country_values}},
                {"code": "Month", "selection": {"filter": "item", "values": months_by_year[year]}},
                {"code": "Unit", "selection": {"filter": "item", "values": ["0"]}},
            ],
            "response": {"format": "json-stat2"},
        }
        response, content_type, status_code = fetch_json(
            "https://px.hagstofa.is/pxen/api/v1/en/Efnahagur/utanrikisverslun/1_voruvidskipti/01_voruskipti/UTA06201.px",
            payload=payload,
        )
        raw_chunks.append(
            {
                "year": year,
                "request": payload,
                "response_content_type": content_type,
                "response_status_code": status_code,
                "response": response,
            }
        )
        for row in jsonstat_rows(response):
            period = normalize_period(row["Month"])
            if not month_gte(period, START_MONTH):
                continue
            rows.append({"country": "IS", "period": period, "source_code": row["SITC"], "value": row["value"]})

    raw_path = raw_output_path("is-food-group-imports-monthly")
    write_json(raw_path, {"chunks": raw_chunks})
    return rows, {
        "country": "IS",
        "status": "ok",
        "source_name": "Statistics Iceland imports by SITC and countries",
        "dataset_or_table_id": "UTA06201.px",
        "observations_fetched": len(rows),
        "monthly_group_rows": 0,
        "annual_group_rows": 0,
        "raw_json": relative_to_project(raw_path),
        "note": "Unit=0 (Import cif), split into yearly API calls and summed across partner countries in normalization.",
    }


def harvest_no_annual() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    url = "https://data.ssb.no/api/v0/en/table/08801/"
    payload_codes = selected_codes_no()
    payload_land_codes = land_codes_no()
    payload_years = annual_years_no()

    raw_chunks = []
    annual_totals: dict[tuple[str, str], float] = {}
    observation_count = 0

    for year in payload_years:
        payload = {
            "query": [
                {"code": "Varekoder", "selection": {"filter": "item", "values": payload_codes}},
                {"code": "ImpEks", "selection": {"filter": "item", "values": ["1"]}},
                {"code": "Land", "selection": {"filter": "item", "values": payload_land_codes}},
                {"code": "ContentsCode", "selection": {"filter": "item", "values": ["Verdi"]}},
                {"code": "Tid", "selection": {"filter": "item", "values": [year]}},
            ],
            "response": {"format": "json-stat2"},
        }
        response, content_type, status_code = fetch_json(url, payload=payload)
        year_totals, year_observations = jsonstat_group_sums(response, code_dimension="Varekoder", country="NO")
        observation_count += year_observations
        raw_chunks.append(
            {
                "year": year,
                "request": payload,
                "response_content_type": content_type,
                "response_status_code": status_code,
                "observation_count": year_observations,
                "group_totals": {key: numeric_string(value, 3) for key, value in sorted(year_totals.items())},
            }
        )
        for group_key, value in year_totals.items():
            annual_totals[(year, group_key)] = annual_totals.get((year, group_key), 0.0) + value

    basket_totals: dict[str, float] = {}
    for (year, _group), value in annual_totals.items():
        basket_totals[year] = basket_totals.get(year, 0.0) + value

    annual_rows = []
    source_name, dataset_id, code_family = country_source_meta("NO")
    for year, group_key in sorted(annual_totals):
        spec = next(item for item in GROUPS if item.key == group_key)
        value = annual_totals[(year, group_key)]
        basket_total = basket_totals[year]
        annual_rows.append(
            {
                "theme": "trade",
                "series_family": "food_group_import_value_annual",
                "series_id": f"no_{spec.key}_imports",
                "country": "NO",
                "commodity_group": spec.key,
                "commodity_group_label": spec.label,
                "source_name": source_name,
                "dataset_or_table_id": dataset_id,
                "period": year,
                "frequency": "annual",
                "flow": "imports",
                "metric": "Import value",
                "unit": value_unit("NO"),
                "value": numeric_string(value, 3),
                "share_of_selected_food_basket": numeric_string(value / basket_total, 6) if basket_total else "",
                "selected_food_basket_total": numeric_string(basket_total, 3),
                "code_family": code_family,
                "source_code_rule": source_code_rule("NO", spec),
                "coverage": monthly_coverage("NO"),
                "comparability": "broad food-group import proxy",
                "notes": common_note("NO", spec),
            }
        )

    raw_path = raw_output_path("no-food-group-imports-annual")
    write_json(raw_path, {"chunks": raw_chunks})
    return annual_rows, {
        "country": "NO",
        "status": "ok",
        "source_name": source_name,
        "dataset_or_table_id": dataset_id,
        "observations_fetched": observation_count,
        "monthly_group_rows": 0,
        "annual_group_rows": len(annual_rows),
        "raw_json": relative_to_project(raw_path),
        "note": "Annual-only import panel from detailed SSB commodity-number rows, chunked one year at a time.",
    }


def aggregate_monthly(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, str], dict[str, Any]] = {}
    for record in records:
        country = record["country"]
        spec = group_for_code(country, record["source_code"])
        if spec is None:
            continue
        key = (country, record["period"], spec.key)
        if key not in grouped:
            source_name, dataset_id, code_family = country_source_meta(country)
            grouped[key] = {
                "theme": "trade",
                "series_family": "food_group_import_value_monthly",
                "series_id": f"{country.lower()}_{spec.key}_imports",
                "country": country,
                "commodity_group": spec.key,
                "commodity_group_label": spec.label,
                "source_name": source_name,
                "dataset_or_table_id": dataset_id,
                "period": record["period"],
                "frequency": "monthly",
                "flow": "imports",
                "metric": "Import value",
                "unit": value_unit(country),
                "value": 0.0,
                "share_of_selected_food_basket": "",
                "selected_food_basket_total": "",
                "code_family": code_family,
                "source_code_rule": source_code_rule(country, spec),
                "coverage": monthly_coverage(country),
                "comparability": "broad food-group import proxy",
                "notes": common_note(country, spec),
            }
        grouped[key]["value"] += float(record["value"])

    rows = []
    for key in sorted(grouped):
        row = dict(grouped[key])
        row["value"] = numeric_string(row["value"], 3)
        rows.append(row)
    return rows


def aggregate_annual(monthly_rows: list[dict[str, Any]], direct_annual_rows: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in monthly_rows:
        year = row["period"][:4]
        key = (row["country"], year, row["commodity_group"])
        if key not in grouped:
            grouped[key] = {
                **row,
                "series_family": "food_group_import_value_annual",
                "period": year,
                "frequency": "annual",
                "value": 0.0,
                "share_of_selected_food_basket": "",
                "selected_food_basket_total": "",
            }
        grouped[key]["value"] += float(row["value"])

    basket_totals: dict[tuple[str, str], float] = {}
    for (country, year, _group), row in grouped.items():
        basket_key = (country, year)
        basket_totals[basket_key] = basket_totals.get(basket_key, 0.0) + float(row["value"])

    rows = []
    for key in sorted(grouped):
        row = dict(grouped[key])
        basket_total = basket_totals[(row["country"], row["period"])]
        row["share_of_selected_food_basket"] = numeric_string(float(row["value"]) / basket_total, 6) if basket_total else ""
        row["selected_food_basket_total"] = numeric_string(basket_total, 3)
        row["value"] = numeric_string(float(row["value"]), 3)
        rows.append(row)
    if direct_annual_rows:
        rows.extend(direct_annual_rows)
        rows.sort(key=lambda row: (row["country"], row["period"], row["commodity_group"]))
    return rows


def yearly_coverage(rows: list[dict[str, Any]], country: str) -> dict[str, str]:
    periods = sorted({row["period"] for row in rows if row["country"] == country})
    if not periods:
        return {"start": "", "end": ""}
    return {"start": periods[0], "end": periods[-1]}


def harvest_all() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    manifests: list[dict[str, Any]] = []
    source_records: list[dict[str, Any]] = []
    direct_annual_rows: list[dict[str, Any]] = []

    try:
        no_rows, no_manifest = harvest_no_annual()
        direct_annual_rows.extend(no_rows)
        manifests.append(no_manifest)
    except (HTTPError, URLError, KeyError, ValueError, json.JSONDecodeError) as exc:
        source_name, dataset_id, _code_family = country_source_meta("NO")
        manifests.append(
            {
                "country": "NO",
                "status": "error",
                "source_name": source_name,
                "dataset_or_table_id": dataset_id,
                "observations_fetched": 0,
                "monthly_group_rows": 0,
                "annual_group_rows": 0,
                "raw_json": "",
                "note": f"{type(exc).__name__}: {exc}",
            }
        )

    for harvest in (harvest_dk, harvest_se, harvest_fi, harvest_is):
        try:
            rows, manifest = harvest()
            source_records.extend(rows)
            manifests.append(manifest)
        except (HTTPError, URLError, KeyError, ValueError, json.JSONDecodeError) as exc:
            country = harvest.__name__.split("_", 1)[1].upper()
            source_name, dataset_id, _code_family = country_source_meta(country)
            manifests.append(
                {
                    "country": country,
                    "status": "error",
                    "source_name": source_name,
                    "dataset_or_table_id": dataset_id,
                    "observations_fetched": 0,
                    "monthly_group_rows": 0,
                    "annual_group_rows": 0,
                    "raw_json": "",
                    "note": f"{type(exc).__name__}: {exc}",
                }
            )

    monthly_rows = aggregate_monthly(source_records)
    annual_rows = aggregate_annual(monthly_rows, direct_annual_rows)

    monthly_counts = {country: 0 for country in COUNTRIES}
    annual_counts = {country: 0 for country in COUNTRIES}
    for row in monthly_rows:
        monthly_counts[row["country"]] = monthly_counts.get(row["country"], 0) + 1
    for row in annual_rows:
        annual_counts[row["country"]] = annual_counts.get(row["country"], 0) + 1
    for manifest in manifests:
        manifest["monthly_group_rows"] = monthly_counts.get(manifest["country"], 0)
        manifest["annual_group_rows"] = annual_counts.get(manifest["country"], manifest["annual_group_rows"])

    return monthly_rows, annual_rows, manifests


def write_outputs(monthly_rows: list[dict[str, Any]], annual_rows: list[dict[str, Any]], manifests: list[dict[str, Any]]) -> None:
    monthly_path = normalized_output_path("trade-group-imports-monthly")
    annual_path = normalized_output_path("trade-group-imports-annual")
    write_csv(monthly_path, monthly_rows, PANEL_FIELDS)
    write_csv(annual_path, annual_rows, PANEL_FIELDS)
    write_csv(MANIFEST_CSV, manifests, MANIFEST_FIELDS)

    coverage = {country: yearly_coverage(annual_rows, country) for country in COUNTRIES}
    run_summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "output_dir": relative_to_project(OUTPUT_DIR),
        "files": {
            "monthly_panel": relative_to_project(monthly_path),
            "annual_panel": relative_to_project(annual_path),
            "manifest_csv": relative_to_project(MANIFEST_CSV),
        },
        "included_countries": list(COUNTRIES),
        "included_groups": [spec.key for spec in GROUPS],
        "coverage_by_country": coverage,
        "row_counts": {
            "monthly_panel": len(monthly_rows),
            "annual_panel": len(annual_rows),
            "manifest": len(manifests),
        },
        "source_status": {manifest["country"]: manifest["status"] for manifest in manifests},
        "notes": [
            "The panel is imports-only in v1 so Iceland can be included from the ready grouped source.",
            "Denmark coverage starts in 2022 because the ready SITC2R4 monthly table does not expose earlier months in the harvested metadata set.",
            "Norway is intentionally omitted in v1 until grouped SSB trade extraction is stabilized.",
            "Annual rows also include share_of_selected_food_basket, a within-country share for the selected six food groups.",
        ],
    }
    write_json(RUN_SUMMARY_JSON, run_summary)


def main() -> None:
    monthly_rows, annual_rows, manifests = harvest_all()
    write_outputs(monthly_rows, annual_rows, manifests)
    ok_sources = sum(1 for item in manifests if item["status"] == "ok")
    print(
        f"trade-groups v1 complete: {len(monthly_rows)} monthly rows, "
        f"{len(annual_rows)} annual rows, {ok_sources} sources ok",
        flush=True,
    )


if __name__ == "__main__":
    main()
