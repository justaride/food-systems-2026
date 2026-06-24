# R12-TRUE-005 - Folkehelse-output for norsk matsystem

**Dato:** 2026-06-24  
**Status:** Batch 10 output - source-shortlist/gap memo, ikke claim  
**Gate:** source-shortlist  
**Beslutning:** enrich

## Kort dom

Norsk folkehelse-output kan kildeankres i FHI sykdomsbyrde/folkehelserapport og Helsedirektoratets `Utviklingen i norsk kosthold 2025`, men dette er ikke et ferdig true-cost-regnskap. Det trygge funnet er at kostholdsfaktorer, BMI, blodtrykk og blodsukker er forebyggbare risikofaktorer, og at matforsyning/kostholdsdata viser flere avvik fra kostrad. Det svakeste punktet er attribusjon fra matsystemstruktur til sykdomsbyrde, tilgjengelighet og sosial fordeling.

## Sterkeste kilde

FHI `Sykdomsbyrde i Norge`, FHI temautgave 2026 om folkehelseutfordringer, og Helsedirektoratet `Utviklingen i norsk kosthold 2025`.

Lokatorer:

- `https://www.fhi.no/he/fr/folkehelserapporten/samfunn/sykdomsbyrde/`
- `https://www.fhi.no/he/fr/temautgave-2026-viktigste-folkehelseutfordringene/Del-1-5/del-3---de-store-utfordringenen-for-folkehelsen/`
- `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025`
- `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/pdf-av-rapporten/Rapport_utviklingen_norsk_kosthold_2025.pdf?download=false`
- `https://www.regjeringen.no/no/dokumenter/nou-2025-8/id3118916/?ch=4`

## Funn-tabell

| Outputfelt | Kilde | Ar/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---:|---|---|---|---|
| Forebyggbar sykdomsbyrde og risikofaktorer | FHI sykdomsbyrde | 2023/2025 side | FHI Folkehelserapporten | A | Kostholdsfaktorer og BMI inngar blant store risikofaktorer | Ikke matsystemattribusjon per ledd. |
| Usunt kosthold som folkehelseutfordring | FHI temautgave 2026 | 2026 | FHI del 3 | A | Gir helseutfall/kostrad-kobling | Gir ikke verdikjede- eller prisarsak. |
| Matforsyning/engrosforbruk | Helsedirektoratet/NIBIO/UiO | til og med 2024 | Kosthold 2025 rapport | A | Sterk tidsserie for matmengder pa engrosnivaa | Engrosforbruk er ikke individuelt inntak. |
| SSB kostholdsstatistikk og Norkost 4 i rapport | Helsedirektoratet | 2019-2023 / 2022-23 | Kosthold 2025 PDF | A | Mer detaljert kostholdsgrunnlag | Krever indikatoruttrekk for claim. |
| Sosial ulikhet i kosthold | NOU 2025:8 / FHI-referanser | 2025 | regjeringen.no | A/B | Viser ulikhetsspor etter utdanning | Sekundar syntese; bor PCQ-es mot FHI/undersokelser. |
| Tilgjengelighet/affordability | Ikke lukket i denne batchen | 2026 batch | tom celle | C | Viktig folkehelse-outputfelt | Krever pris-, inntekt-, geografi- og matmiljodata. |

## Tomme celler

- Attribusjonsmodell fra norsk matsystemstruktur til sykdomsbyrde.
- Indikator for sunn mattilgjengelighet per region/inntektsgruppe med kildeklasse A.
- Kobling mellom matvarepris, faktisk kjop/inntak og helseutfall.
- True-cost-beregning for helse i Norge som skiller kostholdsrisiko fra andre risikofaktorer.
- Separat indikator for ultra-prosessering hvis den skal brukes; ikke lukket i denne batchen.

## Ikke si

- Ikke si at matsystemet alene forarsaker sykdomsbyrden som FHI beskriver.
- Ikke bruk engrosforbruk som faktisk individuelt inntak uten metodecaveat.
- Ikke tallfest true-cost for norsk helse uten egen modell.
- Ikke bland kostholdsrad, matforsyning, dagligvaresalg og sykdomsbyrde som samme indikator.
- Ikke skjul sosial fordeling hvis folkehelse-output brukes i figur.

## Anbefalt gate

Source-shortlist. Bruk notatet som helsekildeanker og datagap for fase 2. Neste steg er PCQ-tabell med `indikator`, `ar/periode`, `enhet`, `helseutfall`, `matmiljo/verdikjedeledd`, `source_class`, `gap_type` og `ikke_si_ref`.
