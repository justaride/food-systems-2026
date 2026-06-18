---
tittel: Kvantitativt verdikjedekart for matsystemet i Norge (RP-01)
dato: 2026-06-15
status: Fullført
eier: Research Subagent
kilder: SSB, NIBIO, Landbruksdirektoratet, Fiskeridirektoratet, NORSUS, Matvett, Matsvinnutvalget (2024)
---

# Kvantitativt verdikjedekart for matsystemet i Norge (RP-01)

Dette dokumentet presenterer et kvantitativt verdikjedekart (MFA - Material Flow Analysis) for matsystemet i Norge, basert på de nyeste tilgjengelige dataene fra offisielle kilder (hovedsakelig 2024, med referanser til 2025/2026). Det er strukturert etter kravene i RP-01-mandatet og klargjort for import i systemets flytmodell.

> [!NOTE]
> De integrerte primærkildene som ligger til grunn for denne rapporten inkluderer:
> - **Selvforsyningsstatistikk:** [NIBIO Engrosforbruk per innbygger 1999-2024.xlsx](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/public/data/food-systems/no/value-chain.json) (ark `Nøkkeltall`, celler AB5/AB6).
> - **Produksjons- og handelsdata:** [trade_volumes_2024.json](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/public/data/food-systems/trade_volumes_2024.json) og [trade-group-imports-annual.csv](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/research/data/nordic/trade-groups/normalized/trade-group-imports-annual.csv).
> - **Matsvinndata:** [2026-04-28-worker-2c-b-matsvinn-tall-virkemidler.md](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-2c-b-matsvinn-tall-virkemidler.md) (NORSUS faktaark 2024 og Matsvinnutvalget NOU 2024:2).
> - **Sjømat restråstoff:** [deep-research-fish-p-fish-1-p-skot-2-2026-06-13.md](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/docs/project/analysis/case-avsjekk/deep-research-fish-p-fish-1-p-skot-2-2026-06-13.md) (basert på SINTEF Ocean/FHF rapport 2025:00517).

---

## 1. Hovedstruktur og nøkkeltall

### 1.1 Nasjonal selvforsyningsgrad
Nasjonale myndigheter definerer og publiserer selvforsyningsgraden gjennom **NIBIO (Norsk institutt for bioøkonomi)**. Den beregnes på energibasis (kalorier) målt som andel av engrosforbruket av matvarer (totalt inkl. fisk).

*   **Selvforsyningsgrad 1 (Uten fôrkorreksjon) - 2024:** **41,3 %**
    *   *Definisjon:* Andelen av matforbruket som er produsert innenlands, uavhengig av hvorvidt dyrene er fôret med importerte innsatsfaktorer.
    *   *Formel:* `(Forbruk - Import) / Forbruk` (energibasis).
*   **Selvforsyningsgrad 2 (Med fôrkorreksjon) - 2024:** **34,9 %**
    *   *Definisjon:* Korrigerer for den andelen av den animalske produksjonen (kjøtt, melk, meieri og egg) som stammer fra importerte fôrråvarer til tradisjonelt landbruk (kraftfôr).
    *   *Formel:* `(Produksjon - Eksport) / Forbruk` (energibasis, med fratrekk for importandel i dyrefôr). *Merk:* Denne fôrkorreksjonen gjelder kun husdyr, og inkluderer ikke import av råvarer til fiskefôr (aquaculture).
    *   *Politisk mål:* Regjeringen har vedtatt et mål om **50 % fôrkorrigert selvforsyningsgrad innen 2030** (Meld. St. 11 (2023–2024)).

### 1.2 Samlet matproduksjon, import og eksport (2024)
Tabellen under gir oversikt over total matproduksjon, import og eksport per hovedkategori i tonn og verdi for 2024.

