# Danmark + Island — mineralgjødsel N/P/K, nyeste år (StatBank DK + Hagstofa)

**Uttrekksdato:** 2026-06-16
**Operatør:** automatisk uttrekk via `web_fetch` (GET) mot StatBank Danmark REST-API og Hagstofa PxWeb-API.
**Formål:** lukke datagap fra runde 1 — Danmarks **P og K for 2023/24** (var ikke hentet) og Islands **N/P/K nyeste år** (var ikke hentet). Norge (NIBIO 2023/24) og Sverige (SCB 2024/25) er allerede i hus og berøres ikke her.

---

## 1. Metode / metadatanotat

### Danmark — tabell `GOEDSALG`

- **Tabell-id:** `GOEDSALG` «Sale of mineral fertilizers» / «Salg af handelsgødning».
  - NB: Den eldre id-en **`GODNING5`** finnes **ikke** i API-et (gav tomt svar). Den korrekte aktive salgstabellen er `GOEDSALG`.
  - Søsterserie `KVAEL2` («Total supply of mineral fertilizers/content of pure nutrients») dekker N/P/K helt tilbake til 1983:1984, men har kun **Mio. kg** / **kg per hektar** og slutter på **2022:2023** — dvs. ikke nyeste år. `KVAEL2` brukt kun til kryssjekk av enhet/basis (ikke til hovedtallene).
- **Enhet:** Tonne (base `Tonne`, 2 desimaler i API-et).
- **Sist oppdatert i DST:** 2025-12-02. **Nyeste periode er foreløpig** (DST-fotnote).
- **Førsteperiode:** 2022:2023. **Nyeste periode: 2023:2024.** Serien er kort — `GOEDSALG` finnes bare for disse to gjødselårene.
- **Periodeformat:** gjødselår skrevet `ÅÅÅÅ:ÅÅÅÅ` (f.eks. `2023:2024` = 1. aug 2023 – 31. jul 2024, handelsgødningsår).

#### Dimensjoner i `GOEDSALG` (id-rekkefølge, `size`)
`["GOED"(3), "PRODUKT"(13), "NSTOF"(18), "MÅLEENHED"(2), "Tid"(2)]`

| Dimensjon | Kode brukt | Betydning |
|---|---|---|
| `GOED` (fertilizer type) | `10` | **Total fertilizer type** — denne gir det nasjonale totaltallet. (`15`=Organic, `20`=Inorganic; se kvalitetsmerknad under.) |
| `PRODUKT` (product) | `100` | «1 Total mineral fertilizers» (sum av alle mineralgjødselprodukter) |
| `NSTOF` (nutrients) | `1005` N · `1010` P · `1015` K | næringsstoff. Tekst i API: **«Nitrogen» / «Phosphorus» / «Potassium»** (grunnstoffbasis) |
| `MÅLEENHED` (unit of measurement) | `2` | **Nutrient amount** (rent næringsstoff i tonn). `1`=Fertilizer amount (produktvekt) — IKKE brukt. |
| `Tid` | `2022:2023`, `2023:2024` | gjødselår |

#### Basis (kritisk — ikke konvertert)
- **P rapporteres som P (fosfor, grunnstoff)** — ikke P₂O₅. `NSTOF`-teksten er «Phosphorus», og `KVAEL2`-søstertabellen heter «Phosphorus (P)». Ingen P₂O₅→P-konvertering gjort eller nødvendig.
- **K rapporteres som K (kalium, grunnstoff)** — ikke K₂O. `NSTOF`-teksten er «Potassium»; `KVAEL2` = «Potassium (K)».
- Dette matcher Norge/NIBIO- og Sverige/SCB-konvensjonen (grunnstoff-N/P/K), så DK-tallene er direkte sammenlignbare med de øvrige nordiske uten omregning.

#### Kvalitetsmerknad — valg av `GOED=10`
Med `MÅLEENHED=2` + `PRODUKT=100` gir **`GOED=10` (Total)** N(2023:2024) = **224 811,26 t**, som er **eksakt likt** det kjente DK 2023/24 N-tallet (224 811 t). Dette bekrefter at `GOED=10` er riktig selektor for nasjonal totalmengde. Splitten `GOED=15`/`20` (Organic/Inorganic) innenfor PRODUKT=100 oppfører seg uventet i API-et (Total N fordeler seg 223 714 t på `15` og bare 1 097 t på `20`), trolig en intern DST-klassifiseringsartefakt; den **brukes derfor ikke** — Total (`GOED=10`) er det validerte tallet og rapporteres her.

#### DST-kildemerknad (fotnote fra API)
Tallene er innrapporterte salgsmengder av handelsgødning til Landbrugsstyrelsen (Danish Agency for Green Land Conversion and Water Environment), inkl. salg til distributører og sluttbrukere. Frivillig innrapportering av avgiftsfrie mengder; egenimport ikke registrert. Tallene er derfor **ikke** en komplett markedsoversikt. Dokumentasjon: `https://www.dst.dk/documentationofstatistics/a9fe5dae-435f-4ac2-9133-35e21a72cd0e`.

