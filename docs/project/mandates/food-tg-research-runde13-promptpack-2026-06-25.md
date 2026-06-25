---
tittel: Food TG — Research Runde 13 promptpack
status: Intern promptpakke — ingen claims åpnes
eier: Gabriel
dato: 2026-06-25
scope: 50 smale prompts for dybdekartlegging av aktører, food waste, proteinalternativer, innovasjon og økologi — pluss lukking av R12-hull og landskapssyntese.
bruksregel: Kjør én prompt om gangen. Lagre output i avtalt `next_artifact`, mottaksfør funnet i R13 intake-indeks, og send bare modne funn videre til source-shortlist/PCQ/claim-lock.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md
  - research/_status/food-tg-research-backlog-2026-06-25.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
---

# Food TG — Research Runde 13 promptpack

## Universal instruks for alle prompts

Du arbeider for Food TG. Du skal hente underlag, ikke skrive whitepaper.

Regler:
1. Primærkilde først. Bruk sekundærkilder bare når primær ikke finnes, og merk dem `B`.
2. Ikke gjett. Tomme celler og dokumenterte fravær er gyldige funn.
3. Skill mellom:
   - `A`: primær/verifisert.
   - `B`: sekundær, aktørrapportert eller avledet estimat.
   - `C`: ikke offentlig tilgjengelig, ikke målt, klassifisert eller epistemisk hull.
4. Skill mellom realisert volum, kapasitet, plan, potensial og hypotese.
5. Lag alltid en `Ikke si`-liste for overclaim-risiko.
6. Avslutt med anbefalt gate: source-shortlist, PCQ, claim-lock, actor-gate, forstaelse, internal eller parkering.

Output-format:

| Felt | Svar |
|---|---|
| Kort dom | 2-4 setninger |
| Sterkeste kilde | navn, år, lokator |
| Svakeste punkt | hva er usikkert |
| Funn-tabell | tabell med kilde/status/caveat |
| Tomme celler | liste |
| Ikke si | liste |
| Anbefalt gate | én eller flere gates |

## Lukke R12-hull

### R13-GAP-001 — Kritiske importnoder (fullfør R12-RES-003)

**Prioritet:** P0
**Tema:** Lukke R12-hull
**Geo:** NO
**Forventet output:** critical import node table with A/B/C per node
**Lagre output:** `research/external/r13/R13-GAP-001-kritiske-importnoder.md`
**Anbefalt gate:** PCQ

**Prompt:**
Fullfør R12-RES-003: kartlegg kritiske importnoder for norsk matsystem — fosfat, fôrprotein, fiskeolje, soya, kaffe og kakao — med primær tidsserie per node. Bruk offisiell handelsstatistikk, start med SSB 08801/PxWeb og Landbruksdirektoratet; Comtrade kun som speil merket `B`. Lag en funn-tabell per node med HS-kode, år, volum og verdi, lokator, kildeklasse A/B/C og caveat. Skill volum og verdi. Registrer tomme celler som egne funn. Overclaim-vakt: speilkilde skal ikke bli primær. Avslutt med `Ikke si`-liste og anbefal PCQ eller parkering per node.

### R13-GAP-002 — Lokale verdikjeder og forsyningssikkerhet (fullfør R12-RES-004)

**Prioritet:** P1
**Tema:** Lukke R12-hull
**Geo:** NO
**Forventet output:** mechanism evidence memo
**Lagre output:** `research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Fullfør R12-RES-004: finn hvilke lokale/korte verdikjeder som faktisk øker forsyningssikkerhet via dokumentert mekanisme, ikke lokal identitet. Bruk forskning og case-evidens, start med NIBIO, Ruralis og Økologisk Norge. For hver case: oppgi mekanisme (lager, redundans, kortere avhengighet), evidens, kilde, år, kildeklasse og caveat. Skill påstått fra dokumentert effekt. Overclaim-vakt: ikke bruk lokal = resilient uten mekanisme. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist eller forstaelse.

### R13-GAP-003 — Transport- og lager-sårbarheter (fullfør R12-RES-005)

**Prioritet:** P2
**Tema:** Lukke R12-hull
**Geo:** Nordic
**Forventet output:** risk inventory
**Lagre output:** `research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Fullfør R12-RES-005: kartlegg transport-, havn-, lager- og kaldkjede-sårbarheter for mat i Norden, men ta kun matrelevante noder. Bruk infrastruktur- og beredskapskilder, start med DSB, NFD og transportmyndigheter. Lag en risikotabell med node, type sårbarhet, kilde, år, kildeklasse og caveat. Overclaim-vakt: kan bli for bred — ta kun matrelevante noder. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-GAP-004 — Alternative nordiske fôrproteiner (fullfør R12-FEED-003)

