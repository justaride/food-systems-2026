# MASTERPLAN — Den ultimate hjernen for matverdikjeden

**Dato:** 2026-07-06
**Status:** Retningsdokument for total utvikling av prosjektet, fra nåtilstand til endelig målbilde
**Forfattet for:** Gabriel Freeman & Cathrine Barth / Natural State / Food Systems Transition Group
**Forhold til andre planer:** Dette dokumentet er *visjons- og retningslaget* over `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md` (operativ forskningsplan), `PROJECT-OVERVIEW.md` (leveransebrief) og `DEEP-RESEARCH-PLAN.md` (historisk). Det erstatter ingen av dem. Alt her er intern strategi — ikke claim-locket, ikke siterbart eksternt.

> **Leseregel 2026-07-21:** Nåtilstandstallene i dette daterte
> retningsdokumentet er et 06.07-snapshot. De skal ikke brukes som gjeldende
> database- eller completion-status. Senere tall og porter styres av
> `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`,
> `docs/project/status/food-systems-completion-register-2026-07-15.md` og
> `research/_plans/gap-program-2026-07-21/GAP-LUKKINGSPROGRAM-2026-07-21.md`.

---

## 0. Premisset

Spørsmålet dette dokumentet svarer på: *Hvis dette prosjektet var den ultimate hjernen for alt innenfor matverdikjeden — hva hadde vi hatt, hva hadde vi bygget, hva hadde vi gjort annerledes, hvilke prosesser hadde vi gått gjennom?*

Svaret starter med en erkjennelse: Vi har allerede bygget noe ingen andre i Norden har. Ikke en rapport, ikke en database, men en **verifiserbar kunnskapsmaskin** — et system der hver påstand bærer sin egen kilde, hver aktør sin egen proveniens, og der ærlighet er håndhevet av kode (`fail-closed`, tomme celler forblir tomme). Det er fundamentet. Masterplanen handler om hva dette fundamentet *kan bære* som vi ennå ikke har reist.

**Visjonen i én setning:** Et levende, spørrbart, selvoppdaterende nordisk matsystem-observatorium — der enhver aktør, pengestrøm, materialstrøm, maktrelasjon og politisk beslutning i matverdikjeden kan finnes, følges over tid, simuleres framover, og siteres med primærkilde — åpent nok til å endre offentlig samtale, presist nok til å tåle juridisk og akademisk ettersyn.

---

## 1. Ærlig nåtilstand: hva hjernen består av i dag

Dette er ikke skryteliste, men inventar — planen bygger på det som faktisk finnes.

### 1.1 Datafundamentet
- **48 Prisma-modeller** over PostgreSQL med pgvector og pg_trgm: selskaper, eierskap, styremedlemmer, finanser, subsidier, aktører, relasjoner, dokumenter, siteringer, innsikter, medieanalyse, akvakultur, landmetrikker, personprofiler, prosjektstyring.
- **11+ komplette konserntrær** (NorgesGruppen, Coop, Reitan, Orkla, Nortura, Tine, Felleskjøpet, Mowi, SalMar, Lerøy, Bama, Kavli), 339 styremedlemmer, 5-års finanser for norske majors, 2025-backfill for svenske/danske majors.
- **1 634 av estimert 1 651 domene-taggede aktørregistreringer** over 17 verdikjedesteg — fra primærproduksjon til matsvinn-sirkulær, fra REKO-ringer til grossister — alle med registerbasert proveniens (Brreg, Økoguiden, offisielle kart) og eksplisitte claim-grenser.
- **2 699 SourceCitations, 244 517 FieldCitations, 0 blocked_unsourced.** Strict source gate er grønn. Acceptance-pack 11/16 cite-ready med 5 dokumenterte fail-closed-blokkeringer.

