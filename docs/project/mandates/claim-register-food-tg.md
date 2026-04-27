---
tittel: Food TG Claim Register v0.1
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-27
planlagt_phase_dato: 2026-04-30
neste_handling: Brukes som hypotesegrunnlag i sporbriefer (Phase 4-5)
relaterte_filer:
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
---

# Food TG Claim Register v0.1

Strukturert oversikt over påstander, hypoteser og beslutningsforslag som Insight Pack v0.1 hviler på. Skiller eksplisitt mellom hva vi vet (fakta), hva vi tror (hypoteser) og hva som må valideres eksternt.

## Felter

| Felt | Beskrivelse |
|---|---|
| Claim-ID | `CL-A-001`, `CL-B-001`, `CL-C-001` |
| Påstand/hypotese | Kort formulering (≤2 setninger) |
| Type | Fakta, analyse, hypotese, beslutningsforslag |
| Spor | A, B eller C |
| Evidens | EV-IDer fra evidence matrix |
| Konfidens | Høy, Medium, Lav |
| Risiko hvis feil | Hva en beslutning kan bomme på |
| Valideringsbehov | Hvem eller hva må bekrefte/avkrefte |
| Status | Utført internt, Validert eksternt osv. |
| Neste handling | Konkret neste steg |

## Claim-kategorier per spor (mål: ≥5 claims, ≥2 hypoteser per spor)

| Kategori | Eksempel |
|---|---|
| Problemclaim | Importavhengighet i fôr skaper sårbarhet og sirkularitetsmulighet |
| Ressursclaim | Sidestrømmer finnes, men kvalitet/logistikk begrenser høyverdig bruk |
| Barrierclaim | Regulering, innkjøp og markedsmakt hindrer skalering |
| Aktørclaim | Bestemte aktører kan validere eller bære et pilotspor |
| Pilotclaim | Et konkret case kan bli finansierbart innen roadmap-perioden |
| Adoptionclaim | En mekanisme kan endre praksis raskere enn ny teknologi alene |

## Spor A — Claims

Merk: ID-gap er bevisste og bevarer kontinuitet med eksisterende `Støtter claim`-referanser i evidence matrix.