| Kategori | Produksjon (tonn) | Import (tonn) | Importverdi (NOK) | Eksport (tonn) | Eksportverdi (NOK) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Korn** | 1 183 800 | 682 000 | 2 484 589 041 | Neglisjebart | Neglisjebart |
| **Grønnsaker** | 184 445 | 479 229 (inkl. frukt) | 14 472 642 364 (inkl. frukt) | Neglisjebart | Neglisjebart |
| **Frukt & Bær** | 34 489 | Inkludert over | Inkludert over | Neglisjebart | Neglisjebart |
| **Melk & Meieri** | 1 524 400 | 20 041 (ost) | 2 517 922 679 (total meieri/egg) | Mangler data | Mangler data |
| **Kjøtt (totalt)** | 356 786 | 18 200 | 1 165 388 031 | Mangler data | 1 307 000 000 |
| **Fisk & Sjømat** | 2 800 000 | Mangler data | 5 873 740 066 | 2 800 000 | 175 400 000 000 |
| **Fett & Oljer** | — | Mangler data | 20 192 715 977 | — | — |

*   **Produksjonskommentar korn:** SSB har avviklet den offisielle tabellen for kornavling. Volumet på 1 183 800 tonn er beregnet ut fra et samlet kornareal på 2 802 400 dekar multiplisert med en gjennomsnittlig yield på 420 kg per dekar.
*   **Importkommentar korn:** Den høye kornimporten på 682 000 tonn i 2024 skyldes ekstremværet «Hans» høsten 2023, som ga historisk dårlige avlinger og lav andel mathvete i Norge.
*   **Fisk & Sjømat totalproduksjon:** Består av 1 500 000 tonn villfangst (landinger) og 1 300 000 tonn oppdrett.
*   **Fett & Oljer:** Verdien 20,19 mrd NOK inkluderer tollfrie råvarer importert til fiskefôr (rapsolje etc.) og vegetabilske oljer til næringsmiddelindustrien.

---

## 2. Matsvinn og biprodukter (Reststrømmer)

### 2.1 Spiselig matsvinn per verdikjedeledd
Det totale spiselige matsvinnet i Norge var **407 100 tonn i 2024**, tilsvarende **73,4 kg per innbygger** (en reduksjon på 24 prosent per innbygger siden 2015). Metodikken eies av NORSUS/Matvett, basert på måledata fra Bransjeavtalen og avfallsstatistikk.

*   **Primærproduksjon (Jordbruk):** **93 190 tonn** (2022). Omfatter matsvinn fra høsting/slakting til industri/videresalg. Sjømatindustriens matsvinn is ekskludert.
*   **Foredling/Industri:** **97 000 tonn** totalt (2021). Består av **84 100 tonn** fra matindustrien (excl. sjømat) og **12 900 tonn** fra sjømatindustrien.
*   **Grossist & Distribusjon:** Inngår i felles rapportering for dagligvare/grossist/KBS (totalt 73 500 tonn i 2021). I plattformens datamodell er dagligvare alene anslått til **50 000 tonn** (2023).
*   **Dagligvare (Retail):** **50 000 tonn** (2023).
*   **Servering (HORECA & Offentlig):** **40 000 tonn** totalt. Består av **35 000 tonn** fra privat servering (HORECA 2023) og **5 000 tonn** fra offentlig undervisning/omsorg (2020).
*   **Husholdning:** **215 000 tonn** (2023). Dette utgjør ca. 48 % av det samleden kartlagte matsvinnet.

### 2.2 Avfallsbehandling (Organisk avfall)
Ifølge SSB ble det i 2024 håndtert **746 000 tonn biologisk avfall** (inkluderer kildesortert matavfall, fiskeavfall og annet organisk materiale) ved biologiske behandlingsanlegg i Norge:
1.  **Biogass:** **528 000 tonn (~70,8 %)** gikk til biogassproduksjon (opp fra 471 000 tonn i 2023).
2.  **Kompostering:** **218 000 tonn (~29,2 %)** gikk til kompostering.
3.  **Forbrenning:** Ikke-kildesortert matavfall som ender i restavfallet går til forbrenning med energiutnyttelse (fjernvarme/strøm).
4.  **Deponering:** **0 %**. Deponering av biologisk nedbrytbart avfall har vært forbudt i Norge siden 2009.
5.  **Dyrefôr:** Det foreligger ikke samlede nasjonale tonnasjetall for andelen matavfall som gjenvinnes til dyrefôr, ettersom dette i stor grad skjer i lukkede industrielle looper (f.eks. brødrester til grisefôr).

