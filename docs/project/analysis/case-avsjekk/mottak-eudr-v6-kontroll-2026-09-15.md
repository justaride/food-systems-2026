---
tittel: Mottak 15.09 — EUDR-kontroll for rapportvinkel V6
status: Intern kontrollnotat. Ikke ekstern faktastemme og ikke rapporttekst.
eier: Gabriel
dato: 2026-09-15
scope: Lukker kontrollhullene bak SI-06 til SI-09 i innsiktskatalogen. EUDR-status er sjekket mot primærkilder, Comext-CSV-en for kakao er registrert, rettelsen i casestatus er logget, og manglende EUDR-ikke-si er lagt i claim-lock. Vinkel V6 er ikke valgt, og notatet er ikke rapporten.
relaterte_filer:
  - docs/project/analysis/food-tg-innsiktskatalog-2026-09-15.md
  - docs/project/analysis/case-avsjekk/avsjekk-01-kaffe-brasil-2026-06-12.md
  - docs/project/analysis/case-avsjekk/avsjekk-02-kakao-elfenbenskysten-2026-06-12.md
  - docs/project/mandates/food-tg-eudr-treffkart-2026-06-12.md
  - research/external/spor1-uttak-2026-06-12/uttak-07-kakao-eu-omvei.md
  - research/external/spor1-uttak-2026-06-12/uttak-09-fase2-uthenting-og-arkiv.md
  - research/external/dro-0906/eurostat-comext-cocoa-nl-be-de-to-nordics-hs1801-1806-2022-2024.csv
  - docs/project/mandates/food-tg-mottaksprotokoll-v1-2026-06-15.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
---

# Mottak 15.09: EUDR-kontroll for V6

## 1. Kort dom

- EU-datoene står: 30.12.2026 for store og mellomstore, og 30.06.2027 for de fleste mikro og små. Kommisjonen gjentok dem 04.05.2026.
- EUDR er fortsatt ikke innlemmet i EØS-avtalen eller norsk rett (Landbruksdirektoratet, sist oppdatert 16.07.2026). Ingen norsk forskrift er funnet.
- Kakaobønner, -skall og -avfall (HS 1801–1802) er utenfor det norske forslaget. HS 1803–1806 og all kaffe (HS 0901) er med. Dette er et høringsforslag fra 2025, ikke vedtatt rett.
- Comext-CSV-en var ikke registrert i kontrollstakken. Tallene er etterregnet og stemmer. Den er nå registrert som `SRC-1509-001`, med intern status.
- Rettelsen av «kaffe er innlemmet» ble gjort 18.06.2026 og logget i R4-indeksen, men ikke i claim-lock. Nå står den der.
- De fleste EUDR-ikke-si-punktene fra DRR-rapportene sto allerede i claim-lock fra 12.06. Seks nye er lagt til fra treffkartet, avsjekkene og DRR-001.

Ingen status er hevet. Alt under er intern kontroll.

## 2. EUDR-status per 15.09.2026

Alle kilder er lest 2026-09-15 uten innlogging eller betalingsmur. Klasse følger mottaksprotokollen 24.06 (A = primær).

