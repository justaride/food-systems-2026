---
tittel: "Food TG analysefabrikk - runde 3 prompts"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Start master session og utvalgte worker sessions for primary-check og aktørvalidering før decision memo v0.2.
relaterte_filer:
  - docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-2.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
---

# Food TG analysefabrikk - runde 3 prompts

## 1. Formål

Runde 3 skal ikke være en ny bred arkivrunde. Den skal lukke de mest beslutningskritiske hullene etter runde 2:

1. EUDR-Norge og EØS-/myndighetsstatus.
2. SSB/HS-/Tolletaten-grunnlag for soya, SPC, fiskemel og relevante fôrråvarer.
3. Fôraktørkryssjekk mot Denofa, Skretting, BioMar, Cargill, Mowi og Sjømat Norge.
4. Okara og bryggerimask: produsentdata, hygiene, matgrade og pilotbarhet.
5. Marint restråstoff: SINTEF/FHF-fraksjonsdata og aktørvalidering.
6. KPI-minimum for decision memo v0.2 og første innsiktspakke.

Runde 3 skal produsere `primary-check`-notater, aktørspørsmål, kildekritiske konklusjoner og et beslutningsgrunnlag for hva som kan gå inn i `decision memo v0.2`.

## 2. Anbefalt kjøring

Kjør 3A og 3B først hvis kapasitet er begrenset, fordi disse låser juridisk scope og importbaseline. 3C-3F kan kjøres parallelt etterpå eller samtidig hvis det finnes nok sessions.

| Pulje | Sessions | Hvorfor |
|---|---|---|
| Pulje 1 | 3A EUDR-Norge, 3B SSB/HS-importdata | lukker juridisk/tallmessig baseline for spor A/C |
| Pulje 2 | 3C fôraktører, 3D okara/BSG, 3E marint restråstoff | gjør pilotkandidater aktørklare |
| Pulje 3 | 3F KPI og decision-memo gate | setter uttakene i format for beslutning |

Alle workers skal levere handoff til `docs/project/mandates/analysefabrikk-handoffs/`. Workers skal ikke redigere canonical docs direkte.

## 3. Felles kvalitetsregler

- Ingen claims markeres `Validert eksternt` uten dokumentert ekstern respons.
- Skill tydelig mellom `primærkilde`, `actor-tall`, `benchmark`, `sekundærkilde`, `L4/hypotese` og `ikke bruk`.
- Tall må ha definisjon, år, geografi, enhet, kilde og eventuell varekode/metode.
- Juridiske funn må peke til gjeldende kilde, dato og norsk/EØS-relevans.
- Aktørvalidering skal gi spørsmål og datakrav. Ikke anta svar.
- Master skal klassifisere hvert funn som `integrer nå`, `needs-primary-check`, `needs-actor-validation` eller `archive/reject`.

## 4. Master prompt runde 3

```markdown
Du er master session for Food TG analysefabrikk runde 3.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les først:
- docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
- docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-2.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
- docs/project/mandates/source-shortlist-food-tg.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Din jobb:
1. Start/koordiner runde-3-workers etter behov:
   - 3A EUDR-Norge
   - 3B SSB/HS-importdata
   - 3C fôraktørkryssjekk
   - 3D okara/BSG/prosess-sidestrømmer
   - 3E marint restråstoff
   - 3F KPI og decision-memo gate
2. Ikke dykk ned i alt selv.
3. Mottak handoffs og klassifiser hvert funn:
   - integrer nå
   - needs-primary-check
   - needs-actor-validation
   - archive/reject
4. Normaliser nye funn til eksisterende eller nye SRC-ID, EV-ID og CL-ID.
5. Oppdater canonical docs bare etter kvalitetssjekk.
6. Lag master merge-logg:
   docs/project/mandates/analysefabrikk-handoffs/2026-04-28-master-merge-runde-3.md
7. Lag kort beslutningskø for `decision memo v0.2`: hva kan brukes, hva må vente, og hvem må kontaktes.

Viktige regler:
- Ingen claims markeres Validert eksternt.
- Ikke gjør actor validation om til faktisk validering uten dokumentert svar.
- Tall uten definisjon, år, geografi, enhet og kilde skal ikke løftes.
- Norsk/EØS-status må skilles fra EU-status.

Start med å bekrefte hvilke runde-3-workers du starter, og hvilke PCQ-/actor-validation-rader hver worker eier.
```