### 1.2 Maskineriet
- **~37 app-flater** i Next.js: graf, kart, eierskap, verdikjede, forsyningskjede, hvitbok, forskningsrunder, sirkularitet, havbruk, subsidier, politikk, media, tidslinje, sammenligning, søk (keyword/semantic/hybrid).
- **277 npm-scripts**: ~150 imports, resten audits, gates, backfills, koherens-sjekker — inkludert `audit:citable`, `gate:overclaim`, `audit:domain-coverage`, `compute-metrics`.
- **En egen MCP-server** (`mcp/foodsystems-kb`) som eksponerer kunnskapsbasen for agenter.
- **Obsidian-vault** med maktkart, innsiktskart og gap-noder, synkronisert via `vault:sync`.
- **Frø til neste nivå ligger allerede i koden:** `emergence-simulation.ts`, `bootstrap-material-flows`, `actor-relationship-graph.ts`, `graph-confidence.ts`.

### 1.3 Metoderegimet (den egentlige innovasjonen)
- Claim-lock / PCQ-gates / source-locator / validation-gate: en påstand kan ikke bli "siterbar" uten primærkilde og metodeetikett.
- Fail-closed-prinsippet: "kapasitet" er ikke "realisert volum", type-C-hull er funn, ikke feil.
- Mottakslogg + usikkerhetslogg + review-kø per importbatch — full sporbarhet fra kilde til celle.
- Universe-estimering per celle (`min(20, universe)`-gulv) — vi vet hva vi *ikke* dekker.

### 1.4 Rammen
- Kontrakt P25013 (WP3 Nordic Circular Food Systems), periode ut **31. juli 2026**. Aktive milepæler: M16 (roadmap-utkast), M17 (publisere roadmap + offentlig event), M18 (plan for videreføring).
- Menneskegatede oppgaver som *ikke* er gjort: stakeholder-intervjuer (Mission 1), nordisk partnervalidering (Mission 2), charter-/pilotworkshops (Mission 3/6).
- Finansieringsspor identifisert: NordForsk food-security-utlysning (frist 2026-12-02, P0), Horizon Cluster 6, LIFE, NIB/EIB som senere kapitalspor.

### 1.5 De ærlige svakhetene
1. **Kunnskapen er fryst i importøyeblikket.** Ingen kant i grafen vet *når* den var sann. Eierskap, styreverv og priser endrer seg — databasen gjør det ikke, uten manuell re-import.
2. **Bredde uten dybde i randsonene.** 1 634 aktører er kartlagt på actor-gate-nivå: vi vet at de finnes, ikke hva de gjør, hvor mye de omsetter i strømmen, eller om de er aktive i 2026.
3. **Ingen materialstrømmodell.** Vi har aktørene og relasjonene, men ikke tonnene: hva flyter faktisk mellom nodene (N/P/K-gapene i VK4 er symptomet).
4. **Én bruker.** Hele hjernen betjener i praksis to personer og en agent-pipeline. Ingen offentlig flate, ingen API-forbrukere, ingen redaksjonelle partnere.
5. **Menneskestemmene mangler.** 134-måneders prisserier og HHI-beregninger, null direktesitater. Whitepaperet leser som analyse, ikke som levd erfaring.
6. **Ingen plan for livet etter 31. juli** utover M18-punktet. Prosjektet har kontraktsslutt, ikke exit-strategi.
7. **Personvern og juss er uadressert som system.** PersonProfile + styremedlemmer + maktkart = GDPR-flate og ærekrenkelsesrisiko som i dag håndteres implisitt, ikke som policy.

---

## 2. Det vi ikke har tenkt på — den ultimate hjernens manglende organer

Hvis dagens system er hjernens *hukommelse* (utmerket) og *samvittighet* (claim-gates, uvanlig sterk), mangler den fire organer: **sanser, tidssans, forestillingsevne og stemme.**

### 2.1 Sanser: fra arkiv til overvåkning (den levende hjernen)

I dag oppdager systemet ingenting selv. Alt kommer via manuelt initierte imports. Den ultimate hjernen *merker* at verden endrer seg:

