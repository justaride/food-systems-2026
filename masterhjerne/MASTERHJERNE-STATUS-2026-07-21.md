# Masterhjernen — samlet kunnskapsstatus for Food Systems 2026

**Dato:** 2026-07-21
**Status:** Intern arbeidsstatus — ikke claim-locket, ikke eksternt siterbar
**Utarbeidet av:** KI-agent, på oppdrag fra Gabriel Freeman
**Følgesvenn:** `MASTERHJERNE-DASHBOARD-2026-07-21.html` (interaktiv visning av alt under) og `masterhjerne-data-2026-07-21.json` (maskinlesbare tall)
**Forhold til andre dokumenter:** Dette er *tilstandsbildet* som MASTERPLAN-2026-07-06 (visjon) og DATAGAP-ANALYSE-2026-07-06 (hull-analyse) forutsetter. Det erstatter ingen av dem — det måler dem mot det som faktisk ligger i prosjektet per i dag, fil for fil.

---

## 0. Sammendrag

Hele prosjektmappen er gjennomgått: **4 326 filer (717 MB)**, hvorav **3 851 innholdsfiler** når infrastruktur (git, node_modules, verktøykataloger) holdes utenfor. Alt maskinlesbart underlag — kildebibliotekets ledger (1 555 kilder), evidenskvalitetsauditen (417 akademiske/eksterne rader), dekningsdashboardet (70 celler, 1 634 aktører), KI-prioritetskorpuset (208 kilder), URL-helsen (600 lenker), PDF-katalogen (436 dokumenter), DB-eksportene og planverket — er analysert og sammenstilt.

Hovedkonklusjonen i én setning: **hjernen har allerede en komplett og uvanlig ærlig hukommelse, men den er tynn i dybden, blind for tid, uten sanser og uten menneskestemmer — og det neste datainnhentingsarbeidet bør derfor være smalt og målrettet, ikke bredt.**

Svaret på spørsmålet «bør vi hente inn mer data for et mer kvalitativt overordnet bilde?» er **ja, på fire presise fronter — og nei på resten**:

1. **JA — menneskedata (størst hull, hardest kontraktskobling).** Basen har 244 516 feltsiteringer og null intervjusitater. Mission 1 (intervjuer) og Mission 2 (nordisk partnervalidering) er planlagt, guidene finnes, ingenting er gjennomført. Dette blokkerer whitepaper-kvaliteten direkte og har lengst ledetid.
2. **JA — men metodegated aktivitetssignal, ikke masseoppgradering.** Registrene bekrefter at aktører *finnes*, ikke at de *driver*. For sjømat finnes et frosset prosjektutvalg på 270 org.nr., men dagens kode kobler ikke dette utvalget til ett kontrollert aktivitetssignal: MTB er kapasitet, ikke faktisk biomasse, og villfisk mangler org.nr.→fartøy/eier→landing-pipeline. Start med read-only entity-resolution-preflight og domenevis signalvalg; ingen rad løftes automatisk fra «lav» til «middels».
3. **JA — strukturert kildevurdering (appraisal).** Metadataene i det akademiske laget er sterke (år/institusjon 100 %), men vurderingslaget — studiedesign, risk of bias, anvendbarhet — står på **0 av 417**. Modellen og en pilotmal finnes, men pilotens tre fulltekstdisposisjoner venter navngitt menneskereview, og produksjonsgaten må lukkes før en topp-50-sprint kan starte.
4. **JA — nordisk paritet på utvalgte felt, men source/model-gated.** FI/IS-batchen har 16 rader = 15 tallceller + én åpen Samkaup-rad. Fem selskapsgrupper krever modellvalg, Samkaup har `source_gap`, og validatoren gir `canApply:false`; ingen rad er importert. Nordisk MVK har et generisk importskjelett, men ingen operasjonell SE/DK-konfig, universe, legal-ID-regler eller kandidatbatch.
5. **NEI — ikke mer bredde i aktørkartleggingen.** Gulvet er nådd (1 634 av 1 651 estimert, 99,0 %). Mer bredde-deepening i celler på run-floor gir marginal verdi. Og ekte C-hull (det ingen i Norge måler) skal *dokumenteres som funn*, ikke jaktes.

I tillegg: gjennomgangen avdekket noen interne konsistensavvik (katalog vs. disk, stale dekningsfiler, små talldrifter mellom kontrolldokumenter) som er dokumentert i §10 — de er små, men verdt å rydde fordi «én kilde til sannhet» er masterplanens eget designprinsipp.

---

## 1. Metode

Analysen er gjort slik masterhjernen selv skal arbeide:

