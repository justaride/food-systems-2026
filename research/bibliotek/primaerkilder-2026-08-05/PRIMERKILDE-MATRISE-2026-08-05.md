# Primærkildematrise for strøkne runde-1-tall (INNSIKT-SPOR runde 2)

> Reconciliation status (2026-08-29): preserved as dated internal research. Claims remain subject to current source, locator, rights, and publication gates. Draft requests are unsent; subscription recommendations do not authorize purchase.

**Formål:** kartlegge reell primærkilde-status for de strøkne tallklyngene i §10 i `INNSIKT-SPOR/ANALYSE-materialstrommer.md`, `ANALYSE-okologi_jordhelse.md`, `ANALYSE-alternativt_protein.md` og `ANALYSE-beredskap_import.md`, slik at tallene kan gjeninnføres som `primary_evidence` gjennom prosjektets fail-closed-siteringsløp — eller forbli strøket der ingen primærkilde lar seg spore.

**Utført:** 2026-08-05/06. Ingen databaseskriving, ingen git-mutasjon. Kun nedlastinger og denne matrisen, alt under `research/bibliotek/primaerkilder-2026-08-05/`.

**Statusnøkler:**
- **FUNNET** — primær/naer-primær kilde lastet ned til denne mappen OG nøkkeltall verifisert i selve dokumentet (pdftotext/grep).
- **IDENTIFISERT-UTILGJENGELIG** — kilden er identifisert med full henvisning, men PDF/en er betalingsmur-bot-blokkert eller avpublisert; nedlasting krever manuell sti.
- **USPORBART** — tallet ser ikke ut til å ha en sporbar primærkilde; det er en intern avledning eller et intern kartleggingsunivers. Skal forbli strøket.

**Viktig metodefunn som går igjen:** flere av de strøkne tallene var reelle, men tilskrevet feil kilde i prosjektets egne notater. To tall er dessuten verifisert *avvikende* fra det den strøkne versjonen hevdet (SPCR 120 P og K; se klynge C2). Gjeninnføring må derfor skje fra denne matrisens verifiserte verdier, ikke fra de gamle notatene.

---

## Klynge A — Marint restråstoff (strøket i materialstrommer §10 rad 1–3 + §2-prosa; opprinnelig kilde `drr-0906-007`)

### A1. SINTEF/FHF restråstoffanalyse 2024 — **FUNNET, verifisert**

- **Primærkilde:** SINTEF Ocean / Kontali Analyse for FHF, prosjekt 901844: *«Analyse marint restråstoff 2024 — Tilgjengelighet og anvendelse av marint restråstoff fra norsk fiskeri- og havbruksnæring»* (2025).
- **Lokal fil:** `fhf-901844-analyse-marint-restrastoff-2024.pdf` (lastet ned via FHF prosjektbase-proxy; direkte SharePoint-URL gir 403).
- **Prosjektside:** https://www.fhf.no/prosjekter/prosjektbasen/901844/
- **Verifiserte verdier i rapporten (2024-tall):**
  - Tilgjengelig marint restråstoff **1 094 000 t** (Tabell 1, sammendrag)
  - Utnyttet **976 000 t** = **89 %** total utnyttelsesgrad
  - Uutnyttet **118 000 t** (hovedsakelig hvitfisksektoren + fritt blod)
  - Sektorvise utnyttelsesgrader: hvitfisk **72 %** (245 000 tilgjengelig / 176 000 utnyttet), pelagisk **100 %** (285 000/285 000), havbruk laksefisk **94 %** (543 000/509 000), skalldyr **27 %** (21 000/5 600)
  - Fritt blod fra laksefisk **34 300 t** (største enkeltvolum uutnyttet)
  - Produkter fra utnyttet restråstoff **ca. 476 000 t** produkt; human konsum ca. 15 % (~70 000 t), fôr ca. 66 %, biogass/energi ca. 19 %
- **Basis-merknad:** dette er *beregnet/analysert* av SINTEF/Kontali fra landings-, slakte- og bransjedata — ikke målt strøm. Ved gjeninnføring bør basis settes til `modellert`/`aktoropplysning`-klassen, ikke `maalt`. Rapporten oppgir selv at mye sluttbruksinformasjon kommer fra selskapskommunikasjon.
- **Følgerapporter i samme prosjekt (ikke lastet ned):** restråstoffanalyse 2022 og 2023, faktaark og nyhetsbrev, faglig sluttrapport 2023–2025 — alle tilgjengelig via samme prosjektside om tidsserie trengs.

