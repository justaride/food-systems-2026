---
tittel: Port E event-go uke 25
status: Intern beslutnings- og produksjonspakke
eier: Gabriel
dato: 2026-06-15
opprettet: 2026-06-11
scope: Gjør Port E for offentlig online event beslutningsklar for JT/Einar/Thea uten å åpne ekstern publisering.
bruksregel: ikke ekstern publisering. Dette er intern go/no-go, produksjonsramme og stoppliste før event, roadmap v0.1 eller publiseringsmodus kan brukes utad.
relaterte_filer:
  - docs/project/plans/FOOD-TG-UTVIKLINGSPLAN-2026-06-10.md
  - docs/project/status/jt-statusnotat-uke-25-2026-06-15.md
  - docs/project/mandates/jt-beslutningssaker-uke-25-2026-06-15.md
  - docs/project/mandates/jt-deck-v0.1-uke-25-2026-06-15.md
  - docs/project/status/jt-uke25-sendepakke-2026-06-15.md
  - docs/project/status/food-tg-start-her-2026-06-15.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
---

# Port E event-go uke 25

Port E avgjør om Food TG kan forplikte seg til offentlig online event som del av H1/H2-løpet mot kontraktsfristen 31.07.2026. Dette dokumentet åpner ikke eventet, ekstern invitasjon eller publiseringsmodus. Det gjør bare beslutningen og produksjonsløypen klar for JT/Einar/Thea.

## 1. Beslutning som må tas

| Felt | Anbefalt go | Alternativ / fallback |
|---|---|---|
| Eventtype | Webinar 60-90 min som offentlig online event. | kort innspilt presentasjon + publisert oppsummering. |
| Tidspunkt | Uke 29 eller uke 30. | Uke 30 som reserve hvis uke 29 ikke tåler produksjonsrisiko. |
| Vertskap | NCH. | NCH + JT/Einar som tydelig programforankring. |
| Deltakere | JT/Einar, Gabriel og Thea. | Thea kan eie kommunikasjon uten å eie faglig claim-validering. |
| Språk | Norsk som base; engelsk/nordisk hvis målgruppen krever det. | Samme trygg språkbank uansett språk. |
| Ekstern flate | Ingen før Port F. | Publiseringsmodus åpnes først etter separat Port F og citable_external-filter. |

**Go-formulering:** JT/Einar godkjenner at Food TG planlegger offentlig online event i uke 29 eller uke 30, med NCH som vertskap, Thea aktivert i uke 25 og Q&A-stoppliste som bindende sikkerhetsramme.

## 2. Produksjonsløype

| Uke | Handling | Ferdigkriterium | Stoppregel |
|---|---|---|---|
| Uke 25 | Port E-vedtak, Thea-aktivering og eventeier avklart. | Dato/format/vertskap valgt; Thea vet om kapasitet og rolle. | Ikke send påmelding eller save-the-date før vedtak. |
| Uke 26 | Innholdsramme, trygg språkbank og Q&A-stoppliste ferdigstilles. | Eventmanus skiller citable_external fra intern_context og blocked_unsourced. | Ingen umodne case løftes for å fylle programmet. |
| Uke 27 | Påmelding, deck v0.1, opptak-plan og modereringsplan klargjøres. | Påmeldingstekst og slide-manus bruker claim-lock og stoppspråk. | Ikke åpne ekstern flate før Port F er besluttet. |
| Uke 28 | generalprøve, operatorsekvens og claim-lock-sjekk. | Operatorsekvens er kjørt etter stack-merge/deploy; røde claims er parkert. | Eventet konverteres til fallback hvis kontrollgrunnlaget ikke er klart. |
| Uke 29 | Første eventvindu. | Event kan gjennomføres med godkjent manus og Q&A-ramme. | Ingen spontan claim-utvidelse i live Q&A. |
| Uke 30 | Reservevindu. | Samme ferdigkriterier som uke 29. | Hvis reserve også ryker, bruk fallback-format. |
| Uke 31 | Etterbruk inn i roadmap v0.1. | Spørsmål, opptak og oppsummering brukes bare der kildestatus tillater det. | Publisert oppsummering krever Port F. |

