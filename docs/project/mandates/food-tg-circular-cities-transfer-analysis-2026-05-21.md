# Food TG - laering fra Circular Cities 2026

**Status:** Intern overfoeringsanalyse
**Dato:** 2026-05-21
**Food-status:** Scope er ikke formelt bekreftet. Ingen anbefaling i dette dokumentet loefter claims til eksternt validert.
**Kildeprosjekt:** `/Users/gabrielfreeman/Documents/Circular Cities 2026`
**Verifisert i Circular Cities:** `npm run validate:data -- --strict` passerte, og `npm test` passerte med 21 testfiler og 233 tester.
**Ikke gjort i denne runden:** `npm run lint`, `npm run build` og fysisk browser-QA av Circular Cities. Circular-checkouten hadde eksisterende ucommittede endringer i sektor-siden og tilhoerende test-/hjelpefiler; de ble ikke endret.

## Kort konklusjon

Circular Cities er mer modent enn Food Systems paa ett viktig punkt: prosjektet har et tydelig kontrollag mellom kunnskapsbasen og whitepaper-/plattformflater. Det er ikke bare "mer research"; det er et system for aa styre hva som kan skrives, hva som bare er intern syntese, hvilke figurer som kan tolkes hvordan, og hvilke claims som maa vente paa bekreftelse.

Food Systems har allerede en sterkere og mer eksplisitt claim/evidence-ledger enn mange prosjekter, med `citationReadiness`, `externalUse`, `blockedReason`, `claim-register` og `evidence-matrix`. Gapet ligger derfor ikke foerst og fremst i datamengde. Gapet ligger i publikasjons- og modellstyring: Food mangler en like tydelig whitepaper-/insight-pack-struktur med kapittelstatus, claim-lock for ferdig tekst, figurnoter, case-til-claim-indeks og leserreise-QA.

Anbefalingen er aa kopiere Circular Cities sin arbeidsform, ikke innholdet: bygg et Food-spesifikt kontrollag foer det skrives ekstern decision pack, whitepaper, deck eller roadmap.

## Hva Circular Cities faktisk har bygget

| Omraade | Observasjon | Relevans for Food |
|---|---|---|
| Whitepaper-arkitektur | `white-paper-structure.ts` og `white-paper-chapters.ts` beskriver 11 kapitler + executive summary, status, caveats og visualiseringsplan. | Food boer ha en tilsvarende struktur for insight pack / whitepaper / decision pack, med status per seksjon. |
| Claim-lock | `white-paper-claim-lock-table-2026-05-19.md` skiller `klar`, `klar-med-forbehold`, `krever-bekreftelse` og `maa-harmoniseres`. | Food har claim-register, men trenger et manus-/publikasjonsnivt claim-lock som sier hva som kan staa i ferdig tekst. |
| Kildeproveniens | `sourcepath-no-path-audit-2026-05-19.md` skiller kildeposter med og uten faktisk path, og sier hvilke no-path-typer som er farlige. | Food boer lage en tilsvarende "source locator risk audit" for claims som skal inn i ekstern pakke, saerlig A-feed/EUDR, B-sidestroemmer og C-governance. |
| Modell- og figurnoter | `white-paper-figure-note-audit-2026-05-19.md` definerer hva hver modell viser og ikke viser. | Food trenger samme disiplin for graf, verdikjede, sirkularitet, forsyningskjede, eierskap og eventuelle KPI-/flow-figurer. |
| Case-til-claim | Circular har case-/claim-indekser og transferability-audits som hindrer at cases blir overbevis. | Food boer ha en pilot-/case-til-claim-indeks for A1 encelle-/gjaerprotein, A/B insektprotein, B1 okara/BSG, B2 matsvinnkvalitet, marint restraastoff og nutrient loops. |
| Stoppspraak | Circular markerer eksplisitt at Stage-2, city commitments og partnerstatus ikke kan skrives som fakta uten bekreftelse. | Food maa beholde samme regel: ingen pilotklarhet, aktorcommitment, volum, effekt eller finansiering uten dokumentert respons. |
| Reader journey | Circular bruker `/hvitbok`, `/bibliotek`, `/kilder`, `/metodikk`, `/materiale` og case-sider som kontrollerte leserflater. | Food boer QA-e `/innsikt`, `/selskap`, `/graf`, `/sirkularitet`, `/forsyningskjede`, `/verdikjede` og mandat-/rapportflater foer ekstern bruk. |

## Kvalitativ vurdering av Circular Cities

