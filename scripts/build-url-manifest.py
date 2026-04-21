#!/usr/bin/env python3
"""Build consolidated URL manifest across backlog CSVs + TypeScript data files.

Outputs: research/_status/URL-MANIFEST.csv
"""
import csv
import re
import sys
from urllib.parse import urlparse
from collections import defaultdict


def norm_url(u: str) -> str:
    """Normalize URL for deduplication: lowercase host, strip trailing slash, drop fragment."""
    if not u:
        return ''
    u = u.strip()
    if not u:
        return ''
    try:
        p = urlparse(u)
        scheme = p.scheme.lower() or 'https'
        netloc = p.netloc.lower()
        path = (p.path or '/').rstrip('/') or '/'
        query = p.query  # keep query — different queries = different resources
        return f'{scheme}://{netloc}{path}' + (f'?{query}' if query else '')
    except Exception:
        return u.lower().rstrip('/')


# Aggregated record per normalized URL
records = defaultdict(lambda: {
    'url': '',
    'titles': set(),
    'authors': set(),
    'years': set(),
    'countries': set(),
    'doc_types': set(),
    'themes': set(),
    'priorities': set(),
    'download_status': '',  # backlog authoritative
    'local_path': '',
    'next_action': '',
    'origin_files': set(),
    'origin_entity_ids': set(),
})


def add(url, *, title='', author='', year='', country='', doc_type='', theme='',
        priority='', download_status='', local_path='', next_action='',
        origin_file='', origin_id=''):
    nu = norm_url(url)
    if not nu:
        return
    r = records[nu]
    if not r['url']:
        r['url'] = url.strip()
    if title: r['titles'].add(title)
    if author: r['authors'].add(author)
    if year: r['years'].add(str(year))
    if country: r['countries'].add(country.upper())
    if doc_type: r['doc_types'].add(doc_type)
    if theme: r['themes'].add(theme)
    if priority: r['priorities'].add(priority)
    if download_status and not r['download_status']:
        r['download_status'] = download_status
    elif download_status == 'downloaded':
        r['download_status'] = 'downloaded'  # downloaded wins
    if local_path and not r['local_path']:
        r['local_path'] = local_path
    if next_action and not r['next_action']:
        r['next_action'] = next_action
    if origin_file: r['origin_files'].add(origin_file)
    if origin_id: r['origin_entity_ids'].add(origin_id)


# ───────────── 1. Backlog CSVs (authoritative) ─────────────

import glob as _glob

BACKLOG_FILES = sorted(_glob.glob('research/evidence-pack/download-backlog*.csv'))

for fp in BACKLOG_FILES:
    try:
        with open(fp) as f:
            for row in csv.DictReader(f):
                pri = (row.get('priority') or '').strip()
                if not pri or pri.startswith('#'):
                    continue
                url = (row.get('url') or '').strip()
                if not url:
                    continue
                add(
                    url,
                    title=row.get('title', ''),
                    author=row.get('institution', ''),
                    year=row.get('year', ''),
                    country=row.get('country', ''),
                    doc_type=row.get('doc_type', ''),
                    theme=row.get('theme', ''),
                    priority=pri,
                    download_status=row.get('status', ''),
                    local_path=row.get('target_path', ''),
                    next_action=row.get('next_action', ''),
                    origin_file=fp,
                )
    except FileNotFoundError:
        print(f'  (skipped, not found: {fp})', file=sys.stderr)


# ───────────── 2. TypeScript data files ─────────────

# Generic entry extractor: parse blocks like `{ id: '...', ... }`
def extract_ts_entries(path: str):
    with open(path) as f:
        c = f.read()
    # Match top-level entry blocks (4-space indent, starting with `{`)
    # Greedy-safe: find blocks that contain id: '...'
    entries = re.findall(r"\{\s*id: '([^']+)',([\s\S]*?)\n  \}", c)
    return entries


# sources.ts
for eid, body in extract_ts_entries('src/lib/data/sources.ts'):
    url_m = re.search(r"\burl: '([^']+)'", body)
    title_m = re.search(r"\btitle: '([^']+)'", body)
    author_m = re.search(r"\bauthor: '([^']+)'", body)
    year_m = re.search(r"\byear: '?([0-9]{4})'?", body)
    type_m = re.search(r"\btype: '([^']+)'", body)
    if url_m:
        add(
            url_m.group(1),
            title=title_m.group(1) if title_m else '',
            author=author_m.group(1) if author_m else '',
            year=year_m.group(1) if year_m else '',
            doc_type=type_m.group(1) if type_m else '',
            origin_file='src/lib/data/sources.ts',
            origin_id=eid,
        )

# reports.ts
for eid, body in extract_ts_entries('src/lib/data/reports.ts'):
    url_m = re.search(r"\bsourceUrl: '([^']+)'", body)
    title_m = re.search(r"\btitle: '([^']+)'", body)
    inst_m = re.search(r"\binstitution: '([^']+)'", body)
    country_m = re.search(r"\bcountry: '([^']+)'", body)
    year_m = re.search(r"\byear: ([0-9]{4})", body)
    cat_m = re.search(r"\breportCategory: '([^']+)'", body)
    if url_m:
        add(
            url_m.group(1),
            title=title_m.group(1) if title_m else '',
            author=inst_m.group(1) if inst_m else '',
            year=year_m.group(1) if year_m else '',
            country=country_m.group(1) if country_m else '',
            doc_type=cat_m.group(1) if cat_m else 'report',
            origin_file='src/lib/data/reports.ts',
            origin_id=eid,
        )

