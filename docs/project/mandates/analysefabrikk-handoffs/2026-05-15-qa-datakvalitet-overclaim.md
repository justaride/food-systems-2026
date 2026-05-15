# QA spot-check — datakvalitet og overclaim-kontroll 2026-05-15

Dato: 2026-05-15  
Dispatch: DQ-010  
Worker: QA (Claude)  
Output type: spot-sjekk av sesjonens datakvalitetsartefakter mot promoteringsgater og overclaim-risiko

## Status etter viderefoering 2026-05-15

Dette dokumentet er et QA-spot-check fra et tidligere steg samme dag. Etter viderefoering er flere av funnene lukket:

- `STC-028` er ikke lenger `needs_new_ev`; `EV-B-027` er opprettet fra `research/evidence-pack/arsrapporter/salling-group-2024.pdf`.
- `CL-B-020` er korrigert: Salling Group viser 2,8 % baseline 2015 til 1,8 % i 2024, dvs. -34,8 % mot baseline, ikke en halvering.
- B12-gapkortet er patchet og loeftet til `promoted_analysis` med `ki_usage_rule=warn_user`.
- A4 er loeftet til `staged_analysis` via scoped production panel; G3 har NIBIO-celler laast og scenarioformel laast for 0/25/50 prosent sjømateksport-retensjon, men eksportenergi mangler foer resultatberegning.
- Tallene under i opprinnelig QA-seksjon er derfor historisk snapshot, ikke gjeldende status.

## Scope

Reviewer artefakter levert i analysefabrikk-prosessen 2026-05-15 etter at faglig analyse (`DATAKVALITET-FAGLIG-ANALYSE-2026-05-15.md`) og operativ prosessplan (`RESEARCH-PROSESSER-DATAKVALITET-2026-05-15.md`) ble vedtatt.

Filer reviewet:
- `research/_plans/source-to-claim-ledger-2026-05-15.csv` (29 claims)
- `research/_plans/data-quality-baseline-2026-05-15.csv` (33 rader)
- `research/_plans/research-dispatch-ledger-2026-05-15.csv` (11 worker-spor)
- `research/_plans/research-activation-queue-2026-05-15.csv` (16+ kilder/gap)
- `docs/project/mandates/evidence-matrix-food-tg.md` (6 nye EV-rader)
- `src/app/forsyningskjede/ForsyningskjedeContent.tsx` (3 UI-edits)
- `docs/project/mandates/analysefabrikk-handoffs/2026-05-15-worker-d-wave1-a4-g3-b12.md`

## Kort konklusjon

1. Datakvalitetsskjema, promoteringsgater og worker-spor er operativt etablert.
2. 28 av 29 source-to-claim rader er locator-mappet. STC-028 (Salling Group) er eneste gjenværende `needs_new_ev`.
3. 6 nye EV-rader (EV-A-022, EV-B-025, EV-B-026, EV-C-026, EV-C-027, EV-C-028) er lagt til evidence-matrix og er konsistent referert fra STC-ledger.
4. PCQ-FS-NO-002 overclaim-guard er live i UI (`/forsyningskjede`).
5. B12-gap er nær lukking via ACT-002 metodenote og ACT-011 Eurostat PLI-panel.
6. A4 og G3 gap-cards trenger fortsatt datartefakter før de kan løftes til `staged_analysis`.

## Verifikasjon per artefakt

### source-to-claim-ledger

Strukturell sjekk: 30 linjer (1 header + 29 data), 18 kolonner konsekvent, ingen duplikater.

Locator-status fordeling:

| Status | Antall | Tolkning |
|---|---:|---|
| section_heading | 15 | Locked med seksjonsreferanse i kilde |
| line_range | 4 | Locked med linjeområde |
| metric_in_row | 3 | Locked med spesifikke metric-verdier |
| row_locator | 2 | Locked til CSV-rad-referanse |
| official_legal_locator | 1 | STC-015 matkastelov med LOV-2025-06-20-103 + Prop. 130 L paragrafer |
| official_api_locator | 1 | STC-029 Eurostat PLI med tabell 14682/prc_ppp_ind |
| cell_locator | 1 | STC-004 NIBIO Engrosforbruk celle AB5/AB6 |
| model_spec_ref | 1 | STC-020 nutrient-flows til MS-004 |
| needs_new_ev | 1 | STC-028 Salling Group — eneste gjenværende blocker |

Verdivurdering: 28/29 rader er promoterings-klare for analyse-/rapport-bruk med korrekt KI-bruksregel. Ingen overclaim-risiko identifisert blant locked rader.

### evidence-matrix nye rader

| Ny EV | Spor | Kilde | Score | Siterbarhet | Status |
|---|---|---|---|---|---|
| EV-A-022 | A-feed, self-sufficiency | SRC-A-018 NIBIO | 5 | Høy | OK med metodeforbehold |
| EV-B-025 | B-sidestream | SRC-B-032 Matvett/NORSUS | 5 | Høy | OK |
| EV-B-026 | B-sidestream | SRC-B-033 Naturvardsverket/IVL | 5 | Høy | OK |
| EV-C-026 | C-adoption, food_waste_law | SRC-C-031 LOV-2025-06-20-103 | 5 | Høy | OK etter korreksjon |
| EV-C-027 | C-adoption, climate | SRC-C-029 Klimaaftalen 2024 | 5 | Høy | OK med locator-arbeid pågående |
| EV-C-028 | C-adoption, climate | SRC-C-030 Riksrevisionen 2025 | 5 | Høy | OK med 68 pct-validering pågående |

Konsistens-sjekk:
- Alle nye EV-rader har tilsvarende STC-rad som bruker den. OK.
- Alle nye EV-rader peker til distinkte SRC-IDer som ikke kolliderer med eksisterende SRC. OK.
- Korreksjon notert: EV-C-026 ble korrigert fra "desember 2024 matkastelov" til "LOV-2025-06-20-103 matsvinnlov" med riktig kildereferanse. Korreksjonen er sporbar i STC-015 notes-felt.

### UI-endringer i ForsyningskjedeContent.tsx

| Endring | Linjekontekst | Effekt | Status |
|---|---|---|---|
| `Leveranser` → `Leveranser (NO)` | DataQualityStrip | Eksplisitt NO-scope i kvalitetsbadge | live |
| Detail-tekst | DataQualityStrip | "Skal ikke generaliseres til SE/DK/FI/IS" | live |
| `Primærflyt` → `Primærflyt (Norge)` | SectionHeader | Eksplisitt NO-scope i seksjonsoverskrift | live |
| Card description | Primærleveranser-kort | "Tabellen har ikke ekvivalente serier for SE/DK/FI/IS og skal ikke leses som nordisk paritet" | live |

Lint-status: passerer (`npm run lint` med `--quiet` returnerer ingen issues).

Overclaim-guard-verifikasjon: PCQ-FS-NO-002 sin krav om visible NO-only marking er oppfylt på tre lag (badge, section, card). Brukere kan ikke lenger lese DeliveryVolume som nordisk lag uten å se eksplisitt NO-merking.

### data-quality-baseline

Strukturell sjekk: 33 datarader inkludert 18 rescoring-rader (B-016 til B-033) for SE/DK/FI/IS dekning av sjømat, primary_delivery, infrastructure og circularity.

Verdivurdering: Baseline reflekterer faktisk filtilstand og PCQ-aggregering. Ingen rader markert som validert som faktisk er uvalidert.

### Worker D Bølge 1 acceptance gate

Handoff `docs/project/mandates/analysefabrikk-handoffs/2026-05-15-worker-d-wave1-a4-g3-b12.md` definerer eksplisitt "done means..." per gap.

