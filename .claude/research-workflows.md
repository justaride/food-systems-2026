# Research Workflows

Use this guide for graph queries, corpus extension, and source-discovery tasks.

## Knowledge Graph

`src/lib/queries/graph.ts` is the core graph query layer.

- `GraphNode` types include `document`, `insight`, `thesis`, `company`, `source`, `actor`, `person`, and `property`
- `GraphEdge` types include document refs, insight refs, company refs, actor refs, company links, thesis-doc links, ownership links, business relationship links, person roles, and property ownership or lease links
- `getFullGraph()` returns the full node and edge set
- `getDocumentGraph(id)` returns a document-centered subgraph
- `src/components/charts/KnowledgeGraph.tsx` is the main graph visualization entry point

## Corpus Extension

- `DEEP-RESEARCH-PLAN.md` contains the full 10-session plan
- When extending the corpus, write findings into typed import arrays and populate the database through the import scripts rather than ad hoc database edits
- When company entities are involved, check [Company Registry](company-registry.md) before creating records
- Use [Data Imports](data-imports.md) for the import-script pattern and [Database Schema](database.md) for model details

## Source Preferences

- `offentligdata` for Norwegian company and person registry work
- PubMed for academic source search
- Notion, Figma, and Google Drive when those connectors are available and relevant to the task

## Download-Backlog System

URL nedlastingsstatus spores i filbaserte CSV-er under `research/evidence-pack/`:

| Backlog | Formål |
|---|---|
| `download-backlog-2026-03-18.csv` | Mars-runden: regulatoriske rapporter + årsrapporter |
| `download-backlog-2026-04-20.csv` | April-runden: kilder til de 8 dybderapportene (eiendom, HORECA, alt-distribusjon, fryktkultur, benchmarks) |
| `download-backlog-sirkular-konkurser-2026-04-20.csv` | Sirkulær-konkurser-sporet (Rest, Enorm, Mycorena, DUG, Infarm m.fl.) |
| `download-backlog-perplexity-kilder-2026-04-20.csv` | Perplexity-runden: primærkilder fra 15 dybderapporter (makt, CCS, fôr, biorest, HORECA, benchmarks) |

**Format** (samme kolonner på tvers): `priority,status,country,theme,doc_type,institution,title,year,url,url_type,current_local_status,target_path,next_action,source_basis`

**Status-verdier:** `downloaded` (lokal PDF finnes) / `url_only` (må lastes) / `missing_metadata_only` (kjent kilde, mangler URL).

Loader: `src/lib/queries/download-backlog.ts` — leser CSV, matcher SourceDocs via URL/filnavn/tittel, vises på `/kilder` (statusprikk per rad) og `/forskningsrunder` (full tabell).

## URL-Manifest

`research/URL-MANIFEST.csv` er autogenerert (506 unike URL-er). Dedupliserer URL-er fra alle 4 backlog-CSVer + 5 datafiler (sources.ts, reports.ts, theses.ts, actors.ts, insights.ts). Regenerer med `python3 scripts/build-url-manifest.py` når kildefiler endres.

## Execution Model

- If the user explicitly asks for parallel or delegated work, the research plan can be split into independent tracks; otherwise keep the work local
- For en ny forskningsrunde: opprett ny backlog-CSV i `research/evidence-pack/`, utvid loaderen hvis nødvendig, og legg til seksjon på `/forskningsrunder`