### A2. IOC/100% Fish «over 90 %» — **FUNNET, verifisert (aktørclaim)**

- **Primærkilde:** Iceland Ocean Cluster / Dr. Alexandra Leeper, FOODIMAR-presentasjon august 2024: *«Iceland Ocean Cluster & 100% Fish»*.
- **Lokal fil:** `foodimar-iceland-ocean-cluster-presentasjon-2024.pdf` — «>90 %» verifisert i dokumentet.
- **URL:** https://foodimar.eu/wp-content/uploads/2024/08/03_Iceland-Cluster-Alexandra.pdf
- **Basis-merknad:** uauditert aktørclaim i presentasjonsformat. Matís motsier en bokstavelig 100 %-lesning. Skal aldri siteres som målt nasjonal utnyttelsesgrad; kun som designbenchmark/aktørfortelling.

---

## Klynge B — Oppdrettsslam (strøket i materialstrommer §10 rad 4–5 + §2-prosa 68/77-tilsyn; opprinnelig kilde `R13-WASTE-002`)

### B1. Slamvolum 535 412 t/år — **FUNNET (identifisert primær; verifisert via siterende sluttrapport)**

- **Sann primærkilde:** Aas, T. S. & Åsgård, T. E. (2017): *«Estimert innhold av næringsstoff og energi i fôrspill og faeces fra norsk lakseoppdrett»*, **Nofima Rapport 18/2017**. Dette er IKKE et FHF-modellresultat — FHF-syntesen siterer Aas & Åsgård eksplisitt.
- **Verifisering:** FHF 901572-sluttrapporten (SINTEF 2020:01383) siterer tallet direkte to steder (s. 276 og s. 4091/4441 i tekststrømmen): «Aas og Åsgård (2017) har beregnet at det slippes ut 535 412 tonn slam fra lakseoppdrett i sjø fordelt på 355 602 tonn faeces og 179 540 tonn fôrspill, samt 10 716 tonn slam fra settefiskproduksjonen, fordelt på 6 768 [t fôr] og 3 948 [t faeces]».
- **Lokal fil (siterende kilde):** `fhf-901572-sluttrapport-sintef-2020-01383.pdf`.
- **Nofima-rapporten selv:** registrert i NVA (Cristin) med åpen PDF (`Rapport 18-2017.pdf`, publisert i NVA 2025-09-15, publikasjons-ID `0198cc8500a2-b7fd98a4-1747-4a2a-8df5-b6c5d40e368e`), men filnedlasting er bot-blokkert (403) for skript; må hentes manuelt via https://nva.unit.no i nettleser. Settefisk-tallet (10 716 t) har egen primær: Aas & Åsgård (2019), *«Stoff-flyt av næringsstoff og energi fra fôr i et landbasert settefiskanlegg»*, Nofima rapportserie.
- **Basis-merknad:** *beregnet* (massebalanse fra fôrforbruk/fordøyelighet), årstall ca. 2016/2017-produksjon — ikke 2019. Den strøkne versjonens årstall (2019) var feil tilskrevet; 66 000/14 000 t er 2019 (B2), 535 412 t er Aas & Åsgård 2017-basis.

### B2. Modellert N/P/C i utslipp 2019: 66 000 / 14 000 / 224 000 t — **FUNNET, verifisert**

- **Primærkilde:** Broch, O. J. & Ellingsen, I. (2020): *«Kunnskaps- og erfaringskartlegging … Delrapport 1 — Kvantifisering av utslipp»*, **SINTEF Rapport 2020:00342**, FHF prosjekt 901572.
- **Lokal fil:** `fhf-901572-delrapport1-kvantifisering-av-utslipp-sintef-2020-00342.pdf`.
- **Verifisert i teksten:** «omtrent 224 000 t karbon, 66 000 t nitrogen og 14 000 t fosfor (tabell 2)» for sjøbasert matfisk 2019; Monte-Carlo med 10 000 iterasjoner; usikkerhet oppgitt med standardavvik.
- **Basis:** `modellert` (SFA). Må aldri siteres som innsamlet eller målt slamvolum.

### B3. Miljødirektoratets tilsyn 68/77 anlegg — **FUNNET, verifisert**

