---
tittel: Nordic Source Cleanup Process
status: Lane A og B delvis utført internt
eier: Gabriel
sist_oppdatert: 2026-04-29
formaal: Rydde DB/repo-koblinger for nordiske kjerne-rapporter uten å blande trygge koblinger med review-valg.
relaterte_filer:
  - docs/project/status/NORDISK-MATSYSTEM-KILDESTATUS-2026-04-29.md
  - docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md
  - scripts/link-nordic-core-sourcedocs.ts
  - scripts/cleanup-nordic-report-links.ts
  - scripts/cleanup-nordic-lane-b.ts
  - scripts/import-nnr2023-pdf.ts
---

# Nordic Source Cleanup Process

## Prinsipp

Ryddingen skal ikke behandle alle manglende `documentId` som samme type feil. Det finnes fire typer:

1. Trygg rapportkobling: `Report` mangler `documentId`, og riktig `Document` finnes med eksakt fil.
2. Path-prefix drift: `Document.filePath` peker på `evidence-pack/...`, mens faktisk fil ligger i `research/evidence-pack/...`.
3. Duplikatvalg: to `Report`- eller `Document`-rader peker mot samme kilde og må kanoniseres før kobling.
4. Manglende promotering: fysisk PDF eller ekstern URL finnes, men det finnes ikke riktig `Document`-rad ennå.

Bare type 1 og ukonfliktet type 2 skal kunne kjøres med `--apply`.

## Lane A - apply-now

Disse radene var trygge å kjøre etter grønn dry-run og ble applisert 2026-04-29:

| Handling | Objekt | Resultat | Script |
|---|---|---|---|
| Link `Report` til PDF-`Document` | `Report: norden-policy-2024` -> `Document: cmoh2g8g9003ln60d1luiwjr1` | `linked`, deretter verifisert som `already-linked`. | `scripts/cleanup-nordic-report-links.ts` |
| Oppdater path + link `Report` | `Report: finland-food2030` -> `Document: cmmxa66ng003wty0dlfdpgu2b` | `path-updated` + `linked`, deretter verifisert som `already-updated` / `already-linked`. | `scripts/cleanup-nordic-report-links.ts` |
| Oppdater path | `Document: cmmxa66oq003zty0dhw4emg34` (`kfst-salling-coop-2025`) | `path-updated`, deretter verifisert som `already-updated`. | `scripts/cleanup-nordic-report-links.ts` |
| Oppdater path | `Document: cmmxa66pi0041ty0d24w2ndou` (`se-konkurrensverket-2024-5`) | `path-updated`, deretter verifisert som `already-updated`. | `scripts/cleanup-nordic-report-links.ts` |

Verifikasjonskommando:

```bash
node --import=tsx -r dotenv/config scripts/cleanup-nordic-report-links.ts
```

Forventet status etter apply: alle rader returnerer `already-linked` eller `already-updated`.

`scripts/link-nordic-core-sourcedocs.ts` er også re-kjørt og returnerer `already-linked` for alle fem kjerne-`SourceDoc`-koblinger.

## Lane B - review-first / utført delvis

Lane B ble delt i to:

- `apply-now etter review`: poster hvor riktig kanonisk handling kunne bestemmes fra DB + lokal filstatus.
- `fortsatt review`: poster hvor fulltekstgrunnlag eller duplikatpolicy fortsatt må avklares.

### Lane B utført 2026-04-29

| Handling | Objekt | Resultat | Script |
|---|---|---|---|
| Attach lokal PDF + link `Report` | `Report: konkurrensverket-2025-5-livsmedelsutredning` -> `Document: cmoh0jq8j001gvw0dq305lmb4` | `file-attached+linked`, deretter verifisert som `already-has-file+already-linked`. | `scripts/cleanup-nordic-lane-b.ts` |
| Flytt `Report.documentId` til SourceDoc-støttet dokument | `Report: stockholm-resilience-2019` fra `cmnyng39z00egd50dtdgv6gpt` til `cmoh2g8s10046n60d1rikrioz` | `moved`, deretter verifisert som `already-moved`. | `scripts/cleanup-nordic-lane-b.ts` |

Verifikasjonskommando:

```bash
node --import=tsx -r dotenv/config scripts/cleanup-nordic-lane-b.ts
```

Forventet status etter apply:

- `konkurrensverket-2025-5-livsmedelsutredning`: `already-has-file+already-linked`
- `stockholm-resilience-2019`: `already-moved`

### Lane B utført som egen NNR-import 2026-04-29

| Handling | Objekt | Resultat | Script |
|---|---|---|---|
| Last ned full PDF, opprett `Document`, opprett `SourceDoc`, link `Report` | `Report: nnr2023-nordic-nutrition-recommendations` -> `Document: cmokdp3qf0000y20dsvg0p64j`; `SourceDoc: src-food-nnr2023` | `imported-and-linked`, deretter verifisert som `already-linked`. | `scripts/import-nnr2023-pdf.ts` |

Lokal PDF:

