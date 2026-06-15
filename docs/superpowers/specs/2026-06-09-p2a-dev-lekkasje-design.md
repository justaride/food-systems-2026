# P2a — fjern DB-/dev-lekkasje fra UI — design

- **Dato:** 2026-06-09
- **Status:** Design godkjent (brainstorming) — klar for implementeringsplan
- **Omfang:** P2-tiltak #9 (M5): rå databasenavn, feltnavn, filstier og shell-kommandoer skal ikke vises i leservendt tekst. Ren søk-og-erstatt-sveip; ingen ny komponent.
- **Linje:** Fortsetter klarhet-auditen [`2026-06-08-sideklarhet-audit.md`](2026-06-08-sideklarhet-audit.md) (P2). Bygger på P0+P1 som nå er merget til main.

## 1. Problem

UI-en lekker interne dev-artefakter: DB-modell-/feltnavn (`producerId`, `BusinessRelationship`, `SourceDoc`, `PersonProfile`, `operatingResult`, `buyerId`, `DeliveryVolume`), repo-filstier (`research/evidence-pack/…`, `DATA-SOURCES.md`), shell-kommandoer (`npm run db:import…`) og «MCP». Det ser uferdig/forvirrende ut for en leser.

## 2. Beslutninger (låst i brainstorming)

1. **Oversett til norsk**, ikke bare skjul — DB-termer erstattes med vanlig norsk som sier det samme.
2. **Kun synlig tekst** endres; identifikatorer, typer, objektnøkler, `href`-uttrykk (`buyer.buyerId`, `latest.operatingResult`) røres ikke.
3. **Behold interne dev-instruksjoner som allerede ligger inne i en `InternalSection`** på `/forskningsrunder` (CSV-stier + `npm run` der er legitime team-instruksjoner, korrekt rammet inn som intern). Reader-synlige tom-tilstander og prosa ryddes.
4. Eksakte ordvalg er låst i §3.

## 3. Endringer (komplett, verifisert inventar)

### 3a. DB-modell-/feltnavn → norsk

**src/app/subsidier/SubsidierContent.tsx**
- `:343` «… koblet via leveransevolum (DeliveryVolume) — …» → «… koblet via leveransevolum — …» (fjern `(DeliveryVolume)`)
- `:431` `<code>producerId</code>` → vanlig tekst «produsent-ID» (fjern `<code>`-mono)
- `:482` «parent-orgnr-oppløsning mot Company-tabellen» → «oppslag av morselskapets orgnr mot selskapsregisteret»
- `:515` «parent-orgnr må kobles videre til produsentaktør» → «morselskapets orgnr må kobles videre til produsentaktør»
- `:647` «produsenter (Producer-tabell)» → «produsenter (produsentregisteret)»
- `:685` `<code>producerId</code>` → «produsent-ID»

**src/app/personer/[personKey]/page.tsx**
- `:96` «… kan legges til i PersonProfile-tabellen.» → «… kan legges til manuelt.»

**src/app/masteroppgaver/MasteroppgaverContent.tsx**
- `:180` «alle har documentId» → «alle er koblet til kildedokument»

**src/app/okonomi/OkonomiContent.tsx**
- `:689` «Driftsresultat = operatingResult (Brønnøysund årsrapport)» → «Driftsresultat (Brønnøysund årsrapport)» (fjern `= operatingResult`)

**src/app/forsyningskjede/ForsyningskjedeContent.tsx**
- `:380` og `:580` «BusinessRelationship-grafen er kuratert …» → «Relasjonsgrafen er kuratert …»
- `:422` «DeliveryVolume er Norge-observert register-data …» → «Leveransevolum-dataene er Norge-observert register-data …»
- `:1089` `<th>Mangler buyerId</th>` → «Mangler kjøper»

**src/app/graf/page.tsx**
- `:298` `title="BusinessRelationship-duplikater"` → `title="Relasjons-duplikater"`
- `:338` «Styremedlemmer uten PersonProfile (…)» → «Styremedlemmer uten profil (…)»

**src/app/kilder/KilderContent.tsx**
- `:187` «… uten eget SourceDoc-lag (…)» → «… uten egen kilderegistrering (…)»
- `:365` «… ikke promotert til SourceDoc ennå» → «… ikke registrert i kilderegisteret ennå»

