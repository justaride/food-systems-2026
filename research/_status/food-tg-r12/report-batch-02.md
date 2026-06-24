# Food TG R12 Batch 02 report

**Dato:** 2026-06-24  
**Goal:** Execute next controlled Food TG Research OS Runde 12 batch after batch 01.  
**Batch:** `R12-VALUE-001`, `R12-FEED-002`, `R12-WASTE-002`, `R12-FARM-002`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 3 | `R12-VALUE-001`, `R12-FEED-002`, `R12-WASTE-002` |
| park | 1 | `R12-FARM-002` |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-VALUE-001 | SSB/Landbruksdirektoratet gir importanker, men sluttbruk og aktørledd er hull. | SSB 08801 + Landbruksdirektoratet import/markedsrapporter | Varekode er ikke sluttbruk, lager eller aktørledd. | A med B/C-hull | Type C for sluttbruk/aktør/lager; Type A for kodeuttrekk | PCQ | Importer som ledd-profilkandidat med synlige C-felt. |
| R12-FEED-002 | Kraftfôrvolum per dyreslagsgruppe kan kildeankres, akvakultur 2025 er pågående FHF/Nofima. | Landbruksdirektoratet Markedsrapport 2025 + FHF 910401 | Kraftfôr er ikke totalrasjon; per kjøttslag/metode må defineres. | A med B/C-hull | Type A for uttrekk; Type B/C for metode/aktørdata | PCQ | Vent med per-produksjonsclaim; importer kildeankre. |
| R12-WASTE-002 | Slamfeltet har sterke definisjons-/metodekilder, men mangler nasjonal realisert innsamlet-volumserie. | NIBIO Fiskeslam + SINTEF/FHF OppSlam | Modellert utslipp og faktisk innsamling må skilles. | A med Type C-hull | Type C for nasjonal innsamlet tidsserie | PCQ | Importer som datagap/metodekandidat, ikke volumclaim. |
| R12-FARM-002 | Per-kg-margin etter kjøperprisavtale er aktørgate, ikke desk-claim. | TINE/Nortura åpne pris- og vilkårssider | Faktisk margin krever avregning, kontrakt og kostnader. | B/C | Type B | actor-gate | Parker tallclaim; importer AASK/datakrav. |

## Per-target outcome

### R12-VALUE-001 - ENRICH

Output: `research/external/r12/R12-VALUE-001-ledd-profil-import-norge.md`

Verified source anchors:

- SSB 08801 download hub: `https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- Landbruksdirektoratet import note: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/importen-av-jordbruksvarer-oker`
- Landbruksdirektoratet Markedsrapport 2025: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Markedsrapport%202025%20Rapport%202026%202%2003.03.26.pdf`
- NIBIO selvforsyningsgrad/engrosforbruk: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`

Outcome: usable PCQ candidate for an import-ledd profile, but only if the figure keeps C-fields for sluttbruk, actors, storage and vulnerability.

### R12-FEED-002 - ENRICH

Output: `research/external/r12/R12-FEED-002-forimportavhengighet-per-produksjon.md`

Verified source anchors:

- Landbruksdirektoratet Markedsrapport 2025
- FHF 910401 Ressursregnskap for fôrråvarer til laks og regnbueørret 2025: `https://www.fhf.no/prosjekter/prosjektbasen/910401/`
- NIBIO selvforsyningsgrad/engrosforbruk
- Landbruksdirektoratet Bruk av norske fôrressurser: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Utredning%20av%20forbedring%20av%20virkemidler%20med%20sikte%20p%C3%A5%20%C3%B8kt%20produksjon%20og%20bruk%20av%20norsk%20f%C3%B4r.pdf`

Outcome: source anchors are strong, but the prompt is not complete enough for a per-meat-type import-dependency claim. Next step is a controlled extraction table.

### R12-WASTE-002 - ENRICH

Output: `research/external/r12/R12-WASTE-002-oppdrettsslam-massestrom.md`

Verified source anchors:

- NIBIO Fiskeslam: `https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/fiskeslam`
- SINTEF OppSlam: `https://www.sintef.no/en/projects/2025/oppslam-calculation-model-for-emission-and-collection-of-sludge-from-fish-farms-at-sea/`
- FHF SecureFeed 901732: `https://www.fhf.no/prosjekter/prosjektbasen/901732/`
- Miljødirektoratet M-1568: `https://www.miljodirektoratet.no/globalassets/publikasjoner/m1568/m1568.pdf`

Outcome: good datagap result. The useful finding is that a standardized national mass-flow model and comparable collected-volume series are still missing.

### R12-FARM-002 - PARK

Output: `docs/project/mandates/R12-FARM-002-aktorgate-per-kg-margin.md`

Verified source anchors:

- TINE Medlem melkepris: `https://medlem.tine.no/om-oss/om-norsk-melker%C3%A5vare/slik-er-melkeprisen-bygd-opp`
- Nortura gris priser/vilkår: `https://medlem.nortura.no/gris/priser-vilkar/`
- Nortura fjørfe priser/vilkår: `https://medlem.nortura.no/fjorfe/priser-vilkar/`
- Nortura leveringsvilkår: `https://medlem.nortura.no/organisasjon/leveringsvilkaar/`

Outcome: numeric per-kg-margin claim parked. The reusable output is a data requirement brief for actor-gate.

## Stop-regler som ble brukt

- Ledd-profilen ble ikke gjort til figur fordi sluttbruk, lager, aktørledd og sårbarhet er C-felt.
- Fôrimportavhengighet ble ikke gjort per kjøttslag fordi kraftfôrstatistikk ikke er totalrasjon, og akvakultur 2025-data er ikke ferdig levert.
- Oppdrettsslam ble ikke tallfestet som faktisk innsamlet volum fordi åpne kilder peker på metode-/datagap.
- Per-kg-margin ble parkert fordi åpne prisnoteringer ikke er netto margin.
