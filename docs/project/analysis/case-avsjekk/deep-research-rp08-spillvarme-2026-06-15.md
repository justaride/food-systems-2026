---
tittel: Spillvarme-datapakke og caseledger for romlig flytmodell (RP-08)
dato: 2026-06-15
status: Fullført
eier: Research Subagent
kilder: Green Mountain, WA3RM, Selected Group, Nevel, Green Horizon, Time kommune, Statsforvalteren i Rogaland, Varde Kommune, Polar DC, Sweco
---

# Spillvarme-datapakke og caseledger for romlig flytmodell (RP-08)

Dette dokumentet presenterer spillvarme-datapakken (RP-08) strukturert som en kvantitativ mini-ledger egnet for integrasjon i den romlige flytmodellen. Research og kildeavstemming er utført for de seks definerte anleggene i caseledgeren, med en streng separasjon av energityper og operativ status.

> [!NOTE]
> De integrerte primærkildene som ligger til grunn for denne rapporten inkluderer:
> - **Green Mountain-Hima:** [drr-1206-008-spillvarme-food-production.md](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/research/external/dro-1206/drr-1206-008-spillvarme-food-production.md) (basert på Green Mountain heat reuse og pressemeldinger fra februar 2026).
> - **Regenergy Frövi:** [drr-0906-006-spillvarme-green-mountain-hima.md](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/research/external/dro-0906/drr-0906-006-spillvarme-green-mountain-hima.md) (basert på WA3RM prosjektsider, Nevel referansesider og Selected Group oppdateringer 2024–2025).
> - **Wiig-piloten & Norway 1:** [uttak-03-wiig-einnsyn.md](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/research/external/spor1-uttak-2026-06-12/uttak-03-wiig-einnsyn.md) (basert på pressemeldinger, Holon prosjektsider, Jærbladet, Nemitek og Enova-dokumentasjon).
> - **Kviamarka / Miljøgartneriet:** [time.kommune.no](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/docs/project/analysis/case-avsjekk/avsjekk-05-spillvarme-2026-06-12.md) (referanse til Time-forstudie 2025 og Statsforvalterens innsigelsesbrev 2024).
> - **Varde/Krageris:** [Udkast til § 25-tilladelse Varde Kommune](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/docs/project/analysis/case-avsjekk/avsjekk-05-spillvarme-2026-06-12.md) (basert på Varde Kommunes høringsutkast fra april 2026).
> - **Polar DC DRA02:** [drangedal.kommune.no](file:///Users/gabrielfreeman/Downloads/Antiggravity%2015.06.26%20Food%20Systems%202026/research/external/dro-1206/drr-1206-008-spillvarme-food-production.md) (basert på Sweco kost-nytteanalyse februar 2026).

---

## 1. Kvantitativ mini-ledger for romlig flytmodell

Flytmodellen skiller strengt mellom de ulike typene energikvantum. For at en energistrøm skal kunne tegnes som en *observert strøm* i modellen, kreves det at den klassifiseres som **(a) kontraktsfestet levert varme** fra et anlegg i drift. Planlagte eller prosjekterte mengder klassifiseres som **(b) teknisk potensial**, mens medieomtalte eller feiltolkede tall klassifiseres som **(c) medieomtalt tall uten kildeunderlag**.

### 1.1 Spillvarme-datapakke

| anlegg | land/kommune/sted | varmekilde-node | mottaker-node | energimengde | enhet | a/b/c (type) | temperatur | år/status | kilde | URL | locator | datakvalitet |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Green Mountain–Hima (Fase 1)** | Norge, Tinn kommune, Rjukan | Green Mountain TEL-Rjukan datasenter | Hima Seafood landbasert RAS (ørret) | 1.75 | MW | (a) kontraktsfestet levert varme (kapasitet) | Uoppgitt (lavtemp RAS-krets) | 2025 / Operativ | Green Mountain, Hima Seafood | [greenmountain.no](https://greenmountain.no/why-green-mountain/heat-reuse/) | L119-L142 | observert |
| **Green Mountain–Hima (Fase 2)** | Norge, Tinn kommune, Rjukan | Green Mountain TEL-Rjukan datasenter | Hima Seafood landbasert RAS (ørret) | 8.0 | MW | (b) teknisk potensial (planlagt utvidelse) | Uoppgitt (lavtemp RAS-krets) | 2026 / Utredning | Green Mountain, Hima Seafood | [greenmountain.no](https://greenmountain.no/why-green-mountain/heat-reuse/) | L119-L142 | illustrativ |
| **Regenergy Frövi / Billerud** | Sverige, Lindesberg kommune, Frövi | Billerud Frövi papir- og kartongfabrikk | Frövi Greenery (FoodVentures) drivhus | 35.0 | GWh/år | (a) kontraktsfestet levert varme | Uoppgitt i kilden (tomatdrivhus) | 2024 / Operativ | WA3RM, Selected Group, Nevel | [wa3rm.com](https://wa3rm.com/projects/regenergy-frovi/) | Prosjektside | estimert |
| **Wiig-piloten / Odin** | Norge, Klepp kommune, Orre (Vikvegen) | Green Horizon Odin (DC1) datasenter | Wiig Gartneri veksthus | 4.0 | MW | (b) teknisk potensial (planlagt kapasitet) | 50–70 °C (55 °C i forstudie) | 2023 / Planlagt (forskjøvet/urealisert) | Wiig, Green Horizon, Time kommune | [kommunikasjon.ntb.no](https://kommunikasjon.ntb.no/pressemelding/17973375/et-av-landets-storste-gartneri-gar-sammen-med-nytt-datasenterselskap-for-gjenbruk-av-energi-og-reduksjon-av-c02) | Pressemelding | modellert |
| **Green Horizon Norway 1 (Tor)** | Norge, Hå kommune, Varhaug (Næringsvegen) | Green Horizon Norway 1 datasenter | Integrert drivhus (tak) + nabobedrift (antatt Miljøgartneriet) | 22.0 | GWh/år | (b) teknisk potensial (måltall i design) | >50 °C | 2026 / Planlagt (byggestart 2026, drift 2027) | Green Horizon | [greenhorizon.no](https://greenhorizon.no/resources/press-release/green-horizon-receives-planning-approval-for-norway-1) | Pressemelding og datablad | modellert |
| **Miljøgartneriet–Tine (Kviamarka)** | Norge, Hå kommune, Kviamarka | Tine Meieriet Kviamarka | Miljøgartneriet veksthus (77 000 m²) | Mangler | GWh/år | (a) kontraktsfestet levert varme | Uoppgitt (lavtemp meieriprosess) | Eksisterende / Operativ | Time kommune / COWI | [time.kommune.no](https://www.time.kommune.no/_f/p1/idd76ab2b-e5e0-45ef-8d7f-d55025d2d24f/22-overskuddsvarme-27_05_2025.pdf) | Side 26-27 | estimert |
| **Kviamarka datasenter (Feilklassifisert kraft)** | Norge, Hå kommune, Kviamarka | Planlagt datasenter | Miljøgartneriet / andre off-takere | 492.0 | GWh/år | (c) medieomtalt tall uten kildeunderlag (feiltolket totalt kraftforbruk) | Uoppgitt | 2024 / Planlagt | Statsforvalteren i Rogaland | [statsforvalteren.no](https://www.statsforvalteren.no/siteassets/fm-rogaland/bilder-fmro/landbruk/areal/trekking-av-innsigelser--ha-plan-id-202104-omradeplan-kviamarka-naringsomrade-og-plan-id-1054b-grodalandshagen.pdf) | Side 2 (avsnitt om kraftforbruk) | illustrativ |
| **Varde / Krageris–atNorth** | Danmark, Varde kommune, Krageris | atNorth DEN02 datasenter | Drivhusanlegg ved Krageris (4 drivhus à 10 ha) | Mangler | GWh/år | (b) teknisk potensial (planlagt) | Opptil 46 °C tur, 24–32 °C retur | 2026 / Planlagt (under høring) | Varde Kommune, atNorth | [vardekommune.dk](https://vardekommune.dk/wp-content/uploads/2026/04/Udkast-til-%C2%A7-25-tilladelse-til-sektorkoblet-anlaeg-ved-Krageris-april-2026-Varde-Kommune.pdf) | Udkast til §25-tilladelse | modellert |
| **Polar DC DRA02** | Norge, Drangedal kommune, Tørdal | Polar DC DRA02 datasenter | ingen | 9.0 | MW | (b) teknisk potensial (vekslerkapasitet) | 28/18 °C ekstern tur/retur | 2026 / Operativt datasenter, urealisert varme | Polar DC, Drangedal kommune, Sweco | [drangedal.kommune.no](https://www.drangedal.kommune.no/globalassets/driv/ovrig-naring/kost-nytteanalyse-overskuddsvarme-dra02-rev-2.pdf) | KNA s. 3, 17, 21 | modellert |

---

## 2. Metodiske forbehold og «Ikke si»-regler

For å sikre høy datakvalitet i flytmodellen og unngå spredning av feilaktige sirkulære claims, må følgende regler og forbehold ligge til grunn:

1. **Elektrisk kapasitet vs. nyttiggjort varme:**
   Det må skilles skarpt mellom elektrisk effekt (datasentre) og faktisk varme levert. For eksempel har Polar DC en elektrisk kapasitet på **57 MW**, men kun opptil **9 MW** er klargjort som ekstern varmeberedskap. På samme måte har Varde/Krageris en elektrisk plankapasitet på **500 MW**, men ingen GWh/år med faktisk nyttiggjort varme er dokumentert.

2. **Feiltolking av Kviamarka-forbruk:**
   Medieomtaler og plansaker refererer ofte til at Kviamarka vil ha et energiforbruk på **492 GWh/år** dersom datasenteret etableres (opp fra **176,5 GWh/år** uten datasenter). Dette tallet representerer samlet *kraftforbruk (strøm)* for industriområdet og datasenteret, **ikke** nyttiggjort eller levert spillvarme. Det må aldri føres som en varmeleveranse.

3. **Skillet mellom Wiig-piloten og Norway 1:**
   - **Wiig-piloten (Odin/DC1):** Et planlagt **4 MW** datasenter lokalisert på Vikvegen (Orre/Klepp) tilknyttet Wiig Gartneri. Dette prosjektet fikk rammetillatelse i november 2023, men tidslinjen har blitt forskjøvet flere ganger (høst 2024 -> jan 2025 -> Q3 2026), og det finnes per juni 2026 oslo/e-innsyn som dokumenterer urealisert status.
   - **Norway 1 (Tor Campus):** Et planlagt **36 MW** datasenter lokalisert på Næringsvegen 20 (Varhaug/Hå), ca. 10 km fra Orre. Prosjektet fikk reguleringsgodkjenning i juni 2026, har planlagt byggestart i slutten av 2026 og mål om drift i H2 2027. Dette er et helt annet anlegg og må holdes på en separat rad.

4. **Frövi er ikke et datasenter-case:**
   Regenergy Frövi er et av Nordens mest vellykkede spillvarmeprosjekter (35 GWh/år til 100 000 m² drivhus), men varmekilden er et **papir- og kartongbruk (Billerud)**, ikke et datasenter. Det må klassifiseres som industriell spillvarme, ikke datasentersymbiose. Det opprinnelige målet (2019) inkluderte også et landbasert fiskeoppdrett, men dette ble aldri realisert (kun drivhuset for tomater ble bygget).

5. **Polar DC DRA02 mangler mottaker:**
   Anlegget i Drangedal er i drift som datasenter, og det er installert varmevekslere for opptil 9 MW. Likevel er mottakernoden satt til **'ingen'**, ettersom Swecos kost-nytteanalyse slår fast at det per 2026 ikke finnes noen mottakere med konkrete utbyggingsplaner.

6. **Varde/Krageris er i planfase:**
   atNorth og Varde kommunes prosjekt er under regulering og offentlig høring (frist 25.06.2026). Det foreligger ingen endelig investeringsbeslutning, og WA3RM har gått ut av prosjektet. Det finnes foreløpig ingen navngitt drivhusoperatør eller avtale om varmeleveranse.

---

## 3. Identifiserte datagap

Følgende hull i datagrunnlaget er avdekket og krever direkte henvendelser to prosjektaktørene:

* **Green Mountain–Hima (Rjukan):** Mangler årlige driftstall for levert energi (GWh/år), temperaturprofil (tur/retur) og reservevarmeløsning. Disse må innhentes direkte fra Green Mountain og Hima Seafood (AASK-0906-005).
* **Regenergy Frövi (Sverige):** De 35 GWh/år som oppgis er prosjekterte måltall fra WA3RMs nettsider, ikke uavhengig verifiserte måleresultater fra drift. Det mangler også offisielle data på leveringstemperatur.
* **Wiig-piloten (Klepp):** Mangler igangsettingstillatelse eller ferdigattest i Klepp kommune. Status må verifiseres via det klargjorte innsynskravet i Klepp kommunes byggesaksarkiv.
* **Miljøgartneriet-Tine (Kviamarka):** Meieriet leverer operativ spillvarme til drivhuset i dag, men energivolum (GWh/år) og temperaturer er uoppgitte i de offentlige planforstudiene.
* **Varde/Krageris (Danmark):** Mangler måltall for årlig levert varmeenergi (GWh/år) og detaljer om fremtidig drivhusoperatør.
---