**Prioritet:** P1
**Tema:** Lukke R12-hull
**Geo:** Nordic
**Forventet output:** actor ledger
**Lagre output:** `research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Fullfør R12-FEED-003: lag aktørledger for alternative nordiske fôrproteiner med realisert volum, kapasitet, plan og tomme celler. Bruk selskaps- og prosjektdokumenter, start med selskapsmeldinger, fundingdatabaser og prosjektsider. For hver aktør: oppgi protein-type, status (realisert/kapasitet/plan/pilot), tall, år, lokator, kildeklasse og caveat. Overclaim-vakt: kapasitet er ikke realisert produksjon. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-GAP-005 — Verifiser de 7 parkerte R12-claimene

**Prioritet:** P0
**Tema:** Lukke R12-hull
**Geo:** NO
**Forventet output:** verification ledger per parked claim
**Lagre output:** `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md`
**Anbefalt gate:** PCQ

**Prompt:**
Verifiser eller nedgrader de parkerte R12-tallclaimene én per rad: ASKO/HORECA 70 %, REKO-tall, andelslandbruk aktiv-telling, SOIL-score, fiskeolje art/sluttbruk og Plantagon/Rest-case. Bruk uavhengige og primære kilder, start med KT, REKO årsmelding, Økologisk Norge, IPBES og primærregistre. For hver claim: oppgi nåværende formulering, sterkeste uavhengige kilde, om den kan løftes/nedgrades/parkeres, kildeklasse og caveat. Overclaim-vakt: ikke løft noe til claim uten uavhengig primærkilde. Avslutt med `Ikke si`-liste og anbefal PCQ, claim-lock eller fortsatt parkering per claim.

### R13-GAP-006 — Type-C-eskalering og actor-gate-kø

**Prioritet:** P1
**Tema:** Lukke R12-hull
**Geo:** NO
**Forventet output:** gap escalation table
**Lagre output:** `research/forstaelse/R13-GAP-006-type-c-eskalering.md`
**Anbefalt gate:** forstaelse

**Prompt:**
Eskaler R12 type-C-hull: gå gjennom hullene i R12 intake-indeks og avgjør per hull om det egentlig er Type A (desk-researchbar), Type B (actor-gate) eller ekte Type C (strukturelt fravær). Bygg en actor-gate-kø for Type B-hull. For hver rad: oppgi hull, opprinnelig type, ny vurdert type, begrunnelse og neste steg. Overclaim-vakt: type C er funn, ikke feil; ikke gjør C til A uten ny locator. Avslutt med `Ikke si`-liste og anbefal forstaelse eller actor-gate.

## Aktørkartlegging

### R13-AKTOR-001 — Markedshager fra kandidat til verifisert

**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** verified actor CSV
**Lagre output:** `research/_status/R13-AKTOR-001-markedshager-verifisert.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Utvid markedshager og små-skala grønt fra kandidat til verifisert med primærlocator per produsent. Bruk registre og organisasjonslister, start med Markedshager Norge, Småskala Grønt Norge og NLR. For hver produsent: oppgi navn, region, locator (nettside/register), status (verifisert/kandidat/stub), kildeklasse og caveat. Overclaim-vakt: stub er default unverified inntil primærlocator finnes. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal actor-gate.

### R13-AKTOR-002 — Andelslandbruk aktiv status per gård

**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** actor status list
**Lagre output:** `research/_status/R13-AKTOR-002-andelslandbruk-aktiv-status.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Kartlegg andelslandbruk (CSA) aktiv status per gård 2025/2026 mot Økoguiden og Økologisk Norge. Bruk CSA-kart og organisasjonssider, start med andelslandbruk.no, Økoguiden API og Økologisk Norge. For hver gård: oppgi navn, region, antatt status (aktiv/usikker/nedlagt), kilde, år, kildeklasse og caveat. Overclaim-vakt: Økoguiden-kartreff er ikke verifisert aktiv status. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal actor-gate.

### R13-AKTOR-003 — REKO-ringer oppdaterte tall

**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** actor/status memo
**Lagre output:** `research/external/r13/R13-AKTOR-003-reko-ringer-tall.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg REKO-ringer Norge 2025/2026 med oppdaterte tall for ringer, produsenter og kunder via primær årsmelding eller ringadministrasjon. Bruk REKO-primærdokumenter, start med REKO Norge årsmelding/årsmøte. Lag tabell med indikator, tall, år, lokator, kildeklasse og caveat. Overclaim-vakt: 2022-tall er siste sikre hvis nyere ikke finnes — merk det da. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-AKTOR-004 — Regenerative og agroøkologiske praktikere

