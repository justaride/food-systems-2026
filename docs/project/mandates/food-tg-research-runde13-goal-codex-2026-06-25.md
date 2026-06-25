---
tittel: Food TG — Research Runde 13 GOAL (Codex autonom kjøring)
status: Kjørbar goal — intern research, åpner ingen claims
eier: Gabriel
dato: 2026-06-25
scope: Kjør alle 50 R13-prompts autonomt, batch for batch, med samme mottaks- og kildedisiplin som R12.
bruksregel: Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper-/deck-stemme. All output er internt research-underlag som mottaksføres og gates.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md
  - research/_status/food-tg-research-backlog-2026-06-25.csv
  - docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
  - research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
---

# GOAL: Execute Food TG Research OS Runde 13 (autonom)

## Goal-setning

Kjør hele R13-backloggen (50 prompts) autonomt med R2-berikelsesdisiplin: for hver prompt, hent primærkilder, skriv et mottakbart research-artefakt, fatt en mottaksbeslutning, og rull funnene opp i en intake-indeks. Ingen output blir ekstern faktastemme. Goalet er ferdig når alle 50 prompts har output-fil, decision-rad og intake-rad, og kontrollene er grønne.

## Inndata (les disse først)

1. **Promptpack** — `docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md` (selve promptene + universal instruks).
2. **Backlog-CSV** — `research/_status/food-tg-research-backlog-2026-06-25.csv` (kanonisk ID/gate/next_artifact).
3. **Masterplan** — `docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md` (rekkefølge §8, stop-regler §9).
4. **Mottaksprotokoll** — `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md` (A/B/C, hulltyper, gates).
5. **Intake-mal** — `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` (fylles per batch).

CSV-en er fasit for ID, rekkefølge, gate og `next_artifact`. Promptpacken er fasit for prompt-tekst og `Lagre output`-sti.

## Harde regler (gjelder hele kjøringen)

1. **Primærkilde først.** Sekundær-/speilkilde bare når primær mangler, og merk `B`.
2. **Ikke gjett.** Tomme celler og dokumentert fravær er gyldige funn.
3. **Skill kildeklasse `A`/`B`/`C` per funn**, ikke bare per dokument.
4. **Skill realisert volum, kapasitet, plan, potensial og hypotese.**
5. **Hver output ender i én gate:** source-shortlist, PCQ, claim-lock, actor-gate, forstaelse, internal eller parkert.
6. **Lag alltid en `Ikke si`-liste.** Mangler den, er importbeslutning `vent`.
7. **Ingen DB-skriving, ingen `safe_for_ai_context`, ingen claim-åpning, ingen whitepaper-/deck-tekst.**
8. **Følg stop-reglene i masterplan §9.** Parker heller enn å overclaime.
9. **Hold deg til scope per prompt.** Én prompt = ett smalt artefakt.

## Kjørerekkefølge og batcher

Kjør gap-closure først (masterplan §8), deretter food-waste, protein-alt, actor-map, innovation, ecology, landscape. 13 batcher à ~4 prompts:

| Batch | Prompt-IDer |
|---|---|
| 01 | R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002 |
| 02 | R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002 |
| 03 | R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007 |
| 04 | R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007 |
| 05 | R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004 |
| 06 | R13-PROT-005, R13-PROT-008, R13-AKTOR-001, R13-AKTOR-002 |
| 07 | R13-AKTOR-003, R13-AKTOR-004, R13-AKTOR-006, R13-AKTOR-005 |
| 08 | R13-AKTOR-007, R13-AKTOR-008, R13-INNO-001, R13-INNO-002 |
| 09 | R13-INNO-003, R13-INNO-004, R13-INNO-006, R13-INNO-005 |
| 10 | R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003 |
| 11 | R13-OKO-005, R13-OKO-007, R13-OKO-004, R13-OKO-006 |
| 12 | R13-LAND-001, R13-LAND-002, R13-LAND-005, R13-LAND-003 |
| 13 | R13-LAND-004, R13-LAND-006 |

Innenfor en batch: kjør P0/P1 før P2. Hvis en kilde ikke finnes, registrer hullet og gå videre — ikke stopp hele batchen.

## Per-prompt arbeidsløkke

For hver prompt-ID:

1. Les prompt-blokken i promptpacken og `next_artifact`/`Lagre output`-stien.
2. Hent primærkilder (offisiell statistikk, register, lovtekst, årsrapport, fagrapport). Logg URL og tilgangsdato.
3. Skriv output-fila på `Lagre output`-stien med universal-format: Kort dom, Sterkeste kilde, Svakeste punkt, Funn-tabell (kilde/år/lokator/klasse/caveat), Tomme celler, `Ikke si`, Anbefalt gate.
4. Fatt mottaksbeslutning: `enrich` (importer som kandidat), `park` (stopp claim), eller `actor-gate` (krever aktørdata).
5. Append én linje til `research/_status/food-tg-r13/decisions/batch-NN.jsonl` (schema under).
6. Behold gate fra CSV som default, men nedgrader hvis svakeste punkt krever det (svakeste punkt styrer gate, ikke ønsket bruk).