Circular Cities har en bred og dyp kunnskapsbase som er god nok til aa skrive videre paa et whitepaper, men ikke til aa slippe alle claims i endelig faktastemme. Prosjektet er modent fordi det har bygget inn sperrer mot overclaiming.

Sterkeste sider:

- Det finnes et sammenhengende whitepaper-narrativ med kapittelstruktur, casegrunnlag, metodegrunnlag, modeller og appflater.
- Datavalidering og testdekning er aktivt brukt som kvalitetsporter.
- Modellene er behandlet som analytiske figurer med eksplisitte begrensninger, ikke som automatisk bevis.
- High-risk claims er identifisert og holdt tilbake.
- Prosjektet har tydelig skille mellom intern syntese, kildebelagt tekst, caveated tekst og claims som krever bekreftelse.

Svakheter og risikopunkter:

- Flere bærende claims i whitepaperet krever fortsatt bekreftelse eller harmonisering.
- Noen kildeposter mangler path/proveniens, særlig der material- eller tallclaims kan bli overtolket.
- Figurer og modeller er modne som arbeidsmodeller, men ikke automatisk publikasjonssikre.
- Norsk sammendrag er ikke like låst som engelsk manus.
- Denne gjennomgangen verifiserte ikke lint, build eller fysisk browserflate.
- Checkouten har pågående ucommittede endringer som maa avklares separat foer Circular brukes som helt ren referanse.

## Hva Food boer hente ut

Food Systems trenger ikke foerst og fremst mer bredde akkurat naa. Prosjektet trenger en bedre bro mellom kunnskapsbase, beslutningsgrunnlag og ekstern tekst. Circular Cities viser seks konkrete grep som Food boer ta inn:

1. Lag en Food-spesifikk whitepaper-/decision-pack-struktur med seksjoner, status, caveats, visualiseringer og stop-regler.
2. Lag en claim-lock-tabell som er smalere enn `claim-register-food-tg.md`, og som bare handler om claims som skal kunne staa i deck, whitepaper, rapport eller nettside.
3. Lag en figurnote-/modellnote-audit for alle Food-flater som kan leses som bevis.
4. Lag en case-til-claim-indeks som sier hva hvert benchmark eller pilotkandidat faktisk kan og ikke kan underbygge.
5. Lag en source-locator-risk-audit for high-risk tall og regulatoriske claims.
6. Kjoer reader journey-QA paa de synlige appflatene foer ekstern presentasjon.

## Prioritert arbeidsprogram for Food

| Prioritet | Arbeidspakke | Kan starte uten scope-vedtak? | Output | Hvorfor |
|---:|---|---|---|---|
| 1 | Food claim-lock table | Ja | `food-tg-claim-lock-table-2026-05.md` | Oversetter claim-register til faktisk publiserbar tekstkontroll. |
| 2 | Figure/model note audit | Ja | `food-tg-figure-model-note-audit-2026-05.md` | Hindrer at grafer, verdikjede- og sirkularitetsflater tolkes som sterkere evidens enn de er. |
| 3 | Case/pilot-to-claim index | Ja, som intern hypotese | `food-tg-case-to-claim-index-2026-05.md` | Skiller benchmark, hypotese, pilotkandidat og effektbevis. |
| 4 | Source locator risk audit | Ja | `food-tg-source-locator-risk-audit-2026-05.md` | Sikrer at high-risk claims har kilde, locator, aar, geografi, definisjon og caveat. |
| 5 | Decision-pack / whitepaper structure | Ja | `food-tg-whitepaper-structure-v0.1.md` eller TS-datafil senere | Gir kapittel-/seksjonsstatus og styrer hva som kan skrives. |
| 6 | Reader journey QA | Ja, men ikke ekstern lansering | `food-tg-reader-journey-qa-2026-05.md` | Tester om appflatene faktisk kommuniserer samme statusdisiplin som dokumentene. |
| 7 | Aktorvalidering og outreach | Bare etter minimumsvedtak | Oppdatert sprintlogg og responsnotater | Her trengs scope- eller minimumsvedtak foer utsending. |
| 8 | Pilotbriefs, finance note, roadmap | Etter valideringssvar | Pilotbriefs, finance note, roadmap | Maa ikke skrives som forpliktet eller pilotklar foer respons finnes. |

## Foreslaatt Food-kontrollag

### 1. Claim-lock table

Dette blir Food sin direkte parallell til Circular Cities sin claim-lock. Den skal ikke erstatte `claim-register-food-tg.md`; den skal vaere et smalere publikasjonsfilter.

Minimumsfelter:

| Felt | Beskrivelse |
|---|---|
| Claim-ID | Kobles til `claim-register-food-tg.md`. |
| Foreslaatt publikasjonstekst | Setningen slik den kan staa i deck/rapport. |
| Status | `klar`, `klar-med-forbehold`, `krever-bekreftelse`, `maa-harmoniseres`, `hold-tilbake`. |
| Kildeanker | EV-/SRC-ID, locator, dato, geografi, definisjon. |
| Caveat | Hva som alltid maa sies sammen med claimet. |
| Ikke si | Formuleringer som vil overdrive claimet. |
| Neste port | Primary-check, actor-validation, juridisk gate, dataeier eller scope-vedtak. |

Foerste claims som boer inn:

- `CL-C-011` EUDR, soya og norsk/EU-scope.
- `CL-A-020` encelle-/gjaerprotein og fôrimport.
- `CL-A-021` insektprotein og lovlige substrater.
- `CL-B-014` og `CL-B-021` okara/BSG som kandidatstroem.
- `CL-B-022` matsvinnkvalitet som adoption-case.
- `CL-C-015` KPI-/datagate.

### 2. Figure/model note audit

Food trenger et dokument som sier hva hver synlige modell eller graf viser, hva den ikke viser, og hvilken claimtype den kan stoette.

Foerste flater/modeller:

| Flate/modell | Risiko | Note som maa inn |
|---|---|---|
| Graf/nettverk | Kan leses som evidens for relasjoner eller aktorforankring. | Grafen er navigasjon/struktur, ikke bekreftet aktorcommitment. |
| Verdikjede | Kan leses som komplett flyt eller volumkart. | Viser analysemodell og datalag, ikke full materialbalanse. |
| Forsyningskjede | Kan blande HS-import, actor-data og fôrbruk. | Skill handelsstatistikk, oppdrettsfôrvolum, actor-data og compliance-scope. |
| Sirkularitet | Kan bli effektfortelling. | Viser kandidatmekanismer og gates, ikke dokumentert effekt. |
| Selskap/eierskap | Kan overtolkes som partnerstatus. | Viser aktorlandskap, ikke validering eller forpliktelse. |
| KPI/score | Kan leses som resultat. | KPI-er er datagate inntil dataeier, definisjon, frekvens og baseline er bekreftet. |

### 3. Case/pilot-to-claim index

Food maa skille tydelig mellom case som laering, case som benchmark, case som pilotkandidat og case som faktisk evidens.

Foerste indeksrader:

| Case/kandidat | Kan underbygge | Kan ikke underbygge ennå | Gate |
|---|---|---|---|
| NMBU/Foods of Norway encelle-/gjaerprotein | Teknisk relevans og FoU-spor. | Kommersiell modenhet, kost, LCA, regulatorisk aksept eller pilotvolum. | FoU-/fôraktorvalidering. |
| Insektprotein paa lovlige sidestrømmer | Integrert A/B-kandidat etter juridisk substratgate. | Bruk av matavfall, slam, gjødsel eller blandede avfallsstrømmer. | Mattilsynet/EU/EØS og actor-kapasitet. |
| Okara/BSG | Konkret prosess-sidestrøm med hygiene-/stabiliseringskrav. | Norsk/nordisk pilotklarhet, volum, food-grade og off-taker. | Råvareeier, fagekspert, logistikk, kjøper. |
| Matsvinnkvalitet butikk/HORECA | Rask adoption-kandidat hvis baseline og driftspartner finnes. | Effekt uten kontrafaktisk, rutinedata og partnerdata. | Matvett/TGTG/driftsaktor/dataeier. |
| Marint restraastoff | Norsk høyverdi-benchmark. | Første lettvekts-pilot for Food TG uten fraksjons- og actoravklaring. | Sjømataktor, FHF/SINTEF, off-taker. |
| RecoLab/nutrient loops | Benchmark for N/P/K, governance og infrastruktur. | Kopierbar norsk pilot eller sammenlignbar KPI uten systemgrenser. | Massebalanse, regelverk, infrastrukturpartner. |

### 4. Source locator risk audit

Food har god readiness-logikk, men trenger en praktisk publikasjonssjekk for high-risk claims.

Audit-kategorier:

- `locator-ok`: kilde, side/tabell/celle/URL, dato, aar, geografi og definisjon finnes.
- `locator-ok-med-forbehold`: kilde finnes, men metode, geografi eller scope maa forklares.
- `intern-syntese`: strukturerer analyse, men kan ikke vaere eneste kilde.
- `aktor-data`: kan brukes som benchmark/actor-data, ikke som bransjesnitt.
- `regulatorisk-tidsfoelsom`: maa sjekkes mot gjeldende rett/status foer ekstern bruk.
- `hold-tilbake`: mangler kilde eller blander datalag.

