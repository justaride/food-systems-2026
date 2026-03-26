# Graph and Research

## Knowledge Graph

`src/lib/queries/graph.ts` is the core graph query layer.

- `GraphNode` types include `document`, `insight`, `thesis`, `company`, `source`, `actor`, `person`, and `property`
- `GraphEdge` types include document refs, insight refs, company refs, actor refs, company links, thesis-doc links, ownership links, business relationship links, person roles, and property ownership or lease links
- `getFullGraph()` returns the full node and edge set
- `getDocumentGraph(id)` returns a document-centered subgraph
- `src/components/charts/KnowledgeGraph.tsx` is the main graph visualization entry point

## Research Pipeline

- `DEEP-RESEARCH-PLAN.md` contains the full 10-session plan
- Current project note marks Sessions 1-10 as complete
- When extending the corpus, write findings into typed import arrays and populate the database through the import scripts rather than ad hoc database edits
- If the user explicitly asks for parallel or delegated work, the research plan can be split into independent tracks; otherwise keep the work local

## Preferred External Sources

- `offentligdata` for Norwegian company and person registry work
- PubMed for academic source search
- Notion, Figma, and Google Drive when those connectors are available and relevant to the task
