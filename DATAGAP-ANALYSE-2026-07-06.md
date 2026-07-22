# Datagap-analyse: Hva vi har dårlig data på, og hva vi bør researche

**Dato:** 2026-07-06
**Status:** Intern faglig analyse — ikke claim-locket, ikke eksternt siterbar
**Grunnlag:** `research/_status/domene-dekning-hull-2026-07-02.md`, `research/_status/food-tg-research-backlog-2026-06-25.csv` (50 R13-missions), WS1–WS5-kontrollnotater i `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md`, VK4-gap-nodene i Obsidian, acceptance-pack (11/16 cite-ready), `research/REMEDIATION-BACKLOG.md`
**Forhold til R13-LAND-004:** Denne analysen er i praksis en utført versjon av mission R13-LAND-004 ("datagap-atlas: samle alle type-C-hull til ett kart over hva som ikke måles og av hvem") på syntese-nivå. Den erstatter ikke mission-artefakten, men kan brukes som dens utgangspunkt.

> **Leseregel 2026-07-21:** Dette er et datert hullinventar, ikke gjeldende
> completion-status. Senere kildekandidater, måleprogrammer og disposisjoner
> lukker ikke automatisk radene. Bruk
> `research/_plans/gap-program-2026-07-21/GAP-LUKKINGSPROGRAM-2026-07-21.md`
> og det kanoniske completion-registeret for siste status og bruksgrenser.

---

## 1. Formål og metode

Rapporten svarer på to spørsmål: (1) *Hvor er datakvaliteten faktisk dårlig i kunnskapsbasen?* og (2) *Hva bør vi researche, i hvilken rekkefølge, med hvilken metode?*

Metoden er intern revisjon, ikke ny datainnsamling: alle hull er hentet fra prosjektets egne kontrolldokumenter, dekningsdashboard, claim-grenser ("Actor-gate only: no ... claim is locked") og fail-closed-blokkeringene. Det betyr at hullene under er *dokumenterte* hull — systemets styrke er nettopp at det vet hva det ikke vet.

### 1.1 Klassifikasjon

Prosjektets etablerte typologi brukes gjennomgående:

- **Type A** — hullet kan lukkes med desk research mot eksisterende primærkilder.
- **Type B** — hullet krever aktørkontakt/human verifisering (actor-gate) eller betalt/lukket kilde.
- **Type C** — ingen kjent kilde måler dette. Hullet er et *funn* i seg selv (og ofte et policy-argument).

I tillegg skiller analysen mellom fire kvalitetsdimensjoner, fordi "dårlig data" betyr fire ulike ting hos oss:

1. **Bredde** — mangler vi aktører/enheter? (I hovedsak løst: 1 634/1 651.)
2. **Dybde** — vet vi hva enhetene faktisk gjør, i volum og verdi? (Hovedproblemet.)
3. **Ferskhet** — er tallet fra riktig år? (Utbredt problem: REKO-tall fra 2022, PT-data etterslep.)
4. **Kausalitet/metode** — kan vi si *hvorfor*, eller bare *at*? (Systematisk svakt: biodiversitet, konkurser, virkemiddeleffekt.)

---

## 2. Hovedbildet i én tabell

| Lag i kunnskapsbasen | Bredde | Dybde | Ferskhet | Kausalitet | Dom |
|---|---|---|---|---|---|
| Konserntrær / norske majors | god | god | god (5-års finanser) | middels | **Sterkest lag** |
| Domeneaktører (1 634, 17 steg) | god (run-floor) | **svak** (actor-gate) | svak | — | **Bredde uten dybde** |
| Materialstrømmer / N-P-K | — | **mangler** | — | — | **Største substanshull** |
| Nordisk (SE/DK/FI/IS) | svak | svak (1–2 års finanser, unntak backfill) | delvis | svak | **Asymmetrisk mot NO** |
| Lokale verdikjeder (REKO/CSA/marked) | god | svak | **svak (2022-tall)** | svak | Eksistens ≠ aktivitet |
| Økologi/jordhelse/biodiversitet | middels | svak | middels | **svak** | Ekte type C-tyngdepunkt |
| Makt/eierskap utover majors | middels | svak (founder/aksjonær bak betalingsmur) | middels | middels | Type B-tyngdepunkt |
| Kvalitativt/menneskelig | **null** | null | null | null | 0 intervjuer gjennomført |

