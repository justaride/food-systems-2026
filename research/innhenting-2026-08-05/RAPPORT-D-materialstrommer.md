# RAPPORT — Oppdagelse D: materialstrommer

Sesjon: Innhenting 2026-08-05. Oppdager for hullet **materialstrommer** (§3-tabellen strøket i R2: marint restråstoff, oppdrettsslam, biorest-N/P/K manglet ekstern primærkilde).

## Hentet (6 kilder, staging/ + ekstrakt/innhenting-D-materialstrommer.jsonl)

1. **SINTEF Ocean & Kontali (for FHF), 2024 — Analyse marint restråstoff 2023** (`sintef-marint-restrastoff-2023.pdf`/`.txt`). Åpen rapport.
   - Råstoffgrunnlag 3,2 mill. t; tilgjengelig restråstoff **1 135 000 t** (35 %); utnyttet **1 002 000 t (88 %)**; 133 000 t ikke utnyttet. Sektortabell (Tabell 1-1). Basis: modellert. Restaurerer «~1,1 mill. tonn marint restråstoff».

2. **SINTEF, 2023 — Analyse marint restråstoff 2022** (`sintef-marint-restrastoff-2022.pdf`/`.txt`). Åpen rapport.
   - 2022: **1,13 mill. t** restråstoff fra 3,76 mill. t råstoffgrunnlag; **989 000 t (87 %)** utnyttet. Gir tidsserien og forklarer at det strøkne «1,094 mill. t» ligger i samme størrelsesorden som SINTEFs offisielle tall (metode/år varierer).

3. **NORSUS 2023 (OR.48.23) — Biorest fra marine råstoffer og husdyrgjødsel** (`norsus-biorest-2023.pdf`/`.txt`). Åpen rapport.
   - Gjødselforbruk 2018: N 132 730 t, P 15 610 t (mineral vs husdyr splitt). Biorest produsert **86 000 t tørrstoff** (~70 000 t brukt som biogjødsel). Gjødselpotensial biorest 2022: **N 4 302 t / P 1 177 t** (modellert). Restaurerer biorest-N/P-tall.

4. **Miljødirektoratet / NORWASTE (M-1674), 2020** (`miljodir-norwaste-m1674.pdf`/`.txt`). Åpen rapport.
   - 2018 (SSB): matavfall/våtorganisk innsamlet **201 000 t** (husholdning) + **191 000 t** (næring); ~**370 000 t** kompostert; torvimport **25 000 t**. Basis: målt (SSB) / modellert (kompostestimat).

5. **NIBIO — tema Fiskeslam** (`nibio-fiskeslam.txt`). Sekundær nettside m/ primærreferanser.
   - Oppdrett taper årlig **66 000 t N / 14 000 t P** til sjø (Broch & Ellingsen 2020); oppsamlet fiskeslam = **~2 %** av total (Aas & Åsgard 2017). Basis: modellert.

6. **NIBIO — tema Biorest** (`nibio-biorest.txt`). Sekundær nettside.
   - NPK-forhold i ikke-separert matavfalls-biorest: **14-1-5 til 18-1-9**. Basis: aktoropplysning (typiske verdier).

Kontekst (staget, ingen ren strøm-tonnasje ekstrahert): `stiim-arealbruk-havbruk-2024.pdf` (STIIM — bærekraftig arealbruk havbruk); dens «400 000»-tall er økonomiske/MTB-verdier, ikke slam-tonnasje, derfor ingen finding for å unngå gjetting.

## Køet (OPPDAGET-KØ.jsonl, 3)
- **Nofima Rapport 23/2021 «Slam fra lakseoppdrett»** — access: manual. Brage-verten `nofima.brage.unit.no` er nedlagt (DNS-feil); fulltekst ligger nå på JS-rendret NVA/sikt-portal som curl ikke får. Primærkilde for oppdrettsslam-mengder/N-P — bør hentes manuelt.
- **Broch & Ellingsen 2020** — access: unknown. Underliggende kilde for NIBIOs 66 000/14 000 t; DOI ikke lokalisert.
- **Brod et al. 2017 (Ambio, doi:10.1007/s13280-017-0927-5)** — access: unknown (mulig Springer-paywall). Fagfelle-primærkilde på fiskeslam-gjødseleffekt.

## Disiplin
- Alt i `research/innhenting-2026-08-05/`. Ingen skriving til knowledge/corpus/register/DB.
- Hvert tall har `basis` + `locator`; volumtall har `systemBoundary` (gjennomgående merket «faktisk oppstått/utnyttet», ikke tillatelse/kapasitet).
- Modellert vs målt eksplisitt skilt: SINTEF-volum og biorest-potensial er modellert; SSB avfall/import + gjødselforbruk er målt statistikk; NIBIO-sidene er sekundære med primærreferanser.
