---
tittel: Internt arbeidsdokument — gjenstående research og datainnhenting
status: Levende backlog (internt, deg + Claude). Ikke en ekstern leveranse.
eier: Gabriel
medforfatter: Claude
dato: 2026-06-29
horisont: Uke 27 → 31.07 (H1) + august–desember (H2), med oktober-event som siktepunkt
bruksregel: >
  Dette er en intern arbeidsoversikt over alt vi tenker gjenstår på research- og
  datasiden. Den åpner ingen ekstern outreach, faktastemme eller claims. Alt
  innholdsuttak går fortsatt gjennom source-shortlist → PCQ → claim-lock →
  citable/overclaim-gate før ekstern bruk. Tall og status er hentet fra repoet
  per 2026-06-29 (R13-backlog, MVK completeness-dashboard, dekningsbok,
  Møte 12-arbeidsplan, objektivfunksjon-vedtaket).
kilder:
  - research/_status/food-tg-research-backlog-2026-06-25.csv
  - research/_status/mvk-completeness-dashboard.md
  - research/_status/domene-dekningsbok.csv
  - docs/project/plans/FOOD-TG-ARBEIDSPLAN-MOTE12-VIDEREFORING-2026-06-19.md
  - docs/project/analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md
  - docs/project/mandates/food-tg-n11-bondemargin-goal-2026-06-18.md
---

# Internt: gjenstående research og datainnhenting

## 0. Hva dette er — og ikke er

Dette er **vår felles arbeidsliste**, ikke en rapport til Cathrine/JT. Den samler alt vi
mener gjenstår på de to operative sporene — **research** (kunnskapsinnhenting og
verifikasjon) og **datainnhenting** (fylle dekningskartet med faktiske aktører/tall) —
og kobler hver post til prioritet, gate og status slik repoet faktisk står i dag.

Den **erstatter ikke** Møte 12-arbeidsplanen eller objektivfunksjon-vedtaket; den er
det operative «hva står igjen»-laget under dem. Når en post lukkes, oppdateres den i
sin kanoniske kilde (R13-backlog / dekningsbok / mottakslogg), ikke bare her.

---

## 1. Sammendrag — tilstanden i to spor

**Research-sporet** har en strukturert backlog på **50 mål (runde 13)**, alle med status
`planned`: 3 × P0, 34 × P1, 13 × P2. Fordelt på gate er det **24 source-shortlist,
14 PCQ, 5 actor-gate, 4 forståelse, 3 internal**. I tillegg ligger **N11 bondemargin**
som det vedtatte aktive spor-A-målet, og to bevisste **blindsoner** (etterspørsel N7,
helse/true-cost N9) parkert mot en eventuell fase 2.

**Datainnhentings-sporet** er styrt av MVK-dekningskartet: **17 områder**, hvorav
**12 fortsatt står på 0 %**, et par er delvis dekket (primærproduksjon 33 %,
distribusjon-grossist 33 %, lokale-verdikjeder 19 %, regenerativ-praksis 10 %), og to
er godt dekket (innsatsfaktorer 95 %, matsvinn-sirkulær 73 %). I tillegg ligger en
**etterkontroll-kø** på allerede importerte noder (havbruk/villfiske/grossist) og en
rekke **usikre universanslag** som selv må kildebelegges.

**Tre gating-realiteter** låser tempo (kap. 2). Resten kan forberedes nå.

---

## 2. Gating-realiteter (det som faktisk låser tempo)

| # | Gate | Hva den blokkerer | Hvem/hva løser den |
|---|---|---|---|
| G1 | **Formelt scope-vedtak** (Spor A+B, C-gate) | Full aktørkartlegging med navn, all `actor-gate`-research (5 mål), og ekstern outreach/intervjuer | JT / Cathrine / Einar — formelt vedtak (uke 25-sporet) |
| G2 | **Dataunderlaget fra JT** | Verdikjede-/ledd-profiler, true-cost-tallgrunnlag, deck/whitepaper-mating | JT leverer (gating-punkt for tempo mot oktober) |
| G3 | **Metodevalidering av true-cost/eksternaliteter** | M3 skyggepris-modell og alt som hviler på den | Intern metodevalidering før ekstern bruk (Edinburgh/NMBU-forankring) |

