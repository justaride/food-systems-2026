---
tittel: JT deck v0.1 uke 25
status: Slide-manus og redigerbar PPTX v0.1
eier: Gabriel
dato: 2026-06-15
scope: Intern beslutningsdeck for JT/Einar/Thea-forankring i uke 25. Ikke ekstern presentasjon.
bruksregel: Kun sikker språkbank og intern modenhetsstatus. Ingen uvaliderte aktørclaims, MOU-claims, importfritt-fôr-claims eller norsk pilotbevis fra benchmarks.
relaterte_filer:
  - docs/project/mandates/food-tg-deck-outline-2026-06-09.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/status/jt-statusnotat-uke-25-2026-06-15.md
  - docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md
  - docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.pptx
---

# JT deck v0.1 uke 25

Redigerbar PPTX v0.1 ligger i `docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.pptx`.

PPTX-en er intern beslutningsdeck basert på dette manuset. Den skal ikke brukes eksternt før PR #159 er merget/deployet og operatorsekvensen er re-kjørt.

## Designpremiss for senere PPTX

- Format: 10 slides, intern beslutningsdeck.
- Visuell rytme: styringsfortelling, ikke ekstern kampanje.
- Hver slide skal ha: claim, proof object og tydelig statusord.
- Statusord: `intern baseline`, `deckklart internt`, `needs-primary-check`, `needs-actor-validation`, `benchmark-only`, `watchlist`.
- Fotnoter skal vise kildefil/kontrollfil, ikke lange sitater.

## Slide 1 - Hvorfor Food må snevres inn

**Claim:** Food TG må gå fra "hele matsystemet" til få verdikjedeanker for å rekke en trygg H1-leveranse innen 31.07.

**Proof object:** Todelt boks:
- Venstre: bredt materiale, mange kilder, mange mulige case.
- Høyre: 7 caseanker, claim-lock, DASK/AASK og H1-roadmap v0.1.

**Speaker note:** Poenget er ikke å redusere ambisjonen, men å få en beslutningsbar leveranse. 09.06-samtalen peker på at risikoen nå er at alt blir like viktig.

**Status:** Intern styringssyntese.

## Slide 2 - A+B/C er fortsatt arbeidsrammen

**Claim:** Nye case erstatter ikke mai-scope; de sorteres inn i A fôr/import, B sidestrøm/matsvinn og C adoption/marked.

**Proof object:** Enkel tredelt ramme:
- A: fôr/import/protein og beredskap.
- B: sidestrøm, restråstoff, matsvinnkvalitet og høyverdi.
- C: distribusjon, innkjøp, aktørport og adoption.

**Speaker note:** A og B viser hva som kan gi sirkularitet; C forklarer hvorfor løsninger skalerer eller stopper.

**Status:** Intern baseline via claim-lock og casekort.

## Slide 3 - Syv caseanker for første leveranse

**Claim:** Vi har nok til å velge et smalt caseunivers, men ikke til å behandle alle case som like modne.

**Proof object:** Case maturity matrix.

| Case | Status | Bruk nå |
|---|---|---|
| Brasil/kaffe | needs-primary-check | Import-/EUDR-hypotese; relasjonscase avventer MOU. |
| Elfenbenskysten/kakao | needs-primary-check | Sporbarhetshypotese; relasjon avventer dokument. |
| Valio/Finland | deckklart internt, smalt | Soyafri governance, ikke importfritt fôr. |
| Distribusjon/adoption | deckklart internt, bredt | C-gate, ikke BAMA-anklage. |
| Spillvarme/Hima | delvis | Hima internt med datagap; radar for andre case. |
| 100% Fish | benchmark-only | Designkrav for restråstoff, ikke norsk pilotbevis. |
| Skottland/Polen | watchlist/benchmark-kandidat | Skottland etter fulltekst; Polen kill-test. |

**Status:** Sprintboard 10.06.

## Slide 4 - Modeneste A-spor: fôr/import

**Claim:** Fôr/import er fortsatt det sterkeste A-sporet fordi det kobler importavhengighet, fôrråvarer, beredskap og aktørdata.

**Proof object:** Mini-flow: importert råvare -> fôrledd -> produksjon -> beredskap/klima/adoption.

**Speaker note:** Bruk handels- og fôrdata som kontrollspor, ikke som ferdig bransjefasit. Brasil/kaffe kan kobles til import/EUDR hvis dokumentgrunnlaget holder, men MOU-/relasjonsclaim er lukket inntil DASK svarer.

**Status:** Intern baseline + DASK.

## Slide 5 - Høyverdi restråstoff: 100% Fish som benchmark

**Claim:** 100% Fish er nyttig som benchmark for designkrav, men kan ikke brukes som norsk pilotbevis.

