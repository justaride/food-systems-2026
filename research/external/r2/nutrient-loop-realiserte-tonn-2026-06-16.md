# Nutrient-loop: realiserte tonn (RecoLab + norsk fiskeslam)

**DRO-R2-02 — runde 2 datasøk**
**Dato:** 2026-06-16
**Mål:** REALISERTE årlige gjenvinningstonn (ikke teknisk potensial) for (a) Helsingborg RecoLab og (b) norsk havbruks-fiskeslam fordelt på sluttbruk.

---

## Metode / omfang / leseanvisning

- All URL-henting via godkjent web_fetch. Primærkilder er hentet og lest direkte; ingen tall er regnet om uten eksplisitt merking.
- **Hvert tall er klassifisert:**
  - **[REALISERT]** = målt/rapportert mengde som faktisk er produsert/gjenvunnet/levert.
  - **[POTENSIAL/MODELLERT]** = beregnet maksimum, prognose eller scenariotall.
  - **[PROSENT]** = gjenvinningsgrad/andel, ikke en mengde.
  - **[AVLEDET]** = mitt regnestykke fra realiserte data, tydelig merket som inferens — IKKE en rapportert verdi.
- N og P blandes ikke. Tonn og prosent blandes ikke. Ikke-hentede celler er merket **«ikke hentet»**.
- **Viktig avgrensning (fiskeslam vs. restråstoff):** SINTEFs «marint restråstoff» = biprodukter fra *prosessering* av fanget/oppdrettet fisk og skalldyr (+ dødfisk). Det **inkluderer IKKE** fiskeslam (ekskrementer + fôrspill). SINTEFs 89 %/976 000 t utnyttelse (2024) gjelder altså prosesseringsbiprodukter og er **ikke** et fiskeslam-tall. Bekreftet mot SINTEF-definisjonen. Dette er den vanligste forvekslingsfellen og holdes derfor strengt adskilt nedenfor.

---

## 1. RecoLab (Helsingborg) — realiserte årlige tonn

**Hovedfunn:** Det finnes nå et **realisert** distrikts-/anleggsnivå-tall for 2024 — men kun for de to **uthentede** sluttproduktene (struvitt + ammoniumsulfat), ikke for total N/P/K. NSVAs miljørapport bekrefter eksplisitt at *alt* renset gråvann og produsert slam fra RecoLab ble ført tilbake til Öresundsverkets hovedstrøm i 2024. De eneste næringsstoffene som faktisk forlater RecoLab som et separat gjenvunnet produkt er derfor struvitten og ammoniumsulfatet.

### 1a. Realiserte produktmengder (rapportert)

| Produkt | Verdi | Enhet | År | Geografi/anlegg | Type | Kilde (eier) | URL |
|---|---|---|---|---|---|---|---|
| Struvitt (MgNH₄PO₄·6H₂O) | **497** | kg | 2024 | RecoLab, Helsingborg | **[REALISERT]** | NSVA, Miljörapport 2024 Öresundsverket | https://nsva.se/wp-content/uploads/2025/04/miljorapport-2024-oresundsverket.pdf |
| Ammoniumsulfat ((NH₄)₂SO₄) | **629** | kg | 2024 | RecoLab, Helsingborg | **[REALISERT]** | NSVA, Miljörapport 2024 Öresundsverket | (samme URL) |
| Biogass fra RecoLab | 13 169 | Nm³ | 2024 | RecoLab, Helsingborg | **[REALISERT]** | NSVA, Miljörapport 2024 | (samme URL) |

Sitat (NSVA 2024, s. ~28): «I anläggningen RecoLab genererades specifikt under år 2024: Struvit: 497 kg / Ammoniumsulfat: 629 kg.»
Sitat (s. ~8): «Under 2024 har allt behandlat gråvatten samt producerat slam letts till huvudströmmen på Öresundsverket.»

### 1b. Avledet N/P-innhold i de realiserte produktene — MERKET INFERENS, IKKE RAPPORTERT

Disse er **[AVLEDET]** fra rene molare formler på de rapporterte produktmengdene over (forutsetter ren forbindelse; faktisk renhet ikke oppgitt → øvre estimat):

| Næringsstoff | Avledet mengde | Fra | Regnestykke | Type |
|---|---|---|---|---|
| P fra struvitt | ≈ **63 kg P** | 497 kg struvitt | P-andel i ren struvitt ≈ 12,6 % | **[AVLEDET]** |
| N fra struvitt | ≈ 28 kg N | 497 kg struvitt | N-andel ≈ 5,7 % | **[AVLEDET]** |
| N fra ammoniumsulfat | ≈ **133 kg N** | 629 kg (NH₄)₂SO₄ | N-andel ≈ 21,2 % | **[AVLEDET]** |
| **Sum N (uthentet produkt)** | ≈ **161 kg N** | — | 28 + 133 | **[AVLEDET]** |
| **Sum P (uthentet produkt)** | ≈ **63 kg P** | — | kun struvitt | **[AVLEDET]** |
| K (kalium) | **ingen** | — | RecoLab-prosessen henter ikke ut K som produkt | **[REALISERT negativ]** |

