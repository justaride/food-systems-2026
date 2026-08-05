---
tittel: Whitepaper completion delta
dato: 2026-07-15
status: kanonisk intern arbeidsdelta
gate: internal
canonical_master: research/whitepaper/food-systems-2026-synthesis-v2.md
publication_surface: content/hvitbok
---

# Whitepaper completion delta

Dette dokumentet erstatter gap-listen fra mars 2026. Den gamle listen blandet
tre ulike ting:

1. et dokument fantes ikke ennå;
2. et utkast fantes, men manglet godkjenning;
3. kunnskapen eller primærdataen manglet faktisk.

Fra 2026-07-15 brukes statusene i
[completion register](../../docs/project/status/food-systems-completion-register-2026-07-15.md).
At en fil finnes betyr ikke at den er partner-validert, claim-locket eller
levert.

Kanonisk redaksjonell sti og legacy-roller er definert i
[whitepaper README](./README.md). Kanonisk master er
[food-systems-2026-synthesis-v2.md](./food-systems-2026-synthesis-v2.md);
[content/hvitbok](../../content/hvitbok/) er den sekundære app- og
publikasjonsflaten.

## P0 — må lukkes før publisering

| ID | Delta | Status | Det som finnes | Det som faktisk gjenstår | Gate / bevis |
|---|---|---|---|---|---|
| WP-01 | Én sammenhengende kanonisk fortelling | complete på internt syntesenivå | [Synthesis v2](./food-systems-2026-synthesis-v2.md) samler metode, analyse, sirkularitet/NPK, kjente hull og roadmap/videreføring med [K]/[F]/[I]/[H]-status | Faglig/redaksjonell godkjenning og publikasjonsuttrekk; v2 er ikke eksternt siterbart. | V2 + [README](./README.md) |
| WP-02 | Gjeldende claim-versjoner | complete på aktivt internt scope | Aktive flater skiller kontrollert omsetnings-HHI 3 327, CR3 96,6 prosent og butikkantall 93,4 prosent. Eldre 3 445 er bare eksplisitt historikk/butikkantalls-proxy. | Gjenta kontrollen på den faktiske publikasjonsversjonen etter godkjenning. | [CA-004](../CITABLE-ACCEPTANCE-TESTS.md); `audit:citable` og `gate:overclaim` grønne 2026-07-15 |
| WP-03 | Sirkularitetskapittel integrert | complete i kanonisk master | V2 kapittel 8 integrerer sirkularitet/material/NPK mot nyere underlag og skiller realisert, modellert, kapasitet, plan og potensial | Etter godkjenning: trekk kontrollert app-kapittel fra v2; section 7 forblir legacy-proveniens. | V2 kapittel 8 + R13-WASTE + R14 VK4 |
| WP-04 | Oppdatert kunnskapsgrunnlag fra R13/R14 | complete i kanonisk master | V2 bruker statuskoder, kildekart og stopplinjer fremfor å løfte intern triage til faktastemme | Faglig kontroll av [I]/[H]-radene og publikasjonsspesifikk claim-gate. | [R13 intake](../_status/food-tg-r13/r13-intake-index-2026-06-25.md), [R14 intake](../_status/food-tg-r14/r14-intake-index-2026-07-03.md) |
| WP-05 | «Det Norge ikke måler»-boks | complete i kanonisk master | V2 kapittel 11 og [Det Norge ikke måler](../forstaelse/det-norge-ikke-maaler.md) finnes | Rediger kort ekstern versjon med scope/kontrolldato og kjør claim-review; den interne formuleringen er ikke automatisk publiserbar. | V2 kapittel 11 |
| WP-06 | Roadmap som leveransedel | complete på lokalt draftnivå | V2 kapittel 12 og [roadmap v0.2 draft](../../docs/project/mandates/roadmap-food-tg-2026-2029-v0.2-draft.md) oppdaterer juli-underlaget med synlige porter | Formell eiergodkjenning og M17-publiseringspakke. | Roadmap v0.2 |
| WP-07 | Metode, begrensninger og siterbarhet | complete i kanonisk master | V2 kapittel 3, 13 og 14 forklarer status, metode, kildekart og stoppregler | Kjør publikasjonsversjonen gjennom citable-, overclaim- og source-locator-gatene. | V2 + [Citable status](../CITABLE-KNOWLEDGE-BASE-STATUS.md) |
| WP-08 | Oppdatert executive brief | complete på internt derivatnivå | [Executive brief](./executive-brief.md) er et kort, ikke-siterbart derivat av v2 med gjeldende status og porter. | Godkjenn mottaker og delingsnivå; gjenta claim-review før ekstern bruk. | V2 + briefets proveniensseksjon |
| WP-18 | App-/publikasjonsuttrekk fra v2 | synthesis-needed | Tre app-kapitler finnes som Utkast | Map hvert kapittel til godkjente v2-seksjoner, fjern avvik, gjør app-readback og kontroller eventuell PDF mot samme master. | [chapters.ts](../../src/lib/hvitbok/chapters.ts) |