> Alt under G1 markeres `actor-gate` i backloggen og **forberedes** (kandidatlister,
> kildejakt), men låses ikke til ekstern bruk før vedtaket foreligger.

---

## 3. RESEARCH-SPORET

### 3.1 Aktivt nå — N11 bondemargin (spor A)

- **Status:** igangsatt 18. juni som vedtatt neste spor-A-runde (objektivfunksjonen
  åpnet bondeøkonomi som blindsone). Spec ferdig; leveranse i `research/external/r6/`.
- **Definition-of-done (gjenstår å bekrefte lukket):** primærkilde-forankret datatabell
  (kostnads-/prisskvis indeks vs. indeks, per produksjon, sjokk-respons 2022–23) +
  uavhengig adversariell verifikasjon (URL-spot + aritmetikk) + mottaksrad +
  `audit:citable`/`gate:overclaim` grønn. Oppdater systemmodellen (N11 «blind» → «delvis dekket»).
- **Verifikasjonspass kjørt 2026-06-29:** alle 8 påkrevde seksjoner til stede;
  primærkilde-forankret (BFJ/NIBIO Totalkalkylen UT-1-2026, Statens tilbud 2026); adversariell
  verifikasjon til stede (5 kryss-sjekker; 3 feil rettet under verifisering); mottaksrad finnes
  (`DRO-R6-INDEX-2026-06-18.md`). Aritmetikk re-kjørt uavhengig og holder (inntektsgap 63 300,
  markedsinntektsandel 71,4 %, gjødselindeks +126,7 %, realfall 2023 −75 200). Rettet samtidig:
  systemmodell-noden (sto fortsatt «BLIND») og én nominell-tall-nit i deliverablen (51 100 → 51 000).
- **Avgrensning:** kun NO denne runden; ingen aktørkontakt (bondeintervju markeres B);
  ingen policy-anbefalinger (kun tallgrunnlag).
- **Neste:** kjør `audit:citable` + `gate:overclaim` i miljø med DB — eneste gjenstående
  blokker før N11 regnes formelt lukket på «delvis dekket»-nivå. Per-kg-margin forblir Type B
  (aktør-gate), ikke en mangel ved denne runden.

### 3.2 R13-backloggen — 50 mål (alle `planned`)

Dette er hovedmengden gjenstående research. Gruppert per tema. **P0 først.**
Gate-koder: `PCQ` = primary-check queue, `source-shortlist` = kildekandidat-jakt,
`actor-gate` = krever scope-vedtak (G1), `forstaelse` = triage/forståelsesunderlag,
`internal` = internt konsoliderings-/figurarbeid.

#### P0 — lukk først (gap-closure)

| ID | Gate | Oppgave |
|---|---|---|
| R13-GAP-001 | PCQ | Kritiske importnoder (fosfat, fôrprotein, fiskeolje, soya, kaffe, kakao) — primær tidsserie per node (SSB 08801/PxWeb, Landbruksdir.; Comtrade kun speil) |
| R13-GAP-005 | PCQ | Verifiser eller nedgrader de **7 parkerte R12-tallclaimene** (ASKO/HORECA m.fl.) |
| R13-WASTE-001 | PCQ | Lukk R12-WASTE-001: SINTEF/FHF 2024 R-stige-tabeller for marint restråstoff |

#### P1 — aktørkartlegging (`actor-map`, flere bak G1)

| ID | Gate | Oppgave |
|---|---|---|
| R13-AKTOR-001 | actor-gate | Markedshager/små-skala grønt: kandidat → verifisert (primærtelling) |
| R13-AKTOR-002 | actor-gate | Andelslandbruk (CSA) aktiv status per gård 2025/26 mot Økologisk Norge |
| R13-AKTOR-003 | source-shortlist | REKO-ringer Norge 2025/26: oppdaterte ringer/produsenttall |
| R13-AKTOR-004 | actor-gate | Regenerative/agroøkologiske praktikere og gårder i Norge |
| R13-AKTOR-006 | PCQ | Eierskap og founders i sirkulær-/altprotein-/CEA-aktører |

#### P1 — gjenstående gap-closure

