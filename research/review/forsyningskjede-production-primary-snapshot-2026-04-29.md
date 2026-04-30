# Forsyningskjede production primary snapshot

Dato: 2026-04-29

Formål: dokumentere første eksterne primærsjekk av P0-produksjonsproxyer for DK og IS.

## Bekreftet i denne runden

| Land | Proxy | År | Verdi | Primærkilde | Status |
| --- | --- | ---: | ---: | --- | --- |
| DK | Korn totalt | 2024 | 7,5846 mill. tonn | Statistics Denmark StatBank HST77, H100 | `official_primary_snapshot` |
| DK | Havre, blandkorn og andre korn | 2024 | 274 300 tonn | Statistics Denmark StatBank HST77, H170 | `official_primary_snapshot` |
| DK | Melk fra gård | 2024 | 5 767,6 mill. kg | Statistics Denmark StatBank ANI71 | `official_primary_snapshot` |
| DK | Svin produksjon | 2024 | 1 726 600 tonn | Statistics Denmark StatBank ANI51 | `official_primary_snapshot` |
| DK | Poteter, HST77-kategorier samlet | 2024 | 2 997 600 tonn | Statistics Denmark StatBank HST77 | `official_primary_snapshot` |
| DK | Landinger fra danske fartøy | 2024 | 467 478,631 tonn | Statistics Denmark StatBank FISK2 / Danish Fisheries Agency | `official_primary_snapshot` |
| DK | Akvakultur | 2024 | 46 405 tonn | Statistics Denmark StatBank AKV11 / Danish Fisheries Agency | `official_primary_snapshot` |
| IS | Villfangst sjømat | 2024 | ca. 994 000 tonn | Statistics Iceland, fish catch and value in 2024 | `official_primary_snapshot` |
| IS | Akvakultur | 2024 | ca. 54 800 tonn | Statistics Iceland, aquaculture in 2024 | `official_primary_snapshot` |
| IS | Melk | 2024 | 158 139 tonn | Statistics Iceland PxWeb LAN10103 | `official_primary_snapshot` |
| IS | Kjøtt totalt | 2024 | 30 643 tonn | Statistics Iceland PxWeb LAN10201 | `official_primary_snapshot` |
| IS | Poteter | 2024 | 5 514 tonn | Statistics Iceland PxWeb LAN10103 | `official_primary_snapshot` |
| IS | Tomat/agurk/paprika/salat proxy | 2024 | 4 232 tonn | Statistics Iceland PxWeb LAN10103 | `official_primary_snapshot_with_scope_caveat` |
| IS | Korn totalt | 2024 | 5 939 tonn | Statistics Iceland PxWeb LAN10103 | `official_primary_snapshot` |
| IS | Havre | 2024 | 140 tonn | Statistics Iceland PxWeb LAN10103 | `official_primary_snapshot_context_only` |

## Metodegrense

Dette lukker ikke hele produksjonspariteten.

- DK H170 kan bare brukes som havre-proxy med forbehold, fordi kategorien dekker `Oats, mixed grains and other grains`, ikke ren havre.
- DK minimumskurv har nå primærsnapshot for korn/H170, melk, svin, poteter, landinger fra danske fartøy og akvakultur. Den må fortsatt metodegodkjennes før canonical import.
- DK potetproxyen er bred: den inkluderer settepoteter, poteter til mel og poteter til konsum. Bruk med food-use forbehold.
- DK villfangstproxyen er `landings by Danish vessels`, ikke nødvendigvis samme definisjon som nasjonal fangst/produksjon i andre land.
- IS foredlingsgrad, melk, kjøtt, drivhusgrønnsaker og poteter må fortsatt primærsjekkes.
- IS har nå primærsnapshot for melk, kjøtt, poteter, utvalgte drivhus-/grønnsaksprodukter, korn og havre. Foredlingsgrad må fortsatt sjekkes separat.
- IS havrevolum er dokumentert som kontekst, men er for lite til å gi meningsfull paritet med NO/SE/FI havreserien.
- DK og IS skal fortsatt ikke importeres direkte til `production_annual_first_panel.csv` før endelig proxy-metode er valgt.

## Kilder

- Statistics Denmark: `https://www.dst.dk/en/Statistik/emner/erhvervsliv/landbrug-gartneri-og-skovbrug/vegetabilsk-produktion`
- Statistics Denmark StatBank HST77 table info: `https://api.statbank.dk/v1/tableinfo/HST77?lang=en`
- Statistics Denmark StatBank ANI71 table info: `https://api.statbank.dk/v1/tableinfo/ANI71?lang=en`
- Statistics Denmark StatBank ANI51 table info: `https://api.statbank.dk/v1/tableinfo/ANI51?lang=en`
- Statistics Denmark StatBank FISK2 table info: `https://api.statbank.dk/v1/tableinfo/FISK2?lang=en`
- Statistics Denmark StatBank AKV11 table info: `https://api.statbank.dk/v1/tableinfo/AKV11?lang=en`
- Statistics Iceland fish catch 2024: `https://www.statice.is/publications/news-archive/fisheries/fish-catch-and-value-in-2024/`
- Statistics Iceland aquaculture 2024: `https://statice.is/publications/news-archive/fisheries/aquaculture-in-2024/`
- Statistics Iceland production in agriculture 2024: `https://www.statice.is/publications/news-archive/agriculture/production-in-agriculture-2024/`
- Statistics Iceland meat production 2024: `https://old.statice.is/publications/news-archive/agriculture/meat-production-2024/`
- Statistics Iceland PxWeb LAN10103: `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/landbunadur/landbufe/LAN10103.px`
- Statistics Iceland PxWeb LAN10201: `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/landbunadur/landframleidsla/LAN10201.px`
