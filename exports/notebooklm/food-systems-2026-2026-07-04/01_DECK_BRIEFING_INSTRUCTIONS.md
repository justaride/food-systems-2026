# Deck And Briefing Instructions For NotebookLM

Export date: 2026-07-04
Packet type: control
Status label: internal context
Allowed use: Use to generate sharper slide decks, presenter decks, infographics, mind maps and briefing docs.

## What This Source Is For

Give NotebookLM explicit artifact prompts so generated presentations cut through instead of becoming broad, generic sustainability material.

## Core Claims Or Working Propositions

- A useful deck must have a point of view, evidence, caveat and decision relevance on every slide.
- A Food Systems deck should preserve uncertainty as an insight rather than hiding it.
- Visual outputs must show empty cells, method labels and gate labels when the underlying source requires them.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Detailed deck | Use for read-ahead documents. | Must include evidence table and caveat per slide. |
| Presenter slides | Use when Gabriel/Cathrine will speak over the material. | Keep slide text sparse, put exact evidence in notes. |
| Infographic | Use only for citable or explicitly figure-ready material. | Never use do-not-visualize-yet rows. |
| Mind map | Use for exploratory structure. | Mind maps are not evidence of relationships beyond the sources. |

## Known Caveats

- NotebookLM slide revisions may not take sources into account, so regenerate from a corrected prompt when source grounding matters.
- Any deck must be checked against claim boundaries before external sharing.

## Deck Angles

- Prompt: Create a 12-slide presenter deck for Nordic food-system decision makers. Each slide must have one sharp claim, one evidence source, one caveat, and one "what to decide next".
- Prompt: Create a briefing memo that separates citable facts from PCQ/source-shortlist/actor-gated material.
- Prompt: Create an infographic only from packets marked citable or PCQ-ready with visible caveats; exclude do-not-visualize-yet material.

## Bad Generic Framing To Avoid

- Avoid "innovation will transform the food system" unless the source names the mechanism.
- Avoid "Nordic leadership" without country-specific evidence.
- Avoid charts that rank actors when the source says coverage is incomplete.

## Source Paths Included

- research/rammeverk/leveranseplan-wp3-food-systems.md
- research/evidence-pack/roadmap.md
- docs/project/mandates/R13-LAND-006-figurkandidater.md

## Source Excerpts

### research/rammeverk/leveranseplan-wp3-food-systems.md

````markdown
# Leveranseplan — WP3 Nordic Circular Food Systems

> Kontraktsforankret navigasjonsdokument for Food Systems 2026-arbeidet. Destillerer hva Nordic Innovation-kontrakten **P25013** faktisk forplikter oss til, og hvordan vi prioriterer resten av prosjektperioden mot offentlig publisering innen 31. juli 2026.

## 1. Kontraktsgrunnlag

| Felt | Verdi |
|---|---|
| Kontrakt | **201-2503-P25013** |
| Signert | 16. oktober 2025 |
| Periode | 8. august 2025 – 31. juli 2026 |
| Program | 201 – Innovative Solutions for 2030 |
| NI-finansiering WP3 | **NOK 250 000** |
| Consortium in-kind WP3 | **NOK 250 000** |
| Total WP3-budsjett | **NOK 500 000** |
| WP3 Lead | Natural State (NO) |
| Project Owner | Nordic Circular Hotspot AS |
| Faglig kontraktspartner NI | Hanna Törmänen, Marthe Haugland, Peter Munch-Madsen |

**Kontraktsdokumentasjon i plattformen:**
- `research/external/nch-contract/contract-201-2503-P25013.pdf` (original)
- `research/external/nch-contract/contract-201-2503-P25013.md` (ekstrakt)

## 2. Sammenligning WP1 Cities ↔ WP3 Food Systems

Cities er vår nærmeste parallell: samme lead, samme budsjett, men med ~1 års forsprang i modenhet.

| Dimensjon | WP1 Cities | WP3 Food Systems |
|---|---|---|
| Budsjett | 500k (250 NI + 250 in-kind) | 500k (250 NI + 250 in-kind) |
| Lead | Natural State (NO) | Natural State (NO) |
| Launch | Nordic Circular Summit 2024 (Helsinki) | Fall 2025 |
| Modenhet v/signering | ~12 mnd operativ | ~2 mnd operativ |
| Demand-side forankring | 7 byer forankret (Helsinki, Tampere, Vantaa, Copenhagen, Oslo, + LT, regional) | 6 aktører *identifisert*, ikke forankret (Tine, Nortura, Arla, Orkla, Rema, Norgesgruppen) |
| Finansielle partnere | NEFCO, FundForward, Regeneration.VC, Invest-NL | Ingen identifisert i kontrakten |
| Akademia | — (municipal-drevet) | University of Eastern Finland, NMBU, Linköping (Prof. Lindahl) |

### Hovedinnsikt
Cities har et forsprang vi ikke kan hente inn på 9 måneder. Vi må kompensere på tre måter:

1. **Forhåndsforankre demand-side** med de seks identifiserte selskapene som "motytelse" for manglende tidskreditt
2. **Bruke plattform + research-underlag** (dette prosjektet) som *kunnskapsforsprang* som erstatter prosessmodning
3. **Spisse roadmap mot piloter** som kan kjøre etter juli 2026 — der Cities' neste steg er investeringsskalering, kan vi tilby at roadmap-en åpner konkrete piloter som finansieres av andre kilder

## 3. Hva WP3 kontraktsmessig MÅ levere

### 3.1 Seks milepæler (kontraktens WP-tabell, M13–M18)

| # | Milepæl | Deadline (estimert) | Ansvarlig leveranse |
|---|---|---|---|
| M13 | Recruit and engage relevant stakeholders | Q4 2025 → Q1 2026 | Stakeholder-register, signert interesse |
| M14 | Define a contextually relevant plan for activities within the TG | Q1 2026 | TG aktivitetsplan |
| M15 | Execute workshops and other relevant activities | Q1–Q2 2026 | Workshop-referater, innsiktslogg |
| M16 | **Write a strategic roadmap that summarizes key insights** | Q2 2026 | Roadmap-utkast |
| M17 | **Publish the roadmap and present results in a public online event** | Juni/juli 2026 | Publisert roadmap + offentlig event med NI invitert |
| M18 | Discuss possible next steps and make plan for further action | Juli 2026 | Continuation plan |

### 3.2 Kollektive TG-mål (Annex 2, gjelder alle fire TG-er)

Alle må oppfylles av WP3:

- [ ] Identifisere og prioritere key challenges, opportunities, knowledge gaps, innovation concepts, best practices
- [ ] Identifisere og prioritere policy and regulatory actions, incentives, instruments
- [ ] Utforske metrics and reporting frameworks for sirkulær ytelse og impact
- [ ] **Definere en roadmap for sirkulær overgang av sektoren** (markert som *key objective* i kontrakten)
- [ ] Presentere resultater på Nordic Circular Summit og andre konferanser
- [ ] Promotere innsikter som ambassadører + fasilitere cross-border collaboration
- [ ] Etablere gruppen som kollaborativ arena utover prosjektperioden

### 3.3 WP3-spesifikke prosjektmål (Annex 2)

1. **Policy recommendations** for skalering av sirkulære matsystemer med forbrukertillit
2. **Identifisere piloter** som reduserer utslipp, bedrer ernæring, styrker nordisk selvforsyning/resiliens
3. **Roadmap-metrikk** som integrerer ernæring + klima + biodiversitet
4. **Forretningsmodeller** som kobler primærproduksjon, prosessering, konsum i sirkulære sløyfer
5. **Høy-potensielle verdikjeder:** tang, alternative proteiner, fermentering, oppgradering av biprodukter

### 3.4 Food Systems generelle mål (Annex 2)

- Mappe kritiske matsystemavhengigheter og designe pathways for redusert importavhengighet og økt sikkerhet
- Lukke nærings- og ressurssløyfer og valorisere sidestrømmer, matsvinn, biobaserte reststoffer
- Akselerere regenerative praksiser og klimapositive regionale fôr- og matproduksjon tilpasset nordiske forhold
- Fostre samarbeid mellom landbaserte og marine matsystemer for integrert sirkularitet

## 4. Partnere og stakeholders (kontraktsforankret)

### Akademiske/institusjonelle partnere (Annex 2)
- **Centre for Circular Economy** (DK)
- **Hringrásarsetur** (IS)
- **University of Eastern Finland** (FI)
- **Norges miljø- og biovitenskapelige universitet (NMBU)** (NO)
- **Circular Innovation Lab** (DK)
- **Linköping University** (SE) — via Prof. Mattias Lindahl

### Supply-side (selskaper og initiativer identifisert)
- Swedish Cradlenet-medlemmer inkl. **AxFoundation**
- Norsk HoReCa: **Fiskeriet, Gamlebyen Mat & Drikke, Fuglen**
- Natural State-affilierte: **Vesterålen local foods, Ravnedalen Live, Biosirk**
- Innovative SMEs: **Smartsoil** (NO), **Volare** (FI)
- **Iceland Ocean Cluster** (IS)
- **Nalik Ventures** (GL)
- **Ministry of the Environment** (Faroe Islands)
- **BIO** (NO) via Ivar Horneland Kristiansen

### Demand-side (identifisert, ikke forankret)
**Tine, Nortura, Arla, Orkla Foods, Lantmännen, Rema 1000, Norgesgruppen**

> Dette er WP3s svakeste kontraktsforankring — aktørene er "identified as relevant demand-side stakeholders", ikke forpliktet. Å bevege dem fra *identifisert* til *engasjert* innen M13-ferdigstillelse er førsteprioritet.

## 5. Anbefalt leveransestrategi

### 5.1 Hovedleveransens format

**Roadmap som kontraktsleveranse, whitepaper som kommunikasjonsinnpakning.**

Kontrakten krever en "strategic roadmap" og en "public online event". Food Systems 2026-whitepaper er ikke eksplisitt nevnt, men fungerer som roadmap-ens publiseringsformat. Dermed:

- **Roadmap = kontraktsleveranse** (strukturert dokument med policy recs, metrics, piloter, forretningsmodeller, verdikjeder)
- **Whitepaper = offentlig presentasjon av roadmap** (narrativ, kontekstualisert, distribueringsvennlig)
- **Online event = M17** (juni/juli 2026, NI invitert, roadmap lansert)