- A4 acceptance: krever anleggsregister + DK/SE produksjon + virkemiddelhistorikk + klimakort. Verifisert som ikke levert; gap er korrekt fortsatt `initial-card`.
- G3 acceptance: krever låst formel + scenario + metodenote + Engrosforbruk. EV-A-022 er nå opprettet med cell_locator (AB5/AB6) — første artefakt er på plass.
- B12 acceptance: krever låst serie + kontroll-avstemming + metodenote + patch til gap-card. ACT-002 og ACT-011 outputs eksisterer; B12 er nærmest lukking.

## Identifiserte avvik og flagg

### Mindre

1. **STC-028** (Salling Group): primærkildehentings-arbeid er ikke startet. Status `backlog_candidate` er korrekt, men gap-cardet bør markeres eksplisitt som blocker for nordisk butikkmatsvinn-benchmark.
2. **STC-024** subclaim split per substrat er fortsatt pending. Locator er låst til EV-B-006 generelt; effektive subclaims (matavfall, HORECA, husdyrgjødsel, slam) krever separate STC-rader.
3. **STC-016 og STC-017** har section_heading-locator til EV-C-027/028 men trenger eksakte primaerkilde-locator (Klimaministeriet-tekst, Riksrevisionens rapportside) før KI-bruk.

### Ingen kritiske

Ingen overclaim-risiko identifisert blant promoterte rader. UI-overclaim-guard er live. Ingen rader er promotert til `cite_directly` uten ekte primaerkilde-locator.

## Anbefalt promoteringsstatus etter QA

| Artefakt | Nåværende | Anbefalt etter QA |
|---|---|---|
| EV-A-022 til EV-C-028 (6 nye) | nyopprettet | promotert; kan brukes i analyse |
| STC-001 til STC-027 (untatt STC-024) | staged_analysis | promotert til allowed-for-answer med ki_usage_rule respekt |
| STC-028 | backlog_candidate | beholdes; flagg som blocker for CL-B-020 |
| ACT-004 UI methodnote | promoted_ui | promotert; PCQ-FS-NO-002 kan lukkes |
| ACT-002 og ACT-011 (B12) | method_note_created + panel_created | promotert til staged_analysis; B12 gap-card kan patches |
| Worker D wave1 acceptance gate | levert | promotert som referansedokument |

## Stop-regler holdt denne sesjonen

- Ingen ny bred kildejakt startet uten gap-ID og akseptansegate.
- Ingen UI-promotering uten synlig kvalitetsstatus (ACT-004 har eksplisitt NO-merking).
- Ingen KI-claim løftet uten source-to-claim-kjede (28/29 har locator + EV; STC-028 ekskludert via `background_only`).
- Ingen proxy presentert som observert fakta (STC-020 har eksplisitt `proxy_model` + `warn_user`).
- Ingen "Validert eksternt"-merking uten faktisk ekstern respons.
- Ingen Perplexity-/arbeidsnotater brukt som siterbar evidens.
- Ingen "nordisk" presentert som harmonisert (B-032/033 i baseline markerer overclaim-blockere eksplisitt).

## Neste handling for QA

1. Verifiser at ACT-009 (A4) og ACT-010 (G3) ikke promoteres til `staged_analysis` før artefakter fra Worker D acceptance gate er levert.
2. Spot-sjekk Codex-workers som leverer STC-024 subclaim split — sørg for at hver substrat-subclaim har egen sikkerhets-/regulatorisk-locator.
3. Følg opp STC-028 Salling Group: hente primaerkilde eller markere som permanent backlog hvis ikke tilgjengelig.
4. Verifiser at B12 gap-card patches innen denne uken med pekere til ACT-002 og ACT-011.

## Bekreftelse

Datakvalitetsskjema, gates og worker-spor fra `RESEARCH-PROSESSER-DATAKVALITET-2026-05-15.md` er operativt fulgt i denne sesjonens leveranser. Ingen kritiske avvik som krever stopp av canonical integrering. QA godkjenner promoteringen som listet i tabellen over.