| ID | Gate | Oppgave |
|---|---|---|
| R13-GAP-002 | source-shortlist | R12-RES-004: hvilke lokale/korte verdikjeder som faktisk øker forsyningssikkerhet (mekanisme, ikke identitet) |
| R13-GAP-004 | source-shortlist | R12-FEED-003: aktørledger for alternative nordiske fôrproteiner |
| R13-GAP-006 | forstaelse | Eskaler R12 type-C-hull: avgjør per hull Type A (desk) vs. B (aktør) |

#### P1 — innovasjon / konvertering (`innovation`)

| ID | Gate | Oppgave |
|---|---|---|
| R13-INNO-001 | source-shortlist | CEA/vertikalt landbruk i Norge: aktører, realisert produksjon |
| R13-INNO-002 | source-shortlist | Agritech/foodtech-økosystem: startups, klynger, kapital |
| R13-INNO-003 | internal | Finansiering og virkemidler for matsystem-omstilling |
| R13-INNO-004 | source-shortlist | Failure/survival-ledger for sirkulære/altprotein/CEA-aktører |
| R13-INNO-006 | source-shortlist | FoU-aktører og forskningsmiljøer + deres porteføljer |

#### P1 — landskap / makt (`landscape`)

| ID | Gate | Oppgave |
|---|---|---|
| R13-LAND-001 | PCQ | Makt-/eierkonsentrasjon på tvers av dagligvare, grossist, foredling |
| R13-LAND-002 | PCQ | Verdikjede-integrasjon og vertikal kontroll: hvem eier hva oppstrøms |
| R13-LAND-003 | forstaelse | Helsystem-kart/aktørtypologi (kobler aktørkart, waste, protein …) |
| R13-LAND-004 | internal | **Datagap-atlas:** samle alle type-C-hull fra R4/R5/R6/R12/R13 |
| R13-LAND-006 | internal | Uttaks-/figurkandidat-oversikt for whitepaper |

#### P1 — økologi / jordhelse (`ecology`)

| ID | Gate | Oppgave |
|---|---|---|
| R13-OKO-001 | PCQ | Økologisk areal og produksjon i Norge: areal, andel, utvikling |
| R13-OKO-002 | forstaelse | Agroøkologi/regenerativ metrikk: hva måles (jordhelse …) |
| R13-OKO-003 | PCQ | Jordhelse og karbon i jord: måleprogrammer, baseline, dekning |
| R13-OKO-005 | source-shortlist | Sertifiserings-/merkeordninger: Debio, Nyt Norge … |
| R13-OKO-007 | PCQ | Policy-mål for økologi/bærekraft: nasjonale mål, EU Farm-to-Fork |

#### P1 — alternativt protein / fôr (`protein-alt`)

| ID | Gate | Oppgave |
|---|---|---|
| R13-PROT-001 | source-shortlist | Insektprotein NO/Norden: realisert volum vs. kapasitet |
| R13-PROT-002 | source-shortlist | Single-cell/fermentering/gjærprotein i Norden |
| R13-PROT-003 | source-shortlist | R12-FEED-005: musling/tang/tare som protein/fôr — realisert volum |
| R13-PROT-004 | source-shortlist | Plantebasert humanprotein i Norge: produsenter, volum, marked |
| R13-PROT-006 | PCQ | Hva som faktisk erstatter soya/SPC i norsk fôr |
| R13-PROT-007 | PCQ | Proteinselvforsyning Norge: andel fôr-/matprotein innenlands |

#### P1 — matsvinn / sidestrømmer (`food-waste`)

| ID | Gate | Oppgave |
|---|---|---|
| R13-WASTE-002 | PCQ | Oppdrettsslam massebalanse: modellert vs. faktisk innsamlet |
| R13-WASTE-003 | source-shortlist | Matsvinn-redistribusjon: Matsentralen, Too Good To Go … |
| R13-WASTE-004 | PCQ | Husholdnings-/detaljmatsvinn: baseline, bransjeavtale |
| R13-WASTE-005 | PCQ | Digestat/biorest NPK-retur: faktisk målt eller ikke |
| R13-WASTE-007 | source-shortlist | Industrielle næringssidestrømmer (bryggeri, meieri, slakteri) |

#### P2 — viktig, men senere