### Island — tabell `LAN10001.px`

- **Tabell-id:** `LAN10001.px` «Consumption of artificial fertilizers from 1977».
- **Sti (en):** `Atvinnuvegir/landbunadur/landaburdur/LAN10001.px`.
- **Sist oppdatert i Hagstofa:** 2025-12-02.
- **Dimensjoner (GET-metadata):**
  - `Ár` (Year): 1977…**2024** (nyeste tilgjengelige år = **2024**).
  - `Áburður` (Fertilizer): `0`=**Nitrogen (N)**, `1`=**Phosphorus (P)**, `2`=**Potash (K)**.
- **Basis:** verditekstene er **«Nitrogen (N)» / «Phosphorus (P)» / «Potash (K)»** → grunnstoffbasis (P, ikke P₂O₅; K, ikke K₂O), konsistent med DK/NO/SE. (Enhet er ikke eksponert som egen dimensjon i metadataen; PxWeb-tabellen bærer enheten i selve dataresponsen, som ikke kunne hentes — se GET-vs-POST under.)

#### GET-vs-POST håndtering (Island er POST-blokkert)
Hagstofa kjører **klassisk PxWeb v1**. Datauttrekk krever **POST** med en JSON-spørringskropp; `web_fetch` er **GET-only** og kan ikke utføre POST. Alle forsøk på å hente data via GET (querystring `?Ár=2024&Áburður=...`, `?outputFormat=json&valueCodes[...]`, lagret spørring `/pxen/sq/...`) returnerte **kun metadata** eller tomt. v2-beta-endepunktet (som ville støttet GET-data) finnes **ikke** på denne instansen (`/pxen/api/v2-beta/...` → tomt). **Konklusjon: Island N/P/K 2024 = «ikke hentet» (POST-blokkert).** Reproduserbar spørring er gitt i §3 og er klar til kjøring straks et POST-kapabelt verktøy er tilgjengelig.

### Verktøymerknad (reproduserbarhet, DK)
StatBank `/data/{id}/JSONSTAT`-endepunktet returnerer JSON-stat via **GET** når alle ikke-eliminerbare dimensjoner har gyldige koder. `MÅLEENHED` må url-enkodes som `M%C3%85LEENHED`; gjødselårskoden `2023:2024` enkodes `2023%3A2024`. `/tableinfo/{id}` og `/tables?subjects=...` ga tomt svar for ugyldig id/emnekode (slik ble `GODNING5`-feilen avslørt); riktig emnekode for «Foder, gødning og pesticider» er **`20475`** (funnet via `/subjects/6?recursive=true`).

---

## 2. Datatabeller

### Danmark — `GOEDSALG`, ren næringsstoffmengde i tonn (GOED=10 Total, PRODUKT=100, MÅLEENHED=2)

| år (gjødselår) | næringsstoff | tonn | basis | kilde-tabell | datakvalitet |
|---|---|---:|---|---|---|
| 2022:2023 | N (Nitrogen) | 178 645,58 | grunnstoff N | GOEDSALG | endelig |
| 2022:2023 | P (Phosphorus) | 10 703,19 | grunnstoff P (ikke P₂O₅) | GOEDSALG | endelig |
| 2022:2023 | K (Potassium) | 38 575,40 | grunnstoff K (ikke K₂O) | GOEDSALG | endelig |
| **2023:2024** | **N (Nitrogen)** | **224 811,26** | grunnstoff N | GOEDSALG | **foreløpig** |
| **2023:2024** | **P (Phosphorus)** | **16 858,88** | grunnstoff P (ikke P₂O₅) | GOEDSALG | **foreløpig** |
| **2023:2024** | **K (Potassium)** | **53 264,70** | grunnstoff K (ikke K₂O) | GOEDSALG | **foreløpig** |

> Validering: N 2023:2024 = 224 811,26 t matcher det kjente DK-tallet (224 811 t) eksakt → bekrefter selektorvalg og metode.

### Island — `LAN10001.px`, N/P/K 2024

| år | næringsstoff | tonn | basis | kilde-tabell | datakvalitet |
|---|---|---:|---|---|---|
| 2024 | N (Nitrogen) | **ikke hentet** (POST-blokkert) | grunnstoff N | LAN10001.px | — |
| 2024 | P (Phosphorus) | **ikke hentet** (POST-blokkert) | grunnstoff P (ikke P₂O₅) | LAN10001.px | — |
| 2024 | K (Potash) | **ikke hentet** (POST-blokkert) | grunnstoff K (ikke K₂O) | LAN10001.px | — |

Nyeste tilgjengelige år per metadata = **2024**. Verditekster bekrefter grunnstoffbasis (N / P / K). Enhet ikke verifisert (kunne ikke hente dataresponsen); historisk rapporterer Hagstofa denne serien i **tonn** næringsstoff, men dette må bekreftes ved faktisk POST-uttrekk før sitering.

---

## 3. Eksakte API-spørringer brukt (siterbare URL-er)