- **Primærkilde:** Miljødirektoratet, nyhet mai 2025: *«Landbasert oppdrett har for dårlig utslippskontroll»* (kontrollaksjon 2024).
- **Lokal fil:** `miljodirektoratet-landbasert-oppdrett-utslippskontroll-2025.html` (tallene 77/68/261 verifisert i HTML).
- **URL:** https://www.miljodirektoratet.no/aktuelt/nyheter/2025/mai-2025/landbasert-oppdrett-har-for-darlig-utslippskontroll
- **Basis:** regulatorprimær (A).

---

## Klynge C — Biorest og næringsretur (strøket i materialstrommer §10 rad 6–8 og okologi_jordhelse §10 rad 1–3; opprinnelig kilde `deep-research-r3-02`)

### C1. Norsk biorest 218 000 t avvannet / 370 000 t flytende + 84 % spredt — **IDENTIFISERT-UTILGJENGELIG (delvis bekreftet via siterende offentlige dokumenter)**

- **Sann primærkilde:** **Norwaste, *Biogasstatistikk 2022*** (bransjestatistikk), sitert i **Landbruksdirektoratet og Miljødirektoratet, Rapport 17/2024: *«Tilskudd for levering av husdyrgjødsel til biogassanlegg — gjennomgang av tilskuddsordningen på jordbruksavtalen»*, s. 19**.
- **Status:** Verken Norwaste-rapporten eller 17/2024-PDF-en lot seg lokalisere som nedlastbar fil i denne runden (Norwastes biogasstatistikk-2022-side er avpublisert/404; kun 2025-utgaven har egen side, uten åpen PDF; Landbruksdirektoratets rapportarkiv viser bare nyere rapporter, og rapport-PDF-en ble ikke funnet via åpent søk). Formuleringen «Biogassindustrien i Norge produserer årlig rundt 218 000 tonn avvannet biorest, og 370 000 tonn flytende biorest» er likevel uavhengig bekreftet gjengitt med fotnotehenvisning til *Biogasstatistikk 2022* i offentlige dokumenter (bl.a. sitert i Statens tilbud 2024, regjeringen.no).
- **Det som trengs:** manuell forespørsel til Norwaste (post@norwaste.no) om *Biogasstatistikk 2022*, eller Landbruksdirektoratet om PDF av Rapport 17/2024 (s. 19). Inntil da: ikke gjeninnfør som `primary_evidence`.
- **Basis ved gjeninnføring:** `aktoropplysning`/bransjestatistikk (egenrapportering), sekundær gjengivelse i offentlig rapport. 84 %-andelen er *bruksandel*, ikke målt N/P/K-retur.

### C2. Svensk SPCR 120 N/P/K-retur — **FUNNET, verifisert — MED KORRIGERING AV STRØKNE TALL**

- **Primærkilde:** Avfall Sverige: *«Årsrapport SPCR 120, 2024 — Certifierad återvinning»* (publisert 2025).
- **Lokale filer:** `avfall-sverige-spcr120-arsrapport-2024.pdf` (primær for 2024), samt `...-2023.pdf` og `...-2022.pdf` for tidsserie.
- **URL 2024:** https://www.avfallsverige.se/media/p2akb3gx/a-rsrapport-spcr-120-2024.pdf
- **Verifiserte verdier 2024 (sitert fra sammendrag og kap. om næringsretur):** dersom all produsert biogödsel antas spredt på åkermark tilføres jordbruket ca. **6 200 t plantetilgjengelig nitrogen (NH4-N)**, ca. **1 300 t fosfor** og ca. **4 000 t kalium** — beregnet på 102 000 t TS. P tilsvarer 8,3 % og K 15 % av importert mineralgjødsel (gjødselåret 2023/24); NH4-N tilsvarer ca. 3,3 % av mineralgjødsel-N.
- **VIKTIG KORRIGERING:** den strøkne versjonen oppga «6 200 / 1 200 / ~3 700–4 000 t». Årsrapport 2024 sier **1 300 t P** (ikke 1 200) og **4 000 t K** (ikke 3 700–4 000). De strøkne verdiene kan ha ligget i et nyhetsbrev-sammendrag eller være fra et annet år — ved gjeninnføring skal **1 300 / 4 000** brukes med årsrapport 2024 som lokator.
- **Basis:** `modellert`/beregnet — rapporten forutsetter eksplisitt at ALL produsert sertifisert biogödsel brukes på åkermark; det er ingen målt retur. Dekker kun SPCR 120-sertifiserte samrøtningsanlegg, ikke all svensk digestat.

