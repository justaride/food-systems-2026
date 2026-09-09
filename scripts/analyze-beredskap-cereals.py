#!/usr/bin/env python3
"""Reproduce the bounded 2015–2020 cereal analysis from frozen Eurostat bytes.

No network or database writes. Output must be a new directory. Source hashes and
JSON-stat coordinates are retained; missing cells never become zero.
"""
import argparse
import hashlib
import itertools
import json
import math
from pathlib import Path
from statistics import mean

COUNTRIES = {"NO": "Norge", "SE": "Sverige", "DK": "Danmark", "FI": "Finland"}
MEASURES = {"area_kha": "AR_THS_HA", "production_kt": "HPRD_HUMD_EU_THS_T",
            "reported_yield_t_ha": "YLD_HUMD_EU_T_HA", "humidity_pct": "HUMD_EU_PC"}


def decode(data):
    """Decode JSON-stat2 sparse/dense values in declared dimension order."""
    ids, sizes = data["id"], data["size"]
    if len(ids) != len(set(ids)) or len(ids) != len(sizes):
        raise ValueError("invalid dimensions")
    axes = []
    for dim, size in zip(ids, sizes):
        index = data["dimension"][dim]["category"]["index"]
        if isinstance(index, list):
            axis = index
        else:
            if sorted(index.values()) != list(range(size)):
                raise ValueError("non-contiguous category indices")
            axis = sorted(index, key=index.get)
        if len(axis) != size or len(set(axis)) != size:
            raise ValueError("invalid category size")
        axes.append(axis)
    total = math.prod(sizes)
    def checked_cells(values):
        if isinstance(values, list):
            if len(values) != total:
                raise ValueError("dense value length mismatch")
        elif isinstance(values, dict):
            if any(not k.isdigit() or str(int(k)) != k or int(k) >= total for k in values):
                raise ValueError("out of bounds sparse cell")
        else:
            raise ValueError("invalid value container")
        return values
    values = checked_cells(data["value"])
    statuses = checked_cells(data.get("status", {}))
    def cell(container, i):
        return container[i] if isinstance(container, list) else container.get(str(i))
    rows = []
    for i, coordinates in enumerate(itertools.product(*axes)):
        v = cell(values, i)
        if v is not None and (isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v)):
            raise ValueError("non-numeric observation")
        rows.append({**dict(zip(ids, coordinates)), "value": v,
                     "status": cell(statuses, i), "cellIndex": i})
    return rows


def change(value, baseline):
    if value is None or baseline is None or baseline <= 0:
        return None
    return 100 * (value / baseline - 1)


