# Kunnskapsgraf: status og videre plan

Dato: 2026-04-29  
Branch: `audit/kunnskapsgraf-status-2026-04-29`

## Kort konklusjon

Kunnskapsgrafen er teknisk operativ, men ikke ferdig som prosjektfunksjon. Vi har en faktisk grafmodell i Postgres/Prisma, en `/graf`-side, en `react-force-graph-2d`-visualisering, relasjonstabeller og datakvalitetspanel. Det er mer enn en mockup.

Samtidig er dagens globale graf for bred og for tynt koblet. Den laster hele selskapskatalogen inn som noder, inkludert mange registerrader uten relasjoner. Resultatet er en stor, visuelt tung kataloggraf, ikke en beslutningsnær analyseflate.

Operativ vurdering: **teknisk 7/10, analytisk 4/10, prosjektfunksjon 3/10**. Den kan bygges og hente data, men den må få skarpere bruksområder, bedre proveniens og fokuserte delgrafer for å bli nyttig i arbeidet.

## Hva vi har laget

### 1. Egen grafside

Kjerneside: `src/app/graf/page.tsx`

Siden:

- henter grafdata med `getFullGraph()`
- viser antall noder per type
- viser antall kanter
- viser datakvalitetspanel
- renderer interaktiv graf via `KnowledgeGraph`

Grafen ligger i menyen under `Kunnskap -> Graf`.

### 2. Graf-query som samler flere domener

Kjernequery: `src/lib/queries/graph.ts`

Nodetyper som modellen støtter:

- `document`
- `insight`
- `thesis`
- `company`
- `source`
- `actor`
- `person`
- `property`

Kanttyper som bygges i full graf:

- dokument til dokument: `DocumentRef`
- dokument til innsikt: `InsightDocumentRef`
- dokument til selskap: `CompanyDocumentRef`
- dokument til aktør: `ActorDocumentRef`
- aktør til aktør: `ActorRelationship`
- aktør til selskap: `company-link`
- dokument til master/phd: `thesis-doc`
- eierskap: `CompanyOwnership`
- forretningsrelasjon: `BusinessRelationship`
- person til selskap: `person-role`
- selskap til eiendom: `owns-property`
- leietaker til eiendom: `leases-property`

Det finnes også to ubrukte, men viktige helperfunksjoner:

- `getDocumentGraph(id)` for dokumentnabolag
- `getRelatedEntities(id, type)` for relaterte dokumenter, selskaper, innsikter og aktører

Disse er gode byggesteiner for fokuserte delgrafer, men brukes ikke i appen nå.

### 3. Interaktiv klientkomponent

Kjernekomponent: `src/components/charts/KnowledgeGraph.tsx`

Den støtter:

- filtrering på nodetype
- filtrering på kanttype
- tekstsøk i noder
- farge per nodetype
- enkel konfidensvisning i link-stil
- label-rendering i canvas

Dette er et fungerende graf-UI, men ikke ennå et godt analyseverktøy. Det mangler klikkhandling, detaljpanel, eksport, fokusering rundt valgt entitet og kobling tilbake til relevante sider.

### 4. Datakvalitetspanel

`/graf` viser kvalitetsindikatorer for:

- duplikate selskapsnavn
- duplikate orgnr
- duplikate personnavn/personKeys
- duplikate business-relasjoner
- styremedlemmer uten `PersonProfile`
- kantdekning med konfidens

Dette er riktig retning: grafen skal ikke bare vise nettverk, men også fortelle hvor nettverket er svakt.

### 5. Separat og mer operativ forsyningskjede-graf

Kjerneside: `src/app/forsyningskjede/page.tsx`  
Kjernequery: `src/lib/queries/supply-chain.ts`  
Grafkomponent: `src/components/charts/SupplyChainGraph.tsx`

Dette er ikke samme graf som `/graf`, men den er mer funksjonell som analyseflate. Den bruker `BusinessRelationship`, `DeliveryVolume`, value-chain-filer og datakvalitetspanel. Den viser færre noder, har tydeligere domeneformål og er nærmere et faktisk arbeidsverktøy.

## Verifisert status 2026-04-29

Kommandoer kjørt:

- `npm run db:audit` -> passerer
- `npx tsc --noEmit` -> passerer
- `npm run lint` -> passerer
- `npx next build` -> passerer

Build-resultat viser `/graf` som dynamisk server-renderet route.

Det er én Turbopack-warning knyttet til `src/lib/queries/supply-chain.ts` og dynamisk fil-lesing via `process.cwd()`. Den stopper ikke build, men bør ryddes senere fordi den kan føre til unødvendig tracing av prosjektet.

## Faktisk grafstørrelse

