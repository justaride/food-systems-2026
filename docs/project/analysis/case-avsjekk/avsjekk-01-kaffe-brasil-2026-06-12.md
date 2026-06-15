---
tittel: Case-avsjekk 01 — Kaffe / Brasil
status: Intern analyse — følger avsjekk-formatet fra piloten (avsjekk-06)
eier: Gabriel
dato: 2026-06-12
scope: Dypdykk-avsjekk av caset mot eget underlag, målt mot JTs sirkularitetsdimensjoner (RP-seriens tema-tabell). Konklusjon per nøkkelspørsmål: BESVART / DELVIS / ÅPENT / AKTØRGATE, og Deep Research-prompts for det som står åpent. Følger claim-lock; ingenting her er ekstern faktastemme.
relaterte_filer:
  - research/external/dro-0906/drr-0906-001-brasil-kaffe.md
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - src/lib/data/casestatus.ts
  - docs/project/analysis/food-tg-innsiktssyntese-2026-06-12.md
  - docs/project/figures/food-tg-2026-06-12/README.md
  - docs/project/mandates/food-tg-eudr-treffkart-2026-06-12.md (på gren codex/food-tg-arbeidsplan-2026-06-12)
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
---

# Avsjekk: Kaffe / Brasil

## 1. Casets plass i JTs sirkularitetsramme

| JT-dimensjon (RP-tema) | Treffer caset? | Hvordan |
|---|---|---|
| Importavhengighet/handelsakse (RP-02) | Ja, kjernen | Brasil-andel 44,6→47,4 % av norsk råkaffeimport 2022–2025, prissjokk +65 %/kg — dette ER casets dokumenterte kjerne; RP-02-kjøringen er den naturlige fordypningen (SSB/Comtrade-API, speiltall, motstrømmer) |
| Verdikjedeflyt og kast (RP-01) | Delvis | Importleddet er tallfestet; flyt videre i norsk ledd (brenneri → retail/HORECA → forbruk → grut) er ikke kartlagt med volum |
| R9 per ledd (RP-03) | Svakt | Ingen R-strategi-klassifisering finnes for kaffekjeden i underlaget; grut-sporet ble parkert i DRR-001 |
| Matsvinnkvalitet/kontaminering (RP-04) | Nei | Ikke berørt i underlaget |
| Næringsstoffløkker (RP-05) | Nei | Ikke berørt |
| Suksess/fiasko (RP-06) | Delvis | Gruten står som `benchmark-only` (reelt norsk grut-gjenbruksaktør, men uten volum/skala); hører hjemme i RP-06-ledgeren, ikke som casebevis |

Ærlig plassering: dette er primært et **import-/EUDR-case** (RP-02-dimensjonen), ikke et sirkularitetscase. Sirkularitetsvinkelen står i dag på to tynne ben: (a) kaffegrut i Norge — parkert i DRR-001 fordi ingen norsk biogass-/valoriseringspilot med volum og avtaker ble funnet, og Gruten mangler offentlige throughput-tall; (b) biprodukter i Brasil-leddet (pulp/cascara/mucilage) — ikke undersøkt i det hele tatt. Casets sirkulære innhold må enten bygges (kap. 4) eller holdes eksplisitt utenfor fortellingen.

## 2. Kunnskapsstatus per nøkkelspørsmål

Statusvokabular: **BESVART** = kan presenteres internt med kilde+locator innenfor claim-lock, ingen ny research nødvendig. **DELVIS** = kjernen står, men en navngitt bit mangler. **ÅPENT** = krever ny research (prompt finnes i kap. 4, eller er bevisst stopp markert i kap. 3). **AKTØRGATE** = kan kun besvares av aktør/menneske — utenfor vår loop, ligger i DASK/AASK.

