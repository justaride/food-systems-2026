# Utenforstående plattformgjennomgang

Dato: 2026-05-27
Miljø: lokal Next.js dev-app på `http://localhost:3001`
Perspektiv: førstegangsbruker uten forhåndskontekst, men med faglig interesse for matsystem, markedsmakt og sirkulær omstilling.

## Kort status

Plattformen oppleves som en sterk intern kunnskaps- og beslutningsflate, ikke som en ferdig ekstern publikumsflate. Den gir raskt inntrykk av at prosjektet har mye data, tydelig kildearbeid og reell metodisk disiplin. Det viktigste forbedringsbehovet er ikke mer innhold, men bedre styring av leseren: færre samtidige innganger, klarere forklaring av statusbegreper, ryddigere språk, og en tydeligere "hva skal jeg gjøre her?"-flyt.

Min vurdering: **intern beslutnings- og valideringsklar, men ikke ekstern presentasjonsklar uten en guidet leserflate og noen tekniske/kopimessige oppryddinger.**

## Metode

Jeg åpnet prosjektet som om jeg var ny bruker og gikk fysisk gjennom hovedflatene i nettleser. Jeg kontrollerte hovedrutene i menyen, søk, selskapsside, kart/flow, hvitbok, bibliotek, graf, mandat og metodikk. Jeg tok skjermbilder underveis i `output/playwright/`.

Rutehelse var god: 33 hovedruter returnerte 200 i lokal gjennomgang. Jeg fant ikke synlige `[object Object]`, `undefined` eller `NaN` i hovedinnholdet på hovedrutene. Det er likevel ett synlig runtime-/hydration-problem på `/metodikk`, og flere kopitekst-/språkproblemer.

## Hva jeg forstår som utenforstående

Etter første gjennomgang forstår jeg plattformen slik:

- Dette er kunnskapsbasen for Food Systems Transition Group under Nordic Circular Hotspot.
- Arbeidet skal understøtte en leveranse mot juni 2026, med whitepaper/roadmap, valideringssprint og prioriterte spor.
- Plattformen kartlegger markedsstruktur, eierskap, selskaper, styrepersoner, forsyningskjeder, primærleveranser, offentlige virkemidler, forskningsgrunnlag og sirkulære muligheter.
- Den prøver aktivt å skille mellom intern analyse, kildebelagte funn, siterbarhet med forbehold og eksternt validerte claims.
- Den mest modne brukerflaten er intern: en arbeidsbenk for å finne, kontrollere og modne claims, ikke en fortellende offentlig rapport.

Dette er et godt utgangspunkt, fordi plattformen faktisk viser hva den vet og hva den ikke vet. Samtidig er dette også hovedfriksjonen for en ny leser: den eksponerer nesten hele arbeidsmaskinen samtidig.

## Førsteinntrykk

Førstesiden er visuelt rolig, moderne og tillitvekkende. Den forklarer kort at dette er en kunnskapsbase om selskapsstrukturer, eierskap, makt og forsyningskjeder i norsk og nordisk matsektor. Fasekortet, Evidence Pack-status og Ten Step-status gir en god intern prosjektfølelse.

Det som mangler for en utenforstående er et tydeligere valg av inngang:

- "Jeg er ny og vil forstå prosjektet på 5 minutter."
- "Jeg vil se de viktigste funnene."
- "Jeg vil kontrollere kilder og datakvalitet."
- "Jeg vil bruke dette til whitepaper/roadmap."

I dag finnes bare en liten "Ny her? Begynn med Innsikt"-lenke. Resten av venstremenyen gir 30+ valg med intern terminologi. Det signaliserer kraft, men også kompleksitet.

## Sideopplevelse

### Oversikt

Sterk som intern dashboard. Den viser prosjektfase, nøkkeltall og siste innsikt. Den bør få en tydeligere "plattformens formål" og "anbefalt leserreise". En utenforstående forstår raskt at mye finnes her, men ikke hva som er viktigst.

### Innsikt

Dette er en av de mest verdifulle flatene. Den viser markedsstruktur, selvforsyning, markedsmiks, datakilder og et stort innsiktslag. Den er samtidig svært lang og tett. Som leser vil jeg gjerne ha en toppseksjon med:

- de 5 viktigste funnene,
- hvilke funn som er trygge nok for ekstern bruk,
- hvilke som fortsatt er interne hypoteser,
- og hvilken side eller kilde jeg bør åpne hvis jeg skal kontrollere påstanden.

### Søk

Søket fungerer godt når man skriver noe inn. Søk på `NorgesGruppen` ga 50 resultater på tvers av aktører, relasjoner, innsikt, kilder, selskap, dokumenter og personer. Dette er en sterk inngang.

Tomtilstanden er for svak: siden er nesten blank bortsett fra søkefelt og modusvalg. Legg inn eksempelsøk, populære innganger og forklaring på hva "Nøkkelord", "Semantisk" og "Hybrid" betyr.

Semantisk og hybrid modus faller lokalt tilbake til nøkkelord og viser teknisk tekst om manglende `OPENAI_API_KEY` og manglende embeddings. For en ekstern eller ikke-teknisk intern bruker bør dette omskrives til en produktmelding, eller skjules hvis funksjonen ikke er aktiv.

### Selskaper og selskapsdetaljer

Selskapslisten og detaljsidene er sterke. Det er tydelig at dere har regnskap, eierskap, styre, relasjoner, eiendommer og dokumentkoblinger. ASKO-siden ga en god følelse av datadybde.

Friksjonen er at statusbegrepene ikke alltid forklares i kontekst. "Siterbar med forbehold", "Blokkert", "Interlock-score" og dokumentkoblinger med interne navn er nyttige for dere, men trenger en kompakt legend/tooltip for nye lesere. Relaterte dokumenter er også støyete når lange interne dokumentlister dominerer nederst.

### Kunnskapsgraf

Grafen signaliserer imponerende datamengde: 1 558 koblede noder, 2 787 kanter, 88.7 prosent konfidens, 117 i isolatkø og 0 brutte kanter. Data quality-panelet er spesielt verdifullt.

Som førstegangsbruker er selve canvaset vanskelig å lese. Det blir en "hairball" før man forstår hvilke spørsmål grafen skal svare på. Søkefeltet hjelper, men standardvisningen bør heller starte i en guidet modus:

- "Mest sentrale aktører",
- "Makt og eierskap",
- "Forsyningsrelasjoner",
- "Claims uten nok evidens",
- "Hva må ryddes før ekstern bruk".

### Mandat

Dette er en av de viktigste flatene for intern styring. Den sier tydelig at anbefalt arbeidsretning er Spor A+B med C som tverrgående gate, og at ingen claims er eksternt validert per 2026-05-21. Det er bra statusdisiplin.

For en utenforstående er siden tung. Den bør ha en kort øverst: "Hva betyr dette for neste beslutning?" med tre punkter:

- hva kan brukes nå,
- hva må valideres,
- hva må holdes tilbake.

### Metodikk

Metodikk-siden forklarer Ten Step, KPIs, Evidence Pack og stop signals. Innholdet er relevant, men siden har to problemer:

- Det er synlig Next/React issue i dev-visningen på `/metodikk`.
- Console viser hydration mismatch knyttet til `EmergenceVisualization`, sannsynligvis fordi komponenten bruker `Math.random()` under initial render.

Relevant kodeanker: `src/components/charts/EmergenceVisualization.tsx` bruker `Math.random()` i init/step-logikk, og komponenten brukes i `src/app/metodikk/page.tsx`.

Dette bør ryddes før demo eller ekstern visning. Enten gjør visualiseringen deterministisk ved første render, eller gjør den rent klientstyrt etter mount.

### Kart

Kartet er visuelt sterkt. Det viser butikk-klynger og landvalg på en intuitiv måte, og lagpanelet gir god kontroll.

To forbedringspunkter:

- `/kart` mangler tydelig H1 i hovedinnholdet. For tilgjengelighet og leserforståelse bør kartflaten ha en skjult eller synlig overskrift.
- Skjermleser-/DOM-teksten starter med mange tall fra kartmarkører før konteksten kommer. Dette er ikke et visuelt problem, men det svekker tilgjengelighet og tekstlig forståelse.