**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** practitioner map
**Lagre output:** `research/_status/R13-AKTOR-004-regenerative-praktikere.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Kartlegg regenerative og agroøkologiske praktikere og gårder i Norge med kilde og status per aktør. Bruk organisasjons- og prosjektsider, start med Regenerativt Norge, NLR-prosjekter og Ruralis. For hver aktør: oppgi navn, praksis, region, locator, kildeklasse og caveat. Overclaim-vakt: bevegelse-selvrapportering merkes `B`; ingen totalpåstand om antall. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal actor-gate.

### R13-AKTOR-005 — Frøbevarings- og genressurs-nettverk

**Prioritet:** P2
**Tema:** Aktørkartlegging
**Geo:** Nordic
**Forventet output:** network map memo
**Lagre output:** `research/external/r13/R13-AKTOR-005-fronettverk-genressurs.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Kartlegg frøbevarings- og genressurs-nettverk videre: KVANN, NordGen, Solhatt og Frøsamlerne, med dedup og primærlocator. Bruk organisasjons- og prosjektsider. For hver node: oppgi navn, rolle, norsk kobling, locator, kildeklasse og caveat. Overclaim-vakt: ikke voks til globalt atlas; krev norsk kobling. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal actor-gate.

### R13-AKTOR-006 — Eierskap og founders i sirkulær/altprotein/CEA

**Prioritet:** P1
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** ownership ledger
**Lagre output:** `research/external/r13/R13-AKTOR-006-eierskap-founders.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg eierskap og founders i sirkulær-, altprotein- og CEA-aktører via Brreg aksjonær- og rolledata. Bruk selskapsregister, start med Brønnøysund aksjonærregister, regnskap og Proff. For hver aktør: oppgi selskap, org.nr, eiere/founders, kapital, registerdato, kildeklasse og caveat. Overclaim-vakt: eierskap er struktur, ikke intensjon; bruk registerdato. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-AKTOR-007 — Skogshage og permakultur-sites

**Prioritet:** P2
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** site inventory
**Lagre output:** `research/_status/R13-AKTOR-007-skogshage-permakultur-sites.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Kartfest skogshage-, flerårige-vekster- og permakultur-sites i Norge med primærkilde per site. Bruk organisasjons- og prosjektsider, start med KVANN, Permakultur Norge og prosjektsider. For hver site: oppgi navn, sted, type, locator, kildeklasse og caveat. Overclaim-vakt: selvrapportert site uten besøk merkes `B`. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal actor-gate.

### R13-AKTOR-008 — Lokalmat-distribusjon og REKO-alternativer

**Prioritet:** P2
**Tema:** Aktørkartlegging
**Geo:** NO
**Forventet output:** distribution actor map
**Lagre output:** `research/external/r13/R13-AKTOR-008-lokalmat-distribusjon.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg lokalmat-distribusjonsaktører og REKO-alternativer: Lokalmat.no, Bondens marked, food hubs og kortreist-plattformer. Bruk aktør- og organisasjonssider, start med Lokalmat.no, Bondens Marked Norge og Matmerk. For hver aktør: oppgi navn, kanaltype, dekning, locator, kildeklasse og caveat. Overclaim-vakt: kanalvolum er ofte `B`/`C`; ikke påstå markedsandel. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

## Food waste

### R13-WASTE-001 — Marint restråstoff R-stige (lukk R12-WASTE-001)

**Prioritet:** P0
**Tema:** Food waste
**Geo:** NO
**Forventet output:** R-ladder table
**Lagre output:** `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md`
**Anbefalt gate:** PCQ

**Prompt:**
Lukk R12-WASTE-001: trekk ut SINTEF/FHF 2024 R-stige-tabeller for marint restråstoff — humant konsum, fôr, energi, eksport og datagap. Bruk SINTEF/FHF som primærkilde. Lag R-stige-tabell med fraksjon, volum, anvendelse, år, lokator, kildeklasse og caveat. Overclaim-vakt: utnyttet er ikke høyverdi; behold tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-WASTE-002 — Oppdrettsslam massebalanse

**Prioritet:** P1
**Tema:** Food waste
**Geo:** NO
**Forventet output:** mass balance memo
**Lagre output:** `research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg oppdrettsslam massebalanse: modellert utslipp vs faktisk innsamlet vs behandlet per anlegg/region. Bruk tillatelser og forskning, start med FHF, statsforvalter-tillatelser og Miljødirektoratet. Lag tabell med region/anlegg, modellert, innsamlet, behandlet, år, kildeklasse og caveat. Overclaim-vakt: modellert utslipp er ikke innsamlet volum. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-WASTE-003 — Matsvinn-redistribusjon

