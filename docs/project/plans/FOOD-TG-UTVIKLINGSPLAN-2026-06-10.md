---
tittel: Food TG Utviklingsplan 2026-06-10 — delta-plan utover eksisterende veikart
status: Forslag til intern beslutning
eier: Gabriel
dato: 2026-06-10
horisont: Uke 24-31 (programleveranse) + august-desember 2026 (videreføring)
bruksregel: Planen åpner ingen ekstern outreach, faktastemme eller claims. Den styrer utviklingsprioritering. Alle innholdsuttak går fortsatt gjennom claim-lock, PCQ, source-shortlist og citable-gatene.
relaterte_filer:
  - docs/project/analysis/food-tg-vurderingsrapport-siden-jt-2026-06-10.md
  - docs/project/mandates/food-tg-detaljert-arbeidsplan-2026-05-21.md
  - docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/superpowers/plans/2026-05-27-plattform-videreutvikling.md
  - docs/project/analysis/outside-user-platform-review-2026-05-27.md
---

# Food TG Utviklingsplan 2026-06-10

## 0. Hva denne planen er, og hva den ikke er

Dette er en **delta-plan**: den dekker det som *ikke* allerede er planlagt i den detaljerte arbeidsplanen (21.05), case-shortlistens to-ukers løp og juni–desember-uttak (09.06), sprintboardet (10.06) eller plattform-videreutviklingsplanen (27.05). Eksisterende planer fortsetter å gjelde for sitt scope. Denne planen tilfører fem ting de ikke dekker:

1. **Leveransesprinten mot kontraktsfristen 31.07.2026** — inkludert offentlig online event, som i dag ikke har noen plan i repoet.
2. **Plattform fase 2** — fra intern arbeidsbenk til styrings- og presentasjonsflate (casestatus, claim-trakt, publiseringsmodus).
3. **Datamodell-utvikling** — sprintboardets DRO/DASK/AASK-løyper og casekort som strukturerte data, ikke bare markdown.
4. **Research-pipeline som varig system** — mottaksprotokollen fra 10.06 standardisert, med overvåkning og gap-matrise.
5. **Videreføring etter programslutt** — drift, eierskap og gjenbruk av plattformen fra august og utover.

## 1. Styrende tidsavklaring: to horisonter som i dag er i konflikt

Kontrakten P25013 løper 08.08.2025–**31.07.2026**, med «strategic roadmap + offentlig online event (juni/juli 2026)» som hovedleveranse for WP3. Samtidig planlegger case-shortlistens juni–desember-uttak deck i september, workshop/whitepaper-underlag i oktober og roadmap i november–desember — altså *etter* programslutt.

Denne planen løser konflikten ved å skille to leveransenivåer:

| Horisont | Leveranse | Krav til modenhet |
|---|---|---|
| **H1 — innen 31.07.2026 (programleveranse)** | Strategic roadmap **v0.1** (retningsdokument bygget på de 7 caseankrene, med eksplisitt valideringsstatus per spor) + offentlig online event + intern deck | Kun citable uttak og trygg språkbank; alle umodne case vises som «under validering», ikke som funn |
| **H2 — august–desember 2026 (videreføring)** | Roadmap v1.0, whitepaper, aktørvalidering, pilotbriefs, finance note — som planlagt i arbeidsplanen 21.05 og case-shortlisten | Følger eksisterende porter A–D |

Beslutningen om denne todelingen bør bekreftes med Jan Thomas/Einar i uke 24–25, sammen med minimumsvedtaket om casekortene. Hvis Nordic Innovation aksepterer en annen leveransetolkning, justeres H1 — men planen antar kontraktsteksten gjelder.

## 2. Arbeidsstrøm 1: Leveransesprint mot 31.07 (NY)

### 2.1 Offentlig online event — mangler i dag helt plan

| Element | Innhold | Frist |
|---|---|---|
| Event-beslutning | Dato (anbefalt uke 28–30), format (webinar 60–90 min), målgruppe, språk, vertskap NCH | Uke 25 — krever JT/Einar |
| Innholdsdesign | Bygges utelukkende fra citable uttak: 7 caseankre som «hva vi undersøker», flytmodell/coverage som «hvordan vi jobber», skillet utnyttet/høyverdiutnyttet som faglig kjerne | Uke 26–27 |
| Produksjon | Påmelding, opptak, slides fra deck-outline, kjøreplan, moderering, Q&A-beredskap med stoppliste-svar | Uke 27–28 |
| Etterbruk | Opptak + oppsummering publiseres via publiseringsmodus (arbeidsstrøm 3); deltakerliste inn som aktørkandidater | Uke 30–31 |

