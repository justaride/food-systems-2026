# SSB 08801 — Norge–Brasil handelsuttrekk (soya, soyamel, klippfisk)

**Uttrekksdato:** 2026-06-16
**Kilde:** Statistisk sentralbyrå (SSB), tabell **08801** «Utenrikshandel med varer, etter varenummer (HS) og land 1988–2025», PxWebApi v2-beta, json-stat2.
**Sist oppdatert i SSB:** 2026-05-15 (endelige tall t.o.m. 2023; 2024 revidert mai 2026; **2025 = foreløpige tall**, første publisering jan. 2026, ikke ferdigrevidert).
**Operatør:** automatisk uttrekk via web_fetch mot `https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data`.

---

## 1. Metode / metadatanotat

### Dimensjoner i tabell 08801 (id-rekkefølge, `size`)
`["Varekoder"(13429), "ImpEks"(2), "Land"(262), "ContentsCode"(3), "Tid"(38)]` — **tidsenhet: ÅRLIG** (`timeUnit:"Annual"`, 1988–2025). Ingen måned→år-summering nødvendig.

| Dimensjon | Kode brukt | Betydning |
|---|---|---|
| `ImpEks` | `1` | Import |
| `ImpEks` | `2` | Eksport |
| `Land` | `BR` | Brasil (NB: tabellens landdimensjon bruker 2-bokstavskode `BR`, **ikke** Klass-552 `BRA`) |
| `ContentsCode` | `Verdi` | Verdi i **NOK** (kr, 0 desimaler) |
| `ContentsCode` | `Mengde1` | Mengde 1 = **kg** (M1=kg ifølge varetekst) |
| `ContentsCode` | `Mengde2` | Mengde 2 = supplerende enhet (= «nei»/ingen for disse varene; ikke hentet) |
| `Tid` | `2015`…`2025` | år |

### Varenummer (Varekoder) — kritisk format
Varekoder må oppgis **med gyldighets-årssuffiks** `_ÅÅÅÅ`, ellers returnerer API-et tomt/feil. Koder brukt:

| Flow | Kode | Varetekst (SSB) |
|---|---|---|
| Soya import | **`12019090_2012`** | «Soyabønner, også knuste, ikke til dyrefor og såfrø (2012–)». Bærer ~hele HS 1201-volumet. `12011000` (såfrø) = 0 fra Brasil; `12019010` (til dyrefor) = 0. HS6-aggregat `120190` finnes ikke som spørrbar kode — `12019090` brukt som proxy. |
| Soyamel import | **`23040010_1995`** | «Oljekaker o.a. faste reststoffer etter utvinning av soyaolje, **til dyrefor** (1995–)». Bærer alt Brasil-volum. `23040090` (ikke til dyrefor) = 0 fra Brasil 2024. HS6 = 2304; rapportert via `23040010`. |
| Klippfisk eksport | **`03055121_2012`** | «**Klippfisk av atlanterhavstorsk**, unnt spiselige biprodukter (2012–)». Dominerende bacalhau-kode til Brasil. |

**Bacalhau/HS 0305 — kodevalg-funn:** Norsk bacalhau til Brasil er nær 100 % **klippfisk (tørrsaltet torsk)** = `03055121`. Tørrfisk/stockfish (`03055111/12/13/14`) til Brasil = 0. Saltfisk (`03056200`, «torsk saltet, ikke tørket») hadde 0 til Brasil 2015–2020 og kun 7,81 mill. kr i 2024 (liten hale, **ikke** tatt med i hovedtabellen). De gamle klippfisk-kodene `03055992`/`03055991` var stengt 2016 og hadde 0. **Konklusjon:** `03055121` er riktig kode for bacalhau-eksporten.

### «Total / Verden»
Tabell 08801 har **ingen eksplisitt «alle land»-kode** (`Land=00` gir tomt, i motsetning til SITC-tabell 08809). Verden/total hentes ved å **utelate `Land`-dimensjonen** — den er eliminerbar og summerer da til alle land. Verifisert: soya import 2024 uten Land = 347 143 523 kg = summen som inkluderer Brasil 242 300 715 kg. «World»-kolonnene nedenfor er produsert slik.

### Verktøymerknad (reproduserbarhet)
`/data`-endepunktet returnerer kun innhold via web_fetch når **alle ikke-eliminerbare dimensjoner har gyldige koder** og resultatet er lite. Feil kode → tomt svar (ingen synlig feilmelding). Eksakte koder ble bekreftet mot søstertabell **08809** (samme ImpEks/Land/ContentsCode-konvensjon) og mot Klass-API. URL-lengde i web_fetch-wrapperen er begrenset → maks ~6 år per spørring.

