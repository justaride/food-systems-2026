---
tittel: Master merge runde 2 - Food TG analysefabrikk
status: Utført internt
eier: Master session
dato: 2026-04-28
neste_handling: Bruk actor validation pack v0.1 og primary-check queue v0.1 før decision memo v0.2.
relaterte_filer:
  - docs/project/mandates/analysefabrikk-runde-2-prompts-2026-04-28.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/track-brief-a-feed-import.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-2b-importdata-recovery.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-2d-prosess-sidestroemmer-recovery.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-mini-verifikasjon-2b-2d-recovery.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
---

# Master merge runde 2

Denne loggen normaliserer runde-2-handoffs til `SRC-ID`, `EV-ID`, `CL-ID` og mottaksstatus. Ingen claims er markert `Validert eksternt`; alt som er integrert står fortsatt som `Utført internt`.

## Seks batcher

| Batch | Tema | Forventet leveranse | Mottak |
|---|---|---|---|
| 2A | Juridisk fôrsubstrat | Legal gate for TSE/ABP, kategori 3, tidligere matvarer, catering waste, insekt-PAP og Mattilsynet/EU-spørsmål. | Mottatt: `2026-04-28-worker-2a-juridisk-for-substrat.md` |
| 2B | A-importdata | Importtall for soya, soyamel/SPC, fiskemel, Denofa/laksefôr/kraftfôr og EUDR-Norge, med år/geografi/enhet/definisjon/kilde. | Recovery kjørt: `2026-04-28-worker-2b-importdata-recovery.md`; mini-verifisert |
| 2C | B-matsvinn tall | Matsvinnutvalget, Matvett/NORSUS, SSB/Eurostat og virkemidler for matsvinn, med tallforbehold. | Mottatt: `2026-04-28-worker-2c-b-matsvinn-tall-virkemidler.md` |
| 2D | B-prosess-sidestrømmer | Okara, plantebaserte sidestrømmer, sjømatrester, bryggerimask, logistikk, kvalitet og aktørvalidering. | Recovery kjørt: `2026-04-28-worker-2d-prosess-sidestroemmer-recovery.md`; mini-verifisert |
| 2E | B-næringsstoffløkker | RecoLab, norske VA-/biogjødselcase, N/P/K, slam, digestat og gjødselregelverk. | Mottatt: `2026-04-28-worker-2e-b-naeringsstofflokker.md` |
| 2F | C-norsk governance | Lov om god handelsskikk, Dagligvaretilsynet/Konkurransetilsynet, UTP, PPWR/EØS og offentlig innkjøp. | Mottatt: `2026-04-28-worker-2f-c-norsk-governance.md` |

Mottaksavvik lukket med recovery 2026-04-28: 2B og 2D ble rekonstruert fra lokale underlag og primær-/institusjonskilder, deretter kontrollert i `2026-04-28-mini-verifikasjon-2b-2d-recovery.md`. Bare funn klassifisert `integrer nå` er løftet inn i canonical docs; øvrige er sendt til actor validation pack eller primary-check queue.

## Kvalitetssjekk

| Regel | Resultat |
|---|---|
| Ingen claims markeres `Validert eksternt` | Oppfylt. Claim-registeret står fortsatt med `Utført internt`. |
| L4/Perplexity/forskningsrunde kun som kildejakt/hypotese | Oppfylt. Nye integrasjoner bruker primærkilder/solid sekundærkilde der de styrker claims. Eksisterende L4-rader står som lav siterbarhet. |
| Juridiske/regulatoriske funn må ha primærkilde eller `needs-primary-check` | Oppfylt. Mattilsynet, EUR-Lex/Lovdata/regjeringen.no og DFØ brukes som primærgrunnlag; konkret juridisk tolkning står til primærsjekk. |
| Tall må ha definisjon, år, geografi, enhet og kilde | Delvis oppfylt. Matsvinnutvalget- og VA-tall kan brukes med tallforbehold; NORSUS/SSB-notater som ikke er arkivert her er ikke løftet inn som egne nye SRC-rader. |