**Tolkning:** Distriktsvis realisert *uthentet* gjenvinning i 2024 er i størrelsesorden ~0,16 t N og ~0,06 t P — svært lite, fordi RecoLab er et 2 000-pe utviklings-/demoanlegg (Oceanhamnen) og resten av næringsstrømmen resirkuleres internt i Öresundsverket i stedet for å hentes ut. Dette er konsistent med de tidligere kjente prosent-tallene (27 % av innkommende TP, 2,5 % TN realisert i 2023).

### 1c. Prosent-/per-pe-tall (ikke mengder — fra tidligere runde, ikke oppgradert her)

| Indikator | Verdi | Type | Kilde |
|---|---|---|---|
| Andel innkommende TP realisert | 27 % (2023) | **[PROSENT]** | LTU-avhandling diva2:1865215 / RecoLab driftsdata |
| Andel innkommende TN realisert | 2,5 % (2023) | **[PROSENT]** | samme |
| NPHarvest-pilot P-gjenvinning | 95 % | **[PROSENT]** | RISE / Svenskt Vatten |
| NPHarvest-pilot N-gjenvinning | ≥ 50 % | **[PROSENT]** | RISE / Svenskt Vatten |

**K (kalium) for RecoLab:** ikke hentet som mengde, og prosessen henter ikke ut K — så et K-tonn finnes ikke å rapportere.

---

## 2. Norsk fiskeslam — realisert bruk fordelt på sluttbruk

**Hovedfunn:** Ingen offentlig **nasjonalt aggregat** av faktisk innsamlet fiskeslam fordelt på sluttbruk (gjødsel/biogass/eksport) ble funnet. Det finnes (i) et nasjonalt *estimat* av oppsamlet mengde (NIBIO/Nofima), (ii) ett verifiserbart **selskaps-/eksportnivå-tall** (Terramarine/Grønn Vekst til Vietnam), og (iii) anleggs-/designtall uten realisert årsmengde. Alt aggregat på 300 000+ tonn-skala er **[POTENSIAL/MODELLERT]** (PwC/Ragn-Sells).

### 2a. Nasjonal kontekst (rammetall, ikke sluttbruk-fordeling)

| Indikator | Verdi | År | Type | Kilde (eier) | URL |
|---|---|---|---|---|---|
| Tap N til sjø fra oppdrett | 66 000 t N | 2019 | [MODELLERT] massebalanse | Broch & Ellingsen 2020 (via NIBIO) | https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/fiskeslam |
| Tap P til sjø fra oppdrett | 14 000 t P | 2019 | [MODELLERT] massebalanse | Broch & Ellingsen 2020 (via NIBIO) | (samme) |
| Andel ekskrementer/fôrrester som faktisk samles opp | **ca. 2 %** | ~2017 | **[PROSENT]** | Aas & Åsgard 2017 (Nofima), via NIBIO | (samme) |
| Oppsamlet slam fra settefisk (estimat) | ~84 150 t | ~2017 | [MODELLERT estimat] | NIBIO Rapport 2019;5(146) (Cabell m.fl.) | https://orgprints.org/37474/ |
| Pr. anlegg (57 settefiskanlegg) | ~492 t/anlegg | ~2017 | [AVLEDET fra over] | NIBIO Rapport 2019;5(146) | (samme) |

NIBIO bekrefter: kun **landbaserte** oppdrettere er i dag pålagt å samle opp fiskeslam; matfisk i åpne merder samler i praksis ikke opp slam. Derfor er nesten alt oppsamlet slam fra ferskvanns-/smolt-/postsmolt- og RAS-produksjon.

### 2b. Anleggs-/selskapsnivå — realiserte tall (det som faktisk kunne verifiseres)

