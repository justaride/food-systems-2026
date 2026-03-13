#!/bin/bash
# Compute chart-metrics.json for SE, DK, FI based on store data + chain configs
# Parent company shares only (no PIP — no municipality boundaries yet)

set -e
cd "$(dirname "$0")/.."

for code in se dk fi; do
  dir="public/data/food-systems/$code"
  if [ ! -f "$dir/stores.json" ]; then
    echo "Skipping $code — no stores.json"
    continue
  fi

  echo "Computing metrics for $code..."

  python3 << PYEOF
import json
from collections import Counter
import math

code = "$code"
dir_path = "$dir"

with open(f"{dir_path}/stores.json") as f:
    stores = json.load(f)

# Load chain parents from config — we'll hardcode from the TS files
CHAIN_PARENTS = {
    'se': {
        'ica-n-ra': 'ICA Gruppen', 'ica-supermarket': 'ICA Gruppen', 'ica-kvantum': 'ICA Gruppen',
        'maxi-ica-stormarknad': 'ICA Gruppen', 'ica': 'ICA Gruppen', 'ica-maxi': 'ICA Gruppen',
        'coop': 'Coop Sverige', 'coop-sweden': 'Coop Sverige', 'coop-konsum': 'Coop Sverige',
        'coop-n-ra': 'Coop Sverige', 'x-tra': 'Coop Sverige',
        'willys': 'Axfood', 'hemk-p': 'Axfood', 'tempo': 'Axfood',
        'handlar-n': 'Axfood', 'handlarn': 'Axfood', 'mat-ppet': 'Axfood',
        'lidl': 'Lidl', 'city-gross': 'Bergendahls',
    },
    'dk': {
        'netto': 'Salling Group', 'f-tex': 'Salling Group', 'bilka': 'Salling Group',
        'rema-1000': 'Reitangruppen',
        '365discount': 'Coop Danmark', 'coop-365discount': 'Coop Danmark', 'coop-365-discount': 'Coop Danmark',
        'superbrugsen': 'Coop Danmark', 'dagli-brugsen': 'Coop Danmark', 'daglibrugsen': 'Coop Danmark',
        'kvickly': 'Coop Danmark', 'brugsen': 'Coop Danmark',
        'lidl': 'Lidl',
        'min-k-bmand': 'Dagrofa', 'spar': 'Dagrofa', 'meny': 'Dagrofa',
        'abc-lavpris': 'Dagrofa', 'elite-k-bmand': 'Dagrofa', 'l-vbjerg': 'Dagrofa',
        'letk-b': 'Dagrofa', 'let-k-b': 'Dagrofa',
    },
    'fi': {
        'k-market': 'Kesko', 'k-supermarket': 'Kesko', 'k-citymarket': 'Kesko',
        's-market': 'S-Group', 'sale': 'S-Group', 'alepa': 'S-Group', 'prisma': 'S-Group',
        'lidl': 'Lidl',
        'halpahalli': 'Tokmanni Group',
        'minimani': 'Minimani',
    },
}

PARENT_COLORS = {
    'se': {'ICA Gruppen': '#E3000B', 'Axfood': '#00843D', 'Coop Sverige': '#00529B', 'Lidl': '#0050AA', 'Bergendahls': '#FF6900'},
    'dk': {'Salling Group': '#E31937', 'Coop Danmark': '#00529B', 'Reitangruppen': '#003DA5', 'Dagrofa': '#2E8B57', 'Lidl': '#0050AA'},
    'fi': {'S-Group': '#00A651', 'Kesko': '#FF6600', 'Lidl': '#0050AA', 'Tokmanni Group': '#E31937', 'Minimani': '#6B7280'},
}

chain_parents = CHAIN_PARENTS[code]
parent_colors = PARENT_COLORS[code]

# Filter to known grocery chains only
grocery_stores = [s for s in stores if s['chainId'] in chain_parents]
total = len(grocery_stores)