## Integrer nå

| Funn | SRC-ID | EV-ID | CL-ID | Status | Masterbeslutning |
|---|---|---|---|---|---|
| TSE/ABP/fôrregelverk er en legal gate for sirkulære fôrsubstrater; kategori 3 er nødvendig, men ikke tilstrekkelig. | SRC-REG-001, SRC-REG-003, SRC-REG-004, SRC-REG-005 | EV-A-013, EV-A-015 | CL-A-011, CL-A-021 | integrer nå + needs-primary-check for konkret rettsanvendelse | Integrert i source shortlist, evidence matrix, claim-register og sporbrief A. |
| Mattilsynet peker på aktivt regelverksarbeid for catering waste, tidligere matvarer med kjøtt/fisk og fiskeslam som insekt-substratspørsmål. | SRC-REG-002 | EV-A-014 | CL-A-006, CL-A-011, CL-A-021 | integrer nå som regulatorisk utviklingssignal | Integrert som varsel om åpne regulatoriske spørsmål, ikke som lovlig pilotgrunnlag. |
| EFSA 2015 støtter casevis risikovurdering av insekter som mat/fôr, med substrat som sentral risikodriver. | SRC-REG-006 | EV-A-016 | CL-A-005, CL-A-011, CL-A-021 | integrer nå | Integrert som faglig risikoramme, ikke som norsk rettskilde. |
| Matsvinnutvalget gir norsk beslutningsgrunnlag for virkemidler, rapportering, datakrav, offentlig anskaffelse og modellert tiltakspotensial. | SRC-B-014 | EV-B-014 | CL-B-001, CL-B-002, CL-B-008, CL-B-022, CL-C-012, CL-C-015 | integrer nå med tallforbehold | Var allerede løftet fra runde 1-merge; videreført og brukt i B/C-briefene. |
| RecoLab/Oceanhamnen dokumenterer tre-rørsmodell og driftsskala som nordisk benchmark. | SRC-B-015, SRC-B-016, SRC-B-017 | EV-B-015 | CL-B-016, CL-B-023 | integrer nå som benchmark + needs-actor-validation | Integrert som benchmark/sekundærpilot, ikke som rask første TG-pilot. |
| Norske næringsstoff-loop-kilder gir bedre nasjonalt benchmarkgrunnlag enn RecoLab alene. | SRC-B-018, SRC-B-019, SRC-B-021, SRC-B-022, SRC-B-023 | EV-B-016 | CL-B-023, CL-C-015 | integrer nå med tallforbehold | Integrert som sammenligningsgrunnlag for VA, Bio-P/struvitt, ammoniumsulfat, biogass og biogjødsel. |
| Gjødselvareforskrift/gjødselbrukforskrift 2025 er gjeldende legal gate for gjødselvarer, slam, hygiene, P-grenser og fremmedlegemer. | SRC-B-020 | EV-B-017 | CL-B-023, CL-C-015 | integrer nå + needs-primary-check for tolkning | Integrert som regelverksstatus; produktspesifikk tolkning må avklares. |
| Lov om god handelsskikk og myndighetsoverføring gir norsk C-gate; Dagligvaretilsynet har ansvar per 2026-04-28, Konkurransetilsynet fra 2026-04-30. | SRC-C-013 | EV-C-013 | CL-C-001, CL-C-005, CL-C-006 | integrer nå | Integrert med absolutte datoer for å unngå feil relativ status. |
| Dagligvaretilsynets samarbeidsklima/årsrapporter dokumenterer rapporteringsfrykt og behov for håndheving/tillit. | SRC-C-014, SRC-C-015 | EV-C-014 | CL-C-006, CL-C-014, CL-C-015 | integrer nå | Integrert som norsk håndhevings- og rapporteringsrisiko, ikke som direkte bevis for sirkulær leverandørblokkering. |
| Konkurransetilsynets dagligvarekilder styrker markedsstruktur som adoption-gate. | SRC-C-016 | EV-C-015 | CL-C-001, CL-C-006 | integrer nå | Integrert som strukturell kontekst; konkrete barrierer krever aktørdata. |
| DFØ/Anskaffelser.no gir norsk primærgrunnlag for offentlig innkjøp som demand-side mekanisme. | SRC-C-017 | EV-C-016 | CL-C-002, CL-C-012, CL-C-015 | integrer nå + needs-actor-validation | Integrert som innkjøpsgate, ikke som dokumentert effektbevis. |
| Denofa actor-data gir konkret soyabønneimportpunkt: ca. 450 000 tonn/år til Fredrikstad. | SRC-A-013 | EV-A-017 | CL-A-020, CL-C-011 | integrer nå med actor-forbehold | Integrert som actor-tall; ikke brukt som total norsk soyaimport. |
| Fiskeridirektoratet/Sjømat Norge gir siterbar oppdrettsfôrserie 2020-2024. | SRC-A-014 | EV-A-018 | CL-A-020 | integrer nå | Integrert som norsk oppdrettsfôr-baseline; definisjonen er ikke bare laksefôr. |
| Skretting Norge gir actor-data for SPC, vegetabilske/marine råvarer og SPC-sertifisering i 2024. | SRC-A-015 | EV-A-019 | CL-A-020, CL-C-011 | integrer nå med actor-forbehold | Integrert som Skretting-benchmark; bransjeclaim krever BioMar/Cargill/Mowi. |
| EUMOFA 2025 gir EU/global fiskemelkontekst og akvakulturbruk. | SRC-A-016 | EV-A-020 | CL-A-020 | integrer nå | Integrert som kontekst; norsk import/aktørbruk går til primary-check queue. |
| EU-kommisjonen gir EUDR-scope for soya og EU-frister 30.12.2026/30.06.2027. | SRC-C-018 | EV-C-017 | CL-C-011, CL-A-020 | integrer nå for EU + needs-primary-check for Norge | Integrert som EU-kontekst; norsk/EØS-scope går til queue. |
| Axfoundation/Chalmers gir svensk okara-benchmark og Over & Oat-prosjektkontekst. | SRC-B-024, SRC-B-025 | EV-B-018 | CL-B-014, CL-B-021, CL-B-009, CL-C-015 | integrer nå som svensk benchmark + needs-actor-validation | Integrert som kandidatgrunnlag, ikke norsk/nordisk total. |
| RISE/Brewed & Renewed gir svensk bryggerimask-benchmark, fuktbarriere og pilotmål. | SRC-B-026 | EV-B-019 | CL-B-014, CL-B-021, CL-B-009, CL-C-015 | integrer nå som svensk benchmark + needs-actor-validation | Integrert som kandidatgrunnlag; norsk volum og matgrade-status må valideres. |
| SINTEF Analyse marint restråstoff 2024 gir norsk sjømatrestråstoff-baseline. | SRC-B-027 | EV-B-020 | CL-B-009, CL-B-021, CL-C-015 | integrer nå + needs-primary-check for fraksjoner | Integrert som norsk benchmark; ikke behandlet som plantebasert batchstrøm. |

