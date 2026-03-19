# Materialkart, databaseflyt og oppskalering

**Dato:** 18. mars 2026  
**Formål:** Lage en beslutningsklar oversikt over hva som faktisk er kartlagt og lastet ned, hva som er operasjonalisert i databasen, og hvordan `Food Systems 2026` bør utvikles fra et sterkt forskningsrepo til en robust hybrid kunnskapsbase for analyse, uttrekk og Codex-assistert arbeid.

---

## 1. Hovedbilde

Prosjektet har allerede nok materiale til aa gaa fra "innhenting" til "systembygging".

Det viktigste skillet videre er ikke mellom mer eller mindre research, men mellom:

- materiale som bare finnes som filer
- materiale som er strukturert i typed objekter
- materiale som er lenket, beriket og dermed analyserbart paa tvers

Den naavaerende plattformen er sterk paa de to foerste, men fortsatt svak paa det tredje.

---

## 2. Hva vi faktisk har kartlagt og hentet ned

### 2.1 Repo- og dokumentkorpus

Per 18. mars 2026 er foelgende volum materialisert i databasen:

- `177` dokumenter i `Document`
- `99` registrerte kilder i `SourceDoc`
- `61` strukturerte rapporter i `Report`
- `31` master-/avhandlingsoppfoeringer i `Thesis`
- `68` aktorer i `Actor`
- `64` innsikter i `Insight`
- `14` selskaper i `Company`

Dokumentkorpuset fordeler seg i hovedsak slik:

- `95` dokumenter i `bibliotek`
- `23` dokumenter i `norden`
- `16` dokumenter i `rammeverk`
- `9` dokumenter i `norge`
- `7` dokumenter i `perpl-17-03`

Dette betyr at repoet allerede fungerer som et betydelig faglig korpus, ikke bare et prosjektarkiv.

### 2.2 Hva som er lastet ned vs. hva som er skrevet internt

`SourceDoc`-registeret viser at materialet bestaar av en blanding av nedlastede eksterne kilder og interne arbeidsdokumenter:

- `33` rapportkilder
- `24` analyser
- `11` forskningskilder
- `5` aarsrapporter
- `4` lovverk
- `3` statistikkilder
- `2` masteroppgaver
- `2` transkripsjoner
- `2` notater
- `2` NOU-er
- `2` soknader
- `2` duplikater

I tillegg:

- `44` kilder har ekstern URL registrert
- `64` kilder er koblet til et `Document`
- `2` kilder er markert som duplikater

Praktisk betyr dette at prosjektet allerede har et tydelig spor av provenance, men ikke enda full dekning.

### 2.3 Hva rapportlaget faktisk dekker

`Report`-modellen er godt fylt med `61` strukturerte rapporter fordelt paa:

- `12` fra `konkurransetilsyn`
- `10` `bransje`
- `9` `oversikt`
- `6` `akademia`
- `5` `offentlig`
- `4` `beredskap`
- `4` `konsulentrapport`
- `4` `tenketank`
- `3` `nou`
- `2` `juridisk`
- `2` `sirkularitet`

Dette er et godt analysegrunnlag for `/rapporter`, men rapportene er i dag i stor grad et eget lag, ikke integrert med fulltekstdokumentene.

### 2.4 Kvantitative og semistrukturerte lag

I tillegg til rapport- og dokumentkorpuset finnes:

- nordiske pris- og markedsdatasett i `research/data/`
- visualiseringsdata i `public/data/food-systems/`
- selskapsdata med finans, eierskap og styre
- aktorkart med relasjoner, stance, prioritet og dokumentbelegg
- innsikter med kildehenvisninger og faseplassering

Det sterke ved repoet er derfor bredden i kunnskapslagene. Det svake er at koblingene mellom lagene fortsatt er underutviklet.

---

## 3. Hva som faktisk er implementert i databasen

### 3.1 Datamodellen er i praksis en hybrid kunnskapsbase

