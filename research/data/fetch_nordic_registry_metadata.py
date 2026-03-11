#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


DATA_DIR = Path(__file__).resolve().parent
REGISTRY_PATH = DATA_DIR.parent / "norden" / "nordic-source-registry.csv"
OUTPUT_DIR = DATA_DIR / "nordic" / "registry-metadata"
MANIFEST_CSV = OUTPUT_DIR / "manifest.csv"
MANIFEST_JSON = OUTPUT_DIR / "manifest.json"
RUN_SUMMARY_JSON = OUTPUT_DIR / "run-summary.json"

USER_AGENT = "FoodSystems2026/metadata-harvester"
TIMEOUT_SECONDS = 45


@dataclass
class FetchPlan:
    status: str
    fetch_url: str | None
    fetch_type: str
    reason: str | None = None


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return cleaned or "item"


def load_registry(path: Path) -> list[dict[str, str]]:
    with path.open(newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, payload: Any) -> None:
    with path.open("w") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=True)


def fetch_url(url: str) -> tuple[Any, str, int]:
    request = Request(
        url,
        headers={
            "Accept": "application/json, text/plain, */*",
            "User-Agent": USER_AGENT,
        },
    )
    with urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        raw = response.read()
        content_type = response.headers.get("Content-Type", "")
        status_code = response.status

    text = raw.decode("utf-8")
    if "json" in content_type.lower() or text[:1] in ("{", "["):
        return json.loads(text), content_type, status_code
    return text, content_type, status_code


def eurostat_preview_url(row: dict[str, str]) -> str | None:
    dataset_id = row["dataset_or_table_id"]
    if dataset_id == "prc_hicp_midx":
        params = [
            ("coicop", "CP01"),
            ("geo", "DK"),
            ("geo", "FI"),
            ("geo", "IS"),
            ("geo", "NO"),
            ("geo", "SE"),
        ]
        return f"{row['url']}?{urlencode(params)}"
    return None


def build_fetch_plan(row: dict[str, str]) -> FetchPlan:
    endpoint = row["api_base_or_endpoint"] or row["url"]
    dataset_id = row["dataset_or_table_id"]
    parsed = urlparse(endpoint)
    netloc = parsed.netloc.lower()

    if not endpoint:
        return FetchPlan("unsupported", None, "none", "missing endpoint")

    if "ec.europa.eu" in netloc:
        preview_url = eurostat_preview_url(row)
        if preview_url:
            return FetchPlan("ready", preview_url, "json")
        return FetchPlan("query_required", None, "manual", "dataset-specific filters required")

    if "fenixservices.fao.org" in netloc:
        return FetchPlan("query_required", None, "manual", "FAOSTAT requires dataset-specific query design")

    if "api.statbank.dk" in netloc:
        if dataset_id:
            metadata_url = f"https://api.statbank.dk/v1/tableinfo?lang=en&id={dataset_id}"
            return FetchPlan("ready", metadata_url, "json")
        return FetchPlan("query_required", None, "manual", "missing table id")

    if "data.ssb.no" in netloc and "/api/v0/en/table/" in parsed.path:
        return FetchPlan("ready", endpoint, "json")

    if "data.brreg.no" in netloc and parsed.path.endswith("/api/enheter"):
        return FetchPlan("ready", f"{endpoint}?size=1", "json")

    if "api.scb.se" in netloc and "/OV0104/v1/doris/" in endpoint:
        return FetchPlan("ready", endpoint, "json")

    if any(host in netloc for host in ("pxdata.stat.fi", "px.hagstofa.is", "statdb.luke.fi")) and endpoint.endswith(".px"):
        return FetchPlan("ready", endpoint, "json")

    if "graphql" in endpoint:
        return FetchPlan("auth_required", None, "manual", "GraphQL endpoint requires credentials or explicit query body")

    if "wfs.datafordeler.dk" in netloc or "datafordeler.dk" in netloc:
        return FetchPlan("auth_required", None, "manual", "Datafordeler service likely requires credentials or explicit service configuration")

    if any(marker in endpoint for marker in ("{businessId}", "/companies", "/financials", "/registerednotices")):
        return FetchPlan("query_required", None, "manual", "endpoint requires search parameters or path values")

    if "uljas.tulli.fi" in endpoint:
        return FetchPlan("query_required", None, "manual", "Uljas requires ifile and query parameters")

    if "finlex" in netloc and endpoint.rstrip("/").endswith("/v1"):
        return FetchPlan("query_required", None, "manual", "Finlex needs document path under API root")

    if "maanmittauslaitos.fi" in netloc or "paikkatieto" in endpoint:
        return FetchPlan("auth_required", None, "manual", "service requires API key")

    return FetchPlan("unsupported", None, "manual", "no direct metadata fetch rule for this endpoint")