Dekningsdashboardets egen konfidenskolonne bekrefter dette: av 73 celler er kun 2 merket «høy» konfidens (paraply-nettverk, dagligvarekjede-universet), ~10 «middels», resten **«lav»** — selv der hullet er 0. Lav konfidens med fullt gulv betyr: *vi har navnene, ikke virkeligheten.*

---

## 3. Detaljert gjennomgang: de elleve svake feltene

### 3.1 Aktørdybde — 1 634 registrerte, nesten ingen verifisert aktive (Type B)

Alle deepening-passene bærer samme claim-grense: ingen fartøy-, kvote-, biomasse-, volum-, omsetnings-, medlems- eller «aktiv i 2026»-påstand er låst. Konkret:

- **Havbruk (120 aktører):** ingen biomasse, produksjonsvolum, miljøstatus eller konsesjonskompletthet. Fiskeridirektoratets pub-aqua-signal finnes i notater for ~85 %, men er ikke systematisk koblet.
- **Villfisk (150):** ingen fartøy-, kvote- eller landingsdata — Fiskeridirektoratets landings- og kvoteregistre er *ubrukte, åpne* kilder her (Type A!).
- **Grossister (80):** ingen distribusjonsvolum, lagerkapasitet, markedsandel eller regional dekning; konkurransesensitivt (Type B/C).
- **REKO (139 ringer):** lokator bekrefter Facebook-side, ikke drift, leveringsfrekvens eller omsetning i 2026.
- **Andelslandbruk (83):** ingen aktiv-sesong-, andels- eller medlemsdata; nasjonal aktiv-liste finnes ikke oppdatert (universet selv er usikkert: revidert 93→90).

**Research-anbefaling:** en systematisk «aktivitets-oppgraderingspipeline» per celle: (1) koble åpne registre med aktivitetssignal (Fiskeridir. landinger/lokalitetsbiomasse, Debio-status, Mattilsynets tilsynsregister, regnskapstall fra Brreg årsregnskap som proxy for drift), (2) definer «aktiv 2026» operasjonelt per domene, (3) først deretter aktørkontakt for residualen. Målet er å løfte konfidens fra «lav» til «middels» for de 5–6 viktigste cellene, ikke alle 73.

### 3.2 Materialstrømmer og næringsstoffregnskap — det største substanshullet (Type A/C-blanding)

Vi har aktørgrafen, men ikke tonnene. De 12 VK4-gap-nodene er fortsatt åpne som kvantifiserte strømmer:

| Gap | Type | Kommentar |
|---|---|---|
| Samlet norsk N/P/K-resirkuleringsgap (VK4-GAP-007) | A/C-mix | Flaggskipsanalysen; krever strøm-for-strøm-tabell med tomme celler |
| Oppdrettsslam: modellert vs innsamlet vs behandlet (WASTE-002) | **ekte C** | Parked-controlled: ingen åpen kilde kobler dette per anlegg/region/år — dette er et policy-funn |
| N/P/K fra oppdrett til fjord (~70 % tapt) | A (metode) | Utslippsbaseline finnes modellert; fangst-/gjenvinningsteknologi må statusettes |
| Svartvann-fosfor (20–23 %?) og -nitrogen | A | Baseline-serie må verifiseres; tallene er i dag ulåste |
| Husdyrgjødsel-N-tap til luft/vann | A | NIBIO/SSB-kilder finnes, ikke hentet |
| Matsvinn-N/P/K til forbrenning | A | Volum + systemgrense; nordisk sammenligning mulig |
| Biogass kapasitetsgap NO vs DK | A | Primærkildebasert sammenligning mangler |
| Fiskeavfall/marint restråstoff tapt | A (delvis lukket) | R13-WASTE-001 kontrollert; eksportvolum-celler står tomme |
| Digestat/biorest NPK-retur | C i Norge | «Faktisk målt eller ikke målt» — SE SPCR 120 finnes, norsk ekvivalent gjør ikke |
| Mikroplast i biorest («grønn pose»-problemet) | A | Regelverk + kvalitetskrav dokumenterbart |
| Matsentralen kapasitetsgap | B | Krever aktørkontakt |
| AX Foundation-ekvivalent for fôrinnovasjon | B | Institusjonskartlegging |

