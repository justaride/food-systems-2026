# Spec: Food TG Research OS — uavhengig researchprosess og promptpakke

> **Dato:** 2026-06-24
> **Status:** Design godkjent for Approach A — klar for implementeringsplan
> **Scope:** Forberede researchprosesser, promptpakker, kartlegginger, lister og oversikter for Food TG uten avhengighet til ventet dataunderlag fra JT.

## 1. Problem og mål

Food TG har nå et stort researchapparat, flere dybderunder og en moden claim-/kildekontroll. Det neste behovet er ikke mer løs utforsking, men en **repeterbar research-motor**: en struktur som forteller hva vi bør undersøke videre, hvilke prompts som skal kjøres, hva slags underlag som skal hentes, og hvordan funn skal mottas uten å bli for tidlig faktastemme.

Målet er å lage et repo-lokalt Research OS som kan brukes av Codex, Claude, Gemini, Deep Research eller menneskelige researcher på samme måte: velg tema, kjør smal prompt, lagre output, mottakslogg, klassifiser hull, og send bare modne funn videre til source-shortlist, PCQ og claim-lock.

Dette erstatter ikke eksisterende R4/R5/R6-rutiner. Det gjør dem mer planlagte og bredt dekkende.

## 2. Ikke-mål

- Ikke vente på, modellere eller forutsette et JT-dataunderlag.
- Ikke åpne nye eksterne claims direkte.
- Ikke starte aktør-outreach.
- Ikke importere data til DB i denne runden.
- Ikke lage en ny appflate eller dashboard nå.
- Ikke gjøre research-output til whitepaper-tekst uten mottak og claim-gate.

## 3. Leveranser

Approach A leverer fire repo-artefakter:

1. **Masterplan:** `docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md`
   - Definerer temaunivers, prioritering, rekkefølge og hvordan runder kjøres.
2. **Promptpack:** `docs/project/mandates/food-tg-research-runde12-promptpack-2026-06-24.md`
   - Inneholder konkrete prompts per tema og output-kontrakt.
3. **Backlog CSV:** `research/_status/food-tg-research-backlog-2026-06-24.csv`
   - Maskinlesbar liste over research-spørsmål, prioritet, tema, kildekrav, output og gate.
4. **Mottaksprotokoll:** `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md`
   - Forklarer hvordan output tas imot, verifiseres, klassifiseres og eventuelt løftes videre.

## 4. Temakart

Research OS-et organiseres i ti temaområder:

1. **Verdikjede per ledd og land**
   - Import, primærproduksjon, prosessering, distribusjon, forbruk/avfall.
   - Mål: bygge ledd-profiler og identifisere hull per land.
2. **Importavhengighet og beredskap**
   - Fôr, fosfat, kaffe/kakao, kornlager, logistikk, lagring og sårbarhet.
   - Mål: gjøre beredskap konkret, ikke bare retorisk.
3. **Fôr, protein og innsatsvarer**
   - Soya/SPC, fiskeolje, alternative proteiner, musling/tang/insekt/mikroprotein.
   - Mål: skille realisert volum, kapasitet, plan og type-C fravær.
4. **Sidestrømmer, waste og R9/Moerman**
   - Restråstoff, fiskeslam, digestat, struvitt, biogass, matavfall, kaffegrut.
   - Mål: hindre konflasjon mellom utnyttet, høyverdi, energi og næringsretur.
5. **Regenerativt, lokalmat, permakultur og praktikerfeltet**
   - REKO, andelslandbruk, markedshager, KVANN, skogshage, småskala grønt.
   - Mål: bygge aktør- og bevegelseskart videre fra 19.06-kartleggingen.
6. **Distribusjonsmakt, grossistgate og offentlig innkjøp**
   - Dagligvare, BAMA, ASKO, HORECA, EMV, kommunale/regionale innkjøp.
   - Mål: dokumentere gate-mekanismer uten å påstå ulovlig adferd.
7. **Bondeøkonomi, marginpress og primærledd**
   - BFJ/NIBIO, kostnads-pris-skvis, kjøperprisavtaler, per-kg-marginer.
   - Mål: fullføre N11 fra blindsone til brukbar analyseakse.
8. **True-cost, eksternaliteter, helse og sufficiency**
   - Helsekostnader, kosthold, prevention, sufficiency, TEEBAgriFood, Nexus.
   - Mål: bygge fase-2-underlag uten å tallfeste skyggepriser for tidlig.
