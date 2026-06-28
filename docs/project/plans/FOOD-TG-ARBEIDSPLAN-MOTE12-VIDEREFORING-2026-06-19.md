---
tittel: Arbeidsplan — videreføring av Møte 12 (19.06.2026) i prosesser for database, research, kartlegging og analysemodeller
status: Forslag til intern beslutning (arbeidsavklaring-derivat — ikke formelt TG-vedtak)
eier: Gabriel
dato: 2026-06-19
horisont: Uke 25–31 (H1, mot 31.07) + august–desember (H2)
bruksregel: Planen åpner ingen ekstern outreach, faktastemme eller claims. Den styrer arbeids- og utviklingsprioritering. Alle innholdsuttak går fortsatt gjennom claim-lock, PCQ, source-shortlist og citable-gatene. Atlas-prosjektet er holdt utenfor.
relaterte_filer:
  - docs/meetings/FOOD TRANSITION - Møte 19-06-26.md
  - docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md
  - docs/project/mandates/decision-log-food-tg.md
  - docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md
  - docs/meetings/MØTEOVERSIKT.md
  - .claude/research-workflows.md
  - .claude/database.md
  - .claude/source-attribution-policy.md
---

# Arbeidsplan — Møte 12 videreført i prosess

## 0. Hva planen er, og hva den ikke er

Dette er en **delta-plan** som tar de substansielle trådene fra Møte 12 (19.06) og oversetter dem til konkrete prosesser i fire spor: **database/datamodell, research, kartlegging og analysemodeller**. Den **erstatter ikke** UTVIKLINGSPLAN 2026-06-10 (arbeidsstrøm 1–5, Port E/F/G, H1/H2-todeling) — den fyller den med det møtet faktisk ba om, og kobler hver oppgave til eksisterende porter og gater.

Planen er et **arbeidsavklaring-derivat**: Møte 12 var intake, ikke formelt vedtak. Ingenting her løfter en claim til ekstern status, og ingenting starter outreach. Alt nytt innhold passerer source-shortlist → PCQ (primary-check queue) → claim-lock → citable-/overclaim-gate før det kan brukes utad.

**Gating-realitet (fra møtet):** to ting blokkerer tempo — (a) **dataunderlaget** som JT sikter på å levere tidlig uke 26 (møte tirsdag morgen som siste frist), og (b) **formelt scope-vedtak** (Spor A+B / C-gate) som fortsatt henger til uke 25. Verdikjede- og analysearbeidet kan forberedes nå; ekstern bruk og full aktørkartlegging er gated bak disse.

---

## 1. Sporingsmatrise: fra møtetema til prosess

Hver rad knytter et konkret Møte 12-punkt til hvilket spor det går i, neste steg og gate. Detaljene står i kapittel 2–5.

| # | Møte 12-tema | Spor | Konkret neste steg | Gate |
|---|---|---|---|---|
| M1 | Strukturér data etter verdikjeden, waste per ledd | DB + Kartlegging | «Ledd-profil» per verdikjedeledd (funn/waste/aktører) | Port G (datamodell) |
| M2 | To spor: nordisk-produserbart vs. ansvarlig-sourcet | DB + Modeller | `track`-klassifisering på case/vare; «grow/source best»-frame | Scope-vedtak uke 25 |
| M3 | Eksternaliteter prises ikke (Edinburgh-forsker) | Research + Modeller | True-cost/eksternalitets-modell (skyggepris) | Metodevalidering før ekstern bruk |
| M4 | «Ingen klare indikatorer utenfor sirkulær skala» | DB + Modeller | Indikatorsett per ledd × land (beredskap/sirkularitet/sårbarhet) | Intern; ikke benchmark uten kilde |
| M5 | Sufficiency + prevention som høyeste verdi | Modeller | Sufficiency–efficiency-akse + R9-prevention-topp | Intern klassifisering |
| M6 | Import-substitusjon «kollapser i impact» | Research + Modeller | Konverteringsevne-scoring (lykkes vs. feiler) | PCQ per case |
| M7 | Nexus-rapport (mat/vann/helse/klima/natur, ~70 anb., SOIL) | Research | Verifiser kilde, koble tiltak mot 5 nexus-domener | Source-shortlist + claim-lock |
| M8 | Tre kjeder styrer ~96 % (triopol); lease/leaseback | Kartlegging + DB | Utvid maktkart/HHI; screen `selfLeased` mot marginpress | citable_with_note (eksisterer) |
| M9 | Skjell/tang, fôr-import, oppdrettsslam | Research + Modeller | Marine næringsløkker-dossier + fôr-substitusjon | PCQ; ikke volum/effekt-claim |
| M10 | NotebookLM-arkiv (~25 tema) + database som arbeidsverktøy | DB + Research | Kuratere arkiv → mottaksprotokoll; nøkkel/dialog-logg | Port G; intern-/ekstern-skille |
| M11 | Aktørkart med navn, 1-siders invitasjon, ringrunde | Kartlegging | Fyll `Actor`-navn; relasjonsbasert ringrunde + 3–5 intervju | Scope-vedtak (outreach gated) |
| M12 | Whitepaper-struktur (problem → ledd → svakhet/styrke → 3–5 satsinger) | Leveranse | Mater roadmap v0.1 + deck + event (H1) | Port E/F + språkbank |