## Output-kontrakt per batch

Etter hver batch, produser:

1. **Output-filer** — én per prompt på `Lagre output`-stien.
2. **Decision JSONL** — `research/_status/food-tg-r13/decisions/batch-NN.jsonl`, én linje per prompt.
3. **Batch-rapport** — `research/_status/food-tg-r13/report-batch-NN.md` med: header (Dato, Goal, Batch, Regel), Oppsummering (beslutning → antall → IDer), Mottaksrad-tabell (8 kolonner fra mottaksprotokoll §3), og Per-target outcome med verifisert(e) kilde(r) og utfall per ID.
4. **Oppdater intake-indeks** — legg hver prompt-ID i riktig(e) gruppe i `r13-intake-index-2026-06-25.md`, og oppdater Kontrollstatus + Hurtigoppsummering.

### Decision JSONL-schema (én linje per prompt)

```json
{"id":"R13-XXX-NNN","decision":"enrich|park|actor-gate","valueTier":"high|medium|low","title":"...","canonicalPath":"research/external/r13/...","shortVerdict":"2-4 setninger, funn ikke tolkning","strongestSource":"navn, år, lokator","weakestPoint":"hva tåler ikke ekstern bruk","sourceClass":"A | B | C | A with C gaps","gapType":"Type A | Type B | Type C (per relevant celle)","gate":"source-shortlist|PCQ|claim-lock|actor-gate|forstaelse|internal|parkert","importDecision":"importer|vent|parker|aktørspørsmål|claim-lock-kandidat","ikkeSi":["...","..."],"fetchedSources":[{"url":"https://...","accessedAt":"2026-06-25","sourceClass":"primary|secondary|actor-primary|public-filing"}],"fileEdited":true}
```

## Spesielle hensyn for gap-closure-batchen

`R13-GAP-*` lukker kjente R12-hull. Bruk R12-funnene som utgangspunkt:

- **GAP-001 (importnoder):** krever SSB 08801 HS-uttak per node; fosfat og fôrprotein-total var tomme celler i R12 — vis dem.
- **GAP-004 (alt. fôrproteiner):** realisert fôr-grade volum manglet nesten helt i R12 — annonsert kapasitet/plan skal ikke bli realisert volum.
- **GAP-005 (parkerte claims):** behandle ASKO/HORECA 70 %, REKO-tall, andelslandbruk aktiv-telling, SOIL-score, fiskeolje art/sluttbruk og Plantagon/Rest hver for seg; løft kun med uavhengig primærkilde.
- **GAP-006 (type-C-eskalering):** input er R12 intake-indeks; klassifiser hvert hull som Type A/B/C på nytt.

## Definition of done

Goalet er ferdig når:

- alle 50 prompt-IDer har en output-fil på `Lagre output`-stien
- alle 50 har én decision-linje fordelt på `decisions/batch-01..13.jsonl`
- alle 13 batch-rapporter finnes
- intake-indeksen viser «Promptrader indeksert: 50 / 50» og alle grupper er fylt
- ingen output åpner claim, skriver DB, eller bruker `safe_for_ai_context`/whitepaper-stemme
- følgende kontroller er kjørt og grønne:

```bash
# ID/struktur-konsistens
python3 - <<'PY'
import csv, re, json, pathlib
ids=[r["id"] for r in csv.DictReader(open("research/_status/food-tg-research-backlog-2026-06-25.csv"))]
dec=[]
for p in sorted(pathlib.Path("research/_status/food-tg-r13/decisions").glob("batch-*.jsonl")):
    dec += [json.loads(l) for l in p.read_text().splitlines() if l.strip()]
dids=[d["id"] for d in dec]
print("backlog:",len(ids),"decisions:",len(dids),"unique:",len(set(dids)))
print("missing decisions:",sorted(set(ids)-set(dids)))
print("missing output files:",[i for i in ids if not list(pathlib.Path('.').glob(f'**/{i}-*.md'))])
PY

# repo-vakter
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

## Stop / eskaler til menneske

Stopp og rapporter i stedet for å gjette når:

- en prompt krever lukket aktørdata eller beslutningstilgang (actor-gate) — registrer kravet, ikke et tall
- to kilder gir motstridende primærtall uten metode for å avgjøre
- en kilde ser ut til å kreve betaling, innlogging eller er blokkert — noter som `C`/Type B og gå videre
- output ville måtte åpne et nytt claim for å være nyttig — parker det