9. **Governance, virkemidler og implementering**
   - Stat/fylke/kommune, beredskapshjemler, offentlige mål, policy som faktisk virker.
   - Mål: forklare hvorfor systemet ikke endres selv når problemet er kjent.
10. **Visualiseringer, modeller og whitepaper-underlag**
   - Spider/radar, kausalkart, ledd-profiler, linsesortering, datagap-figurer.
   - Mål: hente underlag som kan bli figurer, ikke bare tekst.

## 5. Prompt-kontrakt

Hver prompt skal være smal og produsere et mottakbart research-artefakt, ikke en generell rapport.

Alle prompts skal kreve:

- Presis problemstilling og geografisk avgrensning.
- Primærkilde-først.
- Tabell med funn, kilde, år, lokator, status og caveat.
- Skille mellom `A` primær/verifisert, `B` sekundær/aktørrapportert, og `C` ikke offentlig tilgjengelig eller epistemisk hull.
- Eksplisitt liste over tomme celler.
- “Ikke si”-liste for overclaim-risiko.
- Forslag til om funnet skal til source-shortlist, PCQ, claim-lock, aktørgate eller parkeres.

## 6. Backlog-format

CSV-en skal ha disse kolonnene:

`id,theme,priority,question,geo,source_target,expected_output,primary_source_hint,known_caveat,gate,next_artifact,status`

Eksempel:

`R12-FEED-001,feed-inputs,P0,"Finn primærkilde for norsk fiskeoljeimport fra Mauritania 2020-2025",NO,"SSB 08801/PxWeb","tidsserie med HS-koder og caveat","SSB tabell 08801","Senegal/Gambia/sardinella forblir type C","PCQ","research/external/r12/","planned"`

## 7. Mottak og kontroll

Output fra en prompt skal ikke blandes direkte inn i whitepaper, appdata eller claim-lock. Riktig flyt:

1. Lagre rå output i `research/external/r12/` eller relevant `research/forstaelse/`.
2. Opprett eller oppdater mottaksrad i en DRO-/mottakslogg.
3. Klassifiser funn som A/B/C og Type A/B/C-hull.
4. Send bare kandidatfunn videre til source-shortlist/PCQ.
5. Hold forståelsessynteser separat fra faktastemme.
6. Kjør overclaim-vurdering før noe blir deck-/whitepaper-nært.

## 8. Prioritering

Første runde bør prioritere P0/P1 der den enten:

- fjerner kjent overclaim-/ferskhetsrisiko,
- fyller en besluttet blindsone fra objektivfunksjon Sett II,
- gir ledd-profil-underlag til whitepaper-strukturen,
- eller gjør et type-C-fravær eksplisitt som funn.

Start ikke med bred “alt om X”-research. Start med smale claims, hull og kartleggingsceller.

## 9. Success criteria

- Masterplanen dekker alle ti temaområder og viser rekkefølge.
- Promptpakken inneholder minst 40 konkrete prompts, med P0/P1/P2-prioritet.
- Backlog-CSV har samme prompts i maskinlesbart format.
- Mottaksprotokollen gjør det klart hvordan funn går fra output til source-shortlist/PCQ/claim-lock.
- Ingen prompt ber agenten konkludere uten primærkilde eller tydelig caveat.
- Ingen artefakt åpner ekstern faktastemme.
- Filene er skrevet slik at en ny agent kan plukke én prompt og kjøre den uten å lese hele repoet.

## 10. Risikoer

1. **Promptene blir for brede.** Mottiltak: hver prompt skal gi én avgrenset tabell eller ett smalt notat.
2. **Agenten fyller tomme celler med gjetting.** Mottiltak: tomme celler og type-C-funn er gyldig output.
3. **Forståelse blandes med fakta.** Mottiltak: egne output-typer og mottaksprotokoll.
4. **Backloggen blir statisk.** Mottiltak: CSV-en har `status` og `next_artifact`, og kan oppdateres etter hver runde.
5. **Research blir løsrevet fra leveranse.** Mottiltak: hvert backlog-item kobles til gate og neste artefakt.

## 11. Åpne valg før implementering

Tre valg tas i implementeringsplanen, med konservativ default:

- **Antall prompts i første pakke:** default 50.
- **R12-mappenavn:** default `research/external/r12/`.
- **Om visualiseringsprompts skal være egen seksjon:** default ja, men bare som underlag til figurer, ikke designarbeid.