| # | Spørsmål | Funn | Kilde og locator | Klasse |
|---|---|---|---|---|
| E1 | Når gjelder EUDR i EU? | 30.12.2026 for alle, med unntak av de fleste mikro- og småoperatører, som får 30.06.2027. Mikro og små som alt er under tømmerforordningen, følger 30.12.2026. | Forordning (EU) 2025/2650 av 19.12.2025, EUT L 23.12.2025, art. 38, https://eur-lex.europa.eu/eli/reg/2025/2650/oj/eng; COM(2026) 191 final, 04.05.2026, PDF-side 11, https://environment.ec.europa.eu/document/download/a3c5c3a0-232e-43c4-b0b8-1eecb1df45c7_en?filename=Report+from+the+Commission+to+the+Council+and+Parliament+on+the+EUDR.pdf | A |
| E2 | Er det kommet ny utsettelse? | Ikke funnet. Kommisjonens forenklingsrapport gjengir datoene i E1. EU-kommisjonens EUDR-side viser de samme datoene. | COM(2026) 191, PDF-side 11; https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en | A |
| E3 | Hvem leverer aktsomhetserklæringen? | Etter revisjonen ligger ansvaret hos operatøren som først plasserer varen på EU-markedet eller eksporterer den. Nedstrøms operatører og forhandlere samler referansenummer fra leverandøren. | COM(2026) 191, PDF-side 11; konsolidert 2023/1115 (26.12.2025), art. 4(2) og 5(3), https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02023R1115-20251226 | A |
| E4 | Er varelisten (vedlegg I) endret? | Kommisjonen vedtok en delegert rettsakt 13.07.2026. Landbruksdirektoratet oppgir at hud og lær fra storfe tas ut, og at blant annet pulverkaffe og frosne storfetunger tas inn. Ingen kakaoendring er nevnt i kildene som er lest. Kunngjøring i EUT og dato for nye varer er ikke verifisert. | Landbruksdirektoratet, EUDR-siden (sist oppdatert 16.07.2026); utkastet på «Have your say», initiativ 14655, https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/14655-Delegated-Regulation-amending-Annex-I-of-Regulation-EU-2023-1115-EU-Deforestation-Regulation-_en | A (norsk myndighet). EU-teksten er ikke lest. |
| E5 | Risikoklasse for Brasil og Elfenbenskysten | Begge står som «standard risk». | EU Green Forum, Country Classification List, https://green-forum.ec.europa.eu/nature-and-biodiversity/deforestation-regulation-implementation/eudr-cooperation-and-partnerships/country-classification-list_en; gjennomføringsforordning (EU) 2025/1093, EUT L 23.05.2025 (sitert i COM(2026) 191) | A |
| E6 | Er EUDR innlemmet i norsk rett? | Nei. Landbruksdirektoratet skriver at forordningen per i dag ikke er innlemmet i EØS-avtalen og gjennomført i norsk rett, og at prosessen ledes av Klima- og miljødepartementet. Stortingets EU/EØS-nytt 08.05.2026 sier at rettsakten er til vurdering for innlemmelse på EØS EFTA-siden. Ingen EØS-komitébeslutning er funnet. Websøk avgrenset til lovdata.no, regjeringen.no og miljodirektoratet.no fant ingen vedtatt forskrift. | https://www.landbruksdirektoratet.no/nb/skogbruk/eus-avskogingsforordning-eudr (sist oppdatert 16.07.2026); https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/EU-EOS-informasjon/EU-EOS-nytt/2026/eueos-nytt---8.-mai-2026/avskogingsforordningen-kommisjonsrapport-og-utkast-til-delegert-forordning/ | A. At forskrift mangler, er et søkeresultat, ikke en bekreftelse. |
| E7 | Når kan EUDR gjelde i Norge? | Det avhenger av beslutning i EØS-komiteen og samtykke fra Stortinget. Miljødirektoratet skriver at regjeringen vil innføre reglene så raskt som mulig etter EU. Ingen norsk dato er satt. | Miljødirektoratet, høringsnotat til forskrift om gjennomføring (høring 19.08.2025, frist 30.09.2025), kap. 5.10.2, s. 40, https://hss.miljodirektoratet.no/api/1/publisert/hoering/vedlegg/36290; https://www.miljodirektoratet.no/ansvarsomrader/arter-naturtyper/avskogingsforordningen/avskogingsforordningen-eudr/ (udatert) | A |
| E8 | Kakao i norsk forslag | EØS-avtalen omfatter fire av seks kakaoposisjoner. Kakaobønner og avfall (HS 1801 og 1802) er ikke med, og HS 1803–1806 står i forskriftsutkastets vedlegg. Høringsnotatet sier også at nesten all kakaoimport til Norge kommer fra EU. | Høringsnotatet s. 18, 41, 45 og 51; Klima- og miljødepartementet og Landbruks- og matdepartementet, 24.06.2025, https://www.regjeringen.no/no/aktuelt/norge-vil-gjennomfore-eu-regler-for-redusert-avskoging/id3111376/ | A (forslag, ikke vedtatt) |
| E9 | Kaffe i norsk forslag | Alle varetyper av kaffe (HS 0901) er med. | Høringsnotatet s. 4–5 og 51; https://www.miljodirektoratet.no/hoeringer/2025/august-2025/horing-av-forskrift-om-gjennomforing-av-avskogingsforordningen-mv.- | A (forslag, ikke vedtatt) |
| E10 | Hvem blir myndighet? | Miljødirektoratet får ansvar for kakao, kaffe, oljepalme og gummi. Landbruksdirektoratet får tre og storfe. | Landbruksdirektoratet, EUDR-siden (16.07.2026) | A |

