---
title: Research-prompts og innsiktsprosesser
status: aktiv
type: arbeidsdokument
created: 2026-04-20
purpose: Operativ fil for neste research-fase og videre innsiktsarbeid i Food Systems 2026
---

# Research-prompts og innsiktsprosesser

Dette dokumentet er ikke et komplett arkiv over alle prompts i prosjektet. Det er en operativ arbeidsfil for neste fase:

1. lukke de viktigste research-gapene
2. destillere kildemateriale til innsikt
3. oversette innsikt til whitepaper, roadmap og pilotspor

Eksisterende raabibliotek ligger fortsatt i `src/lib/data/research-prompts.ts`. Denne fila er laget for faktisk bruk i arbeidsflyten.

## 1. Hvordan bruke denne fila

Bruk denne rekkefolgen:

1. Kjor en research-prompt for aa hente eller strukturere nytt materiale
2. Lagre resultatet i foreslaatt malfil eller tilsvarende mappe
3. Kjor en innsikts-prompt paa det nye materialet
4. Flytt de sterkeste funnene inn i `research/analyse/`, `research/whitepaper/` eller evidence pack

En prompt bor som hovedregel ikke brukes paa for stort scope. Del heller opp etter tema, land eller verdikjedeledd.

## 2. Standard output-kontrakt

Be alltid om dette i output:

1. 5-10 verifiserbare hovedfunn
2. konkrete tall, datoer og navn der det finnes
3. tydelig skille mellom fakta, tolkning og hypotese
4. kildehenvisning per funn
5. hva materialet betyr for Food Systems 2026
6. hva som fortsatt mangler
7. forslag til neste steg

Bruk denne avslutningen i prompts der det passer:

```text
Avslutt med disse seks seksjonene:
1. Hovedfunn
2. Dokumenterte tall og datapunkter
3. Relevans for Food Systems 2026
4. Motstridende funn eller usikkerhet
5. Kritiske gap som gjenstar
6. Anbefalt neste research-steg
```

## 3. Prioriterte research-prompts

Disse er valgt fordi de matcher gapene som fortsatt ser svake ut i `prompt-dekning-og-neste-perplexity-fase-2026-03-18.md` og `arbeidsanalyse-verdikjede-sirkularitet-2026-04-13.md`.

### 3.1 Finansiering og calls 2026-2027

**Foreslaatt output-fil:** `research/bibliotek/offentlig/funding-and-calls-2026.md`

```text
Kartlegg alle relevante finansieringsmuligheter for Food Systems 2026 i perioden 2026-2027, med fokus paa nordiske, europeiske og norske spor som kan finansiere videre arbeid etter roadmapen.

Inkluder:
1. Nordic Innovation, NordForsk, Nordic Council of Ministers, Interreg, Horizon Europe, EIT Food, Innovation Fund, Forskningsraadet, Innovasjon Norge, SIVA, regionale utviklingsmidler og private stiftelser der de er relevante
2. Calls, programmer eller ordninger som kan passe for:
   - matsystemomstilling
   - sirkulaer biookonomi
   - matsvinn
   - alternativt protein
   - offentlig innkjop og pilotering
   - data, digitalisering og sporbarhet i matsystemer
3. For hver mulighet:
   - navn paa ordning/call
   - utlyser
   - land/geografi
   - estimert stoerrelse
   - frister eller forventet tidsvindu
   - krav til konsortium
   - hvilke typer prosjekter som faktisk passer
   - hvorfor den er relevant for Food Systems 2026
4. Marker hvilke calls som er:
   - umiddelbart relevante
   - strategisk relevante senere
   - lite relevante

Ikke lag en generisk funding-liste. Prioriter kun ordninger som realistisk kan brukes til neste fase av dette prosjektet.

Avslutt med:
1. en prioritert topp-10-liste
2. forslag til hvilke partnere som bor med i et konsortium
3. forslag til 3 ulike finansieringsstrategier:
   - liten videreforing
   - mellomstor pilotfase
   - stoerre nordisk skalering
```