## Needs-primary-check

| Funn | SRC-ID | EV-ID | CL-ID | Status | Neste sjekk |
|---|---|---|---|---|---|
| SSB/HS-serie for soyabønner, soyamel/oljekake, soyaolje og SPC/prepared feed. | SRC-A-013, SRC-A-015 | EV-A-017, EV-A-019 | CL-A-020, CL-C-011 | needs-primary-check | Kjør PCQ-A-001 og PCQ-A-002 før total norsk importclaim. |
| Norsk/EØS EUDR-gjennomføring, soya-scope og Traces/informasjonssystem-praksis. | SRC-C-018 | EV-C-017 | CL-C-011 | needs-primary-check | Kjør PCQ-C-001 mot Landbruksdirektoratet/Miljødirektoratet/forskrift. |
| Norsk/nordisk fiskemelimport og faktisk fôrbruk per aktør/land. | SRC-A-016 | EV-A-020 | CL-A-020 | needs-primary-check | Hent FAO/IFFO/Eurostat/SSB eller fôraktørdata før norsk claim. |
| Okara- og bryggerimaskvolum per nordisk produsent/anlegg. | SRC-B-024, SRC-B-025, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-014, CL-B-021 | needs-primary-check | Svenske benchmark er integrert, men norsk/nordisk total og pilotvolum må valideres. |
| Mattilsynet-/Novel Food-/hygienevurdering for okara, fermentert okara og bryggerimask. | SRC-B-024, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-009, CL-B-021 | needs-primary-check | Avklar lovlig sluttbruk og dokumentasjon før pilotclaim styrkes. |
| Marine restråstoff-fraksjoner og høyverdiavsetning. | SRC-B-027 | EV-B-020 | CL-B-009, CL-B-021 | needs-primary-check | SINTEF total er integrert; fraksjon, kvalitet og marked må låses. |
| NORSUS OR.27.25 og SSB Notater 2025/37 nevnes i 2C, men er ikke verifisert/arkivert i denne merge-runden. | Ikke opprettet | Ikke opprettet | CL-B-001, CL-B-002, CL-C-015 | needs-primary-check | Last ned/arkiver og kontroller definisjon, år, geografi, enhet og kilde før sitering. |
| Konsolidert rettstekst og EØS-/Lovdata-status for EU 1069/2009, 142/2011, 2017/893 og 2021/1372. | SRC-REG-003, SRC-REG-004, SRC-REG-005 | EV-A-015 | CL-A-011, CL-A-021 | needs-primary-check | Juridisk primærsjekk før ekstern tekst eller finjuss. |
| Konkrete substrater: oat okara, bryggerimask, bakerireturer, kaffegrut, myse, fiskesidestrømmer, tidligere matvarer med kjøtt/fisk, fiskeslam og frass. | SRC-REG-001, SRC-REG-002, SRC-REG-003 | EV-A-013, EV-A-014, EV-A-015 | CL-A-006, CL-A-011, CL-A-021, CL-B-014, CL-B-021 | needs-primary-check | Mattilsynet/juridisk sjekk per substrat og sluttbruk. |
| RecoLab absolutte N/P/K-massebalanser og K-gjenvinning. | SRC-B-015, SRC-B-016, SRC-B-017 | EV-B-015 | CL-B-016, CL-B-023 | needs-primary-check | Skill relative effekter per person fra tonn/år eller produktmengder. |
| PPWR norsk/EØS-ikrafttredelse og underakter. | SRC-C-006 | EV-C-006 | CL-C-010 | needs-primary-check | Bruk EFTA/Miljødirektoratet/Lovdata før norske frister omtales som gjeldende. |
| Matsvinnutvalgets foreslåtte virkemidler og lovstatus per 2026. | SRC-B-014 | EV-B-014 | CL-B-022, CL-C-012, CL-C-015 | needs-primary-check | Sjekk hva som er vedtatt, sendt på høring eller fortsatt anbefaling. |

