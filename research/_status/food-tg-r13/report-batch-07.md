---
tittel: Food TG R13 — Batchrapport 07
dato: 2026-06-28
goal: Food TG Research OS Runde 13 (autonom)
batch: 07
prompter: R13-AKTOR-004, R13-AKTOR-005, R13-AKTOR-006, R13-AKTOR-007
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 07 — Food TG R13

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-AKTOR-004, R13-AKTOR-005, R13-AKTOR-006, R13-AKTOR-007 |
| park | 0 | — |
| aktørspørsmål | 2 | R13-AKTOR-004, R13-AKTOR-005 |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-AKTOR-004 | Regenerative og agroøkologiske praktikere | enrich | actor-gate | A (Regenerativt Norge org-side, NIBIO REKORN, NorSøk) + B (alle enkeltgårder selvrapportert) | regenerativtnorge.no/om-organisasjonen/, juni 2026 | Antall aktive regenerative bønder mangler primærkilde; HM-utøverkart ikke offentlig navneliste | aktørspørsmål |
| R13-AKTOR-005 | Frøbevarings- og genressurs-nettverk | enrich | actor-gate | A (KVANN, NordGen, Solhatt, Norsk Genressurssenter/NIBIO, Landbruksdirektoratet) | kvann.no/om-oss, 2026 | Nåværende KVANN-medlemstall, NordGens norsk-spesifikke frøprøvetall og tilskudd post-2018 ikke offentlig | aktørspørsmål |
| R13-AKTOR-006 | Eierskap og founders i sirkulær/altprotein/CEA | enrich | PCQ | A (Brreg rolledata 8 selskaper) + B (sekundær for founders/Gruten/Rest) + C (aksjonærregister) | Brreg Enhetsregisteret API, 2026-06-28 | Aksjonærregister systematisk ikke-offentlig; Gruten AS ikke identifisert; Rest AS slettet | vent |
| R13-AKTOR-007 | Skogshage og permakultur-sites | enrich | actor-gate | A (Norsk Permakulturforening org-side, KVANN Root2Fork) + B (alle enkeltsite selvrapportert) + C (kommentarfelt) | permakultur.no/nettverk/land/, 2026 | Alle sites selvrapporterte uten feltverifikasjon; Google Maps-embed ikke maskinlesbar | vent |

## Per-target outcome

### R13-AKTOR-004 — Regenerative og agroøkologiske praktikere

**Beslutning:** enrich → actor-gate (aktørspørsmål)

**Nøkkelfunn:**
- **Regenerativt Norge** (regenerativtnorge.no) er den primære organisasjonen — bekreftet aktiv juni 2026 med webside, prosjekter og organisasjonsstruktur. Intet Brreg-org.nr funnet, organisert som forening.
- **Holistic Management Norge** (holisticmanagement.no) er et parallelt rammeverk med eget nettverk av praktikere. Publiserer utøverkart men ikke som offentlig navneliste.
- **Forskningsprosjekter:** NIBIO REKORN (regenerative dyrkingsmetoder i korn) og NorSøk (nordisk agroøkologinettverk 2024) er A-klasse forankringspunkter — men prosjektgårder ikke navngitt i tilgjengelige offentlige dokumenter.
- **11 enkeltgårder** navngitt med kilde og region (B-klasse, selvrapportert): Korsvik Gård (Lier), Evig Grønne Enger (Oppland), Linderud Gård, Ringeriksveien Gård m.fl. — alle fra media, organisasjonssider eller egne nettsider.
- **Ruralis** ikke identifisert som sentral aktør i regenerativt landbruk — Ruralis fokuserer på rural økonomi, ikke praksisorientert regenerativt landbruk.
- Totalpåstand om antall regenerative bønder i Norge finnes ikke i åpne primærkilder.

**Ikke si:** det finnes X regenerative bønder i Norge, Regenerativt Norge sertifiserer gårder, NIBIO anbefaler regenerativt landbruk som offisiell policy.

---

### R13-AKTOR-005 — Frøbevarings- og genressurs-nettverk

**Beslutning:** enrich → actor-gate (aktørspørsmål)

**Nøkkelfunn:**
- **KVANN** (Norsk etnobotanisk forening, kvann.no): stiftet 2016, 800+ medlemmer ved stiftelse (nåværende tall ikke publisert). Aktiv 2026: Root2Fork-prosjekt (Forskningsrådet-finansiert), Schübelers hager-nettverk (~80 hager), internasjonal frøpolitikk (Nordic Seed Alliance). Primær norsk frøbevaringsaktør.
- **Norsk Genressurssenter/NIBIO** (Ås): statlig koordineringsorgan under LMD. Fagleder Linn Borgen Nilsen. Samarbeider med KVANN og administrerer statlige genressurstilskudd (2018-figur: NOK 6,8 mill. til 66 prosjekter; post-2018 tall ikke offentlig).
- **NordGen** (Alnarp, SE + norsk kontor i Ås): nordisk genbank med ~33 000 frøprøver. Svalbard Global Seed Vault: 70. depositum juni 2026 — 1,4 mill. prøver totalt. Søknadsbasert tilgang via GENBIS-database.
- **Solhatt** (Stange, Innlandet): norsk kommersielt frøforetak. 600+ sorter totalt, 120+ norskproduserte (2026, selvrapportert). Selger til hobbydyrkere og profesjonelle.
- **Dedup-funn:** "Frøsamlerne" i prompten = dansk frøsamlerforening (froesamlerne.dk), **ikke norsk**. Dokumentert samarbeid med KVANN via Nordic Seed Alliance.
- **Nordic Seed Alliance**: samarbeid mellom KVANN (NO), Sesam (SE), Frøsamlerne (DK), Permakultur Danmark, Praktisk Økologi — webinar-serie 2025-2026, ikke en formell juridisk enhet.

