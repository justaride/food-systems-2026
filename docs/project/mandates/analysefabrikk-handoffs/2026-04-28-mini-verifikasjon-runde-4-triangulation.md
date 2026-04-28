---
tittel: "Mini-verifikasjon runde 4 - triangulering"
status: Utført internt
eier: Mini-verifikasjon / master session
dato: 2026-04-28
canonical_docs_redigert: false
leste_handoffs:
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4a-feed-import-eudr.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4b-okara-bsg-process-sidestreams.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4c-food-waste-cascade-governance.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4d-marine-nutrient-loops.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4e-adoption-governance-market.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4f-opportunity-radar.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-4g-red-team.md
primærsjekk_kort:
  - "EU-kommisjonen EUDR-side lest 2026-04-28: anvendelsesdatoer 30.12.2026 og 30.06.2027."
  - "Regjeringen.no høring 2026-01-09 lest 2026-04-28: soya innlemmes ikke i foreslått norsk virkeområde."
  - "Regjeringen.no 2026-04-17 lest 2026-04-28: Dagligvaretilsynet legges ned og oppgavene flyttes til Konkurransetilsynet fra 30.04.2026."
  - "Lovdata matsvinnloven lest 2026-04-28: ikrafttredelse er 'Kongen bestemmer'."
  - "Mattilsynet insekt-substrat lest 2026-04-28: kjøkken-/matavfall, gjødsel og slam er ikke tillatt som fôr til insekter."
---

# Mini-verifikasjon runde 4 - triangulering

Denne kontrollen vurderer runde-4-underlaget før master-merge og syntese. Den oppdaterer ikke canonical docs.

## 0. Regulatorisk spot-check

Datoavhengige juridiske/regulatoriske funn er kontrollert mot offisielle kilder 2026-04-28. Dette er fortsatt en mini-verifikasjon, ikke juridisk vurdering av konkrete pilotdesign.