1. **Full filcensus.** Rekursiv indeksering av hele mappen (inkl. `research/` med alle undermapper, `docs/`, Obsidian-vaulten, `src/`, `scripts/`, datalag). Hver fil klassifisert etter rolle.
2. **Programmatisk analyse av alle maskinlesbare aggregat:** `library-analysis-ledger.jsonl` (1 555 rader), `academic-source-quality-status.json`, `KI-PRIORITY.csv`, `URL-HEALTH.csv`/`URL-INVENTORY.csv`, `pdf-katalog.json`, `domene-dekning-hull-2026-07-02.md` (verifisert radsum), `food-tg-research-backlog-2026-06-25.csv`, `data/vault-export/*.json`, `public/data/coverage/profiles.json`, `public/data/food-systems/*` (materialstrømmer, næringsstoff, sirkularitetsløkker, R9, verdikjeder per land).
3. **Lesning av styrende dokumenter:** MASTERPLAN, DATAGAP-ANALYSE, MASTER-RESEARCH-PLAN (WS1–WS6), CITABLE-KNOWLEDGE-BASE-STATUS, AKADEMISK-KILDEHANDTERING-PLAN, whitepaper gap-list/completion-delta, evidence-pack (roadmap, adoption-track, finance-note), KILDEREGISTER, MASTER-PHD-BACKLOG, MASTER-ANALYSE-INDEX, DATA-READINESS-SLUTTRAPPORT.
4. **Kryssverifisering.** Alle nøkkeltall i dashboard og rapport er regnet på nytt fra kildefilene der det var mulig (f.eks. domene-summen 1 634/1 651 er verifisert celle for celle; kildeklasse-fordelingen er talt fra CSV-en; bibliotekstatusene er talt fra ledgeren). DB-tall som ikke kan måles fra filene (55 431 selskaper osv.) er tatt fra prosjektets egne kontrollrapporter og er merket med dato.

Alt i dette dokumentet arver kildenes egne claim-grenser. Ingenting her er nye eksterne påstander.

---

## 2. Hjernens masse — hva som faktisk ligger i prosjektet

| Komponent | Omfang | Kommentar |
|---|---:|---|
| Filer totalt | 4 326 (717 MB) | 3 851 innholdsfiler / 693 MB utenom infrastruktur |
| Markdown-notater | 2 379 | analyser, kildespeil, møter, kontrolldokumenter |
| Kildebibliotek (ledger) | 1 555 kilder | alle maskinbehandlet («AI-kort»); status i §5.4 |
| Akademisk/ekstern evidens i DB | 417 rader | 139 Reports · 79 Theses · 199 SourceDocs (audit 20.07) |
| Feltsiteringer | 244 516 | Live readback 21.07; teknisk strict gate PASS |
| Kildesiteringer | 2 703 | 154 `citable_external` · 2 222 `citable_with_note` · 110 `internal_context` · 217 `blocked_unsourced` |
| Selskaper i DB | 55 431 | audit 27.04; kuratert graf: 351 selskaper, 160 eierskapskanter, 105 relasjoner, 1 800 styreverv (eksport 03.07) |
| Subsidieposter | 179 311 | Produksjonstilskudd 2025 (coverage-profil 03.07) |
| PDF-katalog | 436 PDF-er · 23 559 sider · 2,0 GB | katalog 04.07; 120 PDF-filer fysisk i mappen i dag (resten arkivert/tekstspeilet) |
| Kildespeil (tekst) | 264 filer i `research/external/` | + 243 filer i `research/bibliotek/` |
| Sentralt kilderegister | 256 APA-oppføringer | 13 seksjoner (KILDEREGISTER.md, oppdatert 20.07) |
| App | 51 sider/flater | Next.js + Prisma (48 modeller) + pgvector; 318 npm-scripts; egen MCP-server (`mcp/foodsystems-kb`) |
| Obsidian-vault | ~840 noter | 540 maktkart-noder · 128 innsiktskart-noder · 47 kildenoder (synkronisert fra DB 03.07) |
| Styringsdokumenter | 334 filer i `docs/project/` | mandater, planer, statuser, completion-register |
| Møter/transkripsjoner | 21+ filer | 9. mars-møtet, TG-møter, arbeidsmøter, Landbruksarena-transkripter (42 filer i egen mappe) |
| Forskningsmissions | 50 planlagte (R13) | alle med status `planned` i backlog-CSV-en (25.06) |

Datalagene som allerede er *modellert* (ikke bare samlet): materialstrøm-løkker (25 dokumenterte + 37 dokumenterte gap), næringsstoffstrømmer med 9 gjenvinningsteknologier (NO/SE/DK/FI), R9-sirkularitetsmatrise (10 nivåer), policy-landskap, verdikjedemodell i 8 ledd for alle fem land, konsentrasjonsmetrikker (Lorenz/Zipf/HHI), geodata (butikker, akvakulturlokaliteter, havner, prosessanlegg, kommuner for hele Norden).

**Dommen:** Hukommelsen er reelt sett komplett på bredde og eksepsjonelt godt *styrt* (proveniens på alt). Massen er ikke problemet lenger.

---

## 3. Verdikjededekning — 17 domener, 70 celler

Verifisert celle-for-celle fra `research/_status/domene-dekning-hull-2026-07-02.md` (nyeste hull-rapport): **1 634 kartlagte aktørregistreringer mot 1 651 estimert univers (99,0 %)**.