Målt mot databasen:

| Område | Antall |
| --- | ---: |
| Totale grafnoder | 58 427 |
| Totale grafkanter | 4 218 |
| Isolerte noder | 56 077 |
| Koblede noder | 2 350 |
| Største koblede komponent | 2 166 noder |
| Kanter med konfidens | 23 |
| Kanter uten konfidens | 4 195 |

Noder per type:

| Type | Noder | Isolerte | Koblede | Snittgrad |
| --- | ---: | ---: | ---: | ---: |
| document | 1 163 | 693 | 470 | 2.06 |
| insight | 117 | 97 | 20 | 0.34 |
| thesis | 63 | 0 | 63 | 1.00 |
| company | 55 438 | 55 201 | 237 | 0.07 |
| actor | 191 | 53 | 138 | 2.25 |
| person | 1 335 | 33 | 1 302 | 1.31 |
| property | 120 | 0 | 120 | 1.23 |

Kanter per type:

| Kanttype | Antall |
| --- | ---: |
| person-role | 1 754 |
| company-ref | 1 144 |
| document-ref | 526 |
| actor-relationship | 157 |
| company-ownership | 150 |
| business-relationship | 121 |
| owns-property | 120 |
| actor-ref | 95 |
| thesis-doc | 63 |
| insight-ref | 40 |
| leases-property | 27 |
| actor-company-link | 21 |

## Hva dette betyr

### Det som er bra

1. Datamodellen er ekte. Grafen er ikke hardkodet; den leser fra relasjonstabeller og flere domener.
2. Integriteten er god nok til videre arbeid. Referential integrity-sjekken passerer.
3. Det finnes flere modne delmodeller: dokumenter, selskaper, aktører, personer, eierskap, forsyningskjede og eiendom.
4. Forsyningskjede-siden viser riktig retning: færre noder, tydeligere spørsmål, kvalitetsstatus og konkrete neste datakandidater.

### Det som gjør grafen lite operativ nå

1. **Global graf er for stor.** 58k noder er for mye for en standard force-graph-flate, særlig når 56k noder er isolerte.
2. **Selskapskatalogen dominerer uten å gi analyseverdi.** 55 201 av 55 438 selskapsnoder er isolerte i grafen.
3. **Konfidensmodellen er nesten tom.** UI-et har konfidenslegend, men bare 23 av 4 218 kanter får konfidenssignal.
4. **`source`-nodetype finnes i typene, men brukes ikke i fullgrafen.** `SourceDoc` er dermed ikke del av kunnskapsgrafen, selv om prosjektets verdi egentlig avhenger av kilde/proveniens.
5. **Grafen er isolert fra arbeidsflytene.** Entity-sidene bruker ikke `getDocumentGraph()` eller `getRelatedEntities()`.
6. **Søk peker delvis feil.** `unifiedSearch()` gir relationship-resultater med URL `/relasjoner#id`, men `/relasjoner` redirecter til `/forsyningskjede`. Det gir ikke en presis entitets- eller relasjonslanding.
7. **Innsikt er svakt koblet.** 117 innsikter finnes, men bare 40 `InsightDocumentRef`-kanter. Det gjør grafen svak som bevis-/claim-navigasjon.

## Hva grafen bør brukes til i prosjektet

Ikke bruk global graf som hovedprodukt. Bruk grafmodellen som en **relasjonsmotor** bak konkrete arbeidsflater.

De mest nyttige funksjonene er:

1. **Entitetsnabolag:** På `/selskap/[id]`, `/aktorer/[slug]`, `/bibliotek/[slug]`, `/personer/[personKey]`: vis 1-2 nivåer av relasjoner rundt valgt entitet.
2. **Kilde- og påstandssporing:** Fra en claim/innsikt skal man kunne se hvilke dokumenter, selskaper, aktører og personer som støtter eller berører den.
3. **Gap-audit:** Vis manglende koblinger: dokument uten innsikt, innsikt uten kilde, selskap uten dokumentref, relasjon uten kilde/konfidens.
4. **Mandat-/Food TG-arbeid:** Bruk grafen til å vise hvilke claims, kilder, aktører og valideringsbehov som henger sammen, men hold intern status og ekstern validering adskilt.
5. **Forsyningskjede og eierskap:** La domeneorienterte grafer leve som egne flater, men hent felles node-/kantproveniens fra samme grafkontrakt.

## Anbefalt videre arbeid

### Fase 1: Gjør grafen brukbar uten ny datamodell

1. Endre `/graf` fra global dump til filtrert standardvisning:
   - skjul isolerte noder som default
   - vis største koblede komponent eller valgt domene
   - legg på maksgrense, f.eks. 2 000 noder
   - legg inn valg: `Alle`, `Koblet`, `Dokument/innsikt`, `Selskap/eierskap`, `Aktør`, `Forsyningskjede`

