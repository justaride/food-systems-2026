---
tittel: "Master merge runde 3 - Food TG analysefabrikk"
status: Utført internt
eier: Master session
dato: 2026-04-28
neste_handling: Bruk beslutningskøen nederst som grunnlag for decision memo v0.2 og første actor outreach.
relaterte_filer:
  - docs/project/mandates/analysefabrikk-food-tg-arbeidsprosess-2026-04-28.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3a-eudr-norge.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3b-ssb-hs-importdata.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3c-foraktor-kryssjekk.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3d-okara-bsg-hygiene.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3e-marint-restrastoff.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3f-kpi-decision-gate.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-mini-verifikasjon-runde-3.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/actor-validation-pack-food-tg-v0.1.md
---

# Master merge runde 3

Denne loggen normaliserer runde-3-handoffs til `SRC-ID`, `EV-ID`, `CL-ID` og masterstatus. Ingen funn er behandlet som ekstern aktørvalidering. Alle claims i canonical docs beholder status `Utført internt`.

## 1. Worker-oppsett og eierskap

| Worker | Scope | PCQ-eierskap | Actor-validation-rader |
|---|---|---|---|
| 3A | EUDR-Norge | PCQ-C-001 | Landbruksdirektoratet / Miljødirektoratet |
| 3B | SSB/HS-importdata | PCQ-A-001, PCQ-A-002, PCQ-A-004, PCQ-A-005 | Denofa og Skretting/Sjømat Norge som metodekobling, ikke validering |
| 3C | Fôraktørkryssjekk | PCQ-A-003, delvis PCQ-A-002 og PCQ-A-005 | Denofa, Skretting Norge, BioMar / Cargill / Mowi Feed, Foods of Norway / NMBU |
| 3D | Okara/BSG/prosess-sidestrømmer | PCQ-B-001, PCQ-B-002, PCQ-B-003, PCQ-B-004, delvis PCQ-B-006 | Axfoundation / Over & Oat, Oatly / The Green Dairy / Fazer / Valio, RISE / Brewed & Renewed, Carlsberg / norske bryggerier, Mattilsynet/fagekspert |
| 3E | Marint restråstoff | PCQ-B-005 | SINTEF / FHF, HBC / Biomega / Pelagia / Scanbio / sjømataktører |
| 3F | KPI og decision-memo gate | PCQ-C-002 og tverrgående memo-gate | Offentlige innkjøpere / kommunale kjøkken, Dagligvare / HORECA / grossist og dataeiere fra A/B |

## 2. Kvalitetsgate

| Regel | Resultat |
|---|---|
| Ingen claims markeres `Validert eksternt` | Oppfylt. Handoffs og canonical docs står som `Utført internt`. |
| Tall uten definisjon, år, geografi, enhet og kilde løftes ikke | Oppfylt med forbehold. SSB og SINTEF/FHF-tall er løftet; L4-totaler og udefinerte aktør-/volumestimat er avvist. |
| Norsk/EØS-status skilles fra EU-status | Oppfylt. EUDR brukes som EU-scope/frister og norsk høringsstatus, ikke som avklart norsk soya-plikt. |
| Actor-tall skilles fra bransje-/nasjonal baseline | Oppfylt. Denofa og Skretting er actor-/benchmarkdata, ikke bransjeproxy. |
| Benchmark skilles fra pilotklarhet | Oppfylt. Okara/BSG er svenske benchmark; marint restråstoff er norsk sjømatbenchmark; ingen av dem er pilotvalidert. |
| L4-/Perplexity-notater holdes som kildejakt | Oppfylt. L4-soya og nordisk okara/BSG-total er eksplisitt forkastet for ekstern bruk. |

Mini-verifikasjon runde 3 godkjente runden for master-merge, men krevde normalisering av statusord som `citation-ready`, `benchmark-now`, `kan brukes internt` og `ikke bruk` til masterkategoriene under.

## 3. Integrer nå

