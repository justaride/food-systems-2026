# R12-VALUE-002 - Ledd-profil primaerproduksjon Norge

**Dato:** 2026-06-24  
**Prompt:** Lag ledd-profil for primaerproduksjon i Norge med produksjon, selvforsyning, innsatsvarer og saarbarhet.  
**Gate:** PCQ  
**Status:** Research-underlag. Ingen claims, ingen DB-writes, ingen whitepaper/deck-stemme.

## Kort dom

Norsk primaerproduksjon kan kildeankres godt for areal, produksjonsstatistikk, markedsbalanser og selvforsyningsmetode gjennom SSB, Helsedirektoratet/NIBIO og Landbruksdirektoratet. Output er likevel ikke klart som robusthets- eller kapasitetsclaim: selvforsyningsgrad er energibasert engrosindikator, kraftfor-korrigering har egen metode, og innsatsvare-/sluttbrukssplitt krever flere kilder eller aktoravklaring.

## Sterkeste kilde

Helsedirektoratet, `Utviklingen i norsk kosthold 2025`, kapittel 4.12 Selvforsyningsgrad, publisert 2025-11-26: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/matvarer/selvforsyningsgrad`

## Svakeste punkt

Kildene beskriver produksjon, marked og selvforsyning fra ulike metodiske vinkler. Det er ikke ett offentlig datasett som samtidig lukker realisert produksjon, innsatsvareimport, faktisk beredskapsevne, regional sårbarhet og aktørkapasitet per produksjonsgren.

## Funn-tabell

| Indikator / ledd | Aar/periode | Lokator | Kildeklasse | Verdistatus | Caveat |
|---|---:|---|---|---|---|
| Selvforsyningsgrad og dekningsgrad | 2024, forelopig | Helsedirektoratet 2025 kap. 4.12 | A | Realisert/statistisk beregnet | Energibasert engrosindikator; ikke direkte beredskapsevne eller produksjonskapasitet. |
| Forkorrigert selvforsyning | 2024, forelopig | Helsedirektoratet 2025 kap. 4.12; NIBIO selvforsyningsgrad/engrosforbruk | A | Metodeberegnet | Ma holdes atskilt fra ra selvforsyningsgrad og dekningsgrad. |
| Korn, kraftfor, melk, kjott, egg, frukt/gront markedsbalanser | 2025 / rapport 2-2026 | Landbruksdirektoratet Markedsrapport 2025 | A | Realisert marked/produksjon med prognosefelt | Markedsrapporten er sektorvis; ikke samlet robusthetsprofil. |
| Jordbruksareal, husdyr, kjottproduksjon, korn/oljevekster | SSB-statistikker, siste tilgjengelige aar varierer | SSB jordbruk/statistikkbank | A | Realisert statistikk | Statistikkene ligger i flere tabeller; siste aar kan vaere forelopig. |
| Okologisk produksjon og direktesalgskanaler | 2025 | Landbruksdirektoratet Produksjon av okologiske jordbruksvarer 2025 | A/B | Realisert og delvis estimert | Noen gront-/direktesalgsfelt bygger pa omsetning/grossistregistrering og estimat, ikke komplett produsenttelling. |
| Innsatsvarer per produksjonsgren | 2024-2025 | Landbruksdirektoratet/NIBIO/SSB som source anchors | A/C | Delvis realisert, delvis hull | Sluttbruk og importavhengighet per produksjon krever metodebro; kraftfor er ikke totalrasjon. |
| Sårbarhet per produksjonsgren | Ikke lukket | Ingen samlet offentlig primærserie funnet i batchen | C | Datagap | Krever operasjonalisering av lager, importinput, sesong, region og substitusjon. |

## Tomme celler

- Offentlig harmonisert matrise for `produksjonsgren x innsatsvareimport x sluttbruk` ble ikke funnet.
- Aktørkapasitet, lager og faktisk beredskapsevne per produksjonsgren er ikke lukket i åpne kilder.
- Regional robusthet kan ikke leses direkte fra nasjonal selvforsyningsgrad.
- Småskala/direktesalg er ikke komplett fanget som produksjonsvolum i ett primærdatasett.

## Ikke si

- Ikke si at selvforsyningsgrad alene er beredskapsevne.
- Ikke bland rå selvforsyningsgrad, dekningsgrad og forkorrigert selvforsyning.
- Ikke si at kraftforstatistikk er total foravhengighet.
- Ikke oversett forelopige 2024/2025-tall til endelige trendclaims.
- Ikke gjør produksjonsvolum til kapasitet eller potensial uten egen kilde.

## Anbefalt gate

`PCQ`. Importer som ledd-profilkandidat med eksplisitte metodefelt: `indicator`, `source_class`, `gap_type`, `value_status`, `unit`, `year`, `geography`, `ikke_si_ref`.

## Kilder hentet

- Helsedirektoratet, selvforsyningsgrad 2025: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/matvarer/selvforsyningsgrad`
- NIBIO, selvforsyningsgrad og engrosforbruk: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`
- Landbruksdirektoratet, Markedsrapport 2025: `https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/markedsrapport-2025`
- Landbruksdirektoratet, Markedsrapport 2025 PDF: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Markedsrapport%202025%20Rapport%202026%202%2003.03.26.pdf`
- SSB, jordbruk oversikt: `https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk`
- SSB, tabell 11506 jordbruksareal etter bruk: `https://www.ssb.no/statbank/table/11506`
- Landbruksdirektoratet, Produksjon av okologiske jordbruksvarer 2025: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Produksjon%20av%20%C3%B8kologiske%20jordbruksvarer%202025%20Rapport%202026%204.pdf`
