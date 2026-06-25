---
tittel: R12-FARM-002 - Aktørgate per-kg-margin
status: Batch 02 actor-gate brief - ikke claim
id: R12-FARM-002
priority: P0
theme: farm-economy
geo: NO
gate: actor-gate
accessedAt: 2026-06-24
sourceClass: B/C
---

# R12-FARM-002 - Aktørgate per-kg-margin

## Kort dom

Per-kg-margin etter kjøperprisavtale i kjøtt og meieri er ikke desk-researchbar som ferdig claim. Åpne aktørkilder viser hvordan pris og avregning bygges opp, men produsentens faktiske margin krever gårdsnivå kostnader, leveringsvilkår, kvalitets-/volumtillegg, trekk, etterbetaling, frakt, rådgivnings-/tankkostnader og avtalevilkår.

Dette skal derfor ikke inn i PCQ som tallclaim. Riktig output er aktørgate/AASK: spesifiser hvilke data som må inn fra produsent, kjøper eller samvirke før per-kg-margin kan beregnes.

## Sterkeste kilde

- TINE Medlem, "Slik er melkeprisen bygd opp".
- Nortura Medlem, "Priser og leveringsvilkår for gris".
- Nortura Medlem, "Priser og leveringsvilkår for fjørfe".
- Nortura Medlem, "Leveringsvilkår".

## Svakeste punkt

Aktørkildene viser prislogikk og enkelte gjeldende priser/tillegg, men ikke faktisk margin per produsent eller produksjon. For fjørfe er kontrakter særlig sentrale; for melk er basispris, kvalitet, tørrstoff, prissoner, omsetningsavgift og etterbetaling separate komponenter.

## Datakrav før beregning

| Produksjon | Minimum data fra aktør | År/periode | Kildeklasse | Gate | Caveat |
|---|---|---|---|---|---|
| Melk | Produsentavregning per måned: liter, basispris, fett/protein/kvalitet, sone, trekk/tillegg, omsetningsavgift, etterbetaling | Samme regnskapsår | B/C til mottatt | actor-gate | TINE forklarer prisoppbygging, men gårdens faktiske avregning er privat. |
| Storfe/småfe | Slakteoppgjør per dyr/parti: kg, klasse, fettgruppe, tillegg/trekk, transport/frakt, omsetningsavgift, eventuell nisje/retur | Slakteuke/år | B/C til mottatt | actor-gate | Offentlige prisnoteringer er ikke faktisk margin. |
| Gris | Avregningspris, kjøttprosent, smågris-/slaktegrisrolle, tillegg/trekk, fôrkost, helse-/SPF-status og kontrakt | Slakteuke/år | B/C til mottatt | actor-gate | Nortura viser at priser påvirkes av engrospris, slaktekostnader og avgifter. |
| Fjørfe | Kontrakt, innsett, fôrleveranse, avregningspris, dødelighet, kvalitet, kvantumstillegg og produksjonskost | Innsett/år | C til aktørdata | actor-gate | Nortura oppgir at fjørfekjøtt reguleres gjennom egne leveringsavtaler. |
| Meieri/kjøtt sammenlikning | Harmonisert enhet: kr per liter melk, kr per kg slakt, kr per kg spiselig vare eller kr per kg levende vekt | Definert | C til metodevalg | forstaelse/actor-gate | Enheten avgjør resultatet og kan ikke velges etter ønsket funn. |

## Tomme celler

- Faktisk produsentavregning er ikke offentlig for enkeltbruk.
- Kontrakter og kjøperprisavtaler er ikke åpne i full tekst.
- Gårdens kostnader per kg/liter, særlig fôr, arbeid, kapital, energi og gjeld, må kobles til samme periode.
- Etterbetaling og bonuser kan flytte margin mellom måneder og år.
- Sammenlikning mellom samvirke og private kjøpere krever like definisjoner av pris, kostnad og risiko.

## Ikke-si

- Ikke si per-kg-margin basert bare på engrospris eller målpris/PGE.
- Ikke si at åpen avregningspris er bondens netto margin.
- Ikke bland melk liter, slaktevekt, levendevekt og spiselig kg.
- Ikke bruk Nortura/TINE generelle prislogikk som bevis for én gårds økonomi.
- Ikke gjør samvirkestruktur til intensjonspåstand.

## Anbefalt gate

Actor-gate. Parker tallclaim og importer bare datakrav/AASK. Neste steg må være innhenting eller anonymisert mal for produsentavregning, slakteoppgjør og kostnadsgrunnlag før noe kan gå til PCQ eller claim-lock.
