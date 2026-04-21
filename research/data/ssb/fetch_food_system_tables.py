#!/usr/bin/env python3
"""Fetch Tier 1 SSB tables for Food Systems 2026.

Tables:
  03710  Husdyr per 1. mars (livestock by species), 1990-
  07326  Akvakultur, salg slaktet matfisk (aquaculture sales), 1976-2019
  09170  Produksjon og inntekt etter næring (national accounts by industry), 1970-
  05982  Jordbruksareal etter bruken (agricultural area by use), 1969-
  13931  Klimagassutslipp etter kilde (GHG emissions by source), 1990-
  11131  Sysselsatte etter næring (employment by industry), 2008-

Output: one CSV per table + combined metadata JSON.
"""
from __future__ import annotations

import csv
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
SSB_API = "https://data.ssb.no/api/v0/no/table"


def curl_json(url: str, payload: dict | None = None) -> dict:
    cmd = ["curl", "-sS", url]
    if payload is not None:
        cmd = [
            "curl", "-sS", "-X", "POST", url,
            "-H", "Content-Type: application/json",
            "--data", json.dumps(payload),
        ]
    output = subprocess.check_output(cmd, text=True)
    return json.loads(output)


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def ssb_metadata(table: str) -> dict:
    return curl_json(f"{SSB_API}/{table}/")


def dim_labels(meta: dict, code: str) -> dict[str, str]:
    var = next(v for v in meta["variables"] if v["code"] == code)
    return dict(zip(var["values"], var["valueTexts"]))


def unravel(flat_index: int, sizes: list[int]) -> list[int]:
    coords: list[int] = []
    remainder = flat_index
    for size in reversed(sizes):
        coords.append(remainder % size)
        remainder //= size
    return list(reversed(coords))


def fetch_table(
    table: str,
    selections: list[dict],
    response_format: str = "json-stat2",
) -> dict:
    meta = ssb_metadata(table)
    query = []
    for sel in selections:
        code = sel["code"]
        if sel.get("all"):
            var = next(v for v in meta["variables"] if v["code"] == code)
            values = var["values"]
        else:
            values = sel["values"]
        query.append({
            "code": code,
            "selection": {"filter": "item", "values": values},
        })
    payload = {"query": query, "response": {"format": response_format}}
    return curl_json(f"{SSB_API}/{table}/", payload), meta


def flatten_dataset(dataset: dict) -> list[dict]:
    dims = dataset["id"]
    sizes = dataset["size"]
    values = dataset["value"]

    labels_by_dim: dict[str, dict[int, str]] = {}
    codes_by_dim: dict[str, dict[int, str]] = {}
    for dim in dims:
        cat = dataset["dimension"][dim]["category"]
        idx = cat["index"]
        lbl = cat["label"]
        inv = {v: k for k, v in idx.items()}
        codes_by_dim[dim] = inv
        labels_by_dim[dim] = {v: lbl[k] for k, v in idx.items()}

    rows = []
    for flat_i, value in enumerate(values):
        if value is None:
            continue
        coords = unravel(flat_i, sizes)
        row = {}
        for dim, coord in zip(dims, coords):
            code = codes_by_dim[dim][coord]
            label = labels_by_dim[dim][coord]
            row[f"{dim}_code"] = code
            row[f"{dim}_label"] = label
        row["value"] = value
        rows.append(row)
    return rows


def make_meta(table: str, dataset: dict, meta: dict, rows: list[dict], note: str) -> dict:
    return {
        "table": table,
        "note": note,
        "updated": dataset.get("updated"),
        "label": dataset.get("label"),
        "row_count": len(rows),
    }


# ── Table definitions ──────────────────────────────────────────────


def fetch_03710_livestock():
    print("03710  Husdyr …")
    dataset, meta = fetch_table("03710", [
        {"code": "Husdyr", "all": True},
        {"code": "ContentsCode", "values": ["Huusdyr"]},
        {"code": "Tid", "all": True},
    ])
    raw = flatten_dataset(dataset)
    rows = [
        {
            "Year": r["Tid_code"],
            "SpeciesCode": r["Husdyr_code"],
            "Species": r["Husdyr_label"],
            "Count": int(r["value"]),
        }
        for r in raw
    ]
    rows.sort(key=lambda r: (r["Year"], r["SpeciesCode"]))
    path = DATA_DIR / "ssb-03710-husdyr.csv"
    write_csv(path, ["Year", "SpeciesCode", "Species", "Count"], rows)
    return make_meta("03710", dataset, meta, rows,
                     "Livestock by species, national, all years"), path