---

## 2. Datatabeller (observert SSB, ingen avledede tall utover Brasil-andel)

Verdi i NOK (kr), mengde i kg. Brasil-andel = Brasil / Verden (uteladt Land).

### Flow 1 — IMPORT soyabønner til Norge, HS `12019090` (strøm: import)

| år | varenummer | strøm | partner | verdi_NOK | mengde_kg | Brasil-andel_verdi_% | Brasil-andel_kg_% | datakvalitet |
|---|---|---|---|---:|---:|---:|---:|---|
| 2015 | 12019090 | import | Brasil | 1 183 706 288 | 322 498 838 | 74,6 | 76,3 | endelig |
| 2016 | 12019090 | import | Brasil | 954 140 171 | 253 851 944 | 59,5 | 60,9 | endelig |
| 2017 | 12019090 | import | Brasil | 1 056 860 477 | 269 155 310 | 61,7 | 62,2 | endelig |
| 2018 | 12019090 | import | Brasil | 1 225 284 611 | 302 719 075 | 78,8 | 77,5 | endelig |
| 2019 | 12019090 | import | Brasil | 1 289 251 394 | 322 511 900 | 79,8 | 79,9 | endelig |
| 2020 | 12019090 | import | Brasil | 1 333 867 030 | 327 622 379 | 77,6 | 79,5 | endelig |
| 2021 | 12019090 | import | Brasil | 1 690 326 985 | 306 341 792 | 64,5 | 66,4 | endelig |
| 2022 | 12019090 | import | Brasil | 1 961 160 891 | 243 970 931 | 80,6 | 79,1 | endelig |
| 2023 | 12019090 | import | Brasil | 1 976 575 331 | 278 823 124 | 75,8 | 76,9 | endelig |
| 2024 | 12019090 | import | Brasil | **1 444 252 388** | **242 300 715** | 69,1 | 69,8 | revidert (mai 2026) |
| 2025 | 12019090 | import | Brasil | 995 812 182 | 167 956 153 | 41,1 | 42,1 | **foreløpig** |
| — | 12019090 | import | Verden | (se under) | | | | |

Verden (alle land), HS 12019090 import: 2015: 1 587 596 547 kr / 422 417 636 kg · 2016: 1 603 604 448 / 417 149 293 · 2017: 1 714 042 192 / 432 828 446 · 2018: 1 555 362 725 / 390 786 245 · 2019: 1 614 669 086 / 403 827 047 · 2020: 1 719 820 755 / 412 000 854 · 2021: 2 619 194 224 / 461 250 620 · 2022: 2 433 604 205 / 308 246 357 · 2023: 2 606 183 303 / 362 698 565 · **2024: 2 091 593 078 / 347 143 523** · 2025: 2 419 966 325 / 399 286 481.

### Flow 2 — IMPORT soyamel/oljekaker til Norge, HS `23040010` (til dyrefor) (strøm: import)

| år | varenummer | strøm | partner | verdi_NOK | mengde_kg | Brasil-andel_verdi_% | Brasil-andel_kg_% | datakvalitet |
|---|---|---|---|---:|---:|---:|---:|---|
| 2015 | 23040010 | import | Brasil | 212 692 351 | 48 031 831 | 76,7 | 79,8 | endelig |
| 2016 | 23040010 | import | Brasil | 144 274 653 | 33 803 236 | 56,1 | 58,0 | endelig |
| 2017 | 23040010 | import | Brasil | 133 475 650 | 31 887 754 | 58,6 | 60,7 | endelig |
| 2018 | 23040010 | import | Brasil | 156 359 870 | 33 554 738 | 62,6 | 63,2 | endelig |
| 2019 | 23040010 | import | Brasil | 98 890 698 | 22 817 229 | 48,8 | 51,8 | endelig |
| 2020 | 23040010 | import | Brasil | 139 001 937 | 28 082 735 | 78,9 | 83,6 | endelig |
| 2021 | 23040010 | import | Brasil | 24 048 639 | 4 653 624 | 34,8 | 46,1 | endelig |
| 2022 | 23040010 | import | Brasil | 20 675 794 | 1 547 820 | 27,3 | 24,6 | endelig |
| 2023 | 23040010 | import | Brasil | 12 271 009 | 1 263 500 | 65,4 | 64,7 | endelig |
| 2024 | 23040010 | import | Brasil | 16 175 814 | 1 820 650 | 35,5 | 37,8 | revidert (mai 2026) |
| 2025 | 23040010 | import | Brasil | 12 274 406 | 1 484 580 | 13,5 | 11,1 | **foreløpig** |