| Funn | SRC-ID | EV-ID | CL-ID | Masterbeslutning |
|---|---|---|---|---|
| EU-EUDR omfatter soya og relevante avledede produkter i EU; EU-fristene er 30.12.2026 og 30.06.2027 etter 2025-endringen. | SRC-C-018 | EV-C-017 | CL-C-011, CL-A-020 | Integrert som EU-scope/frister, ikke norsk rettsstatus. |
| Norsk høringsgrunnlag peker på delvis EØS-innlemmelse av EUDR, der soya ikke er foreslått innlemmet i norsk virkeområde. | SRC-C-018 | EV-C-017 | CL-C-011 | Integrert som norsk høringsstatus med forbehold om endelig EØS-/Lovdata-/Stortingsstatus. |
| Landbruksdirektoratet peker på Traces/DDS som praktisk system, men Norge/Island/Liechtenstein kan ikke registrere DDS i produksjonssystemet før EØS-innlemmelse er klar. | SRC-C-018 | EV-C-017 | CL-C-011 | Integrert som praktisk avklaringspunkt, ikke som lukket systemstatus. |
| SSB 08801 gir offisiell importbaseline 2020-2025 for soyabønner, soyabønnemel, soyaolje, soyakaker/reststoff, fiskemel/fiskepellets og prepared fish feed. | SRC-A-017 | EV-A-021 | CL-A-020, CL-C-011 | Ny source/EV opprettet. Bruk som varekodebaseline med revisjons- og metodeforbehold. |
| Soyabønner etter SSB `1201` kan brukes i stedet for L4-totalen: 347 191 tonn i 2024 og 399 331 tonn i 2025. | SRC-A-017 | EV-A-021 | CL-A-020, CL-C-011 | Integrert som eksempel på citation-ready SSB-serie; ikke bland med Denofa-tallet uten forklaring. |
| Fiskemel/fiskepellets etter SSB `23012010/90` gir norsk importserie: 217 991 tonn i 2024 og 245 339 tonn i 2025. | SRC-A-017 | EV-A-021 | CL-A-020 | Integrert som importbaseline; faktisk fôrbruk per aktør må valideres. |
| Oppdrettsfôrvolum fra Fiskeridirektoratet/Sjømat Norge er total oppdrettsfôr, ikke laksefôr alene. | SRC-A-014 | EV-A-018 | CL-A-020 | Videreført og skjerpet som definisjonsforbehold. |
| Skretting og Denofa kan brukes som actor-/benchmarkdata for hvilke felt TG må be bransjen om. | SRC-A-013, SRC-A-015 | EV-A-017, EV-A-019 | CL-A-020, CL-C-011 | Integrert som actor-data; ikke bransjeproxy. |
| Okara og bryggerimask er konkrete svenske benchmark for prosess-sidestrømmer, med hygiene-, holdbarhets- og logistikkgate. | SRC-B-024, SRC-B-025, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-009, CL-B-014, CL-B-021, CL-C-015 | Integrert som benchmark og designkrav; ikke norsk/nordisk total eller pilotklarhet. |
| Marint restråstoff 2024 gir norsk sjømatbenchmark: 1,094 mill. tonn tilgjengelig, 976 kt utnyttet, 118 kt ikke utnyttet og 89 % samlet utnyttelse. | SRC-B-027 | EV-B-020 | CL-B-009, CL-B-021, CL-C-015 | EV-B-020 oppdatert med sektorfordeling og vektforbehold. |
| KPI-minimum kan brukes som intern decision gate: alle tall trenger definisjon, år, geografi, enhet, kilde, dataeier, frekvens og status. | Eksisterende SRC/EV på tvers | CL-C-015 | CL-C-015 | Claim-register og PCQ oppdatert som intern gate, ikke effektfortelling. |

## 4. Needs-primary-check

| Funn | SRC-ID | EV-ID | CL-ID | Neste sjekk |
|---|---|---|---|---|
| Endelig norsk/EØS-ikrafttredelse for EUDR: EØS-komitébeslutning, Stortingssamtykke, Lovdata/forskrift og norske frister. | SRC-C-018 | EV-C-017 | CL-C-011 | Sjekk regjeringen.no, Lovdata, EFTA/EØS-status og direktoratene før ekstern Norge-claim. |
| EUDR-varekodescope for SPC, soyamel, soyaolje, soyabønner, `210610`, `23099040` og ferdig fôr. | SRC-C-018, SRC-A-017 | EV-C-017, EV-A-021 | CL-C-011, CL-A-020 | Avklar med Landbruksdirektoratet/Miljødirektoratet, SSB/Tolletaten og fôraktører. |
| Nasjonalt SPC-volum og hvor SPC eventuelt skjules i handelsstatistikken. | SRC-A-017, SRC-A-015 | EV-A-021, EV-A-019 | CL-A-020 | `210610` er ikke soyaspesifikk; `23099040` må ikke kalles SPC uten metode. |
| Artsfordelt laksefôrvolum. | SRC-A-014 | EV-A-018 | CL-A-020 | Bruk `oppdrettsfôr` hvis artsfordelt/laksespesifikk serie ikke finnes. |
| Okara/BSG food-grade, Novel Food, hygiene, holdbarhet og lovlig sluttbruk. | SRC-B-024, SRC-B-025, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-009, CL-B-014, CL-B-021 | Avklar med Mattilsynet/fagekspert og produsent-QA før pilotclaim. |
| Norsk/nordisk okara- og BSG-volum per anlegg. | SRC-B-024, SRC-B-025, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-014, CL-B-021 | Bekreft med Oatly/The Green Dairy/Fazer/Valio og bryggerier. |
| Marint restråstoff fraksjon-til-sluttbruk, råstoffvekt vs produktvekt og K2/dødfisk-splitt. | SRC-B-027 | EV-B-020 | CL-B-009, CL-B-021, CL-C-015 | Sjekk datadictionary/tabeller hos SINTEF/FHF/Kontali og aktører. |
| Matsvinnbaseline, N/P/K-massebalanser og KPI-metode. | SRC-B-014, SRC-B-015 til SRC-B-023, SRC-C-011 | EV-B-014 til EV-B-017, EV-C-011 | CL-B-022, CL-B-023, CL-C-015 | Må låses med primærkilder og dataeiere før KPI-resultater eller målverdier brukes. |

