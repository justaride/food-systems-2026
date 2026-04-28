---
tittel: "Mini-verifikasjon runde 3 - Food TG analysefabrikk"
status: Utført internt
eier: Mini-verifikasjon
dato: 2026-04-28
canonical_docs_redigert: false
leste_handoffs:
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3a-eudr-norge.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3b-ssb-hs-importdata.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3c-foraktor-kryssjekk.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3d-okara-bsg-hygiene.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3e-marint-restrastoff.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-3f-kpi-decision-gate.md
---

# Mini-verifikasjon runde 3

Denne gaten kontrollerer runde-3-handoffs før master-merge. Den oppdaterer ikke canonical docs.

## 1. Kontrollresultat

| Kontroll | Resultat | Kommentar |
|---|---|---|
| 1. Har hvert tall definisjon, år, geografi, enhet og kilde? | Bestått med forbehold | 3B og 3E har best tallstruktur. 3D har siterbare svenske benchmark, men master bør sikre dato/metode per benchmark før ekstern bruk. Denofa-tallet er actor-tall og udatert/årlig, lest 2026-04-28, og må ikke bli offisiell tidsserie. |
| 2. Er EU-status skilt fra norsk/EØS-status? | Bestått | 3A skiller EU-scope/frister fra norsk delvis EØS-innlemmelse og høringsstatus. 3F viderefører skillet i decision memo-gaten. |
| 3. Er actor-tall skilt fra bransje-/nasjonal baseline? | Bestått | 3B og 3C skiller SSB/Fiskeridirektoratet fra Denofa/Skretting. Skretting og Denofa brukes som actor-/benchmarkdata, ikke bransjeproxy. |
| 4. Er benchmark skilt fra pilotklarhet? | Bestått | 3D skiller svensk okara/BSG-benchmark fra norsk/nordisk pilotklarhet. 3E skiller marint restråstoff som norsk høyverdi-benchmark fra første plantebaserte B-pilot. |
| 5. Er ingen claims markert Validert eksternt uten faktisk ekstern respons? | Bestått | Runde-3-handoffs omtaler eksplisitt at ingen claim skal løftes til `Validert eksternt`. Ingen dokumentert ekstern aktørrespons er registrert. |
| 6. Er L4-/Perplexity-funn holdt som hypoteser/kildejakt? | Bestått | 3B avviser L4-totalen for norsk soyaimport; 3D/3F holder nordisk okara/BSG-estimat ute; 3F markerer L4-estimat som `ikke bruk`. |
| 7. Finnes anbefaling om integrer nå / needs-primary-check / needs-actor-validation / archive/reject? | Bestått med normaliseringsbehov | Alle handoffs har anbefalinger, men statusord varierer: `citation-ready`, `benchmark-now`, `do-not-use-as-pilot-ready`, `kan brukes internt` og `ikke bruk` må mappes til masterkategoriene før canonical merge. |

## 2. Handoff-notater

| Handoff | Trygt å integrere | Må holdes tilbake |
|---|---|---|
| 3A EUDR-Norge | EU-scope og EU-frister; norsk høringsstatus om delvis innlemmelse og at soya ikke er foreslått innlemmet; Traces/DDS som praktisk avklaringspunkt. | Endelig norsk/EØS-ikrafttredelse, Lovdata-status, SPC/prepared-feed-varekoder og påstand om at norsk innenlands soyaimport er EUDR-regulert. |
| 3B SSB/HS | SSB 08801-serier for soyabønner, soyabønnemel, soyaolje, soyakaker, fiskemel/fiskepellets; Fiskeridirektoratet/Sjømat Norge oppdrettsfôr totalt; Denofa/Skretting som separate actor-tall. | Nasjonalt SPC-volum, `23099040` som SPC, laksefôrvolum uten artsfordeling, Skretting som bransjesnitt og L4-total for soya. |
| 3C fôraktører | Aktørmatrise, spørsmålsbank og outreach-rekkefølge; Skretting som actor-benchmark; Denofa som soyaprosesseringscase. | Bransjefordeling, total SPC-tonnasje, Denofa akvakulturandel, EUDR-aktørpraksis og pilotminimum før svar fra aktører. |
| 3D okara/BSG | Svensk okara- og BSG-benchmark; hygiene-/regelverksgate; datakrav per produsent og Mattilsynet/fagekspert. | Norsk/nordisk totalvolum, food-grade, Novel Food-avklart status, matgrade/pilotklarhet og L4-modellanslag. |
| 3E marint restråstoff | SINTEF/FHF norsk sjømatbaseline, samlet utnyttelsesgrad, sektorfordeling og produktgrupper med vektforbehold. | Eksakt fraksjon-til-sluttbruk, human vs feed/pet/energi for enkeltdeler, K2/dødfisk-splitt og aktørspesifikke høyverdi-claims. |
| 3F KPI/decision gate | KPI-minimum som intern styringsgate; decision memo-formuleringer med forbehold; liste over claims som bare kan brukes som hypotese/kandidat/benchmark. | Ekstern KPI-effekt, målverdier, validerte claim-statusendringer og beslutningskommunikasjon før stoppsignalene er lukket. |