| ID | Påstand | Type | Spor | Evidens | Konfidens | Risiko hvis feil | Valideringsbehov | Status | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CL-A-001 | NMBU/Foods of Norway viser at metanotroft bakterieprotein kan erstatte en betydelig del av soyaproteinkonsentrat i laksefôr i forsøk uten rapporterte negative effekter på vekst, fôrutnyttelse eller helse. Dette dokumenterer teknisk mulighet, ikke kommersiell skala. | Fakta | A | EV-A-001 | Høy | Roadmap kan lese forsøksresultat som markedsmoden løsning. | Sjekk originalartikkel før ekstern tallbruk. | Utført internt | Bruk som teknisk dokumentasjonspunkt i sporbrief A. |
| CL-A-002 | Gjærprotein fra norsk biomasse og encelleprotein er relevante FoU-spor for importsubstitusjon i fôr, men må vurderes mot kost, LCA, råvaretilgang og regulatorisk aksept. | Analyse | A | EV-A-001 | Medium | Kan prioritere et spor som er teknisk mulig, men økonomisk eller regulatorisk svakt. | Foods of Norway/NMBU og relevante industripartnere må bekrefte modenhet og barrierer. | Utført internt | Formuler intervjuspørsmål om modenhet, kost og regulatorisk vei. |
| CL-A-003 | Norden har sterke forsknings- og finansieringsmiljøer for alternative proteiner, med Danmark og større fond som tydelige tyngdepunkter. Norge ser foreløpig svakere ut på alternativ-protein-investeringer enn Danmark og Sverige. | Analyse | A | EV-A-002 | Medium | Norsk posisjon kan undervurderes hvis investeringer eller nye programmer mangler i kilden. | Kryssjekk mot aktive nordiske finansieringsprogrammer og investeringsdata. | Utført internt | Bruk som finansierings- og økosystempåstand med forbehold. |
| CL-A-005 | Sirkulære fôrruter, særlig insektbasert fôr på sidestrømmer, må risikovurderes case for case med et HACCP-lignende rammeverk. Substrat kan overføre kjemiske eller mikrobiologiske farer til biomasse. | Analyse | A | EV-A-003 | Høy | Pilot kan velges uten tilstrekkelig mattrygghetsdesign. | Mattilsynet, fageksperter og pilotaktører bør bekrefte risikovurderingskrav. | Utført internt | Legg inn risikokriterier i sporbrief A og B. |
| CL-A-006 | Tidligere matvarer, swill og avløpsbaserte ressurser kan være relevante sirkulære fôrressurser bare hvis ukjente farer, forekomstdata, skjebne i systemet og risikomodeller dokumenteres bedre. | Hypotese | A | EV-A-004 | Medium | Roadmap kan anta trygg ressursbruk der kunnskapshull fortsatt er styrende. | Aktørvalidering: Mattilsynet, EU/EØS-regelverkskompetanse og relevante FoU-miljøer må bekrefte hva som er lovlig og dokumenterbart. | Utført internt | Bruk som valideringshypotese i aktørpakke. |
| CL-A-011 | EU TSE/ABP-regelverk og krav til kategori 3-materiale ser ut til å være sentrale flaskehalser for hvilke sirkulære substrater som kan brukes i fôr. | Hypotese | A | EV-A-009 | Lav | Policysporet kan feilprioritere barrierer hvis juridisk tolkning er utdatert eller feil. | Aktørvalidering: juridisk sjekk mot gjeldende EU-tekst, Mattilsynet og bransjeaktører innen insektfôr. | Utført internt | Gjør juridisk primærsjekk før brief A ferdigstilles. |
| CL-A-012 | Axfoundations Framtidens foder kan være et relevant svensk benchmarkcase for nordisk sirkulært fôr, særlig for prosjektmodell, aktørnettverk og finansieringslogikk. | Hypotese | A | EV-A-010 | Lav | TG kan bruke et case som ikke har dokumenterte resultater eller relevant skaleringsmodell. | Aktørvalidering: Axfoundation eller offentlig prosjektdokumentasjon må bekrefte status, resultater og læringsverdi. | Utført internt | Legg Axfoundation på intervjushortlist. |
| CL-A-013 | Volare/Finnprotein er en relevant valideringsaktør for insektprotein, sidestrømsbasert fôr og nordisk industriell skalering. | Hypotese | A | EV-A-011 | Lav | Pilotlandskapet kan overvurdere kapasitet, kundestatus eller regulatorisk modenhet. | Aktørvalidering: Volare/Finnprotein, offentlige selskapsdata og eventuelle kunder/partnere må bekrefte kapasitet og status. | Utført internt | Legg Volare/Finnprotein inn som prioritert aktørintervju. |

## Spor B — Claims

