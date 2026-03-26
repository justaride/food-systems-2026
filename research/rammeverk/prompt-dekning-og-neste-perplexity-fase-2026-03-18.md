# Promptdekning og neste Perplexity-fase

**Dato:** 18. mars 2026  
**Formål:** Vurdere om eksisterende promptbibliotek fortsatt fyller en aktiv funksjon, eller om deler av det nå er dekket av innhentet materiale og kan tas ut av den operative køen.

---

## 1. Kjernevurdering

Prosjektet har nå **betydelig bedre dekning enn promptbiblioteket reflekterer**. Flere av de viktigste promptfamiliene er allerede kjørt eller dekket gjennom:

- `research/perpl-17-03/`
- `research/norden/`
- `research/regulatory/`
- `research/interviews/`
- `research/bibliotek/`

Konklusjonen er derfor:

- **Ja:** flere prompts kan tas ut av den **aktive** researchkøen.
- **Nei:** de bør ikke slettes blindt fra `src/lib/data/research-prompts.ts` ennå, fordi den fila i praksis fungerer som et **råbibliotek / browsing-taksonomi** for appen.
- Operativt bør vi heller skille mellom:
  - **arkiverte / dekkede prompts**
  - **delvis dekkede prompts som må splittes eller omskrives**
  - **nye gap-prompts for neste Perplexity-bølge**

---

## 2. Promptfamilier som kan tas ut av aktiv kø

| Promptfamilie | Opprinnelige prompts | Nåværende dekning | Anbefaling |
|---|---|---|---|
| Nordisk markedsstruktur | `nordisk-en-market-structure` | `research/norden/nordisk-markedsstruktur-data-2026.md`, `research/perpl-17-03/Nordisk Dagligvaremarked  Markedsstruktur og Validering 2024–2026.md` | Ta ut av aktiv kø |
| Norske og nordiske avhandlinger | `forskning-no-masteroppgaver` | `research/perpl-17-03/Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026).md`, `research/bibliotek/akademia/nordic-theses-bibliography.md`, `research/bibliotek/akademia/masteroppgaver/` | Ta ut av aktiv kø |
| Offentlige rapporter / policygrunnlag | `offentlig-no-nouer`, `offentlig-no-riksrevisjonen`, `offentlig-no-meldinger`, deler av `offentlig-no-konkurransetilsynet` | `research/bibliotek/offentlig-rapportlogg-prioritert.md`, `research/perpl-17-03/Prioritert masterlogg  Offentlige rapporter om matsystemer, dagligvaremakt, selvforsyning og matsikkerhet (2010–2026).md`, `research/norden/nordisk-offentlig-kildemappe.md` | Ta ut av aktiv kø |
| Nordisk regulatorikk / UTP | `reg-en-eu-utp`, store deler av `reg-en-competition-law` | `research/regulatory/nordic-regulatorisk-sammenligning-2026.md`, `research/norden/regulatory-policy-landscape-nordic.md` | Ta ut av aktiv kø |
| Selvforsyning og beredskap | `nordisk-en-self-sufficiency`, `matsikkerhet-no-selvforsyning`, `matsikkerhet-no-finsk-modell` | `research/norden/nordisk-selvforsyning-beredskap-2026.md`, `research/bibliotek/beredskap/finsk-modell-hvk.md`, `research/bibliotek/beredskap/nibio-selvforsyning-metode.md` | Ta ut av aktiv kø |
| Food deserts / lokal HHI-metodikk | `forskning-en-hhi-grocery` | `research/norden/food-access-hhi-metodikk.md`, `research/perpl-17-03/Food Access, Food Deserts og Lokal HHI  Metoder, Kilder og Datasett for Nordisk og Komparativ Analyse.md` | Ta ut av aktiv kø |
| Aktørkart | `interessenter-no-aktorkart` | `research/interviews/aktorkart-systematisk-2026.md`, `research/interviews/nordisk-aktorkart-perplexity-2026.md`, `research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md` | Ta ut av aktiv kø |
| Sjømatfôr / globale råvarekjeder | nytt A09-spor, deler av verdikjede-sporet | `research/perpl-17-03/Råvareopprinnelse og globale sårbarheter i nordisk sjømatfôr.md` | Ta ut av aktiv kø |
| Operativ sirkularitetsdefinisjon | `matsvinn-en-circular` | `research/perpl-17-03/Circular Food Systems – Rammeverk, Definisjoner og Operativt Kriteriesett.md`, `research/bibliotek/sirkularitet/sirkulaer-definisjoner-wur-emf.md` | Ta ut av aktiv kø |
| ASKO som infrastruktursystem | `logistikk-no-asko` | `research/bibliotek/bransje/logistikk/asko-infrastruktur-2025.md`, `research/norge/nordstad-tesen.md`, `research/norden/verdikjede/03-distribusjon-logistikk.md` | Ta ut av aktiv kø |

---

## 3. Promptfamilier som er delvis dekket og bør omskrives

Disse bør **ikke** kjøres igjen i bred originalform. De bør heller splittes i smalere, mer bevisorienterte Perplexity-søk.