| # | Nøkkelspørsmål | Svar fra underlaget | Status |
|---|---|---|---|
| 1 | Hvor stor og hvor konsentrert er norsk kaffeimport fra Brasil? | Komplett Comtrade-serie 2022–2025 (HS 090111/090121): 15,6 mill. kg urøstet fra Brasil i 2025 (122,9 mUSD); Brasil-andel 44,6 % (2022) → 47,4 % (2025). Kryssverifisert: NKI-tabellens 2024-tall er identisk med tolldata. fig1 finnes. Kilde: desk-logg kap. 3 | **BESVART** — caveat: preview-API; autorisert re-trekk (SSB 08801/Comtrade m/nøkkel) før ekstern bruk |
| 2 | Hva har skjedd med pris/sårbarhet? | Enhetspris Brasil-råkaffe 4,76 → 7,87 USD/kg (+65 % 2024→2025); total importverdi fra verden ~doblet. Internt avledet av samme serie | **BESVART** — som internt avledet funn; merkes «avledet», ikke kildetall |
| 3 | Hva er EUDR-status for Brasil-kaffe på EU-siden? | Brasil = `standard risk` (ikke på lav-/høyrisikolistene; standardrisk-logikken fra Kommisjonens guidance); frister 30.12.2026 (store/mellomstore) og 30.06.2027 (mikro/små); treffkartet skiller EU-plikt, norsk EØS-status og kundekrav. Kilder: DRR-001 S7/S8 + treffkart | **BESVART** (med claim-lock: aldri «lavrisiko»; treffkartet ligger på codex-grenen og må inn på main før det styrer noe) |
| 4 | Hva er norsk EØS-/forskriftsstatus for kaffe under EUDR? | Treffkartet: EUDR ikke innlemmet i norsk rett per Landbruksdirektoratet 05.05.2026; kaffe omtales som EØS-relevant, «endelig forskrift/Lovdata må sjekkes». NB: casestatus-flatens formulering «kaffe er innlemmet i den norske EUDR-gjennomføringen» er sterkere enn underlaget bærer | **DELVIS** → prompt P-KAFFE-2 (inkl. korreksjon av casestatus-formuleringen) |
| 5 | Hvilke norske aktører har dokumenterte Brasil-kafferoller? | Kandidatkart med kilder finnes: Fuglen (origin-sourcing Minas Gerais), Nordic Approach (EUDR-arbeid, farm mapping), NKI (dataeier, 84 % dekning), Joh. Johannson/ICP (`benchmark-only`), Gruten (`benchmark-only`). Ingen er dokumentert som del av Natural State/NCH-caset | **BESVART** — som kartlegging; deltakelse/bruksrett er spørsmål 6 |
| 6 | Finnes Brasil-MOU/relasjonsdokument, og bærer relasjonssporet (NCH/Natural State, Fuglen-rolle, NKI-rolle) et kaffecase? | DRR-001s hovedfunn: «MOU/prosjektdokument ikke funnet» — kun institusjonell omtale av partnerskapsavtale NCH–Exchange4Change med «food systems» i veikartet; kaffe nevnt bare som use case på WCEF-sesjonssiden. Websøk er uttømt | **AKTØRGATE** — ligger i DASK-0906-001/003; mer websøk løser det ikke |
| 7 | Kan CONAB Parque Cafeeiro faktisk levere data (API/skjema/DDS-kompatible uttrekk)? | Plattform- og metodesidene er dokumentert (PRODES/INPE, CAR, SNCR, Sentinel-2-mapping), men operasjonell datatilgang står som `needs-primary-check` i DRR-001 — ingen API-/skjemadokumentasjon eller eksempeluttrekk i underlaget | **ÅPENT** → prompt P-KAFFE-1 |
| 8 | Hva er den norske kaffegrut-massestrømmen — volum og disponering? | Ikke kvantifisert noe sted i underlaget. DRR-001 parkerte biogass-pilot-claimen (ingen navngitt norsk pilot med volum/anlegg/avtaker funnet); Gruten-volum er aktørgate. Men selve massestrømmen (tonn grut/år, hvor den ender) er desk-researchbar fra forbruks- og avfallsstatistikk | **ÅPENT** → prompt P-KAFFE-3 (smal; gjenoppliver IKKE pilot-claimen) |
| 9 | Finnes en sirkularitetsvinkel i Brasil-leddet (pulp/cascara, biprodukter ved opprinnelse)? | Ikke undersøkt i underlaget overhodet | **ÅPENT** — bevisst stopp inntil videre, se kap. 3; ingen prompt nå |

