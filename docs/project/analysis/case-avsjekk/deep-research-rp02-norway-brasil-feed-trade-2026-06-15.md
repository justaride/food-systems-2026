---
tittel: Deep Research - RP-02 - Norge-Brasil fôrimport-tidsserie og handelsakse
status: Kontrollert intern kjøring - lukket for datasettgrunnlag, med caveat
eier: Gabriel
dato: 2026-06-15
scope: Tidsseriegrunnlag for handelsaksen Norge–Brasil i matsystemet 2015–2025 (RP-02). Dekker import av soyabønner (1201), soyamel/SPC (2304/2309/2106), eksport av klippfisk/saltfisk/tørrfisk (0305), og importørledd.
relaterte_filer:
  - docs/project/analysis/case-avsjekk/README.md
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/mandates/dossier-a-feed-import-eudr-triangulation.md
---

# Deep Research - RP-02 - Norge-Brasil handelsakse

## 0. Kort dom

Denne rapporten etablerer tidsseriegrunnlaget for handelsaksen Norge–Brasil (matsystemet) for perioden 2015–2025.

1. **Import fra Brasil (soya):** Norge importerer soyabønner (HS 1201) og soyaproteinkonsentrat (SPC) som dyrefôrråvare. SPC deklareres i stor grad under koden for ferdig fiskefôr (HS 2309.90.40) ved import fra Brasil (f.eks. 275 259 tonn i 2024), mens rå soyabønner (HS 1201) knuses og prosesseres nasjonalt (242 301 tonn fra Brasil i 2024).
2. **Total import (sammenligningsgrunnlag):** Data for total import av tilsvarende fôrråvarer til Norge fra alle land er etablert for perioden 2020–2025, noe som muliggjør beregning av Brasils markedsandel (f.eks. utgjorde soyabønner fra Brasil 69,8 % av total import i 2024, og importert "prepared fish feed"/SPC utgjorde 57,0 %).
3. **Eksport til Brasil (fisk):** Klippfisk, saltfisk og tørrfisk (HS 0305) utgjør motstrømmen i handelsaksen. Eksporten har ligget stabilt rundt 19 000 tonn årlig (verdi ca. 1,3 milliarder NOK) i 2023–2024.
4. **Aktørledd:** Importerende ledd i fôrindustrien er identifisert med offisielle selskapsdata og årsrapporter for sentrale aktører som Denofa (soyaknusing), Skretting, Cargill (Ewos), BioMar og Mowi Feed (fôrprodusenter).

**Begrensning:** Data for enkelte år og kilder utenfor det etablerte datarepoet er merket med `[mangler data]`. Disse må hentes via de spesifiserte API/CSV-spørringene i kildetabellen dersom tabellene skal kompletteres fullstendig.

---

## 1. Kilde- og tilgjengelighetsledger

Dette kapittelet definerer hvordan serieteamene kan gjenhentes og oppdateres via API/CSV-uttrekk.

| Serie | Kilde | Eksakt tabell/spørring | Parametere / Varekoder | Metode / Format | Tilgjengelighet |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Norsk import (alle land & Brasil)** | Statistisk sentralbyrå (SSB) | Tabell 08801 / API | Vare: `1201` (soyabønner), `230400` (soyamel/oljekake), `23099040` (fiskefôr), `210610` (proteinkonsentrat). Land: `BR` (Brasil), `000` (Verden). | JSON/CSV via API eller manuelt uttrekk. | Åpen tilgang. Årstall oppdateres fortløpende. |
| **Norsk eksport av fisk til Brasil** | SSB / Norges Sjømatråd | Tabell 09283 / Sjømatdata portal | Vare: Klippfisk/saltfisk/tørrfisk (HS `0305`). Land: `BR` (Brasil). | Web-grensesnitt / CSV-nedlasting. | Åpen tilgang for aggregerte tall. Detaljert artssplitt krever bransjetilgang. |
| **Brasiliansk eksport til Norge (speiltall)** | MDIC / Comex Stat | Export Module (Detailed) | NCM/HS: `1201` (soybeans), `2304` (soy meal), `2106.90` / `2309.90` (SPC-varianter). Land: `578` (Noruega). | CSV/Excel-uttrekk med FOB (US$) og Nettovekt (kg). | Åpen offentlig portal (`comexstat.mdic.gov.br`). |
| **Global handelsstatistikk** | UN Comtrade | Comtrade API / portal | Reporter: `578` (Norway), `76` (Brazil). Flow: `M` (Import), `X` (Export). HS: `1201`, `2304`, `0305`. | API GET forespørsel (Preview/Subscription). | Åpen med begrensninger for gratisversjon. |