| Domene | Kartlagt / univers | Domene | Kartlagt / univers |
|---|---:|---|---:|
| Primærproduksjon | 350 / 350 | Institusjon & finansiering | 49 / 49 |
| Lokale verdikjeder | 251 / 258 | FoU-institusjoner | 44 / 44 |
| Foredling & industri | 140 / 140 | Handel & dagligvare | 40 / 40 |
| Distribusjon & grossist | 120 / 120 | Økologi & sertifisering | 40 / 40 |
| Matsvinn & sirkulær | 104 / 120 | Virkemiddel & policy | 34 / 34 |
| Regenerativ praksis | 91 / 89 | Forbrukerledd | 30 / 30 |
| Permakultur & flerårige | 81 / 77 | HoReCa & offentlig mat | 60 / 60 |
| Innsatsfaktorer | 80 / 80 | Interesseorg & paraply | 60 / 60 |
| Finansiering & investering | 60 / 60 | | |

De eneste reelle bredde-hullene: **insekt/alternativ protein 7/20** (source-limited), **matredistribusjon 15/20**, **andelslandbruk 83/90**, REKO 139/140. Alt annet står på universgulvet.

**Men:** dekningsdashboardets egen konfidenskolonne feller dommen — **59 av 70 celler «lav» konfidens, 9 «middels», 2 «høy»**. Universene bruker et min(20, univers)-gulv, så «full» celle betyr «gulvet er nådd», ikke «alle finnes». Og ingen celle har verifisert *aktivitet* (drift i 2026, volum, omsetning). Lav konfidens med fullt gulv betyr: *vi har navnene, ikke virkeligheten.* Dette er hovedgrunnen til at neste innhentingsrunde skal handle om aktivitetssignal, ikke flere navn.

**Nordisk asymmetri, målt:** i verdikjedemodellen (8 ledd × datafelt) har NO 73 utfylte felt, IS 53, SE 50, DK 47, FI 46. Norge har 5-års finanser og 17 kartlagte steg; SE/DK har kun 2025-backfill på majors; FI/IS-2025 finnes bare som en uimportert 15+1-kandidatbatch bak kilde- og modellporter; alle 70 dekningsceller er geo=NO. Whitepaperets nordiske sammenligning hviler dermed på et tynnere lag enn den norske analysen — og på Mission 2-validering som ikke er gjennomført.

---

## 4. Evidenskvalitet — hvor god er dataen?

### 4.1 Siterbarhetskjeden (systemets ryggrad)

Per øverste, eksplisitt supersederende live-readback i `CITABLE-KNOWLEDGE-BASE-STATUS.md` 2026-07-21:

```
244 516 feltsiteringer  →  2 703 kildesiteringer  →  2 222 citable_with_note
                                                  →    154 citable_external
                                                  →    110 internal_context
                                                  →    217 blocked_unsourced (fail-closed)
Acceptance-pack: 11 av 16 nøkkelpåstander cite-ready, 5 dokumentert fail-closed-blokkert
```

`db:audit` og strict source-gate passer, og eksterne blocking citation issues er 0. Dette er et **teknisk citation/source-gate-resultat**, ikke akademisk READY: de 217 `blocked_unsourced`-radene forblir fail-closed og kan ikke støtte eksterne påstander. Separat akademisk status er fortsatt `not_ready` med 0/417 komplette appraisal-disposisjoner. Gjeldende låste nasjonale mål: **omsetnings-HHI 3 327 / CR3 96,6 % (2024)** — det eldre tallet 3 445 er eksplisitt historikk/butikkantalls-proxy og skal ikke gjenbrukes (supersession-notat 15.07).

### 4.2 Kildeklassene — hvor akademisk er grunnlaget?

KI-prioritetskorpuset (208 rapporter + avhandlinger, `KI-PRIORITY.csv`):

| Klasse | Antall | Andel |
|---|---:|---:|
| **Akademisk lag** (64 masteroppgaver + 24 akademia + 14 ph.d.) | 102 | 49,0 % |
| **Offentlig & tilsyn** (25 offentlig + 22 konkurransetilsyn + 4 NOU + 3 juridisk + 5 beredskap) | 59 | 28,4 % |
| **Bransje** | 27 | 13,0 % |
| **Tenketank/konsulent/oversikt/øvrig** | 20 | 9,6 % |

Snittscore 4,83/5 (163 av 208 på topp-score). **Ferskhet: 70,7 % av kildene er fra 2023–2026** (147 av 208); halen tilbake til 2005 er bevisste historiske referanser (NOU 2011:4 «Mat, makt og avmakt» m.fl.). I DB-laget for øvrig: 79 avhandlinger med metodefelt 100 % utfylt, og MASTER-PHD-BACKLOG (20.07) ligger klar med ~15 nye identifiserte master-/ph.d.-arbeider (NHH, SLU, LUT, KTH, Aalto, Aalborg, Helsinki) som dekker markedsmakt, beredskap og sirkularitet — *neste naturlige akademiske påfyll.*

### 4.3 Metadatakvalitet i det akademiske/eksterne laget (417 rader, audit 2026-07-20)

| Felt | Rapporter (139) | Avhandlinger (79) | Kildedok (199) |
|---|---:|---:|---:|
| Årstall | 100 % | 100 % | 85,9 % |
| Institusjon/attribusjon | 100 % | 100 % | 93,0 % |
| Gyldig kilde-URL | 90,6 % | 100 % | 59,3 % |
| Tilgangsdato (accessedAt) | 66,2 % | 98,7 % | 39,2 % |
| DOI / varig identifikator | 15,8 % | 46,8 % (1 DOI + 36 hdl/diva/urn) | 5,0 % |
| Arkivert kopi (`SourceDoc.archivedUrl`) | — | — | **0 %** |
| **Strukturert kildevurdering (appraisal)** | **0 %** | **0 %** | **0 %** |