---

## 2. Spor A — Database og datamodell

Møtets kjerne — «strukturér dataene etter verdikjeden, med waste og aktører per ledd» — er i praksis en **datamodell-oppgave**. Dagens kontrollsystem lever i markdown; UTVIKLINGSPLANens arbeidsstrøm 3 + Port G styrer migrering inn i DB. Vi tilfører de modell-elementene Møte 12 krever. Prinsipp (uendret): **ingen big-bang**; hver modell innføres når en flate eller analyse trenger den, via `db:import`-rutinen med strict-gate og dry-run, og markdown beholdes som redaksjonelt lag.

### 2.1 Verdikjedeledd som analytisk ryggrad («ledd-profil»)
- **Hva:** En strukturert profil per ledd — **import → primærproduksjon → prosessering → distribusjon → forbruk/avfall** — som bærer møtets «slagpære»: hovedfunn, waste, kapasitet, og koblede aktører. Bygger på eksisterende `Company.valueChainStage` og materialflyt-/Sankey-arbeidet (Møte 10).
- **Felter (forslag):** `stage`, `country`, `keyFindings[]`, `wasteTypes[]`, `capacityNotes`, `beredskapsnote`, `coverageRef`, `claimRefs[]`.
- **Svarer på:** «hvor bra/dårlig står hvert land på hvert ledd» (whitepaper-akse M1/M12).
- **Forbehold:** arver Sankey-forbeholdet — **registrert = kilde, ikke målt strøm**; ingen volum/verdi før offisiell statistikk er koblet (se 2.4).

### 2.2 To-spors-klassifisering på case og vare (M2)
- **Hva:** Et `track`-felt på casekort/vare: `nordic-producible` (kan gjøres mer nordisk: fôr, fisk, grønt) vs. `source-responsibly` (kan ikke produseres nordisk: kaffe, kakao, eksotisk frukt). Operasjonaliserer Einars «grow best what you can / source best what you have to».
- **Hvorfor i DB:** lar whitepaper og deck filtrere de to perspektivene konsekvent, og hindrer at kaffe/kakao behandles som matsikkerhetscase når de er læringspunkter.
- **Gate:** klassifiseringen er intern arbeidsramme til **scope-vedtaket** (A+B/C) er bekreftet uke 25.

### 2.3 Sidestrøm-/waste-modell per ledd (M1, M5)
- **Hva:** Strukturerte sidestrøm-rader: `fromStage`, `material`, `currentUse`, `rLevel` (R9/Moerman), `reellUpcycling` (bool: reell oppgradering vs. verdireduksjon), `newWasteStream` (Cathrines poeng: bruk skaper nye avfallsstrømmer).
- **Svarer på:** «hvilke aktører jobber med denne wasten, og er det velte eller store gav» — kobles til `Actor`/`BusinessRelationship`.
- **Analysekobling:** mater R9-modellen (5.2) og prevention-toppen (5.4).