**Prioritet:** P1
**Tema:** Food waste
**Geo:** NO
**Forventet output:** redistribution ledger
**Lagre output:** `research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg matsvinn-redistribusjon i Norge: Matsentralen, Too Good To Go og matsentraler — volum omfordelt og kilde. Bruk aktør- og NGO-rapporter, start med Matsentralen årsrapport, Too Good To Go og Matvett. For hver aktør: oppgi volum, år, lokator, kildeklasse og caveat. Overclaim-vakt: aktørrapportert volum merkes `B`; ingen nasjonal sum uten metode. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-WASTE-004 — Husholdnings- og detaljmatsvinn

**Prioritet:** P1
**Tema:** Food waste
**Geo:** NO
**Forventet output:** waste baseline memo
**Lagre output:** `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg husholdnings- og detaljmatsvinn med baseline, bransjeavtale og målemetode. Bruk avfallsstatistikk, start med Matvett/KuttMatsvinn, bransjeavtalen om matsvinn og SSB. Lag tabell med ledd, mengde, år, metode, lokator, kildeklasse og caveat. Overclaim-vakt: ulike år/metoder gjør tall usammenlignbare — merk metode per rad. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-WASTE-005 — Digestat NPK-retur

**Prioritet:** P1
**Tema:** Food waste
**Geo:** Nordic
**Forventet output:** NPK return matrix
**Lagre output:** `research/external/r13/R13-WASTE-005-digestat-npk-retur.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg digestat/biorest NPK-retur i Norge: faktisk målt eller ikke målt, bygg på SE SPCR 120. Bruk biogass-sertifisering, start med Avfall Sverige SPCR 120, norske biogassaktører og NIBIO. Lag matrise med land, N/P/K-retur, status (målt/ikke målt), år, lokator, kildeklasse og caveat. Overclaim-vakt: kun SE kan være `A`; NO kan være `C`. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-WASTE-006 — Kaffegrut og urbane sidestrømmer (lukk R12-WASTE-004)

**Prioritet:** P2
**Tema:** Food waste
**Geo:** NO
**Forventet output:** waste stream memo
**Lagre output:** `research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lukk R12-WASTE-004: kaffegrut og urbane sidestrømmer — massestrøm, faktisk bruk og realistisk R-nivå. Bruk avfalls- og forbruksstatistikk, start med SSB 08801, kommunale avfallskilder og aktørdokumenter. Lag tabell med strøm, estimert mengde, dagens bruk, R-nivå, kildeklasse og caveat. Overclaim-vakt: avledet estimat må merkes som avledet. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-WASTE-007 — Industrielle næringssidestrømmer

**Prioritet:** P1
**Tema:** Food waste
**Geo:** NO
**Forventet output:** side-stream ledger
**Lagre output:** `research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg industrielle næringssidestrømmer fra bryggeri, meieri og slakteri: volum, dagens bruk og R-stige-nivå. Bruk industri- og forskningskilder, start med Nofima, bransjeaktører og Animalia. For hver fraksjon: oppgi volum, dagens bruk, R-nivå, år, kildeklasse og caveat. Overclaim-vakt: volum per fraksjon er ofte `B`; skill bruk og potensial. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-WASTE-008 — Prevention-tiltak med baseline (lukk R12-WASTE-005)

**Prioritet:** P2
**Tema:** Food waste
**Geo:** Nordic
**Forventet output:** prevention effect catalogue
**Lagre output:** `research/external/r13/R13-WASTE-008-prevention-baseline.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lukk R12-WASTE-005: prevention-tiltak mot matsvinn — krev baseline og målemetode per tiltak før effektpåstand. Bruk policy- og intervensjonsstudier, start med Matvett, EU og Nordic councils. For hvert tiltak: oppgi beskrivelse, påstått effekt, baseline-status, målemetode, kildeklasse og caveat. Overclaim-vakt: prevention-effekt krever målt baseline. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

## Proteinalternativer

### R13-PROT-001 — Insektprotein aktørledger

