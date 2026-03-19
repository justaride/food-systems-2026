# Plan for aa finne og laste ned flere rapporter

**Dato:** 18. mars 2026  
**Formaal:** Lage en operativ plan for aa utvide dokumentkorpuset med flere nedlastede rapporter, vedtak, aarsrapporter, avhandlinger og andre primarkilder som er direkte relevante for Food Systems 2026.

---

## 1. Utgangspunkt

Kartleggingen av dokumenttilgjengelighet viser allerede et tydelig bilde:

- `research/` har et sterkt lokalt markdown-korpus
- `evidence-pack/` har forelopig bare `34` faktiske kildedokument-PDF-er
- `SourceDoc` har `100` oppfoeringer, men `31` av dem mangler baade lokal fil og URL
- `Report` har `61` oppfoeringer, men bare `11` har `sourceUrl`
- det finnes `59` unike URL-er i typed lag, hvorav `16` peker direkte til PDF

Konklusjonen er at neste steg **ikke** boer vaere tilfeldig videre nedlasting. Det boer vaere en styrt prosess i tre spor:

1. rydde og tette kjente hull i dagens metadata
2. speile aapenbart viktige dokumenter som allerede er identifisert
3. lete systematisk etter nye rapportfamilier i de underdekkede temaene

---

## 2. Maal

Planen boer levere tre ting:

1. en tydelig backlog over dokumenter som boer lastes ned
2. en prioriteringslogikk for hvor vi skal lete etter flere rapporter
3. en enkel workflow for a unngaa duplikater, stoy og "halvkartlagte" kilder

Det operative maalet er ikke flest mulig filer, men et bedre korpus av:

- offisielle rapporter
- konkurranse- og tilsynsdokumenter
- nordiske myndighets- og policyrapporter
- akademiske oppgaver og avhandlinger
- aarsrapporter og selskapsdokumenter
- offentlige kontrakts- og innkjoepsunderlag der de finnes

---

## 3. Prioriteringslogikk

### 3.1 Prioritet 1: Last ned det vi allerede vet finnes

Foer nye brede sok boer vi tette de mest opplagte hullene i dagens register.

Dette inkluderer:

- `Report`-oppfoeringer med `sourceUrl`, men uten tydelig lokal PDF-forankring
- `SourceDoc`-oppfoeringer med URL, men uten lokal fil
- `Thesis`-oppfoeringer med PDF-URL der lokal PDF enten mangler eller ikke er tydelig koblet

Foerste kandidater boer vaere:

- Konkurransetilsynets dagligvarerapport 2024-25
- Marginstudie Del 1
- Marginstudie Del 2
- Prisjeger-saken / offentlig versjon av vedtak
- Utredning om prisjusteringsvinduer
- Nordic Food Markets

Poenget her er ikke bare aa hente nye filer, men aa faa et mer sannferdig forhold mellom:

- URL i metadata
- lokal PDF i `evidence-pack/`
- markdown-oppsummering i `bibliotek/`

### 3.2 Prioritet 2: Utvid de eksisterende sterke sporene

Neste boelge boer hente dokumenter som styrker spor prosjektet allerede bruker aktivt:

- dagligvaretilsyn / konkurransetilsyn
- selvforsyning / beredskap
- nordiske konkurransemyndigheter
- nordiske regulatoriske sammenligninger
- aarsrapporter for sentrale selskaper

Maalet her er aa ga fra "enkeltdokumenter" til mer komplette serier.

Eksempler:

- aarsrapporter 2020-2025 for NorgesGruppen, Coop, Reitan Retail, Kesko, Axfood, Salling
- flere vedtak og analyser fra Konkurransetilsynet, Konkurrensverket, KKV/FCCA og KFST
- nyere nordiske beredskaps- og matsikkerhetsrapporter

### 3.3 Prioritet 3: Let etter dokumenter i de faktiske gapene

De mest naturlige nye dokumentfamiliene aa lete etter er de som allerede er identifisert som underdekkede:

- leverandoermakt og enforcement gap
- eiendomsmakt / internleie / restrictive covenants
- HORECA og offentlig innkjoep
- nordiske entry-failure cases
- alternative distribusjonsmodeller
- buyer power / monopsony

Dette boer vaere et malrettet rapportsok, ikke generell lesing.

---

## 4. Sokkestrategi

### 4.1 Sok etter institusjon, ikke bare tema

Den mest effektive strategien er aa soeke per institusjon og land.

Primare steder aa lete:

- `konkurransetilsynet.no`
- `dagligvaretilsynet.no`
- `regjeringen.no`
- `riksrevisjonen.no`
- `nibio.no`
- `konkurrensverket.se`
- `kkv.fi`
- `kfst.dk`
- relevante universitetsarkiv (`nhh.no`, `openaccess.nhh.no`, `aaltodoc.aalto.fi`, osv.)
- selskapenes IR-/aarsrapportsider

Dette boer kombineres med tematiske query-familier:

- `"dagligvare" + rapport + pdf`
- `"supplier" / "leverandoer" + groceries + report`
- `"restrictive covenant" / "eiendom" / "lease" + grocery + pdf`
- `"public procurement" / "school meals" / "storkjoekken" + Nordic + report`
- `"entry" / Lidl / ICA / Merger + grocery + report`