### 2.4 Handels-/importavhengighet som tidsserier (M2, M9)
- **Hva:** Aggregert offisiell statistikk (SSB, Tulli/Comtrade, DST) for fôr-, soya-, kaffe-, kakao-aksene som dataserier med **kilde per celle** (jf. UTVIKLINGSPLAN AS3).
- **Svarer på:** importavhengighet og sårbarhet per land (beredskapsdimensjonen).
- **Gate:** kun offisiell statistikk; PCQ-føring per serie; coverage-profil slik at overclaim-gaten dekker dem fra dag én.

### 2.5 Indikatorsett per ledd × land (M4)
- **Hva:** Edinburgh-forskerens hull — «ingen klare indikatorer utenfor sirkulær skala» — møtes med et eksplisitt, dokumentert indikatorsett: per ledd og land, dimensjonene **beredskap, sirkularitet (R-nivå), sårbarhet/importavhengighet**, samt sufficiency/efficiency-merking (5.3).
- **Disiplin:** hver indikator har kilde og status; ingen indikator vises som benchmark uten kilde. Dette er bevisst et **internt** rammeverk inntil det er metodevalidert.

### 2.6 Aktør-per-waste og marginpress (M8)
- **Hva:** Bruk eksisterende `BusinessRelationship` (`supplier`/`buyer`/`distributor`/`self-dealing`) og `CompanyProperty.selfLeased` til å koble distribusjonsmakt (triopol) til lease/leaseback-mekanikken møtet beskrev («kjedenes egen måte å hente ut overskudd bak døra»).
- **Status:** maktkart/HHI er allerede `citable_with_note`; her **utvides** screeningen, ikke åpnes ny claim.

### 2.7 Arkiv → arbeidsverktøy (M10)
- **Hva:** NotebookLM-arkivet (~25 tema) kurateres og kjøres inn via mottaksprotokollen (Spor B) — ikke ad hoc. Databasen som «arbeidsverktøy for partnere» (API-nøkkel, logget dialog, Dropbox-innsending) er en **H2-funksjon**: spec nå, bygg etter Port G og bak intern-/ekstern-skillet.

**Gate for hele Spor A:** Port G (datamodell-migrering) i UTVIKLINGSPLAN — krever besluttet flate som trigger modellen, import-script med dry-run, ingen tap av markdown-historikk.

---

## 3. Spor B — Research-pipeline

Møtet ga seks konkrete kunnskapsbehov. De kjøres som **én ny forskningsrunde** gjennom den standardiserte pipelinen (`research/evidence-pack/`-backlog-CSV → DRO/DRR → DASK/PCQ → source-shortlist → claim-lock), med seksjon på `/forskningsrunder`. Ingenting løftes til citable før primærsjekk.

| ID | Kunnskapsbehov (Møte 12) | Primærkilde-retning | Leveranse | Forbehold/gate |
|---|---|---|---|---|
| R-12.1 | **Nexus-rapporten** (M7): 5 domener, ~70 anbefalinger, SOIL-score | Sannsynlig IPBES Nexus Assessment (2024) — verifiser identitet og tall | Kildekort + tiltak-mot-domene-mapping | Claim-lock; «~70»/«SOIL≈12» er ASR-tall, må bekreftes |
| R-12.2 | **Edinburgh-/NMBU-forskerens studier** (M3/M4): true-cost, manglende indikatorer | Hennes publikasjoner + siterte studier; true cost accounting-litteratur (TEEBAgriFood o.l.) | Source-shortlist for eksternalitetsmodellen (5.1) | Personnavn/institusjon usikker (ASR) — avklar med JT |
| R-12.3 | **Konverteringsevne** (M6): hvem klarer faktisk å oppskalere vs. «kollapser i impact» | Utvid eksisterende sirkulær-konkurser-backlog (Rest, Mycorena, Infarm m.fl.) med suksess-caser | Lykkes/feiler-matrise med årsak | PCQ per case; ingen effekt-claim |
| R-12.4 | **Marine næringsløkker** (M9): skjell/tang-protein, oppdrettsslam-fangst | Eksisterende `dossier-b-marine-nutrient-loops`; oppdaterte primærkilder | Dossier-oppdatering | «~70 % fôr i fjorden» er hypotese — må primærsjekkes |
| R-12.5 | **Sufficiency vs. efficiency** (M5) | Sufficiency-litteratur i mat/forbruk; prevention-/reduksjonsstudier | Begrepsnotat + klassifiseringskriterier | Intern metodebruk |
| R-12.6 | **Kaffe/kakao bærekraft fra kilde** (M2) | Eksisterende `research/external/coffee-forest/` + EUDR-review; kakao/Elfenbenskysten | Source-shortlist for «source-responsibly»-sporet | Læringspunkt-status, ikke matsikkerhetscase |