## 5. Needs-actor-validation

| Funn | SRC-ID | EV-ID | CL-ID | Aktører |
|---|---|---|---|---|
| Praktisk EUDR-betydning for norske soya-/fôraktører, inkludert EU-kundekrav og dokumentasjonsflyt. | SRC-C-018, SRC-A-017 | EV-C-017, EV-A-021 | CL-C-011, CL-A-020 | Landbruksdirektoratet, Miljødirektoratet, Denofa, Skretting, BioMar, Cargill, Mowi Feed. |
| Bransjefordeling for fôrråvarer og SPC/fiskemel/fiskeolje i 2024/2025. | SRC-A-015, SRC-A-017 | EV-A-019, EV-A-021 | CL-A-020 | Skretting, BioMar, Cargill, Mowi Feed, Sjømat Norge. |
| Modenhet for encelle-/gjærprotein som pilotspor. | SRC-A-001, SRC-A-002 | EV-A-001, EV-A-002 | CL-A-001, CL-A-002, CL-A-020 | NMBU/Foods of Norway og fôr-/sjømataktør. |
| Okara og BSG som første ren prosess-sidestrømspilot. | SRC-B-024, SRC-B-025, SRC-B-026 | EV-B-018, EV-B-019 | CL-B-009, CL-B-014, CL-B-021 | Axfoundation/Chalmers, Oatly/The Green Dairy/Fazer/Valio, RISE, Carlsberg/norske bryggerier, ingrediens-/bakeriaktør, Mattilsynet/fagekspert. |
| Marint restråstoff som norsk høyverdi-benchmark og sekundær actor-learning track. | SRC-B-027 | EV-B-020 | CL-B-009, CL-B-021, CL-C-015 | SINTEF/FHF, Pelagia, Scanbio, Biomega, HBC og sjømatprodusent/flåteledd. |
| KPI-er som faktisk kan rapporteres av aktørene. | Flere | Flere | CL-C-015 | Dataeiere i fôr, sjømat, bryggeri/plantedrikk, avløp/biogass, dagligvare/HORECA og offentlige innkjøp. |

## 6. Archive/reject

| Funn/formulering | Status | Begrunnelse |
|---|---|---|
| L4-total om 550-600 000 tonn norsk soyaimport | archive/reject for ekstern bruk | Erstattet av SSB 08801 per varekode og Denofa som separat actor-tall. |
| `23099040` er SPC eller norsk laksefôrvolum | archive/reject som formulert | Koden er prepared fish feed og krever SSB/Tolletaten/fôraktørmetode; ikke ren SPC eller artsfordelt laksefôr. |
| Skretting 2024 som bransjesnitt | archive/reject som formulert | Skretting er actor-benchmark, ikke norsk bransjeproxy uten BioMar/Cargill/Mowi/Sjømat Norge. |
| Denofa 450 000 tonn/år som total norsk soyaimport | archive/reject som formulert | Denofa er actor-tall for soyabønner til Fredrikstad, ikke offisiell handelsstatistikk eller SPC. |
| `EUDR gjelder direkte i Norge for soya` | archive/reject som formulert | Norsk høringsgrunnlag sier delvis innlemmelse og ingen soya-varetyper foreslått innlemmet. |
| Nordisk okara/BSG-total fra L4-/Perplexity-estimat | archive/reject for ekstern bruk | Mangler produsent-/statistikkgrunnlag. |
| Okara, fermentert okara eller BSG er `matgrade`, Novel Food-avklart eller pilotklar | archive/reject som formulert | Krever Mattilsynet/fagekspert, produsent-QA, holdbarhet og off-taker. |
| Marint restråstoff som første plantebaserte B-pilot | archive/reject som formulert | Marint restråstoff er norsk sjømatbenchmark/fraksjonsspor, ikke plantebasert prosess-sidestrøm. |
| KPI-effekter eller målverdier uten dataeier/metode/frekvens | archive/reject som ekstern effektfortelling | KPI-er er intern gate til data er bekreftet. |

