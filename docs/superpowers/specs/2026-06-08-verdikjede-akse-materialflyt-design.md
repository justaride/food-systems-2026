# Spec: Verdikjede-akse + lese-grep på materialflyt-Sankey

**Dato:** 2026-06-08
**Opphav:** Møte 2. juni 2026 (JT, Cathrine, Gabriel) — se `docs/meetings/FOOD-UTTAK-2JUNI-MATERIALFLYT-2026-06-08.md`, grep #3.1–#3.3.
**Flate:** `/sirkularitet` → Materialflyt-fanen (`src/components/charts/MaterialFlowTab.tsx`, montert i `src/app/sirkularitet/SirkularitetContent.tsx`).

## Mål

Tre lese-grep som møtet etterspurte, uten å påstå volum/verdi og uten ny datainnsamling:

1. **#3.1 Formålsavsnitt** («røntgenbilde» — hva mangler = handlingssonen).
2. **#3.2 Verdikjede-akse** per strøm: råstoff vs. bearbeidet · oppstrøm vs. avfallsside — **avledet** fra eksisterende `FlowNode.valueChainStep`.
3. **#3.3 «Registrert = kilde, ikke målt strøm»-legende.**

## Avgrensning (scope)

- **v1 (denne PR-en):** ren avledningshelper (testet) + en oppsummeringslinje per valgt loop + de to tekst-grepene. Heuristikken merkes eksplisitt som avledet, ikke målt.
- **Følge-opp (ikke nå):** per-kant-badge i NetworkMap-inspektøren og posisjonsbaserte filter-presets (krever endring i delt `NetworkMap`).

## Datagrunnlag (finnes allerede)

`ValueChainSlot = primary | processing | distribution | retail | horeca | household | seafood | waste` (`src/lib/data/r-ladder.ts`). `FlowNode.valueChainStep?: ValueChainSlot`.

## Avledningsregler (heuristikk)

Per kant, fra `from`/`to`-nodenes `valueChainStep`:

- **stage** (av `fromSlot`): `primary`/`seafood` → `raastoff`; annen definert slot → `bearbeidet`; udefinert → `ukjent`.
- **position**: `fromSlot`/`toSlot === 'waste'` → `avfallsside`; begge udefinert → `ukjent`; ellers → `oppstroem`.

## API

`src/lib/flows/value-chain-axis.ts`:
- `deriveVerdikjedeAxis(fromSlot?, toSlot?): { stage; position }`
- `summarizeVerdikjede(loops): { total, raastoff, bearbeidet, oppstroem, avfallsside }`

## Verifikasjon

- Ny test `tests/lib/flows/value-chain-axis.test.ts` (node:test), RED→GREEN.
- `npm run test`, `npm run lint`, `npm run build`.