---

## Klynge D — Alternativt protein (strøket i alternativt_protein §10, ni påstander; opprinnelig kilde `r5-a4` + enifer.com-lenke)

### D1. Solar Foods Factory 01 — 160 t/år — **FUNNET, verifisert**

- **Primærkilde:** Solar Foods Oyj, offisiell pressemelding 20. oktober 2025: *«Solar Foods Factory 01 has reached its productivity targets»*.
- **Lokal fil:** `solar-foods-factory01-presse-2025-10.pdf` — «full design capacity of 160 tons of Solein annually» verifisert; oppgradering til 230 t/år planlagt 2026.
- **Basis:** `aktoropplysning` (selskapets egenmelding om *nådd designkapasitet* — fortsatt ikke målt årsproduksjon i regnskapssammenheng).

### D2. Lerøy tare/blåskjell (230 t → 2,3 t protein; 3 t blåskjellprotein 2022) — **IDENTIFISERT-UTILGJENGELIG (siden endret)**

- **Primærkilde:** Lerøy Seafood, temaside *«Increasing production of kelp and mussel meal»* (bærekraft, 2022-tall).
- **Lokal fil:** `leroy-kelp-mussel-meal.html` — MERK: dagens versjon av siden inneholder IKKE lenger sitatet «230 tons of sugar kelp … 2.3 tons of protein, and 3 tons of blue mussel protein». Siden er omskrevet; tallet må verifiseres mot Wayback Machine-arkivert versjon (ca. 2023) eller Lerøys bærekraftsrapport 2022 før gjeninnføring. Wayback API var rate-limitet i denne runden.
- **Basis:** `aktoropplysning` (egenrapportert pilotvolum).

### D3. Ragn-Sells insektprotein (~1 t protein + 25 kg fett, pilot) — **FUNNET, verifisert**

- **Primærkilde:** Ragn-Sells pressemelding: *«New technology leads to breakthrough in insect [protein]»* (Orsa-anlegget, Axfoundation Framtidens Fisk-samarbeid).
- **Lokal fil:** `ragnsells-insect-breakthrough.html` — «approximately one tonne of protein and 25 kilograms of fat» verifisert.
- **URL:** https://newsroom.ragnsells.com/posts/pressreleases/new-technology-leads-to-breakthrough-in-insec
- **Basis:** `aktoropplysning`, engangs-pilottest, ikke kontinuerlig produksjon.

### D4. Innovafeed «>15 000 t protein+olje kumulativt over tre år» — **IDENTIFISERT-UTILGJENGELIG**

- **Primær (aktør):** Innovafeed-pressemelding juni 2026, gjengitt i AgFunderNews (*«Innovafeed raises $59M …»*) og The Fish Site. Sitatet «produced more than 15,000 tonnes of protein and oil» er fra selskapets egen melding. Ikke lastet ned (artikkel-HTML, delvis betalingsmur).
- **Basis:** `aktoropplysning`, kumulativt volum — ikke årsvolum. Kan gjeninnføres som aktørclaim med kumulativ-merknad.

### D5. Calysseo 20 000 t/år — **IDENTIFISERT (kapasitet, ikke volum)**

- Chongqing fase 1-kapasitet 20 000 t/år er dokumentert i Calysta/Calysseo-pressemeldinger og The Fish Site (2024); realisert årsvolum er ikke offentliggjort noe sted. Kan kun gjeninnføres som *kapasitet* med basis `aktoropplysning`. Ingen primær for *produsert* volum finnes — den delen forblir strøket.

### D6. Unibio Kalundborg 80 t/år kapasitet / 24 t forsendelse 2021 — **IDENTIFISERT**

- Kapasitet: Aquafeed.com-melding om anleggsåpning (2016). Forsendelse 24 t til Danish Agro (okt. 2021): bransjepresse. Løpende volum ikke offentliggjort. Basis `aktoropplysning` (kapasitet + engangsleveranse).

### D7. Enifer PEKILO 4 t batch — **USPORBART utover enkeltlenke**