### 2.3 Marint restråstoff (Sjømat biprodukter)
I 2024 genererte den norske sjømatsektoren **1 094 000 tonn tilgjengelig marint restråstoff** (biprodukter som hoder, lever, rogn, innvoller, skinn og avskjær).
*   **Utnyttet mengde:** **976 000 tonn (89,2 %)**.
*   **Utilisert mengde:** **118 000 tonn (10,8 %)**. Dette er hovedsakelig hvitfisk slo og hoder som kastes på havflåten (sløying om bord på frysetrålere) på grunn av plassmangel.
*   **Førstebehandling av utnyttet restråstoff (Prosentandel av tilgjengelig mengde):**
    *   **Ensilasje (fôr):** **52 %** (tilsvarer `1 094 000 t * 0,52 = 568 880 t`).
    *   **Fersk lakseolje & protein:** **19 %** (tilsvarer `1 094 000 t * 0,19 = 207 860 t`).
    *   **Tradisjonelt fiskemel & olje:** **16 %** (tilsvarer `1 094 000 t * 0,16 = 175 040 t`).
    *   **Humant konsum (tran/oljer/produkter):** Ca. **70 000 tonn**.

---

## 3. Strømtabell for matsystemet (MFA-data)

Denne tabellen viser materialstrømmene i det norske matsystemet klar for databaseimport.