**src/components/map/FoodFlowMap.tsx**
- `:721` `{dataset.schemaVersion ?? 'schema ukjent'}` → behold verdien, men endre fallback-strengen `'schema ukjent'` → `'dataversjon ukjent'`; hvis en synlig label «schemaVersion» står ved siden, → «Dataversjon». (Planen bekrefter label-konteksten.)

### 3b. Filstier / kommandoer / MCP → fjern eller forenkle (reader-synlig)

**src/app/subsidier/SubsidierContent.tsx**
- `:397` tom-tilstand «Kjør i prod-container: `npm run db:import:produksjonstilskudd`» → «Produksjonstilskudd er ikke lastet inn ennå.» (dev-detalj flyttes til en kodekommentar)

**src/app/kilder/KilderContent.tsx**
- `:192` «Nedlastingsstatus spores via CSV-er i `research/evidence-pack/`.» → «Nedlastingsstatus spores internt.»

**src/components/charts/MaterialFlowTab.tsx**
- `:61` EmptyState «Ingen materialstrømmer ennå — kjør `npm run bootstrap-material-flows`.» → «Ingen materialstrømmer registrert ennå.»

**src/app/forskningsrunder/ForskningsrunderContent.tsx**
- `:761` EmptyState «Ingen aktører enda. Kjør db:import:ts for å laste seed-data.» → «Ingen aktører registrert ennå.»

**src/app/eiendommer/EiendommerContent.tsx**
- `:263` «Tall hentet fra Brønnøysundregistrene (regnskapsåret 2024) via offentligdata MCP. Se …{repo-fil-lenke}» → «Tall hentet fra Brønnøysundregistrene (regnskapsåret 2024) via offentlige registre.» (fjern «MCP» + den interne repo-fil-lenken)

**src/components/map/DataSourcesPanel.tsx**
- `:130` «Se `DATA-SOURCES.md` for fullstendig dokumentasjon.» → «Se kildedokumentasjonen for detaljer.» (fjern filnavnet)

### 3c. Bevisst beholdt (intern, inne i `InternalSection` på /forskningsrunder)

`ForskningsrunderContent.tsx:271, 364, 520, 664, 693` — CSV-stier (`research/evidence-pack/…`) og `npm run db:import:research-20260420`: legitime team-arbeidsinstruksjoner, korrekt rammet inn som intern (P0). **Endres ikke** i denne runden.

## 4. Testing

- `npm run lint` + `npx tsc --noEmit` rent (ignorer kjent `insight-link-scripts.test.ts`-feil).
- **Guard-grep** (manuell, i planens sluttsteg): bekreft at ingen av disse dukker opp i reader-synlig JSX/strenger lenger: `producerId`, `BusinessRelationship`, `SourceDoc`, `PersonProfile-tabell`, `= operatingResult`, `Mangler buyerId`, `db:import:produksjonstilskudd`, `bootstrap-material-flows`, `db:import:ts`, ` MCP`, `DATA-SOURCES.md`, og `research/evidence-pack` utenfor /forskningsrunder sin InternalSection.
- Ingen oppførsel-tester (ren tekst).

## 5. Filer

`subsidier/SubsidierContent.tsx`, `personer/[personKey]/page.tsx`, `masteroppgaver/MasteroppgaverContent.tsx`, `okonomi/OkonomiContent.tsx`, `forsyningskjede/ForsyningskjedeContent.tsx`, `graf/page.tsx`, `kilder/KilderContent.tsx`, `forskningsrunder/ForskningsrunderContent.tsx`, `eiendommer/EiendommerContent.tsx`, `components/map/FoodFlowMap.tsx`, `components/map/DataSourcesPanel.tsx`, `components/charts/MaterialFlowTab.tsx`.

## 6. Utenfor omfang

- Resten av P2: orientering/ingress (#10), brødsmuler (#13), enhetsetiketter (#11), NO/EN-konsistens (#12), de ~18 «delvis»-sidene, og ordliste på flere sider.
- De interne dev-instruksjonene i §3c.