**Prioritet:** P1
**Tema:** Proteinalternativer
**Geo:** Nordic
**Forventet output:** actor ledger
**Lagre output:** `research/external/r13/R13-PROT-001-insektprotein.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lag aktørledger for insektprotein i Norge/Norden: realisert volum vs kapasitet vs pilot, og godkjenningsstatus. Bruk selskaps- og regulatoriske dokumenter, start med Invertapro, Pure Salmon Kaldnes og Mattilsynet/EFSA. For hver aktør: oppgi art, status, tall, år, godkjenning, kildeklasse og caveat. Overclaim-vakt: kapasitet er ikke realisert; novel-food- og fôr-godkjenning skiller seg. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-PROT-002 — Single-cell og fermenteringsprotein

**Prioritet:** P1
**Tema:** Proteinalternativer
**Geo:** Nordic
**Forventet output:** technology readiness table
**Lagre output:** `research/external/r13/R13-PROT-002-single-cell-fermentering.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg single-cell-, fermenterings- og gjærprotein-aktører i Norden: kapasitet, realisert og regulatorisk status. Bruk selskaps- og prosjektdokumenter, start med selskapsmeldinger, Nofima og fundingdatabaser. For hver aktør: oppgi teknologi, status, tall, år, kildeklasse og caveat. Overclaim-vakt: plan og pilot er ikke realisert produksjon. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-PROT-003 — Musling, tang og tare (lukk R12-FEED-005)

**Prioritet:** P1
**Tema:** Proteinalternativer
**Geo:** Nordic
**Forventet output:** technology readiness table
**Lagre output:** `research/external/r13/R13-PROT-003-musling-tang-tare.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lukk R12-FEED-005: musling, tang og tare som protein/fôr — realisert volum vs FoU vs hypotese. Bruk forsknings- og prosjektdokumenter, start med FHF, Nofima og nordiske prosjektdatabaser. For hver råvare: oppgi status, volum hvis tilgjengelig, år, kildeklasse og caveat. Overclaim-vakt: ikke volumclaim uten primærkilde. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-PROT-004 — Plantebasert humanprotein

**Prioritet:** P1
**Tema:** Proteinalternativer
**Geo:** NO
**Forventet output:** plant protein profile
**Lagre output:** `research/external/r13/R13-PROT-004-plantebasert-humanprotein.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg plantebasert humanprotein i Norge: produsenter, volum, markedsandel og råvareimport. Bruk markeds- og selskapskilder, start med produsentdata, bransjetall og SSB import. For hver indikator: oppgi tall, år, lokator, kildeklasse og caveat. Overclaim-vakt: markedsandel er ofte `B`; råvareimport kan være `C`. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-PROT-005 — Presisjonsfermentering og dyrket kjøtt

**Prioritet:** P2
**Tema:** Proteinalternativer
**Geo:** Nordic
**Forventet output:** status memo
**Lagre output:** `research/forstaelse/R13-PROT-005-presisjonsfermentering-dyrket-kjott.md`
**Anbefalt gate:** forstaelse

**Prompt:**
Kartlegg presisjonsfermentering og dyrket kjøtt i Norden: status, regulatorisk (Novel Food) og realisert = null/pilot. Bruk regulatoriske og selskapsdokumenter, start med EFSA Novel Food, selskapsmeldinger og Nordic Innovation. For hver aktør/teknologi: oppgi status, regulatorisk vei, realisert volum, år, kildeklasse og caveat. Overclaim-vakt: realisert kommersielt volum er trolig null; ikke fremskriv. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal forstaelse.

### R13-PROT-006 — Soya/SPC-erstatning i fôr

**Prioritet:** P1
**Tema:** Proteinalternativer
**Geo:** NO
**Forventet output:** feed protein substitution memo
**Lagre output:** `research/external/r13/R13-PROT-006-soya-erstatning-for.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg hva som faktisk erstatter soya/SPC i norsk fôr, og bærekraftssertifisering av importert protein. Bruk fôrindustri- og handelskilder, start med Felleskjøpet, Denofa, ProTerra/RTRS og Landbruksdirektoratet. Lag tabell med proteinkilde, volum/andel, sertifisering, år, kildeklasse og caveat. Overclaim-vakt: sertifisert er ikke avskoging-fri; skill volum og andel. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-PROT-007 — Proteinselvforsyning Norge

**Prioritet:** P1
**Tema:** Proteinalternativer
**Geo:** NO
**Forventet output:** protein self-sufficiency memo
**Lagre output:** `research/external/r13/R13-PROT-007-proteinselvforsyning.md`
**Anbefalt gate:** PCQ

**Prompt:**
Beregn proteinselvforsyning for Norge: andel fôr- og matprotein innenlands vs import med metodeetikett. Bruk offisiell statistikk, start med NIBIO, Landbruksdirektoratet og SSB. Lag tabell med kategori, innenlands andel, import, metode, år, kildeklasse og caveat. Overclaim-vakt: rå vs fôrkorrigert metode må skilles. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-PROT-008 — Norsk dyrking av bønner og erter

**Prioritet:** P2
**Tema:** Proteinalternativer
**Geo:** NO
**Forventet output:** grain legume profile
**Lagre output:** `research/external/r13/R13-PROT-008-bonner-erter-akerbonne.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg norsk dyrking av bønner, erter og åkerbønne: areal, volum, foredlingskjede og gap. Bruk jordbruksstatistikk, start med SSB, NIBIO og Norsk Landbruksrådgiving. Lag tabell med vekst, areal, volum, foredling, år, kildeklasse og caveat. Overclaim-vakt: areal/volum kan svinge; skill matkorn og fôr. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