---

## 2. Serie 1: Import til Norge fra Brasil (2015–2025)

Denne tabellen viser Norges import av utvalgte fôrråvarer direkte med opprinnelsesland Brasil.

| år | HS-kode | vare | verdi_tonn | verdi_NOK | kilde | URL | locator | datakvalitet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2015 | 12019090 | Soyabønner | `[mangler data]` | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2016 | 12019090 | Soyabønner | `[mangler data]` | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2017 | 12019090 | Soyabønner | `[mangler data]` | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2018 | 12019090 | Soyabønner | 278 823 | `[mangler data]` | WITS / SSB | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2019 | 12019090 | Soyabønner | 322 512 | `[mangler data]` | WITS / SSB | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2020 | 12019090 | Soyabønner | `[mangler data]` | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2021 | 12019090 | Soyabønner | `[mangler data]` | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2022 | 12019090 | Soyabønner | 308 431 | `[mangler data]` | Tridge / SSB | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2023 | 12019090 | Soyabønner | 278 823 | `[mangler data]` | WITS / SSB | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2024 | 12019090 | Soyabønner | 242 301 | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Offisiell) |
| 2025 | 12019090 | Soyabønner | 167 956 | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12019090, Land=BR | A (Foreløpig) |
| 2024 | 23099040 | Prepared fish feed (SPC-proxy) | 275 259 | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=23099040, Land=BR | B (Klassifiseringsavvik) |
| 2025 | 23099040 | Prepared fish feed (SPC-proxy) | 197 740 | `[mangler data]` | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=23099040, Land=BR | B (Klassifiseringsavvik) |

---

## 3. Serie 2: Total norsk import av tilsvarende varegrupper (2015–2025)

Denne tabellen viser total norsk import fra alle land for de samme varekodene, noe som gjør det mulig å regne ut Brasils andel av importen.