- **Regresjonsgate: PASS** (ingen felt har falt under minimum).
- **Ekstern akademisk beredskap: NOT READY.** To grunner: (1) appraisal-laget er tomt — *ingen* av de 417 radene har komplett studiedesign-/risk-of-bias-vurdering eller eksplisitt eksklusjon; (2) seed/DB-identitetsparitet har 18 avvik (17 managed YouTube-kilder + `matsvinnloven-2025`-tesen som er avvist som syntetisk identitet og skal peke på lovteksten LOV-2025-06-20-103 i stedet).
- Merk presisjonen i systemets egen formulering: korpuset er *blandet evidens* (akademia + offentlige kilder + registre + interne synteser), ikke 417 akademiske publikasjoner — og «URL-syntaks validert» betyr ikke «lenken lever» (det måles separat, §4.5).

**Betydning:** Deskriptiv kartlegging og intern syntese kan brukes innenfor dagens interne claim-grenser. Men kausale påstander, helsepåstander og «forskningen viser»-formuleringer er — med rette — blokkert. Først må pilotens tre fulltekstkilder få navngitte disposisjoner; deretter må produksjonsworkflow/gate designes og reviewes. Appraisal-korpuset kan ikke behandles som «bare kjøring» eller startes direkte som topp-50.

### 4.4 Kildebiblioteket — KI-klargjøring av 1 555 kilder

Fra `library-analysis-ledger.jsonl` (20.07):

| Status | Antall | Andel |
|---|---:|---:|
| `ai_draft` (maskinbehandlet, venter godkjenningsløp) | 1 427 | 91,8 % |
| `review_required` (i menneskelig kø) | 89 | 5,7 % |
| `approved_internal` (godkjent for KI-kontekst) | 35 | 2,3 % |
| `blocked` (skal ikke brukes) | 4 | 0,3 % |

Risikoflagg: 89 kilder med lav tekstkvalitet (OCR/ekstraksjonsgjeld), 18 med manglende filsti, 7 med uverifiserte rapportpåstander. `claimCandidateCount = 0` over hele linjen — claim-kandidatlaget er med vilje ikke åpnet ennå. **Flaskehalsen er altså ikke innsamling eller maskinbehandling — det er menneskegodkjenning.** 35 godkjente av 1 555 er tallet å flytte, og review-køen på 89 er definert og klar.

### 4.5 URL-helse og arkivering (immunforsvaret)

600 sjekkede lenker: **506 OK (84,3 %) · 49 blokkert (paywall/robots) · 41 døde · 4 annet**. Kritisk nyanse: av de 173 høyprioritetslenkene (P ≥ 4) er **0 døde** — prioriteringen har virket. De eldre URL-helse- og `SourceDoc`-flatene viser fortsatt `archivedUrl` 0 %, men dette er ikke hele arkivbildet. Live, read-only audit av alle 2 703 `SourceCitation`-rader finner 530 rader med arkiv-URL, 1 389 med lokal sti og 38 med lokalt hashverifisert snapshot. Etter deduplisert dekningslogikk har 568 rader varig kopi totalt; blant de 2 376 eksternt klare/med-note-radene har 521 varig kopi og 1 855 trenger fortsatt arkiv. Gaten feiler med 1 872 blokkerende ID-er. Immunforsvaret er derfor delvis til stede, men ikke komplett eller automatisert ved første sitering; audit, deduplisering og prioritering må komme før Wayback-/snapshot-apply.

### 4.6 Dokumentkorpuset

PDF-katalogen (04.07) holder 436 PDF-er / 23 559 sider / 2,0 GB; 120 PDF-filer ligger fysisk i mappen i dag — differansen er arkivflytt og tekstspeiling (264 external-speil + 243 bibliotekfiler). Alle 96 kjerne-PDF-er i evidence-pack er faktisk *gjennomlest og analysert* (pdf-gjennomgang-serien, 14 analysenotater) — det er reell «behandlet»-status, ikke bare lagring.

---

## 5. Bredde × dybde × ferskhet × kausalitet — dommen per kunnskapslag

Fra DATAGAP-analysen (06.07), bekreftet av denne gjennomgangen:

| Kunnskapslag | Bredde | Dybde | Ferskhet | Kausalitet | Dom |
|---|---|---|---|---|---|
| Konserntrær / norske majors | god | god | god (5-års finanser) | middels | **Sterkest lag** (11+ komplette trær) |
| Domeneaktører (1 634 · 17 steg) | god | **svak** | svak | — | **Bredde uten dybde** (actor-gate) |
| Materialstrømmer / N-P-K | — | **mangler** | — | — | **Største substanshull** (12 VK4-gap åpne) |
| Nordisk (SE/DK/FI/IS) | svak | svak | delvis | svak | Asymmetrisk mot NO |
| Lokale verdikjeder (REKO/CSA) | god | svak | **svak (2022-tall)** | svak | Eksistens ≠ aktivitet |
| Økologi/jordhelse/biodiversitet | middels | svak | middels | **svak** | Ekte type-C-tyngdepunkt |
| Makt/eierskap utover majors | middels | svak | middels | middels | Type B (betalingsmur/innsyn) |
| Kvalitativt/menneskelig | **null** | null | null | null | **0 intervjuer — hardest kontraktskobling** |

