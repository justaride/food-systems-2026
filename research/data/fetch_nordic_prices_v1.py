#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DATA_DIR = Path(__file__).resolve().parent
METADATA_DIR = DATA_DIR / "nordic" / "registry-metadata"
OUTPUT_DIR = DATA_DIR / "nordic" / "prices"
RAW_DIR = OUTPUT_DIR / "raw-json"
NORMALIZED_DIR = OUTPUT_DIR / "normalized"
MANIFEST_CSV = OUTPUT_DIR / "manifest.csv"
RUN_SUMMARY_JSON = OUTPUT_DIR / "run-summary.json"

USER_AGENT = "FoodSystems2026/prices-v1-harvester"
TIMEOUT_SECONDS = 60
START_MONTH = "2015M01"
START_YEAR = "2015"
COUNTRIES = ["DK", "FI", "IS", "NO", "SE"]


@dataclass(frozen=True)
class HarvestSpec:
    slug: str
    source_name: str
    adapter: str
    url: str
    metadata_file: str | None = None
    table: str | None = None
    time_code: str | None = None
    time_start: str | None = None
    selections: tuple[tuple[str, tuple[str, ...]], ...] = ()
    note: str = ""


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


def fetch_json(url: str, *, method: str = "GET", payload: dict[str, Any] | None = None) -> tuple[Any, str, int]:
    data = None
    headers = {
        "Accept": "application/json, text/json, text/plain, */*",
        "User-Agent": USER_AGENT,
    }
    if payload is not None:
        data = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        headers["Content-Type"] = "application/json"
        method = "POST"

    request = Request(url, data=data, headers=headers, method=method)
    with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        raw = response.read()
        content_type = response.headers.get("Content-Type", "")
        status_code = response.status

    text = raw.decode("utf-8")
    return json.loads(text), content_type, status_code


def metadata_payload(metadata_file: str) -> dict[str, Any]:
    payload = load_json(METADATA_DIR / metadata_file)
    return payload["payload"]


def metadata_variable(payload: dict[str, Any], code: str) -> dict[str, Any]:
    for variable in payload["variables"]:
        key = variable.get("code") or variable.get("id")
        if key == code:
            return variable
    raise KeyError(f"Variable {code!r} not found")


def metadata_values(payload: dict[str, Any], code: str) -> list[str]:
    variable = metadata_variable(payload, code)
    values = variable["values"]
    if values and isinstance(values[0], dict):
        return [item["id"] for item in values]
    return list(values)


def filtered_values(values: list[str], start: str | None) -> list[str]:
    if not start:
        return values
    return [value for value in values if value >= start]


def build_pxweb_payload(spec: HarvestSpec) -> dict[str, Any]:
    if not spec.metadata_file or not spec.time_code:
        raise ValueError(f"{spec.slug} is missing metadata/time config")

    payload = metadata_payload(spec.metadata_file)
    time_values = filtered_values(metadata_values(payload, spec.time_code), spec.time_start)
    query = []
    for code, values in spec.selections:
        query.append({"code": code, "selection": {"filter": "item", "values": list(values)}})
    query.append({"code": spec.time_code, "selection": {"filter": "item", "values": time_values}})
    return {"query": query, "response": {"format": "json-stat2"}}


def build_statbank_payload(spec: HarvestSpec) -> dict[str, Any]:
    if not spec.metadata_file or not spec.table or not spec.time_code:
        raise ValueError(f"{spec.slug} is missing metadata/table config")

    payload = metadata_payload(spec.metadata_file)
    time_values = filtered_values(metadata_values(payload, spec.time_code), spec.time_start)
    variables = []
    for code, values in spec.selections:
        variables.append({"code": code, "values": list(values)})
    variables.append({"code": spec.time_code, "values": time_values})
    return {"table": spec.table, "format": "JSONSTAT", "variables": variables}


def build_eurostat_url(spec: HarvestSpec) -> str:
    if spec.slug == "nordic-eurostat-hicp-food-monthly":
        return (
            f"{spec.url}/prc_hicp_midx"
            f"?lang=EN&freq=M&unit=I15&coicop=CP01&sinceTimePeriod=2015-01"
            + "".join(f"&geo={country}" for country in COUNTRIES)
        )
    if spec.slug == "nordic-eurostat-food-price-levels-annual":
        return (
            f"{spec.url}/prc_ppp_ind"
            f"?lang=EN&freq=A&na_item=PLI_EU27_2020&ppp_cat=A0101&sinceTimePeriod={START_YEAR}"
            + "".join(f"&geo={country}" for country in COUNTRIES)
        )
    raise ValueError(f"Unknown eurostat spec {spec.slug}")