Skjemaet peker allerede mot en hybridmodell:

- `Document` som kanonisk fulltekstobjekt
- `SourceDoc` som provenance / registry-lag
- `Report` og `Thesis` som typed overlays
- `Company` og `Actor` som entitetslag
- `Insight` som kuratert synteselag
- koblingstabeller for dokument->innsikt, dokument->selskap, dokument->aktor
- grafsporring i `DocumentRef` og `ActorRelationship`

Dette er riktig retning. Det er ikke mangel paa modell. Det er mangel paa fyllgrad i relasjonslaget.

### 3.2 Det som fungerer godt i appen i dag

Foelgende funksjoner er allerede operative:

- `/bibliotek` viser hele dokumentkorpuset og lar brukeren laste fulltekst via API
- `/rapporter` viser strukturerte rapportkort med funn, anbefalinger og relevans
- `/aktorer` viser prioriterte aktorer med asks, stance, prioritet og relasjoner
- `/graf` visualiserer kunnskapsgrafen
- `/sok` soeker paa tvers av dokumenter, innsikter, kilder, selskaper, masteroppgaver og aktorer
- `/forskning` har na en operativ promptko med statusfelt

Plattformen er derfor allerede en fungerende intern explorer.

Men det finnes minst ett tydelig uttaksgap:

- documentsok peker i dag mot `/forskning/${slug}`, mens det ikke finnes en egen dynamisk dokumentrute under `src/app/forskning/`

Det betyr at dokumentene er searchable, men ikke fullt publishable/navigerbare som egne kunnskapsobjekter enda.

### 3.3 De viktigste strukturelle hullene i databasen akkurat naa

De viktigste tallene er disse:

- `DocumentRef`: `0`
- `InsightDocumentRef`: `0`
- `CompanyDocumentRef`: `0`
- `ActorDocumentRef`: `78`
- `ActorRelationship`: `48`
- `Report.documentId`: `0`
- `Document.summary`: `0`
- `Document.url`: `0`
- `Document.embedding`: `0`

Det betyr i praksis:

- dokumentene er importert, men ikke referansekartlagt
- innsiktene peker til `SourceRef`, men ikke til `Document`
- selskapslaget er modellert, men ikke dokumentforankret
- rapportene er strukturert, men ikke lenket til fulltekstobjektene
- semantisk sok eksisterer i kode, men er inaktivt fordi ingen embeddings er skrevet

Kort sagt: systemet ser ut som en kunnskapsbase, men store deler av intelligenslaget er fortsatt tomt.

### 3.4 Importflyten er god nok til aa bygge paa, men ikke ferdig

`scripts/import-research-docs.ts` gjoer en viktig jobb:

- leser alle markdown-filer i `research/`
- oppretter `Document`
- klassifiserer kategori, subkategori, land og dokumenttype
- lenker enkelte `SourceDoc` og `Thesis` til `Document`

Men den har ogsaa tydelige svakheter:

- top-level filer i `research/` blir brukt som `category` direkte, f.eks. `README.md` og `DESK-RESEARCH-PLAN.md`
- den fyller ikke `summary`
- den fyller ikke `url`
- den fyller ikke `embedding`
- den lager ingen `DocumentRef`
- den lager ingen koblinger til `Report`, `Insight` eller `Company`

`scripts/import-ts-data.ts` bygger separate typed lag, men uten aa krysse de inn i `Document`-laget.

---

## 4. Hva dette betyr for neste arbeidsfase

### 4.1 Vi er ferdige med "samle alt i mapper"

Neste fase boer ikke handle om mer manuell lagring av nye markdown-filer uten struktur.

Neste fase boer handle om fire ting:

1. kanonisering
2. berikelse
3. kobling
4. uttrekk

### 4.2 Praktisk definisjon av neste modenhetsnivaa

Et dokument er ikke "ferdig inn i systemet" foer det har:

- en stabil `Document`-post
- minst en kilde- eller URL-referanse
- en kort oppsummering
- type/kategori/land/tags
- minst ett forhold til en annen entitet eller et annet dokument

Et insight er ikke "ferdig" foer det har:

- minst en `SourceRef`
- helst minst ett `InsightDocumentRef`
- tydelig fase, tema og bevisstyrke

Et selskap eller en aktor er ikke "ferdig" foer det har:

- minst ett dokumentbelegg
- tydelig rolle i verdikjeden / policybildet
- synlig plass i grafen

---

## 5. Anbefalt maalarkitektur

### 5.1 Hold fast ved Postgres/Prisma som primarbase

Det er ikke riktig tidspunkt aa flytte til en separat grafdatabase eller full kunnskapsplattform naa.

Det riktige naeste steget er:

- behold Postgres som source of truth
- behold Prisma som datamodell og app-kontrakt
- gjoer relasjonslagene levende
- legg paa bedre ingest, embedding og data quality

Postgres er mer enn god nok for naavaerende volum.

### 5.2 Del systemet i fire operative lag

#### Lag A: Raw corpus

Her ligger filer, PDF-er, markdown, CSV, geojson og transkripsjoner.

Maal:

- fullstendig bevaring av originalmateriale
- tydelig filstruktur
- minimalt med manuell redigering av kildetekst

#### Lag B: Canonical document layer

Her skal alt som skal brukes av app, Codex og analyser finnes som `Document`.

Maal:

- stabil `slug`
- oppsummering
- metadata
- provenance
- embedding

#### Lag C: Entity and relation layer

Her boer koblingene leve:

- dokument <-> dokument
- dokument <-> insight
- dokument <-> selskap
- dokument <-> aktor
- aktor <-> aktor

Maal:

- faktisk kunnskapsgraf
- bedre navigasjon
- analysemuligheter utover fulltekstsok

#### Lag D: Output and analyst layer

Her ligger:

- whitepaper-utkast
- evidence pack
- rapportkort
- dashboards
- kart
- eksportfiler for briefing, mail, interview packs og Codex-kontekst

Maal:

- samme kunnskapsbase skal kunne brukes til baade lesing, analyse og produksjon

---

## 6. Hvordan informasjonsflyten boer se ut

### 6.1 Foreslaatt standardflyt

1. **Innhenting**
   - ny PDF, webkilde, CSV, transkripsjon eller rapport legges i korrekt mappe

2. **Ekstraksjon**
   - filen konverteres til tekst/markdown med stabil struktur

3. **Normalisering**
   - opprett eller oppdater `Document`
   - lag/fiks metadata
   - lag kort summary

4. **Berikelse**
   - legg til tags, land, dokumenttype, kilde-URL, eventuelt tabelluttrekk
   - skriv embedding

5. **Kobling**
   - opprett relasjoner til rapport, thesis, company, actor, insight og andre dokumenter

6. **Kuratering**
   - lag eller oppdater `Insight`
   - legg inn bevisstyrke eller relevans om noedvendig

7. **Uttrekk**
   - eksponer i app, sok, graf, analyser, whitepaper-notater og Codex-kontekstmapper

### 6.2 Det viktigste prosessgrepet for Codex

Codex jobber best naar kunnskap finnes i tre former samtidig:

- som fulltekst
- som strukturert metadata
- som korte, kuraterte "entry points"

Det betyr at vi boer opprette flere eksplisitte arbeidsflater for agentarbeid:

- tema-dossierer per hovedspor
- kompakte research-briefs per analyseoppgave
- bevislister per paastand i whitepaperet
- query-ready uttrekk fra databasen

Hvis alt kun ligger i store markdown-filer, blir kontekstvinduet dyrt. Hvis alt bare ligger i tabeller, mister vi resonnement og sitatnaerhet. Hybrid er riktig.

---

## 7. Filstruktur og kontekstvinduer

### 7.1 Hva som fungerer godt allerede

