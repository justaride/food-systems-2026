# Fiskeridirektoratet åpne data — første innhøsting (2026-08-05)

**Formål:** Tette datagapet beskrevet i `DATAGAP-ANALYSE-2026-07-06.md` §6 («Fiskeridirektoratet
landings-/kvoteregister + biomasse — aktivitet for 270 sjømataktører — åpen, ubrukt — gratis»).
Dette er **kun staging**: ingen databaseskriving er gjort, ingen git-mutasjoner er gjort.
Import skal skje først når eier gjenåpner den fail-closed apply-løypa.

**Lisens:** Alle data er underlagt [Norsk lisens for offentlige data (NLOD)](https://www.fiskeridir.no/statistikk-tall-og-analyse/lisens-for-bruk-av-fiskeridirektoratets-data).
Kilde må oppgis: «Fiskeridirektoratet». Ingen autentisering kreves for noen av kildene under.

---

## 1. Kilder og endepunkter

| Kilde | Endepunkt | Format | Oppdatering |
|---|---|---|---|
| Fangstdata (seddel koblet m/ fartøydata) | `https://register.fiskeridir.no/uttrekk/fangstdata_YYYY.csv.zip` (2000–2026) | zip med semikolon-CSV, UTF-8, 133 kolonner | Inneværende + 2 foregående år oppdateres **hver natt** (unntatt natt til lørdag); eldre år ved behov |
| Fartøyregisteret (merkeregisteret) | `https://api.fiskeridir.no/vessel-api/api/v1/vessels` (OpenAPI: `/vessel-api/api/openapi`) | JSON, paginert (maks 200/side) | Løpende; 4 935 aktive fartøy pr. 2026-08-05 |
| Fisketillatelser m/ fartøytilknytning + kvotestørrelser | `https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-yrkesfiske/apne-data-fiskere-fartoy-og-fisketillatelser` (xlsx-vedlegg) | xlsx, ett ark per år (2001–2025) | Årlig |
| Akvakulturregisteret (lokaliteter) | `https://gis.fiskeridir.no/server/rest/services/Yggdrasil/Akvakulturregisteret/FeatureServer/0/query` | ArcGIS REST JSON/GeoJSON | Løpende (1 779 lokaliteter) |
| Biomasse (siste månedsrapport per lokalitet) | `https://gis.fiskeridir.no/server/rest/services/Yggdrasil/Biomasse/FeatureServer/0/query` | ArcGIS REST JSON/GeoJSON | Månedlig (1 127 lokaliteter med status `har_fisk`, art, `siste_rapport`) |
| Akvakulturregisteret API (orgnr → lokaliteter/tillatelser) | `https://api.fiskeridir.no/pub-aqua/api/v1/entities/sites-by-entity-nr/{orgnr}` | JSON | Løpende. **Brukes allerede av** `scripts/import-akvakulturregister.ts` |

Dokumentasjon:
- `Dokumentasjon_Fangst_Fartoy_Apne_Data.pdf` (feltdefinisjoner fangstdata, 34 s.)
- `datadokumentasjon-fisketillatelser.pdf`
- `vessel-api-openapi.yaml` (OpenAPI 3.1 for fartøy-API-et)

### Viktige feltforbehold (fra dokumentasjonen)
- `Fisker ID` i fangstdata kan være fødselsnummer, org.nr. eller salgslagets interne kundenummer,
  og er **ikke kvalitetssikret historisk** — ikke bruk det som primær join-nøkkel. Bruk
  `Fartøy ID` → fartøyregister → eier-orgnr i stedet.
- Verdifelter (`Fangstverdi`, `Beløp for kjøper` m.fl.) er **ikke utfylt** i de åpne dataene
  (konkurransesensitivt). Vekt (`Rundvekt`) er aktivitetssignalet.
- Fangstdata inneholder flere dokumentversjoner; aggregeringsskriptet dedupliserer på
  (`Dokumentnummer`, `Linjenummer`) og beholder siste versjonstidspunkt.

---

## 2. Innhentede filer

| Fil | Innhold | Størrelse | Rader/elementer |
|---|---|---|---|
| `fangstdata_2026.csv.zip` | Rådata landings-/sluttsedler 2026 t.o.m. 04.08.2026 (Last-Modified 05.08.2026 04:30) | 22,8 MB (644 MB utpakket) | ~4 200 fartøy med landing |
| `fangst_aktivitet_2026_per_fartoy.csv` | Aggregat per `Fartøy ID`: antall sedler, rundvekt kg, siste landingsdato, topp-3 arter | 0,5 MB | 4 186 fartøy + 1 aggregatrad uten fartøy-ID (bl.a. tare) |
| `fangst_aktivitet_2025_per_fartoy.csv` | Tilsvarende for hele 2025 (strømmet via `curl \| funzip`, råfil ikke lagret) | 0,5 MB | 4 591 fartøy |
| `aggreger_fangstdata.py` | Skriptet som produserer aggregatene (kjørbart for alle år 2000–2026) | 3 KB | — |
| `fartoyregister_2026-08-05.json` | Alle aktive fartøy m/ eiere (eier-`id` = orgnr for selskaper) | 2,4 MB | 4 935 fartøy |
| `fisketillatelser-med-fartoytilknytning-kvotestorrelser.xlsx` | Kvotestørrelser/hjemmelslengder per fartøy per år 2001–2025 | 26,4 MB | ~19 000 linjer for 2025 |
| `fisketillatelser-uten-fartoytilknytning-kvotestorrelser.xlsx` | Tillatelser uten fartøytilknytning | 2,1 MB | ikke analysert |
| `kvotestorrelser_2025.csv` | Ekstrahert 2025-ark fra xlsx over (ren CSV) | 3,0 MB | 19 013 linjer |
| `akvakulturregisteret_arcgis_2026-08-05.json` | Alle godkjente lokaliteter m/ kapasitet, kommune, produksjonsområde, arter, tillatelser | 1,6 MB | 1 779 lokaliteter |
| `biomasse_arcgis_2026-08-05.json` | Status per lokalitet ved siste månedsrapport: `har_fisk`, art, `siste_rapport` | 0,5 MB | 1 127 lokaliteter |
| `pubaqua_oppslag_havbruk_2026-08-05.json` | Råresultat pub-aqua-oppslag for de 120 havbruksaktørenes orgnr | 5,6 MB | 120 oppslag (86 med lokaliteter, 34 HTTP 404 = ingen lokaliteter) |
| `prosjekt_sjomatakterer_fra_kandidatcsv.json` | Prosjektets 270 sjømataktører m/ orgnr, bygget fra `research/_status/mvk-{villfisk,havbruk}-*-node-kandidater.csv` | 57 KB | 270 aktører (150 villfisk, 120 havbruk) |
| `match_villfisk_aktorer_2026-08-05.json` | Matchanalyse villfisk (se §3) | 0,3 MB | 111 aktører med fartøy |
| `match_havbruk_aktorer_2026-08-05.json` | Matchanalyse havbruk (se §3) | 0,2 MB | 86 aktører med lokalitet |

Totalt ca. 65 MB. År før 2026 hentes enkelt etter behov:
`curl -s https://register.fiskeridir.no/uttrekk/fangstdata_2024.csv.zip | funzip | python3 aggreger_fangstdata.py > fangst_aktivitet_2024_per_fartoy.csv`
(ca. 50 MB zip per år; lagre aggregat, ikke råfil).

Ikke hentet (dokumentert, kan hentes ved behov):
- `fartøy-eier-første-ledd.xlsx` (21 MB, eierkjede første ledd) — lenke på fisketillatelser-siden over.
- ERS (fangstdagbok) og VMS (posisjoner): egne åpne datasett under
  `/statistikk-tall-og-analyse/data-og-statistikk-om-yrkesfiske/apne-data-elektronisk-rapportering-ers`
  og `.../apne-data-posisjonsrapportering-vms`. Stort volum; ikke nødvendig for aktivitetssignal.
- Kvoteregisteret som bulkuttrekk per fartøy utover xlsx-ene over finnes ikke åpent; fartøyregisterets
  webgrensesnitt viser enkelte kvoteordninger per fartøy (manuelt oppslag).

---

## 3. Matchanalyse mot prosjektets 270 sjømataktører

Aktørlista er bygget fra prosjektets egne kandidat-CSV-er (`research/_status/mvk-villfisk-*` og
`mvk-havbruk-*-node-kandidater.csv`), deduplisert på org.nr. — nøyaktig 150 villfisk + 120 havbruk,
som i gap-analysen.

### Villfisk (150 aktører) — join-nøkkel: orgnr → fartøyeier → Fartøy ID → landinger/kvoter

| Signal | Antall | Andel |
|---|---|---|
| Eier ≥1 aktivt fartøy i merkeregisteret (COMPANY-eier m/ orgnr) | 111 | 74 % |
| … med ≥1 landing i 2025 **eller** 2026 | 108 | 72 % |
| … med landing i 2026 (altså aktiv i år) | 104 | 69 % |
| … med registrert kvotestørrelse/hjemmelslengde 2025 | 91 | 61 % |

Resten (39 uten fartøy): typisk rederier som eier via datterselskap/andre juridiske enheter,
personlige eiere (PERSON-entiteter i fartøyregisteret er ikke orgnr-koblet), eller rene
investeringsselskaper uten egen drift — disse bør menneske-verifiseres (actor-gate), ikke antas inaktive.

### Havbruk (120 aktører) — join-nøkkel: orgnr → pub-aqua lokaliteter (siteNr) → biomassestatus

| Signal | Antall | Andel |
|---|---|---|
| ≥1 lokalitet i Akvakulturregisteret (pub-aqua) | 86 | 72 % |
| … med ≥1 **aktiv** tillatelsestilknytning | 86 | 72 % |
| … med ≥1 lokalitet med **fisk stående** ved siste månedsrapport | 63 | 53 % |

De 86 aktørene dekker til sammen 1 077 lokalitetstilknytninger. De 34 uten lokalitet er i hovedsak
landbaserte/anlegg under etablering, eller org.nr. er holding-/morselskap der driftsenheten bærer
tillatelsen — samme actor-gate-forbehold gjelder.

### Oppsummert
- **194 av 270 aktører (72 %) kan løftes fra «registrert» til «verifisert aktiv»** med registre
  alene (108 villfisk m/ landing, 86 havbruk m/ aktiv tillatelse).
- Et sterkere «aktiv nå»-signal (landing i 2026 / fisk stående) gjelder 167 aktører (62 %).
- Konkrete join-nøkler: **orgnr** (Company.orgNr ↔ vessel-api owners[].id ↔ pub-aqua
  `openLegalEntityNr`), **Fartøy ID** (10-sifret, felles for fangstdata/kvotestørrelser/vessel-api),
  **lokalitetsnummer** (AquacultureSite.localityNumber ↔ pub-aqua `siteNr` ↔ ArcGIS `loknr`).

---

## 4. Forslag til import (kun når eier gjenåpner fail-closed apply-løypa)

### 4.1 AquacultureSite (287 eksisterende rader)
- Verifiser `localityNumber` mot `akvakulturregisteret_arcgis_2026-08-05.json` (loknr): oppdater
  `licenseStatus` (`status_lokalitet`), `capacityTonnes` (`kapasitet_lok`/`tempcapacity`),
  `species` (`til_arter`), `municipalityNo`, `lat/lng`, `source = 'fiskeridir-akvakulturregisteret'`.
- Legg biomassestatus i `metadata` (f.eks. `metadata.fdirBiomasse = {harFisk, art, sisteRapport}`)
  — ikke ny modell; dette er månedlig snapshot, ikke tidsserie.
- `verificationStatus`-forslag: `registry_verified` for lokaliteter som finnes i registeret;
  `activity_verified` (ny verdi, eller dokumentert i metadata) når `har_fisk = 'Ja'`.

### 4.2 Company (villfisk- og havbruksaktører)
- Aktivitetssignal i `metadata`, ikke nye felt:
  `metadata.fdirAktivitet = {landing2025: bool, landing2026: bool, sisteLandingsdato,
  rundvekt2025Kg, rundvekt2026Kg, antallFartoy, kvoter2025: [...]}`.
- `registrySource = 'fiskeridir-fangstdata'`, `registryVerifiedAt = 2026-08-05`.
- Ikke skriv `verificationStatus = verified` på Company-nivå uten actor-gate; bruk prosjektets
  eksisterende `machine_verified`-nivå for registermatch, siden eierskap kan gå via datterselskaper.

### 4.3 Eventuell ny relasjon (vurderes av eier, krever migrering)
- `FishingVessel`-modell (fartoyId, registreringsmerke, navn, lengde, eier → Company) og
  `LandingAggregate`-modell (fartoyId/companyId, år, rundvektKg, antallSedler) ville gitt
  tidsserie-støtte. Ikke nødvendig for gap-lukkingen — metadata-feltene over dekker behovet.

### 4.4 Friskhet/rutine
- Fangstdata og fartøyregister oppdateres nattlig; biomasse månedlig. En månedlig
  re-kjøring av `aggreger_fangstdata.py` + pub-aqua-oppslag holder signalet ferskt
  (jf. «ferskhet dør uten overvåkning» i gap-analysen §4).

## 5. Gjenstående / eieravgjørelser
- **39 villfisk- og 34 havbruksaktører uten registertreff:** actor-gate / manuell verifisering
  (eierskap via datterselskap, PERSON-eiere, eller reelt inaktive).
- **Verdifelter** (fangstverdi, priser) er ikke i åpne data — volum må holde som aktivitetssignal.
- **Kvoter per selskap** (ikke fartøy): krever opprulling av fartøy→eier, gjort i matchfilen;
  formelt kvoteregister per rederi er ikke åpent bulk.
- **Import:** alt over er staged, ikke applied. Apply-løypa er fail-closed frem til eier åpner den.