| Promptfamilie | Opprinnelige prompts | Hva vi har | Hva som mangler |
|---|---|---|---|
| Leverandørmakt / enforcement gap | `naering-no-leverandor`, deler av `reg-no-handelsskikk` | `research/bibliotek/dagligvaretilsynet/samarbeidsklima-2025.md`, `research/bibliotek/bransje/organisasjoner/dlf-leverandør-2025.md`, regulatoriske docs | Flere konkrete case, sitater, nordisk sammenligning av håndheving i praksis |
| Eiendomsmakt / internleie | nytt A05-spor | `research/bibliotek/juridisk/eiendomsmakt-lokal-konkurranse.md`, thesis-spor om restriktive klausuler | Konsernstruktur, eiendomsenheter, internleie, sale-leaseback, nordisk sammenligning |
| HORECA / offentlig innkjøp | nytt A06-spor | `research/norden/verdikjede/05-horeca.md`, deler av nordisk aktørkart, enkelte oppgaver om offentlige måltider | Dedikert nordisk oversikt over grossister, volum, kontraktcatering, anbud og skole-/institusjonsmat |
| Årsrapporter / markedsdata 2020-2026 | `naering-no-arsrapporter`, deler av `naering-no-dagligvarerapporten` | Flere enkeltdokumenter og kildehenvisninger | En samlet tidsserie og syntese på tvers av kjedene |
| Buyer power / monopsony-litteratur | `forskning-en-buyer-power` | Spredte kilder i bibliotek og whitepaper | Dedikert litteraturnotat med metode og overførbarhet til Norden |
| EMV / private labels / innovasjon | deler av `naering-no-leverandor`, relaterte avhandlinger | EMV-rapport, flere oppgaver, bransjedokumenter | Samlet nordisk syntese om EMV, innovasjon og leverandørmakt |
| Selvforsyningsmetodikk som komparativ debatt | `matsikkerhet-en-frameworks` og metodebiter i `nordisk-en-self-sufficiency` | Sterk dekning for Norge/Finland og nordiske hovedtall | Ren metodefil som forklarer hva som faktisk er sammenlignbart på tvers av land |
| Matsvinnmåling / valorisering | `matsvinn-no-data`, `matsvinn-en-measurement` | `research/bibliotek/sirkularitet/matsvinn-2024.md`, `research/norden/verdikjede/06-matsvinn-sirkulaer.md`, sirkularitetsrapporten | Sammenlignbar nordisk målemetodikk og tydelig skille mellom forebygging, redistribusjon og valorisering |
| Nordic academic groups | `interessenter-en-academic` | Mange miljøer er allerede identifisert i nordisk aktørkart | Trenger kun en komprimert eksport hvis dette skal brukes til outreach |
| Digital grocery / last mile | `logistikk-en-digital` | Oda-spor, enkelte nordiske avhandlinger og aktørnotater | En strukturert nordisk markedsanalyse av e-grocery, dark stores og logistisk makt |

---

## 4. Promptfamilier som fortsatt er svake og bør være neste Perplexity-bølge

Dette er de områdene der ny Perplexity-bruk sannsynligvis gir mest merverdi utover dagens corpus.

| Ny prioritet | Tema | Hvorfor nå |
|---|---|---|
| P1 | Finansiering, calls og videre løp | Vi har fortsatt ikke en faktisk funding-matrise for 2026-2027 |
| P2 | Offentlige kontrakter, innkjøp og storkjøkken | Underdekket, men svært relevant for transition- og policysporet |
| P3 | Leverandørmakt og enforcement gap | Kritisk for whitepaperets maktspor, men fortsatt for svakt dokumentert i caseform |
| P4 | Eiendomsmakt og internleie | Hypotesen er viktig, men evidensgrunnlaget er ennå tynt |
| P5 | Nordiske entry-failure cases | Vi har enkeltdeler, men ikke en samlet nordisk caselogikk |
| P6 | Medienarrativer og partipolitiske posisjoner | Trengs for offentlig/politisk framing, men mangler som samlet oversikt |
| P7 | Pilotbenchmarks / transition levers | Viktig for neste fase etter diagnosearbeidet |
| P8 | Alternative distribusjonsmodeller | REKO, offentlige distribusjonsspor og andre utfordrere er fortsatt lite kartlagt |

---

## 5. Anbefalt neste Perplexity-prosess

Neste fase bør **ikke** være en ny bred litteraturinnhenting. Den bør være en smal, sekvensiert gap-lukking.

### Fase 1: Kritiske hull

1. **Finansiering 2026-2027**
   Lag målfil: `research/bibliotek/offentlig/funding-and-calls-2026.md`

2. **Leverandørmakt og enforcement gap**
   Lag målfil: `research/bibliotek/bransje/leverandorperspektiv-enforcement-gap-2026.md`

3. **Eiendomsmakt og internleie**
   Lag målfil: `research/norden/eiendomsmakt-dagligvare-2026.md`

4. **HORECA, offentlige måltider og storkjøkken**
   Lag målfil: `research/norden/horeca-og-offentlig-innkjop-2026.md`

### Fase 2: Struktur og anvendelse

5. **Entry-failure cases i Norden**
   Lag målfil: `research/norden/entry-failure-cases-2026.md`

6. **Medietidslinje og partipolitisk posisjonering**
   Lag målfil: `research/bibliotek/media/food-systems-media-timeline-2026.md`

7. **Pilotbenchmarks / transition levers**
   Lag målfil: `research/evidence-pack/pilot-benchmarks-2026.md`

8. **Alternative distribusjonsmodeller**
   Lag målfil: `research/norden/reko-and-alternative-channels-2026.md`

---

## 6. Praktisk beslutning

**Det som bør fjernes nå:**  
Fra den **operative** promptkøen bør de dekkede promptfamiliene i seksjon 2 behandles som ferdige.

**Det som ikke bør fjernes ennå:**  
`src/lib/data/research-prompts.ts` bør foreløpig stå som arkiv/taksonomi, siden appen ikke har et eksplisitt felt for `status`, `coverage` eller `archived`.

**Neste oppryddingssteg hvis ønskelig:**  
Legg inn et faktisk statusfelt i promptmodellen (`aktiv`, `arkivert`, `delvis`, `erstattet`) og la UI-et vise bare aktive prompts.
