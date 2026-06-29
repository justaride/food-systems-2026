# Food TG R12 Batch 01 report

**Dato:** 2026-06-24  
**Goal:** Execute Food TG Research OS Runde 12 batch 1 with R2 enrichment discipline.  
**Batch:** `R12-FEED-001`, `R12-DIST-001`, `R12-FARM-001`, `R12-WASTE-001`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 3 | `R12-FEED-001`, `R12-FARM-001`, `R12-WASTE-001` |
| park | 1 | `R12-DIST-001` |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-FEED-001 | SSB 08801 gir primærserie for norsk import fra Mauritania under HS 1504. | SSB 08801 nedlastingsfiler | Råstoffart, Senegal/Gambia/sardinella og sluttbruk er ikke synlig. | A med C-hull | Type C for råstoff/sluttbruk; Type A for tolltarifftekst | PCQ | Smal importformulering kan bli claim-lock-kandidat; arts-/sluttbrukspåstander parkeres. |
| R12-DIST-001 | Struktur kan dokumenteres; 70-prosentclaim kan ikke. | ASKO About us + Konkurransetilsynet-publiserte konkurransemeldinger | Uavhengig oppdatert markedsandel mangler. | B/C for markedsandel | Type A eller B | parkert | Parker tallclaim; bruk struktur kun som forståelse. |
| R12-FARM-001 | BFJ/NIBIO gir primærgrunnlag for N11/bondemargin. | NIBIO/BFJ Totalkalkylen og Referansebruk | Per-produksjonstype skvis krever tabelluttrekk; per-kg-margin krever aktørdata. | A med Type A-uttrekkshull | Type A + Type B | PCQ | Vent med marginclaim; importer kildeankre. |
| R12-WASTE-001 | SINTEF/FHF gir sterk 2024-kilde for marint restråstoff. | SINTEF Analyse marint restråstoff 2024 + FHF prosjekt 901844 | R-stige/Moerman-mapping og kategori-volum krever rapporttabeller. | A med metodecaveat | Type A | PCQ | Importer kildekandidat; hold figur/claim til tabelluttrekk. |

## Per-target outcome

### R12-FEED-001 - ENRICH

Output: `research/external/r12/R12-FEED-001-fiskeoljeimport-mauritania.md`

Verified source:

- SSB 08801 article/download hub: `https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- SSB Statbank table page: `https://www.ssb.no/en/statbank/table/08801`

Outcome: 2020-2025 time series found for `OBLAND=MR`, `IMPEKS=1`, HS `1504*`. The useful claim is narrow: SSB-documented import under HS 1504 from Mauritania. Species/end-use claims remain parked.

### R12-DIST-001 - PARK

Output: `research/external/r12/R12-DIST-001-asko-horeca-andeler.md`

Verified/source-checked URLs:

- ASKO: `https://asko.no/en/about-us/`
- KT-published 2021 filing: `https://konkurransetilsynet.no/wp-content/uploads/2021/06/2021_0374-1-OFF-ASKO-NORGE-AS-og-Konsum-Gruppen-AS.pdf`
- KT-published 2025 filing: `https://konkurransetilsynet.no/wp-content/uploads/2025/01/OFF-ASKO-Norge-AS-Mandarinen-Import-Engros-AS-og-Mandarinen-Oslo-AS.pdf`
- Secondary weak locator: `https://www.horecanytt.no/2012-arkiv-november-2012/tar-opp-kampen-med-asko/283726`

Outcome: ASKO/grossist structure is usable as `forstaelse`, but the 70-prosent markedsandel claim is not independently verified and stays parked.

### R12-FARM-001 - ENRICH, IMPORT VENT

Output: `research/external/r12/R12-FARM-001-n11-bondemargin.md`

Verified source anchors:

- NIBIO BFJ: `https://www.nibio.no/tema/landbruksokonomi/budsjettnemnda-for-jordbruket`
- NIBIO Totalkalkylen: `https://www.nibio.no/tema/landbruksokonomi/totalkalkylen`
- NIBIO 2026 news: `https://www.nibio.no/nyheter/2026/nye-tal-fra-ssb-gav-store-utslag-i-arets-berekningar-for-jordbruksoppgjeret`
- LMD 2026 news: `https://www.regjeringen.no/no/aktuelt/grunnlagsmaterialet-for-jordbruksforhandlingene-er-klart/id3156425/`
- NIBIO Referansebruk service: `https://nibio.no/tjenester/referansebruk?locationfilter=true`

Outcome: Good source anchors for N11. Per-production margin pressure is a next extraction task, not a completed claim.

### R12-WASTE-001 - ENRICH

Output: `research/external/r12/R12-WASTE-001-marint-restrastoff-rstige.md`

Verified sources:

- SINTEF publication page: `https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/`
- FHF project 901844: `https://www.fhf.no/prosjekter/prosjektbasen/901844/`

Outcome: 2024 summary numbers are strong enough for PCQ candidate. R-stige mapping and category-volume extraction remain next step.

## Neste anbefalte batch

1. `R12-FEED-002` - fôrimportavhengighet per kjøttslag og akvakultur.
2. `R12-WASTE-002` - oppdrettsslam massestrøm.
3. `R12-FARM-002` - aktørgate per-kg-margin.
4. `R12-VALUE-001` - ledd-profil import Norge, kan gjenbruke SSB 08801-metoden.

## Stop-regler som ble brukt

- 70-prosent ASKO/HORECA ble parkert fordi sterkeste tallkilde er sekundær, gammel og usikker.
- N11 ble ikke gjort til per-produksjonstype claim fordi referansebrukstabeller må trekkes ut og kontrolleres først.
- Marint restråstoff ble ikke oversatt direkte til R9/Moerman fordi "utnyttet" ikke er lik "høyverdi".
- SSB fiskeoljeimport ble ikke gjort til art/sluttbruk/fiskeri-claim.