**Research-anbefaling:** dette er Horisont 2-flaggskipet (jf. MASTERPLAN §2.3), men *forarbeidet er desk-research nå*: bygg N/P/K-tabellskjelettet med metodeetiketter (realisert/modellert/potensial/plan) og fyll Type A-cellene først. De ekte C-cellene publiseres som funn: «dette måler ingen i Norge».

### 3.3 Alternativt protein — kapasitet forveksles med virkelighet (Type A/B)

Hele feltet lider av samme skjevhet: presseoppslag rapporterer *kapasitet og ambisjon*, ingen rapporterer *realisert volum*. Våre kontrollnotater holder skillet, men cellene for realisert volum står tomme for insekt (7/20 aktører, source-limited), single-cell/fermentering, tang/tare/musling og plantebasert humanprotein. Proteinselvforsyning (R13-PROT-007) er kontrollert på aggregat, men fôrprotein-total, SPC-andel og reell fosfor-total er metodeluker.

**Research-anbefaling:** årsregnskaps-triangulering (omsetning + varelager som volum-proxy), Mattilsynet-/EFSA-godkjenningsstatus som modenhetsakse, og direkte aktørforespørsel til de ~10 største (Type B). Aksepter at realisert volum for flere aktører er forretningshemmelighet → dokumenter det som C.

### 3.4 Importavhengighet og beredskap — noder uten kapasitetstall (Type A/C)

R13-GAP-001 (fosfat, fôrprotein, fiskeolje, soya, kaffe, kakao) er PCQ-kontrollert på hovedserier, men: fôrprotein-total og reell fosfor-total er metodeluker, og **per-node kapasitet for havn/kaldkjede/sentrallager er C-celler** (R13-GAP-003 stoppet på source-shortlist: DSB/FFI/Meld. St. 9 beskriver *mekanismer*, ikke kapasiteter). ASKO-Vestby-avhengigheten er pilotbrief, ikke kvantifisert sårbarhet.

**Research-anbefaling:** (1) SSB 08801-tidsserier ferdigstilles per node (Type A), (2) formell henvendelse til DSB/NVE/Landbruksdirektoratet om lagerkapasitetsdata — sannsynligvis gradert/unntatt offentlighet → i så fall dokumentert C med forvaltningsreferanse (sterkt whitepaper-poeng), (3) nettverksanalyse på eksisterende graf (sentralitet) som *modellert* sårbarhetsindikator med tydelig metodeetikett.

### 3.5 Lokale verdikjeder — eksistens uten aktivitet, og ingen markedsandeler (Type A/B)

- REKO: nyeste verifiserbare tall er **2022** (130+ ringer); ingen 2026-produsent-/kunde-/omsetningstall (R13-AKTOR-003).
- CSA: ingen aktiv-telling; Økoguiden bekrefter kategori, ikke sesong.
- **Ingen kanalfordeling:** Lokalmatrapport 2025 gir aggregat, men markedsandel per kanal (Bondens marked / REKO / gårdsutsalg / digitale plattformer) finnes ikke (R13-AKTOR-008) — dette blokkerer ethvert utsagn om at lokale kjeder «vokser» eller «tar andeler».
- Resiliens-mekanismen (R13-GAP-002): *hvilke* korte kjeder øker forsyningssikkerhet, via mekanisme — kontrollert som forståelse, ikke som empiri.

**Research-anbefaling:** årsmeldinger fra REKO Norge/Bondens marked/Økologisk Norge (Type A, lav kostnad), deretter en liten primærundersøkelse (survey til ringadministratorer — Type B, allerede skissert i Mission-format). Kanalfordeling krever trolig kjøpt handelsdata eller samarbeid med Landbruksdirektoratet/NIBIO.

### 3.6 Økologi, jordhelse og biodiversitet — der de ekte C-hullene bor

Kontrollnotatene for R13-OKO-serien er ryddige, og de avdekker at flere nasjonale grunnlagsdata *ikke finnes*:

- **Nasjonal målt SOC-baseline (karbon i jord): C-hull.** JordVAAK/NSCM er i gang, men baseline finnes ikke ennå.
- **Pollinatortrend og insektbiomasse: C-/metodehull.** Rødlister finnes; trenddata gjør ikke.
- **Utmarksbeite og SOC: metodehull.**
- **Biodiversitets-kausalitet** (driver → effekt i norsk kontekst): svak.
- Spesialitet-/BOB-volum og sentralisert villedningssaksliste: B/C-celler.
- EOV/HM-adopsjon og aktiv regenerativ produsentliste: ikke låst (89 aktører registrert, felt-status uverifisert).