Verden (alle land), HS 23040010 import: 2015: 277 459 234 kr / 60 200 521 kg · 2016: 257 154 691 / 58 277 587 · 2017: 227 656 440 / 52 497 177 · 2018: 249 744 608 / 53 073 781 · 2019: 202 541 753 / 44 076 932 · 2020: 176 137 979 / 33 575 677 · 2021: 69 115 498 / 10 092 793 · 2022: 75 792 253 / 6 298 381 · 2023: 18 765 859 / 1 952 770 · **2024: 45 504 262 / 4 813 074** · 2025: 90 930 155 / 13 376 280.

> Merk: HS 23040090 (oljekaker **ikke** til dyrefor) = 0 fra Brasil i 2024 og er ikke hentet for alle år; HS2304-totalen er derfor i praksis lik `23040010`-serien over (kontroller mot 23040090 ved behov).

### Flow 3 — EKSPORT klippfisk fra Norge, HS `03055121` (bacalhau/klippfisk av atlanterhavstorsk) (strøm: eksport)

| år | varenummer | strøm | partner | verdi_NOK | mengde_kg | Brasil-andel_verdi_% | Brasil-andel_kg_% | datakvalitet |
|---|---|---|---|---:|---:|---:|---:|---|
| 2015 | 03055121 | eksport | Brasil | 455 091 876 | 7 708 205 | 20,3 | 19,4 | endelig |
| 2016 | 03055121 | eksport | Brasil | 333 530 466 | 5 827 021 | 14,9 | 15,5 | endelig |
| 2017 | 03055121 | eksport | Brasil | 530 951 179 | 8 392 458 | 22,0 | 22,4 | endelig |
| 2018 | 03055121 | eksport | Brasil | 465 120 857 | 6 384 670 | 18,2 | 18,1 | endelig |
| 2019 | 03055121 | eksport | Brasil | 438 598 850 | 5 377 962 | 15,2 | 15,4 | endelig |
| 2020 | 03055121 | eksport | Brasil | 258 492 740 | 3 174 286 | 10,7 | 11,0 | endelig |
| 2021 | 03055121 | eksport | Brasil | 275 539 275 | 3 535 668 | 11,4 | 11,4 | endelig |
| 2022 | 03055121 | eksport | Brasil | 305 806 093 | 2 942 700 | 10,2 | 10,2 | endelig |
| 2023 | 03055121 | eksport | Brasil | 475 776 521 | 3 781 775 | 15,1 | 14,5 | endelig |
| 2024 | 03055121 | eksport | Brasil | 377 102 759 | 2 628 550 | 11,8 | 10,8 | revidert (mai 2026) |
| 2025 | 03055121 | eksport | Brasil | 219 302 988 | 1 256 275 | 6,4 | 5,9 | **foreløpig** |

Verden (alle land), HS 03055121 eksport: 2015: 2 237 109 686 kr / 39 817 792 kg · 2016: 2 243 504 272 / 37 576 150 · 2017: 2 414 356 924 / 37 532 683 · 2018: 2 557 940 020 / 35 356 910 · 2019: 2 878 623 141 / 34 968 975 · 2020: 2 418 708 048 / 28 901 851 · 2021: 2 408 835 786 / 30 940 426 · 2022: 2 983 682 712 / 28 841 642 · 2023: 3 145 709 661 / 26 136 370 · **2024: 3 198 647 588 / 24 411 610** · 2025: 3 406 971 652 / 21 225 215.

> Tilleggsfunn: saltfisk `03056200` (torsk, saltet ikke tørket) til Brasil = 0 i 2015–2020, 7 810 453 kr i 2024. Liten hale, holdt utenfor hovedtallet for å unngå dobbelttelling-tvil; kan legges til ved behov.

---

## 3. Kontroll: SSB vs Comtrade/WITS (2024, soyabønner HS 120100/12019090, Norge import fra Brasil)

