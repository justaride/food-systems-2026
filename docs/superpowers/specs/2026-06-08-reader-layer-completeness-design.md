# Spec: Completeness-pass på reader-laget

**Dato:** 2026-06-08
**Opphav:** Utenforstående plattformgjennomgang 27.05 (`docs/project/analysis/outside-user-platform-review-2026-05-27.md`).
**Forutsetning (verifisert i kode 2026-06-08):** Kjernen av reader-laget er allerede bygget — `Leserreise` + `Nøkkelbegreper` på forsiden (P0 #4), delt `PageFraming`-komponent på 6 tunge sider (P1 #5: innsikt, forsyningskjede, sammenligning, graf, mandat, bibliotek), `StatusLegend` flere steder (P1 #6), og målgruppe/status per hvitbok-kapittel (P1 #7). Denne spec-en lukker det **gjenstående gapet**, ikke hele laget.

## Mål

Fullføre reader-laget så plattformen er klar for bredere/ekstern deling (aktører + juni/juli-event), uten å redesigne det som finnes.

## Scope

Tre avgrensede deler:

1. **Graf-presets (P1 #8)** — det eneste genuint uimplementerte P1-grepet.
2. **`PageFraming` på 4 event-vendte sider** — utvide eksisterende komponent.
3. **Kart-H1 (P2 #9)** — tilgjengelighet.

### Utenfor scope (YAGNI)
- Rapportmodus-/leserflate-toggle (P2 #11).
- Gruppering av relaterte dokumenter (P2 #10).
- `PageFraming` på alle 30+ ruter — kun de 4 event-vendte nå.

## Datagrunnlag (finnes)

`src/lib/queries/graph.ts`:
- `GraphNode.type`: `document | insight | thesis | company | source | actor | person | property`
- `GraphEdge`: `{ source, target, type: string, confidence?: number /* 0..1 */ }`
- `/graf` beregner allerede node-grad og konfidens; `KnowledgeGraph` (`src/components/charts/KnowledgeGraph.tsx`) rendrer `nodes`/`edges` og har i dag ingen preset-mekanisme.

## Del 1 — Graf-presets

### Arkitektur
- **Ny ren hjelpefunksjon** `src/lib/graph/preset.ts`: `deriveGraphPreset(nodes, edges, presetId): { nodes, edges }`. Skrives **test-først** (`node:test`, `tests/lib/graph/preset.test.ts`).
- **Ny client-wrapper** `src/components/charts/GraphPresetView.tsx`: mottar fullt koblet node/edge-sett, holder valgt preset (`useState`, default `sentrale`), kaller `deriveGraphPreset`, rendrer en knapperad + `KnowledgeGraph` med filtrert sett.
- `src/app/graf/page.tsx`: erstatt direkte `<KnowledgeGraph .../>` med `<GraphPresetView .../>`. `KnowledgeGraph` røres ikke.

### Presets (default = `sentrale`)

| id | Label | Beholder | Regel |
|---|---|---|---|
| `sentrale` | Mest sentrale | Topp-N noder etter grad + kanter mellom dem | N = 80 (konfig-konstant); grad = antall kanter |
| `eierskap` | Makt & eierskap | `company` + `person`-noder + eier-/styre-kanter | `node.type ∈ {company, person}` og `edge.type ∈ EIER_TYPER` |
| `forsyning` | Forsyning | `company` + `actor`-noder + kjøper/leverandør-kanter | `node.type ∈ {company, actor}` og `edge.type ∈ FORSYNING_TYPER` |
| `evidensgap` | Evidensgap | Kanter med lav/ukjent konfidens + endepunkter | `edge.confidence === undefined || edge.confidence < 0.5` |

- `EIER_TYPER` og `FORSYNING_TYPER` enumereres fra faktisk `edge.type`-vokabular i implementasjonen (grep `structuralEdge`/`relationType`-bruk i `graph.ts`).
- Hver preset dropper deretter noder uten gjenværende kant (samme «kun koblede noder»-prinsipp som dagens side).
- Tomt resultat → `KnowledgeGraph` viser sin egen tomtilstand; knappen får et lavmælt «0»-merke.

### UX
- Knapperad over canvas (samme stil som `StatusLegend`/`Card`). Aktiv preset uthevet.
- Kort hjelpetekst per preset (tooltip/undertekst), f.eks. «Evidensgap: koblinger som mangler eller har lav kildekonfidens».

## Del 2 — `PageFraming` på 4 event-vendte sider

Legg eksisterende `PageFraming` (`src/components/ui/PageFraming.tsx`: `title`, `description[]`, `takeaways[]`, `caveat`) øverst i innholdet på:

- `src/app/verdikjede/VerdikjedeContent.tsx`
- `src/app/sirkularitet/SirkularitetContent.tsx`
- `src/app/eierskap/EierskapContent.tsx`
- `src/app/kart/page.tsx` — **NB:** fullflate-kartside uten egen Content-komponent. `PageFraming` plasseres der det passer kart-layouten (kondensert intro, ev. i `kart/layout.tsx`-panel); H1 (Del 3) er uansett påkrevd her.

**Innhold:** Gabriel drafter `title`/`description`/`takeaways`/`caveat` per side i samme ærlige, forbeholds-tro stil som de 6 eksisterende. **Den eksternvendte ordlyden gjennomgås av Gabriel/Cathrine før commit** (claim-sensitivt). Ingen nye claims; caveat speiler sidens faktiske datastatus.

## Del 3 — Kart-H1

`/kart` (`src/app/kart/page.tsx`, ev. `kart/layout.tsx`) mangler synlig H1. Legg en `<h1>` (synlig eller `sr-only` hvis den kolliderer med kart-layout) som beskriver flaten, for tilgjengelighet og tekstforståelse (P2 #9).

## Verifikasjon

- **TDD:** `deriveGraphPreset` — `tests/lib/graph/preset.test.ts` (RED→GREEN): én test per preset + tom-graf + ukjent presetId.
- `npm run test`, `npm run lint`, `npm run build`.
- **Visuelt** (per verify-skill): `/graf` — bytt mellom de 4 presetene, bekreft at canvas endrer seg og default er «Mest sentrale»; de 4 nye `PageFraming`-sidene rendrer; `/kart` har H1.

## Filer

| Fil | Endring |
|---|---|
| `src/lib/graph/preset.ts` | ny — `deriveGraphPreset` + preset-katalog |
| `tests/lib/graph/preset.test.ts` | ny — TDD |
| `src/components/charts/GraphPresetView.tsx` | ny — client-wrapper + knapperad |
| `src/app/graf/page.tsx` | bytt `KnowledgeGraph` → `GraphPresetView` |
| `src/app/verdikjede/VerdikjedeContent.tsx` | legg til `PageFraming` |
| `src/app/sirkularitet/SirkularitetContent.tsx` | legg til `PageFraming` |
| `src/app/eierskap/EierskapContent.tsx` | legg til `PageFraming` |
| `src/app/kart/page.tsx` (+ `kart/layout.tsx`) | legg til H1 + kondensert `PageFraming` |