### 5.2 Kapitlenes mapping mot kontraktskrav

Hver seksjon i whitepaper/roadmap må dekke minst ett kontraktskrav. Forslag til kapittelstruktur som adresserer alle kravene:

| Whitepaper-kapittel | Dekker kontraktskrav |
|---|---|
| 1. Nordic food system state (kontekst) | Challenges, opportunities, knowledge gaps |
| 2. Verdikjedeanalyse (plattformens data) | Mapping food system dependencies, import reliance |
| 3. Aktørlandskap og maktkonsentrasjon | Relevant stakeholders (supply + demand) |
| 4. Policy recommendations | WP3 objective #1 + kollektivt mål |
| 5. Metrics framework (ernæring + klima + biodiversitet) | WP3 objective #3 + kollektivt mål |
| 6. Circular business models | WP3 objective #4 |
| 7. Høy-potensielle verdikjeder (tang, alt-protein, fermentering) | WP3 objective #5 |
| 8. Pilotportefølje (3–5 konkrete piloter) | WP3 objective #2 + outcomes |
| 9. Roadmap 2026–2030 | **Key objective** (kollektivt) |
| 10. Next steps / continuation plan | M18 |

### 5.3 Prioriterte grep for resten av prosjektperioden

**Umiddelbart (april–mai 2026):**
1. Flytte demand-side fra *identifisert* til *engasjert* — formell henvendelse til Tine, Nortura, Arla, Orkla, Rema, Norgesgruppen med deltakelse i minst én workshop som leveranse
2. Formalisere akademiske partnere — bekrefte at UEF, NMBU, CCE, Hringrásarsetur og Linköping stiller med bidrag til roadmap
3. Planlegge M17 offentlig online event (juni/juli) — dato, format, deltakeresegmentering, NI-invitasjon

**Juni 2026 (Nordic added value evaluering nevnt i møtenotater 09.03.2026):**
- Intern evaluering hvor mye vi faktisk har levert mot milepælene
- Beslutning om roadmap-struktur og whitepaper-format
- M16-leveransen (roadmap-utkast) må være klar

**Juli 2026 (M17):**
- Publisert roadmap
- Offentlig online event gjennomført
- M18 continuation plan dokumentert

### 5.4 Risikopunkter

| Risiko | Beskrivelse | Mitigering |
|---|---|---|
| **Demand-side forankring** | De seks matkonsernene er ikke kontraktsforpliktet, kun identifisert. Får vi dem ikke i rommet, blir roadmap rein desk research | Direkte outreach via Einar/Martin/Natural State-nettverket; minst tre aktører må delta på M15-workshop |
| **Tidskompresjon vs. Cities** | Cities hadde 12 mnd modningstid, vi har 9 mnd til M17 | Bruke plattformen + research som modningserstatning; ikke forsøke å replikere Cities' prosess |
| **NECC-avslag økonomisk ringvirkning** | Natural State i permitteringsmodus fra 27.03.2026 pga NECC-avslag | WP3 er kontraktsfinansiert ut juli 2026 og påvirkes ikke av NECC-avslaget; men tilgjengelig lønnsmasse hos Natural State kan bli redusert |
| **Metrics framework kompleksitet** | Integrere ernæring + klima + biodiversitet er faglig krevende | Lene seg på Lindahl (Linköping), UEF, NMBU for metrikkgrunnlag |
| **Kontraktsforpliktelsen "ambassadører"** | Kollektivt mål krever at TG-medlemmer opptrer som ambassadører utover prosjektperioden | Bygge inn kommunikasjonsverktøy i selve whitepaper-et så alle deltakere har noe å distribuere |

## 6. Kobling til Food Systems 2026-plattformen

Plattformen (denne applikasjonen) er *kunnskapsinfrastrukturen* som gjør roadmap mulig å skrive på 9 måneder. Konkrete plattform-leveranser som mapper mot kontraktskrav:

| Plattform-komponent | WP3 kontraktskrav den støtter |
|---|---|
| Aktørregister (maktkonsentrasjon, verdikjeder) | Stakeholder mapping (M13), kapittel 3 |
| Verdikjedeanalyser (`research/norden/verdikjede/`) | Food system dependencies, import reliance |
| Policy-research (`research/norge/`, `research/norden/`) | Kapittel 4 Policy recommendations |
| Evidence pack (`research/evidence-pack/`) | Kildegrunnlag for roadmap + whitepaper |
| Konsulentrapport-bibliotek | Metrics-grunnlag + forretningsmodellanalyse |
| Whitepaper-utkast (`research/whitepaper/`) | Kapittel 1–10 draft |

## 7. Dokumenter denne planen refererer til

- **Kontrakt:** `research/external/nch-contract/contract-201-2503-P25013.md`
- **Møtenotater 09.03.2026:** Stikkord fra møte om Food Systems (Gmail, Martin Hagen → Gabriel)
- **NCH Notion hovedside:** `research/external/notion/nch-hovedside.md`
- **Applications-datamodell:** `src/lib/data/applications.ts` (nch-2025)
- **NECC avslag kontekst:** Gmail thread, 27.03.2026 (`Decision letter_254260.pdf` — relevant for Natural State organisasjonskontekst, ikke WP3 direkte)
````