## 5. Worker prompt 3A - EUDR-Norge

```markdown
Du er Worker 3A: EUDR-Norge og EØS-/myndighetsstatus for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/track-brief-c-adoption.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- PCQ-C-001: EUDR-Norge.
- CL-C-011, CL-A-020 og EV-C-017.
- Skill EU-status fra norsk/EØS-status.

Søk lokalt først etter:
- EUDR
- avskogingsforordningen
- deforestation
- soya
- Landbruksdirektoratet
- Miljødirektoratet
- EFTA
- EØS
- Traces

Hvis nett er tilgjengelig i din session, bruk primært:
- EU-kommisjonen for EU-scope og frister.
- Landbruksdirektoratet, Miljødirektoratet, regjeringen.no, Lovdata, EFTA/EØS-kilder for Norge/EØS.

Ikke rediger canonical docs.

Lever handoff til:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3a-eudr-norge.md

Leveranse:

## 1. Kildetabell

| Kilde | Type | Dato | Hva den dokumenterer | Norsk/EØS-relevans | Status |
|---|---|---|---|---|---|

## 2. Scope-konklusjon

Skriv kort:
- Hva er sikkert for EU?
- Hva er sikkert for Norge/EØS?
- Hva er fortsatt uavklart?
- Hvilke formuleringer kan brukes i decision memo uten overclaiming?

## 3. Claim-effekt

| Claim | Effekt | Endringsforslag | Status |
|---|---|---|---|
| CL-C-011 |  |  |  |
| CL-A-020 |  |  |  |

## 4. Aktørspørsmål

Lag 6-10 presise spørsmål til Landbruksdirektoratet/Miljødirektoratet om soya, fôrråvarer, EØS-status, frister, informasjonssystem og praktisk etterlevelse.

## 5. Masteranbefaling

Hva kan integreres nå, hva må stå som needs-primary-check, og hva må avvises/unngås?
```

## 6. Worker prompt 3B - SSB/HS importdata

```markdown
Du er Worker 3B: SSB/HS importdata for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- PCQ-A-001: Soyaimport.
- PCQ-A-002: SPC vs soyamel.
- PCQ-A-004: laksefôrvolum vs oppdrettsfôr.
- PCQ-A-005: fiskemel.
- CL-A-020 og CL-C-011.

Søk lokalt først etter:
- SSB
- HS
- tolltariff
- varenummer
- soyabønner
- soyamel
- soyaolje
- soyaproteinkonsentrat
- SPC
- fiskemel
- fishmeal
- oppdrettsfôr
- laksefôr

Hvis nett/API er tilgjengelig i din session, bruk primært SSB/Tolletaten/Eurostat/FAO/IFFO/offentlige tabeller. Hvis ikke, lever metode og presise tabell-/varekodespørsmål.

Ikke rediger canonical docs.

Lever handoff til:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3b-ssb-hs-importdata.md

Leveranse:

## 1. Varekodeliste

| Tema | Mulig HS/varenummer | Hva koden dekker | Hva den ikke dekker | Datakilde | Status |
|---|---|---|---|---|---|

## 2. Tallregister

| Tema | Tall | År | Geografi | Enhet | Definisjon | Varekode/metode | Kilde | Status |
|---|---:|---|---|---|---|---|---|---|

Status skal være `citation-ready`, `needs-primary-check`, `needs-actor-validation` eller `reject`.

## 3. Definisjonsrydding

Forklar hva master må skille mellom:
- soyabønner til Denofa
- soyamel/oljekake
- soyaolje
- soyaproteinkonsentrat/SPC
- prepared animal feed
- fiskemel/fiskeolje
- oppdrettsfôr totalt vs laksefôr

## 4. Claim-effekt

| Claim | Effekt | Endringsforslag | Risiko |
|---|---|---|---|
| CL-A-020 |  |  |  |
| CL-C-011 |  |  |  |

## 5. Masteranbefaling

Hva kan brukes i decision memo v0.2, og hvilke tall må vente?
```

## 7. Worker prompt 3C - fôraktørkryssjekk