**Standardisering (fra UTVIKLINGSPLAN AS4):** ingen kilde inn uten DRO/DRR-rad, eier, dato og statusfelt; kildeovervåkning med varsling; nordisk gap-matrise (land × spor) generert fra DB. Regenerer `research/URL-MANIFEST.csv` når kildefiler endres.

---

## 4. Spor C — Kartlegging

To kartleggingsobjekter ble bestilt i møtet: **aktørkart** (eksplisitt) og **verdikjede-/«røntgenbilde»** (implisitt i metodikken).

### 4.1 Aktørkart (M11)
- **Status:** kartet finnes (Gabriel), mangler navn.
- **Steg:** (1) gå gjennom lista og fyll `Actor`-poster (`actorType`, `country`, `themeTags`) + to-spors-merking (3.2); (2) lag **1-siders invitasjon**; (3) **relasjonsbasert ringrunde + 3–5 korte dybdeintervjuer** før bred survey (jf. Møte 8). Bruk `ActorRelationship` (dependency/ally/oversight) og `ActorContact`.
- **Gate:** selve outreach er **pauset bak scope-vedtaket**. Forberedelse (navn, invitasjon, intervjuguide, aktørrespons-modell) gjøres nå; første samtale først etter Port A. Markedsstrategimøtet (2t) settes opp for å låse next action points.

### 4.2 Verdikjede-kartlegging — «røntgenbildet» (M1, M12)
- **Hva:** Dekningskart per **ledd × land** (import/produksjon/prosessering/distribusjon/forbruk-avfall), der det interessante er **hva som mangler/er ubearbeidet → handlingssonen** (jf. Møte 10-rammen). Gjenbruker materialflyt-Sankey + coverage; legger waste-per-ledd-laget (2.3) oppå.
- **Leveranse:** generert dekningsmatrise (ikke håndvedlikeholdt), som både whitepaper-akse og styringsbilde.

### 4.3 Distribusjonsmakt (M8)
- **Hva:** Triopolet (~96 %) og lease/leaseback inn i kartet via maktkart/HHI + `selfLeased`-screening (2.6). Skjermes for relevans mot beredskap/bærekraft før det får plass i whitepaper.

---

## 5. Spor D — Modeller og analyser vi bør/skal se på

Dette er det møtet etterspurte mest eksplisitt: et **metodisk stillas** som lar oss si noe presist uten å være domeneeksperter. Hver modell har: hva den svarer på, input, status (eksisterende vs. ny), og forbehold/gate. Rekkefølgen er prioritert.

### 5.1 True-cost / eksternalitets-modell *(ny — analytisk ambisiøs)*
- **Svarer på (M3):** hvorfor sirkulære/lokale løsninger «alltid kommer ut negativt» i lineære tekno-økonomiske analyser — fordi helse, beredskap og miljø ikke prises. Modellen gjør skyggepris/ekstern kostnad eksplisitt og kontrasterer **strippet lineær kost** mot **fullkost**.
- **Input:** R-12.2-kilder (TEEBAgriFood-tilnærming), helsekostnad-proxyer, beredskapsverdi.
- **Forbehold:** høyest metoderisiko — skyggepriser er omstridte. **Må metodevalideres** (materialforsker/økonom) før noen tallfesting brukes utad; presenteres først kvalitativt («fullkost endrer fortegnet»), ikke som kronebeløp.

### 5.2 R9/Moerman per ledd og sidestrøm *(eksisterende — utvides)*
- **Svarer på (M1/M5):** hvor i sirkulærstigningen hvert tiltak/sidestrøm ligger; **reell upcycling vs. verdireduksjon**.
- **Input:** sidestrøm-modellen (2.3).
- **Status:** R9 er allerede prosjektets rammeverk; her kobles det systematisk per ledd, og **prevention løftes som topp** (5.4).