## Needs-actor-validation

| Funn | SRC-ID | EV-ID | CL-ID | Status | Aktører |
|---|---|---|---|---|---|
| Grønn/gul/rød substratliste for insekt-/fôrpilot. | SRC-REG-001, SRC-REG-002, SRC-REG-003 | EV-A-013, EV-A-014, EV-A-015 | CL-A-011, CL-A-021 | needs-actor-validation | Mattilsynet, juridisk/EØS-kompetanse, fôr-/insektaktør. |
| Insektproteinpilot på godkjente nordiske sidestrømmer. | SRC-A-011, SRC-A-012, SRC-REG-001 | EV-A-011, EV-A-012, EV-A-013 | CL-A-021 | needs-actor-validation | Volare/Finnprotein eller tilsvarende, NMBU, fôr-/sjømatkjøper. |
| Matsvinnkvalitet i butikk/HORECA som adoption-pilot. | SRC-B-014, SRC-C-010, SRC-C-017 | EV-B-014, EV-C-010, EV-C-016 | CL-B-022, CL-C-012, CL-C-015 | needs-actor-validation | Matvett, Too Good To Go, dagligvare/HORECA, offentlig kjøkken. |
| RecoLab og norske nutrient-loop benchmarkcase. | SRC-B-015 til SRC-B-023 | EV-B-015, EV-B-016, EV-B-017 | CL-B-016, CL-B-023, CL-C-015 | needs-actor-validation | NSVA/Recolab, VEAS, HIAS, Den Magiske Fabrikken, Mattilsynet/Landbruksdirektoratet. |
| Norsk governance/adoption gate. | SRC-C-013 til SRC-C-017 | EV-C-013, EV-C-014, EV-C-015, EV-C-016 | CL-C-001, CL-C-002, CL-C-006, CL-C-014, CL-C-015 | needs-actor-validation | Dagligvaretilsynet/Konkurransetilsynet, DFØ/offentlige innkjøpere, leverandører, kjeder. |
| Soya- og fôrråvaredata. | SRC-A-013, SRC-A-015, SRC-C-018 | EV-A-017, EV-A-019, EV-C-017 | CL-A-020, CL-C-011 | needs-actor-validation | Denofa, Skretting, BioMar, Cargill, Mowi, Landbruksdirektoratet/Miljødirektoratet. |
| Okara/bryggerimask som første prosess-sidestrøm. | SRC-B-024, SRC-B-025, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-014, CL-B-021 | needs-actor-validation | Axfoundation, Oatly/The Green Dairy/Fazer/Valio, RISE, Carlsberg/bryggerier, ingrediensaktører. |
| Marint restråstoff som høyverdi-benchmark. | SRC-B-027 | EV-B-020 | CL-B-009, CL-B-021 | needs-actor-validation | SINTEF/FHF, HBC, Biomega, Pelagia, Scanbio og sjømataktører. |