Profilen i én linje (DATAGAP §7, verifisert her): *komplett bredde, håndhevet ærlighet, tynn dybde, ingen tid, ingen stemmer.*

---

## 6. Innsikter hjernen allerede holder

Et utvalg av de sterkeste funnene på tvers av hele underlaget (låste tall merket; alt annet er internt arbeidsmateriale som skal gjennom claim-lock før ekstern bruk):

1. **Dagligvaremakt, låst:** omsetnings-HHI **3 327**, CR3 **96,6 %** (2024) — cite-ready via CA-004. Konsentrasjonsanalysen finnes også som Lorenz/Zipf-kurver og butikknettverk for hele Norden.
2. **Sårbarhet som enkeltpunkter:** ASKO Vestby-avhengigheten er formulert som pilotbrief; importnodene (fosfat, fôrprotein, fiskeolje, soya, kaffe, kakao) er PCQ-kontrollert på hovedserier — men **kapasitet per havn/kaldkjede/sentrallager er C-celler** (DSB/FFI beskriver mekanismer, ikke tall).
3. **Målegrensene er selve funnet:** JordVAAK er startet uten publisert nasjonal SOC-baseline, insektserien er for kort for robust trend, og kornberedskap må skille kontrahert 2029-mål fra faktisk beholdning. For oppdrettsslam, digestat-NPK og øvrige noder er den kontrollerte formuleringen at prosjektet ikke har identifisert en harmonisert åpen serie — ikke at ingen måler noe. Den daterte boksen finnes i `research/forstaelse/det-norge-ikke-maaler.md` og V2 kapittel 11.
4. **Sirkularitet, kartlagt ærlig:** 25 dokumenterte løkker (med TRL/R-nivå), 37 dokumenterte gap med barrierer og policy-hendler, 14 suksess- og 10 fiaskocase — inkludert konkursledgeren (Rest, Enorm, Mycorena, Infarm) som beviste verdien av konkurs-sporet.
5. **Styre-interlock, dekningskontrollert:** 0 nordiske interlocks funnet — men med 118 seter dekket i 14 av 61 selskaper er det et *dekningskontrollert negativt funn*, ikke et funn om virkeligheten. Repoets egen kilde-routing viser manuell, credential-, interaktiv eller betalt tilgang avhengig av land; ingen nordisk innhentingsadapter eller gratis dekningsdobling er dokumentert.
6. **Loven alle kjenner, nesten ingen bruker:** 89–95 % av leverandørene kjenner Lov om god handelsskikk; nesten ingen påberoper seg den. Mekanismen (fryktkultur) er sekundærkildebasert — intervjuene er det som kan gjøre den til egen evidens.
7. **Alt-protein: kapasitet forveksles systematisk med realisert volum** i pressedekningen; kontrollnotatene holder skillet, og realisert-volum-cellene står ærlig tomme. Regnskaps-triangulering er veien inn.
8. **Metoderegimet er selve innovasjonen:** fail-closed, claim-lock, PCQ-gates, universe-estimering, mottakslogg — håndhevet av kode, ikke av disiplin. 5 av 16 acceptance-claims bevisst blokkert er et *kvalitetsstempel*. Dette er eksporterbart som standard (tekstil/bygg er nærmeste kandidater).

---

## 7. Prioritert innhentingsagenda

Prioritering = (verdi for whitepaper/roadmap) × (lukkbarhet) ÷ (kostnad). Type A = desk research mot åpne kilder; B = aktørkontakt/betalt kilde; C = ingen kjent kilde måler dette (hullet er selv et funn).

### Tier 1 — før 31. juli (whitepaper-kritisk)

| # | Oppgave | Type | Gate | Innsats |
|---|---|---|---|---|
| 1 | **Mission 1-intervjuer** (leverandør, produsent, uavhengig grossist, kommune, gründer) | B | eier + personvern + samtykke + review | Beslutningsklart utkast; ikke utsendingsklart eller booket |
| 2 | **Mission 2 nordisk partnervalidering** (separate tabeller til Michel Bajuk / Betina Simonsen) | B | mottaker/scope + Cathrine-review + sendebeslutning | 4 SE- og 5 DK-rader fylt; ikke sendt eller partnerbekreftet |
| 3 | FI/IS 2025-finanser + metodenote municipal-HHI | A | kilde + modellvalg + PCQ | 15 tallceller + 1 åpen rad; validator `canApply:false` |
| 4 | «Det Norge ikke måler»-boksen dateres per C-hull med ansvarlig institusjon | A/C | claim-review | Datert kandidat; skiller måleprogram, baseline, kort serie, kontrakt og faktisk lager |

### Tier 2 — Horisont 1 (aug–des 2026): konfidens-oppgradering