**Lenker som har falt ut:** Miljødirektoratets sider «Kartlegge relevante råvarer og produkter» og «Informasjon om status for innføring av EUDR i Norge» ga HTTP 404 ved henting 15.09.2026. Uttak-07 bruker dem som locator. Innholdet om kakao er erstattet av høringsnotatet og regjeringens melding (E8).

**Datoendring for SI-07:** Landbruksdirektoratets side var datert 05.05.2026 i juni og er nå oppdatert 16.07.2026. Innholdet om norsk status er det samme.

## 3. Comext-CSV for kakao

### 3.1 Registrering før denne runden

| Kontrollflate | Registrert? |
|---|---|
| Mottakslogg | Ja, som uttrekk: `uttak-09` F2-3 (API, datasett, filsti og 195 rader) |
| Mottak (`food-tg-casekort-og-research-mottak-2026-06-10.md`) | Nei |
| PCQ | Nei. PCQ-0906-002 (runde 6) pekte på Comext som neste datasteg |
| Source-shortlist | Nei |
| Claim-lock | Nei |
| CoverageProfile | Nei. `public/data/coverage/profiles.json` genereres fra databasen og er ikke en manuell registreringsflate. Ikke gjort. |

Konklusjon: kravet i innsiktssyntesen («mottaksprotokoll for nye kilder … og claim-lock-oppdatering») var ikke oppfylt for CSV-en.

### 3.2 Kontroll av filen

- Fil: `research/external/dro-0906/eurostat-comext-cocoa-nl-be-de-to-nordics-hs1801-1806-2022-2024.csv`, SHA-256 `9ab646357ef4da493ecccc29cd57a4a69696037f58778e9f4d132d6bd62d466d`, 195 datarader.
- Kilde: Eurostat Comext `ds-045409`, eksport (`flow=2`) fra NL, BE og DE til NO, SE, DK og FI, HS 1801–1806, 2022–2024. API-URL står i hver rad.
- Hentet 12.06.2026 (uttak-09). Flettet til main i `910e183` (04.07.2026).
- Etterregnet 15.09.2026: alle tall i avsjekk-02 #3 stemmer eksakt. Det gjelder summen for 2024 (121 038 t og 968,1 MEUR), summene per HS-kapittel for 2022–2024, avsenderne i 2024 (DE 56 634 t, NL 43 901 t, BE 20 502 t), halvfabrikata til Norden (41 355 t) og Norge i 2024 (9 911 t halvfabrikata og 11 281 t sjokolade).
- Stikkprøve mot API 15.09.2026: DE til SE i 2024, HS 1801–1806, gir 170 970 645 EUR i både API og CSV. API-et oppga at datasettet var oppdatert 15.09.2026.

### 3.3 Bruksgrenser

