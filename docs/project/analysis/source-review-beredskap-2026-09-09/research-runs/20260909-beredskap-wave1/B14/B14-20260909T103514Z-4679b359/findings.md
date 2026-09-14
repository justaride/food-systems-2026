# B14 findings — Nordisk mattilgang: FIES, FAOSTAT, Sverige og Finland

programRunId: `20260909-beredskap-wave1`  
packageId: `B14`  
runId: `B14-20260909T103514Z-4679b359`  
terminalStatus: `complete_within_scope`  
human_verified: false

## Q1 — Offisielle enkeltår/treårsgjennomsnitt, usikkerhet, faktisk N og utvalgsmetode?

**Kjent**
- FAOSTAT åpen bulkfil (A3-frosset, SHA-256 `1ccced40d8e228693c6fcc5d172de9bcaa3a1c6a1581ebde345d71c1dfa9b692`) har nordiske verdier for **item 210091** (3-års gjennomsnitt, moderat eller alvorlig mat-usikkerhet, totalbefolkning) med nedre/øvre intervall og flagg `E` (B14-C01; jf. A3-O020).
- Samme fil har **ingen** nordiske `Value`-rader for **item 210090** (annual value), selv om item-koden finnes og brukes for verdens-/regionaggregater (B14-C01). Enkeltår kan derfor **ikke** utledes fra treårsgjennomsnittet (stoppregel).
- Åpne FAO FIES-kataloger viser nå **Cases** i data dictionary: NOR2023=800, NOR2022=1002, SWE2022=1001, FIN2022=1000 (B14-C02). NOR2023 study-description oppgir design effect **1,73**, margin of error **4,1** prosentpoeng og feltperiode 2023-03-20–2023-06-10.
- StatFin 132a (`koti_vaik_pros`) 15 celler for SS/31/32 × 2021–2025 ble re-verifisert live med samme response SHA-256 som round-003 (`419d81bd…bcccc2`) (B14-C07). Dette er økonomisk «ends meet»-proxy, ikke FIES.

**Ukjent / stopp**
- Publisert FIES-**punktestimat**, svarprosent og full **nevner** mangler fortsatt på åpne katalogsider (A3-G004 / B14-…-G02).
- Cases ≠ analytisk N etter Rasch-validering og ≠ populasjonsnevner.
- Landspesifikke sampling-annex-PDF-er ble ikke lastet ned; 2022-kataloger hadde fortsatt «Sampling procedure: NA» i A3.

## Q2 — Finske ISSP-replikasjonsdata / nyere flerleddet måling / svenske objektive kjøpsdata?

**Kjent**
- **FSD3431** arkiverer ISSP 2019 Social Inequality V (Finland) med variabel **k41c** (måltid hoppet over pga. penger). Tilgangsklasse **B** (forskning/undervisning). Nedlasting krever Aila-innlogging; gjest ser inaktiv «Lataa» (B14-C03). Mikrodata ble **ikke** hentet.
- ISSP planlegger **Social Inequality VI i 2029**; ingen nyere ferdig Social Inequality-bølge med dette itemet er utgitt (B14-C03).
- THL Sotkanet **4264** er gjentatt nasjonal batteri 2013–2024, men blander matfrykt, medisiner og legebesøk — ikke ren flerleddet mat-tilgang à la SIFO/FIES (B14-C04).
- Sverige: SCB **Livsmedelsförsäljning** er objektiv aggregert salgsstatistikk; Livsmedelsverket 2023 er fortsatt selvrapportert webpanel (A3-O023). Ingen funnet kobling mellom objektive kjøpsmikrodata og mat-usikkerhetsmål (B14-C05).

**Ukjent / stopp**
- Hashbundet lokal FSD3431-fil mangler (B14-…-G01).
- Ingen finsk SIFO-/FIES-lik flerleddet matserie identifisert i kanalene (A3-G009).
- Ingen svensk objektiv kjøps–FI-kobling (A3-G008).

## Q3 — Hva kan sammenlignes med SIFO, og hvor må valideringsbro forbli ukjent?

**Kan sammenstilles som separate indikatorprofiler** (ikke konverteres): land, instrument, periode, analyseenhet, nevner, usikkerhet — se target-profile-candidate.json og B14-C06.
- SIFO: 10 led, husholdning, 4 ukers tilbakeblikk (A3-O001/O002; lokal PDF re-hashet).
- FIES: 8 led, individ 15+, 12 måneder.
- ISSP k41c: ett spørsmål.
- StatFin 132a / THL 4264: økonomiske/blandede proxyer.

**Må forbli ukjent**
- Validert **SIFO↔FIES**-crosswalk / ekvivalenskoeffisienter (A3-G003).
- Harmonisert prevalensmatrise med samme år/enhet/nevner/usikkerhet (A3-G011).
- Nordisk rangering på tvers av instrumenter.

## Begrensninger og motsigelser
- A3-S001 lagret SIFO-PDF SHA `…204db0b…`; lokal recompute er `…204cb0b…` (én hex-differanse). B14 binder **faktiske lokale bytes**.
- Ingen eierkontakt, ingen e-post, ingen mikrodata-nedlasting, ingen publisering.
- Samordning med B13 er notert uten gjensidig venting.

## Neste steg
1. Koordinator: eventuell autorisert Aila-nedlasting av FSD3431 (ny runId).  
2. Utsendt-forespørsel (usendt her): FAO tabell/mikrodata med punktestimat, analytisk N, nevner, svarprosent.  
3. Behold 210091 og katalog-Cases/DE-MoE som separate evidenslag; ingen enkeltår fra treårssnitt.