- `research/` som faglig korpus
- `src/lib/data/` som seed-lag
- `scripts/` som ingest-lag
- `src/lib/queries/` som databaseadapter
- app-ruter for browse og sok

### 7.2 Hva som boer forbedres

1. **Skille tydeligere mellom raw, curated og published**
   - `research/raw/`
   - `research/curated/`
   - `research/output/`

2. **Unngaa top-level dokumentstoy i `research/`**
   - flytt sentrale rotdokumenter inn i egne mapper eller merk dem eksplisitt som `meta`

3. **Innfør dossiermapper**
   - f.eks. `research/dossiers/leverandormakt/`
   - ett kort README/notat
   - lenker til kjernedokumenter
   - viktigste paastander
   - foreslaatte SQL/query-uttrekk

4. **Innfør evidence bundles**
   - f.eks. `research/evidence-pack/market-power/`
   - paastand -> dokument -> sitat -> status

Dette vil redusere behovet for aa laste store deler av repoet inn i samme kontekstvindu.

---

## 8. Open source-prosesser og GitHub-loesninger vi boer utnytte

Det finnes ikke ett repo som loeser hele problemet. Riktig strategi er aa hente modne byggesteiner for ulike lag.

### 8.1 Dokumentekstraksjon og parsing

**Anbefaling:** `docling-project/docling`

Brukes for:

- PDF -> strukturert markdown/json
- DOCX/PPTX/XLSX-ekstraksjon
- bedre input til `Document`

Hvorfor relevant:

- prosjektet har mange PDF-er, rapporter og arbeidsdokumenter
- dagens ingest er i stor grad filbasert og markdown-only
- Docling kan gi bedre standardisert ekstraksjon foer import

### 8.2 Deduplisering og kildevask

**Anbefaling:** `OpenRefine/OpenRefine`

Brukes for:

- rensing av kilderegister
- deduplisering av titler, forfattere, institusjoner og URL-er
- normalisering av tagger og navn

Hvorfor relevant:

- vi har allerede duplikater og inkonsistent fil-/kildestruktur
- dette er et klassisk "messy data"-problem, ikke et LLM-problem

### 8.3 Ingest-orkestrering og lineage

**Anbefaling:** `dagster-io/dagster`

Brukes for:

- definere ingest som data assets
- synliggjore hvilke steg som er kjoert
- enklere observability og reruns

Hvorfor relevant:

- prosjektet har flere importer, men ingen samlet kontrollflate
- naar flere kilder og pipelines kommer til, boer vi vite hva som er oppdatert og hva som er stale

### 8.4 Hybrid sok utover Prisma `contains`

**Anbefaling:** `meilisearch/meilisearch`

Brukes for:

- raskt fulltekstsok
- facets og filtrering
- senere hybrid med semantisk sok

Hvorfor relevant:

- dagens keyword-sok er enkelt og fungerer, men vil bli svakt paa større korpus
- Meilisearch passer godt som sekundar indeks over `Document`, `Report`, `Actor` og `Company`

### 8.5 Eksperimentell graf-RAG over korpuset

**Anbefaling:** `microsoft/graphrag`

Brukes for:

- eksperimentell indeksbygging over korpuset
- oppdagelse av latent tematisk struktur
- spørsmålsbesvarelse over store mengder tekst

Viktig presisering:

- GraphRAG boer **ikke** vaere primar datamodell
- det boer brukes som analyse-/retrieval-lag over et allerede renset korpus

### 8.6 Aapne matdata paa produktnivaa

**Anbefaling:** `openfoodfacts/openfoodfacts-server`

Brukes for:

- produktmetadata
- ingrediens-/kategori-/emballasjelag
- framtidige koblinger mot varedata eller produktunivers

Dette er ikke noedvendig for neste uke, men relevant hvis prosjektet senere beveger seg fra markedssystem til produkt- og varestromsnivaa.

### 8.7 Eksisterende prosjektrelevante GitHub-notater

Se ogsaa:

