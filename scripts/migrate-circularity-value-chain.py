#!/usr/bin/env python3
"""Migrate value_chain_step mapping from SirkularitetContent.tsx into
circularity-loops.json so data drives the matrix view.

Also consolidates invested/invested_eur_m/investment_eur_m into a single
canonical field (invested_eur_m: number) and promotes any string free-text
investment notes into a new investment_note field.

Run once; output diff verified manually before commit.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

PATH = Path("public/data/food-systems/circularity-loops.json")

GAP_VALUE_CHAIN_STEPS: dict[str, list[str]] = {
    "gap-fiskeavfall-havet": ["seafood", "waste"],
    "gap-matsentralen-kapasitet": ["retail", "horeca", "household"],
    "gap-biogass-norge": ["waste", "primary"],
    "gap-insektprotein": ["waste", "processing"],
    "gap-alger-tang": ["primary", "processing"],
    "gap-oppdrettsslam": ["seafood", "waste"],
    "gap-husholdningssvinn": ["household"],
    "gap-horeca-reuse": ["horeca"],
    "gap-regenerativ-omstilling": ["primary"],
    "gap-akademia-industri": [],
    "gap-havremelk-okara": ["processing", "waste"],
    "gap-svartvann-naeringsgjenvinning": ["household", "waste", "primary"],
}

ACTOR_CASE_VALUE_CHAIN_STEPS: dict[str, list[str]] = {
    "Too Good To Go": ["retail", "horeca"],
    "Solar Foods (Solein)": ["processing"],
    "Den Magiske Fabrikken": ["waste", "primary"],
    "REKO-ringer": ["primary", "retail"],
    "Gasum": ["waste", "distribution"],
    "Restaurant Rest": ["horeca"],
    "Enorm Biofactory": ["waste", "processing"],
    "Volare": ["waste", "processing"],
    "Finnforel": ["seafood"],
    "Melta": ["waste", "primary"],
    "AX Foundation — Framtidens Fisk": ["processing", "seafood"],
    "Helsingborg svartvann (Oceanhamnen)": ["household", "waste", "primary"],
    "Potetlefser med skall (Sorlandet)": ["processing"],
    "Ynsect": ["waste", "processing"],
    "Havremelk-okara (ikke kommersialisert)": ["processing", "waste"],
}


def parse_invested_string(value: str) -> tuple[float | None, str | None]:
    """Try to extract EUR-millions from a free-text investment note.

    Returns (number_in_eur_m, note) where number is None if unparseable.
    """
    if not value:
        return None, None
    v = value.strip()
    # "26M EUR", "500 kEUR", "USD 100m", "1.5bn NOK"
    match = re.search(r"(\d+(?:[.,]\d+)?)\s*(m|million|mill|M|MM|bn|b)?\s*(eur|EUR|€|nok|NOK|usd|USD|sek|SEK|dkk|DKK)?", v)
    if not match:
        return None, v
    raw = match.group(1).replace(",", ".")
    try:
        number = float(raw)
    except ValueError:
        return None, v
    unit = (match.group(2) or "").lower()
    currency = (match.group(3) or "").lower() or "eur"
    if unit in ("bn", "b"):
        number *= 1000.0
    if currency != "eur":
        return None, v
    return number, v


def apply_value_chain(items: list[dict[str, Any]], mapping: dict[str, list[str]], key: str) -> int:
    changed = 0
    for item in items:
        lookup = item.get(key)
        if lookup not in mapping:
            continue
        steps = mapping[lookup]
        if steps and item.get("value_chain_step") != steps:
            item["value_chain_step"] = steps
            changed += 1
        elif not steps and "value_chain_step" not in item:
            item["value_chain_step"] = []
            changed += 1
    return changed


def consolidate_invested(items: list[dict[str, Any]]) -> int:
    changed = 0
    for item in items:
        invested_str = item.pop("invested", None)
        if "investment_eur_m" in item and "invested_eur_m" not in item:
            item["invested_eur_m"] = item.pop("investment_eur_m")
            changed += 1
        elif "investment_eur_m" in item:
            item.pop("investment_eur_m")
            changed += 1
        if invested_str:
            number, note = parse_invested_string(invested_str)
            if number is not None and "invested_eur_m" not in item:
                item["invested_eur_m"] = number
                changed += 1
            if note and item.get("investment_note") != note:
                item["investment_note"] = note
                changed += 1
    return changed


def main() -> int:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    data["generated"] = "2026-04-21"

    gaps_changed = apply_value_chain(data.get("gaps", []), GAP_VALUE_CHAIN_STEPS, "id")

    actor_items = []
    actor_items.extend(data.get("actor_cases", {}).get("success", []))
    actor_items.extend(data.get("actor_cases", {}).get("failure", []))
    actor_items.extend(data.get("additional_success", []))
    actor_items.extend(data.get("additional_failure", []))
    actors_changed = apply_value_chain(actor_items, ACTOR_CASE_VALUE_CHAIN_STEPS, "name")
    invested_changed = consolidate_invested(actor_items)

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"gaps updated: {gaps_changed}\n"
        f"actor value_chain updated: {actors_changed}\n"
        f"actor invested consolidated: {invested_changed}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