# theses.ts
for eid, body in extract_ts_entries('src/lib/data/theses.ts'):
    url_m = re.search(r"\burl: '([^']+)'", body)
    title_m = re.search(r"\btitle: '([^']+)'", body)
    authors_m = re.search(r"\bauthors: '([^']+)'", body)
    inst_m = re.search(r"\binstitution: '([^']+)'", body)
    year_m = re.search(r"\byear: ([0-9]{4})", body)
    if url_m:
        add(
            url_m.group(1),
            title=title_m.group(1) if title_m else '',
            author=(authors_m.group(1) if authors_m else '') + (f' / {inst_m.group(1)}' if inst_m else ''),
            year=year_m.group(1) if year_m else '',
            doc_type='thesis',
            origin_file='src/lib/data/theses.ts',
            origin_id=eid,
        )

# actors.ts (Actor.website)
for eid, body in extract_ts_entries('src/lib/data/actors.ts'):
    url_m = re.search(r"\bwebsite: '([^']+)'", body)
    name_m = re.search(r"\bname: '([^']+)'", body)
    country_m = re.search(r"\bcountry: '([^']+)'", body)
    atype_m = re.search(r"\bactorType: '([^']+)'", body)
    if url_m:
        add(
            url_m.group(1),
            title=name_m.group(1) if name_m else '',
            country=country_m.group(1) if country_m else 'NO',
            doc_type=atype_m.group(1) if atype_m else 'actor-website',
            origin_file='src/lib/data/actors.ts',
            origin_id=eid,
        )

# insights.ts (nested Insight.sources[].url)
with open('src/lib/data/insights.ts') as f:
    ic = f.read()
# Parse each insight block
insight_blocks = re.findall(r"\{\s*id: '(ins-\d+)',([\s\S]*?)\n  \},", ic)
for iid, body in insight_blocks:
    # For each source ref within, extract url + label
    for s_block in re.findall(r"\{[^}]*url: '[^']+'[^}]*\}", body):
        url_m = re.search(r"\burl: '([^']+)'", s_block)
        label_m = re.search(r"\blabel: '([^']+)'", s_block)
        if url_m:
            add(
                url_m.group(1),
                title=label_m.group(1) if label_m else '',
                doc_type='insight-source',
                origin_file='src/lib/data/insights.ts',
                origin_id=iid,
            )


# ───────────── Write consolidated manifest ─────────────

OUTPUT = 'research/_status/URL-MANIFEST.csv'

with open(OUTPUT, 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow([
        'url',
        'title',
        'author_institution',
        'year',
        'country',
        'doc_type',
        'theme',
        'priority',
        'download_status',
        'local_path',
        'next_action',
        'origin_files',
        'origin_entity_ids',
        'sources_count',
    ])
    # Sort: downloaded first, then url_only, then missing, then untracked (no status)
    status_order = {'downloaded': 0, 'url_only': 1, 'missing_metadata_only': 2, '': 3}
    sorted_urls = sorted(
        records.items(),
        key=lambda kv: (
            status_order.get(kv[1]['download_status'], 4),
            kv[1]['url'],
        ),
    )
    for nu, r in sorted_urls:
        origin_files = sorted(r['origin_files'])
        origin_ids = sorted(r['origin_entity_ids'])
        w.writerow([
            r['url'],
            '; '.join(sorted(r['titles']))[:300],
            '; '.join(sorted(r['authors']))[:200],
            '; '.join(sorted(r['years'])),
            '; '.join(sorted(r['countries'])),
            '; '.join(sorted(r['doc_types']))[:120],
            '; '.join(sorted(r['themes'])),
            '; '.join(sorted(r['priorities'])),
            r['download_status'] or 'untracked',
            r['local_path'],
            r['next_action'],
            '; '.join(origin_files),
            '; '.join(origin_ids),
            len(origin_files) + len(origin_ids),
        ])

# ───────────── Print summary ─────────────

from collections import Counter
status_counts = Counter(r['download_status'] or 'untracked' for r in records.values())
country_counts = Counter()
for r in records.values():
    for c in r['countries']:
        country_counts[c] += 1

total = len(records)
multi_source = sum(1 for r in records.values()
                  if (len(r['origin_files']) + len(r['origin_entity_ids'])) > 1)

print(f'\n✓ Wrote {total} unique URLs to {OUTPUT}')
print(f'\nStatus-distribusjon:')
for s, n in status_counts.most_common():
    print(f'  {s:25} {n}')
print(f'\nTop 10 land:')
for c, n in country_counts.most_common(10):
    print(f'  {c:8} {n}')
print(f'\nURL-er som vises i ≥2 kilder (merge-hits): {multi_source}')