**Ikke si:** Frøsamlerne er norsk, KVANN har 800+ medlemmer (uten kildedatering), NordGen holder X norske sorter (uten GENBIS-søk), Landbruksdirektoratet bevilger 6,8 mill. kr i dag (2018-tall).

---

### R13-AKTOR-006 — Eierskap og founders i sirkulær/altprotein/CEA

**Beslutning:** enrich → PCQ (vent)

**Nøkkelfunn:**
- **Brreg rolledata** (A-klasse) kartlagt for 8 selskaper:
  - Invertapro AS (917 809 755): dagl. leder Alexander Solstad Ringheim, styreleder Jon Grønsberg. Stiftet 2016, NOK 4,9M kapital.
  - NorInsect AS (916 325 010) + NorInsect Holding AS (919 470 372): dagl. leder Harald Larsen Espeland, styreleder Helge Orten.
  - Vestkorn Milling AS (994 423 592): dagl. leder/styreleder Ivana Steiro, styremedlem Johannes Bindels. 66 ansatte.
  - Norwegian Mycelium AS (925 995 762): dagl. leder Ingrid Dynna, styreleder Maren Hjorth Bauer. FoU-fase.
  - Avisomo AS (920 937 659): dagl. leder Martin Molenaar. 17 ansatte.
  - Onna Greens AS (917 653 135): dagl. leder Tobias Eckbo Dager. 50 ansatte, kapitalforhøyelse juni 2026.
  - Vertical Agri AS (926 085 611): svak aktivitetsprofil.
- **Restaurant Rest AS** (919 972 696): bekreftet slettet 2025-06-18, konkurs 2024-09-05. Rolledata ikke tilgjengelig fra slettet enhet.
- **Gruten AS**: ikke identifisert i Brreg under det navnet — kan være driftsselskap under annet navn.
- **Systematisk C-celle:** Aksjonærregister er ikke offentlig via API. Eierstruktur utover styreroller er ikke bekreftbar uten betalt tilgang (Proff Forvalt/Skatteetaten). dsm-firmenich-tilknytning for Vestkorn ikke bekreftbar via Brreg.

**Ikke si:** eierskap er kjent, daglig leder = founder, Vestkorn er eid av dsm-firmenich (via Brreg), NorInsect er eid av Helge Orten (styreleder, ikke nødvendigvis aksjonær).

---

### R13-AKTOR-007 — Skogshage og permakultur-sites

**Beslutning:** enrich → actor-gate (vent)

**Nøkkelfunn:**
- **Norsk Permakulturforening** (permakultur.no): eneste norske nettverk med besøksbasert godkjenning via LAND-systemet. Lister 4 LAND-sentre og 4 LAND-lærlinger per juni 2026.
  - LAND-sentre: Alvastien Telste (Hordaland), Permakulturplanter (Tingvoll), Sletta Permakultursenter (Nesodden), The Edible Garden (Malvik/Stephen Barstow).
  - LAND-lærlinger: Dharma Mountain (Hedalen), Eldrids Skoghage (Sunnfjord), Matskogen Landås (Bergen), Efferus (Undrumsdal).
- Skoghagekart på permakultur.no er en Google Maps-embed med selvregistrerte markører — ikke maskinlesbar, ikke offentlig datatabell.
- **KVANN Root2Fork-forum** åpnet juni 2026 med eksplisitt søk etter skoghage/agroforestry-utøvere. Kommentarfelt viser nye praktikere (Elverum→Hurdal-eksempel). Kan gi rikere aktørliste høst 2026.
- **Hurdal Økolandsby**: verifisert eksisterende økolandsby men skogshage-status ikke bekreftet fra primærkilde.
- 13 sites totalt dokumentert — alle B-klasse (selvrapportert til organisasjonsnettverk).
- Ingen offentlig, uavhengig verifisert nasjonal inventarliste eksisterer.

**Ikke si:** fullstendig nasjonal inventarliste eksisterer, LAND-sentre er de eneste permakultursitene i NO, Schübelers Hager = skogshager, Hurdal Økolandsby har dokumentert skogshage.

---

## Oppfølgingspunkter

- **AKTOR-004**: Kontakt Regenerativt Norge for utøverkart/liste. Sjekk NIBIO REKORN for navngitte pilotgårder (midtveisrapport?). Holistic Management Norge: be om utøverkart.
- **AKTOR-005**: Kontakt KVANN for nåværende medlemstall. Søk GENBIS for norskspesifikke frøprøvetall fra NordGen. Sjekk Landbruksdirektoratets genressurstilskudd 2019-2025 (nye tall).
- **AKTOR-006**: Proff Forvalt/Skatteetaten for aksjonærregister (betalt tilgang nødvendig). Sjekk dsm-firmenich årsrapport for Vestkorn-eierstruktur. Søk Brreg alternativt for Gruten.
- **AKTOR-007**: Vent på KVANN Root2Fork-forum (høst 2026). Kontakt Norsk Permakulturforening for oppdatert skoghagekart-data. Sjekk Camphill-gårder separat.
- Ingen av batch-07-outputene åpner ekstern claim, visualisering eller whitepaper-stemme.
