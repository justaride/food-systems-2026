---
tittel: Handover til neste sesjon — neste steg: Insight Pack v0.1 syntese
status: Superseded av HANDOVER-NESTE-SESJON-2026-05-18.md
eier: Gabriel
sist_oppdatert: 2026-05-11
superseded_av: docs/project/HANDOVER-NESTE-SESJON-2026-05-18.md
superseded_dato: 2026-05-18
neste_handling: Bruk 2026-05-18-versjonen — denne beholdes som historisk kontekst
relaterte_filer:
  - docs/project/mandates/plan-for-tg-food-2026-05-11.md
  - docs/project/mandates/nordic-coverage-gap-analysis-2026-05-11.md
  - docs/project/PLAN-FOOD-TG-INSIGHT-PACK-V01-2026-04-27.md
  - docs/project/FOOD-TG-STATUS-ARBEIDSPLAN-2026-04-27.md
---

# Handover — neste steg: Insight Pack v0.1

> **For neste sesjon:** Les denne, så er du oppdatert. Sesjonen 2026-05-11 leverte infrastrukturen; nå skal substansen bygges.

## Hva som er gjort 2026-05-11 (12 commits)

| Område | Resultat |
|---|---|
| **Plan for TG food** | Lokal v0.1 utkast levert (`docs/project/mandates/plan-for-tg-food-2026-05-11.md`). Notion-tasken ble *ikke* skrevet til per regel. JTO må manuelt pushe. |
| **DB-normalisering** | Country uppercase ISO + Nordic, documentType kebab-case, på tvers av 6 tabeller |
| **Postgres FTS** | tsvector + GIN på Document/Insight/Report/Thesis med norsk stemming. Erstatter manglende OpenAI-embeddings. |
| **okologisk-norden import** | +26 documents (SE 14, IS 5, DK 2, FI 3, NO 2) fra `evidence-pack/okologisk-norden-2026-04-29/text/` |
| **Insight-doc-linking** | 16 % → **47.5 %** coverage (58 av 122 insights med ≥1 dokumentkobling). 38 nye `InsightDocumentRef`-rader. |
| **Nordisk gap-analyse** | `docs/project/mandates/nordic-coverage-gap-analysis-2026-05-11.md` — coverage-matrise + 5 prioriterte gap m/ konkrete kilder |
| **Hygiene** | -192 macOS-duplikater, -11 GB stale `.next/` cache, -186 MB stale node_modules.old, `.DS_Store` gitignored globalt |

## Substrat klart for Insight Pack-syntese

- **58 dokumentkoblede insights** med klassifisert relevans (`primary` 24, `supporting` 36, `related` 8) — disponibel via `SELECT * FROM "Insight" i JOIN "InsightDocumentRef" r ON r."insightId"=i.id`
- **FTS-søk klar:** `websearch_to_tsquery('norwegian', ...)` mot `search_vector` på alle relevante tabeller
- **Per-tema-fordeling kjent** — kjør `psql -d foodsystems -f research/_status/nordic-coverage-matrix-queries.sql` for ferskt snapshot
- **Mandates-katalog full:** alle Food TG-leveranser (mandate, decision memos, sporbriefs, actor-pack) i `docs/project/mandates/` — bruk som strukturanker

## Neste leveranse: Insight Pack v0.1

**Mål:** 5–8 siders syntese m/ 3 sporbriefs som input til JTO/Cathrines scope-beslutning. Opprinnelig frist 2026-05-08; nå overdue, men fortsatt verdifull.

**Struktur (jf. `docs/project/PLAN-FOOD-TG-INSIGHT-PACK-V01-2026-04-27.md` Phase 7):**

1. **Executive summary** — 1 side
2. **Spor A:** Sirkulært fôr & importavhengighet — bruk eksisterende `dossier-a-feed-import-eudr-triangulation.md`
3. **Spor B:** Sidestrømmer & næringsstoffer — `dossier-b-marine-nutrient-loops.md` + `dossier-b-process-sidestreams-okara-bsg.md`
4. **Spor C:** Adopsjon & skalering — `dypdykk-4e-adoption-markedsmakt-innkjop-governance-2026-04-28.md`
5. **Tverrgående:** nordisk dekningsgap (henvis til 2026-05-11-rapporten)
6. **Beslutningsanbefaling** — scope-locking forslag til JTO

**Foreslått fil:** `docs/project/mandates/food-tg-insight-pack-v0.1-2026-05-12.md`

## Hvordan starte neste sesjon

Send følgende prompt:

```
Les docs/project/HANDOVER-NESTE-SESJON-2026-05-11.md først.
Bygg Insight Pack v0.1 syntese basert på dossiers i mandates/ og
de 58 dokumentkoblede insights. Følg strukturen i PLAN-FOOD-TG-
INSIGHT-PACK-V01-2026-04-27.md Phase 7. Lever som markdown i
docs/project/mandates/food-tg-insight-pack-v0.1-2026-05-12.md.
```

## Ekstern handling som blokkerer videre progresjon

Disse må gjøres manuelt av Gabriel/JTO før gap-tetting Uke 2-4 kan fortsette:

1. **DK adopsjon** (NO=49, DK=2): KFST Salling-Coop decisions, Klimarådet 2023-2025
2. **FI selvforsyning** (FI=0): NESA matsikkerhetsstrategi 2030 (URL i KILDEREGISTER), Luke Food Balance 2024
3. **SE/DK/IS sirkulært fôr** (alle <3): SLU, Jordbruksverket, SEGES, DTU Aqua, MAST, 100% Fish

Konkrete URLer per kilde i `docs/project/mandates/nordic-coverage-gap-analysis-2026-05-11.md` §2.

## Andre verktøy klare for bruk

- `scripts/suggest-insight-links-v3.sql` + `curate-insight-links-v3.ts` + `apply-insight-links-v3.ts` — re-run når nye documents kommer
- `scripts/import-okologisk-norden-evidence.ts` — gjenbrukbar mal for fremtidige evidence-pack-imports
- `scripts/normalize-document-categories.sql` — idempotent; kan kjøres igjen ved tvil om kategorisering
- `scripts/add-postgres-fts.sql` — repeterbar FTS-migrasjon
- `research/_status/nordic-coverage-matrix-queries.sql` — coverage-tracker mellom imports

## Hva som *ikke* skal endres

- **Notion er enveis lesekilde** — verifisert av Gabriel 2026-05-11. Lever som lokal markdown, JTO håndterer Notion selv.
- **Pre-eksisterende uncommittet arbeid** (companies.ts/persons.ts-optimering, Prisma index, chart-metrics.json) tilhører annen sesjon — ikke commit uten kontekst.
- **Frontend lowercase-country-konvensjon** beholdes (CountryCode-type, URL-slugs, `public/data/food-systems/{no,se,...}`-dirs) — DB er uppercase ISO; oversetting i query-laget.