**Proof object:** Firetrinns kaskade:
1. Total utnyttelse.
2. Human konsum.
3. Høyverdi ingrediens/produkt.
4. Norsk overførbarhet.

**Speaker note:** Denne sliden skal tvinge frem presisjon: utnyttet er ikke det samme som høyverdiutnyttet.

**Status:** Benchmark-only; norsk fraksjons-/høyverdidata mangler.

## Slide 6 - Praktiske B-løp: matsvinnkvalitet og prosess-sidestrømmer

**Claim:** De mest praktiske B-løpene handler om å flytte råvarer opp før kvaliteten faller og å finne rene sidestrømmer med off-taker.

**Proof object:** To kolonner:
- Matsvinnkvalitet: tidsvindu, kjølekjede, sortering, mottaker.
- Prosess-sidestrøm: råvareeier, hygiene, volum, sluttbruker, økonomi.

**Speaker note:** Ikke mål effekten bare i "reddede måltider". Vi trenger kvalitet, avsetning og økonomi.

**Status:** Intern formulering; krever partnerbaseline før ekstern bruk.

## Slide 7 - C-gate: distribusjon og adoption

**Claim:** C-gate bestemmer hvilke A/B-løsninger som faktisk kan tas i bruk.

**Proof object:** Adoption-gate med fem porter:
- Kjøper/off-taker.
- Markedsadgang.
- Kaldkjede/logistikk.
- Volum og sesong.
- Juridisk/omdømme-sikker formulering.

**Speaker note:** Bruk "distribusjon/adoption-gate for norsk frukt og grønt" som trygg arbeidstittel. Ikke bruk BAMA-spesifikke blokkering- eller marginclaims.

**Status:** Deckklart internt, needs-actor-validation.

## Slide 8 - Nye relasjonscase: kaffe og kakao

**Claim:** Kaffe og kakao kan bli gode import-/EUDR-case, men relasjonsclaims må vente på dokument.

**Proof object:** DASK-boks:
- DASK-0906-001: Brasil/kaffe MOU, partsliste, scope, bruksrett.
- DASK-0906-002: Elfenbenskysten/kakao, organisasjon, dokument, scope.

**Speaker note:** Hvis dokumentene ikke finnes, parkeres relasjonsclaimet. Da kan sporet eventuelt leve videre som import-/EUDR-kildecase.

**Status:** Needs-primary-check.

## Slide 9 - Valio og spillvarme som smale exploratory løp

**Claim:** Valio og spillvarme er nyttige som læringscase hvis vi holder dem smale.

**Proof object:** To kort:
- Valio: soyafri governance, fôrkurv/importandel mangler.
- Hima/spillvarme: operativ intern case med datagap; andre case i radar.

**Speaker note:** Ikke si "importfritt fôr" om Valio. Ikke si nasjonalt TWh-potensial om spillvarme. Begge kan brukes til å vise hvordan vi behandler datagap ærlig.

**Status:** Valio deckklart internt, smalt; spillvarme delvis.

## Slide 10 - Beslutninger og neste 14 dager

**Claim:** Neste steg er ikke mer bred research, men fire beslutninger som lar H1-leveransen bevege seg.

**Proof object:** Beslutningsliste:
1. Minimumsvedtak casekort.
2. H1/H2-todeling.
3. Port E event-go.
4. DASK-0906-001/002 sendes internt.

**Speaker note:** Møtet skal ende med beslutninger, ikke bare orientering. Hvis vi får vedtakene, kan deck, DASK, eventramme og roadmap v0.1 bevege seg samme uke.

**Status:** Klar til JT-møte uke 25.

## Trygg språkbank i decket

| Tema | Bruk |
|---|---|
| Overordnet | Food TG prioriterer nå få verdikjedeanker der eksisterende kunnskap, systembarrierer og mulige relasjoner kan testes. |
| Nye case | Kaffe, kakao, spillvarme og Valio behandles som 09.06-hypoteser med mottatt researchgrunnlag, men relasjon, data og bruksrett må fortsatt låses før faktastemme. |
| Benchmark | Benchmark betyr læring og designkrav, ikke bevis for norsk gjennomføring. |
| Validering | Neste fase er primærkilde- og aktørvalidering, ikke ekstern publisering. |

## Ikke-si-liste

- Ikke si at MOU-er finnes for Brasil/kaffe eller Elfenbenskysten/kakao.
- Ikke si at Valio er importfritt.
- Ikke si at BAMA blokkerer løsninger.
- Ikke si at 100% Fish beviser norsk pilot.
- Ikke si at spillvarme har et bestemt nasjonalt potensial.
- Ikke bruk gamle operatorgate-tall i ekstern kontekst før Fase B er kjørt.
