# Food TG R12 Batch 06 report

**Dato:** 2026-06-24  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 06.  
**Batch:** `R12-VALUE-002`, `R12-VALUE-003`, `R12-VALUE-004`, `R12-VALUE-005`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-VALUE-002`, `R12-VALUE-003`, `R12-VALUE-004`, `R12-VALUE-005` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-VALUE-002 | Norsk primærproduksjon har sterke A-kilder for selvforsyning, areal/produksjon og markedsbalanser. | Helsedirektoratet 2025 kap. 4.12, NIBIO og Landbruksdirektoratet Markedsrapport 2025 | Selvforsyning er ikke kapasitet, robusthet eller total innsatsvareavhengighet. | A med B/C-hull | Type A + Type B/C | PCQ | Importer som ledd-profilkandidat med metodefelt og synlige C-celler. |
| R12-VALUE-003 | Foredling kan kildeankres, men komplett kapasitet, importert råvareandel og waste per prosessanlegg er ikke åpent lukket. | Landbruksdirektoratet Markedsrapport 2025 og KT margin/dagligvarerapporter | Aktørrapporter er ikke uavhengig komplett markedsstatistikk. | A med actor-primary/B og C-hull | Type A/B/C | PCQ | Importer foredlingsprofil; hold kapasitet/råvare/waste som eksplisitte B/C-felt. |
| R12-VALUE-004 | Distribusjon har sterke strukturkilder for dagligvare/grossist og offentlige kunngjøringer. | KT Dagligvarerapport 2025 og Menon grossisttjenester | HORECA-andeler, alternativ kanalvolum og avropsdata er ikke lukket. | A med B/C-kanalhull | Type A/B/C | PCQ | Importer distribusjonsprofil; ikke gjør HORECA/offentlig/direktekanaler til volumclaim. |
| R12-VALUE-005 | Nordiske land har gode nasjonale primærkilder, men ikke en harmonisert nordisk leddmatrise. | Luke, Jordbruksverket, Statistics Denmark, Helsedirektoratet/NIBIO | Metoder, scope og enheter varierer. | A-ankre med C-harmoniseringshull | Type A + Type C | source-shortlist | Importer som source-shortlist/datakontraktinput; ingen nordisk rangering. |

## Per-target outcome

### R12-VALUE-002 - ENRICH

Output: `research/external/r12/R12-VALUE-002-ledd-profil-primaerproduksjon-norge.md`

Verified source anchors:

- Helsedirektoratet selvforsyningsgrad 2025: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/matvarer/selvforsyningsgrad`
- NIBIO selvforsyningsgrad/engrosforbruk: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`
- Landbruksdirektoratet Markedsrapport 2025: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/markedsrapport-2025`
- SSB jordbruk: `https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk`

Outcome: Good PCQ candidate for primary-production profile, provided raw/forkorrigert self-sufficiency, production statistics, inputs and vulnerability remain separate.

### R12-VALUE-003 - ENRICH

Output: `research/external/r12/R12-VALUE-003-ledd-profil-foredling-norge.md`

Verified source anchors:

- Landbruksdirektoratet Markedsrapport 2025
- Konkurransetilsynet Dagligvarerapport 2025: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`
- Konkurransetilsynet marginstudie del 1: `https://konkurransetilsynet.no/wp-content/uploads/2024/05/Rapport-marginstudie.pdf`
- TINE, Nortura and Orkla actor-primary annual/profile sources

Outcome: Usable processing-source profile, not a capacity claim. Plant capacity, imported raw-material shares and processing waste remain B/C or actor-gate.

### R12-VALUE-004 - ENRICH

Output: `research/external/r12/R12-VALUE-004-ledd-profil-distribusjon-norge.md`

Verified source anchors:

- Konkurransetilsynet Dagligvarerapport 2025
- Menon/regjeringen.no grossisttjenester: `https://www.regjeringen.no/contentassets/8487e2f5db78484cb3af5250416badd3/menon-rapport-kartlegging-av-tilgang-til-dagligvaregrossisttjenester.pdf`
- Doffin search / Anskaffelser.no statistics
- NorgesGruppen report archive

Outcome: Strong structure profile for distribution/grossist. HORECA shares, public-sector avrop and direct-channel volumes remain visible gaps.

### R12-VALUE-005 - ENRICH

Output: `research/external/r12/R12-VALUE-005-nordisk-ledd-sammenligning.md`

Verified source anchors:

- Luke Finland domestic production/consumption indicator: `https://www.luke.fi/en/statistics/indicators/finlands-cap-impact-indicators/ratio-between-domestic-production-and-consumption`
- Jordbruksverket Jordbruksstatistisk sammanställning 2025
- Statistics Denmark crop production
- Norwegian Helsedirektoratet/NIBIO source anchors

Outcome: Good source-shortlist. Not a Nordic ranking; harmonization is the finding.

## Viktigste mismatches

- `R12-VALUE-002`: Selvforsyningsgrad er ikke beredskapsevne, kapasitet eller innsatsvaresikkerhet.
- `R12-VALUE-003`: Foredlingskapasitet per anlegg er ikke åpent harmonisert.
- `R12-VALUE-004`: Distribusjonsstruktur er ikke det samme som HORECA-/storhusholdningsvolum.
- `R12-VALUE-005`: Nordiske statistikkilder bruker ulike metoder og kan ikke rangeres uten metodebro.

## Stop-regler som ble brukt

- Ingen selvforsyningsindikator ble gjort til robusthetsclaim.
- Aktørrapportert struktur ble ikke gjort til uavhengig markedsandel.
- Kapasitet, plan, potensial og realisert produksjon ble holdt separat.
- Nordisk sammenligning ble holdt som source-shortlist/datakontrakt, ikke ferdig lærings- eller rangeringstabell.