| Aktør/anlegg | Realisert tall | Enhet | År | Sluttbruk | Type | Kilde | URL |
|---|---|---|---|---|---|---|---|
| Terramarine / Grønn Vekst (eksport til Vietnam) | ~5 500 t organisk gjødsel (~200 containere), hvorav fiskeslam er «viktig bestanddel» | t produkt/år | ~2020 | **Eksport (gjødsel)** | **[REALISERT, selskap]** — men sammensatt produkt; ren fiskeslam-andel ikke oppgitt | Intrafish/iLaks-omtale (Terramarine, T.N. Ugland); produksjon i samarbeid m/ IVAR Stavanger | https://ilaks.no/ser-apning-i-gjodselmarkedet-i-osten-gode-muligheter-for-avsetning-av-torket-fiskeslam/ |
| Hima Seafood, Rjukan (Sterner-leveranse) | 9 000 t fisk/år (design); «alt slam» → tørket organisk gjødsel | designkapasitet | 2023→ | Gjødsel (landbruk) | [DESIGN, ikke realisert årsmengde] | Sterner AS | https://www.sterneras.no/det-landbaserte-oppdrettsanlegget-pa-rjukan-investerer-stort-i-baerekraftig-behandling-av-slam/ |
| Bioretur AS (markedsleder slambehandling, landbasert) | drifter mange FRS-anlegg; tørket slam → råstoff/biogass | — | løpende | Gjødsel + biogass | **ingen offentlig realisert årsmengde** | Bioretur | https://bioretur.no/om-oss/ |
| Danish Salmon (DK, referanse) | ~35 t slam/uke → 7–8 t tørrstoff/uke | t/uke | ~2024 | (behandling) | [REALISERT, men dansk anlegg] | via søk (kyst.no) | https://www.kyst.no/ik/slambehandling-overholdes-utslippskravene/622390 |

Merk: Terramarine-tallet (~5 500 t) er **produkt-tonn av blandet gjødsel**, ikke rene fiskeslam-tonn og ikke N- eller P-tonn. Det skal ikke leses som «5 500 t fiskeslam» eller som et nasjonalt tall.

### 2c. Potensial-/modelltall (HOLDES ADSKILT — ikke realisert)

| Indikator | Verdi | Horisont | Type | Kilde (eier) | URL |
|---|---|---|---|---|---|
| Oppsamlbart slam, hele næringen | 334 000 t (2023) → 459 000 t (2030) → 1 018 000 t (2050) | scenario | **[POTENSIAL/MODELLERT]** | PwC for ARAL/Ragn-Sells | https://ilaks.no/slam-fra-forrester-og-fiskeekskrementer-kan-gi-strom-til-600-000-husstander/ |
| Utvinnbart P fra oppsamlet slam | 11 000 t P (2023) → 15 100 (2030) → 33 500 (2050) | scenario | **[POTENSIAL/MODELLERT]** | PwC for ARAL/Ragn-Sells | (samme) |
| Biogass fra slam | 112–309 mill. m³ metan (~3 TWh) | scenario | **[POTENSIAL/MODELLERT]** | PwC for ARAL/Ragn-Sells | (samme) |
| Slam fra havbruk innen 2050 | opptil 9 500 GWh biogass + 57 000 t N til gjødsel | 2050 | **[POTENSIAL/MODELLERT]** | SINTEF (via søk) | https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/ |

**Viktig kobling Helsingborg↔Norge:** Ragn-Sells/EasyMining planlegger Nordens første fosfor-gjenvinningsanlegg (ash2phos) i **Helsingborg** for bl.a. norsk fiskeslam-aske — men dette anlegget var **ikke bygd** (ventet på miljøtillatelse) per 2023-kilden. Altså finnes det per nå ikke et realisert P-gjenvinningstonn fra denne ruten heller.

---

## 3. Nasjonal-aggregat-gapet: hvem VILLE holdt tallet, og hvorfor det ikke er offentlig

- **Fiskeridirektoratet** publiserer «Nøkkeltall fra norsk havbruksnæring» (produksjon, biomasse, rømming, salg) — men **ikke** oppsamlet slam-/næringsmengde fordelt på sluttbruk. Slam er ikke en del av akvakulturstatistikken.
- **Miljødirektoratet / statsforvalterne** holder utslippstillatelser og miljørapportering per anlegg (Norske utslipp), men slam-håndtering rapporteres anleggsvis og ujevnt; det aggregeres ikke nasjonalt til gjødsel/biogass/eksport.
- **Mattilsynet** registrerer gjødselprodukter av organisk opphav (gjødselvareforskriften) — men registeret er et produkt-/godkjenningsregister, ikke en mengdestatistikk.
- **SINTEF/Kontali** dekker «marint restråstoff» (prosesseringsbiprodukter), som per definisjon **ikke** omfatter fiskeslam — så deres årlige utnyttelsestall fyller ikke gapet.
- **SSB** har ingen egen fiskeslam-/næringsgjenvinningsserie.