## 3. Konklusjon for caset

**Kjernen er besvart.** Spørsmål 1–3 — volum, konsentrasjon, prissjokk og EUDR-rammen — står på kontrollerte uttrekk med locator og kryssverifikasjon, og tåler intern presentasjon i dag (fig1 + mønster 5 i innsiktssyntesen: EUDR som tidsvindu mot 30.12.2026). Go/no-go-linjen i casestatus holder: go som import-/EUDR-case, no-go som relasjonscase uten dokument. Ett prosesspunkt før ekstern bruk: autorisert re-trekk av importserien (allerede i nextActions), og treffkartet må merges fra codex-grenen.

**Tre ting står åpent og har hver sin prompt (kap. 4):** CONAB-datatilgangen (P-KAFFE-1 — avgjør om sporbarhetsinfrastrukturen er operasjonelt brukbar eller bare omtalt), norsk EØS-/forskriftsstatus for kaffe (P-KAFFE-2 — inkluderer korreksjon av casestatus-formuleringen «innlemmet»), og norsk grut-massestrøm (P-KAFFE-3 — den eneste desk-researchbare biten av sirkularitetsvinkelen).

**Det vi bevisst IKKE researcher mer på:** (1) Brasil-MOU, Fuglen-rolle og NKI-rolle — aktørgate (DASK-0906-001/003); DRR-001 har uttømt det offentlige sporet. (2) Gruten-volum og norsk grut-til-biogass-pilot — aktørgate hhv. parkert; P-KAFFE-3 kartlegger massestrømmen, ikke piloter. (3) Biprodukter i Brasil-leddet — utenfor scope til relasjonssporet eventuelt åpner; uten brasiliansk partner har vi verken datatilgang eller bruksflate for det. (4) Tidsserie-fordypning (SSB-tabellnummer/API, speiltall-kontroll, klippfisk-motstrømmen) — dekkes av RP-02-kjøringen i RP-serien (prioritet 2 i kjøreplanen) og skal ikke dupliseres her.

## 4. Research-prompts (Deep Research-format)

Kjøreregel: hver prompt kjøres i egen tråd, ETTER masterprompten fra `food-tg-deep-research-prompt-pack-2026-06-10.md` + datamodus-tillegget fra `food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md` kap. 2. Output lagres som `deep-research-kaffe-<id>-YYYY-MM-DD.md` og går gjennom kontrollstacken (mottak → SRC/PCQ → claim-lock) før bruk. Handelsaksen Norge↔Brasil dekkes av RP-02 — ingen P-KAFFE-prompt skal hente importserier.

### P-KAFFE-1: CONAB Parque Cafeeiro — operasjonell datatilgang

```text
Oppgave: Dokumenter hvordan data fra CONAB Parque Cafeeiro faktisk kan hentes og brukes til EUDR due diligence — plattformen er omtalt (DRR-0906-001 S9–S11), men datatilgangen står som needs-primary-check.

Svar presist på:
1. Tilgangsform: finnes API, CSV-/geodata-nedlasting, eller kun webgrensesnitt? Oppgi endepunkt/URL, autentiseringskrav, lisens-/bruksvilkår og språk.
2. Skjema: hvilke felt leveres per plot/produsent (koordinater/polygon, CAR-ID, areal, avskogingsstatus, datokilde) — og er feltene kompatible med EUDR DDS-kravene (plot-nivå geolokasjon)?
3. Eksempel: hent eller gjengi ett dokumentert eksempeluttrekk/respons med locator. Hvis ingen offentlig eksempelrespons finnes, er det et hovedfunn.
4. Oppdatering og dekning: oppdateringsfrekvens, hvilke delstater/arealer dekkes, og kjente begrensninger CONAB selv oppgir.
5. Adopsjon: finnes dokumentert bruk av plattformen hos eksportører/importører (offentlige kilder eller selskapenes egne kanaler)? Ikke anta adopsjon fra omtale.

Leveranseformat: tilgangstabell (kanal | endepunkt | format | vilkår | kilde | URL | locator) + felttabell (felt | innhold | DDS-relevans | kilde) + eksempel/locator.
Merk tidslinjer: CONAB-sidens egne EUDR-datoer er utdaterte mot nyeste EU-kilder — bruk alltid siste EU-kilde for frister.
Ikke si at norske importører bruker plattformen. Ikke behandle metodebeskrivelse som bevis for leveransedyktighet.
```