def fetch_07326_aquaculture():
    print("07326  Akvakultur …")
    dataset, meta = fetch_table("07326", [
        {"code": "Region", "values": ["0"]},
        {"code": "Fiskeslag", "all": True},
        {"code": "ContentsCode", "values": ["Mengde", "Verdi"]},
        {"code": "Tid", "all": True},
    ])
    raw = flatten_dataset(dataset)
    by_key: dict[tuple, dict] = {}
    for r in raw:
        key = (r["Tid_code"], r["Fiskeslag_code"])
        if key not in by_key:
            by_key[key] = {
                "Year": r["Tid_code"],
                "SpeciesCode": r["Fiskeslag_code"],
                "Species": r["Fiskeslag_label"],
                "Tonnes": "",
                "Value1000NOK": "",
            }
        if r["ContentsCode_code"] == "Mengde":
            by_key[key]["Tonnes"] = r["value"]
        else:
            by_key[key]["Value1000NOK"] = r["value"]

    rows = sorted(by_key.values(), key=lambda r: (r["Year"], r["SpeciesCode"]))
    path = DATA_DIR / "ssb-07326-akvakultur-matfisk.csv"
    write_csv(path, ["Year", "SpeciesCode", "Species", "Tonnes", "Value1000NOK"], rows)
    return make_meta("07326", dataset, meta, rows,
                     "Aquaculture slaughtered food fish, national, quantity + value"), path


NACE_09170 = [
    "nr23_6",           # Total all industries
    "A64NP2X01",        # Jordbruk, jakt og viltstell
    "pub2X03",          # Fiske, fangst og akvakultur
    "A64NP2X03A",       # Fiske og fangst
    "A64NP2X03B",       # Akvakultur
    "A64NP2X10_12",     # Nærings-, drikkevare- og tobakksindustri
    "nr2310",           # Næringsmidler u/fiskeforedling inkl. drikkevarer
    "nr2312",           # Bearbeiding og konservering av fisk
]

CONTENTS_09170 = ["Prob", "BNPB", "LOKO", "DRI"]


def fetch_09170_national_accounts():
    print("09170  Produksjon/inntekt …")
    dataset, meta = fetch_table("09170", [
        {"code": "NACE", "values": NACE_09170},
        {"code": "ContentsCode", "values": CONTENTS_09170},
        {"code": "Tid", "all": True},
    ])
    raw = flatten_dataset(dataset)
    by_key: dict[tuple, dict] = {}
    for r in raw:
        key = (r["Tid_code"], r["NACE_code"])
        if key not in by_key:
            by_key[key] = {
                "Year": r["Tid_code"],
                "NACECode": r["NACE_code"],
                "Industry": r["NACE_label"],
            }
        col = r["ContentsCode_code"]
        by_key[key][col] = r["value"]

    rows = sorted(by_key.values(), key=lambda r: (r["Year"], r["NACECode"]))
    fields = ["Year", "NACECode", "Industry"] + CONTENTS_09170
    path = DATA_DIR / "ssb-09170-produksjon-inntekt-naering.csv"
    write_csv(path, fields, rows)
    return make_meta("09170", dataset, meta, rows,
                     "Production, GDP, wages, operating result by food-system NACE"), path


def fetch_05982_agricultural_area():
    print("05982  Jordbruksareal …")
    dataset, meta = fetch_table("05982", [
        {"code": "VekstarDekar", "all": True},
        {"code": "ContentsCode", "values": ["Jordbruksareal"]},
        {"code": "Tid", "all": True},
    ])
    raw = flatten_dataset(dataset)
    rows = [
        {
            "Year": r["Tid_code"],
            "CropCode": r["VekstarDekar_code"],
            "CropType": r["VekstarDekar_label"],
            "AreaDekar": r["value"],
        }
        for r in raw
    ]
    rows.sort(key=lambda r: (r["Year"], r["CropCode"]))
    path = DATA_DIR / "ssb-05982-jordbruksareal.csv"
    write_csv(path, ["Year", "CropCode", "CropType", "AreaDekar"], rows)
    return make_meta("05982", dataset, meta, rows,
                     "Agricultural area by crop type, national, all years"), path


