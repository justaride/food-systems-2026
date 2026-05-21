---
tittel: "Food TG Actor Outreach v0.1"
status: Utkast internt
eier: Gabriel
dato: 2026-04-28
neste_handling: Velg 3-5 første kontakter, send med tilpasset intro og loggfør svar før claim-status endres.
relaterte_filer:
  - docs/project/mandates/decision-memo-food-tg-scope-v0.2.md
  - docs/project/mandates/food-tg-scope-decision-request-2026-05-21.md
  - docs/project/mandates/food-tg-validation-sprint-log-2026-05.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
---

# Food TG Actor Outreach v0.1

## 1. Bruksregel

Dette er en outreach-pakke for første valideringsrunde. Den dokumenterer ikke ekstern validering. Claim-status skal fortsatt være `Utført internt` til svar er mottatt, loggført og vurdert.

## Sprintstatus 2026-05

Operativ responslogg føres i `food-tg-validation-sprint-log-2026-05.md`. Ingen outreach sendes før JTO/Cathrine/Einar har bekreftet anbefalt scope-beslutning eller minimumsvedtaket i `food-tg-scope-decision-request-2026-05-21.md`.

Når en aktør svarer, loggfør:

| Felt | Krav |
|---|---|
| Kontakt | Navn, rolle, organisasjon, dato og kanal. |
| Svarstatus | Bekreftet, delvis bekreftet, avkreftet, kan ikke deles eller ikke relevant. |
| Bruksrett | Kan siteres, intern bruk, bakgrunn, krever sitatsjekk eller ikke bruk. |
| Datakrav | Definisjon, år, geografi, enhet, kilde, dataeier og frekvens hvis tall brukes. |
| Claim-effekt | Hvilke CL-/EV-IDer påvirkes, og om status fortsatt er intern. |

## 2. Felles intro

```text
Hei [navn],

Vi jobber med et avgrenset kunnskaps- og pilotgrunnlag for en Food Transition Group i Nordic Circular Hotspot / Natural State-sammenheng. Før vi formulerer roadmap eller pilotforslag eksternt, kvalitetssikrer vi noen konkrete påstander med relevante fag- og aktørmiljøer.

Vi ber ikke om konfidensiell informasjon. Det viktigste er å forstå hva som kan brukes som offentlig kildegrunnlag, hva som bare kan brukes som bakgrunn, og hva som må formuleres med tydelige forbehold.

Kunne vi fått en kort samtale på 30 minutter, eller eventuelt skriftlig svar på spørsmålene under?

Vennlig hilsen
Gabriel
```

## 3. P1 - Landbruksdirektoratet / Miljødirektoratet

**Formål:** Avklare EUDR-Norge før `CL-C-011` brukes i decision memo.

**Foreslått emne:** Avklaring av EUDR, soya/fôrråvarer og norsk/EØS-gjennomføring

```text
Hei [navn],

Vi forsøker å formulere EUDR korrekt i et internt beslutningsgrunnlag om sirkulært fôr og importerte fôrråvarer. Vi har sett EU-kommisjonens EUDR-side, Miljødirektoratets høring om gjennomføring i norsk rett, regjeringens høring om endringer og Landbruksdirektoratets FAQ.

Kan dere hjelpe oss å kvalitetssikre disse punktene?

1. Er det riktig å beskrive norsk status per nå som hørings-/gjennomføringsstatus, ikke ferdig norsk rettsstatus?
2. Er det riktig at norsk høringsgrunnlag peker på delvis EØS-innlemmelse, og at ingen varetyper i råvarekategorien soya er foreslått innlemmet i norsk virkeområde?
3. Hvordan bør norske fôr- og soyaaktører forholde seg til EU-kundekrav hvis de eksporterer til eller inngår i EU-verdikjeder?
4. Hvilke varekoder eller produktgrupper er mest relevante for soyabønner, soyamel, soyaolje, SPC og prepared fish feed?
5. Bør SPC og prepared feed behandles som avklart, uavklart eller aktør-/varekodespesifikt under EUDR?
6. Hva er riktig formulering om Traces/DDS/EORI for norske aktører før EØS-innlemmelse er ferdig?
7. Finnes det en offentlig kilde vi bør bruke som primærreferanse i stedet for eller i tillegg til høringssiden/FAQ?
8. Er det noe i denne tematikken som ofte blir feil fremstilt og som vi bør unngå?

Vi ønsker primært en trygg formulering for intern bruk. Hvis noe kan siteres, tar vi gjerne imot ønsket kilde og eventuelt sitatforbehold.
```

**Berører:** `CL-C-011`, `CL-A-020`, `EV-C-017`, `EV-A-021`, `PCQ-C-001`.

## 4. P1 - Denofa / Skretting Norge / Sjømat Norge