def analyze(main_data, norway_data):
    indexed = []
    for sid, data in (("R4-EU-S001", main_data), ("R4-EU-S002", norway_data)):
        if data["id"] != ["freq", "crops", "strucpro", "geo", "time"]:
            raise ValueError("unexpected Eurostat dimensions")
        indexed.extend({**r, "sourceId": sid} for r in decode(data))
    lookup = {}
    for r in indexed:
        key = tuple(r[d] for d in ("sourceId", "geo", "crops", "strucpro", "time"))
        if key in lookup:
            raise ValueError("duplicate observation key")
        lookup[key] = r
    panel, warnings = [], []
    for country, label in COUNTRIES.items():
        for crop in ("wheat", "barley"):
            code = "C1300" if crop == "barley" else "C1110" if country == "NO" else "C1100"
            sid = "R4-EU-S002" if code == "C1110" else "R4-EU-S001"
            for year in range(2015, 2021):
                r = {"country": country, "country_name": label, "crop": crop,
                     "crop_code": code, "crop_label": "Bygg" if crop == "barley" else "Vanlig hvete og spelt" if country == "NO" else "Hvete og spelt",
                     "year": year, "sourceId": sid, "human_verified": False,
                     "food_grade_tonnes": None, "own_need_tonnes": None,
                     "exportable_tonnes": None, "locators": {}}
                for field, measure in MEASURES.items():
                    cell = lookup[(sid, country, code, measure, str(year))]
                    r[field] = cell["value"]
                    r["locators"][field] = {"jsonPointer": "/value/" + str(cell["cellIndex"]), "status": cell["status"], "strucpro": measure}
                    if cell["value"] is None or cell["status"]:
                        warnings.append({"kind": "missing_or_flagged", "country": country, "crop": code, "year": year, "field": field, "status": cell["status"]})
                if any(r[f] is not None and r[f] < 0 for f in MEASURES):
                    raise ValueError("negative crop measure")
                if r["humidity_pct"] != 14:
                    raise ValueError("unexpected humidity basis")
                a, p, y = r["area_kha"], r["production_kt"], r["reported_yield_t_ha"]
                r["derived_yield_t_ha"] = p / a if p is not None and a is not None and a > 0 else None
                # Conservative display-rounding envelope: area/production ±0.05,
                # yield ±0.005. This tests consistency, not statistical accuracy.
                coherent = None
                if all(v is not None for v in (a, p, y)) and a > 0.05:
                    coherent = ((p - .05) / (a + .05) <= y + .005 and
                                (p + .05) / (a - .05) >= y - .005)
                    if not coherent:
                        warnings.append({"kind": "reported_yield_outside_rounding_envelope", "country": country, "crop": code, "year": year, "reported": y, "derived": r["derived_yield_t_ha"]})
                r["reported_yield_rounding_consistent"] = coherent
                panel.append(r)
    metrics = ("production_kt", "area_kha", "derived_yield_t_ha")
    contrasts = []
    for country in COUNTRIES:
        for crop in ("wheat", "barley"):
            group = [r for r in panel if r["country"] == country and r["crop"] == crop]
            before = [r for r in group if r["year"] <= 2017]
            for year in (2018, 2019, 2020):
                current = next(r for r in group if r["year"] == year)
                result = {k: current[k] for k in ("country", "country_name", "crop", "crop_code", "crop_label", "year", "sourceId")}
                result["comparison_eligibility"] = {}
                for field in metrics:
                    vals = [r[field] for r in before]
                    dependencies = ("production_kt", "area_kha") if field == "derived_yield_t_ha" else (field,)
                    flagged = any(r["locators"][dep]["status"] for r in before + [current] for dep in dependencies)
                    eligible = not flagged and len(vals) == 3 and all(v is not None for v in vals) and current[field] is not None
                    baseline = mean(vals) if eligible else None
                    result["comparison_eligibility"][field] = "eligible_unflagged_complete" if eligible else "withheld_missing_or_flagged"
                    result[field] = current[field]
                    result[field + "_baseline_2015_2017"] = baseline
                    result[field + "_change_pct"] = change(current[field], baseline)
                prior = next(r for r in group if r["year"] == 2017)
                prior_flagged = any(r["locators"]["production_kt"]["status"] for r in (prior, current))
                result["production_change_vs_2017_pct"] = None if prior_flagged else change(current["production_kt"], prior["production_kt"])
                contrasts.append(result)
    missing_main = [r for r in indexed if r["sourceId"] == "R4-EU-S001" and r["geo"] == "NO" and r["crops"] == "C1100" and r["strucpro"] in MEASURES.values() and r["value"] is None]
    return {"authority": "internal_analysis_only", "human_verified": False,
            "baseline": "Unweighted mean of annual values 2015–2017; predeclared before reading results",
            "grain": "country × crop code × harvest year", "records": panel,
            "contrasts": contrasts, "warnings": warnings,
            "missing_original_total_wheat_cells": missing_main,
            "limitations": ["NO wheat uses C1110 consistently for all six years; other countries C1100. No stitched series or pooled Nordic wheat total.",
                            "Descriptive historical contrasts, not climate attribution or future joint-event probability.",
                            "Derived yield is production/area; original reported yields retained and discrepancies flagged.",
                            "Food grade, own need, exportability and deliverable quantities are unknown.",
                            "Eurostat and national statistics are related reporting streams, not independent replication."]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    data, bindings = [], []
    for name in ("panel", "norway_common_wheat"):
        source = manifest[name]
        path = args.manifest.parent / source["path"]
        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != source["sha256"]:
            raise ValueError("changed source bytes: " + name)
        data.append(json.loads(raw))
        bindings.append({"name": name, "sha256": digest, "bytes": len(raw), "url": source["url"]})
    result = analyze(*data)
    result["source_bindings"] = bindings
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / "analysis.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"records": len(result["records"]), "contrasts": len(result["contrasts"]), "warnings": result["warnings"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