Foerste high-risk grupper:

- SSB 08801, `210610`, `23099040`, soyabønner, soyaolje, soyamel og fiskefôr.
- EUDR EU-scope, norsk/EØS-status og norsk forskriftsstatus.
- Denofa/Skretting/BioMar som actor-data kontra bransjesnitt.
- Matsvinnlov, ikrafttredelse, forskrift og operativ plikt.
- Okara/BSG, matgrad, Novel Food, hygiene, volum og off-taker.
- Matsvinnkvalitet, baseline, kontrafaktisk, "måltider reddet" og effekt.
- N/P/K, biogass, digestat og nutrient-loop KPI-er.

### 5. Whitepaper-/decision-pack structure

Food boer velge ett primært kunnskapsprodukt foer ekstern tekst skrives. Basert paa eksisterende dokumenter er beste format trolig ikke et langt akademisk whitepaper foerst, men en kontrollert decision pack som senere kan bli whitepaper.

Foreslaatt struktur:

| Seksjon | Status per 2026-05-21 | Kontrollbehov |
|---|---|---|
| Executive summary | Kan skrives som kontrollert intern draft. | Maa ha claim-lock foer ekstern bruk. |
| Hvorfor Food TG | Sterkt mandatgrunnlag. | Scope-vedtak maa avklares. |
| Spor A: fôr/import | Sterk scoping, flere primary-kilder. | Actor-data, SPC/metode og regulatorisk status maa holdes adskilt. |
| Spor B: sidestrømmer/matsvinn | Sterke benchmark og designkrav. | Råvareeier, hygiene, volum, off-taker og baseline mangler. |
| Spor C: adoption/governance | Sterk som gate. | Ikke utvid til bred policyrapport; knytt til A/B-kandidater. |
| Pilotkandidater | Gode hypoteser. | Ikke pilotklar uten aktorsvar og datagate. |
| Finance/roadmap | Kan struktureres. | Ikke fylles med konkrete loefter foer validering. |
| Appendix/source packs | Maa bygges. | Brukes som ekstern siterbarhetsport. |

## Hva vi ikke boer kopiere fra Circular Cities

- Ikke kopier Horizon-/NEB-/city-case-narrativet. Food har et annet mandat og andre valideringsporter.
- Ikke bygg mange nye figurer foer figurnoter og claim-lock finnes.
- Ikke la whitepaperformatet presse Food til bredere scope enn A+B/C-gate.
- Ikke bruk Circular sin modellmodenhet som bevis for at Food sine modeller er klare. Food maa QA-e sine egne flater.
- Ikke starte ekstern outreach bare fordi dokumentstrukturen blir bedre. Scope- eller minimumsvedtak maa fortsatt paa plass.

## Stop-regler for videre Food-arbeid

- Ikke skriv "pilotklar" foer eier, data, lovlig sluttbruk, off-taker, finansiering og bruksrett er dokumentert.
- Ikke skriv "validert" uten dato, rolle, aktor, kilde og bruksrett.
- Ikke bruk intern syntese som eneste kilde i ekstern tekst.
- Ikke bland HS-import, actor-data, total fôrvolum, råvareandel og EUDR-compliance i samme tallclaim.
- Ikke bruk graf eller modell som effektbevis uten eksplisitt metode- og figurnote.
- Ikke skriv roadmap som forpliktelse foer valideringssprinten har svar.

## Anbefalt neste rekkefolge

1. Opprett `food-tg-claim-lock-table-2026-05.md`.
2. Opprett `food-tg-figure-model-note-audit-2026-05.md`.
3. Opprett `food-tg-case-to-claim-index-2026-05.md`.
4. Opprett `food-tg-source-locator-risk-audit-2026-05.md`.
5. Oppdater `insight-pack-outline-food-tg-v0.2.md` eller lag en v0.3 med kontrollstatus per seksjon.
6. Kjoer reader journey-QA paa synlige Food-flater.
7. Foerst etter minimumsvedtak: send P1-outreach og bruk sprintloggen som statusport.

## Arbeidsvurdering

Food har nok kunnskap til aa fortsette, men ikke til aa hoppe rett til ekstern whitepaper-/roadmap-stemme. Circular Cities viser at neste kvalitetsloeft ikke er mer research i bredden, men bedre styring av claim, kilde, modell og leserflate. Hvis dette kontrollaget bygges foerst, kan Food raskere bli beslutningsklart uten aa miste kilde- og statusdisiplinen.