## Innovasjon

### R13-INNO-001 — CEA/vertikalt landbruk

**Prioritet:** P1
**Tema:** Innovasjon
**Geo:** NO
**Forventet output:** CEA actor ledger
**Lagre output:** `research/external/r13/R13-INNO-001-cea-vertikalt-landbruk.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg CEA/vertikalt landbruk i Norge: aktører, realisert produksjon vs ambisjon og eierskap. Bruk selskaps- og anskaffelsesdokumenter, start med Avisomo, ONNA, Coop og selskapsregnskap. For hver aktør: oppgi modell, realisert produksjon, ambisjon, eierskap, år, kildeklasse og caveat. Overclaim-vakt: ambisjon er ikke realisert produksjon. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-INNO-002 — Agritech/foodtech-økosystem

**Prioritet:** P1
**Tema:** Innovasjon
**Geo:** NO
**Forventet output:** ecosystem map
**Lagre output:** `research/external/r13/R13-INNO-002-agritech-okosystem.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg agritech/foodtech-økosystem i Norge: startups, klynger og kapital. Bruk klynge- og fundingkilder, start med NCE Heidner Biocluster, Innovasjon Norge og klyngedata. For hver aktør/klynge: oppgi rolle, kapital hvis kjent, år, lokator, kildeklasse og caveat. Overclaim-vakt: kapitaltall kan være `B`; ikke påstå suksess av runde alene. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-INNO-003 — Finansiering og virkemidler

**Prioritet:** P1
**Tema:** Innovasjon
**Geo:** Nordic
**Forventet output:** funding fit matrix
**Lagre output:** `docs/project/mandates/R13-INNO-003-finansiering-virkemidler.md`
**Anbefalt gate:** internal

**Prompt:**
Kartlegg finansiering og virkemidler relevant for matsystem-omstilling uten å endre analyseformålet. Bruk finansieringsprogrammer, start med Innovasjon Norge, Forskningsrådet, EU Horizon og Nordic Innovation. Lag matrise med program, formål, relevans for Food TG, frist, kildeklasse og caveat. Overclaim-vakt: ikke funding for fundingens skyld. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal internal.

### R13-INNO-004 — Failure/survival-ledger

**Prioritet:** P1
**Tema:** Innovasjon
**Geo:** International
**Forventet output:** failure/survival ledger
**Lagre output:** `research/external/r13/R13-INNO-004-failure-survival-ledger.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Bygg failure/survival-ledger for sirkulære/altprotein/CEA-aktører (Plantagon, Infarm, Mycorena, Rest) med primærkilde. Bruk registre og presse, start med konkursregistre, selskapsmeldinger og presse. For hver aktør: oppgi status, hendelse, dato, primærkilde, kildeklasse og caveat. Overclaim-vakt: konkurs er ikke bevis mot teknologi alene. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-INNO-005 — Konverteringsbarrierer

**Prioritet:** P2
**Tema:** Innovasjon
**Geo:** International
**Forventet output:** conversion failure memo
**Lagre output:** `research/external/r13/R13-INNO-005-konverteringsbarrierer.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg konverteringsbarrierer: forskning og pilot som ikke skalerer, og mønstre på tvers. Bruk case-litteratur, start med akademiske reviews og case-litteratur. For hvert mønster: oppgi barriere, evidens, case, kildeklasse og caveat. Overclaim-vakt: enkeltcase generaliserer ikke alene. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-INNO-006 — FoU-aktører og forskningsmiljøer

**Prioritet:** P1
**Tema:** Innovasjon
**Geo:** NO
**Forventet output:** R&D actor map
**Lagre output:** `research/external/r13/R13-INNO-006-fou-aktorer.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg FoU-aktører og forskningsmiljøer i norsk matsystem og deres pågående prosjekter. Bruk forskningsinstitusjonskilder, start med NMBU, Nofima, NIBIO, SINTEF, Ruralis og Forskningsrådet. For hver aktør: oppgi miljø, prosjekt, tema, år, lokator, kildeklasse og caveat. Overclaim-vakt: prosjekt er ikke implementert resultat. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-INNO-007 — Offentlig innovasjonsetterspørsel

**Prioritet:** P2
**Tema:** Innovasjon
**Geo:** NO
**Forventet output:** public innovation memo
**Lagre output:** `research/external/r13/R13-INNO-007-offentlig-innovasjon.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg offentlig innovasjonsetterspørsel: innovative anskaffelser i mat og kommunale piloter. Bruk anskaffelseskilder, start med LUP/Innovative anskaffelser, Doffin og kommuner. For hver case: oppgi tiltak, oppdragsgiver, status, år, lokator, kildeklasse og caveat. Overclaim-vakt: pilot er ikke skalert tiltak. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