### research/evidence-pack/roadmap.md

````markdown
# Evidence Pack #7: Roadmap (1–3 år)

**Prosjekt:** Food Systems 2026
**Dato:** 25. mars 2026
**Status:** Utkast v1.0

---

## Overordnet tidslinje

```
2026 Q1–Q2    Fase 1: Kunnskapsgrunnlag og mobilisering
2026 Q3–Q4    Fase 2: Nordisk pilotering og partnerskap
2027 Q1–Q4    Fase 3: Skalering og policyintegrasjon
2028 Q1–Q4    Fase 4: Institusjonalisering og evaluering
```

---

## Fase 1: Kunnskapsgrunnlag og mobilisering (mars–juni 2026)

### Leveranser

| Leveranse | Ansvarlig | Frist | Status |
|-----------|-----------|-------|--------|
| Whitepaper v2.0 med intervjuer | Gabriel + Cathrine | 30. april | Under arbeid |
| TG Charter godkjent av NCH-styret | Cathrine + Einar | 15. april | **KREVER WORKSHOP** |
| Stakeholder-intervjuer (5 stk) | Gabriel + Cathrine | 30. april | Planlagt |
| Nordisk datavalidering (SE, DK) | Michel Bajuk, Betina Simonsen | 15. april | Venter på utsending |
| Evidence Pack komplett (8/8) | Gabriel | 31. mai | 4/8 ferdig |
| Presentasjon for NCH-styret | Cathrine | Juni 2026 | Ikke startet |

### Milepæler

- **April 2026:** TG Charter signert → formelt mandat for videre arbeid
- **Mai 2026:** Whitepaper v2.0 sirkulert til nordiske partnere for kommentar
- **Juni 2026:** NCH-styrepresentasjon → beslutning om fase 2-finansiering

### Avhengigheter