### 3.2 Leverandormakt og enforcement gap

**Foreslaatt output-fil:** `research/bibliotek/bransje/leverandorperspektiv-enforcement-gap-2026.md`

```text
Undersok hvordan leverandormakt, fryktkultur og svakt handhevet regulering faktisk arter seg i norsk og nordisk dagligvare, med fokus paa forskjellen mellom formell regulering og praktisk enforcement.

Inkluder:
1. norske kilder om Lov om god handelsskikk, Dagligvaretilsynet, samarbeidsklima, frykt for represalier, listing/delisting, joint marketing fees og forhandlingsmakt
2. nordiske sammenligninger der tilsvarende problemer eller loesninger er dokumentert
3. konkrete case, sitater, rapportfunn eller intervjureferanser som viser hvordan leverandorer opplever maktforholdet
4. eksempler paa hva som ikke fanges opp av dagens handhevingsregime
5. vurdering av om problemet primart er:
   - svakt lovverk
   - svak haandheving
   - svak varsling
   - strukturell avhengighet mellom leverandor og kjede

For hvert hovedfunn:
   - angi kilde
   - angi om funnet er dokumentert, indikativt eller omstridt
   - angi relevans for norsk whitepaper-argumentasjon

Lag til slutt:
1. en kort konfliktmatrise mellom lovverk, praksis og faktisk maktutovelse
2. 5 policyimplikasjoner
3. 3 spissede hypoteser som bor testes videre
```

### 3.3 Eiendomsmakt, internleie og strukturelle barrierer

**Foreslaatt output-fil:** `research/norden/eiendomsmakt-dagligvare-2026.md`

```text
Kartlegg hvordan eiendom, internleie, sale-leaseback, servitutter og kontroll over handelslokasjoner brukes som strukturell makt i dagligvaremarkedet i Norge og gjerne sammenlignbart i Norden.

Undersok:
1. hvilke eiendomsselskaper eller holdingsstrukturer som er knyttet til de store dagligvaregrupperingene
2. om det finnes dokumentasjon paa internleie eller verdioverforing mellom driftsselskap og eiendomsselskap
3. hvordan kontroll over tomter, leiekontrakter og etableringshindringer paavirker konkurransen
4. om tilsvarende mekanismer er dokumentert i Sverige, Danmark eller Finland
5. om det finnes akademiske eller regulatoriske kilder som forklarer retail-eiendom som markedsmakt

Skill tydelig mellom:
   - dokumentert fakta
   - plausibel strukturfortolkning
   - uverifiserte hypoteser

Avslutt med:
1. en modell over hvordan eiendomsmakt kan virke i praksis
2. hvilke datakilder som ma til for aa teste hypotesen hardere
3. 5 presise sporsmal til videre research eller intervjuer
```

### 3.4 HORECA, offentlige maaltider og innkjopsmakt

**Foreslaatt output-fil:** `research/norden/horeca-og-offentlig-innkjop-2026.md`

```text
Lag en nordisk analyse av HORECA, offentlige maaltider og institusjonelle innkjop som del av matsystemet, med fokus paa volum, grossistledd, kontraktlogikk og mulige transition-levers.

Inkluder:
1. restaurant, kantine, skolemat, sykehusmat, offentlige maaltider og storkjokken der det finnes data
2. grossister og mellomledd som leverer til HORECA og offentlige kunder
3. offentlig innkjopsmakt som verktøy for mer sirkulaere og resiliente matsystemer
4. nordiske forskjeller i skolemat, innkjopskrav, oekologikrav, ernaring og lokale verdikjeder
5. case som Kobenhavns offentlige maaltider, svenske/finske skolematordninger og norske barrierer

Lag outputen som:
1. markedsoversikt
2. policy- og innkjopsoversikt
3. aktorkart
4. mulige leverage points for Food Systems Transition Group

Avslutt med:
1. 5 konkrete pilotmuligheter
2. 5 policygrep
3. hvilke aktorer som bor inviteres inn i neste fase
```