## Archive/reject

| Funn | SRC-ID | EV-ID | CL-ID | Status | Begrunnelse |
|---|---|---|---|---|---|
| L4-estimat om 550-600 000 tonn norsk soyaimport. | Eksisterende L4-kilde | Ikke opprettet | CL-A-020, CL-C-011 | archive/reject for ekstern bruk | Mangler SSB/HS-primærserie; erstattet av Denofa actor-tall og PCQ-A-001. |
| L4-estimat om 100 000-400 000 tonn nordisk okara. | Eksisterende L4-kilde | Ikke opprettet | CL-B-014, CL-B-021 | archive/reject for ekstern bruk | Mangler produsentdata og kolliderer med svensk benchmarklogikk. |
| Feilformulering om 30-50 kg okara per liter havredrikk. | Ikke opprettet | Ikke opprettet | CL-B-014 | archive/reject | Axfoundation/Chalmers peker på ca. 0,2 liter/kg per liter/kg. |
| Direkte claim om at okara/bryggerimask er pilotklare uten produsent- og hygienevalidering. | SRC-B-024 til SRC-B-026 | EV-B-018, EV-B-019 | CL-B-021 | archive/reject som formulert | Kandidater er integrert, men pilotklarhet krever actor validation og Mattilsynet-/hygienesjekk. |
| L4/Perplexity/forskningsrunde-påstander uten primærkilde | Eksisterende lavkvalitets-SRC-er | Eksisterende lavkvalitets-EV-er | Flere | archive/reject for ekstern bruk | Beholdes som kildejakt/hypotese, ikke som beslutningsgrunnlag alene. |
| Direkte claim om at RecoLab er egnet som første raske TG-pilot. | SRC-B-015 til SRC-B-017 | EV-B-015 | CL-B-023 | archive/reject som hovedpilot | Kildene peker på tung infrastruktur/governance; behold som benchmark/sekundærpilot. |
| Direkte claim om at PPWR allerede gjelder i Norge med EU-frister. | SRC-C-006 | EV-C-006 | CL-C-010 | archive/reject | Norge/EØS-status må sjekkes separat. |

