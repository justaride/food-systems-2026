#!/usr/bin/env python3
"""Round005: source-bound diagnostics and design arithmetic, never delivery proof.

Reads frozen local bytes only. Requires a new output directory. Neither the
scenario nor the calculation registers review, promotes data or writes to a DB.
"""
import argparse
import csv
import hashlib
import importlib.util
import json
import math
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "cereals", Path(__file__).with_name("analyze-beredskap-cereals.py"))
cereals = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cereals)


def checked_inputs(manifest):
    result = {}
    for key, entry in manifest["inputs"].items():
        raw = Path(entry["path"]).read_bytes()
        if hashlib.sha256(raw).hexdigest() != entry["sha256"]:
            raise ValueError("changed source bytes: " + key)
        result[key] = raw
    return result


def grain_requirement(flour_t, extraction):
    for value in (flour_t, extraction):
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
            raise ValueError("finite numeric input required")
    if flour_t < 0 or not 0 < extraction <= 1:
        raise ValueError("invalid mass or extraction")
    return flour_t / extraction


def cell(data, **coordinates):
    rows = [r for r in cereals.decode(data)
            if all(r.get(k) == v for k, v in coordinates.items())]
    if len(rows) != 1 or rows[0]["value"] is None or rows[0]["status"]:
        raise ValueError("missing, flagged or ambiguous source cell")
    return {"value": rows[0]["value"], "jsonPointer": "/value/" + str(rows[0]["cellIndex"]),
            "coordinates": coordinates}