### 3.5 Nordiske entry-failure cases

**Foreslaatt output-fil:** `research/norden/entry-failure-cases-2026.md`

```text
Kartlegg nordiske case der nye dagligvareaktorer, distribusjonsmodeller eller utfordrere har mislyktes, trukket seg ut eller blitt presset ut av markedet.

Se spesielt etter:
1. Lidl i Norge
2. ICA i Norge
3. Mat.se, Mathem eller andre nordiske nettdagligvarecase
4. mindre kjeder eller regionale utfordrere som ikke skalerte
5. alternative distribusjonsmodeller som strandet

For hvert case:
   - hva aktoren forsokte aa gjøre
   - hvilket marked de gikk inn i
   - hva som var den uttalte eller sannsynlige hovedarsaken til at det mislyktes
   - hvilken rolle pris, logistikk, eiendom, regulering, markedskonsentrasjon, forbrukeratferd og kapital spilte
   - hva caset sier om barrierer i nordiske matsystemer

Lag til slutt:
1. en typologi over entry barriers
2. et kort notat om hva som ma til for at en ny modell faktisk skal lykkes
3. hvilke barrierer som er mest relevante for Food Systems 2026 sitt pilotspor
```

### 3.6 Medienarrativer og partipolitiske posisjoner

**Foreslaatt output-fil:** `research/bibliotek/media/food-systems-media-timeline-2026.md`

```text
Kartlegg hvordan matsystem, dagligvaremakt, matpriser, selvforsyning, beredskap, matsvinn og sirkularitet er blitt framstilt i norske medier og partipolitikken i perioden 2020-2026.

Inkluder:
1. de viktigste medienarrativene
2. store triggeroyeblikk, saker eller debatt-topper
3. hvordan ulike partier og sentrale politikere posisjonerer seg
4. hvilke tema som er underkommunisert eller systematisk mangler i offentligheten
5. hvilke begreper og frames som faktisk ser ut til aa feste seg

Skill mellom:
   - medienarrativ
   - politisk posisjon
   - ekspert-/fagmiljo-posisjon

Avslutt med:
1. en kort tidslinje 2020-2026
2. 5 dominerende narrativer
3. 5 narrativer som burde styrkes i whitepaper/roadmap
4. forslag til hvilke budskap som kan fungere i et offentlig event
```

### 3.7 Pilotbenchmarks og transition levers

**Foreslaatt output-fil:** `research/evidence-pack/pilot-benchmarks-2026.md`

```text
Finn nordiske og internasjonale pilotcase som kan brukes som benchmark for Food Systems Transition Group, med fokus paa tiltak som faktisk har flyttet praksis, policy eller kapital.

Inkluder case innen:
1. matsvinnreduksjon
2. alternativt protein
3. sidestraum-valorisering
4. offentlig innkjop og maaltidssystemer
5. regenerative innkjops- eller produksjonsmodeller
6. alternative distribusjonsmodeller

For hvert case:
   - hva tiltaket faktisk var
   - hvem som eide eller drev det
   - hvilken geografi og skala det hadde
   - hvilke resultater som er dokumentert
   - hvilke barrierer som oppstod
   - hva som gjor caset overforbart eller ikke overforbart til nordisk kontekst

Avslutt med:
1. en shortlist paa 10 benchmark-case
2. 3-5 pilottyper Food Systems 2026 bor vurdere
3. vurdering av hva som er lavthengende frukt versus langsiktig strukturgrep
```

### 3.8 REKO og alternative distribusjonskanaler

**Foreslaatt output-fil:** `research/norden/reko-and-alternative-channels-2026.md`

