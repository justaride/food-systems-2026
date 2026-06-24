---
tittel: Food TG — Research mottaksprotokoll
status: Intern kontrollprotokoll
eier: Gabriel
dato: 2026-06-24
scope: Hvordan output fra Runde 12-prompts tas imot, valideres, klassifiseres og eventuelt løftes videre.
bruksregel: Ingen prompt-output blir ekstern faktastemme uten denne mottaksflyten.
---

# Food TG — Research mottaksprotokoll

## 1. Formål

Denne protokollen definerer hvordan Food TG tar imot output fra Runde 12-prompts. Formålet er å gjøre researchprosessen raskere uten å slippe rå output direkte inn i whitepaper, deck, nettside, figur eller claim.

Mottak skal alltid svare på fire spørsmål:

1. Hva fant vi?
2. Hvor sterkt er kildegrunnlaget?
3. Hvilken type hull eller usikkerhet står igjen?
4. Hvilken gate må funnet gjennom før det kan brukes?

## 2. Hvor output lagres

Raw output går til `research/external/r12/` med mindre prompten eksplisitt er et `forstaelse`-output. `forstaelse`-output lagres i `research/forstaelse/`.

Output som bare er intern design, modell- eller visualiseringsspesifikasjon kan lagres i `docs/project/mandates/`, men skal fortsatt mottaksføres hvis den bygger på researchfunn.

Aktørkartlegginger som primært er kandidatlister kan lagres i `research/_status/`, men hver rad skal beholde kilde, status og gate.

## 3. Mottaksrad

Hver fullført prompt får én mottaksrad før videre arbeid:

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|

Minimumskrav:

- `ID` skal matche backlogg og promptpack.
- `Kort dom` skal skille funn fra tolkning.
- `Sterkeste kilde` skal ha navn, år og lokator hvis mulig.
- `Svakeste punkt` skal si hva som ikke tåler ekstern bruk ennå.
- `Kildeklasse` skal være A, B, C eller blandet med svakeste klasse synlig.
- `Hulltype` skal være Type A, Type B, Type C eller blandet.
- `Gate` skal være en av de definerte gate-beslutningene.
- `Importbeslutning` skal si importer, vent, parker, aktørspørsmål eller claim-lock-kandidat.

## 4. A/B/C kildeklasse

Kildeklasse brukes per funn, ikke bare per dokument:

- `A`: primary/verbatim, official dataset, law text, annual report, registry, or directly downloadable primary report.
- `B`: secondary, actor-reported, journalistic, mirrored, derived estimate, or methodologically partial.
- `C`: not publicly measured, not available, classified, not attributable, or structurally unknowable from open sources.

Hvis en tabell inneholder både A og C, skal den ikke avrundes til A. C-cellen er et eget styringsfunn.

## 5. Type A/B/C hull

Hulltype beskriver hva som må til for å komme videre:

- `Type A`: desk-researchable. Mer offentlig research, bedre lokator eller metodeopprydding kan trolig løse hullet.
- `Type B`: actor/decision/access gate. Hullet krever aktørkontakt, internt tallgrunnlag, beslutningstilgang eller godkjenning.
- `Type C`: epistemic or structural absence. Hullet ser ikke ut til å være offentlig målt, tilgjengelig eller prinsipielt observerbart fra åpne kilder.

Type C betyr ikke at funnet er svakt. Det kan være et sterkt funn om manglende målesystem.

## 6. Gate-beslutning

Tillatte gate outcomes er:

- `source-shortlist`: funnet skal inn i kildekø for senere vurdering.
- `PCQ`: funnet må gjennom primary citation quality-sjekk før bruk.
- `claim-lock`: funnet er claim-nært og må låses med nøyaktig tekst, kilde og caveat.
- `actor-gate`: funnet krever aktørkontakt, tilgang, bekreftelse eller beslutning.
- `forstaelse`: funnet hører hjemme i analyse/metode før det kan brukes som eksternt utsagn.
- `parkert`: funnet skal ikke brukes nå, men beholdes med begrunnelse.

Gate skal velges etter svakeste punkt, ikke etter ønsket bruk.

## 7. Ikke-si-liste

Hver prompt-output skal ha en `Ikke-si`-liste før den kan bli deck- eller whitepaper-nær.

Listen skal fange:

- tall som bare er aktørrapportert
- metodeforskjeller som gjør land eller år usammenlignbare
- kapasitet som kan forveksles med realisert produksjon
- strukturindikatorer som kan bli intensjonspåstander
- type-C-hull som kan bli skjult av en pen figur
- sekundære kilder som kan høres primære ut

Hvis `Ikke-si`-listen mangler, er importbeslutningen alltid `vent`.

## 8. Minimum verifikasjon

Før importbeslutning skal mottaker sjekke:

1. Finnes kilde og lokator?
2. Er år/periode oppgitt?
3. Er geografien riktig?
4. Er indikatorens enhet tydelig?
5. Er kildeklasse satt per viktig celle?
6. Er tomme celler ført som funn?
7. Er anbefalt gate eksplisitt?
8. Er overclaim-risiko skrevet som `Ikke-si`?

For data som kan bli figur må mottaker også sjekke at tomme celler kan vises, ikke skjules.

## 9. Når funn kan løftes

Et funn kan løftes videre når:

- det har mottaksrad
- sterkeste kilde og svakeste punkt er tydelige
- kildeklasse og hulltype er satt
- gate er valgt
- `Ikke-si`-listen finnes
- neste mottaker vet om funnet skal til source-shortlist, PCQ, claim-lock, actor-gate, forstaelse eller parkert status

Claim-nære funn kan bare løftes som claim-lock-kandidat, ikke som ferdig tekst.

## 10. Når funn skal parkeres

Funn skal parkeres når:

- bare sekundærkilde finnes for et claim-nært utsagn
- output krever aktørdata som ikke er innhentet
- kildegrunnlaget er blandet uten synlig svakeste ledd
- funnet er sant i én metode, men prompten gjør det generelt
- output foreslår figur uten å vise tomme celler
- `Ikke-si`-liste mangler
- gate-beslutning ikke kan settes uten ny research

Parkering er ikke tap. Parkerte funn er arbeidskapital for senere source-shortlist, actor-gate eller modellutvikling.