| ID | Tema | Gate | Oppgave |
|---|---|---|---|
| R13-AKTOR-005 | actor-map | actor-gate | Frøbevaring/genressurs: KVANN, NordGen … |
| R13-AKTOR-007 | actor-map | actor-gate | Skogshage-/flerårige-/permakultur-sites |
| R13-AKTOR-008 | actor-map | source-shortlist | Lokalmat-distribusjon og REKO-alternativer |
| R13-GAP-003 | gap-closure | source-shortlist | R12-RES-005: transport/havn/lager/kaldkjede-sårbarheter (kun matrelevant) |
| R13-INNO-005 | innovation | source-shortlist | Konverteringsbarrierer: pilot som ikke skalerer |
| R13-INNO-007 | innovation | source-shortlist | Offentlig innovasjonsetterspørsel / innovative anskaffelser |
| R13-LAND-005 | landscape | source-shortlist | Bevegelse-/nettverkskart (regenerativ/lokalmat/øko) |
| R13-OKO-004 | ecology | source-shortlist | Biodiversitet i jordbrukslandskap: indikatorer |
| R13-OKO-006 | ecology | source-shortlist | Beite-/utmark-/husdyr-økologi: areal, karbon, metan |
| R13-PROT-005 | protein-alt | forstaelse | Presisjonsfermentering/dyrket kjøtt i Norden: status, regulering |
| R13-PROT-008 | protein-alt | source-shortlist | Norsk dyrking av bønner/erter/åkerbønne: areal, volum |
| R13-WASTE-006 | food-waste | source-shortlist | R12-WASTE-004: kaffegrut/urbane sidestrømmer |
| R13-WASTE-008 | food-waste | source-shortlist | R12-WASTE-005: prevention-tiltak mot matsvinn (krev baseline) |

### 3.3 Tverrgående research-tråder fra Møte 12 (ikke i R13-listen)

| Møte 12 | Tråd | Gate |
|---|---|---|
| M3 | **True-cost/eksternalitets-modell** (skyggepris) — den store intellektuelle krumtappen | Metodevalidering (G3) før ekstern bruk |
| M6 | **Konverteringsevne-scoring** — hvilke løsninger som faktisk skalerer vs. «blir i laben» | PCQ per case |
| M7 | **Nexus-rapporten** (mat/vann/helse/klima/natur, ~70 anb., SOIL) — verifiser kilde, koble tiltak mot 5 domener | Source-shortlist + claim-lock |
| M9 | **Marine næringsløkker-dossier** + fôr-substitusjon (skjell/tang, oppdrettsslam) | PCQ; ikke volum/effekt-claim uten kilde |

### 3.4 Bevisste blindsoner — parkert mot fase 2

- **N7 etterspørsel/forbruk** — markert blindsone; åpnes ikke nå.
- **N9 helse/true-cost** — holdes som planlagt **fase 2**. Revurderes kun hvis
  prosjektets primærformål skifter fra analytisk dybde til ekstern påvirkning
  (da mot «Sett III»). Inntil da: ikke bygg helse-/true-cost-linjen ut.

---

## 4. DATAINNHENTING-SPORET (MVK-dekning)

### 4.1 Dekningskartet i tall (per 2026-06-27)

| Område | Kartlagt | Univers (anslag) | Dekning |
|---|---:|---:|---:|
| innsatsfaktorer | 76 | 80 | **95 %** |
| matsvinn-sirkulær | 87 | 120 | **73 %** |
| primærproduksjon | 40 | 120 | 33 % |
| distribusjon-grossist | 20 | 60 | 33 % |
| lokale-verdikjeder | 50 | 261 | 19 % |
| regenerativ-praksis | 9 | 89 | 10 % |
| foredling-industri | 0 | 140 | **0 %** |
| handel-dagligvare | 0 | 40 | **0 %** |
| horeca-offentlig | 0 | 60 | **0 %** |
| fou-institusjon | 0 | 44 | **0 %** |
| institusjon-finansiering | 0 | 49 | **0 %** |
| finansiering-investering | 0 | 60 | **0 %** |
| interesseorg-paraply | 0 | 60 | **0 %** |
| økologi-sertifisering | 0 | 40 | **0 %** |
| permakultur-flerårige | 0 | 77 | **0 %** |
| virkemiddel-policy | 0 | 34 | **0 %** |
| forbruk | 0 | 30 | **0 %** |

### 4.2 Prioriterte felt å fylle (forslag)

Rangert etter strategisk vekt (resiliens/verdikjede) × størrelse × at vi har kilde:

1. **foredling-industri (0/140)** — størst tomt univers, og leddet der makten ligger
   oppstrøms (jf. 10-dagers-funn). Underområder: meieri, kjøtt/egg, korn/mølle/bakeri,
   frukt/grønt-foredling, drikke/bryggeri. Kilde: Brønnøysund + bransjeregistre.
2. **primærproduksjon — resten (40/120)** — jordbruk-grønt, husdyr-beite,
   ville-ressurser/sanking, urban-dyrking står på 0 av delmål. Kjernen i spor 1
   («grow best what you can»).
3. **handel-dagligvare (0/40)** — maktkartet finnes på konsernnivå, men MVK-cellen er
   tom; koble eksisterende konsern-/eierdata inn i dekningskartet.
4. **horeca-offentlig (0/60)** — offentlig innkjøp/storkjøkken; relevant for
   policy-sporet og København-mekanismen.
5. **virkemiddel-policy (0/34) + finansiering-investering (0/60)** — kobler til
   R13-INNO-003 (finansiering/virkemidler); felles datakilde.
6. **permakultur-flerårige (0/77) + regenerativ-praksis (9/89)** — fortsetter
   lokalmat-kartleggingen fra denne perioden; kobler til R13-AKTOR-004/005/007.

### 4.3 Etterkontroll-kø (allerede importert, må sjekkes en gang til)

Fra de tre register-importene 26.–27. juni — noder flagget for etterkontroll, ikke feil,
men ikke ferdig-verifisert:

- **havbruk-akvakultur:** 20 nye, 3 flagget.
- **villfisk-fiskeri:** 20 nye, 1 flagget.
- **grossist-distributor:** 19 nye + 1 beriket, 3 companyId-lenker, 18 flagget.
- → Kjør `audit:aquaculture(-reconcile)` + review-kø-resolusjon (jf. `mvk-review-koe`).

### 4.4 Register- og finansdata

- **Brreg financials** — nytt importskript på plass (`import-brreg-financials.ts`);
  gjenstår: kjør bredt for konsern/datterselskap der vi mangler regnskapstall.