**Research-anbefaling:** ikke forsøk å lukke C-hullene selv — *dokumenter og dater dem* (måleprogram, forventet leveranse, ansvarlig institusjon) og bruk dem aktivt i whitepaper/roadmap som infrastrukturkrav. Følg NIBIO JordVAAK-publiseringer halvårlig. Dette er billig research med høy policy-verdi.

### 3.7 Makt, eierskap og founder-nettverk utenfor konserntrærne (Type B-tyngdepunkt)

- Konserntrærne er sterke, men **subsektor-konsentrasjon** (fôr, emballasje, kjøtt-foredling per segment) har C-celler (R13-LAND-001), og **REMA Distribusjon**-strukturen står uavklart.
- **Founder-/aksjonærdata bak betalingsmur:** R13-AKTOR-006 er eksplisitt kontrollert som rolle-ledger med paid-register-C-celler — Proff/Infotorg, Skatteetatens aksjonærregister og årsrapportnoter er ikke hentet.
- **Private kontrollvilkår** (franchise-, leverandør- og distribusjonsavtaler): strukturelt utilgjengelige → C, men Dagligvaretilsynets rapporter gir indirekte evidens.
- **Nordisk styre-interlock:** revisjonen fant 0 interlocks — men med 118 seter dekket i 14 av 61 selskaper er det et *dekningskontrollert negativt funn*, ikke et funn om virkeligheten.

**Research-anbefaling:** dette er feltet der en **liten datainnkjøpsbudsjett gir størst avkastning**: aksjonærregisteret (gratis via Skatteetaten/innsyn, men arbeidskrevende), ett Proff/Forvalt-abonnement, og systematisk høsting av årsrapportnoter for nærstående transaksjoner. Nordisk styredata: Bolagsverket/Virk/PRH-registre er åpne — dekningen kan dobles med ren desk research.

### 3.8 Nordisk dybde — asymmetrien mot Norge (Type A)

Norge: 5-års finanser, 120+150 aktører i primærproduksjon, 17 kartlagte verdikjedesteg. Norden: 1–2 års finanser (2025-backfill kun SE/DK-majors; **FI/IS 2025 mangler**), i praksis **null domeneaktør-kartlegging** (alle 73 celler er geo=NO), og håndhevingsevidens der Danmark kun har fusjonskontroll og Island kun monitorering. Whitepaperets nordiske sammenligning (§4) hviler dermed på et tynnere lag enn den norske analysen — og på Mission 2-validering som ikke er gjennomført.

**Research-anbefaling:** (1) FI/IS 2025-finanser (ren Type A, én sesjon), (2) velg 3 verdikjedesteg (grossist, foredling-majors, matsvinn-sirkulær) og repliker MVK-pipelinen for SE/DK med Bolagsverket/Virk — metoden er ferdig, bare konfigurasjonen er ny, (3) Mission 2 partnervalidering er fortsatt den viktigste enkelthandlingen.

### 3.9 Kvalitativt og menneskelig lag — null primærdata (Type B, human-gated)

Basen har 244 517 feltsiteringer og **null intervjusitater**. Fryktkultur-analysen (89–95 % kjenner Lov om god handelsskikk, nesten ingen bruker den) er sekundærkildebasert; leverandør-, bonde- og gründerperspektivet finnes ikke i egne data. Mission 1 (4–5 intervjuer), Mission 3/6 (workshops) er planlagt, ikke gjennomført. Dette er samtidig den eneste hullkategorien med hard *kontraktskobling*: whitepaper §3/§5/§6 er svakere uten.

**Research-anbefaling:** ingen ny analyse trengs — intervjuguidene finnes. Dette er ren gjennomføring, og ledetiden gjør det til uke 28-prioritet nr. 1.

### 3.10 Offentlig innkjøp og forbruksleddet (Type A/B)

- Offentlig matinnkjøp: policy- og pilotevidens finnes, men **ingen verifisert innkjøpsvolum-/andelsstatistikk** (R13-INNO-007); kommunal innkjøpsstandard-piloten mangler baseline.
- Husholdnings-/detaljmatsvinn: bransjeavtale-baseline kontrollert, men ingen 2025-volumpåstand låst.
- Marginer: Samkaup (IS) mangler brukbart driftsresultatfelt; municipal HHI er proxy-basert.