2. Legg til klikkhandling i `KnowledgeGraph`:
   - detaljpanel
   - link til riktig side
   - innkommende/utgående relasjoner
   - kilde/proveniens hvis tilgjengelig

3. Bruk eksisterende helpers:
   - dokumentnabolag på `/bibliotek/[slug]`
   - relaterte selskaper/aktører på `/selskap/[id]`
   - relaterte dokumenter/aktører på `/aktorer/[slug]`

4. Rett søk-landing:
   - relationship-resultater bør peke til `/forsyningskjede?relationship=<id>` eller en faktisk relasjonsdetalj
   - ikke `/relasjoner#id` når `/relasjoner` bare redirecter

### Fase 2: Gjør modellen kunnskapsmessig pålitelig

1. Innfør en felles grafkontrakt:
   - `nodeId`
   - `nodeType`
   - `label`
   - `canonicalUrl`
   - `edgeType`
   - `direction`
   - `sourceDocumentId`
   - `sourceDocId`
   - `sourceLabel`
   - `confidence`
   - `validationStatus`
   - `createdBy/importBatch`

2. Koble `SourceDoc` og `SourceRef` inn i grafen:
   - kilde som node når den er en selvstendig kildeenhet
   - kilde/proveniens som edge-attributt når den dokumenterer en relasjon

3. Fyll konfidens og proveniens på relasjoner:
   - ikke bare `source: string`
   - bruk strukturert metadata for kildeklasse, kvalitet, verifiseringsstatus og importbatch

4. Øk `InsightDocumentRef`-dekningen:
   - prioriter innsikter brukt i mandat, claim-rapporter og Food TG-briefs
   - mål: alle beslutningsrelevante innsikter skal ha minst én dokumentkobling

5. Lag en graf-audit som kan kjøres fast:
   - isolerte noder per type
   - kantdekning per type
   - konfidensdekning
   - kildekoblingsdekning
   - døde URL-er fra grafnoder
   - ubrukte helper-queryer/flater

### Fase 3: Gjør grafen til prosjektfunksjon

1. Bygg "Hvorfor vet vi dette?"-panel:
   - fra claim/innsikt til dokumenter, kilder, aktører og selskaper
   - egnet for Food TG beslutningsstøtte

2. Bygg "Hvem må vi validere med?"-panel:
   - fra claim/aktør/selskap til relevante aktører og valideringsbehov
   - skill `Utført internt` fra `Validert eksternt`

3. Bygg "Hva mangler?"-panel:
   - selskaper uten kilde
   - innsikter uten dokument
   - aktører uten dokumentgrunnlag
   - relasjoner uten kilde/konfidens

4. Integrer forsyningskjede og kunnskapsgraf:
   - la `/forsyningskjede` beholde sin fokuserte visning
   - bruk samme node-/kantkontrakt og proveniensmodell
   - eksponer relasjoner tilbake i `/graf` som et filtrert domene, ikke som løs parallellmodell

## Prioritert backlog

1. **P0:** Skjul isolerte noder i `/graf` som default og legg inn domene-/typefilter før render.
2. **P0:** Legg til klikkbar detaljpanel i `KnowledgeGraph`.
3. **P0:** Rett relationship-lenker fra søk til faktisk forsyningskjede-/relasjonsflate.
4. **P1:** Ta i bruk `getDocumentGraph()` på `/bibliotek/[slug]`.
5. **P1:** Ta i bruk `getRelatedEntities()` på selskaps- og aktørsider.
6. **P1:** Legg `SourceDoc`/proveniens inn i grafkontrakten.
7. **P1:** Lag fast `graph:audit`-script med tallene over.
8. **P2:** Øk `InsightDocumentRef`-dekning for mandat-/Food TG-innsikter.
9. **P2:** Koble forsyningskjede-data til felles grafkontrakt.
10. **P2:** Lag eksport for valgt delgraf til JSON/CSV for analyse og briefarbeid.

## Beslutning

Behold `/graf`, men behandle den som **debug- og utforskningsflate** inntil den er filtrert og knyttet til konkrete workflows.

Prosjektfunksjonen bør ikke være "se hele nettverket". Den bør være:

- "Hva vet vi om denne entiteten?"
- "Hvilke kilder støtter dette?"
- "Hvilke aktører og relasjoner berøres?"
- "Hva mangler vi for å bruke dette i beslutningsstøtte?"

Da blir kunnskapsgrafen en faktisk analyse- og valideringsmotor i prosjektet, ikke bare en stor nettverksvisualisering.