```text
Kartlegg alternative distribusjonskanaler i Norden som utfordrer eller komplementerer tradisjonell dagligvare, med fokus paa REKO-ringer, direktesalg, abonnementsmodeller, kooperative modeller og digitale spesialkanaler.

Undersok:
1. hvor utbredt modellene er i Norge, Sverige, Danmark og Finland
2. hvilke produkter og produsenter de fungerer best for
3. om de skaper bedre marginer, mer lokal verdiskaping eller sterkere resiliens
4. hvilke logistiske og regulatoriske barrierer de moter
5. om de kan fungere som realistiske pilotspor eller bare nisjeeksempler

Avslutt med:
1. en sammenligning mellom tradisjonell kjedelogikk og alternative kanaler
2. hvilke modeller som virker mest modne
3. hvilke modeller som kan kobles til transition group-arbeidet
```

## 4. Prompts for videre innsiktsprosesser

Disse brukes etter at ny research er hentet inn, eller naar flere eksisterende filer skal destilleres til sterkere analyse.

### 4.1 Kildetriagering til evidensnotat

**Foreslaatt output-fil:** `research/analyse/evidensnotat-[tema].md`

```text
Les gjennom materialet nedenfor og destiller det til et stramt evidensnotat for Food Systems 2026.

Materiale:
[lim inn filnavn, noter eller tekstutdrag]

Lag et notat med disse delene:
1. hva materialet faktisk dokumenterer
2. hvilke datapunkter som er mest brukbare
3. hvilke paastander som er sterke nok til whitepaper-bruk
4. hvilke paastander som er interessante men fortsatt for svake
5. hva dette endrer i vaar forstaelse av temaet
6. hva som bor undersokes videre

Skill eksplisitt mellom:
   - dokumentert funn
   - analysetolkning
   - arbeids-hypotese
```

### 4.2 Konfliktmatrise for motstridende funn

**Foreslaatt output-fil:** `research/analyse/konfliktmatrise-[tema].md`

```text
Sammenlign disse kildene og lag en konfliktmatrise for temaet.

Kilder:
[lim inn kilder]

For hver kilde:
1. hva den hevder
2. hvilke data eller metoder den bygger paa
3. hva som er sammenlignbart og ikke sammenlignbart
4. om uenigheten skyldes definisjon, tidsperiode, geografi, metode eller interesseposisjon

Avslutt med:
1. hva vi med rimelig sikkerhet kan si
2. hva vi ikke bor si ennå
3. hvilke formuleringer som er trygge aa bruke i whitepaper
```

### 4.3 Innsiktsdestillering paa tvers av kilder

**Foreslaatt output-fil:** `research/analyse/innsiktsnotat-[tema].md`

```text
Les disse kildene som ett samlet materiale og trekk ut de viktigste innsiktene for Food Systems 2026.

Jeg vil ikke ha en refererende oppsummering. Jeg vil ha:
1. de 5-8 viktigste innsiktene
2. hvorfor de betyr noe strukturelt
3. hvilke aktorer som berores
4. hvilke handlingsvinduer de peker mot
5. hvilke deler av whitepaper eller roadmap de horer hjemme i

For hver innsikt:
   - skriv en setning med kjernetesen
   - skriv 2-4 setninger som forklarer mekanismen
   - list sentrale kilder
   - marker om innsikten er:
     - systemisk
     - politisk
     - regulatorisk
     - kommersiell
     - operativ
```

### 4.4 Fra innsikt til transition levers

**Foreslaatt output-fil:** `research/analyse/transition-levers-[tema].md`

```text
Basert paa dette materialet, identifiser hvilke transition levers som faktisk finnes.

Materiale:
[lim inn innsiktsnotat eller kilder]

Lag output i fem deler:
1. problemstruktur
2. hvem som holder dagens system paa plass
3. hvilke mekanismer som kan flyttes
4. hvilke aktorer som kan utloese endring
5. hvilke levers som er realistiske paa 6, 18 og 36 maander

Hver lever skal beskrives med:
   - hva som ma endres
   - hvem som ma gjøre det
   - hvorfor det er realistisk eller urealistisk
   - hva slags evidens som stotter at dette kan virke
```