### 5.3 Sufficiency–efficiency-akse *(ny — lett)*
- **Svarer på (M5):** klassifiser tiltak langs *bruke mindre/bedre* (sufficiency) vs. *gjøre det samme mer effektivt* (efficiency). Gir whitepaper et språk for ikke-preskriptive anbefalinger («hvis du vil oppnå beredskap, så …»).
- **Input:** R-12.5.

### 5.4 Prevention-topp og «anbefalingslogikk» *(ny — lett)*
- **Svarer på (M5):** prevention er høyest verdi og «ingen er inne på det». Modellen rammer anbefalinger som *bør gjøre X* (f.eks. 170 g-porsjoner, redusert volum med bevart næring) uten å kreve at aktøren faktisk vil.

### 5.5 Multikriterie spider-/radarmodell *(ny — middels)*
- **Svarer på (møtets spider-modell):** vurder tiltak på **økonomi × miljø × beredskap/sikkerhet × implementering-i-tid** samtidig — folk ser i dag bare én akse av gangen.
- **Pilot:** sugar beet leaves-casen møtet nevnte; deretter 2–3 nordiske caser.
- **Kobling:** trekker på indikatorsettet (2.5) og R9 (5.2).

### 5.6 Konverteringsevne-/oppskaleringsmodell *(ny — middels)*
- **Svarer på (M6):** skille tiltak som *konverterer* fra forskning som «kollapser i impact». Score på modenhet, marked, oppskalerbarhet.
- **Input:** R-12.3 (lykkes/feiler-matrise).

### 5.7 Beredskap-overlay på verdikjeden *(ny — middels)*
- **Svarer på (strateginarrativet):** operasjonaliser «beredskap er bærekraftig» — importavhengighet per ledd → sårbarhet; korte verdikjeder → resiliens.
- **Input:** handelstidsserier (2.4) + ledd-profil (2.1).

### 5.8 Nexus-kobling *(ny — middels, kildeavhengig)*
- **Svarer på (M7):** map tiltak mot **mat/vann/helse/klima/natur**; identifiser høy-leverage tiltak (møtet: SOIL scorer høyt).
- **Gate:** avhenger av R-12.1-verifisering før bruk.

> **Modell-disiplin:** alle modellene er **interne analyserammer**. Ingen modelloutput er en ekstern claim før den er kilde-/claim-lukket og (for 5.1/5.8) metodevalidert. Modellene mater whitepaper-analysen, ikke omvendt.

---

## 6. Kobling til leveranse (whitepaper, roadmap v0.1, deck, event)

Whitepaper-strukturen JT skisserte — **problem → karakteristikk per ledd → svakhet/styrke-analyse → 3–5 satsingsområder** — er allerede H1-leveransen i UTVIKLINGSPLAN (roadmap v0.1 + deck + event). Denne planens output mapper rett inn:

- **Problem-kapittel:** triopol/distribusjonsmakt (4.3) + importavhengighet (2.4) + eksternalitet-rammen (5.1, kvalitativt).
- **Karakteristikk per ledd:** ledd-profil (2.1) + verdikjede-røntgen (4.2).
- **Svakhet/styrke-analyse:** indikatorsett (2.5) + spider (5.5) + konverteringsevne (5.6).
- **3–5 satsingsområder:** nexus-høyleverage (5.8) + to-spors-prioritering (2.2), filtrert på citable.
- **Metodekapittel/vedlegg:** modell-beskrivelsene (kap. 5) + research-pipelinen (kap. 3) — møtets ønske om å «forklare hva vi har gjort og lært».

Alt event-/publiseringsuttak går via **språkbank + claim-lock** og **Port E/F** (UTVIKLINGSPLAN). Umodne modeller (5.1, 5.8) vises som «under validering», ikke som funn.

---

## 7. Sekvens, avhengigheter og kapasitet