- Tallene er eksport fra EU-land, ikke nordisk importstatistikk, og kan avvike fra SSB.
- Bare tre avsenderland er med. Andre EU-land er ikke med.
- Alle opprinnelser er med. CI-andelen kan ikke leses ut (avsjekk-02 #5).
- HS 1801–1802 er utenfor det norske forslaget, mens HS 1803–1806 er med. Tallene kan derfor ikke summeres til et «EUDR-pliktig volum i Norge».
- Internt tallgrunnlag. Ingen publikasjonsformulering er åpnet.

### 3.4 Registrert nå

Rekkefølgen følger mottaksprotokollen v1.0 og desk-runden 12.06:

1. Mottaksrad `F2-3` i `food-tg-casekort-og-research-mottak-2026-06-10.md`.
2. `SRC-1509-001` i `source-shortlist-food-tg.md`, med rad under manuell sjekk.
3. PCQ runde 12 (`PCQ-0906-002`).
4. Statusdelta og hold-tilbake-rad i claim-lock.
5. Delta i sprintboardet.

Ingen DRR-rad er laget, fordi dette ikke er Deep Research-output. Desk-runden 12.06 brukte også loggen som mottak.

## 4. Rettelsen i casestatus

- Før: «kaffe er innlemmet i den norske EUDR-gjennomføringen». Etter: «kaffe er EØS-relevant og gjennomføring pågår (Landbruksdirektoratet 05.05.2026)». Gjelder `summary` for `kaffe-brasil` i `src/lib/data/casestatus.ts`.
- Rettet i commit `f556778` (18.06.2026). Logget i `research/external/r4/DRO-R4-INDEX-2026-06-18.md` §0 P0a.
- Ikke logget i claim-lock. Tre filer viser den fortsatt som åpen: avsjekk-01 #4, case-avsjekk-indeksen §4 punkt 1 og dybdeauditen §6.1 og §8.
- Logget nå som hold-tilbake-rad i claim-lock. Indeksen er ikke endret, fordi hashen er låst i `knowledge/corpus/corpus-processing-register.v1.jsonl`. Etterslepet står i katalogen del 5.
- Dagens tekst i `casestatus.ts` holder mot Landbruksdirektoratet 16.07.2026. Ingen TS-endring.

## 5. EUDR-ikke-si

Desk-loggen kap. 10 sa at konsolideringen ikke var gjort. Den ble likevel gjort samme dag, i claim-lock-seksjonen «DRR-0906 ikke-si-konsolidering 2026-06-12». EUDR-punktene som alt står der:

- Brasil er lavrisiko under EUDR.
- Côte d'Ivoire er high-risk under EUDR.
- EUDR gjelder fullt for kakao/kaffe i 2025.
- Sertifisering alene beviser EUDR-compliance.

DRR-003 til DRR-008 har ingen EUDR-ikke-si.

Lagt til i claim-lock nå (seksjonen «EUDR-kontrollhull V6-delta 2026-09-15»):

| # | Formulering som holdes tilbake | Kilde |
|---|---|---|
| 1 | Kaffe er innlemmet i den norske EUDR-gjennomføringen. | avsjekk-01 #4; dybdeauditen §6.1 |
| 2 | EUDR gjelder i Norge fra 30.12.2026, eller norsk EUDR-forskrift er vedtatt. | EUDR-treffkartet, ikke-si |
| 3 | Kakaobønner er med i den norske EUDR-gjennomføringen. | EUDR-treffkartet, ikke-si |
| 4 | En aktsomhetserklæring (DDS) beviser sporbarhet for et produkt. | EUDR-treffkartet, ikke-si |
| 5 | Kakaoen i EU-omveien er ivoriansk, eller CI-andelen kan leses av Comext. | avsjekk-02 #3 og #5; uttak-09 F2-3 |
| 6 | EUDR-kilder viser at en kaffeaktør er partner i caset. | DRR-0906-001, ikke-si |

## 6. Hva som fortsatt mangler

- Norsk forskrift, beslutning i EØS-komiteen og norsk dato. Følges hos Landbruksdirektoratet og Miljødirektoratet.
- Kunngjøring i EUT av vedleggsendringen og datoen for nye varer.
- Hvilke HS-posisjoner Freia og Nidar importerer på (uttak-07 §5). Aktørgate.
- CI-andel i EU-omveien og sporbarhet per produkt. Aktørgate (avsjekk-02 #5).
- Prisøkningen på kaffe (+65 %) hviler fortsatt på Comtrade-preview.
- P-KAFFE-2 spørsmål 3 (plikter for norsk kaffeimportør i mellomperioden) er ikke besvart.
- Foreldet tekst i avsjekkene, indeksen, dybdeauditen, treffkartet og `casestatus.ts`. Listet i katalogen del 5.
- Ekstern bruk krever egen claim-lock-rad. Den finnes ikke, og vinkelen er ikke valgt.

## 7. Verifikasjon

- Primærkildene i §2 er hentet 15.09.2026. PDF-er er ikke lagt i Git (kildepolicyen). SHA-256 for filene som ble lest: COM(2026) 191 `5fd195fb985d26abc06d72caaec73fca476bd8d410ef0ce447724b7b264e8355`; høringsnotatet `2f059b7e474f1928202985f1a82bd026b9778b1718a42e910f412f818b9fac64`.
- Sekundærkilder (rådgiver- og bransjesider) er bare brukt til å finne primærkilder, ikke som belegg.
- Comext-CSV-en er etterregnet med skript og stikkprøvet mot API-et (§3.2).
- `git diff --check`, `npm run test` og `npm run audit:research-artifacts -- --base=origin/main` er kjørt for endringene i denne runden.