## Human-gated før whitepaper kan kalles validert

| ID | Gate | Hva som finnes | Hva som mangler | Stopplinje |
|---|---|---|---|---|
| WP-09 | Stakeholderstemmer / Mission 1 | Intervjuguider og målgrupper finnes | Gjennomførte intervjuer, samtykke/bruksrett, godkjente sitater og dokumentert rolle/dato | Ingen sekundærkilde eller tidligere arrangements-transkript skal fremstilles som prosjektets egne stakeholderintervjuer. |
| WP-10 | Nordisk partnervalidering / Mission 2 | Nordisk datasett, kildekontroller og valideringsbehov finnes | Dokumentert respons på landdata, definisjoner og tolkning fra relevante partnere | Intern sammenligning er ikke partnergodkjent nordisk konklusjon. |
| WP-11 | Charter og formelt scope | [Charter v0.1](../../docs/project/mandates/tg-charter-food-2026.md) finnes | Formell godkjenning, chair/co-chair, hovedscope, landambisjon og godkjenningsdato | Utkast og operativ sprintstart er ikke formelt Transition Group-vedtak. |
| WP-12 | Roadmap-/leveransevedtak | Kontrollert roadmap v0.2-draft og beslutningsforespørsler finnes | Formell eierbekreftelse av H1/H2, minimumsportefølje og publiseringsmodus | Uvaliderte case forblir under validering. |
| WP-13 | M17 offentlig event | Eventretning er forberedt | Event-go, dato, format, vertskap, talere, publiseringsnivå og gjennomføring | Planlagt eller foreslått event er ikke levert event. |
| WP-14 | Mission 3/6 og pilotforankring | Fem kontrollerte workshop-start pilotbriefer finnes | Workshop, pilot-eier, dataeier, off-taker, budsjett og partnercommitment | Pilotbrief er ikke pilot, og benchmark er ikke norsk effektbevis. |
| WP-15 | Personvern og publiseringspolicy | Risikoen er identifisert | Eierbeslutning og kvalifisert juridisk vurdering av person-/styredata og publiseringsnivå | Ingen bred offentlig personflate før policy er vedtatt. |

## M18 og videreføring

| ID | Leveranse | Status | Lokal del | Menneskedel |
|---|---|---|---|---|
| WP-16 | Continuation plan / M18 | complete på lokalt draftnivå | [Continuation plan](../../docs/project/mandates/continuation-plan-food-tg-2026.md) og v2 kapittel 12 viser driftsnivå, eierbehov, dataoppdatering, finansieringsspor og porter. | Organisatorisk hjem, ansvar, cash/in-kind, budsjett, finansiering og ambisjon må vedtas. |
| WP-17 | NordForsk-/fundingretning | human-gated | [Finance note v2.0](../evidence-pack/finance-note.md) er kontrollert 2026-07-02 og kan gi concept-note-struktur. | Reelt konsortium, partnerroller, søker, ressurser og go/no-go kan ikke syntetiseres lokalt. |

## Evidence Pack — faktisk nåstatus

| Evidence Pack | Artefaktstatus | Leveransestatus | Neste handling |
|---|---|---|---|
| 1. TG Charter | Utkast finnes | human-gated | Formell eierbekreftelse og dato. |
| 2. Decision Log | Logg og beslutningsforespørsler finnes | human-gated | Loggfør faktiske vedtak; ikke gjør forespørsler om til beslutninger. |
| 3. Commitment Map | R14 stakeholder-skeletons og actor-gate-spørsmål finnes | human-gated | Prioriter personer/organisasjoner, godkjenn ask og gjennomfør outreach. |
| 4. Pilot Briefs | Fem kontrollerte pre-read dossiers finnes | complete på desk-nivå, human-gated videre | Mission 6-workshop og eier-/data-/off-taker-validering. |
| 5. Adoption Track | Kontrollert v2.0 closeout-draft finnes | complete på internt draftnivå, human-gated videre | Stakeholder-/partnervalidering, eierbeslutning og handlingsdato-kontroll før ekstern bruk. |
| 6. Finance Note | Utkast v2.0, live-kontrollert 2026-07-02 | complete på internt notatnivå | Oppdater frister ved bruk; partner-/søknadsvalg er human-gated. |
| 7. Roadmap | Kontrollert v0.2-draft finnes | complete på lokalt draftnivå, human-gated videre | Formell eiergodkjenning og publiseringspakke. |
| 8. Executive Brief | Datert v2-derivat finnes | complete på internt derivatnivå, human-gated videre | Godkjenn mottaker/delingsnivå og kjør publikasjonsspesifikk claim-review. |