| # | Oppgave | Type | Metode |
|---|---|---|---|
| 5 | Aktivitetssignal havbruk + villfisk for et frosset 270-raders prosjektutvalg | A | entity-resolution-preflight + domenevis signalvalg; MTB er ikke faktisk biomasse |
| 6 | Aksjonær-/founder-lag: Skatteetatens aksjonærregister + årsrapportnoter, topp 50 i alt-protein/CEA/sirkulær | A/B | innsyn + ett Proff-abonnement |
| 7 | REKO/CSA 2026-aktivitetsstatus: årsmeldinger + admin-survey | A→B | skissert survey-mission |
| 8 | N/P/K-tabellskjelett (VK4-GAP-007): cellekontrakt og kildeshortlist finnes; Type A-celler er ikke fylt | A | primærlokator + systemgrense + metodeetikett + PCQ per celle; legacy-JSON er proxy/modell |
| 9 | Alt-protein realisert volum: utvalg og metode må defineres før eventuell topp-15 | A/B | direkte tonnasje eller dokumentert pris×produktandel; finans bare aktivitetssignal; ellers actor-gated |
| 10 | Innsynsrunde DSB/Landbruksdirektoratet (lagerkapasitet) + DFØ/KS (innkjøpsdata) | A/C | avsender/scope/juridisk readback; avslag er tilgangsutfall, ikke automatisk C-funn |

**Pluss ett kvalitetsløp uten ny innsamling:** lukk først de tre ventende, navngitte fulltekstdisposisjonene i appraisal-piloten. Deretter designes og reviewes produksjonsgaten for skalerbar kjøring. Først når begge er lukket kan en topp-50-sprint prioriteres blant de 154 `citable_external`- og acceptance-pack-kildene. Bibliotekets separate review-kø på 89 følger sitt eget menneskegodkjenningsløp.

### Tier 3 — Horisont 2/3 (2027+): nye lag

- **Nordisk MVK (3×2):** generisk importskjelett finnes, men ingen operasjonell SE/DK-konfig, universe, legal-ID-regler, validator eller kandidatbatch.
- **Styre/eierskap 14→61:** baseline-audit finnes; nordisk tilgang/innhentingsadapter og dekningsprognose mangler, og styre/eierskap skal måles separat.
- **Subsektor-HHI:** dagligvare har én tidsserie og enkelte subsektorer punktestimater; fôr, kjøtt, emballasje og grossist mangler harmoniserte målserier.
- **Materialstrøm/sårbarhet:** legacy-proxy og kildeshortlist finnes. Materialstrømlag v1 og indeks-spec hører H2 til; full N/P/K-balanse forblir H3.
- **Kausalitet:** uvalidert mal med 0 case; ett pilotcase og navngitt metodereview kommer før eventuell validator.
- **Lokalmatkanaler:** samlet direktesalg er kjent, men kanalfordeling er parkert bak taksonomi, nevner, kilde/lisens, budsjett og partneransvar.

Ingen av disse blir Type C bare fordi en desk-runde ikke fant data; dokumentert søk og relevant institusjonsavklaring kreves.

### Bevisst nedprioritert

Mer bredde-deepening i celler på run-floor (unntak: insekt 7/20 og matredistribusjon 15/20 hvis nye kilder dukker opp) · URL-helse-restene (74 LOW — vedlikehold, ikke research) · forsøk på å desk-lukke ekte C-hull.

### Datakilder å skaffe, forhandle eller overvåke

| Kilde | Gir | Status | Kostnad |
|---|---|---|---|
| Fiskeridirektoratets akvakultur-, landings-/sluttseddel- og fartøykilder | Kandidatsignal for et 270-raders sjømatutvalg | Delvis brukt; felles entity resolution og villfiskkobling mangler; MTB ≠ faktisk biomasse | Tilgang må verifiseres per uttrekk |
| Skatteetatens aksjonærregister | Eier-/founderlag under konserntrærne | Innsyn, arbeidskrevende | Gratis/tid |
| Proff/Forvalt-abonnement | Roller, engasjementer, regnskap i dybden | Ikke anskaffet | Lav |
| Mattilsynets tilsynsdata | Aktivitets-/kvalitetssignal foredling & HORECA | Delvis åpen | Gratis |
| Landbruksdirektoratets PT-mikrodata | Produsentaktivitet, arealbruk | Søknadsbasert | Tid |
| DFØ/KS innkjøpsdata | Offentlig mat-innkjøpsvolum | Spredt, innsynsrunde | Tid |
| Matvett/bransjeavtalens 2025-rapport | Matsvinn-baseline | Publiseres løpende | Gratis |
| Bolagsverket / Virk / PRH og landspesifikke alternativer | Nordisk aktør- og styredybde | Source/access-gated; manuell, credential-, interaktiv eller betalt rute avhengig av land | Uavklart per kilde/lisens |
| Handelsdata (Nielsen/GfK-klasse) | Kanalfordeling, markedsandeler | Kommersiell | **Høy — kun ved finansiering** |
| NIBIO JordVAAK/NSCM | SOC-baseline når den kommer | Overvåk halvårlig | Gratis |

---

## 8. Hjernens organer — modenhet mot masterplanens målbilde

Skjønnsmessig skala 0–100 mot MASTERPLANens eget målbilde (ikke mot «perfekt»):

