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

## Execution Model

- If the user explicitly asks for parallel or delegated work, the research plan can be split into independent tracks; otherwise keep the work local