## Data- og kildearbeid som ikke blokkerer første syntese

| ID | Tema | Status 2026-07-15 | Prioritet / bruksregel |
|---|---|---|---|
| DATA-01 | FI/IS 2025-finansielle rader | source-gated. SE/DK 2025 er importert; FI/IS 2020–2024 oppfyller fireårsminimum. | P2. Hent offisielle årsrapporter og PCQ hvis whitepaperet trenger 2025-paritet. |
| DATA-02 | Kommunal/lokal HHI | Delvis. En butikkantall-proxy finnes for fem land; NO/SE/DK har sterkest geometri. En primærstudie gir historisk, omsetningsbasert postnummer-HHI for Norge. Det finnes ikke en ferdig, oppdatert omsetningsbasert kommune-HHI-serie. | Ikke bland store-count proxy, postnummer-HHI og omsetnings-HHI. Reåpne bare for en presist definert figur/claim. |
| DATA-03 | Lange omsetningsandeler | Delvis kildegrunnlag finnes, men den gamle ønskelisten på 10–15 år er ikke verifisert som en ferdig harmonisert serie i denne closeouten. | Ikke blokker hovedsyntesen; åpne kildearbeid bare hvis tidsserieclaimet beholdes. |
| DATA-04 | Nordisk PPP-prisnivå | Ikke kontrollert som ferdig i denne closeouten. | Ikke bruk som etablert funn. Gjør source-gated oppdrag bare hvis kapitlet trenger faktisk prisnivå fremfor indeks. |
| DATA-05 | Aktivitetssignaler for havbruk/villfisk | Source-gated Type A. Åpne registre er identifisert, men ikke systematisk koblet til aktørbasen. | Horisont 1 etter kontraktsleveransen, med eksplisitt definisjon av aktiv. |

## Type-C er ikke vanlig restanse

Whitepaperet skal synliggjøre, ikke skjule:

- manglende publisert nasjonal SOC-baseline;
- manglende anleggsvis massebalanse for modellert, innsamlet og behandlet
  oppdrettsslam;
- manglende nasjonal realisert N/P/K-retur fra norsk biorest/digestat;
- for kort pollinatorserie og fravær av bred insektbiomasseserie;
- manglende åpne nodekapasiteter for havn, kaldkjede og sentrallager;
- manglende harmonisering av flere nordiske systemmål.

Se [Det Norge ikke måler](../forstaelse/det-norge-ikke-maaler.md) for presis
scope, ansvarslinje, neste kontroll og ikke-si. Estimat eller proxy lukker ikke
et Type-C-hull.

## Ikke lenger gyldige «mangler»

Følgende ble kalt GAP eller PARTIAL i mars-listen, men har nå en konkret fil:

- Charter v0.1;
- decision log;
- fem pilotbriefer;
- adoption track v2.0;
- finance note v2.0;
- roadmap v0.2-draft;
- continuation plan;
- executive brief som v2-derivat.

Restansen er nå godkjenning, oppdatering, integrasjon eller gjennomføring — ikke
å opprette tomme dokumenter på nytt.

## Definition of done for whitepaperpakken

Whitepaperpakken kan kalles ferdig først når:

1. v2 er faglig/redaksjonelt godkjent som master, med alle [I]/[H]-porter
   eksplisitt håndtert;
2. app-/PDF-uttrekk er dokumentert sporbare til samme godkjente v2-seksjoner;
3. legacy-manusene er tydelig ikke-kanoniske og ingen aktiv flate henter
   publikasjonsclaim derfra;
4. supersederte tall er fjernet eller rettet, og HHI/CR3/proxyer er navngitt
   korrekt;
5. sirkularitet, kjente kunnskapshull og roadmap er integrert med synlige
   porter;
6. alle eksterne tall og sterke formuleringer har gjeldende locator, år,
   metode og claim-status;
7. intervjuer/partnerrespons er enten dokumentert og godkjent, eller eksplisitt
   merket som ikke gjennomført uten konstruerte sitater;
8. roadmap, event-/publiseringsmodus og personpolicy har eksplisitt
   eierbeslutning;
9. relevante citable-, overclaim- og source-locator-gater er grønne på den
   faktiske publikasjonsversjonen;
10. app-readback og eventuell PDF er kontrollert mot mastermanuset.

Før disse punktene er dokumentert er riktig status Utkast, selv om all lokal
syntese er ferdig.