def unwrap_jsonstat(payload: dict[str, Any]) -> dict[str, Any]:
    if "dataset" in payload and isinstance(payload["dataset"], dict):
        return payload["dataset"]
    return payload


def dataset_dimensions(dataset: dict[str, Any]) -> tuple[list[str], list[int], dict[str, Any]]:
    dimensions = dataset["dimension"]
    ids = dataset.get("id")
    sizes = dataset.get("size")

    if ids is not None and sizes is not None:
        return ids, sizes, dimensions

    if isinstance(dimensions, dict) and "id" in dimensions and "size" in dimensions:
        ids = dimensions["id"]
        sizes = dimensions["size"]
        clean_dimensions = {key: value for key, value in dimensions.items() if key not in {"id", "size", "role"}}
        return ids, sizes, clean_dimensions

    raise KeyError("JSON-stat dataset is missing id/size metadata")


def ordered_codes(category_index: dict[str, int]) -> list[str]:
    inverse = {int(index): code for code, index in category_index.items()}
    return [inverse[idx] for idx in range(len(inverse))]


def unravel_index(flat_index: int, sizes: list[int]) -> list[int]:
    coords: list[int] = []
    remainder = flat_index
    for size in reversed(sizes):
        coords.append(remainder % size)
        remainder //= size
    return list(reversed(coords))


def jsonstat_rows(payload: dict[str, Any]) -> tuple[list[dict[str, Any]], list[str]]:
    dataset = unwrap_jsonstat(payload)
    ids, sizes, dimensions = dataset_dimensions(dataset)

    codes_by_dim: dict[str, list[str]] = {}
    labels_by_dim: dict[str, dict[str, str]] = {}
    for dim in ids:
        category = dimensions[dim]["category"]
        codes_by_dim[dim] = ordered_codes(category["index"])
        labels_by_dim[dim] = category.get("label", {})

    values = dataset["value"]
    if isinstance(values, dict):
        iterator = sorted(((int(index), value) for index, value in values.items()), key=lambda item: item[0])
    else:
        iterator = list(enumerate(values))

    rows: list[dict[str, Any]] = []
    fieldnames = [*ids, *(f"{dim}_label" for dim in ids), "value"]

    for flat_index, value in iterator:
        if value is None:
            continue
        coords = unravel_index(flat_index, sizes)
        row: dict[str, Any] = {}
        for dim, coord in zip(ids, coords):
            code = codes_by_dim[dim][coord]
            row[dim] = code
            row[f"{dim}_label"] = labels_by_dim[dim].get(code, "")
        row["value"] = value
        rows.append(row)

    return rows, fieldnames


def raw_output_path(spec: HarvestSpec) -> Path:
    return RAW_DIR / f"{slugify(spec.slug)}.json"


def normalized_output_path(spec: HarvestSpec) -> Path:
    return NORMALIZED_DIR / f"{slugify(spec.slug)}.csv"


def harvest_spec(spec: HarvestSpec) -> dict[str, Any]:
    print(f"Fetching {spec.slug}...", flush=True)
    if spec.adapter == "eurostat":
        url = build_eurostat_url(spec)
        request_payload = None
        method = "GET"
    elif spec.adapter == "pxweb":
        url = spec.url
        request_payload = build_pxweb_payload(spec)
        method = "POST"
    elif spec.adapter == "statbank":
        url = spec.url
        request_payload = build_statbank_payload(spec)
        method = "POST"
    else:
        raise ValueError(f"Unsupported adapter {spec.adapter!r}")

    response_payload, content_type, status_code = fetch_json(url, method=method, payload=request_payload)
    rows, fieldnames = jsonstat_rows(response_payload)

    raw_path = raw_output_path(spec)
    normalized_path = normalized_output_path(spec)
    write_json(
        raw_path,
        {
            "spec": {
                "slug": spec.slug,
                "source_name": spec.source_name,
                "adapter": spec.adapter,
                "url": url,
                "note": spec.note,
            },
            "request_payload": request_payload,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "content_type": content_type,
            "http_status": status_code,
            "response": response_payload,
        },
    )
    write_csv(normalized_path, rows, fieldnames)

    dataset = unwrap_jsonstat(response_payload)
    ids, _, _ = dataset_dimensions(dataset)
    print(f"  Saved {spec.slug}: {len(rows)} rows", flush=True)
    return {
        "slug": spec.slug,
        "source_name": spec.source_name,
        "status": "ok",
        "adapter": spec.adapter,
        "http_status": status_code,
        "content_type": content_type,
        "row_count": len(rows),
        "dimensions": ",".join(ids),
        "updated": dataset.get("updated", ""),
        "raw_file": str(raw_path.relative_to(DATA_DIR.parent.parent)),
        "normalized_file": str(normalized_path.relative_to(DATA_DIR.parent.parent)),
        "note": spec.note,
        "error": "",
    }