## 3. Funn som er trygge å integrere

- EU-EUDR-scope og EU-frister, men bare som EU-status.
- Norsk/EØS EUDR-høringsstatus med presis formulering: delvis innlemmelse, soya ikke foreslått innlemmet, endelig ikrafttredelse fortsatt ikke lukket.
- SSB 08801 importserier per varekode for soya- og fiskemelrelaterte strømmer.
- Fiskeridirektoratet/Sjømat Norge som baseline for oppdrettsfôr totalt, ikke laksefôr alene.
- Denofa ca. 450 000 tonn/år og Skretting 2024-råvareandeler som actor-tall, ikke bransjeproxy.
- Svenske okara/BSG-benchmark som kandidatgrunnlag, ikke norsk/nordisk volum eller pilotklarhet.
- SINTEF/FHF marint restråstoff 2024 som norsk benchmark med tydelig skille mellom utnyttelsesgrad og høyverdi.
- KPI-minimum som intern appendix og kvalitetsgate for `decision memo v0.2`.

## 4. Funn som må holdes tilbake

- Direkte påstand om at EUDR gjelder norsk innenlands soyaimport eller at Norge har full EUDR-innlemmelse.
- SPC som nasjonalt volum eller `23099040` som ren SPC uten SSB/Tolletaten/fôraktøravklaring.
- Skretting eller Denofa som bransje-/nasjonal baseline.
- L4-/Perplexity-estimater for norsk soyaimport og nordisk okara/BSG-total.
- Okara, fermentert okara eller BSG som matgrade, Novel Food-avklart eller pilotklar.
- Marint restråstoff som første plantebaserte B-pilot eller som fraksjon-til-sluttbruk uten SINTEF/FHF/aktørsjekk.
- Matsvinn-, N/P/K- og KPI-effekter uten låst baseline, dataeier, frekvens og metode.
- Alle claims listet i 3F som hypoteser/kandidater/benchmark før ekstern respons er dokumentert.

## 5. Konkrete rettelser master må gjøre

1. Normaliser alle worker-statusord til masterkategoriene: `integrer nå`, `needs-primary-check`, `needs-actor-validation` og `archive/reject`.
2. I `decision memo v0.2`, skriv en egen gate for "kan brukes nå" og "må vente", og bruk 3F-formuleringene som default.
3. Oppdater `primary-check queue v0.2` med åpne punkter: endelig EUDR Norge/EØS/Lovdata, SPC/prepared-feed-varekoder, artsfordelt laksefôr, okara/BSG matgrade og produsentvolum, marint fraksjon-til-sluttbruk, matsvinnbaseline og N/P/K-massebalanser.
4. Oppdater `actor validation pack v0.2` eller epostutkast med første kontakter: Landbruksdirektoratet/Miljødirektoratet, Denofa, Skretting, Sjømat Norge, NMBU/Foods of Norway, okara/BSG-produsent, Mattilsynet/fagekspert og SINTEF/FHF.
5. Ikke endre claim-register-status til `Validert eksternt` før ekstern respons har navn/rolle, dato, hva som er bekreftet/avkreftet, bruksnivå og eventuell sitatsjekk.
6. Legg inn revisjonsnote i memoet for SSB 2024/2025-tall og kilde-/metodeforbehold for actor- og benchmarktall.
7. Arkiver/avvis eksplisitt formuleringer om L4-soyatotal, L4-nordisk okara/BSG-total, bransjesnitt fra Skretting og pilotklar okara/BSG.

## 6. Avsluttende gate

Runde 3 kan gå til master-merge som internt beslutningsgrunnlag. Den kan ikke gå til ekstern beslutningskommunikasjon før stoppsignalene er håndtert: EUDR-Norge eksplisitt avklart eller merket uavklart, SPC/fôrbaseline ryddet med SSB/HS/metode eller actor-/benchmarkstatus, første B-pilot validert med minst én råvareeier og ett hygiene-/regelverkssvar, og alle gjenværende hypoteser tydelig merket som hypoteser.