- **Brreg-endringsagent.** Vi har allerede orgnr for 1 600+ aktører og `refresh:brreg`. Neste steg er en daglig/ukentlig differ: nye roller, adresseendringer, konkursåpninger, fusjoner, nyregistreringer i mat-NACE-koder. Hver diff blir en *hendelse* i databasen med proveniens, ikke en stille overskriving. Konkurs-sporet er allerede bevist verdifullt (Sirkulær-konkurser-runden: Rest, Enorm, Mycorena, Infarm...) — automatiser det.
- **Kunngjørings- og anbudsagent.** Doffin/TED for offentlige matinnkjøp (kobler direkte til pilotbriefen om kommunal innkjøpsstandard), høringer fra regjeringen.no/Mattilsynet/Landbruksdirektoratet, EU-notifikasjoner med EØS-relevans.
- **Pris- og statistikkagent.** SSB-tabeller (08801 m.fl.), Landbruksdirektoratets markedsrapporter, Nofima/SINTEF-publikasjoner — hentes på publiseringsrytme, diffes mot forrige versjon, avvik flagges som "ny innsiktskandidat".
- **Medieagent.** MediaEntry-modellene finnes allerede; koble dem til løpende overvåkning av matsystem-dekning (E24, Nationen, DN, Kystens Næringsliv) slik at medienarrativ-analysen blir en tidsserie, ikke et øyeblikksbilde.
- **URL-helse som immunsystem.** `db:verify:url-health` finnes; gjør den kontinuerlig og koble automatisk arkivering (Wayback/lokal snapshot) *i det øyeblikket en kilde først siteres* — ikke som opprydding etterpå.

**Prinsipp:** Hver agent produserer *hendelser i en kø for menneskelig triage*, aldri direkte databaseendringer. Gatene består; det er sansingen som blir automatisk.

### 2.2 Tidssans: temporalitet som førsteklasses dimensjon

Den største arkitektoniske mangelen. Den ultimate hjernen kan svare på: *"Vis meg eierskapskartet slik det så ut i januar 2024"* og *"hvilke styrekoblinger har oppstått siste 12 måneder?"*

- **Bitemporal modell på kantene:** `validFrom`/`validTo` (når var det sant i verden) + `recordedAt` (når visste vi det) på CompanyOwnership, BoardMember, BusinessRelationship, ActorRelationship, CompanyFinancial-avledninger.
- **Hendelseslogg (event ledger):** endringer fra sanse-agentene (2.1) lagres som hendelser; dagens tabeller blir *projeksjoner* av hendelsesloggen. Dette gir gratis: tidslinje-visning per selskap, "hva endret seg denne uken"-rapport, og reproduserbarhet (databasen kan gjenskapes til enhver dato).
- **Tidslinje-flaten finnes allerede** (`/tidslinje`) — den blir først kraftfull når dataene under er temporale.
- **Migrasjonsvei:** ikke big-bang. Nye kanter skrives bitemporalt fra dag én; eksisterende kanter får `validFrom = accessedAt/importdato` som konservativ nedre grense, med eksplisitt `temporal_confidence`-etikett i god fail-closed-ånd.

### 2.3 Forestillingsevne: fra kunnskap til modell

Hjernen skal ikke bare vite — den skal kunne *resonnere framover*.

- **Materialstrømlag (MFA).** `bootstrap-material-flows` er frøet. Målbilde: en flow-graf der kantene bærer tonn/år, N/P/K-innhold, verdi og usikkerhet, oppå den eksisterende aktørgrafen. VK4-gapene (oppdrettsslam, svartvann-fosfor, matsvinn-N/P/K, biogasskapasitet) er de første strømmene å kvantifisere — de er allerede scopet som missions.
- **Sårbarhets- og resiliensindeks.** Nettverksanalyse på grafen vi allerede har: sentralitet (ASKO-Vestby-avhengigheten er allerede en pilotbrief!), single-points-of-failure, importnode-eksponering (R13-GAP-001: fosfat, fôrprotein, soya), redundans per region. Output: en beregnet, reproduserbar "hvor knekker systemet"-analyse ingen andre i Norden kan levere.
- **Scenariomotor.** `emergence-simulation.ts` er frøet. Målbilde: parametriserbare sjokk ("soyaimport -40 %", "ny UTP-håndheving", "Finlands §4a-modell innført i Norge", "kommunal innkjøpsstandard vedtatt i 50 kommuner") kjørt mot material- og aktørgrafen, med eksplisitt modell-etikett (modellert ≠ målt — metodedisiplinen vår er allerede bygget for å holde dette ærlig).
- **Konsentrasjonsanalyse som tidsserie.** HHI/marginanalysene finnes; gjør dem løpende og per ledd i kjeden (grossist, foredling per subdomene, dagligvare per kommune), slik at maktforskyvning blir observerbar, ikke anekdotisk.