def describe_payload(payload: Any) -> dict[str, Any]:
    description: dict[str, Any] = {}
    if isinstance(payload, dict):
        description["payload_kind"] = "dict"
        description["keys"] = sorted(payload.keys())[:20]
        if "variables" in payload and isinstance(payload["variables"], list):
            description["variable_count"] = len(payload["variables"])
        if "updated" in payload:
            description["updated"] = payload["updated"]
        if "title" in payload:
            description["title"] = payload["title"]
    elif isinstance(payload, list):
        description["payload_kind"] = "list"
        description["list_length"] = len(payload)
        if payload and isinstance(payload[0], dict):
            description["sample_keys"] = sorted(payload[0].keys())[:20]
    else:
        description["payload_kind"] = type(payload).__name__
    return description


def metadata_filename(row: dict[str, str]) -> str:
    parts = [
        row["country"],
        row["theme"],
        row["source_name"],
        row["dataset_or_table_id"] or "no-id",
    ]
    return f"{slugify('__'.join(parts))}.json"


def harvest_rows(rows: list[dict[str, str]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, Any]] = []
    counters = {
        "selected": 0,
        "fetched": 0,
        "ready": 0,
        "query_required": 0,
        "auth_required": 0,
        "unsupported": 0,
        "errors": 0,
    }

    for row in rows:
        counters["selected"] += 1
        plan = build_fetch_plan(row)
        counters[plan.status] = counters.get(plan.status, 0) + 1

        result = {
            "country": row["country"],
            "theme": row["theme"],
            "source_name": row["source_name"],
            "dataset_or_table_id": row["dataset_or_table_id"],
            "status": plan.status,
            "fetch_type": plan.fetch_type,
            "fetch_url": plan.fetch_url or "",
            "output_file": "",
            "content_type": "",
            "http_status": "",
            "payload_kind": "",
            "variable_count": "",
            "list_length": "",
            "updated": "",
            "reason": plan.reason or "",
            "error": "",
        }

        if plan.status != "ready" or not plan.fetch_url:
            results.append(result)
            continue

        try:
            payload, content_type, status_code = fetch_url(plan.fetch_url)
            output_path = OUTPUT_DIR / metadata_filename(row)
            file_payload = {
                "registry_row": row,
                "fetch_url": plan.fetch_url,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "content_type": content_type,
                "http_status": status_code,
                "summary": describe_payload(payload),
                "payload": payload,
            }
            write_json(output_path, file_payload)

            summary = file_payload["summary"]
            result.update(
                {
                    "output_file": str(output_path.relative_to(DATA_DIR.parent.parent)),
                    "content_type": content_type,
                    "http_status": status_code,
                    "payload_kind": summary.get("payload_kind", ""),
                    "variable_count": summary.get("variable_count", ""),
                    "list_length": summary.get("list_length", ""),
                    "updated": summary.get("updated", ""),
                }
            )
            counters["fetched"] += 1
        except HTTPError as error:
            result["status"] = "http_error"
            result["error"] = f"{error.code}: {error.reason}"
            counters["errors"] += 1
        except URLError as error:
            result["status"] = "network_error"
            result["error"] = str(error.reason)
            counters["errors"] += 1
        except Exception as error:  # noqa: BLE001
            result["status"] = "error"
            result["error"] = str(error)
            counters["errors"] += 1

        results.append(result)

    return results, counters


def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest metadata for high-priority Nordic API sources.")
    parser.add_argument("--priority", default="HIGH", help="Priority filter, default HIGH")
    parser.add_argument("--access-method", default="api", help="Access method filter, default api")
    parser.add_argument("--country", default="", help="Optional country filter, e.g. NO or FI")
    args = parser.parse_args()

    registry_rows = load_registry(REGISTRY_PATH)
    selected_rows = [
        row
        for row in registry_rows
        if row["priority"] == args.priority
        and row["access_method"] == args.access_method
        and (not args.country or row["country"] == args.country)
    ]

    results, counters = harvest_rows(selected_rows)
    fieldnames = list(results[0].keys()) if results else []

    if fieldnames:
        write_csv(MANIFEST_CSV, results, fieldnames)

    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "registry_path": str(REGISTRY_PATH),
        "output_dir": str(OUTPUT_DIR),
        "filters": {
            "priority": args.priority,
            "access_method": args.access_method,
            "country": args.country,
        },
        "counters": counters,
    }
    write_json(MANIFEST_JSON, results)
    write_json(RUN_SUMMARY_JSON, summary)

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