- Eneste kilde i runde 1 var en enkeltstående enifer.com-lenke. PEKILO/*P. variotii* dekkes nå bedre av NordicFeed-ekstraktet (62 % råprotein, −11 % GHG ved 20 % erstatning — primær i kjernekorpuset). 4-tonns-batchen bør forbli strøket med mindre enifer.com-siden gjenfinnes og verifiseres.

### D8. «14 aktører i ledgeren» — **USPORBART (internt univers)**

- Var prosjektets eget kartleggingsunivers i `r5-a4`, ikke en primærkilde-måling. Forblir strøket.

---

## Klynge E — Beredskap og import (strøket i beredskap_import §10, 9 av 10 tall; opprinnelige kilder `r5-d3`, `r5-a5`, `r5-d2b`, `r4-16`)

### E1. Norsk matkornmål 82 500 t innen 2029 + kontrakter (30 000 + 30 000 + 22 500 t) — **FUNNET, verifisert**

- **Primærkilder:** Landbruksdirektoratet, to nyhetssider:
  - *«82 500 tonn matkorn på lager innen 2029 — i mål med kontrakter»* — `landbruksdirektoratet-82500-tonn-matkorn-2029.html` (82 500 t og 2029 verifisert).
  - *«Inngår kontrakter for lagring av matkorn med oppstart i 2026 og 2027»* — `landbruksdirektoratet-matkorn-kontrakter-2026-2027.html` (82 500 t og alle fem mølleaktører — Norgesmøllene, Fiskå Mølle, Vestfoldmøllene, Strand Unikorn, Lantmännen Cerealia — verifisert).
- **Basis:** `aktoropplysning` (myndighetsmelding om *kontrakt* og *mål* — ikke fysisk realisert lager). Gjeninnføres med kontrakt-≠-lager-forbehold.

### E2. Finland: lovfestet minimum ≥6 måneder + ~8,5 måneder lager — **FUNNET, verifisert**

- **Primærkilder:**
  - Työ- ja elinkeinoministeriö: *«Government Decision on the Objectives of Security of Supply»* (vedtatt 24.10.2024), §4.3 — `finland-tem-government-decision-security-of-supply-2024.pdf`; «at least six months of average human consumption» verifisert.
  - Huoltovarmuuskeskus (NESA), pressemelding 15.12.2022: *«National Emergency Supply Agency boosting Finland's emergency grain stockpiles»* — `nesa-finland-emergency-grain-stockpiles-2022.html`; tilleggskjøp ~2,5 måneder og nivå ~8,5 måneder verifisert («six months», «2.5 months», «8.5» i HTML).
- **Basis:** `aktoropplysning` (lovvedtak/myndighetsmelding). Eksakt tonnasje er fortsatt ikke publisert (C).

### E3. Sverige «3 måneders krisebehov» — **FUNNET, verifisert (i myndighetsrapport, ikke i proposisjonsteksten)**

- **Primærkilde:** Livsmedelsverket/Jordbruksverket: *«Uppbyggnad av livsmedelsberedskapen 2024»* (2025) — `livsmedelsverket-uppbyggnad-livsmedelsberedskap-2024.pdf`; «De tre månaders uthållighet som samhället planerar för» verifisert (s. ~kap. innledning, tekststrøm linje 442).
- **Supplerende:** Riksdagen Prop. 2025/26:205 dokumentside — `riksdagen-prop-2025-26-205-beredskapslager.html`. MERK: selve proposisjons*teksten* inneholder ikke «tre månader» i den lagrede HTML-en; 3-månederstallet skal derfor lokaliseres til Livsmedelsverket-rapporten (eller hele prop-PDF-en hentes separat ved behov).
- **Basis:** `aktoropplysning` (samfunnsplanlagt utholdenhetsnorm — ikke lagervolum).

### E4. Norskandel kyllingfôr ~40 % (Animalia 2020) — **FUNNET, verifisert**

- **Primærkilde:** Animalia: *Kjøttets tilstand 2020*, fôrartikkel (`kt20-forartikkel-02web.pdf`) — `animalia-kt2020-forartikkel.pdf`; «40 prosent av råvarene i kyllingfôret» (norskandel) verifisert, samt soyaandel ~20 % i kyllingfôr. Oppdatert 2023-variant finnes som Animalia-nettartikkel (09.04.2025), ikke nedlastet.
- **Basis:** `aktoropplysning`/bransjedata (vektet snitt fra fire fôrfirmaer + Landbruksdirektoratet).

### E5. Norsk import HS 150420 fiskeolje fra Mauritania (21,58 / 20,03 / 15,28 mill. kg, 2020–2022) — **IDENTIFISERT-UTILGJENGELIG (re-deriverbar fra SSB)**

- **Sann primær:** SSB tabell 08801 (utenriksregnskapet, tollstatistikk), HS 150420 × opprinnelsesland Mauritania. De strøkne tallene stammet fra WITS/Comtrade-speiling av SSB (sekundær), ikke fra direkte SSB-uttrekk.
- **Det som trengs:** nytt uttrekk fra SSB PxWebApi tabell 08801 (varenr. 150420, import, land = Mauritania, år 2020–2022, kg) — samme løp som prosjektets eksisterende SSB-08801-uttrekk (`research/external/r2/SSB-08801-norge-brasil-uttrekk-2026-06-16.md`). Forblir strøket til SSB-uttrekket er gjort direkte.
- **Basis ved gjeninnføring:** `maalt` (tolldeklarert), med HS-artsblindhet-forbehold.

### E6. Selvforsyning kraftfôrkorrigert eksakt 41,6 % / 34,9 % (2023/2024) — **USPORBART som eksakte tall**

- De eksakte desimalene var intern avledning i `r5-d2b`. Primærkildene som finnes gir intervaller/punkter: Riksrevisjonen Dok. 3:4 (2023–2024): 34–40 % korrigert for fôrimport; NIBIO-metode 41–47 % (2018–2022); Meld. St. 11: 45 % energibasis 2023. Alle tre er allerede primærforankret i beredskap_import §3. **De eksakte 41,6/34,9 forblir strøket.**

### E7. Importert proteinfraksjon i husdyrkraftfôr ~95,1 % — **USPORBART**

- Ren intern avledning i `r5-a5` (sammensatt nevner fra ulike kilder). Ingen enkelt primærkilde bærer tallet. Forblir strøket; feltet dekkes av Meld. St. 11s 54 % norsk kraftfôrandel (primærforankret).

---

## Klynge F — Jordhelse/overvåking (strøket i okologi_jordhelse §10 rad 4–8, deler overlapp med klynge B/C)

### F1. JordVAAK 805 prøveflater — **IDENTIFISERT (offentlig prosjektside)**

- **Primærkilde:** NIBIO, JordVAAK-programmet (jordovervåking jordbruksjord). NIBIOs egen side bekrefter «805 prøveflater» (https://www.nibio.no/om-nibio/vare-fagdivisjoner/divisjon-for-kart-og-statistikk/jordkartlegging). Programmet igangsettes 2026 — det finnes per i dag ingen publisert nasjonal baseline; tallet er et *designomfang*, ikke et måleresultat.
- **Basis ved gjeninnføring:** `aktoropplysning` (programomfang). Ikke et jordhelse-utfallstall.

### F2. 3Q-pollinatorobservasjon, 10 flater — **IDENTIFISERT-UTILGJENGELIG**

- **Primær:** NIBIO 3Q (tilstandsovervåking jordbrukets kulturlandskap) i samarbeid med NINA — humle-/dagsommerfuglregistrering på et lite utvalg 3Q-flater (https://www.nibio.no/en/subjects/landscape-and-land-use/monitoring-of-farming-landscapes/3q/3q-monitoring-of-pollinators). Det eksakte «10 flater» er ikke verifisert mot en publisert NIBIO/NINA-rapport i denne runden — forblir strøket til flatetallet er verifisert i 3Q-dokumentasjon.

### F3. Nasjonal insektovervåking «>30 000 arter / ~6 000 sikre» — **IDENTIFISERT-UTILGJENGELIG**

- Programmet finnes: miljøforvaltningens insektovervåking (NINA, oppstart 2020 i skog og semi-naturlig eng; kostnads-/nyttevurdering i NINA Rapport 1725). De eksakte artstallene («>30 000 arter», «~6 000 sikre») er ikke verifisert mot en konkret NINA-/Artsdatabanken-publikasjon — forblir strøket til primærdokument (NINA-årsrapport for insektovervåkingen eller Artsdatabanken-presentasjon) er funnet og sitert med lokator.

---

## Oppsummering av dekning

| Klynge | Status | Gjeninnførbar nå? |
|---|---|---|
| A1 Marint restråstoff 2024 (1 094 000/976 000/118 000/72-100-94-27 %/34 300/476 000) | FUNNET, verifisert | Ja — med basis `modellert/aktoropplysning`, lokator Tabell 1 |
| A2 IOC «>90 %» | FUNNET, verifisert | Ja — kun som aktørclaim/benchmark |
| B1 Slam 535 412 t (355 602/179 540; settefisk 10 716) | FUNNET via siterende FHF-sluttrapport; sann primær Nofima 18/2017 bot-blokkert | Delvis — hent Nofima-PDF manuelt først |
| B2 Slam N/P/C 66 000/14 000/224 000 t (2019) | FUNNET, verifisert | Ja — basis `modellert`, SINTEF 2020:00342 tabell 2 |
| B3 Miljødirektoratet 68/77 | FUNNET, verifisert | Ja — regulator A |
| C1 Biorest 218 000/370 000/84 % | IDENTIFISERT-UTILGJENGELIG | Nei — be Norwaste om *Biogasstatistikk 2022* eller Ldir om 17/2024-PDF |
| C2 SPCR 120 2024 | FUNNET, verifisert | Ja — **med korrigerte verdier 6 200/1 300/4 000** og beregningsforbehold |
| D1 Solar Foods 160 t | FUNNET, verifisert | Ja — `aktoropplysning`, nådd designkapasitet |
| D2 Lerøy tare/blåskjell | IDENTIFISERT-UTILGJENGELIG | Nei — verifiser via Wayback/bærekraftsrapport 2022 først |
| D3 Ragn-Sells ~1 t | FUNNET, verifisert | Ja — `aktoropplysning`, pilot |
| D4 Innovafeed >15 000 t kumulativt | IDENTIFISERT | Delvis — som aktørclaim med kumulativ-merknad |
| D5 Calysseo 20 000 t | IDENTIFISERT (kapasitet) | Kun som kapasitet; produsert volum forblir strøket |
| D6 Unibio 80 t/24 t | IDENTIFISERT | Kun som kapasitet/engangsleveranse |
| D7 Enifer 4 t | USPORBART | Nei — forblir strøket |
| D8 «14 aktører» | USPORBART | Nei — forblir strøket |
| E1 Matkorn 82 500 t + kontrakter | FUNNET, verifisert | Ja — `aktoropplysning` (mål/kontrakt) |
| E2 Finland 6 mnd / 8,5 mnd | FUNNET, verifisert | Ja — `aktoropplysning` (lovvedtak/myndighet) |
| E3 Sverige 3 mnd | FUNNET, verifisert | Ja — lokaliser til Livsmedelsverket-rapporten |
| E4 Kyllingfôr 40 % (Animalia KT2020) | FUNNET, verifisert | Ja — `aktoropplysning` |
| E5 HS 150420 Mauritania | IDENTIFISERT-UTILGJENGELIG | Nei — krever direkte SSB 08801-uttrekk |
| E6 Selvforsyning 41,6/34,9 % eksakt | USPORBART | Nei — bruk primærforankrede intervaller (allerede i §3) |
| E7 Proteinfraksjon 95,1 % | USPORBART | Nei — forblir strøket |
| F1 JordVAAK 805 flater | IDENTIFISERT | Kun som programomfang, ikke utfall |
| F2 3Q 10 flater | IDENTIFISERT-UTILGJENGELIG | Nei — verifiser flatetall i 3Q-dok først |
| F3 Insektovervåking 30 000/6 000 arter | IDENTIFISERT-UTILGJENGELIG | Nei — finn NINA/Artsdatabanken-dok først |

**Sum:** 24 klynger vurdert. **FUNNET og verifisert: 11** (A1, A2, B1*, B2, B3, C2, D1, D3, E1, E2, E3, E4 — 12 med E4; B1 krever manuell Nofima-henting for full verifisering av selve primær-PDF-en). **Identifisert, men krever manuell sti: 6** (C1, D2, D5, D6, E5, F2/F3). **Usporbart — forblir strøket: 4** (D7, D8, E6, E7).

**Avvik funnet ved verifisering (viktigst):**
1. SPCR 120 2024: fosfor er **1 300 t** (ikke 1 200), kalium **4 000 t** (ikke 3 700–4 000), og tallene er *beregnet* under forutsetning om 100 % spredning — aldri presentér som målt retur.
2. Slam 535 412 t er **Aas & Åsgård (Nofima) 2017-tall**, ikke FHF-2019; FHF 901572 *siterer* det. Årstall og kildehenvisning i runde 1 var feilkoblet.
3. Restråstoff-tallene er SINTEF/Kontali-*beregninger*, ikke målinger — basis må være `modellert` ved gjeninnføring.

**Ikke dekket i denne matrisen (utenfor mandatets fire analysefiler):** de strøkne klyngene i `ANALYSE-offentlig_innkjop.md`, `ANALYSE-lokale_verdikjeder.md`, `ANALYSE-aktordybde.md`, `ANALYSE-makt_eierskap.md`, `ANALYSE-nordisk_dybde.md`, `ANALYSE-kausalitet.md` og `ANALYSE-kvalitativt_lag.md` (bl.a. 4,6 mrd. kr kommunalt matinnkjøp, REKO-tellingene, Tine 72–77 %, kakao 67 %). Flere av disse overlappper klyngene over (matkornmålet går igjen i nordisk_dybde); resten krever egen jakt.

## Inventar — filer i denne mappen

| Fil | Innhold | Status |
|---|---|---|
| `fhf-901844-analyse-marint-restrastoff-2024.pdf` | SINTEF Ocean/Kontali for FHF 901844, restråstoffanalyse 2024 | OK, verifisert |
| `fhf-901572-delrapport1-kvantifisering-av-utslipp-sintef-2020-00342.pdf` | Broch & Ellingsen, SINTEF 2020:00342 (N/P/C-utslipp 2019) | OK, verifisert |
| `fhf-901572-sluttrapport-sintef-2020-01383.pdf` | FHF 901572 faglig sluttrapport (siterer Aas & Åsgård 535 412 t) | OK, verifisert |
| `avfall-sverige-spcr120-arsrapport-2024.pdf` | Avfall Sverige SPCR 120 årsrapport 2024 | OK, verifisert |
| `avfall-sverige-spcr120-arsrapport-2023.pdf` | SPCR 120 årsrapport 2023 | OK |
| `avfall-sverige-spcr120-arsrapport-2022.pdf` | SPCR 120 årsrapport 2022 | OK |
| `solar-foods-factory01-presse-2025-10.pdf` | Solar Foods pressemelding 20.10.2025 (160 t/år) | OK, verifisert |
| `finland-tem-government-decision-security-of-supply-2024.pdf` | Finsk Government Decision (§4.3, seks måneder) | OK, verifisert |
| `livsmedelsverket-uppbyggnad-livsmedelsberedskap-2024.pdf` | Livsmedelsverket/Jordbruksverket 2025 («tre månaders uthållighet») | OK, verifisert |
| `animalia-kt2020-forartikkel.pdf` | Animalia Kjøttets tilstand 2020, fôrartikkel (kyllingfôr 40 %) | OK, verifisert |
| `foodimar-iceland-ocean-cluster-presentasjon-2024.pdf` | IOC/100% Fish-presentasjon («>90 %») | OK, verifisert |
| `miljodirektoratet-landbasert-oppdrett-utslippskontroll-2025.html` | Miljødirektoratet nyhet mai 2025 (68/77) | OK, verifisert |
| `landbruksdirektoratet-82500-tonn-matkorn-2029.html` | Ldir nyhet (matkornmål) | OK, verifisert |
| `landbruksdirektoratet-matkorn-kontrakter-2026-2027.html` | Ldir nyhet (kontrakter) | OK, verifisert |
| `nesa-finland-emergency-grain-stockpiles-2022.html` | NESA pressemelding 15.12.2022 | OK, verifisert |
| `leroy-kelp-mussel-meal.html` | Lerøy temaside (dagens versjon — uten 230 t-sitatet) | Lagret, tall ikke verifisert |
| `ragnsells-insect-breakthrough.html` | Ragn-Sells pressemelding | OK, verifisert |
| `riksdagen-prop-2025-26-205-beredskapslager.html` | Riksdagen Prop. 2025/26:205 dokumentside | Lagret (teksten uten 3-mnd-omtale i denne HTML-en) |

---
*Provisorisk, internt arbeidsdokument. Tall merket FUNNET/verifisert er kontrollert mot det nedlastede dokumentet 2026-08-05/06. Ingen av verdiene er ennå gjeninnført i INNSIKT-SPOR-analysene; gjeninnføring skal skje gjennom prosjektets fail-closed-siteringsløp med lokator og basis som angitt over.*