print(f"  {len(stores)} total stores, {total} matched to grocery chains")

# Parent company shares
parent_counts = Counter()
for s in grocery_stores:
    parent = chain_parents.get(s['chainId'], 'Unknown')
    parent_counts[parent] += 1

by_parent = []
for parent, count in parent_counts.most_common():
    pct = round((count / total) * 1000) / 10
    by_parent.append({
        'id': parent,
        'label': parent,
        'value': pct,
        'count': count,
        'color': parent_colors.get(parent, '#6B7280'),
    })

hhi = sum(p['value'] ** 2 for p in by_parent)

for p in by_parent:
    print(f"    {p['label']}: {p['value']}% ({p['count']} stores)")
print(f"  HHI: {round(hhi)}")

# Simple Lorenz curve based on chain distribution (no municipality data)
# Use stores per chain, sorted by size
chain_counts = Counter(s['chainId'] for s in grocery_stores)
sorted_chains = sorted(chain_counts.values())
total_stores_count = sum(sorted_chains)
n_chains = len(sorted_chains)

lorenz_data = [{'popShare': 0, 'storeShare': 0}]
cum = 0
for i, count in enumerate(sorted_chains):
    cum += count
    pct_chains = round(((i + 1) / n_chains) * 100)
    pct_stores = round((cum / total_stores_count) * 1000) / 10
    if pct_chains % 5 == 0 or i == n_chains - 1:
        lorenz_data.append({'popShare': pct_chains, 'storeShare': pct_stores})

# Gini from chain distribution
area = 0
for i in range(1, len(sorted_chains)):
    dx = 1.0 / n_chains
    avg_y = ((sum(sorted_chains[:i]) + sum(sorted_chains[:i+1])) / 2) / total_stores_count
    area += dx * avg_y
gini = round((1 - 2 * area) * 1000) / 1000

# Zipf (simplified — by chain, not by municipality)
zipf_data = []
for rank, (chain_id, count) in enumerate(sorted(chain_counts.items(), key=lambda x: -x[1])):
    if count < 2:
        continue
    zipf_data.append({
        'rank': rank + 1,
        'storeCount': count,
        'logRank': round(math.log10(rank + 1) * 1000) / 1000,
        'logCount': round(math.log10(count) * 1000) / 1000,
        'name': chain_id,
    })

# Linear regression for Zipf
if len(zipf_data) >= 2:
    x = [d['logRank'] for d in zipf_data]
    y = [d['logCount'] for d in zipf_data]
    n = len(x)
    sx = sum(x); sy = sum(y)
    sxy = sum(xi*yi for xi, yi in zip(x, y))
    sxx = sum(xi*xi for xi in x)
    slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
    intercept = (sy - slope * sx) / n
    mean_y = sy / n
    ss_tot = sum((yi - mean_y)**2 for yi in y)
    ss_res = sum((yi - (slope * xi + intercept))**2 for xi, yi in zip(x, y))
    r_squared = 1 - ss_res / ss_tot if ss_tot > 0 else 0
    is_zipf = r_squared > 0.7 and -1.5 < slope < -0.5
else:
    slope = intercept = r_squared = 0
    is_zipf = False

output = {
    'generated': '2026-03-13',
    'country': code,
    'totalStores': total,
    'parentCompany': {
        'data': by_parent,
        'parentHHI': round(hhi),
    },
    'lorenzCurve': {
        'data': lorenz_data,
        'gini': gini,
    },
    'zipf': {
        'data': zipf_data,
        'slope': round(slope * 1000) / 1000,
        'intercept': round(intercept * 1000) / 1000,
        'rSquared': round(r_squared * 1000) / 1000,
        'isZipf': is_zipf,
    },
}

with open(f"{dir_path}/chart-metrics.json", 'w') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"  Wrote {dir_path}/chart-metrics.json")
PYEOF

  echo ""
done

echo "Done computing Nordic metrics."