SPECS: list[HarvestSpec] = [
    HarvestSpec(
        slug="nordic-eurostat-hicp-food-monthly",
        source_name="Eurostat HICP monthly food",
        adapter="eurostat",
        url="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data",
        note="Harmonised food inflation comparison across DK, FI, IS, NO, SE.",
    ),
    HarvestSpec(
        slug="nordic-eurostat-food-price-levels-annual",
        source_name="Eurostat price level indices food",
        adapter="eurostat",
        url="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data",
        note="Annual price level index for food with EU27_2020 benchmark.",
    ),
    HarvestSpec(
        slug="no-ssb-cpi-food-14700",
        source_name="SSB CPI food and non-alcoholic beverages",
        adapter="pxweb",
        url="https://data.ssb.no/api/v0/en/table/14700/",
        metadata_file="no-prices-ssb-cpi-goods-and-services-14700.json",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("VareTjenesteGrp", ("01",)), ("ContentsCode", ("KpiIndMnd",))),
    ),
    HarvestSpec(
        slug="no-ssb-cpi-food-03013-archive",
        source_name="SSB archived CPI food bridge",
        adapter="pxweb",
        url="https://data.ssb.no/api/v0/en/table/03013/",
        metadata_file="no-prices-ssb-archived-cpi-bridge-03013.json",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("Konsumgrp", ("01",)), ("ContentsCode", ("KpiIndMnd",))),
    ),
    HarvestSpec(
        slug="no-ssb-ppi-food-domestic-12462",
        source_name="SSB producer price index food domestic market",
        adapter="pxweb",
        url="https://data.ssb.no/api/v0/en/table/12462/",
        metadata_file="no-prices-ssb-producer-price-index-12462.json",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("Marked", ("01",)), ("NaringUtenriks", ("SNN10",)), ("ContentsCode", ("Indeksnivo",))),
    ),
    HarvestSpec(
        slug="dk-statbank-cpi-food-pris01",
        source_name="StatBank Denmark CPI food and non-alcoholic beverages",
        adapter="statbank",
        url="https://api.statbank.dk/v1/data",
        metadata_file="dk-prices-statbank-consumer-price-index-pris01.json",
        table="PRIS01",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("VAREGR", ("01",)), ("ENHED", ("100",))),
    ),
    HarvestSpec(
        slug="dk-statbank-hicp-food-pris07",
        source_name="StatBank Denmark HICP food and non-alcoholic beverages",
        adapter="statbank",
        url="https://api.statbank.dk/v1/data",
        metadata_file="dk-prices-statbank-hicp-pris07.json",
        table="PRIS07",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("VAREGR", ("01",)), ("ENHED", ("100",))),
    ),
    HarvestSpec(
        slug="dk-statbank-food-price-levels-ppp1",
        source_name="StatBank Denmark price level indices food",
        adapter="statbank",
        url="https://api.statbank.dk/v1/data",
        metadata_file="dk-prices-statbank-price-level-indices-food-ppp1.json",
        table="PPP1",
        time_code="Tid",
        time_start=START_YEAR,
        selections=(("VAREGR", ("A010101",)), ("LAND", ("DK", "FI", "IS", "NO", "SE"))),
    ),
    HarvestSpec(
        slug="se-scb-cpi-food-kpi2020coicopm",
        source_name="SCB CPI food and non-alcoholic beverages",
        adapter="pxweb",
        url="https://api.scb.se/OV0104/v1/doris/en/ssd/PR/PR0101/PR0101A/KPI2020COICOPM",
        metadata_file="se-prices-scb-cpi-by-coicop-month-kpi2020coicopm.json",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("VaruTjanstegrupp", ("01",)), ("ContentsCode", ("0000080H",))),
    ),
    HarvestSpec(
        slug="se-scb-ppi-food-ppi2020m",
        source_name="SCB producer price index food products",
        adapter="pxweb",
        url="https://api.scb.se/OV0104/v1/doris/en/ssd/PR/PR0301/PR0301G/PPI2020M",
        metadata_file="se-prices-scb-ppi-month-ppi2020m.json",
        time_code="Tid",
        time_start=START_MONTH,
        selections=(("SPIN2015", ("10",)), ("ContentsCode", ("000000SA",))),
    ),
    HarvestSpec(
        slug="fi-statfin-cpi-food-15b5",
        source_name="StatFin CPI food and non-alcoholic beverages",
        adapter="pxweb",
        url="https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/khi/statfin_khi_pxt_15b5.px",
        metadata_file="fi-prices-statfin-cpi-food-filterable-statfin-khi-pxt-15b5-px.json",
        time_code="Kuukausi",
        time_start=START_MONTH,
        selections=(("Hy\u00f6dyke", ("01",)), ("Tiedot", ("ip_khi",))),
    ),
    HarvestSpec(
        slug="fi-statfin-hicp-food-15b7",
        source_name="StatFin HICP food and non-alcoholic beverages",
        adapter="pxweb",
        url="https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/khi/statfin_khi_pxt_15b7.px",
        metadata_file="fi-prices-statfin-hicp-current-base-statfin-khi-pxt-15b7-px.json",
        time_code="Kuukausi",
        time_start=START_MONTH,
        selections=(("Hy\u00f6dyke", ("01",)), ("Tiedot", ("ip_ykhi",))),
    ),
    HarvestSpec(
        slug="fi-statfin-ppi-food-118g",
        source_name="StatFin producer price index food products",
        adapter="pxweb",
        url="https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/thi/statfin_thi_pxt_118g.px",
        metadata_file="fi-prices-statfin-producer-price-index-statfin-thi-pxt-118g-px.json",
        time_code="Kuukausi",
        time_start=START_MONTH,
        selections=(
            ("Tuotteet toimialoittain (CPA 2015, MIG)", ("10",)),
            ("Indeksisarja", ("1",)),
            ("Tiedot", ("pisteluku15",)),
        ),
    ),
]


