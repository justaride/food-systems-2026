# Food TG R13 Batch 12 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 12.
**Batch:** `R13-LAND-001`, `R13-LAND-002`, `R13-LAND-005`, `R13-LAND-003`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-LAND-001`, `R13-LAND-002`, `R13-LAND-005`, `R13-LAND-003` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-LAND-001 | Dagligvarekonsentrasjon har sterke regulatorankre; tverrledds makt er strukturkart. | Konkurransetilsynet Dagligvarerapport 2025 | Grossist-/fôrandeler og tverrsegment HHI mangler. | A regulator/statistikk; B aktørrapport; C systemmetode | Type A uttak; Type B actor-gate; Type C systemmetrikk | PCQ | importer |
| R13-LAND-002 | Vertikal integrasjon kan kartlegges som datert eier-/strukturkart. | Menon/NFD grossisttilgangsrapport | Franchise-/kontraktskontroll og eksakte prosenter mangler. | A rapport/register; B aktørnoter; C kontrollvilkår | Type A Brreg/shareholder; Type B kontrakter; Type C tilgangsnekt | PCQ | importer |
| R13-LAND-005 | Bevegelsesfeltet er kildedatert relasjonsliste, ikke komplett nettverksgraf. | Landbruksdirektoratet Målrettet beiting | Ingen sentral kilde lukker aktiv status og medlemsdekning. | A prosjekt; B organisasjon/event; C full dekning | Type A relasjon; Type B actor-gate; Type C komplett kart | source-shortlist | importer |
| R13-LAND-003 | Helsystem-kart er intern kontrollmodell, ikke faktakilde. | Batchrapporter/decision JSONL | Ingen selvstendig kildeverdi. | Internal only | Type A skjematisering; Type B/C underliggende hull | forstaelse | vent |

## Per-target outcome

### R13-LAND-001 - ENRICH

Output: `research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md`

Outcome: PCQ. Struktur- og konsentrasjonsrader kan kontrolleres videre, men må ikke brukes som intensjons- eller total kontrollclaim.

### R13-LAND-002 - ENRICH

Output: `research/external/r13/R13-LAND-002-vertikal-integrasjon.md`

Outcome: PCQ. Eier-/integrasjonsrader trenger datert prosent- og registerkontroll før claim-lock.

### R13-LAND-005 - ENRICH

Output: `research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md`

Outcome: Source-shortlist. Relasjonsledgeren kan brukes som kildekø, men full aktørgraf krever actor-gate.

### R13-LAND-003 - ENRICH

Output: `research/forstaelse/R13-LAND-003-helsystem-kart.md`

Outcome: Forståelse. Kartet kan styre videre arbeid, men skal ikke importeres som kilde.

## Stop-regler som ble brukt

- Konsentrasjon ble ikke gjort til intensjon.
- Vertikal integrasjon ble ikke gjort til kartell- eller tilgangsnektclaim.
- Nettverksrelasjoner ble ikke gjort til komplett aktiv-statuskart.
- Helsystemkartet ble holdt som intern forståelse, ikke faktastemme.

## Må ikke visualiseres ennå

- `R13-LAND-001`: ingen makt-/HHI-figur uten metode, nevner og tomme celler.
- `R13-LAND-002`: ingen eiergraf uten datert eierprosent og franchisecaveat.
- `R13-LAND-005`: ingen nettverkskart uten relasjonstype, dato og aktiv-statuscaveat.
- `R13-LAND-003`: ingen systemfigur eksternt; dette er forståelsesnotat.