### 2.4 Stemme: fra intern base til offentlig infrastruktur

Den ultimate hjernen snakker med flere enn oss.

- **Samtalegrensesnittet.** pgvector + hybrid-søk + `mcp/foodsystems-kb` er 80 % av en RAG-assistent. Målbilde: "Spør matsystemet" — et grensesnitt der svar *alltid* kommer med siteringer fra claim-locket materiale, og der spørsmål uten kildedekning ærlig svarer "dette vet basen ikke" (fail-closed for generering, ikke bare import). Dette er den naturlige kronen på sitatgovernance-arbeidet: vi er et av få miljøer som faktisk kan bygge en hallusinasjonsfri fagassistent, fordi datalaget håndhever ærlighet.
- **Levende hvitbok.** `/hvitbok`-flaten med proveniens-visning finnes. Målbilde: whitepaper juni 2026 er ikke en PDF som dør ved publisering, men en versjonert, levende publikasjon der hvert tall lenker til kilden og oppdateres når kilden gjør det. PDF-en blir et *øyeblikksbilde med versjonsnummer*.
- **Publikt API + datasett.** Kuratert, lisensiert utsnitt av basen (aktørregister, eierskapskanter, konsentrasjonsmetrikker) som åpne data. Dette er også finansieringsargument: infrastruktur, ikke rapport.
- **Stakeholder-spesifikke flater.** Samme base, fire linser: *politiker/embetsverk* (policy-koblinger, høringsvarsler, virkemiddelkart), *journalist* (maktkart, endringshendelser, konkurs-sporet), *forsker* (API, metodedokumentasjon, BibTeX — `bibtex.ts` finnes alt), *aktør i kjeden* (egen posisjon i strømmen, sammenlignbare aktører).
- **Varslingstjeneste.** "Følg dette selskapet / denne verdikjeden / dette temaet" → ukentlig digest fra hendelsesloggen. Det er dette som gjør observatoriet *vanedannende* for målgruppene.

### 2.5 Ryggmarg: det institusjonelle laget vi ikke har bygget

- **Personvern- og publiseringspolicy som dokument og som kode.** Hva publiseres om enkeltpersoner (styremedlemmer, eiere)? Grunnlag: berettiget interesse + offentlige registre, men det må *skrives*, med slette-/innsigelsesprosess, før noe offentliggjøres. Legg til `publication_tier` på persondata (internt / aggregert / publiserbart).
- **Juridisk gjennomgang av maktkartlegging.** Ærekrenkelseslovgivning, databasevern, registervilkår (Brreg-vilkår tillater mye, Proff/Infotorg gjør ikke). En dags advokattid før lansering sparer måneder.
- **Feilrettings- og innsigelsesprosess.** Den dagen NorgesGruppen ringer om en feil kant i grafen, skal det finnes en synlig prosedyre: meld feil → triage → korriger med proveniens → changelog. Dette er også tillitsbyggende overfor forskere/journalister.
- **Fagråd/redaksjonsråd.** 3–5 personer (økonom med dagligvarekompetanse, matsystemforsker, journalist, jurist) som kvartalsvis red-teamer de viktigste claimene. Formaliserer det acceptance-packen gjør teknisk.
- **Merkevare og navn.** "Food Systems 2026" har innebygd utløpsdato. Observatoriet trenger et navn som bærer forbi kontrakten (arbeidshypotese: *Nordic Food Systems Observatory* / *Matsystem-observatoriet*).

---

## 3. Hva vi hadde gjort annerledes — lærdommer inn i neste fase

Ikke selvpisking; designprinsipper for alt nytt vi bygger:

1. **Temporalitet fra dag én.** Hver relasjon uten gyldighetsintervall er teknisk gjeld. (Konsekvens: alle nye modeller/kanter er bitemporale, punktum.)
2. **Hendelser, ikke overskrivinger.** Import-scriptene våre muterer tilstand. Hendelseslogg først, projeksjon etterpå, hadde gitt oss historikk gratis. (Konsekvens: sanse-agentene i 2.1 bygges hendelsesbasert fra start.)
3. **Få deklarative pipelines framfor 150 imperativsscripts.** `db:import:mvk-*`-familien beviser at mønsteret er identisk: kilde → kandidat-CSV → mottakslogg → review → import → audit. Det er én pipeline med 60 konfigurasjoner, ikke 60 scripts. (Konsekvens: neste refaktor er en `pipeline.yaml`-drevet importmotor; scriptene fryses som legacy.)
4. **Universe-estimat før innsamling, alltid.** Der vi gjorde det (MVK-dashboardet), vet vi nøyaktig hva dekningen betyr. Der vi ikke gjorde det (tidlige runder), kan vi ikke skille "komplett" fra "det vi fant".
5. **Publiser tidligere.** Et halvår med offentlig flate hadde gitt feedback, brukere og finansieringsargumenter vi nå må bygge i etterkant. (Konsekvens: Horisont 1 prioriterer offentlig lansering av *noe* over intern perfeksjon av *alt*.)
6. **Menneskedata er kritisk vei, ikke etterarbeid.** Intervjuene (Mission 1) ble liggende bak desk-research fordi desk-research kunne automatiseres. Den ultimate hjernen planlegger menneskegatede innsamlinger *først*, fordi de har lengst ledetid.
7. **Skill lager fra syn tidligere.** Rapporter/HTML-filer i rot-mappen, forskningsnotater, DB og Obsidian overlapper. Én kilde til sannhet (DB + hendelseslogg), alt annet er genererte visninger.

---

## 4. Masterplanen: fire horisonter

### Horisont 0 — Lever kontrakten (nå → 31. juli 2026)

*Alt annet i dette dokumentet er underordnet dette. Ingen nye fronter åpnes før M16–M18 er levert.*

| Uke | Fokus | Leveranse |
|---|---|---|
| 6.–12. juli | M16: roadmap-utkast ferdigstilles fra evidence-pack + pilotbriefer; Mission 1-intervjuer bookes NÅ (lengst ledetid) | Roadmap-utkast v1 til Cathrine/partnere |
| 13.–19. juli | Partnervalidering (Mission 2, Michel/Betina) med valideringstabell fra DB; intervjusitater inn i whitepaper §3/§5/§6 | Validert nordisk sammenligning |
| 20.–26. juli | M17: publiser roadmap på `/hvitbok`-flaten (levende versjon) + PDF-øyeblikksbilde; offentlig online event | Publisert roadmap + gjennomført event |
| 27.–31. juli | M18: videreføringsplan — som i praksis er en operasjonalisert versjon av *dette dokumentets* Horisont 1–3 + NordForsk-søknadsskisse | Continuation plan levert NCH |

**Horisont 0-disiplin:** WS2-dyputvidelser og alt i §2 er frosset. Kun WS4 (roadmap-støtte), WS6 (menneskegatede missions) og kritisk WS5-hygiene kjøres.

### Horisont 1 — Fra prosjekt til plattform (aug–des 2026)

Tema: *overlevelse og lansering.* Prosjektet må sikre finansiering og bli synlig, ellers dør hjernen med kontrakten.

1. **Finansiering (kritisk vei).** NordForsk-søknad (frist 2026-12-02) med observatoriet som infrastrukturargument; parallelt: oppdragsanalyse-pilot (1–2 betalte analyser for departement/direktorat/NGO basert på eksisterende base) som inntektsbevis.
2. **Offentlig lansering v0.** Kuratert utsnitt: konserntrær, konsentrasjonsmetrikker, aktørkart, levende hvitbok. Forutsetning: personvernpolicy (§2.5) skrevet og juridisk lest. Mål: 3 medieomtaler, 5 eksterne brukere med gjentatt bruk.
3. **Brreg-endringsagenten** (første sanseorgan) i drift med menneskelig triage-kø. Konkursvarsling for de 1 634 aktørene som første use-case.
4. **Temporal grunnmur.** Bitemporale felt på nye kanter + hendelseslogg-tabell. Ingen migrering av gammelt ennå — bare slutt å bygge ny gjeld.
5. **Pipeline-konsolidering.** MVK-importmotoren gjøres deklarativ (én motor, konfig per domene); nye imports skriver hendelser.
6. **Navn/merkevare besluttes.**

