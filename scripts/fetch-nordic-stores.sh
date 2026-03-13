#!/bin/bash
# Fetch grocery store data from OSM Overpass API for Nordic countries
# Usage: bash scripts/fetch-nordic-stores.sh

set -e

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API="https://overpass-api.de/api/interpreter"

fetch_country() {
  local code="$1"
  local iso="$2"
  local dir="$BASE_DIR/public/data/food-systems/$code"

  mkdir -p "$dir"

  echo "Fetching stores for $iso ($code)..."

  local query="[out:json][timeout:120];area[\"ISO3166-1\"=\"$iso\"]->.a;(node[\"shop\"=\"supermarket\"](area.a);node[\"shop\"=\"convenience\"](area.a);way[\"shop\"=\"supermarket\"](area.a);way[\"shop\"=\"convenience\"](area.a););out center body;"

  local raw_file="$dir/raw-overpass.json"

  curl -s --max-time 180 \
    --data-urlencode "data=$query" \
    "$API" > "$raw_file"

  local count=$(python3 -c "import json; d=json.load(open('$raw_file')); print(len(d.get('elements',[])))")
  echo "  Got $count elements for $code"

  python3 << PYEOF
import json, re, sys

with open("$raw_file") as f:
    data = json.load(f)

STORE_TYPE_MAP = {
    # Sweden
    'ica maxi': 'hypermarket', 'ica kvantum': 'supermarket', 'ica supermarket': 'supermarket',
    'ica nära': 'convenience', 'coop forum': 'hypermarket', 'coop extra': 'supermarket',
    'coop konsum': 'supermarket', 'coop nära': 'convenience', 'stora coop': 'hypermarket',
    'willys': 'discount', 'willys hemma': 'discount', 'hemköp': 'supermarket',
    'lidl': 'discount', 'tempo': 'convenience', 'handlar\'n': 'convenience',
    'city gross': 'hypermarket', 'matöppet': 'convenience',
    # Denmark
    'netto': 'discount', 'føtex': 'supermarket', 'bilka': 'hypermarket',
    'kvickly': 'supermarket', 'superbrugsen': 'supermarket', 'dagli\'brugsen': 'convenience',
    'irma': 'supermarket', 'fakta': 'discount', 'coop 365': 'discount',
    'rema 1000': 'discount', 'lidl': 'discount', 'aldi': 'discount',
    'meny': 'supermarket', 'spar': 'convenience', 'abc lavpris': 'discount',
    # Finland
    'prisma': 'hypermarket', 's-market': 'supermarket', 'sale': 'discount',
    'alepa': 'convenience', 'k-citymarket': 'hypermarket', 'k-supermarket': 'supermarket',
    'k-market': 'convenience', 'lidl': 'discount', 'tokmanni': 'discount',
    'm-market': 'convenience', 'minimani': 'discount', 'halpa-halli': 'discount',
    'siwa': 'discount', 'valintatalo': 'supermarket',
}

def to_chain_id(brand):
    if not brand:
        return 'unknown'
    return re.sub(r'[^a-z0-9]+', '-', brand.lower()).strip('-')

def get_store_type(brand):
    if not brand:
        return 'supermarket'
    bl = brand.lower()
    for key, stype in STORE_TYPE_MAP.items():
        if key in bl:
            return stype
    return 'supermarket'

stores = []
for el in data.get('elements', []):
    tags = el.get('tags', {})
    brand = tags.get('brand', tags.get('name', ''))
    if not brand:
        continue

    lat = el.get('lat') or el.get('center', {}).get('lat')
    lon = el.get('lon') or el.get('center', {}).get('lon')
    if not lat or not lon:
        continue

    chain_id = to_chain_id(brand)
    osm_id = el.get('id', 0)

    stores.append({
        'id': f'{chain_id}-{osm_id}',
        'osmId': osm_id,
        'name': tags.get('name', brand),
        'chain': brand,
        'chainId': chain_id,
        'storeType': get_store_type(brand),
        'location': {'lat': round(lat, 6), 'lng': round(lon, 6)},
        'address': tags.get('addr:street', ''),
        'city': tags.get('addr:city', ''),
        'postcode': tags.get('addr:postcode', ''),
        'openingHours': tags.get('opening_hours', ''),
        'wheelchair': tags.get('wheelchair', ''),
        'phone': tags.get('phone', ''),
        'website': tags.get('website', ''),
        'organic': tags.get('organic', ''),
    })

with open("$dir/stores.json", 'w') as f:
    json.dump(stores, f, indent=2, ensure_ascii=False)

print(f"  Saved {len(stores)} stores to $dir/stores.json")

# Show top chains
from collections import Counter
chains = Counter(s['chain'] for s in stores)
for chain, count in chains.most_common(15):
    print(f"    {chain}: {count}")
PYEOF

  rm -f "$raw_file"
  echo ""
}

echo "=== Fetching Nordic Store Data ==="
echo ""

fetch_country "se" "SE"
echo "Waiting 15s before next request..."
sleep 15

fetch_country "dk" "DK"
echo "Waiting 15s before next request..."
sleep 15

fetch_country "fi" "FI"

echo "=== Done ==="