def analyze(raw):
    j = {k: json.loads(v) for k, v in raw.items() if k != "dk_csv"}
    panel = cereals.analyze(j["eu_panel"], j["eu_no"])
    if any(locator["status"] for record in panel["records"] for locator in record["locators"].values()):
        raise ValueError("flagged Eurostat cell requires new source review")
    diagnostics = []
    dk = list(csv.DictReader(raw["dk_csv"].decode("utf-8-sig").splitlines(), delimiter=";"))
    for record in panel["records"]:
        if record["reported_yield_rounding_consistent"] is not False:
            continue
        r = {k: record[k] for k in ("country", "crop_code", "year", "sourceId", "locators",
             "area_kha", "production_kt", "reported_yield_t_ha", "derived_yield_t_ha")}
        r["residual_kg_ha"] = 1000 * (r["reported_yield_t_ha"] - r["derived_yield_t_ha"])
        r["status"] = "unresolved; original warning retained"
        country, year, crop = record["country"], str(record["year"]), record["crop"]
        if country == "NO":
            y = cell(j["no_yield"], Region="0", ContentsCode="Hvete" if crop == "wheat" else "Bygg", Tid=year)
            a = cell(j["no_area"], Region="0", ContentsCode="Hvete" if crop == "wheat" else "Bygg", Tid=year)
            p = cell(j["no_production"], Region="0", ContentsCode="Kveite" if crop == "wheat" else "Bygg", Tid=year)
            r["national"] = {"yield_kg_daa": y, "area_daa": a, "production_kt": p,
                "yield_sourceId": "R5-S18", "area_sourceId": "R4-NO-S002", "production_sourceId": "R4-NO-S001",
                "conditional_yield_t_ha_at14": y["value"] * .01 * 85 / 86,
                "conditional_PA_t_ha_at14": p["value"] * 10000 / a["value"] * 85 / 86,
                "limit": "15-to-14 dry-matter conversion; NO national wheat is not silently equated to C1110"}
        elif country == "FI":
            code = "VEHN" if crop == "wheat" else "OHRA"
            r["national"] = {name: cell(j["fi"], A=year, MK="SSS", INFO=code_info,
                TUOTT="TUOTT_YHT", LJ=code) for name, code_info in
                [("yield_kg_ha", "HASATO"), ("area_kha", "KORJHAT"), ("production_kt", "SATOKGM")]}
            r["national"].update(sourceId="DKFI-S004", moisture_pct=None,
                limit="Dried yield; moisture and item bridge not established")
        elif country == "SE":
            r["national"] = {"sourceId": "METH-S09", "components": [
                {name: cell(j["se"], Region="00", Groda=c, ContentsCode=measure, Tid=year)
                 for name, measure in [("yield_kg_ha", "000004K0"), ("production_t", "000005G3")]}
                for c in ("10", "20")],
                "limit": "No unrounded component-area weights in this slice; cannot reconstruct aggregate reported yield"}
        elif country == "DK":
            selected = [{"csvLine": i+2, **x} for i, x in enumerate(dk)
                        if x["TID"] == year and x["AFGRØDE"] in ("Winter barley", "Spring barley")]
            area = sum(float(x["INDHOLD"]) for x in selected if x["MÆNGDE4"] == "Area (1000 hectare)")
            production = sum(float(x["INDHOLD"]) for x in selected if x["MÆNGDE4"] == "Production (million kg)")
            r["national"] = {"sourceId": "DKFI-S002", "cells": selected, "area_kha": area,
                "production_kt_at15": production, "conditional_PA_t_ha_at14": production / area * 85 / 86,
                "area_eurostat_minus_national_kha": record["area_kha"] - area,
                "limit": "2015 national sum area differs from Eurostat; matched 2018 area cannot be carried backwards"}
        diagnostics.append(r)
    fi = []
    for crop, code in [("wheat", "VEHN"), ("barley", "OHRA")]:
        n = cell(j["fi"], A="2018", MK="SSS", INFO="SATOKGM", TUOTT="TUOTT_YHT", LJ=code)
        e = next(r for r in panel["records"] if r["country"] == "FI" and r["crop"] == crop and r["year"] == 2018)
        p, national = e["production_kt"], n["value"]
        fi.append({"crop": crop, "national": n, "national_sourceId": "DKFI-S004",
            "eurostat_kt": p, "eurostat_locator": e["locators"]["production_kt"], "eurostat_sourceId": e["sourceId"],
            "residual_kt": p-national, "ratio": p/national,
            "ratio_interval_assuming_display_rounding": [(p-.05)/(national+.05), (p+.05)/(national-.05)],
            "implied_national_moisture_if_only_moisture_pct": 100-86*p/national,
            "observed_national_moisture_pct": None,
            "limit": "Inverse diagnostic only, not a measured moisture value or attribution"})
    intervals = [r["ratio_interval_assuming_display_rounding"] for r in fi]
    overlap = max(r[0] for r in intervals) <= min(r[1] for r in intervals)
    target = j["case"]
    # There are no observed delivery/need quantities in this evidence package.
    # Never replace these absent observations by synthetic sensitivity targets.
    for route in target["alternatives"]:
        if any(v is not None for v in route["observedQuantities"].values()):
            raise ValueError("new operational evidence requires a new analysis protocol")
    return {"asOf": "2026-09-09", "authority": "internal_analysis_only", "human_verified": False,
        "caseId": target["caseId"], "deliveryTestPerformed": False,
        "delivery": {"national_t": None, "nordic_t": None, "netNeed_t": None,
            "nordicAdditional_t": None, "reason": "No recipient-bound stock, quality, allocation, throughput or delivery observations"},
        "designArithmetic": [{"illustrative_flour_target_t": f, "assumed_extraction_fraction": y,
            "grain_required_t": grain_requirement(f, y), "observedRecipientDemand": False,
            "basis": "0.78 is a February2021 Regal catalogue reference; 0.70/0.85 are analyst sensitivities; none is a measured crisis yield"}
            for f in (10,20,40) for y in (.70,.78,.85)],
        "yieldDiagnostics": diagnostics, "finland2018": fi,
        "commonMoistureOnlyFactorCompatibleWithBoth": overlap,
        "commonFactorTestLimits": "Rejects one common multiplicative moisture-only factor with conservative +/-0.05kt bounds on both national and Eurostat values. Does not reject crop-specific moisture, mixed coverage or version effects.",
        "missingDanishWheatYield2015": None,
        "inputHashes": {k: hashlib.sha256(v).hexdigest() for k,v in raw.items()}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        raise FileExistsError("output must be new")
    result = analyze(checked_inputs(json.loads(args.manifest.read_text())))
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / "calculations.json").write_text(json.dumps(result, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps({"yieldWarnings": len(result["yieldDiagnostics"]), "deliveryTestPerformed": False,
        "delivery_t": None, "commonMoistureOnlyFactorCompatible": result["commonMoistureOnlyFactorCompatibleWithBoth"]}))


if __name__ == "__main__":
    main()