**Konklusjon på gapet:** Det nasjonale aggregatet av *realisert* innsamlet fiskeslam fordelt på sluttbruk er en **ekte offentlig-data-mangel**. Ingen enkelt etat har mandat/serie for det; tallene som finnes er enten (a) gamle estimat (NIBIO/Nofima ~2017), (b) modellerte scenarier (PwC/SINTEF), eller (c) kommersielt fortrolige selskapsdata (Bioretur, Terramarine, Sterner-kunder). Det samme gjelder RecoLab på N/P/K-nivå: kun de uthentede produktmengdene (struvitt/ammoniumsulfat) er offentlig realisert; total-N/P/K-balansen rapporteres som prosent/per-pe, ikke som distriktsvise årlige tonn.

---

## 4. Fortsatt manglende / hvordan lukke

**RecoLab**
- Eneste realiserte mengder: struvitt 497 kg + ammoniumsulfat 629 kg (2024). Total realisert N/P/K i tonn: **ikke rapportert** (kun avledet, se 1b).
- For å lukke: be NSVA/RecoLab om produkt-renhetsanalyse (faktisk N/P i struvitt+ammoniumsulfat) og om årsbalansen i tonn, ikke per-pe. Sjekk Interreg ANCHOR sluttrapportering 2024–2026 for distriktstall.

**Norsk fiskeslam**
- Ingen nasjonalt realisert sluttbruk-aggregat funnet. Beste verifiserbare realiserte selskapstall: Terramarine/Grønn Vekst ~5 500 t blandet gjødselprodukt til Vietnam (~2020) — ikke rene slam-tonn, ikke N/P.
- For å lukke:
  1. Direkte forespørsel til **Bioretur AS** (markedsleder) om årlig behandlet slam (t tørrstoff) og fordeling gjødsel/biogass.
  2. **HØST/Grønn Vekst/Terramarine** og **IVAR Stavanger** for faktiske eksport- og gjødselproduksjonsvolum nyere enn 2020.
  3. **Norske utslipp**-anleggsrapporter for navngitte landbaserte anlegg (settefisk/RAS) — manuell sum av slamproduksjon per anlegg.
  4. **NIBIO Rapport 2019;5(146)** (orgprints.org/37474) for det best dokumenterte nasjonale estimatet (~84 150 t settefisk-slam), og oppdatert tall fra NIBIO (Eva Brod) hvis nyere finnes.
  5. **SINTEF «Analyse marint restråstoff 2024»** kan brukes til prosesseringsbiprodukter, men **ikke** som fiskeslam-tall (avgrensning bekreftet).

---

## Kildeliste (hentede primær-/sekundærkilder)

- NSVA, *Miljörapport 2024 Öresundsverket* (PDF, lest): https://nsva.se/wp-content/uploads/2025/04/miljorapport-2024-oresundsverket.pdf — struvitt 497 kg, ammoniumsulfat 629 kg, RecoLab-biogass 13 169 Nm³ (2024); alt gråvann/slam → hovedstrøm.
- NIBIO, *Fiskeslam* (tema, publ. 12.06.2025, lest): https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/fiskeslam — 66 000 t N / 14 000 t P tap; ~2 % oppsamlet; kun landbasert pålagt oppsamling; lite K.
- NIBIO Rapport 2019;5(146): https://orgprints.org/37474/ — ~84 150 t settefisk-slam-estimat.
- Sterner AS, *Hima Seafood Rjukan* (lest): https://www.sterneras.no/det-landbaserte-oppdrettsanlegget-pa-rjukan-investerer-stort-i-baerekraftig-behandling-av-slam/ — 9 000 t fisk/år design, alt slam → gjødsel.
- iLaks, *Terramarine/Grønn Vekst eksport Vietnam* (lest): https://ilaks.no/ser-apning-i-gjodselmarkedet-i-osten-gode-muligheter-for-avsetning-av-torket-fiskeslam/ — eksport av fiskeslam-iblandet gjødsel; ~5 500 t/200 containere (via Intrafish-omtale).
- iLaks/PwC-ARAL (lest): https://ilaks.no/slam-fra-forrester-og-fiskeekskrementer-kan-gi-strom-til-600-000-husstander/ — POTENSIAL: 334 000 t slam, 11 000 t P; EasyMining/ash2phos Helsingborg ikke bygd per 2023.
- Bioretur AS, *Om oss* (lest): https://bioretur.no/om-oss/ — markedsleder, ingen offentlig årsmengde.
- SINTEF, *Analyse marint restråstoff 2024* (publikasjonsside, JS-skall — kun metadata): https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/ — restråstoff = prosesseringsbiprodukt, IKKE fiskeslam.

**Ikke-hentede (JS-skall/paywall):** SINTEF-publikasjonsside (kun metadata); Intrafish annonsørinnhold (tomt JS-skall); Fiskeribladet/Tekfisk (paywall); Fiskeridir Nøkkeltall-PDF (URL for lang for web_fetch — men kjent å ikke inneholde slam-tonnasje).