SKIPPED_DATASETS = [
    {
        "slug": "fi-luke-producer-prices-0400-tuohin",
        "reason": "Separate producer-price commodity series, not comparable food CPI/HICP for prices v1.",
    },
    {
        "slug": "dk-statbank-agricultural-output-prices-lpris10",
        "reason": "Commodity-specific farm gate table; keep for later producer-price extension.",
    },
    {
        "slug": "is-statistics-iceland-cpi-vis01000",
        "reason": "General CPI table, not food-filtered in current registry entry.",
    },
    {
        "slug": "is-statistics-iceland-hicp-vis02502",
        "reason": "Cross-country HICP table without food-group filter in current registry entry.",
    },
]


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    NORMALIZED_DIR.mkdir(parents=True, exist_ok=True)

    results: list[dict[str, Any]] = []
    counters = {"selected": len(SPECS), "ok": 0, "errors": 0}

    for spec in SPECS:
        try:
            result = harvest_spec(spec)
            results.append(result)
            counters["ok"] += 1
        except HTTPError as error:
            results.append(
                {
                    "slug": spec.slug,
                    "source_name": spec.source_name,
                    "status": "http_error",
                    "adapter": spec.adapter,
                    "http_status": getattr(error, "code", ""),
                    "content_type": "",
                    "row_count": 0,
                    "dimensions": "",
                    "updated": "",
                    "raw_file": "",
                    "normalized_file": "",
                    "note": spec.note,
                    "error": f"{error.code}: {error.reason}",
                }
            )
            counters["errors"] += 1
        except URLError as error:
            results.append(
                {
                    "slug": spec.slug,
                    "source_name": spec.source_name,
                    "status": "network_error",
                    "adapter": spec.adapter,
                    "http_status": "",
                    "content_type": "",
                    "row_count": 0,
                    "dimensions": "",
                    "updated": "",
                    "raw_file": "",
                    "normalized_file": "",
                    "note": spec.note,
                    "error": str(error.reason),
                }
            )
            counters["errors"] += 1
        except Exception as error:  # noqa: BLE001
            results.append(
                {
                    "slug": spec.slug,
                    "source_name": spec.source_name,
                    "status": "error",
                    "adapter": spec.adapter,
                    "http_status": "",
                    "content_type": "",
                    "row_count": 0,
                    "dimensions": "",
                    "updated": "",
                    "raw_file": "",
                    "normalized_file": "",
                    "note": spec.note,
                    "error": str(error),
                }
            )
            counters["errors"] += 1

    write_csv(
        MANIFEST_CSV,
        results,
        [
            "slug",
            "source_name",
            "status",
            "adapter",
            "http_status",
            "content_type",
            "row_count",
            "dimensions",
            "updated",
            "raw_file",
            "normalized_file",
            "note",
            "error",
        ],
    )
    write_json(
        RUN_SUMMARY_JSON,
        {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "output_dir": str(OUTPUT_DIR),
            "selected_specs": [spec.slug for spec in SPECS],
            "skipped_datasets": SKIPPED_DATASETS,
            "counters": counters,
        },
    )


if __name__ == "__main__":
    main()