*Suksesskriterium H1: finansiering sikret eller inntekt demonstrert; noe er offentlig; systemet oppdager sin første endring selv.*

### Horisont 2 — Den nordiske hjernen (2027)

Tema: *dybde, modell og samtale.*

1. **Nordisk paritet.** SE/DK/FI/IS løftes mot norsk dybdenivå: konserntrær, styredata, domeneaktører for de 3–5 viktigste verdikjedestegene per land. Partnerskap (Cradlenet, LDCluster, universitetene fra den store søknaden) gjenbrukes som datavalideringsnettverk.
2. **Materialstrømlag v1.** De 12 VK4-strømmene kvantifisert med metodeetiketter; N/P/K-regnskapet (VK4-GAP-007) som flaggskipsanalyse.
3. **Sårbarhetsindeksen publiseres.** Nettverksanalyse + importnoder + logistikk-avhengigheter → årlig "Nordic Food System Resilience Report" (gjentagbart, siterbart produkt = finansieringsmotor).
4. **"Spør matsystemet" v1.** RAG over claim-locket materiale via KB-MCP-serveren, med siterings-tvang og fail-closed-generering. Først internt/partnere, så offentlig.
5. **API v1 + forskeravtaler.** 2–3 formaliserte forskningssamarbeid (NMBU, Ruralis, Linköping) som både validerer og legitimerer.
6. **Varslingstjeneste v1** oppå hendelsesloggen.
7. **Prosessrytme etableres:** kvartalsvis claims-red-team med fagråd, halvårlig universe-refresh, årlig metode-review, årlig personvern-audit.

*Suksesskriterium H2: en beslutningstaker, en journalist og en forsker bruker systemet uavhengig av oss; minst én policy-prosess siterer observatoriet.*

### Horisont 3 — Infrastruktur-institusjon (2028+)

Tema: *observatoriet som varig institusjon og replikerbar metode.*

1. **Nordic Food Systems Observatory som organisasjon** — eget hjem (stiftelse/senter/konsortium), basisfinansiering (nordisk + nasjonal), 3–6 årsverk: dataredaktør, analytiker, utvikler/agent-operatør.
2. **Data commons.** Åpne kjerneregistre under åpen lisens; metodeverket (claim-lock, PCQ, fail-closed, universe-estimering, mottakslogg) publiseres som *standard* — det er eksporterbart til andre sektorer (tekstil, bygg — de andre transition groups er nærmeste kandidater) og andre regioner.
3. **Scenariomotor v1** koblet til materialstrømlaget: politikk- og sjokk-simulering som tjeneste for departementer og NGO-er.
4. **Full temporal migrering** av historiske kanter; basen kan gjenskapes til enhver dato.
5. **Forretningsmodell i tre lag:** åpen kjerne (commons) + abonnement (varsling, dashboards, API-volum) + oppdrag (analyser, scenariokjøringer, årsrapporter).

*Suksesskriterium H3: observatoriet overlever utskifting av enkeltpersoner; metoden er tatt i bruk utenfor mat.*

---

## 5. Prosessene vi går gjennom (rituelle sykluser)

Den ultimate hjernen er ikke bare artefakter, men gjentatte prosesser:

- **Ukentlig:** triage av hendelseskø fra sanse-agentene; `audit:citable`-kjeden grønn før enhver publisering.
- **Månedlig:** dekningsdashboard-refresh; URL-helse/arkiveringsrunde; digest til partnere.
- **Kvartalsvis:** claims-red-team med fagråd (10 viktigste påstander angripes aktivt); brukersamtaler (3–5 stk) med hver stakeholder-linse; prioritering av neste kvartals fronter mot dette dokumentet.
- **Halvårlig:** universe-reestimering per celle (universene endrer seg — nye NACE-registreringer, nye ringer, konkurser); gap-analyse mot §2-organene.
- **Årlig:** metode-review (er gatene fortsatt riktige? er fail-closed-grensene kalibrert?); personvern-/juss-audit; resiliens-rapporten; revisjon av *dette dokumentet*.

---

## 6. Beslutninger som må tas (åpen beslutningslogg)

Disse kan ikke avgjøres av planen — de krever eier-/partnerbeslutning, og bør inn i Decision Log:

1. **Åpenhetsgrad:** full open source, åpen data + lukket kode, eller lukket med åpne utsnitt? (Anbefaling: åpen kjerne-data + åpen metode, kode lukket inntil H3.)
2. **Personpubliseringspolicy:** hvilket nivå av person-/styredata publiseres offentlig? (Blokkerer H1-lansering.)
3. **Organisatorisk hjem etter kontrakt:** Natural State-produkt, NCH-forankret, eller selvstendig enhet? (M18-spørsmålet.)
4. **Navn/merkevare.**
5. **Kommersiell linje:** er betalte oppdragsanalyser forenlig med uavhengighets-posisjonen overfor aktørene som analyseres? (Trolig ja med publiseringsplikt-klausul — men det må besluttes.)
6. **Geografisk ambisjon H2:** full nordisk paritet vs. Norge dypt + Norden komparativt. (Ressursstyrt.)

---

## 7. Målbilde-KPI-er

| Dimensjon | I dag | H1 (des 2026) | H2 (des 2027) | H3 (2028+) |
|---|---|---|---|---|
| Selvoppdagede endringer/mnd | 0 | >20 (Brreg-agent) | >200 (4+ agenter) | kontinuerlig |
| Temporale kanter | ~0 % | 100 % av nye | >50 % totalt | 100 % |
| Kvantifiserte materialstrømmer | 0 | 0 (frosset) | 12 (VK4) | full N/P/K-balanse |
| Eksterne aktive brukere | 0 | 5 | 50 | 500+ |
| Uavhengige siteringer av basen | 0 | 1 | 10 (inkl. 1 policy-prosess) | standardreferanse |
| Inntekt utenom NCH-kontrakt | 0 | 1 finansiering ELLER 1 betalt oppdrag | 2 kilder | 3-lags modell bærer drift |
| Claim-integritet | strict gate grønn | grønn | grønn | grønn |

Siste rad er ufravikelig: **veksten skjer aldri på bekostning av gatene.** Det er integriteten som er produktet.

---

## 8. Første 10 konkrete handlinger (fra i dag)

1. Book Mission 1-intervjuene denne uken (lengst ledetid, blokkerer whitepaper-kvalitet).
2. Ferdigstill M16-roadmap-utkastet fra pilotbriefene og evidence-packen.
3. Send Mission 2-valideringstabellen til Michel Bajuk og Betina Simonsen.
4. Skriv M18-videreføringsplanen som en 2-siders operasjonalisering av Horisont 1 i dette dokumentet.
5. Start NordForsk-søknadsskisse (frist 2026-12-02) med observatoriet-som-infrastruktur som kjerneargument.
6. Utkast til personvern- og publiseringspolicy (1 dag, blokkerer alt offentlig).
7. Spesifiser Brreg-endringsagenten (design-notat: hendelsesmodell, triage-kø, varslingsformat) — bygges først etter 31. juli.
8. Legg `validFrom`/`validTo`/`recordedAt` inn i skjemadesignet for neste migrasjon (ingen ny kant uten tid).
9. Beslutningsmøte Gabriel/Cathrine/Einar om beslutningslogg-punktene 1–4 (§6).
10. Legg dette dokumentet inn i kvartalsrytmen: revideres første gang oktober 2026.

---

*Dette dokumentet er internt strategimateriale. Ingenting her er claim-locket eller eksternt siterbart. Tall om nåtilstand er hentet fra `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`, `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md` og repo-inventar per 2026-07-06.*