| Tema | Offisiell kilde sjekket | Status per 2026-04-28 | Bruk i master |
|---|---|---|---|
| EUDR EU-frister | [EU-kommisjonen, `Regulation on deforestation-free products`](https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en) | EU-kommisjonen oppgir anvendelse 30.12.2026 for store/mellomstore operatører og 30.06.2027 for mikro/små operatører. | Bruk EU-frister; ikke bland med norsk/EØS-status. |
| EUDR norsk høringsstatus | [Regjeringen.no, høring 09.01.2026 om avskogingsforordningen](https://www.regjeringen.no/no/aktuelt/horing-om-avskogingsforordningen-kort-frist/id3145726/) | Høringsgrunnlaget sier at Norge vil innlemme forordningen så langt EØS-forpliktet, og at soya ikke innlemmes i foreslått norsk virkeområde. | Bruk som høringsstatus; endelig EØS-/Lovdata-status er `needs-primary-check`. |
| God handelsskikk-tilsyn | [Regjeringen.no pressemelding 17.04.2026](https://www.regjeringen.no/no/aktuelt/dagligvaretilsynet-legges-ned-og-oppgavene-flyttes-til-konkurransetilsynet-fra-30.-april/id3156506/) og [statsråd 17.04.2026](https://www.regjeringen.no/no/aktuelt/offisielt-fra-statsradet-17.-april-2026/id3156503/) | Oppgaver etter lov om god handelsskikk flyttes fra Dagligvaretilsynet til Konkurransetilsynet fra 30.04.2026. | Bruk organisasjonsdato; ikke bruk som dokumentert håndhevingseffekt. |
| Matsvinnloven | [Lovdata, LOV-2025-06-20-103](https://lovdata.no/LTI/lov/2025-06-20-103) | Lovdata oppgir ikrafttredelse som "Kongen bestemmer". | Ikke skriv at operativ plikt gjelder før ikrafttredelse/forskrift er avklart. |
| Insekt-substrat | [Mattilsynet, `Substrat - fôr til insektene`](https://www.mattilsynet.no/for/insekter-til-bruk-i-for/for-til-insektene) og [regelverksarbeid om fôrsubstrat](https://www.mattilsynet.no/sirkulaerokonomi-og-baerekraftig-for/regelverksarbeid-om-forsubstrat-til-insekter) | Mattilsynet beskriver kjøkken-/matavfall, gjødsel og slam som ikke tillatt fôr til insekter etter dagens regler, samtidig som regelverksarbeid pågår. | Behandle attraktive substrater som legal gate/watchlist, ikke pilotklare. |

## 1. Kontrollresultat

| Kontroll | Resultat | Kommentar |
|---|---|---|
| 1. Er claimene triangulert, eller bare bekreftet av én kildegruppe? | Bestått | 4A-4G skiller primærkilde, fagkilde, actor/case, benchmark og svakhet. 4C kom inn etter første kontrollutkast og er inkludert i endelig vurdering. |
| 2. Er primærkilde, forskning, actor/case, benchmark og hypotese holdt fra hverandre? | Bestått | Særlig 4A og 4D er tydelige på datalag. 4B og 4F bruker svensk benchmark som benchmark, ikke pilotbevis. |
| 3. Er svake claims formulert svakere? | Bestått | 4G gir negativ kontroll. `CL-A-021`, `CL-B-021`, `CL-B-023` og `CL-C-015` holdes som kandidat/gate/hypotese, ikke konklusjon. |
| 4. Har tall definisjon, år, geografi, enhet og kilde? | Bestått med forbehold | 4A og 4D har best tallstruktur. 4B/4C/4E bruker flere benchmark- og actor-tall som må låses med dataeier før ekstern bruk. |
| 5. Er juridiske/regulatoriske funn merket med dato og status? | Bestått | EUDR, Dagligvaretilsynet/Konkurransetilsynet, matsvinnloven og insekt-substrat er datert og statusmerket. |
| 6. Er ingen claims markert `Validert eksternt`? | Bestått | Handoffene bruker intern status, benchmark, needs-primary-check, needs-actor-validation og hypotese. Ingen ekstern validering er dokumentert. |
| 7. Er interessante funn tydelige nok for opportunity radar? | Bestått | 4F gir rangering. 4A/4B/4C/4D/4E gir materialet som begrunner scoren. |

## 2. Handoff-notater

| Dypdykk | Trygt å bruke internt nå | Må holdes tilbake |
|---|---|---|
| 4A A-feed/import/EUDR | SSB 08801 som importbaseline per varekode; Fiskeridirektoratet/Sjømat Norge som total oppdrettsfôrvolum; Denofa/Skretting som actor-/benchmarkdata; EUDR som EU-sporbarhets- og dokumentasjonsdriver. | SPC-total, `210610` som SPC, `23099040` som laksefôr/SPC, Skretting som bransjesnitt, Denofa som total norsk soyaimport, EUDR som direkte norsk soya-plikt. |
| 4B okara/BSG/prosess-sidestrømmer | Okara og BSG som konkrete svenske benchmark; pilotbarhetskriterier for råvareeier, hygiene, stabilisering, logistikk og off-taker; CL-B-009 som designkrav. | Norsk/nordisk totalvolum, food-grade, Novel Food-avklart status, matgrad, pilotklarhet, kommersiell lønnsomhet og KPI-effekt. |
| 4C matsvinn/kaskade | Kaskade som beslutningsmatrise per fraksjon/tidspunkt/lovlig sluttbruk; matsvinnkvalitet i butikk/HORECA som rask adoption-kandidat hvis baseline og driftspartner finnes. | Generell kaskaderetorikk, summerte virkemiddelpotensialer, "måltider reddet" som effektbevis, matsvinnloven som operativ plikt før ikrafttredelse er avklart. |
| 4D marint restråstoff/nutrient loops | SINTEF/FHF 2024 som norsk sjømatbenchmark; marint restråstoff som høyverdi-læring; RecoLab/VEAS/HIAS/DMF som nutrient-loop benchmarks; KPI-systemgrenser. | Høyverdi automatikk fra 89 % utnyttelse, råstoffvekt lik produktvekt, K2/dødfisk som mat-/fôrråvare, VA/næringsstoffløkkene som første lettvekts-pilot. |
| 4E adoption/governance | C som tverrgående gate: lov, kjøper, data, drift, governance; markedsmakt/handelsskikk som adoption-risiko; offentlig innkjøp som avgrenset demand-side testarena. | Bred dagligvarepolitisk analyse, årsaksbevis for konkrete leverandørbarrierer uten aktørdata, effektclaim om flytting til Konkurransetilsynet før praksis foreligger. |
| 4F opportunity radar | Rangering av toppmuligheter: EUDR/sporbarhet, alternative fôrproteiner, okara/BSG, matsvinnkvalitet og markedsmakt/handelsskikk; parkering av insekt/VA/marint som første pilot. | Ekstern opportunity map uten aktørrespons; sumscore som fasit; pilotcommitment, volum, finansiering eller effekt. |
| 4G red-team | Weak-claim-list, kill criteria, counterargument map og repair actions. | Overclaiming av teknisk mulighet, benchmark, policyretning eller datastandard som pilotklarhet. |

## 3. Trygt å integrere i master merge

- Runde 4 styrker beslutningen om **A+B som hovedspor og C som adoption-/governance-/datagate**.
- EUDR/sporbarhet er topp datadriver, men Norge-/EØS-status og varekoder må ligge i primary-check.
- Alternative fôrproteiner er et sterkt A-scoping-spor, ikke kommersielt validert substitusjon.
- Okara/BSG er den mest konkrete tekniske B-kandidaten, men bare som benchmark/kandidat til råvareeier, hygiene og off-taker er avklart.
- Matsvinnkvalitet i butikk/HORECA er beste lavterskel adoption-/fallback-case hvis teknisk B-case ikke modnes raskt.
- Marint restråstoff og nutrient loops gir sterk benchmarklæring, men er for tunge eller for fraksjonsspesifikke som første lettvekts-pilot.
- C-sporet må brukes som go/no-go-gate per pilot: lov, kjøper, data, drift, governance og markedsmakt.
- KPI-er skal være minimumsdata-gate, ikke ekstern effektfortelling.

## 4. Må holdes tilbake

- Ekstern påstand om at EUDR gjelder direkte i Norge for soya.
- SPC-volum eller laksefôrvolum fra `210610`/`23099040` uten SSB/Tolletaten/fôraktørmetode.
- Skretting eller Denofa som nasjonalt bransjesnitt.
- Okara/BSG som pilotklart, matgrade eller Novel Food-avklart.
- Nordisk okara/BSG-total uten produsent-/statistikkgrunnlag.
- Matsvinnlov som operativ plikt før ikrafttredelse/forskrift er avklart.
- Marint restråstoff som første plantebaserte B-pilot.
- RecoLab/VA/næringsstoffløkkene som kopierbar norsk pilot uten N/P/K, produktstatus og regelverk.
- KPI-effekter, målverdier, finansierbarhet eller actor commitment.
- Alle statusløft til `Validert eksternt`.

## 5. Masterrettelser før syntese

1. Normaliser statusord til: `integrer nå`, `needs-primary-check`, `needs-actor-validation`, `benchmark`, `hypotese`, `archive/reject`.
2. Skriv "valideringsprioritering" fremfor "pilotprioritering" der gates ikke er lukket.
3. Bruk absolutte datoer for tidsfølsomme claims: 30.04.2026 for tilsynsflytting, 30.12.2026/30.06.2027 for EUDR EU-frister, og 20.06.2025 + "Kongen bestemmer" for matsvinnloven.
4. Skill råstoffvekt, produktvekt, våtvekt, tørrstoff, N/P/K og omsetning i alle marine/nutrient-loop formuleringer.
5. Ikke oppdater claim-register, evidence-matrix eller source-shortlist før syntesen er kontrollert.

## 6. Avsluttende gate

Runde 4 kan gå til master-merge og `Food TG Research Synthesis v0.1` som internt beslutningsgrunnlag. Den kan ikke brukes til ekstern beslutningskommunikasjon før primary-check og actor-validation er dokumentert med dato, kontakt/rolle, hva som er bekreftet eller avkreftet, og bruksnivå.