**Formål:** Skille SSB/HS-handelsstatistikk, actor-tall og bransjebaseline.

**Foreslått emne:** Kvalitetssjekk av soya-, SPC- og fôrråvaretall til internt Food TG-grunnlag

```text
Hei [navn],

Vi bygger et internt kunnskapsgrunnlag om sirkulært fôr, importavhengighet og råvaresporbarhet. Vi ønsker å unngå at handelsstatistikk, enkeltaktørdata og bransjetall blandes feil.

Kan dere hjelpe oss med å avklare følgende?

1. Hvilke fôr-/råvaretall kan dere dele offentlig eller som bakgrunn for intern analyse?
2. Hvilket år, geografi, enhet og definisjon gjelder tallene?
3. Hvordan bør vi skille soyabønner, soyamel/oljekake, soyaolje, SPC og ferdig fôr?
4. Kan SPC identifiseres i handelsstatistikk, eller krever dette aktør-/bransjemetode?
5. Hvilke råvarer eller produktgrupper er mest relevante for EUDR-/sporbarhetsdiskusjonen?
6. Hvilke krav stiller dere til alternative proteiner: volum, pris, kvalitet, dokumentasjon, LCA, mattrygghet og sporbarhet?
7. Kan Skretting-/Denofa-data brukes som actor-benchmark, og hva må til før noe kan omtales som bransjebilde?
8. Hvilke aktører eller kilder bør vi bruke for å kvalitetssikre bransjenivå?

Vi bruker ikke svar som sitat uten eksplisitt avklaring. Målet er å formulere beslutningsgrunnlaget presist og ikke overtolke tall.
```

**Berører:** `CL-A-020`, `CL-C-011`, `EV-A-017`, `EV-A-018`, `EV-A-019`, `EV-A-021`, `PCQ-A-001` til `PCQ-A-005`.

## 5. P1 - NMBU / Foods of Norway

**Formål:** Avklare modenhet for encelle-/gjærprotein som importsubstitusjonsspor.

**Foreslått emne:** Modenhet for encelle-/gjærprotein i oppdrettsfôr - kvalitetssjekk

```text
Hei [navn],

Vi arbeider med et internt beslutningsgrunnlag for sirkulært fôr og importsubstitusjon i nordiske matsystemer. Foods of Norway/NMBU fremstår som et sentralt fagmiljø for å forstå hva som er teknisk dokumentert, og hva som fortsatt er FoU.

Kan dere hjelpe oss å avklare:

1. Hvilke resultater for metanotroft bakterieprotein, gjærprotein eller annet encelleprotein er robuste nok til å omtales i et roadmap?
2. Hvilke substitusjonsnivåer, forsøksarter og forsøksbetingelser må alltid nevnes?
3. Hva er de viktigste begrensningene: kost, råvaretilgang, LCA, prosess, regulatorisk vei eller fôraktørkrav?
4. Hva bør vi ikke formulere som kommersielt eller pilotklart ennå?
5. Hvilke originalartikler, DOI-er eller rapporter bør vi bruke som primærgrunnlag?
6. Hva er et realistisk første pilot- eller scopingformat for 2026-2027?
7. Hvilke industriaktører bør kobles inn tidlig for å teste krav til volum, pris og dokumentasjon?

Vi ønsker primært å skille teknisk mulighet fra kommersiell modenhet, slik at beslutningsgrunnlaget blir presist.
```

**Berører:** `CL-A-001`, `CL-A-002`, `CL-A-020`, `EV-A-001`, `EV-A-002`.

## 6. P1 - Mattilsynet / fagekspert + okara/BSG-råvareeier

**Formål:** Teste om `CL-B-021` kan bli første praktiske B-pilot.

**Foreslått emne:** Avklaring av okara/bryggerimask som mulig mat- eller ingrediensråvare

```text
Hei [navn],

Vi vurderer om en ren prosess-sidestrøm, for eksempel okara eller bryggerimask, kan være en egnet første pilotkandidat for høyverdiutnyttelse i mat eller ingredienser. Før vi bruker dette som pilotforslag, trenger vi å forstå krav til hygiene, holdbarhet, lovlig sluttbruk og råvaredata.

Kan dere hjelpe oss å avklare:

1. Hvilke data må foreligge før okara eller bryggerimask kan vurderes som mat-/ingrediensråvare?
2. Hvilke krav gjelder for tid/temperatur, tørrstoff/fukt, mikrobiologi, stabilisering og transport?
3. Er fermentert okara eller BSG en Novel Food-/regelverksavklaring, en hygiene-/prosessavklaring eller begge deler?
4. Hvilke dokumentasjonskrav bør en produsent eller ingrediensaktør forvente?
5. Hva er typiske røde flagg som gjør at strømmen bør gå til fôr/biogass i stedet for mat/ingrediens?
6. Hvilke volum-, batch- og kvalitetsdata bør hentes fra råvareeier?
7. Hvilken off-taker eller produkttype bør testes først hvis strømmen viser seg egnet?
8. Kan noe av dette siteres, eller bør svaret brukes kun som intern faglig avklaring?

Vi ønsker ikke å konkludere med pilotklarhet før dette er avklart.
```