**Research-anbefaling:** DFØ/KS og kommunale innkjøpsdata (offentlige, men spredt — god kandidat for en målrettet innsynsrunde), Matvett/bransjeavtalens 2025-rapportering når den kommer, og en eksplisitt metodenote på municipal-HHI-proxyen før den brukes eksternt.

### 3.11 Kausalitet og effekt — den stille svakheten på tvers

Gjennomgående kontrollert bort, aldri inn: *hvorfor* gikk Rest/Enorm/Mycorena konkurs (failure-ledger har datoer, ikke årsaker), *hvilken effekt* har enkelttiltak mot matsvinn (ingen isolert effektpåstand låst), *hva* konverterer produsenter til regenerativ praksis (barrierer kartlagt som kilder, effektstørrelser er C). Dette er riktig fail-closed-praksis — men det betyr at basen i dag er sterk på *struktur* og svak på *dynamikk*.

**Research-anbefaling:** aksepter at kausalitet sjelden kan claim-lockes fra desk research. Bygg i stedet en egen artefaktklasse: **case-studier med eksplisitt evidensgradering** (à la konkurs-casene), der mekanisme-hypoteser er merket som hypoteser. Intervjuene (3.9) er hovedkilden til dynamikk.

---

## 4. Tverrgående mønstre — hvorfor hullene ser slik ut

1. **Registre bekrefter eksistens, ikke aktivitet.** Brreg-first-strategien ga oss bredden billig, men alt register-basert stopper ved «juridisk enhet finnes». Neste konfidensnivå krever aktivitetssignal-kilder (landinger, tilsyn, regnskap, sertifisering).
2. **De kommersielt interessante tallene er innelåst.** Volum, markedsandeler, avtalevilkår = konkurransesensitivt (grossist, fôr, alt-protein). Delvis løsbart med regnskaps-proxy og betalte registre; delvis ekte C.
3. **Flere nasjonale måleprogrammer finnes ikke.** SOC-baseline, digestat-NPK, slam-massebalanse, pollinatortrend. Dette er ikke våre hull — det er Norges. Bruk dem som funn.
4. **Ferskhet dør uten overvåkning.** REKO-2022-problemet gjentar seg overalt: uten sanse-agentene fra MASTERPLAN §2.1 forvitrer alt vi nå kartlegger.
5. **Norden er metode-klar, men ikke utført.** Ingen metodiske hindre — bare kapasitet.

---

## 5. Prioritert research-agenda

Prioritering: (verdi for whitepaper/roadmap) × (lukkbarhet) ÷ (kostnad). Gate-etiketter følger prosjektstandarden.

### Tier 1 — Før 31. juli (whitepaper-kritisk)

| # | Oppgave | Type | Gate | Innsats |
|---|---|---|---|---|
| 1 | **Mission 1-intervjuer** (leverandør, produsent, grossist-uavhengig, kommune, gründer) | B | human | 2–3 uker ledetid — book nå |
| 2 | **Mission 2 nordisk partnervalidering** (valideringstabell til Michel/Betina) | B | human | 1 uke |
| 3 | FI/IS 2025-finanser + metodenote municipal-HHI | A | PCQ | 1 sesjon |
| 4 | «Det Norge ikke måler»-boks til whitepaper: dater C-hullene (SOC, slam, digestat, pollinator, lagerkapasitet) med ansvarlig institusjon | A | forstaelse | 1 sesjon — høy retorisk verdi |

### Tier 2 — Horisont 1 (aug–des 2026): konfidens-oppgradering

| # | Oppgave | Type | Metode |
|---|---|---|---|
| 5 | Aktivitetssignal-kobling for havbruk + villfisk (Fiskeridir. landinger, biomasse, lokalitetsstatus) | A | åpne API-er; løfter 270 aktører fra lav → middels konfidens |
| 6 | Aksjonær-/founder-lag: Skatteetatens aksjonærregister + årsrapportnoter for topp 50 aktører i alt-protein/CEA/sirkulær | A/B | innsyn + ett Proff-abonnement |
| 7 | REKO/CSA 2026-aktivitetsstatus: årsmeldinger + admin-survey | A→B | den skisserte survey-missionen |
| 8 | N/P/K-tabellskjelett (VK4-GAP-007) med Type A-celler fylt (husdyrgjødsel-N, svartvann-serier, matsvinn-NPK, biogass NO/DK) | A | PCQ per celle |
| 9 | Alt-protein realisert-volum-triangulering (regnskap + godkjenningsstatus) topp 15 aktører | A/B | PCQ; tomme celler dokumenteres |
| 10 | Innsynsrunde: DSB/Landbruksdir. lagerkapasitet + DFØ/KS innkjøpsdata | A/C | forvaltningshenvendelse; avslag dokumenteres som C-funn |