```markdown
Du er Worker 3C: fôraktørkryssjekk for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
- docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- PCQ-A-003: fôraktørfordeling.
- Denofa, Skretting, BioMar, Cargill, Mowi Feed, Sjømat Norge, NMBU/Foods of Norway.
- CL-A-001, CL-A-002, CL-A-020, CL-C-011.

Ikke kontakt aktører automatisk. Lag aktørspørsmål og vurder hva vi allerede kan lese fra offentlige rapporter.

Ikke rediger canonical docs.

Lever handoff til:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3c-foraktor-kryssjekk.md

Leveranse:

## 1. Aktørmatrise

| Aktør | Hvorfor relevant | Claims/EV | Offentlig kildegrunnlag | Data å be om | Prioritet |
|---|---|---|---|---|---|

## 2. Kryssjekk av Skretting/Denofa

Forklar hva Skretting og Denofa kan brukes som:
- actor-tall
- benchmark
- bransjeproxy
- ikke nok grunnlag

## 3. Spørsmålsbank

Lag 8-12 konkrete spørsmål fordelt på:
- råvarevolum og råvareandel
- SPC/soya/fiskemel
- EUDR/sporbarhet
- alternative proteiner
- minimumskrav for pilot
- hva som kan siteres

## 4. Anbefalt outreach-rekkefølge

Foreslå 3-5 første kontakter og begrunn rekkefølgen.

## 5. Masteranbefaling

Hva kan master bruke nå, og hva krever faktisk aktørrespons før status kan endres?
```

## 8. Worker prompt 3D - okara, bryggerimask og hygiene

```markdown
Du er Worker 3D: okara, bryggerimask og hygiene for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
- docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- PCQ-B-001 til PCQ-B-004.
- Okara, havre-/plantedrikk-sidestrømmer, bryggerimask/BSG, hygiene, holdbarhet, matgrade og lovlig sluttbruk.
- CL-B-009, CL-B-014, CL-B-021, CL-C-015.

Søk lokalt først etter:
- okara
- havre
- Oatly
- Axfoundation
- Over & Oat
- bryggerimask
- brewers spent grain
- BSG
- RISE
- Brewed & Renewed
- hygiene
- Mattilsynet
- Novel Food

Ikke rediger canonical docs.

Lever handoff til:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3d-okara-bsg-hygiene.md

Leveranse:

## 1. Kandidatvurdering

| Strøm | Kildegrunnlag | Volumstatus | Kvalitetsstatus | Hygienerisiko | Nåværende avsetning | Pilotbarhet | Status |
|---|---|---|---|---|---|---|---|

## 2. Datakrav per aktør

| Aktør | Strøm | Data å be om | Hvorfor nødvendig | Kan avgjøre |
|---|---|---|---|---|

## 3. Hygiene- og regelverksspørsmål

Lag 8-12 spørsmål til Mattilsynet/fagekspert om okara, fermentert okara og bryggerimask som mat-/ingrediensråvare.

## 4. Røde flagg

List opp claims som ikke må brukes ennå, særlig volum, pilotklarhet, matgrade og holdbarhet.

## 5. Masteranbefaling

Hva kan brukes som benchmark, hva kan bli pilotkandidat, og hva må avvente aktør-/Mattilsynet-svar?
```

## 9. Worker prompt 3E - marint restråstoff

```markdown
Du er Worker 3E: marint restråstoff og fraksjonsdata for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
- docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/evidence-matrix-food-tg.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- PCQ-B-005.
- SINTEF marint restråstoff 2024, FHF, fraksjoner, sluttbruk, høyverdiavsetning og aktører.
- CL-B-009, CL-B-021, CL-C-015.

Søk lokalt først etter:
- marint restråstoff
- marine ingredients
- sjømatrestråstoff
- SINTEF
- FHF
- Pelagia
- Biomega
- HBC
- Scanbio
- fraksjon
- humant konsum
- fôr
- biogass

Ikke rediger canonical docs.

Lever handoff til:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3e-marint-restrastoff.md

Leveranse:

## 1. Fraksjonskart

| Fraksjon | Art/sektor | Volum/tall | År | Sluttbruk | Kilde | Status |
|---|---|---:|---|---|---|---|

## 2. Høyverdi-vurdering

Forklar hvilke fraksjoner som ser mest relevante ut for:
- humant konsum
- fôr/ingredienser
- biotek/olje/protein
- lavere verdi eller utnyttelsesgap

## 3. Aktørspørsmål

Lag spørsmål til SINTEF/FHF og 3-5 industriaktører om volum, kvalitet, marked, dokumentasjon og flaskehalser.

## 4. Røde flagg

Skill norsk høyverdi-benchmark fra første B-pilot. Ikke gjør sjømatrestråstoff til plantebasert prosess-sidestrøm.

## 5. Masteranbefaling

Hva kan integreres, hva må primærsjekkes, og hva bør stå som benchmark/sekundærspor?
```