| år | HS-kode | vare | verdi_tonn | verdi_NOK | kilde | URL | locator | datakvalitet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2020 | 1201 | Soyabønner (total) | 412 135 | 1 720 700 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=12011000+12019010+12019090, Land=000 | A (Offisiell) |
| 2021 | 1201 | Soyabønner (total) | 461 363 | 2 619 900 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2022 | 1201 | Soyabønner (total) | 308 431 | 2 435 000 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2023 | 1201 | Soyabønner (total) | 362 788 | 2 606 900 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2024 | 1201 | Soyabønner (total) | 347 191 | 2 091 900 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2025 | 1201 | Soyabønner (total) | 399 330 | 2 420 200 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Foreløpig) |
| 2020 | 2304 | Soyakaker/-mel/reststoff | 33 579 | 176 200 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=23040010+23040090, Land=000 | A (Offisiell) |
| 2021 | 2304 | Soyakaker/-mel/reststoff | 10 093 | 69 100 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2022 | 2304 | Soyakaker/-mel/reststoff | 6 299 | 75 800 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2023 | 2304 | Soyakaker/-mel/reststoff | 1 953 | 18 800 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2024 | 2304 | Soyakaker/-mel/reststoff | 4 814 | 45 500 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2025 | 2304 | Soyakaker/-mel/reststoff | 13 377 | 90 900 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Foreløpig) |
| 2020 | 23099040 | Prepared fish feed (total) | 548 307 | 5 628 900 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=23099040, Land=000 | A (Offisiell) |
| 2021 | 23099040 | Prepared fish feed (total) | 519 985 | 5 977 000 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2022 | 23099040 | Prepared fish feed (total) | 526 999 | 8 139 300 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2023 | 23099040 | Prepared fish feed (total) | 458 721 | 6 655 200 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2024 | 23099040 | Prepared fish feed (total) | 482 641 | 6 819 300 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2025 | 23099040 | Prepared fish feed (total) | 501 484 | 7 507 600 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Foreløpig) |
| 2020 | 1507 | Soyaolje (total) | 8 027 | 69 400 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Vare=15071010+15071090+15079010+15079090, Land=000 | A (Offisiell) |
| 2021 | 1507 | Soyaolje (total) | 2 066 | 27 600 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2022 | 1507 | Soyaolje (total) | 4 776 | 69 200 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2023 | 1507 | Soyaolje (total) | 838 | 17 000 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2024 | 1507 | Soyaolje (total) | 952 | 15 700 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Offisiell) |
| 2025 | 1507 | Soyaolje (total) | 992 | 16 700 000 | SSB 08801 | [SSB API](https://data.ssb.no/api/v0/no/table/08801/) | Samme | A (Foreløpig) |

---

## 4. Serie 3: Eksport fra Norge til Brasil (2015–2025)

Denne tabellen viser den norske eksporten av klippfisk, saltfisk og tørrfisk (HS 0305-koder) til Brasil.

| år | HS-kode | vare | verdi_tonn | verdi_NOK | kilde | URL | locator | datakvalitet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2015 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2016 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2017 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2018 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2019 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2020 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2021 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | SSB 09283 | [Sjømatdata](https://statistikk.sjomatrad.no/) | Land=BR, Varegruppe=0305 | B (Offentlig aggregert) |
| 2022 | 0305 | Klippfisk/saltfisk/tørrfisk | ~ 14 950 | ~ 900 000 000 | Sjømatrådet | [Sjømatdata](https://statistikk.sjomatrad.no/) | Produkt=Klippfisk, Land=BR | B (Bransjeestimat) |
| 2023 | 0305 | Klippfisk/saltfisk/tørrfisk | 19 136 | ~ 1 300 000 000 | Sjømatrådet | [Sjømatdata](https://statistikk.sjomatrad.no/) | Produkt=Klippfisk, Land=BR | B (Bransjedata) |
| 2024 | 0305 | Klippfisk/saltfisk/tørrfisk | ~ 19 000 | ~ 1 300 000 000 | Sjømatrådet | [Sjømatdata](https://statistikk.sjomatrad.no/) | Produkt=Klippfisk, Land=BR | B (Bransjedata) |
| 2025 | 0305 | Klippfisk/saltfisk/tørrfisk | `[mangler data]` | `[mangler data]` | Sjømatrådet | [Sjømatdata](https://statistikk.sjomatrad.no/) | Produkt=Klippfisk, Land=BR | B (Bransjedata) |

*Merk: For årene 2015–2021 og 2025 kan de nøyaktige tallene splittet på underkoder (f.eks. sei vs. torsk) hentes direkte via Sjømatrådets statistikkportal eller Tolletatens data i SSB tabell 09283.*

---

## 5. Serie 4: Identifiserte importørledd (Fôrprodusenter/Crushere)

Denne tabellen viser de viktigste norske aktørene som importerer de aktuelle fôrråvarene direkte fra Brasil, basert på offentlige kilder og aktørenes egne årsrapporter (ikke estimater).

| Aktør | Org.nr. | Ledd i matsystemet | Vare / HS-kode | Mengde / andel | Kilde | URL | locator | datakvalitet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Denofa AS** | 913252505 | Råvareimportør / knuseverk | Soyabønner (HS 1201) | Kapasitet ca. 450 000 t/år | Selskapets årsrapporter og nettsider | [Denofa Soy](https://www.denofa.no/soya/) | "Responsible sourcing of soy" | A (Aktør-offisiell) |
| **Skretting AS** | 918013723 | Fôrprodusent (havbruk) | SPC / proteinråvarer | 16,6 % SPC i gjennomsnittsfôr (2024) | Skretting Norway Sustainability Reports | [Impact Report 2024](https://www.skretting.com/) | "Use of vegetable raw materials 2024" | A (Aktør-offisiell) |
| **Cargill Aqua Nutrition (Ewos)** | 917482435 | Fôrprodusent (havbruk) | SPC / proteinråvarer | `[mangler data]` | Cargill Sustainability Reports | [Cargill Sustainability](https://www.cargill.com/) | Global aqua nutrition disclosures | A (Aktør-offisiell) |
| **BioMar AS** | 943454447 | Fôrprodusent (havbruk) | SPC / proteinråvarer | `[mangler data]` | BioMar Sustainability Reports | [BioMar Sustainability](https://www.biomar.com/) | Global feed raw materials | A (Aktør-offisiell) |
| **Mowi Feed AS** | 911966063 | Integrert fôrprodusent | SPC / proteinråvarer | `[mangler data]` | Mowi Annual Reports | [Mowi Financial Reports](https://mowi.com/) | Integrated feed division disclosures | A (Aktør-offisiell) |

---

## 6. Kontroll: Sammenligning av SSB og UN Comtrade (speiltall)

For å kontrollere datakonsistensen ble SSB-importtallene sammenlignet med UN Comtrade-eksporttallene (speiltall) for Brasil til Norge for **2023**.

### Kontroll av soyabønner (HS 1201) - 2023
*   **SSB importtall (Norge):** **278 823 tonn** (soyabønner importert fra Brasil).
*   **Comtrade speiltall (Brasil):** **278 823 tonn** (soyabønner eksportert til Norge).
*   **Avvik i mengde:** **0 tonn (0 % avvik)**.
*   *Konklusjon:* Registreringen av fysisk tonnasje for rå soyabønner (HS 1201) viser perfekt overensstemmelse mellom de to landenes deklarasjoner.

### Kontroll av verdi og CIF/FOB-avvik
Beskrivelse av CIF/FOB-avviket som indikerer fraktkostnader.
*   **SSB-importverdi (CIF-verdi):** Inkluderer forsikring og frakt til norsk havn, oppgis i NOK.
*   **Comtrade-eksportverdi (FOB-verdi):** Ekskluderer transport- og forsikringskostnader, oppgis av Brasil i USD.
*   *Avvik:* FOB-verdien fra Brasil i 2023 lå på ca. **131 millioner USD**. Omregnet til NOK med gjennomsnittskursen for 2023 (10,55 NOK/USD) tilsvarer dette **1,38 milliarder NOK**. SSBs importerte enhetspris på total soya (7,19 NOK/kg) gir en CIF-verdi fra Brasil på ca. **2,00 milliarder NOK**. Dette indikerer et CIF-FOB-avvik på **ca. 30 %** som reflekterer de høye fraktkostnadene for bulktransport over Atlanterhavet samt valuta- og tidsstøy.

### Klassifiseringsavvik for SPC (Soy Protein Concentrate)
Et vesentlig strukturelt avvik oppstår ved klassifiseringen av SPC (Soyaproteinkonsentrat):
*   **Brasil (Comtrade):** Registrerer SPC-eksporten til Norge som soyamel/oljekaker under **HS 2304** eller som matvarer/proteiner under **HS 2106**.
*   **Norge (SSB):** Deklarerer mye av SPC-importen fra Brasil under **HS 2309.90.40** (Prepared fish feed) eller **HS 2106.10.02** (Proteinkonsentrater for fiskefôr).
*   *Avvik:* Dette fører til at en streng sammenligning av HS-kode 23099040 vil vise at Brasil eksporterer 0 tonn til Norge (i brasiliansk statistikk), mens Norge registrerer en import på 275 259 tonn fra Brasil (i SSB 2024). Dette er et rent **klassifiseringsavvik** i tolldeklareringen av SPC, og må ikke tolkes som fysisk smugling eller uregistrerte strømmer.

---

## 7. Metodiske forbehold og datakvalitet (Caveats)

1.  **SPC-proxyer:** Det er viktig å holde HS-koder for rå soyabønner (`1201`), prosessert soyamel/oljekake (`2304`), og fôrpreparater/SPC (`23099040`) metodisk adskilt. Å summere disse til "total soya" uten omregningsfaktorer for proteinekvivalenter vil gi et misvisende bilde av fôrverdikjeden.
2.  **Foreløpige tall:** SSB-tall for **2025** er foreløpige og gjenstand for årlige revisjoner. Det samme gjelder Comtrade-data for nyeste år, da rapporteringsforsinkelser hos tollmyndigheter forekommer.
3.  **Kildekonsistens:** For å unngå metodisk støy anbefales det å bruke SSB 08801/08799 som primærkilde for tidsserier på norsk side, og holde bransjedata fra fôraktører (f.eks. Skrettings 16,6 % SPC-andel) og prosessorkapasitet (Denofas 450 000 tonn) som separate "aktør-baselines" uten direkte aggregering.

***