| Uke | Denne planens leveranser (utover UTVIKLINGSPLANens) | Avhenger av |
|---|---|---|
| 25 | Scope-vedtak (A+B/C) → låser to-spors-klassifisering (2.2); R-runde 12 backlog-CSV opprettet; aktørkart-navn + 1-siders invitasjon (forberedelse); R-12.1/12.2 source-shortlist startet | Scope-vedtak; JT-avklaring av forsker-identitet |
| 26 | **Dataunderlag mottatt** → ledd-profil (2.1) + verdikjede-røntgen (4.2) bygges; sidestrøm-modell (2.3) speccet; Port G-beslutning | Dataunderlag (JT, tidlig uke 26) |
| 27 | Indikatorsett (2.5) + R9-per-ledd (5.2) + spider-pilot (5.5, sugar beet); handelstidsserier (2.4) påbegynt | Ledd-profil; R2-/R12-funn |
| 28 | Konverteringsevne (5.6) + beredskap-overlay (5.7); eksternalitet-ramme (5.1) kvalitativt inn i deck | Metodeavklaring 5.1 |
| 29–31 | Modelloutput mater roadmap v0.1 + event; nexus-kobling (5.8) hvis R-12.1 verifisert | Port E; claim-lock |
| H2 | Database-som-arbeidsverktøy (2.7); aktør-outreach + intervjuer (4.1) etter Port A; true-cost tallfesting hvis metodevalidert | Scope/Port A; metodevalidering |

**Kapasitet (uendret fra Møte 8/UTVIKLINGSPLAN):** JT 30 %, Cathrine 20 %, Thea 20 %, Gabriel ~15 %. Gabriel bærer Spor A–D (bygg/analyse); JT eier dataunderlag + scope + whitepaper-innhold; Cathrine eier aktørkunnskap + ten-step; Thea eier event/kommunikasjon. **Kritisk antakelse:** Spor A/C-tempo avhenger av at dataunderlaget faktisk lander tidlig uke 26.

---

## 8. Beslutnings- og gate-hooks

| Hook | Spørsmål til JT/Einar | Kobling |
|---|---|---|
| **Scope-vedtak** | Bekreft A+B som hovedscope med C-gate → låser to-spors-klassifisering og åpner aktør-forberedelse | decision-log; UTVIKLINGSPLAN kap. 1 |
| **Port G** | Skal ledd-profil/sidestrøm/casekort inn i DB nå? | UTVIKLINGSPLAN Port G |
| **Metodevalidering 5.1/5.8** | Hvem validerer eksternalitets-/nexus-metoden før tallfesting? (materialforsker antydet i Møte 10) | claim-lock; source-policy |
| **Forsker-identitet** | Bekreft Edinburgh-/NMBU-forskerens navn og publikasjoner (R-12.2) | ASR-usikkerhet i møtenotat |
| **Port E/F** | Event-go + publiseringsmodus for modelloutput | UTVIKLINGSPLAN Port E/F |

---

## 9. Forbehold og claim-status

1. **Intake-derivat:** bygger på en ASR-støyet arbeidsavklaring (Møte 12). Tall og navn (Nexus «~70»/«SOIL≈12», «~96 %», «~70 % fôr i fjorden», forsker-identitet, «Fulen») er **hypoteser** til primærsjekk.
2. **Ingen ekstern bevegelse:** planen åpner ingen outreach, faktastemme eller claims. Alle uttak gjennom source-shortlist → PCQ → claim-lock → citable/overclaim-gate.
3. **Modeller er interne** til de er kilde-/claim-lukket; 5.1 og 5.8 krever i tillegg metodevalidering.
4. **Ikke et formelt vedtak:** denne planen styrer prioritering, ikke mandat. Formelle beslutninger føres i `decision-log-food-tg.md`.
5. **Atlas** er holdt utenfor (eget prosjekt, jf. instruks 19.06).

---

## 10. Verifikasjon av planen

DB-modeller (`valueChainStage`, `CompanyProperty.selfLeased`, `BusinessRelationship`, `Actor`/`ActorRelationship`/`ActorContact`) er lest fra `.claude/database.md`. Research-pipeline (backlog-CSV, DRO/DRR/DASK/PCQ, URL-manifest, `/forskningsrunder`) fra `.claude/research-workflows.md`. Porter (E/F/G), H1/H2-todeling og kapasitetstall fra `FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md`. Møtetemaene fra `docs/meetings/FOOD TRANSITION - Møte 19-06-26.md`. Eventuelle tall i kap. 5/3 er flagget som hypoteser til primærsjekk.
