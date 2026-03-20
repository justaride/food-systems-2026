# Food Systems 2026 - Skills Plan

## Formål

Dette notatet oversetter tilgjengelige agent-skills til en praktisk arbeidsplan for utviklingen av Food Systems 2026. Målet er ikke å samle flest mulig skills, men å bruke et lite sett som matcher prosjektets faktiske flater:

- `Next.js App Router` i `src/app/`
- `Prisma + PostgreSQL + pgvector` i `prisma/schema.prisma` og `src/lib/queries/semantic-search.ts`
- geodata og kart i `src/components/map/` og `src/lib/map/`
- forskningskorpus i `research/` og dokumentmodeller i databasen
- API-ruter og query-lag i `src/app/api/` og `src/lib/queries/`
- forelopig ingen synlig testpakke eller `test`-script i `package.json`

## Prosjektsignal

Dette prosjektet er i praksis tre ting samtidig:

1. En kunnskapsbase for dokumenter, aktorer, selskaper og innsikt
2. En analyseapp med sokesystem, grafer og dashboards
3. En geospatial prototype med kartlag, flyt og sårbarhetsanalyse

Skill-valget bør derfor dekke app-utvikling, retrieval/kunnskapsforvaltning, geodata og test.

## Kjerne-skills

| Skill | Prioritet | Hvorfor den passer | Nar den bør brukes |
|---|---|---|---|
| `nextjs-developer` | Høy | Prosjektet kjører på Next.js App Router med server components og route handlers | Nye sider, layout-endringer, API-ruter, dataflyt i appen |
| `hybrid-search-implementation` | Høy | Soket støtter allerede `keyword`, `semantic` og `hybrid`; skillen matcher dette direkte | Bedre ranking, fallback-logikk, metadatafiltrering, søkekvalitet |
| `rag-architect` | Høy | Dokumentkorpuset og embedding-feltet peker mot retrieval-arbeid | Chunking, embeddings, retrieval-arkitektur, query pipelines |
| `Knowledge Base Manager` | Høy | Prosjektet er også en strukturert kunnskapsbase, ikke bare en app | Når nye kilder, aktører, relasjoner og dokumenttyper skal inn |
| `geospatial-data-pipeline` | Høy | Kartdelen bruker Leaflet/Turf og kan vokse i volum og kompleksitet | GeoJSON-rensing, koordinater, nye kartlag, tyngre romlige analyser |
| `backend-testing` | Høy | API-ruter, Prisma-queries og importskript bør verifiseres systematisk | Når søk, imports, relasjoner og datakritisk logikk endres |
| `playwright` | Medium | Kart, filterflyt og søkegrensesnitt egner seg godt for browser-automatisering | UI-regresjon, map interactions, filter- og søkescenarier |
| `frontend-design` | Medium | Dashboards, cards og datavisning kan løftes uten å bli generiske | Når oversiktssider, kart-UI og innsiktsflater skal strammes opp |

## Sekundære skills

| Skill | Hvorfor den kan være nyttig | Bruk bare når |
|---|---|---|
| `codebase-documenter` | God for oversikter, onboarding-notater og systemdokumentasjon | Nye teammedlemmer, større refactors, dokumentasjonsgjeld |
| `knowledge-capture` | Nyttig for å fange opp domene-regler og gjenbrukbare funn underveis | Vi oppdager mønstre som bør dokumenteres fortløpende |
| `d3-viz` | Relevant hvis prosjektet trenger mer egne visualiseringer enn Nivo/Recharts dekker | Kunnskapsgraf, systems visuals, avanserte forklarende figurer |
| `data-journalism` | Passer hvis produktet blir mer analyse- og publiseringsdrevet | Datadrevne fortellinger, forklarende analysetekst, metodeforklaring |
| `whitepapers` | Relevans hvis appen og whitepaper-arbeidet knyttes tettere sammen | Når research må destilleres til rapport- eller policyformat |
| `web-quality-audit` | Nyttig som kontroll på ytelse, tilgjengelighet og SEO | Etter at UI og informasjonsstruktur er mer stabil |

## Foreslått standard-stack for arbeidet

Bruk dette som default med mindre en oppgave tydelig tilsier noe annet:

1. `analyzing-projects` for å lese kodebasen før større inngrep
2. `nextjs-developer` for app- og API-arbeid
3. `hybrid-search-implementation` eller `rag-architect` for sok, retrieval og corpus-logikk
4. `geospatial-data-pipeline` for kart, GeoJSON og romlige analyser
5. `backend-testing` og `playwright` for verifikasjon
6. `knowledge-capture` eller `codebase-documenter` når et mønster bør bli dokumentasjon

## Konkret bruksplan per arbeidsstrom

### 1. App og UI

- Bruk `nextjs-developer` som default for arbeid i `src/app/`, `src/components/` og route handlers
- Suppler med `frontend-design` ved redesign av dashboard, navigasjon, filtermønstre og kartpaneler

### 2. Søk og retrieval

- Bruk `hybrid-search-implementation` når fokus er søkekvalitet og kombinasjon av keyword + semantic
- Bruk `rag-architect` når fokus er struktur: chunking, embeddings, retrieval pipeline, citations, ranking
- Bruk `Knowledge Base Manager` når endringen handler om hvordan dokumenter, kilder, aktører og relasjoner organiseres

### 3. Kart og geodata

- Bruk `geospatial-data-pipeline` for nye datalag, optimalisering av geodata og romlige beregninger
- Bruk `frontend-design` i tillegg dersom oppgaven handler om presentasjon, ikke bare data

### 4. Kvalitet og test

- Bruk `backend-testing` for query-lag, API-ruter og importskript
- Bruk `playwright` for brukerreiser som søk, filtrering, navigasjon og kartinteraksjon
- Dette bør prioriteres tidlig siden prosjektet per nå ikke viser en tydelig testpakke

## Eksterne skills verdt å installere senere

Disse ble funnet via `npx skills find` og er mest relevante hvis dagens lokale skills ikke dekker behovet godt nok.

| Område | Skill | Kommentar | Install |
|---|---|---|---|
| Next.js | `wshobson/agents@nextjs-app-router-patterns` | God kandidat for mer App Router-spesifikke mønstre | `npx skills add wshobson/agents@nextjs-app-router-patterns` |
| Prisma/Postgres | `prisma/skills@prisma-postgres` | Direkte relevant for datalag og Postgres-praksis | `npx skills add prisma/skills@prisma-postgres` |
| E2E testing | `bobmatnyc/claude-mpm-skills@playwright-e2e-testing` | Relevant hvis vi vil ha mer testspesifikk Playwright-støtte | `npx skills add bobmatnyc/claude-mpm-skills@playwright-e2e-testing` |
| Mapping | `zenobi-us/dotfiles@leaflet-mapping` | Aktuell hvis kartarbeidet blir mer Leaflet-spesifikt enn dagens lokale skill dekker | `npx skills add zenobi-us/dotfiles@leaflet-mapping` |
| Document RAG | `vamseeachanta/workspace-hub@document-rag-pipeline` | Relevant hvis retrieval-laget skal bygges mer systematisk ut | `npx skills add vamseeachanta/workspace-hub@document-rag-pipeline` |

## Anbefalt prioritering akkurat na

Hvis vi skal holde oss til et lite, effektivt sett, er dette startpakken:

1. `nextjs-developer`
2. `hybrid-search-implementation`
3. `Knowledge Base Manager`
4. `geospatial-data-pipeline`
5. `backend-testing`

Dette dekker det viktigste i prosjektet uten å spre oppmerksomheten for mye.
