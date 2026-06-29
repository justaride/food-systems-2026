# R12-VALUE-004 - Ledd-profil distribusjon Norge

**Dato:** 2026-06-24  
**Prompt:** Lag ledd-profil for distribusjon og grossistledd med aktører, flaskehalser og alternative kanaler.  
**Gate:** PCQ  
**Status:** Research-underlag. Ingen claims, ingen DB-writes, ingen whitepaper/deck-stemme.

## Kort dom

Distribusjonsleddet har sterke strukturkilder: Konkurransetilsynet beskriver et høyt konsentrert dagligvaremarked, Menon kartlegger vertikalt integrerte grossisttjenester, og Doffin/anskaffelser.no kan brukes som offentlig kanal-ledger. Det som ikke er lukket er HORECA-/storhusholdningsandeler, alternativ kanalvolum, avropsdata og lokal produsenttilgang; disse må holdes som B/C-felt eller actor-gate.

## Sterkeste kilde

Konkurransetilsynet, `Dagligvarerapport 2025`, publisert 2026: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`

## Svakeste punkt

Offentlige kilder viser struktur og anskaffelsesinnganger, men ikke komplett faktisk varestrøm gjennom grossist, storhusholdning, horeca, offentlig sektor og direktekanaler. ASKO/HORECA-andeler må fortsatt merkes aktørrapportert eller sekundært hvis ikke uavhengig primærkilde finnes.

## Funn-tabell

| Indikator / aktør / kanal | Aar/periode | Lokator | Kildeklasse | Verdistatus | Caveat |
|---|---:|---|---|---|---|
| Dagligvaremarkedets struktur og største kjeder | 2025 | Konkurransetilsynet Dagligvarerapport 2025 | A | Strukturindikator | Høy konsentrasjon er ikke i seg selv aktørintensjon. |
| Vertikalt integrerte grossister | 2023 rapport | Menon/regjeringen.no grossisttjenester | B/A-adjacent | Struktur / aktørinnrapportert analyse | ASKO/REMA/Coop-andeler i rapporten må ikke gjøres til oppdatert 2026-andel uten ny kilde. |
| Grossist-/detaljistmarginer | 2017-2022 / rapport 2024 | Konkurransetilsynet marginstudie | A | Metode/økonomisk analyse | Avgrenset til dagligvarer gjennom butikk/nett; ikke horeca/offentlig fullprofil. |
| NorgesGruppen/ASKO-distribusjon | 2025 | NorgesGruppen rapportarkiv / årsrapport | Actor-primary/B | Aktørrapportert struktur/finans | Ikke uavhengig markedsandel for alle distribusjonskanaler. |
| Offentlige matkontrakter | 2025-2026 | Doffin + anskaffelser.no statistikk | A | Realiserte kunngjøringer / delvis tildeling | Kunngjøringer er ikke komplett nasjonal leverandørandel uten strukturert uttrekk. |
| Alternative kanaler: REKO, direktesalg, markedshager | 2025-2026 | Batch 04 + Landbruksdirektoratet okologisk rapport | A/B/C | Kanal-/aktørkandidater | Volum, avrop og dekningsgrad er ikke lukket. |
| HORECA/storhusholdningsandeler | Ikke lukket | Ingen uavhengig oppdatert primærserie funnet i batchen | B/C | Datagap | Må ikke gjentas som uavhengig tallclaim. |

## Tomme celler

- Faktisk varevolum gjennom horeca/storhusholdning per grossist.
- Fullt offentlig uttrekk av matkontrakter med verdi, avrop, leverandør og region.
- Direktekanalers andel av total distribusjon.
- Dokumentert flaskehals for nye produsenter som skiller struktur fra nekt/intensjon.

## Ikke si

- Ikke si at ASKO har en bestemt HORECA-andel uten uavhengig oppdatert kilde.
- Ikke bland dagligvare, storhusholdning, horeca og offentlig sektor som samme distribusjonsmarked.
- Ikke si at integrert grossiststruktur beviser ulovlig portvaktadferd.
- Ikke si at Doffin-kunngjøringer alene viser faktisk lokalmatandel.
- Ikke skjul at alternative kanaler har tomme volumceller.

## Anbefalt gate

`PCQ`. Importer som distribusjonsprofil med separate felter for `dagligvare`, `grossist`, `horeca`, `offentlig anskaffelse`, `direktekanal`, `source_class` og `gap_type`.

## Kilder hentet

- Konkurransetilsynet, Dagligvarerapport 2025: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`
- Menon/regjeringen.no, Kartlegging av tilgang til dagligvaregrossisttjenester: `https://www.regjeringen.no/contentassets/8487e2f5db78484cb3af5250416badd3/menon-rapport-kartlegging-av-tilgang-til-dagligvaregrossisttjenester.pdf`
- Konkurransetilsynet, Rapport marginstudie del 1: `https://konkurransetilsynet.no/wp-content/uploads/2024/05/Rapport-marginstudie.pdf`
- NorgesGruppen rapportarkiv: `https://www.norgesgruppen.no/finans/finans-hjem/rapporter/`
- Doffin søk CPV 15897000: `https://www.doffin.no/search?cpvCodesLabel=15897000`
- Anskaffelser.no, kunngjøringer av konkurranser: `https://www.anskaffelser.no/data-statistikk-og-analyse/kunngjoringer-av-konkurranser`
- R12-DIST-002 batchnotat: `research/external/r12/R12-DIST-002-offentlige-matkontrakter-regionalt.md`
