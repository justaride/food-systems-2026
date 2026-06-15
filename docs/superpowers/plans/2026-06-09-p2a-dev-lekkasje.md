# P2a — Remove DB/dev leakage from UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw database names, field names, file paths and shell commands in reader-visible text with plain Norwegian (or remove them).

**Architecture:** A curated find-and-replace sweep — no new components. Display text only; identifiers/types/keys/`href` expressions are never touched. Internal dev instructions already inside `/forskningsrunder`'s `InternalSection` are deliberately kept.

**Tech Stack:** Next.js/React/TypeScript/Tailwind. No tests added (pure text/markup); verified by lint, tsc, and a guard grep.

**Spec:** [`docs/superpowers/specs/2026-06-09-p2a-dev-lekkasje-design.md`](../specs/2026-06-09-p2a-dev-lekkasje-design.md)

**Verification:** `npm run lint` · `npx tsc --noEmit` (ignore the known pre-existing `tests/lib/insight-link-scripts.test.ts` error) · the guard grep in Task 3.

---

## Task 1: Rename DB model/field names → Norwegian (display text only)

For each, change ONLY the visible string; never rename identifiers (`buyer.buyerId`, `latest.operatingResult`, etc.). Use Edit with the quoted context.

- [ ] **Step 1 — `src/app/personer/[personKey]/page.tsx`:** change `kan legges til i PersonProfile-tabellen.` → `kan legges til manuelt.`

- [ ] **Step 2 — `src/app/masteroppgaver/MasteroppgaverContent.tsx`:** change `'alle har documentId'` → `'alle er koblet til kildedokument'`

- [ ] **Step 3 — `src/app/okonomi/OkonomiContent.tsx`:** change `Driftsresultat = operatingResult (Brønnøysund årsrapport)` → `Driftsresultat (Brønnøysund årsrapport)`

- [ ] **Step 4 — `src/app/forsyningskjede/ForsyningskjedeContent.tsx`:**
  - both occurrences of `BusinessRelationship-grafen er kuratert` → `Relasjonsgrafen er kuratert`
  - `DeliveryVolume er Norge-observert register-data` → `Leveransevolum-dataene er Norge-observert register-data`
  - the `<th>` text `Mangler buyerId` → `Mangler kjøper`

- [ ] **Step 5 — `src/app/graf/page.tsx`:**
  - `title="BusinessRelationship-duplikater"` → `title="Relasjons-duplikater"`
  - `Styremedlemmer uten PersonProfile` → `Styremedlemmer uten profil`

- [ ] **Step 6 — `src/app/kilder/KilderContent.tsx`:**
  - `uten eget SourceDoc-lag` → `uten egen kilderegistrering`
  - `ikke promotert til SourceDoc ennå` → `ikke registrert i kilderegisteret ennå`

- [ ] **Step 7 — `src/app/subsidier/SubsidierContent.tsx` (prose + code-chips):**
  - `:343` remove `(DeliveryVolume)`: `koblet via leveransevolum (DeliveryVolume) —` → `koblet via leveransevolum —`
  - `:482` `parent-orgnr-oppløsning mot Company-tabellen` → `oppslag av morselskapets orgnr mot selskapsregisteret`
  - `:515` `parent-orgnr må kobles videre til produsentaktør` → `morselskapets orgnr må kobles videre til produsentaktør`
  - `:647` `produsenter (Producer-tabell)` → `produsenter (produsentregisteret)`
  - the "Metode" paragraph (~:429-435) currently reads `hver mottaker er én produsent (` + `<code>producerId</code>` + `), og alle rader med ` + `<code>subsidyType=produksjonstilskudd</code>`. Replace that span so it reads (no code-chips): `hver mottaker er én produsent, og alle produksjonstilskudd-rader`. Remove BOTH `<code>` elements (`producerId` and `subsidyType=produksjonstilskudd`) and the surrounding `(`/`)`/`med`. Keep the rest of the sentence intact.
  - the later `<code>producerId</code>` at ~:685 → plain text `produsent-ID` (remove the `<code>` wrapper).

- [ ] **Step 8 — `src/components/map/FoodFlowMap.tsx`:** change the `<span>` fallback `{dataset.schemaVersion ?? 'schema ukjent'}` → `{dataset.schemaVersion ?? 'dataversjon ukjent'}`.

- [ ] **Step 9 — Typecheck + lint.** `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 10 — Commit.**

```bash
git add -A
git commit -m "fix(ui): rename raw DB model/field names to plain Norwegian"
```

---

## Task 2: Remove file paths / shell commands / MCP from reader-visible text

- [ ] **Step 1 — `src/app/subsidier/SubsidierContent.tsx` empty state (~:388-399).** Replace the whole dev-oriented empty-state body. Current:

```tsx
          <div className="font-semibold">Produksjonstilskudd-data ikke importert</div>
          <p>
            Tabellen <code className="px-1.5 py-0.5 rounded bg-white/70 text-xs font-mono">Subsidy</code> mangler rader med
            <code className="px-1.5 py-0.5 rounded bg-white/70 text-xs font-mono">subsidyType=&apos;produksjonstilskudd&apos;</code>.
            Det forklarer hvorfor kommune-, ordnings- og mottakeraggregatene er tomme.
            Beløpet «Totalt utbetalt» over inneholder kun øvrige subsidier ({byType.length} type
            {byType.length === 1 ? '' : 'r'}).
          </p>
          <p className="text-xs text-orange-800">
            Kjør i prod-container: <code className="px-1.5 py-0.5 rounded bg-white/70 font-mono">npm run db:import:produksjonstilskudd</code>{' '}
            (henter ~180k rader fra Landbruksdirektoratet, NLOD).
          </p>