## Økologi

### R13-OKO-001 — Økologisk areal og produksjon

**Prioritet:** P1
**Tema:** Økologi
**Geo:** NO
**Forventet output:** organic area profile
**Lagre output:** `research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg økologisk areal og produksjon i Norge: areal, andel, utvikling og mål vs realisert. Bruk offisiell jordbruksstatistikk, start med Debio, Landbruksdirektoratet og SSB. Lag tabell med indikator, tall, år, lokator, kildeklasse og caveat. Overclaim-vakt: skill sertifisert areal og areal under omlegging. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-OKO-002 — Agroøkologisk og regenerativ metrikk

**Prioritet:** P1
**Tema:** Økologi
**Geo:** NO
**Forventet output:** metric inventory
**Lagre output:** `research/forstaelse/R13-OKO-002-agrookologisk-metrikk.md`
**Anbefalt gate:** forstaelse

**Prompt:**
Kartlegg agroøkologi/regenerativ metrikk i Norge: hva måles (jordhelse, karbon, biodiversitet), hvem måler og datagap. Bruk forsknings- og programkilder, start med NIBIO, NMBU og Regenerativt Norge. For hver metrikk: oppgi indikator, hvem måler, dekning, status (målt/ikke målt), kildeklasse og caveat. Overclaim-vakt: selvrapportert metrikk merkes `B`; ikke målt = `C`. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal forstaelse.

### R13-OKO-003 — Jordhelse og karbon i jord

**Prioritet:** P1
**Tema:** Økologi
**Geo:** NO
**Forventet output:** soil carbon memo
**Lagre output:** `research/external/r13/R13-OKO-003-jordhelse-karbon.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg jordhelse og karbon i jord: måleprogrammer, baseline og dekning i Norge. Bruk forsknings- og overvåkingskilder, start med NIBIO jordovervåking og carbon farming-prosjekter. Lag tabell med program, indikator, baseline, dekning, år, kildeklasse og caveat. Overclaim-vakt: modellert karbon er ikke målt karbon. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-OKO-004 — Biodiversitet i jordbrukslandskap

**Prioritet:** P2
**Tema:** Økologi
**Geo:** NO
**Forventet output:** biodiversity indicator memo
**Lagre output:** `research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg biodiversitet i jordbrukslandskap: indikatorer, kilder og trend. Bruk overvåkingskilder, start med NIBIO 3Q, Artsdatabanken og Miljødirektoratet. For hver indikator: oppgi måling, trend, år, lokator, kildeklasse og caveat. Overclaim-vakt: indikator er proxy; ingen kausal påstand. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-OKO-005 — Sertifiserings- og merkeordninger

**Prioritet:** P1
**Tema:** Økologi
**Geo:** NO
**Forventet output:** certification map
**Lagre output:** `research/external/r13/R13-OKO-005-sertifisering-merkeordninger.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg sertifiserings- og merkeordninger for mat: Debio, Nyt Norge og lokalmatmerker — omfang og troverdighet. Bruk sertifiseringsorganer, start med Debio, Matmerk/Nyt Norge og Stiftelsen Norsk Mat. For hver ordning: oppgi krav, omfang, år, lokator, kildeklasse og caveat. Overclaim-vakt: merke ≠ verifisert miljøeffekt; skill omfang og krav. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-OKO-006 — Beite, utmark og husdyr-økologi

**Prioritet:** P2
**Tema:** Økologi
**Geo:** NO
**Forventet output:** grazing ecology memo
**Lagre output:** `research/external/r13/R13-OKO-006-beite-utmark-husdyr.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg beite-, utmark- og husdyr-økologi: arealbruk, karbon og metan i norsk kontekst. Bruk forskningskilder, start med NIBIO, NMBU og Miljødirektoratet. For hver indikator: oppgi tall, metode, år, lokator, kildeklasse og caveat. Overclaim-vakt: metan-/karbonregnskap er metodefølsomt — merk metode. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-OKO-007 — Policy-mål for økologi og bærekraft

**Prioritet:** P1
**Tema:** Økologi
**Geo:** NO
**Forventet output:** policy target memo
**Lagre output:** `research/external/r13/R13-OKO-007-policy-mal-okologi.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg policy-mål for økologi og bærekraft: nasjonale mål, EU Farm-to-Fork-kobling og måloppnåelse. Bruk policy-dokumenter, start med LMD, relevante Meld. St. og EU Farm to Fork. Lag tabell med mål, vedtatt/forslag, måloppnåelse, kilde, år, kildeklasse og caveat. Overclaim-vakt: skill forslag og vedtatt mål; måloppnåelse kan være `B`. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