### Tier 3 — Horisont 2 (2027): nye lag

| # | Oppgave | Type |
|---|---|---|
| 11 | Nordisk MVK-replikering: 3 verdikjedesteg × SE/DK (Bolagsverket/Virk) | A |
| 12 | Nordisk styre-/eierskapsdekning 14 → 61 selskaper (åpne registre) | A |
| 13 | Subsektor-HHI som tidsserie (fôr, kjøttforedling, emballasje, grossist) | A/B |
| 14 | Full N/P/K-balanse + sårbarhetsindeks (modellert, metodeetikett) | A + modell |
| 15 | Case-studieklasse for kausalitet (konkurser, konvertering, virkemiddeleffekt) med evidensgradering | B/hypotese |
| 16 | Kanalfordeling lokalmat (kjøpt handelsdata eller NIBIO-samarbeid) | B |

### Bevisst nedprioritert

- Ytterligere bredde-deepening i domeneceller som alt er på run-floor (marginal verdi; unntak: insekt-alternativ-protein 7/20 og matredistribusjon 15/20 tas hvis nye kilder dukker opp — begge er i dag source-limited).
- URL-helse-restene (74 LOW) — vedlikehold, ikke research.
- Forsøk på å desk-lukke ekte C-hull — de skal dokumenteres og brukes, ikke jaktes.

---

## 6. Datakilder å skaffe, forhandle eller overvåke

| Kilde | Gir | Status | Kostnad |
|---|---|---|---|
| Fiskeridirektoratet landings-/kvoteregister + biomasse | Aktivitet for 270 sjømataktører | Åpen, ubrukt | Gratis |
| Skatteetatens aksjonærregister | Eier-/founder-lag under konserntrærne | Åpen via innsyn, arbeidskrevende | Gratis/tid |
| Proff/Forvalt-abonnement | Roller, engasjementer, regnskap i dybden | Ikke anskaffet | Lav |
| Mattilsynets tilsynsdata | Aktivitets- og kvalitetssignal foredling/HORECA | Delvis åpen | Gratis |
| Landbruksdirektoratet PT-mikrodata | Produsentaktivitet, arealbruk | Søknadsbasert | Tid |
| DFØ/KS innkjøpsdata | Offentlig mat-innkjøpsvolum | Spredt, innsynsrunde | Tid |
| Matvett/bransjeavtale 2025-rapport | Matsvinn-baseline | Publiseres løpende | Gratis |
| Bolagsverket/Virk/PRH (SE/DK/FI) | Nordisk aktør- og styredybde | Åpen, ubrukt | Gratis |
| Handelsdata (Nielsen/GfK-klasse) | Kanalfordeling, markedsandeler | Kommersiell | **Høy — kun ved finansiering** |
| NIBIO JordVAAK/NSCM-publisering | SOC-baseline når den kommer | Overvåk | Gratis |

---

## 7. Konklusjon

Kunnskapsbasens profil er nå: **komplett bredde, håndhevet ærlighet, tynn dybde, ingen tid, ingen stemmer.** De tre research-grepene med høyest avkastning er (1) menneskedataene som allerede er planlagt men ikke gjennomført — de blokkerer whitepaper-kvaliteten direkte; (2) aktivitetssignal-kobling fra åpne registre som med lav kostnad løfter hundrevis av aktører fra «finnes» til «driver»; (3) systematisk *utnyttelse* av C-hullene som funn — «dette måler ingen i Norge» er, riktig dokumentert, et av de sterkeste budskapene observatoriet kan levere til policy-miljøet.

Alt over er internt arbeidsmateriale. Før noen formulering herfra brukes eksternt: kjør den gjennom claim-lock/`gate:overclaim`-løypa som vanlig.