```

Replace with:

```tsx
          <div className="font-semibold">Produksjonstilskudd-data er ikke lastet inn ennå</div>
          <p>
            Kommune-, ordnings- og mottakeraggregatene er derfor tomme. Beløpet «Totalt utbetalt»
            over inneholder kun øvrige subsidier ({byType.length} type
            {byType.length === 1 ? '' : 'r'}).
          </p>
```

- [ ] **Step 2 — `src/app/kilder/KilderContent.tsx` (~:192).** Change `Nedlastingsstatus spores via CSV-er i ` + `<code>research/evidence-pack/</code>` + `.` so the sentence reads `Nedlastingsstatus spores internt.` (remove the `<code>` path element).

- [ ] **Step 3 — `src/components/charts/MaterialFlowTab.tsx` (:61):** change the EmptyState message `Ingen materialstrømmer ennå — kjør \`npm run bootstrap-material-flows\`.` → `Ingen materialstrømmer registrert ennå.`

- [ ] **Step 4 — `src/app/forskningsrunder/ForskningsrunderContent.tsx` (:761):** change the EmptyState message `Ingen aktører enda. Kjør db:import:ts for å laste seed-data.` → `Ingen aktører registrert ennå.` (Do NOT touch the other `research/evidence-pack/` / `npm run` strings on this page — they are inside the InternalSection and kept by design.)

- [ ] **Step 5 — `src/app/eiendommer/EiendommerContent.tsx` (~:262-266).** Replace:

```tsx
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Tall hentet fra Brønnøysundregistrene (regnskapsåret 2024) via offentligdata MCP. Se{' '}
          <code className="text-stone-500">research/analyse/eiendomsmodell-finansiell-analyse.md</code>{' '}
          for full dokumentasjon, selskap-for-selskap.
        </p>
```

with:

```tsx
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Tall hentet fra Brønnøysundregistrene (regnskapsåret 2024) via offentlige registre.
          Dokumentert selskap-for-selskap i prosjektets kildenotater.
        </p>
```

- [ ] **Step 6 — `src/components/map/DataSourcesPanel.tsx` (:130):** change `Se <span className="font-mono">DATA-SOURCES.md</span> for fullstendig dokumentasjon.` so it reads `Se kildedokumentasjonen for detaljer.` (remove the `<span>DATA-SOURCES.md</span>`).

- [ ] **Step 7 — `src/components/map/FoodFlowMap.tsx` (~:716).** Replace the prototype sentence:

```tsx
                Edge-listen er liten med vilje. Den viser hvordan en senere `flowmap.gl`-integrasjon kan brukes for å sammenligne havn til hub-strømmer.
```

with:

```tsx
                Kart-koblingene er få med vilje — en illustrasjon av hvordan havn-til-hub-strømmer kan sammenlignes i en senere versjon.
```

- [ ] **Step 8 — Typecheck + lint.** `npx tsc --noEmit` (no new errors) and `npm run lint` (passes).

- [ ] **Step 9 — Commit.**

```bash
git add -A
git commit -m "fix(ui): remove file paths, shell commands and MCP from reader views"
```

---

## Task 3: Guard grep + final verification

- [ ] **Step 1 — Guard grep.** Run:

```bash
rg -n "producerId|BusinessRelationship|SourceDoc-lag|PersonProfile-tabell|= operatingResult|Mangler buyerId|db:import:produksjonstilskudd|bootstrap-material-flows|db:import:ts| MCP\b|DATA-SOURCES\.md|flowmap\.gl|Edge-listen|subsidyType=produksjonstilskudd" src/app src/components | rg -v "interlock|buyer\.buyerId|\.operatingResult|href=|import |from '"
```
Expected: NO reader-visible matches. (Identifiers like `buyer.buyerId` and `latest.operatingResult` may remain — they are code, not display.) Also confirm the kept-internal `/forskningsrunder` paths still exist:
```bash
rg -n "research/evidence-pack" src/app/forskningsrunder
```
Expected: still present (lines ~271, 364, 520, 664, 693 — inside InternalSection, kept by design).

- [ ] **Step 2 — Full suite + lint + tsc.** `npm run test` (all pass), `npm run lint` (clean), `npx tsc --noEmit` (only the known pre-existing error).

- [ ] **Step 3 — Spot-check in `npm run dev`:** `/subsidier` (no `producerId`/`Subsidy`/npm in the empty state or method note), `/økonomi` (footnote "Driftsresultat (Brønnøysund årsrapport)"), `/forsyningskjede` ("Relasjonsgrafen", "Mangler kjøper"), `/graf` ("Relasjons-duplikater"), `/eiendommer` (no "MCP"/.md path), `/kart/no/flow` (no "flowmap.gl"/"Edge-listen").

- [ ] **Step 4 — Open a PR from `codex/p2a-dev-lekkasje`.**
