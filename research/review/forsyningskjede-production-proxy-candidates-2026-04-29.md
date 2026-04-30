# Forsyningskjede production proxy candidates

Dato: 2026-04-29

Formål: redusere P0-gapet i produksjonsparitet for DK og IS uten å importere lokale research-tall direkte i canonical core-series.

## Hvorfor denne filen finnes

`production_annual_first_panel.csv` er rent og sporbar, men har ikke full paritet:

- NO/SE/FI har en sammenlignbar havrevolumserie.
- DK har bare en verdi-fallback for kornproduksjon.
- IS har bare en smal biffproduksjonsserie, selv om sjømat er det dominerende produksjonssystemet.

Denne filen samler proxy-kandidater fra lokale verdikjedenotater som skal primærsjekkes før import.

## DK proxykandidater

Sterkeste kandidater:

- Korn totalt 2024: 7,5846 mill. tonn, primærsjekket i StatBank HST77.
- H170 2024: 274 300 tonn `Oats, mixed grains and other grains`, primærsjekket i StatBank HST77.
- Melk fra gård 2024: 5 767,6 mill. kg, primærsjekket i StatBank ANI71.
- Svinproduksjon 2024: 1 726 600 tonn, primærsjekket i StatBank ANI51.
- Poteter 2024: 2 997 600 tonn samlet HST77-proxy, primærsjekket i StatBank HST77.
- Landinger fra danske fartøy 2024: 467 478,631 tonn, primærsjekket i StatBank FISK2.
- Akvakultur 2024: 46 405 tonn, primærsjekket i StatBank AKV11.

Metodegrenser: H170 kan ikke beskrives som ren havre. Potetproxyen er bredere enn konsum. FISK2 er landinger fra danske fartøy, ikke nødvendigvis samme definisjon som nasjonal fangst i andre land.

## IS proxykandidater

Sterkeste kandidater:

- Villfangst sjømat 2024: ca. 994 000 tonn, primærsjekket hos Statistics Iceland.
- Akvakultur 2024: ca. 54 800 tonn, primærsjekket hos Statistics Iceland.
- Foredlingsgrad: ca. 60 % av fisk foredles i Island.
- Melk 2024: 158 139 tonn, primærsjekket i Statistics Iceland PxWeb LAN10103.
- Total kjøttproduksjon 2024: 30 643 tonn, primærsjekket i Statistics Iceland PxWeb LAN10201.
- Tomat/agurk/paprika/salat 2024: 4 232 tonn, primærsjekket som avgrenset grønnsaksproxy i LAN10103.
- Poteter 2024: 5 514 tonn, primærsjekket i LAN10103.
- Korn totalt 2024: 5 939 tonn og havre 140 tonn, primærsjekket i LAN10103 som kontekst.

Prioritet: bygg IS som seafood-first produksjonsproxy. Landbruksdelen kan brukes som supplement, mens havre bare bør brukes som kontekst fordi volumet er for lite til å gi reell paritet med NO/SE/FI.

## Foreløpig metodebeslutning

- Ren havresammenstilling: NO/SE/FI kan vises direkte.
- DK kan legges til bare i en egen proxy-lane eller tydelig merket caveated serie basert på HST77 H170.
- IS bør bygges som seafood-first produksjonsproxy med villfangst og akvakultur, ikke som sammenlignbar havre-/kornserie.
- En nordisk minimumskurv bør derfor skille mellom `direct_commodity_series`, `caveated_proxy_series` og `country_specific_basket`.

## Bruksregel

- Kandidater med `official_primary_snapshot` kan brukes i metodearbeid, men ikke automatisk importeres.
- Kandidater med `local_research` er fortsatt `needs_primary_check`.
- Ingen rad skal inn i `production_annual_first_panel.csv` før kilde, enhet, år, klassifikasjon og metode er sjekket.
- DK/IS skal ikke vises i samme produksjonsgraf som NO/SE/FI havre før proxy-metode er låst.