### Matflyt Norge

Flow-prototypen er en god ny flate fordi den er ærlig på datastatus: "illustrativ", "indeks, ikke tonn", og "ikke bruk som volumfasit". Den viser et modent forhold til prototype-data.

Siden blander norsk navigasjon med engelsk hovedtittel og forklaring. Det kan være bevisst, men plattformen bør velge språkmodus per flate. Hvis målgruppen er norsk/nordisk intern, bør "Norway food flow prototype" trolig bli "Matflyt Norge - prototype".

### Hvitbok

Dette kan bli den beste inngangen for eksterne eller semi-eksterne lesere, men den er foreløpig for enkel. Innholdsfortegnelsen viser tre kapitler og status "Utkast", men forklarer ikke hva leseren skal bruke dokumentet til.

Kapittel 1 fungerer bedre: det er kort, har målgruppe, status, konkrete funn og videre lenker. Dette bør løftes mer fram fra startsiden.

### Bibliotek og Kilder

Biblioteket er kraftig: 1 075 dokumenter og over 1.2 millioner ord. Søk og filtrering fungerer. For en utenforstående er dette likevel ikke en startflate, men en kontrollflate.

Det er også tydelige språk-/encodingrester: for eksempel placeholderen i biblioteket er `Sok i dokumenter...` i kode og DOM. Lignende ASCII-rester finnes flere steder (`Aapne`, `pa tvers`, `sirkulaer`, `primaer`, `hoey`, `faerre`). Dette gir et uferdig preg selv når dataarbeidet bak er solid.

### Forsyningskjede og sammenligning

Begge sidene er innholdsrike og faglig nyttige. Forsyningskjede viser både nettverk, primærflyt, import/sårbarhet, maktrelasjoner, infrastruktur og returstrømmer. Sammenligning gir nordisk tverrblikk med gode caveats.

Forbedringen er å gjøre dem mer beslutningsorienterte. Hver seksjon bør starte med "Dette forteller oss..." og slutte med "Konsekvens for Food TG". Uten dette må leseren selv oversette mange grafer til strategi.

## Hovedstyrker

1. **Kunnskapsdybde**: Plattformen inneholder uvanlig mye strukturert materiale: selskaper, personer, eiendom, dokumenter, kilder, relasjoner, leveranser, politikk og akademia.
2. **Kilde- og statusdisiplin**: Det er synlige forbehold, siterbarhetsnivåer, datastatus og valideringsspråk. Dette bygger tillit.
3. **Intern navigerbarhet**: Søk, krysslenker og detaljsider gjør det mulig å gå fra påstand til selskap, relasjon, kilde og dokument.
4. **Visuell seriøsitet**: Designet er rolig, konsistent og arbeidsrettet. Det føles som en seriøs analyseflate, ikke en markedsføringsside.
5. **Ærlighet om usikkerhet**: Flow-prototypen, mandatflaten og flere datakvalitetspaneler er gode eksempler på at plattformen ikke overselger data.

## Hovedfriksjoner

1. **For mange innganger samtidig**: Venstremenyen viser nesten hele systemet på én gang. Det gir kraftbrukere kontroll, men gjør første møte tungt.
2. **Intern terminologi uten nok forklaring**: Food TG, Ten Step, Evidence Pack, A/B/C-spor, claim-lock, citable_with_note, interlock-score og isolatkø trenger mer kontekst for nye lesere.
3. **Mye data, for lite konklusjon per side**: Flere sider viser datamengde og grafer, men ikke alltid hva leseren skal forstå eller gjøre etterpå.
4. **Kopikvalitet er ujevn**: Norske tegn mangler flere steder, og noen flater blander norsk og engelsk.
5. **Teknisk lekkasje**: Semantisk søk viser lokal teknisk fallback, og `/metodikk` viser hydration issue i dev.
6. **Graf og kart trenger tilgjengelighetsløft**: Grafen er visuelt tett; kartet mangler tydelig H1 og har DOM-tekst som starter med markørtall.

## Prioritert forbedringsbacklog

### P0 - før demo eller bred intern deling