| Mål | Kilde | 2024-verdi | Avvik mot SSB |
|---|---|---:|---:|
| Mengde (kg) | **SSB 08801** (rapportørside, Norge) | **242 300 715 kg** | — |
| Mengde (kg) | Comtrade/WITS rapportørside (Norge import) | 242 301 000 kg | **−285 kg = −0,0001 %** (praktisk identisk) |
| Mengde (kg) | Brasil speil-eksport til Norge (Comtrade) | 288 513 000 kg | **−16,0 %** (SSB lavere) |
| Verdi | SSB 08801 | 1 444 252 388 **NOK** | — (ikke konvertert) |
| Verdi | Comtrade rapportør | 135 255,59 **tusen USD** (135 255 590 USD) | NOK≠USD, ikke sammenlignbart direkte |

**Tolkning:** SSB-rapportørtallet og Comtrade-rapportørtallet for mengde er identiske (Comtrade Norge-import er avledet av nettopp SSB; 285 kg-avviket er ren avrunding til hele tusen). Det forventede gapet er rapportør-vs-speil: Brasils registrerte eksport til Norge (288,5 mill. kg) ligger ~16 % over Norges registrerte import (242,3 mill. kg) — typisk mønster (FOB-eksport vs CIF-import, transitt/tidsforskyvning, evt. omlasting via tredjeland). SSB bekrefter altså rapportørtallet i den eksisterende rapporten.

---

## 4. Eksakte API-spørringer brukt (siterbare URL-er)

Alle mot `https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data?outputFormat=json-stat2&...`. Brasil = `valueCodes[Land]=BR`; Verden = utelat `Land`. Eksempler (2024-skiver vist; årsbatcher 2015–2020 og 2021–2025 ble kjørt likt):

- Soya import Brasil:
  `...&valueCodes[Varekoder]=12019090_2012&valueCodes[ImpEks]=1&valueCodes[Land]=BR&valueCodes[ContentsCode]=Verdi,Mengde1&valueCodes[Tid]=2021,2022,2023,2024,2025`
- Soya import Verden (Land utelatt):
  `...&valueCodes[Varekoder]=12019090_2012&valueCodes[ImpEks]=1&valueCodes[ContentsCode]=Verdi,Mengde1&valueCodes[Tid]=2021,2022,2023,2024,2025`
- Soyamel import Brasil:
  `...&valueCodes[Varekoder]=23040010_1995&valueCodes[ImpEks]=1&valueCodes[Land]=BR&valueCodes[ContentsCode]=Verdi,Mengde1&valueCodes[Tid]=...`
- Klippfisk eksport Brasil:
  `...&valueCodes[Varekoder]=03055121_2012&valueCodes[ImpEks]=2&valueCodes[Land]=BR&valueCodes[ContentsCode]=Verdi,Mengde1&valueCodes[Tid]=...`
- Kodebekreftelse (søstertabell): `https://data.ssb.no/api/pxwebapi/v2-beta/tables/08809/metadata?lang=en&outputFormat=json-stat2`
- Brasil landkode (Klass): `https://data.ssb.no/api/klass/v1/classifications/552/codes?from=2024-01-01&selectCodes=BR*`

---

## 5. Fortsatt manglende / oppfølging

- **2025-tall er foreløpige** (publisert jan. 2026, revideres mai 2026 og mai 2027). Behandle 2025 som indikativt.
- **HS6-aggregater ikke spørrbare:** 08801 eksponerer ikke `120190`/`2304`/`030551` som egne summekoder. Brukt 8-sifret bærer-kode per flow. Hvis fullstendig HS6-sum ønskes, summer alle aktive 8-sifrede barn per år (krever ett uttrekk per kode pga. årssuffiks-skifter; f.eks. soya bør krysskontrolleres mot `12010000_1988` for år før 2012 — denne uttrekks-serien dekker 2015–2025 der `12019090_2012` er gyldig hele veien).
- **Mengde2 (supplerende enhet)** ikke hentet (= «nei»/ingen for disse varene; irrelevant her).
- **Saltfisk `03056200`** (7,81 mill. kr til Brasil i 2024) og evt. andre 0305-barn er holdt utenfor klippfisk-hovedtallet; legg til hvis «all bacalao incl. saltfisk» ønskes.
- **Soyamel `23040090`** (ikke-fôr) ikke hentet for hele tidsserien (0 fra Brasil 2024); hent ved behov for komplett HS2304.
- **Verdi i NOK, ikke USD** — ingen valutakonvertering gjort. For USD-sammenligning mot Comtrade-verdi trengs årlig NOK/USD-snitt (ikke hentet her).
- **«Verden»-tallet** = sum alle handelspartnere via Land-eliminering; inkluderer reeksport/transitt-land, ikke kun produksjonsland.