- **MVK 0 %-celler fra Brreg** — første pulje importert (#211); fortsett systematisk
  per domene over.
- **companyId-lenking** — koble aktørnoder til selskaps-IDer der de finnes (startet på
  grossist-leddet).

### 4.5 Usikre universanslag (selv en datainnhentingsoppgave)

Flere universanslag i dekningsboka er merket `lav`/`middels` konfidens og bør
kildebelegges før de brukes som nevner i dekning-%:

- lokale-verdikjeder/gårdsutsalg (univers = 0, «ingen samlet telling»)
- lokale-verdikjeder/markedshager (ikke tallfestet)
- regenerativ-praksis/jordhelse-karbon, rådgivning-nettverk (grovt anslag)
- permakultur-flerårige/skogshage-agroforestry, demonstrasjonssteder (grovt anslag)
- → Disse er reelle data-arkitektur-hull, ikke søkemiss (samme klasse som
  fiskeslam-næringsregnskapet). Noter dem i **datagap-atlaset (R13-LAND-004)**.

---

## 5. Kvalitet, modell og infrastruktur som gjenstår

| Post | Hva | Kilde/gate |
|---|---|---|
| **Datagap-atlas** | Samle alle type-C-hull (R4/R5/R6/R12/R13) til ett register | R13-LAND-004 (internal) |
| **Indikatorsett per ledd × land** | Beredskap/sirkularitet/sårbarhet-indikatorer | M4 — intern; ikke benchmark uten kilde |
| **Ledd-profil-modell** | Funn/waste/aktører per verdikjedeledd | M1 — Port G (datamodell) |
| **`track`-klassifisering** | Merk hvert case spor 1 (nordisk) vs. spor 2 (ansvarlig sourcing) | M2 — scope-vedtak (G1) |
| **Sufficiency–efficiency-akse + R9-prevention-topp** | Klassifiseringsmodell | M5 — intern |
| **NotebookLM-arkiv (~25 tema)** | Kuratér arkiv → mottaksprotokoll; intern/ekstern-skille | M10 — Port G |
| **Uttaks-/figurkandidatliste** | Hvilke R13-funn kan bli whitepaper-figurer | R13-LAND-006 (internal) |

---

## 6. Prioritert rekkefølge (forslag — sekvensert mot H1 31.07 + oktober)

1. **Lukk P0-ene** (R13-GAP-001, GAP-005, WASTE-001) + **gate-lukk N11** (verifisert
   2026-06-29; gjenstår kun `audit:citable`/`gate:overclaim` i DB-miljø). Dette er
   gap-closure som fjerner kjente svakheter i eksisterende materiale.
2. **Fyll foredling-industri + resten av primærproduksjon** (data-sporet) — størst
   tomme univers, høyest strategisk vekt, kilde finnes (Brønnøysund).
3. **Kjør etterkontroll-køen** på de 22 flaggede registernodene → løft fra «kartlagt» til
   «verifisert».
4. **Forbered alt bak G1** (actor-gate-mål + aktørkart med navn) som kandidatlister, slik
   at de er klare i det øyeblikket scope-vedtaket foreligger — men lås ikke til ekstern bruk.
5. **Bygg datagap-atlaset (R13-LAND-004)** parallelt — det gjør resten av prioriteringen
   selvdokumenterende.
6. **True-cost/nexus (M3/M7)** startes som metodearbeid, men holdes bak G3 til validert.

---

## 7. Åpne spørsmål til oss (beslutninger vi bør ta)

1. **N11:** er r6-leveransen faktisk lukket mot DoD, eller gjenstår verifikasjon? (Avgjør
   om bondeøkonomi flyttes fra «blind» til «dekket» i systemmodellen.)
2. **Datasekvens:** tar vi foredling-industri (størst) eller handel-dagligvare (lettest,
   gjenbruk av konserndata) som neste datadomene?
3. **R13-kjøring:** kjører vi P1 tematisk (én tema-klynge av gangen) eller etter gate
   (alle source-shortlist først, så PCQ)? Påvirker hvor raskt vi får siterbare uttak.
4. **Universanslagene:** skal vi bruke en egen kort runde på å kildebelegge de usikre
   universtallene før de brukes som dekningsnevner, eller leve med `lav`-merkingen?
5. **Bak G1:** hvor mye forbereder vi av actor-gate-arbeidet før scope-vedtaket — kun
   kandidatlister, eller også kildejakt per node?

---

## 8. Beslutningsutkast — anbefalte svar på kap. 7

> Førsteutkast fra Claude, til Gabriels review. Hver post har anbefaling, begrunnelse
> og en konkret neste handling. Ingenting her overstyrer gatene eller scope-vedtaket.

### 8.1 N11 — lukket eller ikke?

**Anbefaling:** Behandle N11 som **delvis dekket, verifisert — men ikke formelt gate-lukket**.
Verifikasjonspasset er kjørt (2026-06-29) og leveransen holder: alle 8 seksjoner, primærkilde-
forankret, adversariell verifikasjon til stede, mottaksrad finnes, aritmetikk re-kjørt uavhengig
og korrekt. Eneste gjenstående blokker er gate-kjøringen, som krever DB.

**Begrunnelse:** I tråd med anti-no-op-vakta — *verifisering er ikke fullføring*. Verifiseringen
er nå gjort og bekreftet, så «delvis dekket» er et dekket (ikke gjettet) status. Men gate-grønt
(`audit:citable`/`gate:overclaim`) er ennå ikke bevist; til det er kjørt er skvis-tallene
«siterbar-kandidat», ikke gate-bekreftet. Per-kg-margin forblir bevisst Type B (aktør-gate) —
det er en legitim avgrensning, ikke en åpen DoD-post.

**Neste handling:** Kjør `audit:citable` + `gate:overclaim` i miljø med DB. Grønt → N11 formelt
lukket på «delvis dekket». Systemmodell-node og nominell-tall-nit er allerede rettet (2026-06-29).

### 8.2 Datasekvens — foredling-industri eller handel-dagligvare først?

**Anbefaling:** **Handel-dagligvare først** (rask seier, 1–2 økter), deretter
**foredling-industri** som hovedløftet.

**Begrunnelse:** Handel-dagligvare-cellen står på 0/40, men dataen finnes i praksis allerede
— maktkartet er kartlagt på konsernnivå. Å koble eksisterende konsern-/eierdata inn i
dekningskartet er lav marginalkostnad og lukker et 0 %-felt nesten gratis. Foredling-industri
(0/140) er det strategisk viktigste (makten ligger oppstrøms), men et reelt research-løft —
det fortjener full oppmerksomhet *etter* at den billige seieren er tatt og momentum er bygget.

**Neste handling:** Spec en liten «wire-in»-oppgave: map eksisterende dagligvarekonsern →
MVK handel-dagligvare-celler. Så åpne foredling-industri som egen kartleggingsrunde
(start: meieri + kjøtt/egg, der konsentrasjonen er høyest).

### 8.3 R13-kjøring — tematisk eller gate-drevet?

**Anbefaling:** **Gate-drevet, priorisert, med tematisk batching inne i source-shortlist.**
Konkret: (1) lukk P0 (alle PCQ) først; (2) kjør P1 `source-shortlist` som én bred,
parallelliserbar fan-out — gruppert per tema for koherens; (3) konvertér de høyest-verdi
funnene til PCQ i et fokusert pass; (4) hold alle `actor-gate`-mål samlet bak G1.

**Begrunnelse:** PCQ er det som faktisk produserer primær-sjekkede, siterbare tall —
derfor P0-PCQ først for raskest mulige trygge uttak. `source-shortlist` er billig, DB-fritt
og parallelliserbart; det egner seg til en samlet fan-out som bygger kildebredden før den
dyrere primæruttrekkingen. Tematisk batching brukes som *sekundær* sortering, ikke primær —
det gir sammenheng uten å ofre gate-logikken som verktøykjeden allerede følger.

**Neste handling:** Kjør P0-trioen → så en source-shortlist-fanout på P1, tema for tema.

### 8.4 Usikre universanslag — egen runde eller leve med `lav`?

**Anbefaling:** **Lev med `lav`-merkingen** — men slutt å vise dekning-**%** som hovedtall
for domener med `lav`-konfidens nevner. Vis i stedet «kartlagt antall + univers usikkert».
Legg universkildejakten inn som **linjeposter i datagap-atlaset**, ikke som egen runde.

**Begrunnelse:** En dedikert universrunde er lav-leverage akkurat nå. Det ærlige (og
billige) grepet er å ikke over-stole på prosenten der nevneren er myk — helt i tråd med
«ikke tilgjengelig framfor gjetning». Da unngår vi at et grovt anslag gir en falsk presis
dekningsgrad, uten å bruke en hel runde på det.

**Neste handling:** Merk `lav`-nevnere i dashboardet; flytt universkildejakt til
datagap-atlaset (R13-LAND-004).

### 8.5 Bak G1 — hvor mye forbereder vi før scope-vedtaket?

**Anbefaling:** Forbered helt **opp til** actor-gate-linja, men ikke gjennom den: lag
**kandidatlister + source-shortlist (kildejakt per node)**. **Ikke** kjør PCQ/primæruttrekk
og **ingen** outreach/intervju før vedtaket.

**Begrunnelse:** Source-shortlist er billig, reversibelt og gjør oss umiddelbart klare når
vedtaket lander — vi taper ingenting om scope endres, fordi vi bare har samlet kandidater
og kilder. PCQ/primæruttrekk og aktørkontakt er der ekstern-bruk-risiko og reell kostnad
ligger; de holdes bak gaten. Maks beredskap, minimum bortkastet arbeid.

**Neste handling:** For de 5 actor-gate-målene: bygg kandidatliste + source-shortlist nå;
merk dem eksplisitt «klar til PCQ ved scope-vedtak».

### Beslutningsutkast i én tabell

| # | Spørsmål | Anbefaling |
|---|---|---|
| 1 | N11 lukket? | Verifisert «delvis dekket» (2026-06-29); gjenstår kun gate-kjøring i DB-miljø |
| 2 | Datasekvens | Handel-dagligvare (rask seier) → så foredling-industri (hovedløft) |
| 3 | R13-kjøring | Gate-drevet + priorisert; P0-PCQ først, så source-shortlist-fanout |
| 4 | Universanslag | Lev med `lav`, men skjul %-en der nevner er myk; logg i datagap-atlas |
| 5 | Bak G1 | Kandidatliste + source-shortlist nå; PCQ/outreach holdes bak vedtaket |

---

*Levende dokument. Når en post lukkes: oppdater kanonisk kilde (R13-backlog / dekningsbok /
mottakslogg) og kryss av her. Ingenting i denne lista er ekstern-godkjent før gatene er grønne.*