## 7. Canonical docs oppdatert

| Dokument | Endring |
|---|---|
| `source-shortlist-food-tg.md` | Ny `SRC-A-017` for SSB 08801; `SRC-C-018` presisert som EU- og norsk EUDR-kildepakke; manuell-sjekk-rader oppdatert for SSB, EUDR og L4-avvisning. |
| `evidence-matrix-food-tg.md` | Ny `EV-A-021` for SSB/HS-importdata; `EV-C-017` presisert for EU/Norge EUDR; `EV-B-020` utvidet med SINTEF/FHF sektor- og vektforbehold. |
| `claim-register-food-tg.md` | `CL-A-020`, `CL-C-011` og `CL-C-015` oppdatert med SSB/EUDR/KPI-forbehold. Status beholdt som `Utført internt`. |
| `primary-check-queue-food-tg-v0.1.md` | Runde-3 statusnotat lagt inn: hva er internt integrerbart og hva som fortsatt må primærsjekkes. |
| `actor-validation-pack-food-tg-v0.1.md` | Første outreach-prioritet etter runde 3 lagt inn, uten å registrere validering. |

## 8. Beslutningskø for decision memo v0.2

### Kan brukes nå

1. Scope: A+B som hovedspor, C som adoption-, governance- og datagate.
2. EUDR: EU-scope og EU-frister kan brukes; norsk høringsstatus kan brukes med tydelig formulering om delvis EØS-innlemmelse og soya ikke foreslått innlemmet.
3. Importbaseline: SSB 08801 kan brukes per varekode for soya- og fiskemelrelaterte importstrømmer, med revisjonsnote.
4. Actor-data: Denofa og Skretting kan brukes som actor-/benchmarkdata, ikke bransjeproxy.
5. Okara/BSG: svenske benchmark og hygiene-/logistikkgate kan brukes som kandidatgrunnlag.
6. Marint restråstoff: SINTEF/FHF 2024 kan brukes som norsk høyverdi-benchmark, ikke som første plantebaserte pilot.
7. KPI-er: kan brukes som intern appendix/datagate, ikke som eksterne effektmål.

### Må vente

1. Endelig norsk EUDR-status, Lovdata/forskrift, EØS-komité/Storting, Traces/DDS/EORI og SPC/prepared-feed-varekoder.
2. Nasjonalt SPC-volum, `23099040`-metode og artsfordelt laksefôr.
3. Bransjefordeling for fôrråvarer på tvers av Skretting, BioMar, Cargill, Mowi Feed og eventuell Sjømat Norge-aggregat.
4. Okara/BSG norsk/nordisk volum, food-grade, Novel Food/hygiene, holdbarhet, produsent-QA og off-taker.
5. Marint fraksjon-til-sluttbruk, K2/dødfisk-splitt, human/fôr/pet/energi og høyverdiavsetning.
6. Matsvinnbaseline, N/P/K-massebalanser og KPI-resultater/målverdier.
7. Alle statusløft til `Validert eksternt`.

### Hvem må kontaktes først

| Prioritet | Kontakt | Beslutning de kan låse |
|---|---|---|
| 1 | Landbruksdirektoratet / Miljødirektoratet | EUDR-Norge, soya-scope, SPC/prepared-feed-varekoder og Traces/DDS-praksis. |
| 2 | Denofa, Skretting og Sjømat Norge | Soya-/fôrbaseline, actor-vs-bransjeavgrensning, fôrsammensetning og hva som kan siteres. |
| 3 | NMBU / Foods of Norway | Teknisk modenhet for encelle-/gjærprotein og hva som kan brukes om substitusjon. |
| 4 | Mattilsynet/fagekspert + okara/BSG-råvareeier | Lovlig sluttbruk, hygiene, holdbarhet og om ren prosess-sidestrøm kan bli første B-pilot. |
| 5 | SINTEF/FHF + marin restråstoffaktør | Fraksjon-til-sluttbruk og om sjømatsporet skal være benchmark, sekundærpilot eller actor-learning track. |
| 6 | Matvett / Too Good To Go / dagligvare/HORECA | Fallback/adoption-pilot hvis teknisk substratpilot ikke kan valideres raskt. |

## 9. Stoppsignal før ekstern kommunikasjon

Ikke kommuniser ekstern roadmap-effekt, pilotvolum, finansierbarhet eller aktørcommitment før:

1. EUDR-Norge er enten eksplisitt avklart eller merket uavklart med absolute datoer.
2. SPC/fôrbaseline er ryddet som SSB/HS-metode, actor-data eller benchmark.
3. Første B-pilot har minst én råvareeier og ett hygiene-/regelverkssvar.
4. Alle uvaliderte claims står som hypotese, kandidat, benchmark eller `needs-primary-check`/`needs-actor-validation`.
