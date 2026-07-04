# URL-Health Dead-URL Citable Audit — 2026-07-02

Status: controlled WS5 citable-source gate

## Scope

This audit checks the WS5 definition-of-done clause: `0 dead URLs without archive locator among citable sources`.

It does not claim that all dead URL maintenance is closed. It classifies the open `dead` group in the regenerated remediation backlog and separates citable-source blockers from lower-priority URL hygiene.

Inputs:

- `research/URL-HEALTH.csv`
- `research/REMEDIATION-BACKLOG.csv`
- DB-linked `Document`, `SourceDoc`, and `Report` locator fields
- repo-local locator resolution via `candidateLocalFilePaths`

## Result

The regenerated backlog contains 41 open `url-health` rows with `problem=dead`.

All 41 are LOW severity in `research/REMEDIATION-BACKLOG.csv`.

DB/source-label audit:

| Check | Count |
| --- | ---: |
| Open dead URL rows | 41 |
| Rows with local file or archive locator | 38 |
| Rows without local file or archive locator | 3 |
| Citable/report rows without local file or archive locator | 0 |

Therefore the citable-source gate is controlled: there are currently 0 dead URLs without an archive/local locator among citable/report sources in the open backlog.

## Remaining Low-Priority Maintenance Rows

The three dead URL rows without a local/archive locator are non-citable `SourceDoc` maintenance rows with no `citationReadiness` value:

| Source | URL | Title |
| --- | --- | --- |
| `sourcedoc:src-142` | `https://en.kfst.dk/media/51101` | KFST Evaluering af foedevarehandelsloven 2024 |
| `sourcedoc:src-164` | `https://www.regjeringen.no/no/tema/klima-og-miljo/forurensning/innsiktsartikler/sirkular-okonomi/id2861732/` | Handlingsplan for en sirkulaer okonomi 2024-2025 |
| `sourcedoc:src-143` | `https://www.ruokavirasto.fi/globalassets/etmv/` | Elintarvikemarkkinavaltuutettu toimintakertomus 2024 |

These should remain in URL-maintenance/backlog until a replacement live URL, archived URL, or local source package is added.

## Evidence Commands

```bash
node --import=tsx - <<'NODE'
import { readFileSync } from 'fs'
import { parseCsvRecords } from './src/lib/csv'
const rows = parseCsvRecords(readFileSync('research/REMEDIATION-BACKLOG.csv','utf8'))
  .filter(r => r.source === 'url-health' && r.problem === 'dead')
console.log(rows.length)
console.log(rows.reduce((a,r)=>{a[r.severity]=(a[r.severity]||0)+1;return a}, {}))
console.log(rows.filter(r => r.severity === 'HIGH' || r.severity === 'MEDIUM' || Number.parseFloat(r.priority || '0') >= 3).length)
NODE
```

Observed result:

- `41`
- `{ LOW: 41 }`
- `0`

```bash
DATABASE_URL='postgresql://foodsystems:foodsystems@localhost:5432/foodsystems?schema=public' node --import=tsx <dead-url-db-locator-audit>
```

Observed result:

- `dead_rows 41`
- `with_local_or_archive_locator 38`
- `without_locator 3`
- `citable_or_report_without_locator 0`
- `citable_or_report_with_locator 8`
