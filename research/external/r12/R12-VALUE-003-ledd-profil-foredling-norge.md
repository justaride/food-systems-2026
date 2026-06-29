# R12-VALUE-003 - Ledd-profil foredling/prosessering Norge

**Dato:** 2026-06-24  
**Prompt:** Lag ledd-profil for prosessering/foredling: kapasitet, konsentrasjon, importerte råvarer og waste.  
**Gate:** PCQ  
**Status:** Research-underlag. Ingen claims, ingen DB-writes, ingen whitepaper/deck-stemme.

## Kort dom

Foredlingsleddet kan kildeankres gjennom Landbruksdirektoratets sektorvise markedsbalanser, Konkurransetilsynets avgrensninger for leverandør-/grossist-/detaljistledd og aktørenes egne årsrapporter. Det svake punktet er kapasitet og råvareopprinnelse per prosessanlegg: åpne kilder dokumenterer struktur og utvalgte volum, men ikke en komplett, harmonisert kapasitets- eller importert-råvarematrise for norsk foredling.

## Sterkeste kilde

Landbruksdirektoratet, `Markedsrapport 2025`, rapport 2/2026, publisert 2026-02-13 og oppdatert 2026-03-03: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/markedsrapport-2025`

## Svakeste punkt

Konkurransetilsynets marginstudie avgrenser seg til leverandør-, grossist- og detaljistledd og ekskluderer flere oppstrøms- og primærprosesseringselementer. Aktørrapporter kan brukes som primærkilde for egen virksomhet, men er ikke uavhengig komplett markedsstatistikk.

## Funn-tabell

| Indikator / aktør / ledd | Aar/periode | Lokator | Kildeklasse | Verdistatus | Caveat |
|---|---:|---|---|---|---|
| Sektorvise markedsbalanser for korn/kraftfor, melk/meieri, kjott/egg, frukt/gront og RAK | 2025 / rapport 2-2026 | Landbruksdirektoratet Markedsrapport 2025 | A | Realisert marked + prognosefelt | Viser marked/produksjon, ikke anleggskapasitet per foredler. |
| Leverandør-, grossist- og detaljistledd som analyseavgrensning | 2017-2022 / rapport 2024 | Konkurransetilsynet marginstudie del 1 | A | Metode/struktur | Ikke full kartlegging av primærproduksjon, innsatsmarkeder eller primærprosessering. |
| Dagligvaremarkedets konsentrasjon og konkurranseramme | 2025 | Konkurransetilsynet Dagligvarerapport 2025 | A | Strukturindikator | Konsentrasjon er struktur, ikke intensjon eller ulovlighet i seg selv. |
| Meieriaktør / integrert verdikjede | 2025/2026 web | TINE Group | Actor-primary/B | Aktørrapportert struktur | Aktørens egen beskrivelse; ikke uavhengig kapasitetstall. |
| Kjott/egg-foredling og brands | 2025 | Nortura annual report 2025 | Actor-primary/B | Aktørrapportert struktur | Primær for Nortura, men ikke komplett markedskonsentrasjon. |
| Matvare- og merkevareforedling | 2025 | Orkla Annual Report 2025 | Actor-primary/B | Aktørrapportert portefølje/finans | Importerte råvarer og waste per norsk verdikjede er ikke lukket. |
| Kapasitet per anlegg/prosesslinje | Ikke lukket | Ingen samlet offentlig primærserie funnet | C | Datagap | Krever aktørdata, anleggslister, tilsynsdata eller bransjeavklaring. |
| Waste/sidestrøm i foredling | Ikke lukket | Ingen harmonisert offentlig foredlings-waste-serie funnet i batchen | C | Datagap | Må ikke blandes med marint restråstoff eller oppdrettsslam uten definisjonsbro. |

## Tomme celler

- Anleggskapasitet per foredlingsaktør og produktgruppe.
- Importert råvareandel per foredlet vare og per aktør.
- Harmonisert waste/sidestrøm per foredlingsledd.
- Uavhengig markedsandel for flere prosesseringsnisjer uten bruk av aktør-/bransjerapportering.

## Ikke si

- Ikke si at konsentrasjon beviser intensjon.
- Ikke si at aktørrapportert kapasitet er realisert produksjon.
- Ikke si at leverandørledd i KT-marginstudien dekker all primærprosessering.
- Ikke bland råvareimport, ingrediensimport og ferdigvareimport.
- Ikke lag waste-claim for foredling uten egen definisjon og måleenhet.

## Anbefalt gate

`PCQ`. Importer som foredlingsprofil med tydelige C-felt for kapasitet, råvareopprinnelse og waste. Eventuelle tall fra aktørrapporter merkes `actor-primary/B`, ikke uavhengig markedsfasit.

## Kilder hentet

- Landbruksdirektoratet, Markedsrapport 2025: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/markedsrapport-2025`
- Landbruksdirektoratet, Markedsrapport 2025 PDF: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Markedsrapport%202025%20Rapport%202026%202%2003.03.26.pdf`
- Konkurransetilsynet, Dagligvarerapport 2025: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`
- Konkurransetilsynet, Rapport marginstudie del 1: `https://konkurransetilsynet.no/wp-content/uploads/2024/05/Rapport-marginstudie.pdf`
- TINE Group: `https://www.tine.no/english`
- Nortura annual report 2025: `https://www.nortura.no/attachments/Annual-report/Nortura_annual_report_2025.pdf`
- Orkla annual report 2025: `https://www.orkla.com/investors/reports-presentations/2026/orkla-asa-annual-report-2025/`