- `research/rammeverk/github-kodebase-referanser-2026-03-18.md`

Det notatet peker paa flere domenenære referanser for systemkart, matsystemdashboard og supply chain-visualisering.

---

## 9. Konkrete neste grep

### 9.1 Fase A: Gjør dagens database sann

Dette boer skje foerst:

1. lag `summary` paa `Document`
2. lag `url`-mapping fra `SourceDoc` til `Document` der det finnes ekstern URL
3. lenk `Report` til `Document`
4. opprett de foerste `InsightDocumentRef`
5. opprett de foerste `CompanyDocumentRef`
6. skriv embeddings for `Document`

Uten dette blir graf, semantisk sok og analytiske uttrekk svakere enn de burde vaere.

### 9.2 Fase B: Etabler et faktisk relasjonslag

Boer komme rett etter:

1. bygg et lite regler-/seed-lag for `DocumentRef`
2. koble innsikter til 1-3 dokumenter hver
3. koble sentrale selskaper til dokumentbelegg
4. bruk aktorene som referansenettverk inn i resten av grafen

Dette vil gi prosjektet det foerste reelle knowledge graph-laget.

### 9.3 Fase C: Bedre Codex-operasjon

Lag tre nye arbeidsflater:

1. `research/dossiers/`
2. `research/evidence-pack/claims/`
3. `scripts/export-context-bundles.ts`

Maal:

- kortere og mer presis kontekst til agentarbeid
- mindre behov for aa laste mange store filer samtidig
- tydeligere overgang fra database til resonnering og skriving

### 9.4 Fase D: Orkestrering og sok

Etter at relasjonslaget er fylt:

1. vurder Docling for ekstraksjon
2. vurder OpenRefine for kilderegister
3. vurder Dagster for ingest-pipeline
4. vurder Meilisearch for sok
5. vurder GraphRAG som eksperimentelt lag

### 9.5 Foreslaatt implementeringsrekkefolge i kodebasen

Hvis dette skal omsettes til faktisk arbeid i repoet, boer rekkefolgen vaere:

1. **Gjor dokumentlenkene sanne i appen**
   - legg til en faktisk dynamisk dokumentrute under `src/app/forskning/[slug]/`
   - bruk `Document` som primarobjekt og eksponer metadata, summary, kilde-URL og relasjoner
   - dette lukker gapet mellom sok, bibliotek og leseflate

2. **Stram opp canonical import**
   - oppdater `scripts/import-research-docs.ts`
   - unngaa at top-level meta-filer som `README.md` og andre styringsfiler blir vanlige fagdokumenter uten eksplisitt markering
   - fyll `summary` med minst en enkel heuristikk eller et kort oppsummeringssteg
   - kopier `SourceDoc.url` inn i `Document.url` der match allerede finnes

3. **Bygg et bro-lag mellom typed data og dokumentlaget**
   - `scripts/import-ts-data.ts` importerer allerede `SourceDoc`, `Insight`, `Thesis`, `Report` og andre lag
   - det som mangler er et eget steg som kobler disse til `Document`
   - dette boer vaere et separat script, ikke gjemt i hovedimporten, slik at koblingene kan forbedres iterativt

4. **Aktiver embedding- og referanselaget**
   - `scripts/generate-embeddings.ts` finnes allerede og boer brukes etter at dokumentmetadata er forbedret
   - `scripts/enrich-refs.ts` finnes allerede og kan gi et foerste maskinelt forslag til `DocumentRef`
   - semantiske treff boer behandles som forslag, ikke som ferdig kuraterte sannheter

5. **Lag et lite eksportlag for agentarbeid**
   - bygg `scripts/export-context-bundles.ts`
   - eksporter korte dossierpakker fra databasen, ikke bare hele dokumenter
   - dette blir broen mellom database, whitepaperarbeid og Codex-kontekst

Denne rekkefolgen er viktig fordi den flytter prosjektet fra "vi har modellene" til "modellene produserer faktisk bedre arbeidsflater".