| fra_ledd | til_ledd | materiale/kategori | verdi | enhet | år | geografi | datakvalitet | kildeeier | URL | locator | definisjonsnotat |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| primærproduksjon | prosessering | korn | 1183800 | tonn | 2024 | NO | estimert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Estimert fra kornareal (2,8M dekar) x gjennomsnittlig yield (420 kg/dekar) |
| primærproduksjon | prosessering | melk | 1524400 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Total melkeproduksjon levert to meieri |
| primærproduksjon | prosessering | kjøtt_svin | 128159 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Slaktevekt svin |
| primærproduksjon | prosessering | kjøtt_fjørfe | 120555 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Slaktevekt fjørfe |
| primærproduksjon | prosessering | kjøtt_storfe | 86090 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Slaktevekt storfe |
| primærproduksjon | prosessering | kjøtt_sau_lam | 21598 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Slaktevekt sau og lam |
| primærproduksjon | prosessering | kjøtt_rein | 1301 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Slaktevekt tamrein |
| primærproduksjon | prosessering | grønnsaker | 184445 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Total produksjon av grønnsaker |
| primærproduksjon | prosessering | poteter | 354900 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Total potetproduksjon |
| primærproduksjon | prosessering | frukt_bær | 34489 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `value-chain.json` | Beregnet som sum av frukt (25 576 t) og bær (8 913 t) |
| hav_primær | prosessering | sjømat_villfanget | 1500000 | tonn | 2024 | NO | observert | Fiskeridirektoratet | [fiskeridir.no](https://www.fiskeridir.no) | `value-chain.json` | Landet mengde villfanget fisk |
| hav_primær | prosessering | sjømat_oppdrett | 1300000 | tonn | 2024 | NO | observert | Fiskeridirektoratet | [fiskeridir.no](https://www.fiskeridir.no) | `value-chain.json` | Slaktet mengde oppdrettsfisk |
| utlandet | prosessering | korn | 682000 | tonn | 2024 | NO | observert | Landbruksdirektoratet | [landbruksdirektoratet.no](https://www.landbruksdirektoratet.no) | Årsrapport 2024 | Kornimport totalt |
| utlandet | prosessering | korn | 2484589041 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade-group-imports-annual.csv:L218` | Importverdi for korn og kornvarer (HS 10) |
| utlandet | prosessering | meieri_egg | 2517922679 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade-group-imports-annual.csv:L219` | Importverdi for meierivarer og egg (HS 04) |
| utlandet | prosessering | meieri_ost | 20041 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade_volumes_2024.json` | Importmengde ost |
| utlandet | prosessering | fett_oljer | 20192715977 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade-group-imports-annual.csv:L220` | Importverdi for fett og oljer (HS 15), inkl. fôrråstoff |
| utlandet | prosessering | sjømat | 5873740066 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade-group-imports-annual.csv:L221` | Importverdi for fisk og sjømat (HS 03) |
| utlandet | prosessering | frukt_grønt | 14472642364 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade-group-imports-annual.csv:L222` | Importverdi for frukt og grønnsaker (HS 07 + 08) |
| utlandet | prosessering | frukt_grønt | 479229 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade_volumes_2024.json` | Importmengde frukt og grønnsaker |
| utlandet | prosessering | kjøtt | 1165388031 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade-group-imports-annual.csv:L223` | Importverdi for kjøtt (HS 02) |
| utlandet | prosessering | kjøtt | 18200 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | `trade_volumes_2024.json` | Importmengde kjøtt |
| prosessering | utlandet | sjømat | 2800000 | tonn | 2024 | NO | observert | Sjømatrådet | [seafood.no](https://seafood.no) | `trade_volumes_2024.json` | Eksportmengde sjømat |
| prosessering | utlandet | sjømat | 175400000000 | NOK | 2024 | NO | observert | Sjømatrådet | [seafood.no](https://seafood.no) | `trade_volumes_2024.json` | Eksportverdi sjømat |
| prosessering | utlandet | kjøtt | 1307000000 | NOK | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | Eksporttabell SITC 01 | Eksportverdi kjøtt og kjøttvarer |
| primærproduksjon | avfall | matsvinn_jordbruk | 93190 | tonn | 2022 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 36 | Spiselig matsvinn fra landbrukssektoren |
| sjømat | avfall | matsvinn_sjømat | 12900 | tonn | 2021 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 38 | Spiselig matsvinn fra sjømatforedling |
| prosessering | avfall | matsvinn_industri | 84100 | tonn | 2021 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 39 | Spiselig matsvinn fra matindustrien (excl. sjømat) |
| grossist_retail | avfall | matsvinn_dagligvare_grossist | 73500 | tonn | 2021 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 40 | Samlet matsvinn i grossist, KBS og dagligvare |
| grossist_retail | avfall | matsvinn_dagligvare | 50000 | tonn | 2023 | NO | estimert | NORSUS | [norsus.no](https://norsus.no) | `value-chain.json` | Matsvinn kun i dagligvareleddet |
| horeca | avfall | matsvinn_servering | 15500 | tonn | 2021 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 41 | Spiselig matsvinn i hotell, restaurant, kantine (privat) |
| horeca | avfall | matsvinn_offentlig | 5000 | tonn | 2020 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 42 | Spiselig matsvinn i offentlig undervisning og omsorg |
| husholdning | avfall | matsvinn_husholdning | 216100 | tonn | 2020 | NO | estimert | Matsvinnutvalget | [regjeringen.no](https://www.regjeringen.no/no/dokumenter/nou-2024-2/id3023249/) | s. 44 | Spiselig matsvinn i husholdninger |
| husholdning | avfall | matsvinn_husholdning | 215000 | tonn | 2023 | NO | estimert | NORSUS | [norsus.no](https://norsus.no) | `value-chain.json` | Oppdatert matsvinn i husholdninger |
| avfall | biogass | biologisk_avfall | 528000 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | Tabell 11846 | Biologisk avfall levert til biogassproduksjon |
| avfall | kompost | biologisk_avfall | 218000 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | Tabell 11846 | Biologisk avfall levert til kompostering |
| avfall | deponi | biologisk_avfall | 0 | tonn | 2024 | NO | observert | SSB | [ssb.no](https://www.ssb.no) | Deponiforbud 2009 | Forbudt å deponere biologisk nedbrytbart avfall i Norge |
| sjømat_restråstoff | utlandet_fôr | restråstoff_ensilasje | 568880 | tonn | 2024 | NO | estimert | SINTEF Ocean | [sintef.no](https://www.sintef.no) | Beregnet: 52 % av 1,094M t | Restråstoff ensilert til fôrråvarer |
| sjømat_restråstoff | prosessering | restråstoff_lakseolje_protein | 207860 | tonn | 2024 | NO | estimert | SINTEF Ocean | [sintef.no](https://www.sintef.no) | Beregnet: 19 % av 1,094M t | Fersk lakseolje og protein fra havbruksavskjær |
| sjømat_restråstoff | prosessering | restråstoff_fiskemel_olje | 175040 | tonn | 2024 | NO | estimert | SINTEF Ocean | [sintef.no](https://www.sintef.no) | Beregnet: 16 % av 1,094M t | Tradisjonelt fiskemel og fiskeolje (marmorert råstoff) |
| sjømat_restråstoff | kastet | marint_restråstoff_ikke_utnyttet | 118000 | tonn | 2024 | NO | observert | SINTEF Ocean | [sintef.no](https://www.sintef.no) | Tabell 1 s. 4 | Biprodukter (hovedsakelig slo/hoder) kastet på havflåten |

---

## 4. Mangler data (Datagap)

Følgende celler/data har manglende eller ufullstendige primærdata i offisiell norsk statistikk.

| Varegruppe / Flyt | Type manglende data | Alvorlighetsgrad | Forslag til kilde / register | Tiltaksplan for datainnsamling |
| :--- | :--- | :--- | :--- | :--- |
| **Korn** | Eksportmengde (tonn) | Lav | SSB Tabell 08801 / Landbruksdirektoratet | Antas ubetydelig, men kan bekreftes ved å gjøre et spesifikt uttrekk på HS-kodegruppe 10 i SSB. |
| **Grønnsaker / Frukt** | Eksportmengde (tonn) og verdi | Lav | SSB Tabell 08801 / Opplysningskontoret for frukt og grønt | Norsk eksport er svært lav. Can verifiseres ved tollstatistikk på HS-kapittel 07 og 08. |
| **Meieriprodukter** | Eksportmengde (tonn) for hele kategorien | Medium | SSB Tabell 08801 / TINE SA årsrapporter | TINE har data for eksport av Jarlsberg-ost og andre meierivarer. Komplett tollstatistikk for HS-kapittel 04 må aggregeres. |
| **Kjøtt** | Eksportmengde (tonn) for hele kategorien | Medium | SSB Tabell 08801 / Animalia / Landbruksdirektoratet | Mengde i tonn eksportert kjøtt må aggregeres fra tollstatistikk (HS-kapittel 02). |
| **Sjømat** | Importmengde (tonn) for hele kategorien | Medium | Sjømatrådet / SSB Tabell 08801 | Vi har importverdi (5,87 mrd NOK), som importmengde i tonn må aggregeres fra tollstatistikk på HS-kapittel 03. |
| **Fett & Oljer** | Importmengde (tonn) og eksportdata | Høyt | Toll.no / SSB Tabell 08801 / Fôrprodusenter | Viktig for fôrimport-tidsserier. Mengder må hentes fra tollstatistikk på HS-kapittel 15 (særlig rapsolje og fiskeolje). |
| **Matsvinn** | Andel matavfall som går til dyrefôr (tonn) | Høyt | Landbruksdirektoratet / Miljødirektoratet | NORSUS/Matvett har kvalitative indikasjoner på brødretur til fôr, men det mangler et nasjonalt register for mengde matavfall omklassifisert til fôr. |
| **Matsvinn** | Matavfall i restavfall som går til forbrenning (tonn) | Medium | Miljødirektoratet / Avfall Norge / SSB | Krever regelmessige plukkananalyser av restavfall fra husholdninger og næringsliv for å estimere matavfallsandelen i brennbart avfall. |
| **Matsvinn** | Grossist/distribusjon matsvinn separat (tonn) | Medium | Matvett / NORSUS | Bransjeavtalen aggregerer grossist og dagligvare i noen rapporter. Trenger separat datatilgang fra Matvetts datakilde for å skille grossistene (ASKO, REMA, Coop logistikk). |

---

## 5. Konklusjoner og neste skritt
1.  **Systemgrenser:** Ved sammenligning av matsvinndata må det skilles skarpt mellom *spiselig matsvinn* (Matvett-definisjon) og *totalt matavfall* (EU/Eurostat-definisjon som inkluderer uspiselig restråstoff).
2.  **Sjømat-paradokset:** Norges sjømateksport (2,8 millioner tonn) er over dobbelt så stor som den samlede nasjonale landbruksproduksjonen (korn + kjøtt + melk). Imidlertid er sjømatsektoren sterkt avhengig av importert fôr (fett/oljer og proteinkonsentrater), noe som skaper en sårbarhet som ikke fanges opp av den tradisjonelle landbruksbaserte selvforsyningsgraden.
3.  **Datakvalitetsmerking:** De fleste produksjonstall og verditall for utenrikshandel er klassifisert som `observert` med høy datakvalitet. Sektorspesifikke matsvinntall er klassifisert som `estimert` ettersom de baserer seg på et representativt utvalg av aktører i bransjeavtalen og oppskaleringer.
