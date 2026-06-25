---
tittel: R12-VALUE-001 - Ledd-profil import Norge
status: Batch 02 research-output - ikke claim
id: R12-VALUE-001
priority: P0
theme: value-chain
geo: NO
gate: PCQ
accessedAt: 2026-06-24
sourceClass: A med B/C-hull
---

# R12-VALUE-001 - Ledd-profil import Norge

## Kort dom

Importleddet kan beskrives godt på varekode-, verdi- og mengdenivå gjennom SSB 08801 og på jordbruks-/markedsspråk gjennom Landbruksdirektoratets rapporter. Det sterkeste åpne funnet er at importprofilen må deles i minst tre strømmer: matvarer/jordbruksvarer, fôrråvarer til husdyr og fôrråvarer til akvakultur.

Dette er egnet som PCQ-kandidat for en ledd-profil, men ikke som ferdig figur. SSB gir varekode/opprinnelsesland, mens sluttbruk, aktørledd, lager, kontraktsbinding og sårbarhet per vare ofte ikke er åpent målt.

## Sterkeste kilde

- SSB, "Import og eksport - alle land og varenummer", komplett datasett tilsvarende Statistikkbank-tabell 08801.
- Landbruksdirektoratet, "Importen av jordbruksvarer øker", publisert 2025-02-17, oppdatert 2025-02-24.
- Landbruksdirektoratet, "Markedsrapport 2025", rapport nr. 2/2026, 2026-02-13.
- NIBIO, "Selvforsyningsgrad og engrosforbruk".

## Svakeste punkt

SSB 08801 er sterk for varekode, verdi, mengde og opprinnelsesland, men svak for sluttbruk og aktørledd. Landbruksdirektoratet forklarer marked og importbehov, men noen kategorier, særlig råvarer til fiskefôr og kraftfôr, må fortsatt kobles til tollkoder og sluttbruk før de kan brukes i en visualisering.

## Funn-tabell

| Indikator/strøm | År/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---|---|---|---|
| Total varekodebasert import/eksport etter opprinnelsesland | 1988-2025, 2025 foreløpig | SSB 08801 / nedlastingsfiler | A | Realisert import/verdi/mengde | Varekode er ikke sluttbruk; 2025 er foreløpig. |
| Import av jordbruksvarer til Norge | 2024 | Landbruksdirektoratet nyhet/Omverdenen 2024 | A/B | Realisert importverdi | Rapport/nyhet bruker jordbruksvareomfang, ikke hele matsystemet. |
| Råvarer til fiskefôr som stor importgruppe | 2024 | Landbruksdirektoratet nyhet | A/B | Strukturindikator | Landbruksdirektoratet oppgir verdi og eksempler, men ikke full kode-/aktørsplitt i denne batchen. |
| Korn/matkorn/kraftfôrråvareimport via kvoter | 2024-2026 sesong | Landbruksdirektoratet Markedsrapport 2025 | A | Realisert 2024-2025 og plan/kvote 2025-2026 | Sesong/kornår må ikke blandes med kalenderår. |
| Matforsyningsstatistikkens produksjon + import - eksport = forbruk | 1999-2024 | NIBIO selvforsyningsgrad/engrosforbruk | A | Metodeanker | Omfatter mat til mennesker; fôr- og akvakulturstrømmer må holdes utenfor matforbrukstabellen. |
| Importland/sårbarhetsnode per vare | Ikke ferdig | SSB 08801 + tolltariff + eventuelt aktørdata | C for aktørledd | Datagap | Aktør, kontrakt, lager og omdirigerbarhet er ikke synlig i åpne handelsdata. |

## Tomme celler

- Sluttbruk per HS-kode er ikke direkte synlig i SSB 08801.
- Aktørledd, importør, lagerhold og kontraktsbinding er ikke åpne i SSB-tabellen.
- Fiskefôrråvarer må splittes fra generelle jordbruksvarer før figur.
- Kornår, kalenderår og foreløpige/endelige tall må harmoniseres.
- Sårbarhet per importnode krever metodefelt: konsentrasjon, substituerbarhet, lager, toll/kvote og aktørgate.

## Ikke-si

- Ikke si at SSB varekode beviser sluttbruk i mat, husdyrfôr eller fiskefôr.
- Ikke bland importverdi og importvolum i samme score uten enhet.
- Ikke bruk 2025-tall fra SSB som endelige.
- Ikke gjør importavhengighet til aktørintensjon.
- Ikke lag ledd-visualisering som skjuler C-cellene for aktør, lager og sluttbruk.

## Anbefalt gate

PCQ. Importer som ledd-profil-kandidat med tydelige A-felt for varekode/mengde/verdi og eksplisitte C-felt for sluttbruk, aktørledd, lager og sårbarhet.