## 3. Innholdsramme

Eventet skal forklare H1/H2-løpet, ikke late som at H2-valideringen allerede er gjort. Trygg ramme:

- Hvorfor Food TG går fra researcharkiv til styrt roadmap v0.1.
- Hvordan de syv caseankrene brukes som valideringsspor, ikke som ferdige eksterne claims.
- Hva vi vet og ikke vet om fôr/import, restråstoff, matsvinnkvalitet, okara/BSG, adoption, spillvarme og relasjonscase.
- Hvordan claim-lock, PCQ, source-shortlist, citable_external-filter og operatorsekvens hindrer overclaiming.
- Hva som skal være klart før H1-fristen 31.07.2026, og hva som bevisst flyttes til H2.

## 4. Q&A-stoppliste

| Tema | Trygg språkbank | Ikke si |
|---|---|---|
| Brasil/kaffe | Kaffe/Brasil er et mulig relasjonscase som krever DASK-0906-001, dokumenteier og bruksrett før det kan løftes. | ikke MOU-claim, ikke partnerrolle og ikke partsliste uten dokument. |
| Elfenbenskysten/kakao | Kakao-sporet er under dokumentask og kan bare omtales som hypotese til intern avklaring. | Ikke relasjon, organisasjonsnavn eller programclaim uten kilde. |
| Valio/Finland | Valio kan brukes som soyafri governance-case med datagap på fôrstandard, fôrkurv og importandel. | ikke importfritt fôr og ikke full nordisk modell uten primærgrunnlag. |
| 100% Fish | 100% Fish kan brukes som benchmark og designkrav for ressursutnyttelse. | ikke norsk pilotbevis og ikke bevis for faktisk 100 prosent utnyttelse. |
| Distribusjon/adoption | Distribusjon behandles som adoption-gate og krever aktørvalidering. | Ikke BAMA-, margin- eller blokkering-claim uten actor validation. |
| Tall og gates | Bruk bare tall som har fersk operatorsekvens og riktig citable-status. | Ikke bruk gamle gate- eller strict-source-tall som ekstern faktastemme. |

## 5. Gates før utsending

1. JT/Einar har tatt Port E-vedtak, og Thea har bekreftet kapasitet eller avgrensning.
2. Eventtekst, deck og møtecopy bruker trygg språkbank.
3. Alle claims er kontrollert mot claim-lock og relevante casekort.
4. Operatorsekvens er kjørt etter stack-merge/deploy og før eventtekst brukes eksternt.
5. Citable-status er datert; røde eller uklare punkter er parkert.
6. Port F er tatt separat før publiseringsmodus, påmelding, opptak eller offentlig oppsummering åpnes.

## 6. Fallback-format

Hvis kapasitet, kontrollgrunnlag eller timing ikke tåler webinar, brukes fallback:

- Kort innspilt presentasjon + publisert oppsummering.
- Ingen live Q&A.
- Samme claim-lock, citable_external-filter og Q&A-stoppliste gjelder.
- Ingen publiseringsmodus før Port F.
- Roadmap v0.1 holdes fortsatt som uke 31-etterbruk, men uten live-eventavhengighet.

Fallback er ikke nederlag; det er lavere eksponeringsrisiko hvis uke 29/30 ikke kan produseres trygt.

## 7. Beslutningslogg etter Port E

| Felt | Vedtak | Dato | Eier | Loggsted |
|---|---|---|---|---|
| Eventformat | Avventer JT/Einar |  | JT/Einar | `decision-log-food-tg.md` |
| Uke/dato | Avventer JT/Einar/Thea |  | Thea/Gabriel | `decision-log-food-tg.md` |
| Vertskap | Avventer JT/Einar/NCH |  | JT/Einar | `decision-log-food-tg.md` |
| Port F-behov | Avventer etter operatorsekvens |  | Gabriel | `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` |
