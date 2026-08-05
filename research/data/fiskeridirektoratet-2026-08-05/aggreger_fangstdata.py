#!/usr/bin/env python3
"""Aggregerer Fiskeridirektoratets fangstdata (seddel koblet med fartøydata) per fartøy.

Leser CSV (semikolondelt, UTF-8) fra stdin, dedupliserer dokumentversjoner
(beholder siste versjon per Dokumentnummer+Linjenummer), og skriver ett
aggregat per fartøy som CSV til stdout.

Bruk:
  unzip -p fangstdata_2026.csv.zip | python3 aggreger_fangstdata.py > fangst_aktivitet_2026_per_fartoy.csv
  curl -s https://register.fiskeridir.no/uttrekk/fangstdata_2025.csv.zip | funzip | python3 aggreger_fangstdata.py > fangst_aktivitet_2025_per_fartoy.csv
"""
import csv
import sys
from collections import defaultdict

csv.field_size_limit(10_000_000)

reader = csv.DictReader(sys.stdin, delimiter=";", quotechar='"')

# Pass 1-datastruktur: (dok, linje) -> siste versjon av relevante felt
siste_linje = {}
dok_info = {}  # dok -> (versjonstidspunkt, fartoy_id, landingsdato)

def parse_dato(s):
    # dd.mm.yyyy -> yyyy-mm-dd for sortering
    try:
        d, m, y = s.split(".")
        return f"{y}-{m}-{d}"
    except Exception:
        return ""

def parse_tall(s):
    try:
        return float(s.replace(",", "."))
    except Exception:
        return 0.0

n_rader = 0
for row in reader:
    n_rader += 1
    dok = row["Dokumentnummer"]
    linje = row["Linjenummer"]
    versjon = row["Dokument versjonstidspunkt"]
    nokkel = (dok, linje)
    if nokkel in siste_linje and siste_linje[nokkel][0] >= versjon:
        continue
    siste_linje[nokkel] = (
        versjon,
        row["Fartøy ID"],
        parse_dato(row["Landingsdato"]),
        row["Art - FDIR"],
        parse_tall(row["Rundvekt"]),
        parse_tall(row["Fangstverdi"]),
    )
    dok_info[dok] = row["Fartøy ID"]

# Aggregat per fartøy
agg = defaultdict(lambda: {
    "sedler": set(),
    "linjer": 0,
    "rundvekt_kg": 0.0,
    "fangstverdi_kr": 0.0,
    "siste_landingsdato": "",
    "arter": defaultdict(float),
})

for (dok, _linje), (_v, fartoy, dato, art, rundvekt, verdi) in siste_linje.items():
    a = agg[fartoy]
    a["sedler"].add(dok)
    a["linjer"] += 1
    a["rundvekt_kg"] += rundvekt
    a["fangstverdi_kr"] += verdi
    if dato > a["siste_landingsdato"]:
        a["siste_landingsdato"] = dato
    if art:
        a["arter"][art] += rundvekt

w = csv.writer(sys.stdout, delimiter=";")
w.writerow([
    "fartoy_id", "antall_sedler", "antall_linjer", "rundvekt_kg",
    "fangstverdi_kr", "siste_landingsdato", "topp3_arter_rundvekt",
])
for fartoy, a in sorted(agg.items()):
    topp = sorted(a["arter"].items(), key=lambda x: -x[1])[:3]
    w.writerow([
        fartoy, len(a["sedler"]), a["linjer"],
        round(a["rundvekt_kg"], 1), round(a["fangstverdi_kr"], 0),
        a["siste_landingsdato"],
        " | ".join(f"{art} ({kg:,.0f} kg)".replace(",", " ") for art, kg in topp),
    ])

print(f"# {n_rader} rader lest, {len(siste_linje)} unike linjer etter versjonsdedup, "
      f"{len(agg)} fartøy", file=sys.stderr)
