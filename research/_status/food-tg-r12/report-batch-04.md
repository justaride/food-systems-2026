# Food TG R12 Batch 04 report

**Dato:** 2026-06-24  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch after batch 03.  
**Batch:** `R12-ACTOR-001`, `R12-VIZ-001`, `R12-WASTE-003`, `R12-ACTOR-002`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-ACTOR-001`, `R12-VIZ-001`, `R12-WASTE-003`, `R12-ACTOR-002` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-ACTOR-001 | Markedshager/småskala grønt kan utvides som kandidatkart, ikke komplett produsentregister. | Markedshager Norge + Småskala Grønt Norge + Landbruksdirektoratet 2026 | Primærlokator, aktiv status og produksjonsdata mangler per produsent. | A/B med Type B-hull | Type B actor; Type A kartuttrekk; Type C medlemsliste | actor-gate | Importer nettverk/regionnoder; krev aktørprimærkilde per produsent. |
| R12-VIZ-001 | Ledd-profilfigur må være evidensmatrise/datakontrakt med synlige C-felt. | Batch 01-03 outputs + SSB/Landbruksdirektoratet/NIBIO-ankre | Data er ikke harmonisert per land/ledd; flere felt er aktør- eller metodegap. | A med C-felt | Type A/B/C blandet | internal | Importer som intern datakontrakt; ingen ekstern figur ennå. |
| R12-WASTE-003 | Sverige har A-anker for SPCR 120-biogödsel og N/P/K-retur; Norden ellers er metodegap. | Avfall Sverige Årsrapport 2024 SPCR 120 | SPCR 120 dekker ikke hele Norden eller alle digestattyper. | A for SE, B/C for øvrig Norden | Type C harmonisert serie | PCQ | Importer Sverige som A-anker og øvrige land som C-felt; ingen rangering. |
| R12-ACTOR-002 | REKO Norge har A-kilde for organisering/autonomi; oppdaterte tall er ikke lukket. | REKO Norge organisasjonsside + Landbruksdirektoratet 2026 | Ingen åpen årsmelding/telling for 2025/2026 ringer, produsenter og kunder. | A for organisering, B/C for tall | Type A/B/C | source-shortlist | Importer organisasjonsanker; parker oppdaterte tallclaims. |

## Per-target outcome

### R12-ACTOR-001 - ENRICH

Output: `research/_status/R12-ACTOR-001-markedshager-og-smaaskala-gront.md`

Verified source anchors:

- Markedshager Norge kart/fylkesinngang: `https://www.markedshage.no/markedshager-i-fylkene/`
- Markedshager Norge kartveileder: `https://www.markedshage.no/skjulte-sider/veileder-kart/`
- Småskala Grønt Norge innmelding: `https://www.markedshage.no/nb/nyheter/2026/06/smaskala-gront-norge-har-apnet-for-innmelding/`
- Statsforvalteren Innlandet småskala grønt: `https://www.statsforvalteren.no/innlandet/landbruk-og-mat/landbruk-og-mat---nyheter/2025/10/satsing-pa-smaskala-gronnsaksproduksjon-og-markedshager-i-innlandet/`
- NLR Grupperåd Markedshage i Gudbrandsdalen: `https://www.nlr.no/nyhetsarkiv/default/2025/grupperad-markedshage-i-gudbrandsdalen`
- Landbruksdirektoratet Produksjon av økologiske jordbruksvarer 2025: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Produksjon%20av%20%C3%B8kologiske%20jordbruksvarer%202025%20Rapport%202026%204.pdf`

Outcome: Good actor-gate candidate map. Network and regional nodes are usable; individual producers remain candidates until primary locator and active status are verified.

### R12-VIZ-001 - ENRICH

Output: `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`

Source anchors:

- `research/external/r12/R12-VALUE-001-ledd-profil-import-norge.md`
- `research/external/r12/R12-FEED-002-forimportavhengighet-per-produksjon.md`
- `research/external/r12/R12-WASTE-001-marint-restrastoff-rstige.md`
- `research/external/r12/R12-WASTE-002-oppdrettsslam-massestrom.md`
- `research/external/r12/R12-RES-001-forkorrigert-selvforsyning-norden.md`
- `research/external/r12/R12-RES-002-beredskapslager-korn-for-gjodsel.md`
- `research/external/r12/R12-DIST-002-offentlige-matkontrakter-regionalt.md`

Outcome: Internal datakontrakt created. Any future figure must carry `source_class`, `gap_type`, `value_status`, `gate` and `ikke_si_ref` per cell.

### R12-WASTE-003 - ENRICH

Output: `research/external/r12/R12-WASTE-003-digestat-naeringsretur-norden.md`

Verified source anchors:

- Avfall Sverige Årsrapport 2024 SPCR 120: `https://www.avfallsverige.se/media/p2akb3gx/a-rsrapport-spcr-120-2024.pdf`
- Avfall Sverige Nyhetsbrev 2/2025: `https://www.avfallsverige.se/media/oxahl5qo/nyhetsbrev-2-2025.pdf`
- Energimyndigheten biogas/rötrest-statistikk: `https://www.energimyndigheten.se/statistik/officiell-energistatistik/tillforsel-och-anvandning/Produktion-av-biogas-och-rotrester/`
- Biogödsel SPCR 120: `https://www.biogodsel.se/certifiering/spcr-120/`

Outcome: Sweden is a strong PCQ anchor. Nordic comparison remains a method/source gap until each country has equivalent definitions and N/P/K return fields.

### R12-ACTOR-002 - ENRICH

Output: `research/external/r12/R12-ACTOR-002-reko-norge-2025-2026.md`

Verified source anchors:

- REKO Norge organisasjonsside: `https://www.rekonorge.no/organisasjon-reko-norge`
- Landbruksdirektoratet Produksjon av økologiske jordbruksvarer 2025: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Produksjon%20av%20%C3%B8kologiske%20jordbruksvarer%202025%20Rapport%202026%204.pdf`
- Norsk Bonde- og Småbrukarlag REKO-ringen: `https://www.smabrukarlaget.no/politikk/mat-og-produksjon/reko-ringen/`

Outcome: Organization/governance anchor is usable. Updated national counts for ringer/producers/customers remain parked until annual report, primary extract or actor confirmation.

## Stop-regler som ble brukt

- Markedshage-kartet ble ikke gjort til komplett nasjonal aktørliste uten primærlokator per produsent.
- Ledd-profil ble ikke gjort til score/radar fordi tomme celler og C-felt må være synlige.
- Svensk digestat/NPK ble ikke gjort til nordisk rangering.
- REKO 2020-tall og sekundære 2025/2026-anslag ble ikke gjort til oppdaterte primærtall.