| Organ | Modenhet | Belegg |
|---|---:|---|
| **Hukommelse** | 85 | 48 Prisma-modeller, 1 555 kilder, 51 flater, 318 scripts, MCP-server, Obsidian-vault. Trekk: katalog/disk/DB i utakt (én-kilde-til-sannhet-prinsippet, §10). |
| **Samvittighet** | 92 | Claim-lock, PCQ, fail-closed, universe-estimat, mottakslogg — håndhevet av kode. Strict gate PASS og 0 eksterne blocking issues, men 217 `blocked_unsourced` forblir korrekt blokkert. Trekk: appraisal-laget tomt; fagråd ikke formalisert. |
| **Sanser** | 8 | 0 selvoppdagede endringer/mnd. Brreg-endringsagenten er spesifisert (design-notat = masterplanens handling 7), bygges etter 31.07. URL-helse kjøres manuelt. |
| **Tidssans** | 5 | ~0 % temporale kanter; kunnskapen er fryst i importøyeblikket. Vedtaket «alle nye kanter bitemporale» er tatt, ikke implementert. |
| **Forestillingsevne** | 22 | Frøene finnes (emergence-simulation.ts, bootstrap-material-flows, 25 løkker, N/P/K-skjema, HHI-serier) — ingen kvantifisert strømmodell eller scenariomotor ennå. |
| **Stemme** | 30 | 51 interne flater, hvitbok-flate med proveniens, hybrid-søk, MCP — men 1–2 brukere, ingen offentlig flate, ingen API-forbrukere. Blokkert av personvernpolicy (beslutningslogg §6.2). |

Dette bekrefter masterplanens diagnose empirisk: hukommelse og samvittighet er bygget; sanser, tidssans, forestillingsevne og stemme er de neste organene — i den rekkefølgen kontrakten og finansieringen tillater.

---

## 9. Kontraktsklokken — Horisont 0 (10 dager igjen)

Kontrakt P25013 løper ut **31. juli 2026**. Whitepaper-syntesen v2 er *complete på internt syntesenivå* (alle P0-delta i completion-registeret), og det som gjenstår er nesten utelukkende **menneskegatet**:

| Gate | Finnes | Gjenstår | Status |
|---|---|---|---|
| M16 roadmap-utkast | Roadmap v0.2-draft | Formell eiergodkjenning | delvis |
| **M17 publisering + offentlig event (planuke 20.–26. juli)** | Hvitbok-flate + v2 komplett internt | Event-go, dato, format, talere, publiseringsvedtak | **kritisk** |
| M18 videreføringsplan | Continuation-plan-draft | Organisatorisk hjem, budsjett, finansiering vedtas | delvis |
| Mission 1 intervjuer | Guider + målgrupper | Gjennomføring + samtykke + sitatgodkjenning | åpen |
| Mission 2 nordisk validering | Valideringstabell fra DB | Respons fra Michel/Betina | åpen |
| **Personvern-/publiseringspolicy** | Risiko identifisert, publication_tier foreslått | Eierbeslutning + juridisk lesning | **kritisk — blokkerer all offentlig flate** |
| NordForsk-søknad (frist 02.12.2026) | Infrastruktur-argumentet formulert | Skisse startes nå | åpen |

Stopplinjene fra gap-listen gjelder: pilotbrief ≠ pilot, intern sammenligning ≠ partnergodkjent konklusjon, planlagt event ≠ levert event.

---

## 10. Avvik og observasjoner fra selve gjennomgangen

Funn om *systemet* (ikke om matsystemet) som dukket opp under analysen — små, men verdt å rydde fordi «skill lager fra syn / én kilde til sannhet» er masterplanens eget prinsipp (§3.7):

1. **Dekningsfilene spriker i vintage.** `public/data/coverage/domene-profiles.json` og `domene-dekningsbok.csv` (26.–29.06) viser run-floor-tall (f.eks. REKO 20/140), mens `domene-dekning-hull-2026-07-02.md` viser reelle kartlagte (REKO 139/140, sum 1 634/1 651). Alle tall i denne rapporten følger hull-rapporten. Anbefaling: la dekningsboka regenereres fra samme kilde som hull-rapporten, eller merk den som historisk.
2. **Katalog vs. disk:** PDF-KATALOG (436) mot 120 PDF-er på disk — arkivflytt/tekstspeiling er reell, men katalogen bør re-genereres slik at «hva har vi» har ett svar.
3. **Små talldrifter mellom kontrolldokumenter:** subsidier 179 311 (profil 03.07) vs 179 312 (sluttrapport 27.04); styreverv 1 800 (eksport 03.07) vs 1 696 (27.04); npm-scripts 318 (package.json nå) vs 277 (masterplan 06.07). Normal drift — men det underbygger behovet for et generert, datostemplet statuspanel i stedet for tall i prosa.
4. **Identitetsparitet:** de 17 managed YouTube-kildene og `matsvinnloven-2025` (avvist syntetisk tese → skal peke på LOV-2025-06-20-103) er akkurat det paritet-sjekken flagger. Matsvinnloven-planen er konsistent i dry-run, men apply er deaktivert og ville slette/karantenesette/blokkere rader; den krever eksakte hasher, kontrollert rolle, fersk backup, verifisert restore-kvittering og eksplisitt destruktiv autoritet.
5. **Backlog-status oppdateres ikke:** alle 50 R13-missions står som `planned` i CSV-en (25.06) selv der kontrollnotater viser utført arbeid. Statusreglene må avstemmes mot kontrollnotatene før en deterministisk dry-run-diff og eventuell CSV-synk; mottaksstatus må ikke overskrive menneske- eller kildeporter.
6. **Review-kø og tekstreparasjon var blandet sammen.** De 89 `review_required`-radene består av 24 mekaniske URL-kandidater, 57 sammendragskureringer og 8 manuelle kildeoppslag. Dry-run av reparasjonsløpene foreslår 17 URL-oppdateringer; lokal- og PDF-løpet foreslår 0. Dette er ikke en 89-raders batch.