### 4.2 Bruk et todelt sok

Hvert tema boer ha to sokerunder:

1. **primaerkildesok**
   - myndigheter, universiteter, offisielle kommisjoner, konkurranseorganer

2. **sekundaer suppleringssok**
   - bransjeorganisasjoner, think tanks, NGO-er, analysehus

Primaerkildesok skal alltid komme foerst.

### 4.3 Se etter dokumentserier, ikke enkelttreff

Naar ett dokument er funnet, boer neste sporsmaal alltid vaere:

- finnes det flere utgaver?
- finnes det tidligere aarsrapporter?
- finnes det vedlegg eller arbeidsdokumenter?
- finnes det oppfoelgingsrapporter?
- finnes det parallelle dokumenter i Sverige, Danmark eller Finland?

Dette er ofte der korpus vinner tetthet.

---

## 5. Triage-regler for hva som faktisk boer lastes ned

Et dokument boer lastes ned dersom minst ett av disse kriteriene er oppfylt:

- det er en primaerkilde for et kjerneargument i whitepaperet
- det er en offisiell rapport eller et vedtak med metode, tall eller policykonsekvenser
- det fyller et eksplisitt hull i et underdekket tema
- det er del av en serie som prosjektet allerede bruker
- det er sannsynlig at lenken ikke er stabil over tid og derfor boer speiles lokalt

Et dokument boer normalt **ikke** lastes ned dersom det bare er:

- en pressemelding uten substansielt vedlegg
- en landingsside uten fulltekst
- en dublett av noe vi allerede har lokalt
- et rent meningsinnlegg uten empirisk eller regulatorisk verdi

---

## 6. Arbeidsflyt

### Fase A: Rydd dagens backlog

1. gjennomgaa alle `Report` med `sourceUrl`
2. merk hvilke som allerede er speilet lokalt, selv om filnavnene er ulike
3. last ned de som aapenbart mangler
4. oppdater metadata med lokal sti og kilde-URL

### Fase B: Bygg en nedlastingskoe per tema

Lag en enkel tabell eller CSV med:

- tittel
- institusjon
- land
- tema
- aar
- URL
- direkte PDF eller ikke
- lokal fil finnes / finnes ikke
- prioritet `P1-P3`
- status `ikke vurdert`, `klar for nedlasting`, `nedlastet`, `forkastet`

### Fase C: Kjoer tematiske sokerunder

Foerst:

- tilsyn / konkurranse
- nordisk beredskap / matsikkerhet
- aarsrapporter / selskapsdokumenter

Deretter:

- enforcement gap
- eiendomsmakt
- offentlig innkjoep / HORECA
- entry-failure cases

### Fase D: Etterarbeid

For hvert nedlastet dokument:

1. legg PDF i riktig mappe under `research/evidence-pack/`
2. lag eller oppdater markdown-oppsummering i `bibliotek/` eller `norden/`
3. legg inn eller oppdater `SourceDoc` / `Report` / `Thesis`
4. noter hvis dokumentet boer inn i whitepaper- eller insight-sporet

---

## 7. Foreslaatt mappelogikk for nye nedlastinger

For a holde arkivet ryddig boer nye PDF-er som hovedregel havne i:

- `research/evidence-pack/offentlig/`
- `research/evidence-pack/tilsyn/`
- `research/evidence-pack/nordisk/`
- `research/evidence-pack/akademia/`
- eventuelt nye mapper som:
  - `research/evidence-pack/bransje/`
  - `research/evidence-pack/juridisk/`
  - `research/evidence-pack/arsrapporter/`

Filnavn boer normaliseres til noe stabilt og lesbart:

- `institusjon-tema-aar.pdf`
- eller `forfatter-tittel-aar.pdf`

Det viktigste er at:

- filnavnet ikke bare arver kryptisk URL-struktur
- samme dokument kan kobles tilbake til URL og metadata uten gjetting

---

## 8. Konkret foerste sprint

Den mest naturlige foerste sprinten er en kort, avgrenset "download gap closure"-runde:

1. gaa gjennom alle kjente PDF-URL-er i `Report`, `SourceDoc` og `Thesis`
2. avklar hvilke som allerede finnes lokalt under annet navn
3. last ned de som faktisk mangler
4. oppdater metadata
5. lag en ny statusoversikt: "kjent og speilet" vs. "kjent men ikke speilet"

Naar dette er gjort, boer andre sprint vaere:

1. konkurranse- og tilsynsrapporter 2020-2026
2. aarsrapporter for toppaktorer
3. nordiske offentlige innkjoeps- og HORECA-rapporter

---

## 9. Sluttvurdering

Den riktige planen er ikke aa "se om det finnes mer". Den riktige planen er:

1. rydde dagens kjente dokumentunivers
2. speile de viktigste kildene lokalt
3. utvide systematisk i de temaene som faktisk fortsatt er svake

Hvis denne planen foelges, vil prosjektet raskt gaa fra et godt researcharkiv til et mer robust dokumentarkiv med hoeyere bevisstyrke og mindre kildeusikkerhet.