**Berører:** `CL-B-009`, `CL-B-014`, `CL-B-021`, `CL-C-015`, `EV-B-018`, `EV-B-019`, `PCQ-B-001` til `PCQ-B-004`.

## 7. P2 - SINTEF/FHF + marin restråstoffaktør

**Formål:** Avklare om marint restråstoff skal være benchmark, sekundærpilot eller actor-learning track.

**Foreslått emne:** Fraksjonsdata og høyverdiavsetning for marint restråstoff

```text
Hei [navn],

Vi bruker SINTEF/FHF Analyse marint restråstoff 2024 som norsk benchmark i et internt grunnlag om sirkulære matressurser. Vi ønsker å unngå å blande råstoffvekt, produktvekt, sluttbruk og høyverdiavsetning feil.

Kan dere hjelpe oss å avklare:

1. Hvilke tall fra 2024-analysen er mest robuste å bruke i et beslutningsgrunnlag?
2. Hvordan bør vi skille råstoffvekt og produktvekt?
3. Hvilke fraksjoner går til humant konsum, fôr, pet food, biogass/energi eller annen bruk?
4. Hvor ligger de største uutnyttede eller lavverdig utnyttede fraksjonene?
5. Hvordan bør K2/dødfisk og andre særfraksjoner behandles i en høyverdi-diskusjon?
6. Hvilke aktører bør vi kontakte for å teste oppgraderingsmuligheter og markedsbarrierer?
7. Bør marint restråstoff forstås som første pilot, sekundær pilot eller benchmark for Food TG?
8. Hvilke tall kan siteres, og hvilke krever tabell-/metodeforbehold?
```

**Berører:** `CL-B-009`, `CL-B-021`, `CL-C-015`, `EV-B-020`, `PCQ-B-005`.

## 8. P2 - Matvett / Too Good To Go / dagligvare eller HORECA

**Formål:** Holde en rask adoption-pilot klar hvis teknisk substratpilot tar for lang tid.

**Foreslått emne:** Matsvinnkvalitet, tidsvinduer og datakrav for mulig adoption-pilot

```text
Hei [navn],

Vi vurderer en lavterskel adoption-pilot om matsvinnkvalitet i butikk/HORECA: hvordan varer kan flyttes opp i kaskaden før de mister redistribusjons- eller høyverdiverdi.

Kan dere hjelpe oss å avklare:

1. Hvor i verdikjeden oppstår de mest beslutningsrelevante kvalitetstapene?
2. Hvilke ferskvarekategorier eller situasjoner er best egnet for en målbar pilot?
3. Hvilke tidsvinduer, pris-/donasjonsrutiner eller data gjør størst forskjell?
4. Hva må måles for å skille forebygging, redistribusjon, fôr/ingredienser og restfraksjon?
5. Hvilke KPI-er kan en aktør faktisk rapportere uten urimelig byrde?
6. Hva vil være et realistisk pilotformat på 6-12 uker?
7. Hvilke data kan deles, og hva må anonymiseres eller brukes kun som bakgrunn?
```

**Berører:** `CL-B-001`, `CL-B-002`, `CL-B-022`, `CL-C-012`, `CL-C-014`, `CL-C-015`.

## 9. Responsloggmal

Bruk denne tabellen når svar kommer inn. Ikke endre claim-status før svaret er vurdert mot kildekrav.

| Dato | Aktør | Kontakt | Kanal | Berører | Svarstatus | Bruksrett | Viktigste funn | Neste handling |
|---|---|---|---|---|---|---|---|---|
| YYYY-MM-DD |  |  | epost/møte | CL-/EV-ID | bekreftet/delvis/avkreftet/kan ikke deles | sitat/intern/bakgrunn/ikke bruk |  |  |

## 10. Masterregel etter respons

Når minst ett P1-svar foreligger:

1. Lag handoff-notat i `docs/project/mandates/analysefabrikk-handoffs/`.
2. Klassifiser hvert funn som `integrer nå`, `needs-primary-check`, `needs-actor-validation` eller `archive/reject`.
3. Oppdater `actor-validation-pack` og `primary-check queue`.
4. Oppdater claim-register bare hvis bruksrett og kildegrunnlag er tydelig.
5. Ikke bruk `Validert eksternt` med mindre svaret eksplisitt bekrefter claimen og kan dokumenteres.