| ID | Påstand | Type | Spor | Evidens | Konfidens | Risiko hvis feil | Valideringsbehov | Status | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CL-B-001 | Matsvinn og sidestrømmer oppstår ulikt mellom land og verdikjedeledd. Tiltak må skille mellom forebygging, redistribusjon og lavere verdsatt behandling. | Analyse | B | EV-B-001 | Medium | Briefen kan foreslå ett virkemiddel for strømmer som krever ulike løsninger. | Primærkildesjekk mot nasjonale matsvinn- og behandlingsdata. | Utført internt | Bruk som struktur for sporbrief B. |
| CL-B-002 | Husholdninger er en stor og vanskelig matsvinnkilde i nordisk kontekst, og rapportgrunnlaget peker på behov for kombinerte virkemidler. Atferd, teknologi, regulering og verdikjedesamarbeid må vurderes sammen. | Fakta | B | EV-B-002 | Høy | Roadmap kan overvurdere effekten av ett isolert tiltak. | Sjekk relevante nasjonale tall før ekstern publisering. | Utført internt | Knytt til C-sporet om adoption mechanisms. |
| CL-B-009 | Høyverdig bruk av sidestrømmer til waste-to-nutrition krever sikkerhetsstandarder, prosesstyring og regulatorisk avklaring like mye som biologisk egnethet. | Analyse | B | EV-B-006 | Høy | Pilotvalg kan baseres på råvaretilgang alene og overse mattrygghet. | Mattilsynet, industriaktører og FoU-miljøer må validere minimumskrav per substrat. | Utført internt | Gjør dette til designkrav i brief B. |
| CL-B-008 | Etter forebygging vil redistribusjon og bruk som dyrefôr ofte gi bedre miljøresultater enn biogass, kompostering, forbrenning og deponi. Rangeringen må likevel vurderes per fraksjon og lokale systemgrenser. | Analyse | B | EV-B-005 | Høy | TG kan overforenkle avfallshierarkiet eller bruke LCA-funn uten kontekst. | LCA-antakelser bør sjekkes mot fraksjon, substitusjon og lokalt energisystem. | Utført internt | Bruk som kaskadeprinsipp med forbehold. |
| CL-B-011 | Et food-to-waste-to-food-case viser at biogass, digestat og ny matproduksjon kan kobles i en næringsstoffløkke. Kilden fungerer som konseptbevis, ikke som generell systemløsning. | Fakta | B | EV-B-008 | Høy | Kan bli tolket som storskala økonomisk bevis. | Bekreft dagens regulatoriske krav, økonomi og aksept før caset brukes eksternt. | Utført internt | Bruk som illustrerende case i brief B. |
| CL-B-014 | Havre-okara og lignende plantebaserte sidestrømmer kan være kandidater for høyere verdi som mat- eller ingrediensråvare hvis volum, batchstabilitet, kvalitet og nåværende destinasjoner bekreftes. Innsamling, lagring, transport, holdbarhet og eksisterende avsetning kan være like avgjørende som teknisk anvendbarhet. | Hypotese | B | EV-B-011 | Lav | TG kan prioritere en råvarestrøm som er for liten, ustabil, logistisk dyr eller allerede bundet opp. | Aktørvalidering: produsenter, ingrediensaktører og logistikkpartnere må bekrefte volum, batchstabilitet, lagrings-/transportkrav, pris og bruk. | Utført internt | Valider med produsenter og logistikkpartnere før pilotprioritering. |
| CL-B-016 | RecoLab/Helsingborg kan være nordisk referansecase for næringsgjenvinning fra svartvann, men caseverdien avhenger av dokumentert tilkoblingsgrad, N/P/K-strømmer, sluttprodukter og regulatorisk status. | Hypotese | B | EV-B-013 | Lav | Roadmap kan bruke et infrastrukturcase uten verifisert overføringsverdi. | Aktørvalidering: NSVA/Helsingborg-kilder og relevante avløps-/gjødselmyndigheter må bekrefte data og regelverksstatus. | Utført internt | Legg RecoLab/Helsingborg inn i aktørvalideringspakken. |

## Spor C — Claims