### Danmark (GET, fungerte)
- Emnetre (for å finne riktig tabell): `https://api.statbank.dk/v1/subjects/6?format=JSON&recursive=true` → emne `20475` «Foder, gødning og pesticider».
- Tabelliste i emnet: `https://api.statbank.dk/v1/tables?format=JSON&subjects=20475`
- Tabellmetadata: `https://api.statbank.dk/v1/tableinfo/GOEDSALG?format=JSON&lang=en`
- **Hoveddata (N/P/K, begge år, ren næringsstoffmengde):**
  `https://api.statbank.dk/v1/data/GOEDSALG/JSONSTAT?lang=en&GOED=10&PRODUKT=100&NSTOF=1005,1010,1015&MÅLEENHED=2&Tid=2022:2023,2023:2024`
  (url-enkodet: `...&GOED=10&PRODUKT=100&NSTOF=1005,1010,1015&M%C3%85LEENHED=2&Tid=2022%3A2023,2023%3A2024`)
  → `value:[178645.58, 224811.26, 10703.19, 16858.88, 38575.4, 53264.7]` i rekkefølge N·P·K × (2022:2023, 2023:2024).
- Valideringsspørring (N etter GOED-type): `...&GOED=10,15,20&PRODUKT=100&NSTOF=1005&MÅLEENHED=2&Tid=2023:2024` → Total N = 224 811,26.

### Island (POST-only — KLAR spørring, ikke kjørbar med GET-verktøy)
- **Metadata (GET, fungerte):** `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/landbunadur/landaburdur/LAN10001.px`
- **POST-endepunkt (data):** `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/landbunadur/landaburdur/LAN10001.px`
- **JSON-spørringskropp som VIL hente N/P/K 2024:**
  ```json
  {
    "query": [
      { "code": "Ár", "selection": { "filter": "item", "values": ["2024"] } },
      { "code": "Áburður", "selection": { "filter": "item", "values": ["0", "1", "2"] } }
    ],
    "response": { "format": "json-stat2" }
  }
  ```
  (Alternativ `"format": "csv"` gir CSV.) Kjør som HTTP POST med `Content-Type: application/json`.

---

## 4. Kontroll: DK 2021/22-baseline vs nyeste

Runde-1-baseline var **Landbrugsstyrelsen 2021/22** (N 238 846 / P 11 897 / K 44 047 t). Merk: dette er en **annen serie/kilde** enn `GOEDSALG` (som bare starter 2022:2023), så sammenligningen er mellom kilder, ikke innen samme tidsserie. N-kryssjekk mot kjent 2023/24 = 224 811 t bekreftet.

| Næringsstoff | 2021/22 (Landbrugsstyrelsen, baseline) | 2023:2024 (GOEDSALG, nytt) | Endring | Endring % |
|---|---:|---:|---:|---:|
| N | 238 846 | 224 811,26 | −14 035 | **−5,9 %** |
| P (grunnstoff) | 11 897 | 16 858,88 | +4 962 | **+41,7 %** |
| K (grunnstoff) | 44 047 | 53 264,70 | +9 218 | **+20,9 %** |

> Innen `GOEDSALG`-serien selv (2022:2023 → 2023:2024): N +25,8 %, P +57,5 %, K +38,1 % — kraftig oppgang fra et lavt 2022/23 (etterspørselssjokk/prissjokk etter 2022). 2023:2024 er foreløpig og kan revideres ned. Tolk endringene som retning, ikke presise nivåer, før endelige tall foreligger.

---

## 5. Fortsatt manglende / oppfølging

- **Island N/P/K 2024 — «ikke hentet» (POST-blokkert).** Klar reproduserbar POST-spørring i §3; trenger et POST-kapabelt hentverktøy. Nyeste år bekreftet = 2024. Enhet (sannsynlig tonn) ikke verifisert.
- **DK 2023:2024 er foreløpig** (DST-fotnote, «newest period is preliminary»). Forventes revidert ved neste publisering (~des. 2026). Behandle P 16 858,88 / K 53 264,70 / N 224 811,26 t som foreløpige.
- **GOEDSALG-serien er kort** (kun 2022:2023 og 2023:2024). For lengre P/K-historikk på grunnstoffbasis: bruk `KVAEL2` (1983:1984–2022:2023, Mio. kg) — men den når ikke 2023:2024.
- **2021/22-baseline (Landbrugsstyrelsen) er en annen kilde enn GOEDSALG.** Endrings-%-ene i §4 krysser kilder; en ren innen-serie-sammenligning er bare mulig fra 2022:2023.
- **GOED Organic/Inorganic-split (`15`/`20`) ikke brukt** pga. uventet API-fordeling innenfor PRODUKT=100; kun Total (`10`) rapportert. Hvis ren-mineralsk (uorganisk) andel ønskes spesifikt, må DST-dokumentasjonen konsulteres for korrekt kryss.
- **MÅLEENHED=1 (produktvekt) ikke hentet** — kun ren næringsstoffmengde (MÅLEENHED=2) er relevant for N/P/K-sammenligning.
