# R12-TRUE-004 - Nexus-rapporten, anbefalingstall og SOIL-score

**Dato:** 2026-06-24  
**Status:** Batch 10 output - source card, ikke claim  
**Gate:** PCQ  
**Beslutning:** enrich

## Kort dom

Nexus-rapporten er IPBES `Thematic Assessment Report on the Interlinkages among Biodiversity, Water, Food and Health`, med full rapport og SPM pa Zenodo/DOI. Tallsporet bor korrigeres: sterkeste primar-/policykort sier `71 response options`, ikke et trygt claim om `70 anbefalinger`. `SOIL-score` ble ikke funnet som IPBES Nexus-indikator i denne batchen; det ma parkeres som ASR-/motehypotese til konkret lokator finnes.

## Sterkeste kilde

IPBES Nexus Assessment citation/DOI-side for full rapport og Summary for Policymakers, samt EU Knowledge4Policy-kort som oppsummerer key messages og 71 response options.

Lokatorer:

- `https://ict.ipbes.net/ipbes-ict-guide/data-and-knowledge-management/citations-of-ipbes-assessments/nexus-assessment`
- `https://doi.org/10.5281/zenodo.13850054`
- `https://doi.org/10.5281/zenodo.13850289`
- `https://knowledge4policy.ec.europa.eu/publication/ipbes-thematic-assessment-report-interlinkages-among-biodiversity-water-food-health_en`
- `https://www.unep-wcmc.org/en/news/ipbes-nexus-assessment`

## Funn-tabell

| Kontrollpunkt | Kilde | Ar | Lokator | Kildeklasse | Status | Caveat |
|---|---|---:|---|---|---|---|
| Full Nexus Assessment | IPBES citation guide / Zenodo DOI | 2024 | DOI `10.5281/zenodo.13850054` | A | Verifisert rapportidentitet | Bruk presis tittel, ikke bare "Nexus-rapporten". |
| Summary for Policymakers | IPBES citation guide / Zenodo DOI | 2024 | DOI `10.5281/zenodo.13850289` | A | Verifisert SPM | SPM er bedre for policykort; kapittel kreves for detaljclaim. |
| Food systems options | IPBES chapter 5.3 | 2024 | DOI `10.5281/zenodo.13850331` | A | Relevant kapittel for matsystemsporet | Ma PCQ-leses for konkrete tiltak. |
| Response-option count | EU Knowledge4Policy / IPBES-derived SPM summary | 2024 | K4P key messages | A/B | `71 response options` er sterkeste kontrollerte tall | Ikke kall dette 70 anbefalinger uten presis sekundarkilde/caveat. |
| UNEP-WCMC title says 70 responses | UNEP-WCMC news | 2024 | UNEP-WCMC article | B | Forklarer mulig mote-/ASR-tall | Tittel/sekundarsak er ikke sterkere enn IPBES/SPM. |
| SOIL-score | Ikke funnet i IPBES-lokatorene kontrollert her | 2026 batch | ingen primarlocator | C | Parkert | Kan vaere internt scoreforslag, Soil Association, soil health score eller annet spor. |

## Tomme celler

- Presis side/figur/tabell i IPBES SPM for `71 response options`.
- Dokumentert kilde som bruker `70 anbefalinger` som anbefalingstall, ikke journalistisk avrunding.
- Primar kilde for `SOIL-score` med definisjon, skala, indikatorer og eier.
- Norsk anvendelse: hvilke response options er relevante for Food TG og hvilken gate hver ma gjennom.

## Ikke si

- Ikke si at IPBES gir `70 anbefalinger` som presist primartall nar kontrollert kilde sier `71 response options`.
- Ikke oversett `response options` til vedtatte anbefalinger eller norske policykrav.
- Ikke si `SOIL-score` er fra Nexus-rapporten uten lokator.
- Ikke bruk Nexus som bevis for norsk matsystemeffekt uten egen PCQ.
- Ikke gjore nexus-tilnarming til en total-score som skjuler trade-offs.

## Anbefalt gate

PCQ. Importer Nexus som source card og korriger tallsporet til `71 response options` med caveat. Parker `SOIL-score` til konkret primarlocator finnes.