```text
research/evidence-pack/nordisk/nordic-nutrition-recommendations-2023.pdf
```

Kontroll:

```bash
node --import=tsx -r dotenv/config scripts/import-nnr2023-pdf.ts
```

### Lane B fortsatt review

| Objekt | Problem | Anbefalt beslutning |
|---|---|---|
| `Report: dk-salling-coop-decision-2025` | Dupliserer i praksis `Report: kfst-salling-coop-2025`, og `Report.documentId` er unik. | Behold `kfst-salling-coop-2025` som kanonisk `Report` for KFST-vedtaket. La `dk-salling-coop-decision-2025` stå ulenket til vi har en duplikat-/archive-policy for `Report`. |
| Gammel Stockholm-`Document` | `Document: cmnyng39z00egd50dtdgv6gpt` har stale `filePath: evidence-pack/tenketank/stockholm-resilience-2019.pdf` og er nå ikke kanonisk `Report`-anker. | Behold foreløpig som duplicate-review; ikke slett uten egen merge/archive-prosess. |

## Lane C - bred path-prefix opprydding

Det finnes mange `Document.filePath`-rader med `evidence-pack/...` hvor faktisk fil ligger under `research/evidence-pack/...`. Dette bør ikke ryddes sammen med Food TG-kjernepakken fordi flere rader har konflikter mot nyere `Document`-rader.

Anbefalt senere prosess:

1. Lag full audit med `documentId`, `filePath`, `prefixedPath`, fysisk filstatus og konflikt-`Document`.
2. Del i `safe-path-update` og `duplicate-review`.
3. Kjør kun `safe-path-update` med script.
4. Håndter `duplicate-review` med egen merge-/archive-beslutning.

## Lane D - Food TG shortlist-status

Utført 2026-04-29 som lesende audit, uten DB-endringer:

| Artefakt | Innhold | Script |
|---|---|---|
| `docs/project/mandates/source-shortlist-food-tg-db-status-2026-04-29.md` | Operativ status for 102 `SRC-*`-rader mot lokale filer og DB-lagene `Document`, `Report`, `SourceDoc` og `Thesis`. | `scripts/audit-food-tg-source-shortlist-status.ts` |
| `docs/project/mandates/source-shortlist-food-tg-db-status-2026-04-29.csv` | Maskinlesbar detaljstatus med kvalitet, sportag, status, gate, DB-treff, lokale stier, URL-er og neste handling. | `scripts/audit-food-tg-source-shortlist-status.ts` |

Verifikasjonskommando:

```bash
node --import=tsx -r dotenv/config scripts/audit-food-tg-source-shortlist-status.ts
```

Siste kjente status:

- `db-linked`: 64
- `db-candidate-review`: 4
- `db-record-only`: 2
- `external-only`: 23
- `needs-primary-check`: 6
- `repo-only`: 2
- `static-only`: 1

Neste ryddesteg bør starte fra `Prioritert oppryddingskø` i statusrapporten. Ikke tell `db-candidate-review` som sikkert DB-lenket før fuzzy-treffene er manuelt kontrollert.

## Stop-regler

Stopp og ikke kjør `--apply` hvis scriptet viser:

- `blocked-missing-document`
- `blocked-missing-report`
- `blocked-target-path-owned-by-other-document`
- `blocked-document-already-linked-to-other-report`
- `blocked-report-already-linked-to-other-document`
- `blocked-unexpected-current-path`

## Etter apply

Utført 2026-04-29 etter Lane A:

1. `node --import=tsx -r dotenv/config scripts/cleanup-nordic-report-links.ts` returnerte `already-*`.
2. `node --import=tsx -r dotenv/config scripts/link-nordic-core-sourcedocs.ts` returnerte `already-linked`.
3. `docs/project/status/NORDISK-MATSYSTEM-KILDESTATUS-2026-04-29.md` og `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md` er oppdatert fra `repo/static` til `db-linked` for kilder som faktisk ble endret.

Utført 2026-04-29 etter Lane B:

1. `node --import=tsx -r dotenv/config scripts/cleanup-nordic-lane-b.ts` returnerte `already-*`.
2. `Report: konkurrensverket-2025-5-livsmedelsutredning` er nå lenket til lokal PDF-`Document`.
3. `Report: stockholm-resilience-2019` er flyttet til SourceDoc-støttet `Document` med faktisk `research/evidence-pack/...` filsti.
4. `dk-salling-coop-decision-2025` og gammel Stockholm-`Document` står igjen som bevisst review/backlog, ikke uoppdagede feil.

Utført 2026-04-29 etter NNR-import:

1. Offisiell PDF ble lastet ned fra `https://pub.norden.org/nord2023-003/nord2023-003.pdf`.
2. `pdftotext` verifiserte tekstuttrekk, 374 sider og ca. 106 420 ord.
3. `Report: nnr2023-nordic-nutrition-recommendations`, `SourceDoc: src-food-nnr2023` og `Document: cmokdp3qf0000y20dsvg0p64j` peker nå til samme fulltekst-PDF.