### 4.5 Fra innsikt til pilotspor

**Foreslaatt output-fil:** `research/analyse/pilotspor-[tema].md`

```text
Bruk dette materialet til aa utvikle 3-5 konkrete pilotspor for Food Systems 2026.

For hver pilot:
1. hva problemet er
2. hva intervensjonen er
3. hvem eier pilotsporene
4. hvilke partnere som ma med
5. hva som ma testes
6. hvilke resultater som kan maales
7. hvilke barrierer som kan stoppe piloten

Pilotene skal ikke vaere generiske. De skal vaere plausible i nordisk kontekst og kunne diskuteres i en roadmap eller workshop.
```

### 4.6 Whitepaper-oversettelse

**Foreslaatt output-fil:** `research/whitepaper/section-[tema]-draft.md`

```text
Oversett dette materialet til et whitepaper-utkast for Food Systems 2026.

Krav:
1. skriv analytisk, ikke journalistisk
2. bruk tydelige teser
3. bygg avsnittene rundt dokumenterte datapunkter
4. forklar hvorfor dette er viktig for nordisk matsystemomstilling
5. avslutt med implikasjoner, ikke bare observasjoner

Struktur:
1. hovedtese
2. evidens
3. hvorfor dette er et systemproblem
4. implikasjon for policy, marked eller pilotering
5. hva dette betyr for roadmap
```

### 4.7 Claim audit for sterke paastander

**Foreslaatt output-fil:** `research/analyse/claim-audit-[tema].md`

```text
Test om disse paastandene faktisk holder.

Paastander:
[lim inn 5-10 paastander]

For hver paastand:
1. er den direkte dokumentert, indirekte stoettet eller spekulativ
2. hvilke kilder stotter den
3. hvilke kilder svekker eller kompliserer den
4. hvilken formulering er presis nok til publisering
5. hva ma verifiseres foer den kan brukes offentlig

Maalet er ikke aa bekrefte alt, men aa skjerpe spraket og redusere hallusinerte eller overstrakte konklusjoner.
```

### 4.8 Neste-steg generator

**Foreslaatt output-fil:** `research/analyse/neste-steg-[tema].md`

```text
Basert paa materialet nedenfor: lag en presis neste-steg-plan for research, analyse og mobilisering.

Materiale:
[lim inn innsiktsnotat, conflict matrix eller whitepaper-utkast]

Lag tre lister:
1. hva som bor undersokes videre
2. hvem som bor kontaktes
3. hva som kan skrives eller besluttes allerede naa

Prioriter med:
   - hoy effekt / lav innsats
   - hoy effekt / hoy innsats
   - lav effekt / lav innsats

Avslutt med en anbefalt arbeidsrekkefolge for de neste to ukene.
```

## 5. Anbefalt arbeidssekvens akkurat naa

Hvis maalet er aa bruke denne fila med en gang, er dette den beste rekkefolgen:

1. `Finansiering og calls 2026-2027`
2. `Leverandormakt og enforcement gap`
3. `Eiendomsmakt, internleie og strukturelle barrierer`
4. `HORECA, offentlige maaltider og innkjopsmakt`
5. `Pilotbenchmarks og transition levers`

Deretter:

1. kjor `Innsiktsdestillering paa tvers av kilder`
2. kjor `Fra innsikt til transition levers`
3. kjor `Fra innsikt til pilotspor`
4. kjor `Whitepaper-oversettelse`
5. avslutt med `Claim audit for sterke paastander`

## 6. Praktisk note

Denne fila er ment som arbeidslag mellom:

1. det brede promptbiblioteket i appen
2. research-filene i `research/`
3. analyse- og whitepaper-arbeidet

Hvis denne viser seg aa fungere godt, kan neste steg vaere aa splitte den i:

1. `research-prompts-gap-lukking.md`
2. `innsiktsprosesser-og-syntese.md`
3. `roadmap-og-pilotprompts.md`