SOURCES_13931 = [
    "0",    # Alle kilder
    "7",    # Jordbruk
    "7.1",  # Jordbruk — husdyr og husdyrgjødsel
    "7.2",  # Jordbruk — kunstgjødsel og annet
    "2",    # Industri og bergverk
    "6",    # Luftfart, sjøfart, fiske, motorredskaper
]


def fetch_13931_emissions():
    print("13931  Klimagassutslipp …")
    dataset, meta = fetch_table("13931", [
        {"code": "UtslpTilLuft", "values": SOURCES_13931},
        {"code": "UtslpEnergivare", "values": ["VT0"]},
        {"code": "UtslpKomp", "values": ["A10", "K11", "K12", "K13"]},
        {"code": "ContentsCode", "values": ["UtslippCO2ekvival"]},
        {"code": "Tid", "all": True},
    ])
    raw = flatten_dataset(dataset)
    by_key: dict[tuple, dict] = {}
    for r in raw:
        key = (r["Tid_code"], r["UtslpTilLuft_code"])
        if key not in by_key:
            by_key[key] = {
                "Year": r["Tid_code"],
                "SourceCode": r["UtslpTilLuft_code"],
                "Source": r["UtslpTilLuft_label"],
            }
        comp = r["UtslpKomp_code"]
        by_key[key][comp] = r["value"]

    rows = sorted(by_key.values(), key=lambda r: (r["Year"], r["SourceCode"]))
    fields = ["Year", "SourceCode", "Source", "A10", "K11", "K12", "K13"]
    path = DATA_DIR / "ssb-13931-klimagassutslipp.csv"
    write_csv(path, fields, rows)
    return make_meta("13931", dataset, meta, rows,
                     "GHG emissions (CO2eq) by source — total, agriculture, industry, fisheries"), path


def fetch_11131_employment():
    print("11131  Sysselsatte …")
    dataset, meta = fetch_table("11131", [
        {"code": "Kjonn", "values": ["0"]},
        {"code": "NACE2007", "all": True},
        {"code": "Yrkesstatus", "values": ["00"]},
        {"code": "ContentsCode", "values": ["Sysselsatt"]},
        {"code": "Tid", "all": True},
    ])
    raw = flatten_dataset(dataset)
    rows = [
        {
            "Year": r["Tid_code"],
            "NACECode": r["NACE2007_code"],
            "Industry": r["NACE2007_label"],
            "Employed1000": r["value"],
        }
        for r in raw
    ]
    rows.sort(key=lambda r: (r["Year"], r["NACECode"]))
    path = DATA_DIR / "ssb-11131-sysselsatte-naering.csv"
    write_csv(path, ["Year", "NACECode", "Industry", "Employed1000"], rows)
    return make_meta("11131", dataset, meta, rows,
                     "Employment by NACE industry, both genders, all statuses"), path


# ── Main ───────────────────────────────────────────────────────────


FETCHERS = [
    fetch_03710_livestock,
    fetch_07326_aquaculture,
    fetch_09170_national_accounts,
    fetch_05982_agricultural_area,
    fetch_13931_emissions,
    fetch_11131_employment,
]


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    all_meta = {}
    written = []

    for fetcher in FETCHERS:
        try:
            table_meta, path = fetcher()
            all_meta[table_meta["table"]] = table_meta
            written.append(path.name)
            print(f"  ✓ {path.name}  ({table_meta['row_count']} rows)")
        except Exception as exc:
            print(f"  ✗ {fetcher.__name__}: {exc}", file=sys.stderr)

    meta_path = DATA_DIR / "food_system_tables_metadata.json"
    combined = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "tables": all_meta,
    }
    with meta_path.open("w") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)

    print(f"\nWrote {len(written)} tables + metadata:")
    for name in written:
        print(f"  - {name}")
    print(f"  - {meta_path.name}")


if __name__ == "__main__":
    main()
