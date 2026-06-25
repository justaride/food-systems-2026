# Food TG R13 Batch 07 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 07.
**Batch:** `R13-AKTOR-003`, `R13-AKTOR-004`, `R13-AKTOR-006`, `R13-AKTOR-005`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 2 | `R13-AKTOR-003`, `R13-AKTOR-006` |
| actor-gate | 2 | `R13-AKTOR-004`, `R13-AKTOR-005` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-AKTOR-003 | REKO har ferskt ringtall, men ikke ferske produsent-/kundetall. | REKO Norge 2026 | Produsent/kunde mangler fersk primærkilde. | A/B ring; B/C producer/customer | Type A locator; Type B/C totals | source-shortlist | importer |
| R13-AKTOR-004 | Regenerative praktikere har prosjekt-/nettverkslokatorer, ikke verifisert gårdsregister. | Regenerativt Norge, Regenerativ bonde, NIBIO | Gårdsstatus og målte effekter mangler per aktør. | A/B locators; C complete register | Type B actor; Type C outcomes | actor-gate | aktørspørsmål |
| R13-AKTOR-006 | Brreg gir selskapsstruktur/roller, ikke komplett eierskap/founders. | Brreg Enhetsregisteret + roller-API | Roller er ikke aksjonærer/founders. | A registry; C ownership completion | Type A identity; Type B/C ownership | PCQ | importer |
| R13-AKTOR-005 | Frønettverk har tydelige noder, men nodevis sort-/volumstatus mangler. | KVANN, NordGen, NIBIO, Solhatt | Ikke komplett accession-/sort-/tilgangsregister. | A/B nodes; C full registry | Type A nodes; Type B/C accessions | actor-gate | aktørspørsmål |

## Per-target outcome

### R13-AKTOR-003 - ENRICH

Output: `research/external/r13/R13-AKTOR-003-reko-ringer-tall.md`

Outcome: Source-shortlist. `Over 130` ringer kan brukes som ferskt locator-funn, men produsent-/kundetall må merkes som eldre eller C.

### R13-AKTOR-004 - ACTOR-GATE

Output: `research/_status/R13-AKTOR-004-regenerative-praktikere.md`

Outcome: Actor-gate. Praktikerkart må bygges per gård med egen locator og eventuelle målbare praksisdata.

### R13-AKTOR-006 - ENRICH

Output: `research/external/r13/R13-AKTOR-006-eierskap-founders.md`

Outcome: PCQ. Selskapsidentitet og roller er klare nok til kontrollkø, men ikke til founder-/eierskapsclaim.

### R13-AKTOR-005 - ACTOR-GATE

Output: `research/external/r13/R13-AKTOR-005-fronettverk-genressurs.md`

Outcome: Actor-gate. Nettverkskart kan brukes internt, men sort-/aksessjonsstatus krever nodevis kontroll.

## Stop-regler som ble brukt

- Eldre REKO-tall ble ikke gjort til 2026-status.
- Selvbeskrevet regenerativ praksis ble ikke gjort til verifisert effekt.
- Brreg-roller ble ikke gjort til eiere/founders.
- Seed Vault, genbank og frøleverandør ble holdt som ulike roller.

## Må ikke visualiseres ennå

- `R13-AKTOR-003`: ingen REKO-trend eller nasjonal total uten år og kildeklasse.
- `R13-AKTOR-004`: ingen praktikerkart som later som dekningen er komplett/verifisert.
- `R13-AKTOR-006`: ingen eierskapsgraf uten aksjonærregister og dato.
- `R13-AKTOR-005`: ingen frønettverksatlas uten nodevis norsk kobling og accession-/sortscaveat.