## Hele landskapet

### R13-LAND-001 — Makt- og eierkonsentrasjon

**Prioritet:** P1
**Tema:** Hele landskapet
**Geo:** NO
**Forventet output:** concentration structure map
**Lagre output:** `research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg makt- og eierkonsentrasjon på tvers av dagligvare, grossist, foredling og fôr som struktur. Bruk konkurranse- og registerkilder, start med KT, Brreg, NIBIO og årsrapporter. Lag tabell med ledd, aktør, andel/struktur, kilde, år, kildeklasse og caveat. Overclaim-vakt: konsentrasjon er struktur, ikke intensjon. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-LAND-002 — Vertikal integrasjon og kontroll

**Prioritet:** P1
**Tema:** Hele landskapet
**Geo:** NO
**Forventet output:** vertical integration map
**Lagre output:** `research/external/r13/R13-LAND-002-vertikal-integrasjon.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg verdikjede-integrasjon og vertikal kontroll: hvem eier hva oppstrøms og nedstrøms. Bruk register og årsrapporter, start med Brreg, konsernregnskap og KT. For hver kobling: oppgi aktør, eierandel, ledd, kilde, registerdato, kildeklasse og caveat. Overclaim-vakt: eierandel-tolkning må kildedateres. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal PCQ.

### R13-LAND-003 — Helsystem-kart og aktørtypologi

**Prioritet:** P1
**Tema:** Hele landskapet
**Geo:** NO
**Forventet output:** system map underlag
**Lagre output:** `research/forstaelse/R13-LAND-003-helsystem-kart.md`
**Anbefalt gate:** forstaelse

**Prompt:**
Lag helsystem-kart/aktørtypologi som kobler aktørkart, waste, protein, innovasjon og økologi til ett landskap. Bruk R13-syntese, start med R13-outputs og R12 intake-indeks. For hver node: oppgi type, kobling, evidensstyrke, gate og caveat. Overclaim-vakt: syntese er ikke faktastemme; behold gate per node. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal forstaelse.

### R13-LAND-004 — Datagap-atlas

**Prioritet:** P1
**Tema:** Hele landskapet
**Geo:** Nordic
**Forventet output:** datagap atlas
**Lagre output:** `docs/project/mandates/R13-LAND-004-datagap-atlas.md`
**Anbefalt gate:** internal

**Prompt:**
Bygg datagap-atlas: samle alle type-C-hull fra R4/R5/R6/R12/R13 til ett kart over hva som ikke måles og av hvem. Bruk tidligere rundeoutputs, start med DRO-indekser R4/R5/R6 og R12 intake. For hvert hull: oppgi domene, hull, hulltype, hvorfor ikke målt, kildeklasse og caveat. Overclaim-vakt: type-C er funn; ikke skjul i pen figur. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal internal.

### R13-LAND-005 — Bevegelse- og nettverkskart

**Prioritet:** P2
**Tema:** Hele landskapet
**Geo:** NO
**Forventet output:** movement network memo
**Lagre output:** `research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg bevegelse- og nettverkskart: hvordan regenerativ/lokalmat/øko-bevegelsen henger sammen organisatorisk. Bruk organisasjonssider, start med Regenerativt Norge, Økologisk Norge, KVANN og andelslandbruk.no. For hver kobling: oppgi aktør, relasjon, kilde, kildeklasse og caveat. Overclaim-vakt: organisatorisk kobling er ikke ideologisk enhet. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal source-shortlist.

### R13-LAND-006 — Figurkandidat-oversikt for whitepaper

**Prioritet:** P1
**Tema:** Hele landskapet
**Geo:** Internal
**Forventet output:** figure candidate inventory
**Lagre output:** `docs/project/mandates/R13-LAND-006-figurkandidater.md`
**Anbefalt gate:** internal

**Prompt:**
Lag uttaks-/figurkandidat-oversikt for whitepaper: hvilke R13-funn kan bli figur, tabell eller casekort, med gate. Bruk kuratert R13-evidens, start med R13-outputs og claim-lock/PCQ-status. For hver kandidat: oppgi funn, figurtype, gate, status og caveat. Overclaim-vakt: ingen figur uten gate/status og synlige tomme celler. Registrer tomme celler. Avslutt med `Ikke si`-liste og anbefal internal.