---

## 11. Fra statusbilde til levende masterhjerne — anbefalt neste byggetrinn

Dette dokumentet og dashboardet er i dag et *øyeblikksbilde*. For at «masterhjernen ser alt og forstår alt» skal bli en løpende egenskap, ikke en leveranse:

1. **Gjør statusen generert.** Ett script (`compute-masterhjerne-status`) som leser nøyaktig de samme kildene som denne rapporten (ledger, audit-JSON, hull-rapport, KI-PRIORITY, URL-HEALTH, vault-manifest, profiles) og skriver ett datostemplet JSON + én HTML-flate. Kjøres etter hver import og hver mandag. (All logikk finnes allerede spredt i `_status/` — dette er aggregering, ikke nybygg.)
2. **Legg den inn som app-flate** (`/masterhjerne` eller under `/ai-kunnskap`) med de samme seksjonene som dashboardet her — da er statusen der arbeidet skjer, med lenker rett inn i bibliotek/kilder/casestatus.
3. **Appraisal-gate før sprint:** fullfør navngitt menneskereview av pilotens tre fulltekstkilder, lukk produksjonsworkflow/gate, og prioriter deretter topp-50. Dette er nødvendig arbeid mot akademisk readiness, men gir ikke READY alene.
4. **Arkivering-ved-sitering:** bruk den fail-closed arkivauditen som kontrollflate. Dedupliser og prioriter de 1 855 eksternt klare/med-note-radene som mangler varig kopi før Wayback-/snapshot-dry-run; ikke behandle de 2 376 radene som en blind batch.
5. **Etter 31.07:** Brreg-endringsagenten (hendelser → triage-kø, aldri direkte skriving) og bitemporale felt på nye kanter — nøyaktig som masterplanens Horisont 1 alt har vedtatt.

Slik henger det sammen: **MASTERPLAN** sier hvor hjernen skal; **DATAGAP** sier hva den ikke vet; **denne statusen** måler hvor den faktisk står — og når punkt 1–2 over er gjort, måler den det selv, hver uke.

---

## Vedlegg A — kildefiler for hvert talldomene

| Domene | Fil | Dato |
|---|---|---|
| Akademisk kvalitet / metadata / appraisal | `research/_status/academic-source-quality-status.{md,json}` | 2026-07-20 |
| Kildebibliotekets status | `research/_status/library-analysis-ledger.jsonl` + `library-analysis-summary.md` | 2026-07-20 |
| Siterbarhet / gates / HHI-lås | `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` | 2026-06-10, oppdatert 2026-07-15 |
| Verdikjededekning | `research/_status/domene-dekning-hull-2026-07-02.md` (radsum verifisert: 1 634/1 651) | 2026-07-02 |
| KI-prioritert korpus | `research/KI-PRIORITY.csv` (208 rader) | 2026-07-04 |
| URL-helse | `research/URL-HEALTH.csv` (600 rader) | 2026-05 |
| PDF-katalog | `research/pdf-katalog.json` (436) | 2026-07-04 |
| DB-eksport (graf) | `data/vault-export/manifest.json` + *.json | 2026-07-03 |
| Verifiseringsprofiler | `public/data/coverage/profiles.json` | 2026-07-03 |
| Gap-typologi og agenda | `DATAGAP-ANALYSE-2026-07-06.md` | 2026-07-06 |
| Visjon/målbilde/organer | `MASTERPLAN-2026-07-06.md` | 2026-07-06 |
| Whitepaper-delta og stopplinjer | `research/whitepaper/gap-list.md` | 2026-07-15 |
| Mission-backlog | `research/_status/food-tg-research-backlog-2026-06-25.csv` (50) | 2026-06-25 |
| Sirkularitet/materialstrøm/N-P-K/R9 | `public/data/food-systems/{circularity-loops,material-flows,nutrient-flows,r9-matrix}.json` | 2026-06/07 |
| Historisk KI-klargjøring | `research/DATA-READINESS-SLUTTRAPPORT.md` | 2026-04-27 |
| Akademisk påfyll-backlog | `research/bibliotek/MASTER-PHD-BACKLOG-2026.md` | 2026-07-20 |

*Alt over er internt arbeidsmateriale. Før noen formulering herfra brukes eksternt: kjør den gjennom claim-lock/`gate:overclaim`-løypa som vanlig.*