## Canonical docs oppdatert

| Dokument | Endring |
|---|---|
| `source-shortlist-food-tg.md` | Nye runde-2-kilder: `SRC-B-015` til `SRC-B-027`, `SRC-C-013` til `SRC-C-018`, `SRC-A-013` til `SRC-A-016`, `SRC-REG-001` til `SRC-REG-006`, samt nye manuell-sjekk-rader. |
| `evidence-matrix-food-tg.md` | Nye EV-rader: `EV-A-013` til `EV-A-020`, `EV-B-015` til `EV-B-020`, `EV-C-013` til `EV-C-017`. |
| `claim-register-food-tg.md` | Oppdaterte claimkoblinger og forbehold for `CL-A-005`, `CL-A-006`, `CL-A-011`, `CL-A-020`, `CL-A-021`, `CL-B-001`, `CL-B-002`, `CL-B-008`, `CL-B-009`, `CL-B-014`, `CL-B-016`, `CL-B-021`, `CL-B-022`, `CL-B-023`, `CL-C-001`, `CL-C-002`, `CL-C-005`, `CL-C-006`, `CL-C-011`, `CL-C-012`, `CL-C-014`, `CL-C-015`. |
| `track-brief-a-feed-import.md` | Legal gate skjerpet og importdata-recovery lagt inn: Denofa actor-tall, oppdrettsfôrvolum, Skretting actor-data, EUMOFA og EUDR-kontekst. |
| `track-brief-b-sidestreams-nutrients.md` | RecoLab flyttet til benchmark/sekundærpilot; norske VA-/biogjødselcase, 2025-gjødselregelverk, okara, bryggerimask og marint restråstoff lagt inn. |
| `track-brief-c-adoption.md` | Norsk governance-gate, EUDR-Norge-check og KPI-disiplin for actor/benchmark/baseline-tall lagt inn. |
| `actor-validation-pack-food-tg-v0.1.md` | Første valideringspakke for Denofa/fôraktører, Mattilsynet, EUDR-myndigheter, okara/BSG/sjømataktører, innkjøp og governance. |
| `primary-check-queue-food-tg-v0.1.md` | Konkret queue for SSB/HS, SPC, EUDR-Norge, fiskemel, okara, bryggerimask, marint restråstoff og KPI-definisjoner. |

## Neste masterkø

1. Kjør `primary-check-queue-food-tg-v0.1.md` i prioritert rekkefølge, særlig EUDR-Norge og SSB/HS-soya/SPC.
2. Send `actor-validation-pack-food-tg-v0.1.md` til første aktørvalg: Mattilsynet, Denofa/fôraktør, okara/BSG-aktør og en C/adoption-aktør.
3. Lås grønn/gul/rød substratliste med Mattilsynet/EU/EØS før A/B-pilot beskrives eksternt.
4. Lås matsvinn-, sidestrøm- og fôrtall med sidetall/kapittel, definisjon, år, geografi, enhet og kilde før decision memo v0.2.
5. Valider RecoLab/VEAS/HIAS/Den Magiske Fabrikken, okara/BSG og marint restråstoff med aktører før noen pilot omtales som mer enn kandidat/benchmark.
6. Når queue og første aktørrespons er ryddet, gå videre til decision memo v0.2 / første innsiktspakke.