Eventet er den naturlige anledningen til kontrollert første eksterne eksponering: det krever ikke at claims valideres eksternt, bare at alt som sies følger språkbanken og claim-lock. Thea eier kommunikasjonsplanen (jf. møte 8); denne planen forutsetter at hun aktiveres i uke 25.

### 2.2 Strategic roadmap v0.1

Gjenbruk Roadmap 2026–2029-strukturen fra arbeidsplanens Task 12, men nedskalert til det som kan dokumenteres nå: fase 1 (validering/koalisjon 2026) skrives fullt ut med casestatus fra sprintboardet; fase 2–4 skrives som retning med eksplisitte beslutningsporter. Roadmap v0.1 er dermed programleveransen, mens v1.0 (H2) innarbeider aktørrespons. Ferdig utkast uke 29, levert uke 31.

### 2.3 Intern deck

Allerede bestilt og outlinet (09.06). Frist flyttes frem: v0.1 i uke 25 (ikke september), fordi både event, roadmap og JT/Einar-forankringen trenger den. Slideområdene som per sprintboardet «kan fylles nå» fylles først.

## 3. Arbeidsstrøm 2: Plattform fase 2 — fra arbeidsbenk til styringsflate

Plattform-videreutviklingsplanens Task 3–7 (søk-tomtilstand, språksveip, guidet leserstart, side-framing, statuslegend) står ufullført og beholdes som baseline. Utover dem:

| Tiltak | Beskrivelse | Verdi | Estimat |
|---|---|---|---|
| **Casestatus-flate** | Side som leser sprintboard-/casekortdata og viser de 7 ankrene med go/no-go, blokkere, deck-readiness og siste endring | JT/Cathrine følger styringsbildet uten å lese repo; erstatter manuell statusrapportering | 2–3 dager |
| **Claim-trakt** | Visning av antall claims per status (hold-tilbake → needs-source → intern → cite-ready) med endring siden forrige møte | Gjør valideringsfremdrift målbar møte til møte; KPI for H2 | 1–2 dager |
| **Publiseringsmodus** | Read-only ekstern visning som *kun* eksponerer citable_external-innhold, hvitbok-kapitler med proveniens-appendix og rapporter; alt internt bak InternalSection forsvinner helt | Trygg flate for event-etterbruk og delbar lenke til Nordic Innovation; gjenbruker intern/ekstern-skillet fra P0 | 3–5 dager |
| **Rapport-/deck-eksport** | Generere slides/PDF fra casekort + språkbank, slik at deck og plattform ikke divergerer | Én kilde til sannhet for presentasjonsmateriale | 2–3 dager, etter deck v0.1 |
| **i18n fase 2** | EN-innhold for publiseringsmodus og event-materiale (fase 1 dekker bare rammeverket) | Nordisk/engelsk publikum for event | 2–4 dager, kun for publiserte flater |
| **Hydration-avklaring** | Verifiser om /metodikk-fiksen fra plattform-planens Task 2 faktisk er merged og grønn i Playwright; lukk eller gjenåpne P1 | Fjerner usikkerhet i helsesjekk-bildet | 0,5 dag |

Rekkefølge: casestatus-flate → Task 3–7-rester → publiseringsmodus → eksport → i18n. Publiseringsmodus har egen beslutningsport (Port F, kap. 8).

## 4. Arbeidsstrøm 3: Database- og datamodellutvikling

Kontrollsystemet lever i dag i markdown (sprintboard, casekort, DRO/DRR/DASK/AASK, PCQ). Det var riktig for fart, men gir tre svakheter: ingen referensiell integritet mot DB-en, ingen historikk per claim/case, og ingen mulighet til å bygge casestatus-flaten/claim-trakten uten parsing. Utviklingsretning:

| Tiltak | Beskrivelse | Gate |
|---|---|---|
| **Casekort som entitet** | Prisma-modell for Case (anker, status, blokkere, go/no-go, stoppsignal) med FK til claims, kilder og aktører; markdown beholdes som redaksjonelt lag, import-script synker | Skjemaendring følger db:import-rutinen og strict-gate |
| **Mottaksløyper som data** | DRO/DRR/DASK/AASK-rader med ID, dato, eier, status og kobling til case — i dag finnes IDene bare i tekst | Samme |
| **Aktørrespons-modell** | Strukturert lagring av valideringssamtaler (aktør, dato, spørsmål, svar, bruksrett) klargjort *før* H2-outreach starter, slik at første samtale ikke havner i løse notater | Bygges i H1, brukes først etter Port A |
| **Handelsdata-tidsserier** | Import av aggregert handelsstatistikk (SSB, Tulli, Comtrade-uttrekk) for fôr-/soya-/kaffe-aksene som dataserier med kilde per celle | Kun offisiell statistikk; PCQ-føring per serie |
| **Coverage-utvidelse** | CoverageProfile på de nye casekort-/handelsdatasettene, slik at overclaim-gaten dekker dem fra dag én | Eksisterende overclaim-audit i CI |
| **Prod-rutine** | Den nye manuelle prod-import-workflowen (PR #133) dokumenteres som runbook med sjekkliste: strict gate grønn → import → /api/data-status verifisert | INFRA-ECOSYSTEM-MAP oppdateres |

Prinsipp: ingen big-bang-migrering. Hver modell innføres når en flate trenger den (casestatus-flaten trigger Case-modellen, H2-outreach trigger aktørrespons-modellen).

## 5. Arbeidsstrøm 4: Research-pipeline som varig system

10.06-sprinten improviserte en god pipeline (prompt pack → mottakslogg → DASK/PCQ → claim-lock). Den standardiseres:

1. **Mottaksprotokoll v1.0:** kort prosedyredokument som gjør 10.06-flyten til standard for *all* ny research: ingen kilde inn uten DRO/DRR-rad, eier, dato og statusfelt. Estimat: 0,5 dag, mest utklipp fra eksisterende filer.
2. **Kildeovervåkning utvides:** den ukentlige citation-verification-workflowen suppleres med varsling (issue/e-post) når kilder dør eller endres, i stedet for stille logging.
3. **Nordisk gap-matrise aktiveres:** arbeidsplanens Task 7 (dekningsmatrise land × spor) bygges som generert oversikt fra DB i stedet for håndvedlikeholdt tabell — gjenbruker coverage-dataene.
4. **Opprydding ved bruk:** de 471 LOW-funnene og 40 duplicate-warnings ryddes fortsatt kun når filen berører aktiv casebruk; ingen bulk-rydding.
5. **Arkivdisiplin:** scripts/archive-mønsteret fra 26.05 videreføres; one-shot-research-script arkiveres etter kjøring.

## 6. Arbeidsstrøm 5: Styring, onboarding og transparens

| Tiltak | Beskrivelse | Frist |
|---|---|---|
| **«Start her»-dokument** | Én side: prosjektformål, lesesti (MØTEOVERSIKT → mandat → case-shortlist → sprintboard → citable-status), statusordliste, hvem eier hva | Uke 25 |
| **Onboarding-pakke for TG-medlemmer** | Start her + casestatus-flate + 30-min gjennomgangsmal; testes på Thea ved aktivering for event-arbeidet | Uke 26 |
| **Møtelogg-reparasjon** | Notion-synk eller eksplisitt merking av perioden etter 21.04; fast føringsregel: hvert JT-/TG-møte får fil + MØTEOVERSIKT-rad innen 48 timer | Uke 25, deretter løpende |
| **Statuskadens** | Kort statusnotat til JT/Einar annenhver uke generert fra casestatus-flate + claim-trakt; erstatter ad-hoc-rapportering | Fra uke 26 |
| **Decision-log-disiplin** | Minimumsvedtaket og H1/H2-todelingen føres i decision-log-food-tg.md; ingen port passeres uden loggrad | Løpende |
| **Time-/kapasitetssporing** | Avvik fra 30/20/20/15-fordelingen varsles i statusnotatet (jf. møte 8-vedtak) | Løpende |

## 7. Kapasitet og eierskap

Tilgjengelig kapasitet er begrenset: JT 30 %, Cathrine 20 %, Thea 20 % (90 timer totalt), Gabriel ~15 % av 40 %-stilling pluss utviklingsarbeidet. Planen er derfor sekvensert slik at Gabriel bærer arbeidsstrøm 2–4 (plattform/data), mens 1 og 5 krever JT (beslutninger, roadmap-innhold), Thea (event/kommunikasjon) og Cathrine (ten-step, aktørkunnskap). **Kritisk antakelse:** event-leveransen er ikke gjennomførbar uten at Theas timer aktiveres i uke 25. Hvis kapasiteten ikke finnes, er fallback et mindre format (publisert rapport + kort innspilt presentasjon) — det bør avklares som del av Port E.

## 8. Beslutningsporter (nye, i tillegg til Port A–D i arbeidsplanen)

| Port | Spørsmål | Krav | Eier |
|---|---|---|---|
| **Port E — Event-go** | Kan vi forplikte dato/format for offentlig online event? | H1/H2-todeling bekreftet, Thea aktivert, innholdsramme fra citable uttak | JT/Einar, uke 25 |
| **Port F — Publiseringsmodus** | Kan ekstern read-only-flate gå live? | Kun citable_external-innhold eksponert, strict gate grønn på deploy, språkbank fulgt, JT-godkjenning | JT, før event |
| **Port G — Datamodell-migrering** | Skal casekort/mottaksløyper inn i DB? | Casestatus-flate besluttet bygget; import-script med dry-run; ingen tap av markdown-historikk | Gabriel, uke 26 |

## 9. Tidsplan

### H1: uke for uke

| Uke | Hovedleveranser |
|---|---|
| 24 (nå) | Denne planen besluttes; minimumsvedtak casekort; dokumentask DASK-0906-001/002 sendt internt; hydration-avklaring |
| 25 | Port E (event-go); deck v0.1; «start her»-dokument; møtelogg-reparasjon; Thea aktivert |
| 26 | Casestatus-flate; Port G; onboarding-pakke; statuskadens starter; event-innholdsdesign |
| 27 | Publiseringsmodus bygges; målrettet kildeinnhenting per sprintboard fortsetter; event-produksjon |
| 28 | Port F; roadmap v0.1-utkast; event generalprøve |
| 29–30 | **Offentlig online event**; roadmap v0.1 ferdigstilles med eventinnspill |
| 31 | Programleveranse: roadmap v0.1 + event-dokumentasjon + deck levert; H2-overlevering loggføres |

### H2: august–desember (rammer, detaljer i eksisterende planer)

August: aktørvalidering (etter Port A) med aktørrespons-modellen klar. September: deck v1.0 + decision pack addendum. Oktober: workshop-/whitepaper-underlag. November–desember: roadmap v1.0 og finance note. Parallelt: claim-trakt som fast KPI, handelsdata-tidsserier, i18n fase 2 ferdigstilles ved behov.

## 10. Risikoer og stoppsignaler

| Risiko | Konsekvens | Mottiltak/stoppsignal |
|---|---|---|
| Kontraktstolkningen H1 avvises ikke/bekreftes ikke i tide | Leveransesprint mot feil mål | Eskaler til Einar i uke 24–25; ingen event-forpliktelse før Port E |
| Event eksponerer uvaliderte claims | Reputasjonsrisiko, bryter stopplisten | Alt event-innhold gjennom språkbank + claim-lock; Q&A-beredskap med «det er under validering»-svar |
| Datamodell-migrering forstyrrer strict gate | Rød gate, tapt tillit til tallene | Dry-run + operator-sekvens før hver migrering; markdown forblir kilde til regenerering |
| Kapasitetssvikt (Thea/JT) | Event eller roadmap glipper | Fallback-format besluttes ved Port E, ikke improviseres i juli |
| Plattformutvikling spiser innholdsarbeid | Deck/roadmap forsinkes | Arbeidsstrøm 2-tiltak utover casestatus-flaten kan alle utsettes til H2 uten å true H1 |
| Gate-regresjon oppdages sent (jf. 10.06) | Ekstern bruk av røde tall | Operator-sekvens obligatorisk før event, publisering og programleveranse |

## 11. Suksesskriterier

H1 er vellykket hvis: programleveransen (roadmap v0.1 + event + deck) er levert innen 31.07 med kun citable/trygt innhold; minimumsvedtaket er fattet og loggført; casestatus-flate og «start her» gjør at JT/Cathrine/Thea kan følge prosjektet uten repo-tilgang; strict gate er grønn ved hver port. H2 er riktig rigget hvis: aktørrespons-modellen står klar før første samtale, claim-trakten viser målbar bevegelse fra hold-tilbake mot cite-ready, og minst ett av de syv caseankrene har passert Port A innen oktober.

## 12. Verifikasjon av denne planen

Kontraktsperiode, leveransekrav og kapasitetstall er hentet fra MØTEOVERSIKT (prosjektkontekst + møte 5/6/8). Status for plattform-planens Task 2–7 er lest fra `2026-05-27-plattform-videreutvikling.md` (Task 2 avkrysset, 3–7 ufullført — hydration-status må verifiseres mot main, jf. kap. 3). Casestatus, blokkere og go/no-go er fra sprintboardet 10.06. Tidslinjekonflikten H1/H2 er en tolkning av kontraktstekst mot case-shortlistens juni–desember-tabell og må bekreftes av JT/Einar før planen låses.