### P-KAFFE-2: Norsk EØS-/forskriftsstatus for kaffe under EUDR

```text
Oppgave: Avklar nøyaktig norsk gjennomføringsstatus for EUDR med kaffe som testvare, per dags dato.

Svar presist på:
1. Status for EØS-innlemmelse og norsk forskrift: EØS-komitébeslutning, høringsdokumenter, Lovdata-status, ansvarlig myndighet. Primærkilder: regjeringen.no, Landbruksdirektoratet (oppdatering 05.05.2026 er siste kjente), Lovdata, EØS-notatbasen.
2. Er kaffe (HS 0901) eksplisitt innenfor det norske gjennomføringsscopet — og skiller norsk scope seg fra EU-vedlegget (jf. kakao-utenfor-EØS-funnet i uttak-07, som viser at slike avvik finnes)?
3. Hvilke plikter treffer en norsk kaffeimportør, fra hvilken dato — og hva gjelder i mellomperioden der EU-kundekrav kan drive dokumentasjon før norsk rett er ferdig?
4. Konkluder med claim-lock-forslag: 1–2 trygge formuleringer + hold-tilbake-liste. Vurder eksplisitt om casestatus-formuleringen «kaffe er innlemmet i den norske EUDR-gjennomføringen» kan stå, må svekkes til «EØS-relevant, gjennomføring pågår», eller kan skjerpes.

Leveranseformat: statustabell (spørsmål | status | dato | kilde | URL | locator) + claim-forslagene.
Skill skarpt mellom EU-rett, EØS-prosess og norsk forskrift. Ikke bruk medieomtale som kilde for rettslig status.
```

### P-KAFFE-3: Norsk kaffegrut-massestrøm (smal, uten aktørclaims)

```text
Oppgave: Kvantifiser den norske kaffegrut-massestrømmen fra offentlige kilder — volum generert per år og hvor den ender i dag. Dette er flyt-/R9-grunnlag (RP-01/RP-03-logikk), IKKE en pilotjakt.

Svar presist på:
1. Generert volum: estimat på tonn kaffegrut/år i Norge, bygget på dokumentert forbruk (NKI-importserien/forbruk per innbygger) og publiserte omregningsfaktorer grut-per-kg-kaffe (oppgi faktor med kilde). Vis omregningen eksplisitt; merk raden «estimert».
2. Disponering: hva sier norsk avfallsstatistikk og matsvinnsrapportering (SSB, Miljødirektoratet, NORSUS) om hvor grut ender — restavfall/forbrenning, kildesortert matavfall/biogass, annet? Hvis grut ikke skilles ut som egen fraksjon i statistikken, er det selve funnet — rapporter det eksplisitt.
3. Skill husholdning fra HORECA/storhusholdning hvis kildene gjør det.
4. R-plassering: klassifiser dagens dominerende disponering etter Potting 2017; energiutnytting aldri høyere enn R9 recover.

Leveranseformat: massestrømtabell (strøm | verdi | enhet | år | geografi | metode | kilde | URL | locator | datakvalitet) + disponeringstabell.
Avgrensninger: IKKE hent Gruten-volum eller andre enkeltaktørers throughput (aktørgate, ligger i DASK/AASK-sporet). IKKE gjenopplive claimen om en norsk grut-til-biogass-pilot — den er parkert i DRR-0906-001 og forblir parkert til ny primærkilde finnes. Ikke bruk internasjonale potensialstudier som norske tall.
```