### 9.6 Minimum viable knowledge graph

Foer nye plattformer eller ekstra infrastruktur innfoeres, boer prosjektet naa et minimumsnivaa som gjoer dagens stack sann:

- `100 %` av sentrale `Document`-poster har `title`, `slug`, `category`, `documentType` og `wordCount`
- minst `70 %` av relevante dokumenter har `summary`
- alle `Report`-poster med fulltekst i repoet har en `documentId`
- topp `20-30` `Insight`-poster er koblet til minst ett dokument
- topp `10-15` `Company`-poster har minst ett dokumentbelegg
- documentsok peker til faktiske lesesider, ikke bare teoretiske URL-er
- embeddings er skrevet for hele det aktive dokumentkorpuset
- `DocumentRef` inneholder baade maskinelle likhetskanter og et mindre antall kuraterte faglige relasjoner

Naar disse tersklene er naaet, vil `/sok`, `/graf`, `/bibliotek`, `/aktorer` og `/selskap` begynne aa virke som deler av samme kunnskapsbase, ikke som parallelle visninger over delvis isolerte datalag.

### 9.7 Hva som boer automatiseres vs. kurateres

Ikke alt boer loeses likt.

Det som boer automatiseres tidlig:

- import av markdown til `Document`
- enkel oppsummering eller summary-draft
- URL-sync fra `SourceDoc` til `Document`
- embeddings
- forslag til `DocumentRef` basert paa semantisk likhet
- basiseksporter til dossierer og kontekstpakker

Det som boer kurateres manuelt eller halvmanuelt:

- endelig `refType` mellom dokumenter (`supports`, `contradicts`, `references`, osv.)
- kobling mellom `Insight` og de mest sentrale dokumentene
- kobling mellom `Company` og dokumentbelegg
- evidence packs for whitepaper-paastander
- prioritering av hvilke dokumenter som er "kanoniske" paa hvert tema

Dette skillet er viktig. Hvis alt automatiseres, blir kunnskapsbasen raskt stoyete. Hvis alt kurateres manuelt, stopper systemet i vedlikeholdskost.

### 9.8 Naar ny infrastruktur faktisk er verdt det

De eksterne verktroyene nevnt over er nyttige, men de boer innfoeres med disiplin:

- **Docling** er verdt det naar PDF-ekstraksjon eller tabeller faktisk er en gjentakende flaskehals
- **OpenRefine** er verdt det naar kilderegisteret skal vaskes i batch og navne-/URL-normalisering blir et eget arbeidsspor
- **Dagster** er verdt det naar prosjektet har flere repeterbare pipelines som maa observeres, restartes og tidsstyres
- **Meilisearch** er verdt det naar metadata er stabile nok til at facets og sekundarindeks gir reel gevinst
- **GraphRAG** er verdt det naar korpuset er rent nok og relasjonslaget tett nok til at eksperimentet gir bedre svar enn vanlig retrieval

Foer dette punktet boer hovedinnsatsen fortsatt ligge i a gjoere Postgres-, Prisma- og dokumentlaget mer sannferdig.

---

## 10. Sluttvurdering

`Food Systems 2026` er allerede mye naermere en reell kunnskapsplattform enn et vanlig forskningsrepo.

Styrken er:

- mye og bredt materiale
- riktig grunndatamodell
- fungerende appflater
- godt potensial for Codex-assistert arbeid

Svakheten er:

- for svakt relasjonslag
- for lite berikelse av `Document`
- for svak differensiering mellom raw, curated og output
- for svak pipeline-observability

Den riktige ambisjonen videre er derfor ikke "mer dokumentasjon", men:

- et mer sannferdig dokumentlag
- en levende graf av relasjoner
- bedre sok og retrieval
- tydelige arbeidsflater for analyser, whitepaper og agentbruk

Det er her prosjektet kan vokse fra "sterkt bibliotek" til "operativ kunnskapsmotor".