| ID | Påstand | Type | Spor | Evidens | Konfidens | Risiko hvis feil | Valideringsbehov | Status | Neste handling |
|---|---|---|---|---|---|---|---|---|---|
| CL-C-001 | Adoption av sirkulær mat må forstås som samspill mellom regulering, håndheving og markedsstruktur, ikke bare som teknologiadopsjon. | Analyse | C | EV-C-001 | Medium | TG kan overprioritere teknologipiloter og undervurdere institusjonelle barrierer. | Primærkildesjekk av nasjonale policy- og konkurranseforhold. | Utført internt | Bruk som hovedramme i brief C. |
| CL-C-002 | Offentlige matinnkjøp kan fungere som etterspørselsmotor for sirkulære og bærekraftige løsninger hvis mål, kompetanse og kjøkkenpraksis er på plass. | Hypotese | C | EV-C-002 | Medium | Roadmap kan overdrive innkjøpsmakt uten å ta hensyn til operativ kapasitet. | Aktørvalidering: offentlige innkjøpere, kommunale kjøkken/HORECA og leverandører må bekrefte praktiske flaskehalser. | Utført internt | Formuler innkjøpsspørsmål til aktørintervjuer. |
| CL-C-004 | EU Farm to Fork gir overordnet politisk retning for bærekraftige matsystemer og 2030-mål for flere innsatsområder. Strategien dokumenterer retning, men ikke faktisk nordisk implementering. | Fakta | C | EV-C-003 | Høy | Kan forveksle politisk ambisjon med implementert praksis. | Sjekk nasjonal implementering og eventuelle forsinkelser før ekstern bruk. | Utført internt | Bruk som policybakgrunn, ikke effektbevis. |
| CL-C-006 | UTP-regulering må kobles til håndheving, rapporteringsvern og faktisk bruk for å påvirke markedsmakt i matverdikjeden. EU-evalueringen viser fortsatt behov for aktiv håndheving. | Analyse | C | EV-C-005 | Høy | TG kan foreslå regulering uten å adressere håndhevings- og rapporteringsrisiko. | Juridisk og nasjonal håndhevingssjekk i Norge/Norden. | Utført internt | Knytt til markedsstrukturdel i brief C. |
| CL-C-010 | PPWR vil påvirke sirkulær adoption i matverdikjeden gjennom krav til emballasjedesign, gjenbruk, materialeffektivitet og PFAS i matkontaktemballasje. | Fakta | C | EV-C-006 | Høy | Scope kan overse en regulatorisk driver som påvirker logistikk og innkjøp. | Bekreft EØS/nordisk implementering og aktørenes tilpasningskostnader. | Utført internt | Ta inn som compliance-driver i brief C. |
| CL-C-011 | EUDR gjør soya- og fôrråvareimport til et sporbarhets- og compliance-spørsmål, ikke bare et råvare- eller bærekraftstema. | Analyse | C | EV-C-007 | Høy | Fôrsporet kan undervurdere datakrav, leverandørkrav og due diligence-kostnader. | Juridisk sjekk av norsk/EØS-implementering og praktisk sporbarhetskrav. | Utført internt | Krysslink til sporbrief A. |
| CL-C-014 | Praktisk adopsjon skjer gjennom rutiner, sortering, infrastruktur og hverdagspraksis i butikker, husholdninger og biogassanlegg. Strategidokumenter alene flytter ikke praksis. | Analyse | C | EV-C-010 | Høy | Roadmap kan bli for policyorientert og for lite operativt. | Test mot intervjuer med dagligvare, avfallsaktører og kjøkken-/driftsmiljøer. | Utført internt | Bruk som prinsipp for adopsjonsdesign. |
| CL-C-015 | Roadmap bør inkludere operative sirkularitets-KPI-er for innkjøp, sidestrømmer, sporbarhet og reststrømshåndtering. KPI-ene må bare brukes hvis datatilgjengelighet og rapporteringssystemer bekreftes. | Hypotese | C | EV-C-011 | Lav | TG kan styre etter indikatorer aktørene ikke kan måle konsistent. | Aktørvalidering: offentlige innkjøpere, dagligvare, HORECA og data-/rapporteringsansvarlige må bekrefte målebarhet. | Utført internt | Bruk som KPI-hypotese i Phase 4-5. |

## Kontroll mot Phase 3 akseptkriterier

| Kriterium | Status |
|---|---|
| Minst 5 claims per spor | Oppfylt: A=8, B=7, C=8 |
| Minst 2 hypoteser per spor merket for aktørvalidering | Oppfylt: A=4, B=2, C=2 |
| Ingen claim er `Validert eksternt` | Oppfylt: alle claim-rader har status `Utført internt` |
| Forwards-link til briefs | Oppfylt i frontmatter via sporbrief A, B og C |
| Tydelig krysslink mellom EV-IDer og CL-IDer | Oppfylt: claim-tabellene peker til EV-IDer; evidence matrix har eksisterende `Støtter claim`-referanser for de brukte CL-IDene |