1. **Fiks hydration-feilen på `/metodikk`**
   - Sannsynlig årsak: `Math.random()` i `src/components/charts/EmergenceVisualization.tsx`.
   - Effekt: fjerner synlig Next/React issue og reduserer risiko for ulik server/client-render.

2. **Rydd teknisk søkefallback**
   - Hvis embeddings/API ikke er aktivert, skjul eller omformuler semantisk/hybrid-modus.
   - Ekstern melding: "Semantisk søk er ikke aktivert i denne versjonen. Viser nøkkelordtreff."

3. **Kjør språk- og tegnrydding**
   - Start med synlige UI-filer: `BibliotekContent`, `media/page.tsx`, `verdikjede.ts`, `ten-step-start.ts`, `forskningsrunder`, `personer`, `aktorer`.
   - Mål: ingen `Sok`, `Aapne`, `pa tvers`, `sirkulaer`, `primaer`, `hoey`, `faerre` i brukerflate der norske tegn forventes.

4. **Lag en guidet start for nye lesere**
   - Førstesiden bør ha 3-4 tydelige innganger: "Forstå prosjektet", "Se hovedfunn", "Kontroller kilder", "Forbered whitepaper".

### P1 - for bedre forståelse

5. **Legg "Hva svarer denne siden på?" øverst på tunge sider**
   - Prioritet: Innsikt, Forsyningskjede, Sammenligning, Graf, Mandat, Bibliotek.
   - Format: 2-3 linjer + 3 nøkkelfunn + primær caveat.

6. **Forklar statusbegreper med en felles legend**
   - "Intern", "Siterbar med forbehold", "Blokkert", "Eksternt validert", "Proxy", "Illustrativ".
   - Bruk samme tekst på tvers av selskap, mandat, graf, flow og kilder.

7. **Gjør Hvitbok til ekstern inngang**
   - Løft Hvitbok i startflyten.
   - Legg til leserveiledning, status for hvert kapittel og hvilke claims som er klare/ikke klare.

8. **Gjør grafen spørsmålsstyrt**
   - Standardvisning bør ikke være hele nettverket.
   - Start med ferdige visninger: "makt", "eierskap", "forsyning", "evidensgap".

### P2 - kvalitetsløft

9. **Forbedre karttilgjengelighet**
   - Legg inn H1 eller `sr-only` H1.
   - Skjul rene markørtall bedre for skjermleser der de ikke gir kontekst alene.

10. **Stram inn relaterte dokumenter**
    - På selskapssider bør relaterte dokumenter grupperes etter relevans og siterbarhet, ikke bare listes langt.

11. **Skill intern arbeidsflate og leserflate i navigasjonen**
    - Behold full meny for kraftbrukere.
    - Lag en "Leserreise" eller "Rapportmodus" som skjuler interne verktøy til de trengs.

## Anbefalt leserreise

For ny intern eller semi-ekstern leser:

1. `/` - forstå formål, status og hvor man skal starte.
2. `/hvitbok` - les kort narrativ og foreløpige kapitler.
3. `/innsikt` - se hovedfunn og data.
4. `/mandat` - forstå hva som er internt klart og hva som ikke er eksternt validert.
5. `/sammenligning` og `/forsyningskjede` - gå dypere i nordisk sammenligning og systemrelasjoner.
6. `/sok` - slå opp aktører, claims og kilder.
7. `/bibliotek` eller `/kilder` - kildekontroll.

For kraftbruker:

1. `/mandat`
2. `/graf`
3. `/sok`
4. `/kilder`
5. `/selskap` / `/eierskap`
6. `/forsyningskjede`

## Konklusjon

Plattformen har substans. Den største risikoen er ikke at den virker tom, men at den virker for full. En utenforstående ser et seriøst analyseapparat, men trenger en tydeligere kuratert vei gjennom det.

Neste beste forbedring er derfor å bygge en leser-/beslutningsflate oppå det dere allerede har: start med færre valg, tydelige hovedfunn, klare caveats, og raske veier til dokumentasjon. Da kan plattformen fungere både som intern maskinromsflate og som et mer overbevisende grunnlag for whitepaper, møteforberedelse og ekstern validering.