- TG Charter (EP #1) blokkerer formalisering av partnerskap
- Intervjuer blokkerer whitepaper §3, §5, §6
- Nordisk validering blokkerer figur 6–9 og §4

---

## Fase 2: Nordisk pilotering og partnerskap (juli–desember 2026)

### Leveranser

| Leveranse | Ansvarlig | Frist |
|-----------|-----------|-------|
| Nordisk partnerkonsortium formalisert | NCH + partnere | Sept 2026 |
| Pilot 1: Åpen logistikktilgang — konseptstudie | TG + ekstern konsulent | Okt 2026 |
| Pilot 2: Kommunal innkjøpsstandard — pilotkommune | TG + kommune | Nov 2026 |
| Søknad: Nordic Innovation / Horizon Europe | Gabriel + Cathrine | **Se EP #6** |
| Nordisk policy brief (4 land) | TG | Des 2026 |

### Pilotbeskrivelser

**Pilot 1: Åpen logistikktilgang**
- Konseptstudie av regulert tredjepartstilgang til dagligvaredistribusjon
- Modellert etter telekommunikasjonssektorens åpningstiltak (Telenor → full konkurranse)
- Samarbeid med Konkurransetilsynet og transportøkonomiske forskningsmiljøer
- **KREVER:** Ekstern konsulentfinansiering (est. 500 000–1 000 000 NOK)

**Pilot 2: Kommunal innkjøpsstandard**
- Utvikle og teste bærekraftige innkjøpskriterier for offentlig matinnkjøp
- Pilotkommune med eksisterende klimaambisjon (f.eks. Oslo, Bergen, Trondheim)
- Integrere konsentrasjonsrisikoanalyse i anskaffelsesprosessen
- **KREVER:** Kommunal partner + workshop

### Finansieringsvinduer

- **Nordic Innovation Open Call:** Typisk Q3/Q4 — søknadsfrist overvåkes
- **Horizon Europe Cluster 6:** 2026-utlysninger (HORIZON-CL6-2026-FARM2FORK) — se EP #6
- **Forskningsrådet BIONÆR:** Løpende mottak — relevant for pilotfinansiering

### Avhengigheter

- NCH-styrebeslutning (fase 1) blokkerer konsortiumformalisering
- EP #6 (Finance Note) informerer søknadsstrategi
- Commitment Map (EP #3) identifiserer pilotpartnere

---

## Fase 3: Skalering og policyintegrasjon (2027)

### Mål

- Utvide fra 2 piloter til 4–6 nordiske case-studier
- Integrere resultater i nasjonal og nordisk policyprosess
- Bygge permanent kunnskapsplattform

### Leveranser

| Leveranse | Ansvarlig | Frist |
|-----------|-----------|-------|
| Nordisk sammenligningsrapport v2.0 | TG + akademiske partnere | Q2 2027 |
| Policy-innspill til Meld. St. / NOU-prosess | TG | Løpende |
| 4–6 nordiske piloter dokumentert | TG + partnere | Q4 2027 |
| Akademisk publikasjon (peer-reviewed) | Gabriel + NMBU/NHH | Q4 2027 |
| Kunnskapsplattform åpen for offentligheten | Gabriel | Q2 2027 |

### Policyintegrasjon

| Kanal | Handling | Tidspunkt |
|-------|---------|-----------|
| Stortingets næringskomité | Innspill til dagligvaremelding | Når melding varsles |
| Konkurransetilsynet | Erfaringsdeling fra nordisk sammenligning | Løpende |
| Dagligvaretilsynet / nytt organ | Innspill til høringsrunder | Ved høring |
| Nordisk ministerråd | Policy brief via NCH-nettverk | Q1 2027 |
| EU DG COMP | Innspill til UTP-evaluering | 2027 |

### Avhengigheter

- Fase 2-piloter gir empiri for policy-innspill
- Akademisk partner (NMBU/NHH) kreves for publisering
- Plattformutvikling avhenger av teknisk kapasitet og hosting

---

## Fase 4: Institusjonalisering og evaluering (2028)

### Mål

- Forankre matkonsentrasjon som permanent politisk tema i Norden
- Etablere TG som referansepunkt for nordisk matpolitikk
- Evaluere og dokumentere effekt

### Leveranser

| Leveranse | Tidspunkt |
|-----------|-----------|
| Effektevaluering av piloter | Q1 2028 |
| Nordisk matkonsentrasjonsindeks (årlig publikasjon) | Q2 2028 |
| Institusjonell forankring — vedtak om videreføring | Q2 2028 |
| Sluttrapport og anbefalinger | Q4 2028 |

---

## Risikomatrise

| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|
| Manglende TG Charter-godkjenning | Middels | Høy — blokkerer fase 2 | Tidlig styredeltakelse, forankring |
| Utilstrekkelig finansiering for piloter | Høy | Middels | Diversifisert søknadsstrategi (EP #6) |
| Partnere trekker seg | Lav | Middels | Redundans i partnerkonsortium |
| Politisk motstand fra bransjeaktører | Middels | Middels | Evidensbasert kommunikasjon, bred allianse |
| Kontekstendring (ny regjering, ny regulering) | Middels | Lav-Middels | Fleksibel strategi, løpende oppdatering |

---

## Seksjon som krever menneskelig input

> **Følgende elementer kan ikke ferdigstilles uten workshop eller intervjuer:**
>
> - [ ] Konkrete pilotpartnere og -kommuner (krever Commitment Map, EP #3)
> - [ ] NCH-styrets prioriteringer og budsjettramme (krever styremøte)
> - [ ] Nordiske partneres kapasitet og tidsplan (krever validering, Mission 2)
> - [ ] Akademisk partneravtale (NMBU/NHH) — krever kontakt
> - [ ] Detaljert budsjett per fase (krever Finance Note, EP #6)

---

*Denne roadmapen gir en strukturert tidslinje for Food Systems 2026-prosjektets utvikling fra kunnskapsgrunnlag til institusjonalisert nordisk samarbeid. Den krever regelmessig oppdatering etter hvert som avhengigheter avklares og finansiering sikres.*
````

### docs/project/mandates/R13-LAND-006-figurkandidater.md

````markdown
# R13-LAND-006 — Figurkandidat-oversikt for whitepaper

## Hva dette er — og hva det ikke er

Dette er et **internt arbeidsregister** over hvilke R13-funn som *teknisk kunne bli* en figur, tabell, case-card eller kart i et eventuelt fremtidig whitepaper. Det er en kartlegging, **ikke en godkjenning til å publisere**, og **ikke en faktastemme**.

- Hver kandidat beholder **gaten fra originalfilen** (PCQ / source-shortlist / actor-gate / forstaelse / internal / parkert). Ingen funn er oppgradert fordi det ville gitt en god figur. En klar dataserie og en figur-klar dataserie er ikke det samme: gate avgjør, ikke estetikk.
- Kolonnen **Figur-klar?** sier kun om funnet *per nå* har den datakvaliteten + synlige tomme cellene en ærlig figur krever — den endrer ikke gaten.
- Filen er ikke siterbar, åpner ingen ekstern claim, ingen DB-skriving, ingen `safe_for_ai_context`, ingen deck-/whitepaper-stemme.
- **Overclaim-vakt:** ingen kandidat er listet uten både gate, status og en eksplisitt figur-klar-vurdering. Funn som er Type C, PCQ-med-C-hull, eller parkert er listet — men flagget *ikke figur-klar* med grunn. En C-luke skal aldri fremstå som figur-klar data.

Kilde: syntese fra R13 batch 01–12 (`r13-intake-index-2026-06-25.md` + de underliggende batch-filene) og claim-lock-/PCQ-status i `food-tg-claim-lock-table-2026-05.md`. Ingen ny primærresearch.

## Kort dom

R13 inneholder en håndfull funn som er nær figur-klare som tabell/figur — først og fremst dagligvarekonsentrasjon (KT 2024), vertikal-integrasjonskjedene (28 koblinger fra årsrapporter), marint restråstoff R-stige, proteinselvforsyning (rå vs. fôrkorrigert), og biodiversitetsindikatorene. Flertallet av R13-funnene er derimot **ikke figur-klare**: de er enten PCQ med navngitte C-celler, source-shortlist (kildekort, ikke claim), actor-gate (mangler aktør-/volumdata), eller `forstaelse`/`internal` (arbeidskart, ikke faktastemme). Av ~30 kandidater under er ca. 6–8 figur-klare *med synlige tomme celler og caveat*, resten er kandidater-blokkert til neste kontrollsteg.

## Sterkeste kilde

Dette er en **syntese**, så "sterkeste kilde" er det sterkeste underliggende R13-grunnlaget: R13-LAND-001 (Konkurransetilsynets Dagligvarerapport 2024, A), R13-LAND-002 (konsernårsrapporter + BAMA-eierseksjon, A), R13-WASTE-001 (SINTEF/FHF Analyse marint restråstoff 2024, A, fulltekst), R13-PROT-007 (NIBIO/Helsedirektoratet 2025, A) og R13-OKO-004 (NIBIO 3Q + Naturindeks 2025, A). Disse fem har primærkildedekning som tåler en figur dersom tomme celler vises.

## Svakeste punkt

Selve registeret arver alle svakhetene i underlaget: mange "fristende" funn (fiskefôr-andeler, grossistprosenter, aktør-/volumserier for altprotein og CEA, nasjonal SOC-baseline, protein-gram-serie) ser tabellklare ut men er C-hull. Den største risikoen ved et figur-register er nettopp at en C-luke pakkes inn som en pen figur. Registeret kan dessuten gi falsk inntrykk av at "mange figurer er klare" — i realiteten er stoppregelen «ikke visualiser R13 før gate, dataklasse, svakeste punkt og tomme celler vises i selve figuren» (intake-index) bindende for alle rader.

## Figurkandidater

Kolonner: **Funn | Figurtype | Kilde-ID (R13) | Gate | Status | Figur-klar? (ja/nei + grunn) | Caveat**

### Domene: Landskap / makt

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Dagligvarekonsentrasjon: NG 43,5 %, Coop 29,2 %, REMA 23,9 %, Bunnpris 3,3 % (2024) | Stolpe-/kakediagram | R13-LAND-001 | PCQ | importer | **Ja** — 4 kjeder ≈ 100 %, A-kilde (KT 2024), tomme celler ligger i andre ledd, ikke i dagligvare | Coop oppgir selv 29,3 %; «~100 %» må vises som fire konkurrenter, ikke monopol |
| Vertikal integrasjon: 28 dokumenterte konsern→ledd-koblinger | Sankey/nettverk/integrasjonskart | R13-LAND-002 | PCQ | importer | **Ja, betinget** — A-kilder for hovedledd; men 6 navngitte PCQ-tomme celler MÅ vises (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) | Eierandel på underdatterselskap delvis C; ikke fremstill 49 %-Nova Sea som heleid |
| Foredlingskonsentrasjon: Nortura ~65–70 % rødkjøtt, Tine ~72,9 % melk (2023) | Tabell | R13-LAND-001 | PCQ | importer | **Nei** — Tine 2024 ikke isolert (B/C); Norturas slakteandel i % er C (NOEK ikke i åpen tabell) | Ikke si Tine >80 %; merk samvirke/markedsregulator-kontekst |
| Grossistledd: tre vertikalt integrerte fullsortimentsgrossister (ASKO/Coop/REMA Distr.) | Tabell/struktur-diagram | R13-LAND-001 | PCQ | importer | **Nei** — ingen offentlige prosentandeler per grossist (C); kun utledet | Kvalitativ strukturbeskrivelse mulig, men ingen prosentfigur |
| Fiskefôr-oligopol: Skretting/Cargill/BioMar | Kake-/stolpediagram | R13-LAND-001 | PCQ | importer | **Nei** — 2024-andeler er C; siste tall er 2012/estimat (iLaks/Studocu) | Ikke gi prosentandeler uten 2024-primærkilde; alle tre utenlandsk eid |
| Helsystem-kart, ti-node aktørtypologi | Oversiktsfigur / systemkart | R13-LAND-003 | forstaelse | vent (arbeidskart) | **Nei** — `forstaelse`, ikke faktastemme; blinde flekker (WASTE, regenerativ) | Kan inspirere whitepaper-struktur, men kan ikke presenteres som datafigur |
| Datagap-atlas: 60+ C-hull i 10 domener | Heatmap / gap-matrise | R13-LAND-004 | internal | vent | **Nei (som ekstern figur)** — intern kartleggingsmatriks, ikke siterbar | Stoppliste forbyr nordisk/datagap-figur uten scope+metode+gate; egnet kun internt |

### Domene: Waste / sidestrømmer

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Marint restråstoff R-stige: 1,094 mill. t, 89 % utnyttet, 15 % konsum / 66 % fôr / 19 % energi (2024) | R-stige / verdihierarki-figur | R13-WASTE-001 | PCQ | importer | **Ja, betinget** — A-fulltekst (SINTEF/FHF); MÅ vise tomme celler (eksportvolum per R-nivå, biogass-tonn avledet) og skille utnyttet fra høyverdi | «Utnyttet ≠ høyverdi»; eksport er kryssende destinasjon, ikke R-nivå |
| Husholdnings-/detaljmatsvinn: husholdning 193 200 t (2023), dagligvare 43 600 t (2024) | Tverrledd stolpediagram | R13-WASTE-004 | PCQ | importer | **Nei** — husholdning 2024 mangler, matindustri kun t.o.m. 2022; ulike basisår/metoder | Ingen tverrledd-figur før alle ledd har samme år+metode |
| Dagligvare matsvinn –47 % mot baseline | Trend-/baseline-figur | R13-WASTE-008 | source-shortlist | vent | **Nei** — sektorbaseline finnes, men ingen tiltaks-isolasjon med kontrollgruppe | «Måltider reddet» ≠ effektbevis (jf. CL-B-022 `klar-med-forbehold`) |
| Matsvinn-redistribusjon: Matsentralen 5 735 t (2024) | Kanalsammenligning / total | R13-WASTE-003 | source-shortlist | vent | **Nei** — TGTG 2024 er C; ingen nasjonal total uten metodebro | Ingen redistribusjonstotal-figur før per-kanal-tall foreligger |
| Oppdrettsslam massebalanse: 535 412 t slam / 14 000 t P (2019, modellert) | 3-kolonners massebalanse | R13-WASTE-002 | PCQ (parkert) | parkert | **Nei** — modellert ≠ innsamlet ≠ behandlet; åpne merder samler ~0; tre kolonner ukoblet | Parkert til aktør-/primærdata kobler kolonnene; ingen massebalanse-figur |
| Industrielle sidestrømmer: bryggeri ~17 000 t, slakteri ~264 000 t | R-stige / sektor-tabell | R13-WASTE-007 | source-shortlist | vent | **Nei** — tall fra 2016 (~10 år); meieri aktørformidlet; per-fraksjon C | Ingen sektorrangering før oppdaterte primærtall + bruk/potensial skilt |
| Kaffegrut / SCG: 70 000–84 000 t/år vått (avledet) | Massestrøm-figur | R13-WASTE-006 | source-shortlist | vent | **Nei** — dobbelt avledet estimat (B); ingen SSB-fraksjon; HORECA er C | Ingen massestrøm-/R-stige-figur før SSB-API + HORECA-data |
| Digestat NPK-retur: SE-tall (N 5,1 / P 0,60 / K 2,1 kg/t) | NO/SE-sammenligningstabell | R13-WASTE-005 | PCQ → actor-gate | vent | **Nei** — Norge B/C; ingen nasjonal aggregering; K særlig svak | SPCR 120 aggregerer ikke NO-data; ingen norsk NPK-figur uten primærmåling |

### Domene: Protein

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Proteinselvforsyning: rå 41,3 % / fôrkorrigert 34,9 % (2024) | Dobbel-søyle med metodeetikett | R13-PROT-007 | PCQ | vent | **Ja, betinget** — A-kilde; MÅ ha metodeetikett (rå/fôrkorrigert) og vise at fiskefôr er ekskludert | Protein-gram-serie er C; fôrkorrigert dekker ikke akvakultur |
| Soya/SPC-erstatning i fôr: SPC ~21 %, fiskemjøl 65 %→12 % (1990→2020) | Tidsserie / stacked area | R13-PROT-006 | PCQ | vent | **Nei (post-2020)** — ressursregnskap 2020 er siste A-kilde; post-2020 er B/C | Ingen erstatningsgraf etter 2020 uten nyere Nofima/FHF-primærkilde |
| Norsk belgvekstareal ~86 000 daa (2024) | Arealtrend-figur | R13-PROT-008 | source-shortlist | vent | **Nei** — areal er B (NIBIO); volum (tonn) mangler som SSB-serie (C) | Ikke kombiner ert+åkerbønne uten SSB-tabell; ikke bland mat/fôr |
| Plantebasert humanprotein: marked/produsent/volum/råvare | Markedsandels-figur | R13-PROT-004 | source-shortlist | vent | **Nei** — ingen åpen tabell kobler produkt, volum, andel og råvareopprinnelse | Marked-/råvareprofil med C-felt; ingen andelsgraf |
| Insektprotein aktørledger (Norge/Norden) | Aktør-/volumledger | R13-PROT-001 | source-shortlist | vent | **Nei** — FoU/pilot/kapasitet; åpent realisert fôrvolum mangler (C) | Ikke bland kapasitet og realisert; jf. CL-A-021 `krever-bekreftelse` |
| Single-cell / fermenteringsprotein (Unibio, Solar Foods) | Teknologi-/kapasitetsledger | R13-PROT-002 | source-shortlist | vent | **Nei** — kapasitet/LOI/førsteforsendelse ≠ årsvolum; mat og fôr blandes lett | Ingen kapasitetsfigur som blander mat, fôr, plan og produksjon |
| Musling/tang/tare som fôrprotein | FoU-/datagapledger | R13-PROT-003 | source-shortlist | vent | **Nei** — FoU/potensial sterkt, kommersiell volumserie mangler | Ingen marint-proteinvolumfigur før realisert vs. potensial skilt |
| Presisjonsfermentering / dyrket kjøtt: realisert EU/NO-volum = 0 | Status-/regulatorisk figur | R13-PROT-005 | forstaelse | vent (bakgrunnskart) | **Nei** — `forstaelse`; ingen EU/NO-godkjenning; Mattilsynets stilling er C | Ingen statusrangering uten regulatorisk godkjenning + realisert volum |

### Domene: Innovasjon

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Failure/survival-ledger: 5 av 9 aktører konkurs/avviklet siden 2019 | Case-card-sett / ledger-tabell | R13-INNO-004 | source-shortlist | vent | **Delvis (case-card, ikke dom-figur)** — Rest AS er A (Brreg); øvrige B; Nordic Harvest C | Konkurs ≠ teknologisvikt; ikke bland teknologisvikt og forretningssvikt i én dom-figur |
| CEA / vertikalt landbruk: Onna Greens 17,5 mill. oms / −9,6 mill. drift (2024) | Aktør-case-card | R13-INNO-001 | source-shortlist | vent | **Nei (som sektorfigur)** — Onna er A, men ingen aktør oppgir realisert tonn/år (C) | Ambisjon ≠ realisert (Himmelgrønt planmål B/C); ingen produksjonsvolum-figur |
| Agritech/foodtech-økosystem: NCE Heidner 50+ medl. | Økosystem-/klyngekart | R13-INNO-002 | source-shortlist | vent | **Nei** — aggregert VC-statistikk er C; medlemsmasse-oms (66 mrd.) ≠ klyngekapital | Ingen aggregert kapitalfigur; nasjonal strategi ikke vedtatt |
| Konverteringsbarrierer: 7 kategorier | Barriere-rammeverk / matrise | R13-INNO-005 | source-shortlist | vent | **Nei** — norsk-spesifikk kvantitativ evidens C for nær alle | Ingen barriere-rangering uten norsk kvantitativ evidens |
| FoU-aktører: 30+ aktive prosjekter | FoU-landskapskart | R13-INNO-006 | source-shortlist | vent | **Nei** — budsjett/bemanning per prosjekt C; prosjekt ≠ resultat | Listen ikke fullstendig; ingen av prosjektene gir nåtidsvalidering |
| Offentlig innovasjonsetterspørsel: FUSILLI, Oslo 46-tiltaksplan | Portfolio-/case-figur | R13-INNO-007 | source-shortlist | vent | **Nei** — caser avsluttet/uklart operativ; DFØ er verktøy, ikke case; Doffin C | Ikke behandle DFØ-veiledning som implementert case (jf. CL-C-002 `krever-bekreftelse`) |

### Domene: Økologi / jord / biodiversitet

| Funn | Figurtype | Kilde-ID | Gate | Status | Figur-klar? | Caveat |
|---|---|---|---|---|---|---|
| Biodiversitet: kulturlandskapsfugler −25 % siden 2000 (indeks 75, basis 100) | Tidsserie-figur | R13-OKO-004 | source-shortlist | importer | **Ja** — A-kilde (NIBIO 3Q, DOI); konsistent 2000–2023-serie | Proxy for landskapskvalitet, ikke kausalitet; ikke si «biodiversiteten i fri fall» |
| Naturindeks åpent lavland = 0,445 (lavest av 7 økosystemer) | Sammenligningsstolper | R13-OKO-004 | source-shortlist | importer | **Ja, betinget** — A (Naturindeks 2025); aggregert indeks, ikke direkte bestandstall | Indirekte mål via naturtypetilstand; forklar skala 0–1 |
| Semi-naturlig eng: 60 % i gjengroing, CR på rødliste | Status-/tilstandsfigur | R13-OKO-004 | source-shortlist | importer | **Ja (status), Nei (trend)** — A statusmål fra første ASO-omdrev; ingen trenddata ennå | Arealanslag bredt konfidensintervall; kun statusmål |
| Pollinatortrend (humler/sommerfugler, 3Q) | Trend-figur | R13-OKO-004 | source-shortlist | importer | **Nei** — serie fra 2021, for kort for trend | Ikke si pollinatorer i sterk tilbakegang uten trenddata |
| Økologisk areal stabilt ~4,3–4,6 % vs. 10 %-mål 2032 | Mål-mot-status-figur | R13-OKO-001 | PCQ | importer | **Ja, betinget** — A (Debio 2025); MÅ vise godkjent/karens-skille + import/norsk tom celle | Ikke vis som «vekst»; salgsøkning ≠ produksjonsøkning |
| Beite/utmark: 1,3 mill. sau + 270 000 storfe + 63 000 geit (2025) | Tabell / fordelingsfigur | R13-OKO-006 | source-shortlist | importer | **Ja (areal/dyr), Nei (karbon)** — A for dyretall; SOC-utmark utenfor inventaret (C) | Ikke si utmarksbeite er karbonnøytralt/lagrer karbon |
| Husdyr-metan = 48,5 % av jordbruksutslipp (Tier 2, GWP100/AR5) | Andelsfigur | R13-OKO-006 | source-shortlist | importer | **Ja, betinget** — A; MÅ merke metode (Tier 2, GWP100/AR5) | Ikke si GWP20 er brukt |
| Policy-måloppnåelse: klima ikke i rute, øko 4,6/10 %, selvforsyning ~40/50 % | Mål-mot-status dashboard | R13-OKO-00

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