## 10. Worker prompt 3F - KPI og decision-memo gate

```markdown
Du er Worker 3F: KPI-minimum og decision-memo gate for Food TG analysefabrikk.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les:
- docs/project/mandates/analysefabrikk-runde-3-prompts-2026-04-28.md
- docs/project/mandates/primary-check-queue-food-tg-v0.1.md
- docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
- docs/project/mandates/decision-memo-food-tg-scope.md
- docs/project/mandates/track-brief-a-feed-import.md
- docs/project/mandates/track-brief-b-sidestreams-nutrients.md
- docs/project/mandates/track-brief-c-adoption.md
- docs/project/mandates/claim-register-food-tg.md

Scope:
- PCQ-C-002: KPI-definisjoner.
- Hva decision memo v0.2 kan bruke før ekstern validering.
- Hvilke claims bør holdes tilbake.

Ikke rediger canonical docs.

Lever handoff til:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3f-kpi-decision-gate.md

Leveranse:

## 1. KPI-minimum

| Spor | KPI | Definisjon | Enhet | Datakilde | Dataeier | Frekvens | Status |
|---|---|---|---|---|---|---|---|

Status skal være `kan brukes internt`, `needs-primary-check`, `needs-actor-validation` eller `ikke bruk`.

## 2. Decision memo gate

| Tema | Kan brukes i v0.2? | Formulering med forbehold | Hva må vente |
|---|---|---|---|

## 3. Claims som må holdes tilbake

List claims som ikke bør løftes inn i decision memo annet enn som hypotese.

## 4. Første innsiktspakke

Foreslå 5-7 slide-/seksjonsbudskap som er trygge nok for intern diskusjon, med tydelig status.

## 5. Masteranbefaling

Hva bør master lage etter runde 3:
- decision memo v0.2
- actor outreach emails
- KPI appendix
- ny primary-check queue
```

## 11. Mini-verifikasjon før master-merge

Når runde-3-workers er mottatt, kjør en kort verifikasjonsgate før canonical oppdateres.

```markdown
Du er mini-verifikasjon for Food TG analysefabrikk runde 3.

Arbeidskatalog: /Users/gabrielboen/Documents/Food Systems 2026

Les alle runde-3-handoffs i:
docs/project/mandates/analysefabrikk-handoffs/

Kontroller:
1. Har hvert tall definisjon, år, geografi, enhet og kilde?
2. Er EU-status skilt fra norsk/EØS-status?
3. Er actor-tall skilt fra bransje-/nasjonal baseline?
4. Er benchmark skilt fra pilotklarhet?
5. Er ingen claims markert Validert eksternt uten faktisk ekstern respons?
6. Er L4-/Perplexity-funn holdt som hypoteser/kildejakt?
7. Finnes det anbefaling om integrer nå / needs-primary-check / needs-actor-validation / archive/reject?

Lever fil:
docs/project/mandates/analysefabrikk-handoffs/2026-04-28-mini-verifikasjon-runde-3.md

Avslutt med:
- funn som er trygge å integrere
- funn som må holdes tilbake
- konkrete rettelser master må gjøre
```

## 12. Forventet uttak etter runde 3

Master bør etter runde 3 kunne lage:

1. `2026-04-28-master-merge-runde-3.md`
2. Oppdatert `primary-check queue v0.2`
3. Oppdatert `actor validation pack v0.2` eller konkrete epost-/intervjuguider
4. `decision memo v0.2` med bare trygge, statusmerkede claims
5. Eventuelt `insight pack outline v0.1` for Jan Thomas / mandatdiskusjon

## 13. Stoppsignal

Ikke gå til ekstern beslutningskommunikasjon før disse minimumene er håndtert eller eksplisitt markert som uavklart:

- EUDR-Norge er avklart med norsk/EØS-kilde eller eksplisitt markert uavklart.
- Soya/SPC/fôrbaseline er ryddet med SSB/HS/metode eller formulert som actor-/benchmark-data.
- Første B-pilot er validert med minst én råvareeier og ett hygiene-/regelverkssvar.
- Claims som fortsatt bare er hypoteser står tydelig som hypoteser i decision memo.
