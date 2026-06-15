---
tittel: Food TG Definerte søk — søk-spesifikasjon 2026-06-14
status: Aktiv intern (søk-spesifikasjon)
eier: Gabriel
dato: 2026-06-14
scope: Spesifikasjon av de målrettede, definerte søkene som lukker konkrete hull og produserer påstander feltet ikke allerede har. Hvert søk har én claim-å-lukke, navngitt primær-/aktørkilde, og en kill-test. Mater PCQ og source-shortlist — erstatter dem ikke.
bruksregel: Internt arbeidsdokument. Et definert søk åpner ingen ekstern faktastemme. Outputer kjøres gjennom valideringsprompten og mottaksprotokollen før PCQ/source-shortlist/claim-lock endres. Ingen aktør kontaktes før minimumsvedtak (DASK) eller aktørgodkjenning (AASK) er loggført.
relaterte_filer:
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - docs/project/mandates/food-tg-mottaksprotokoll-v1-2026-06-15.md
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
---

# Food TG Definerte søk — søk-spesifikasjon 2026-06-14

## 0. Hva dette er — og forholdet til de andre filene

Dette uttaket svarer på «spesialdefinerte søk» som veien til dybde. Det er **ikke** en ny kø og **ikke** bredt research. Det er en *spesifikasjon*: for hvert hull definerer det ett presist søk med navngitt primær- eller aktørkilde, én påstand søket skal lukke, og en kill-test som sier når caset parkeres.

Arbeidsdelingen:

- **Eksisterende data → mønster:** `food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md` (analyse, ingen ny innhenting).
- **Konkret hull → primærkilde/aktør:** *dette dokumentet* (definerte søk).
- **Kø for uavklarte claims:** `primary-check-queue-food-tg-v0.1.md` (PCQ) — definerte søk her *mater* PCQ-rader, ikke omvendt.
- **Kildebevis med locator:** `source-shortlist-food-tg.md` (SRC-IDer).

Et **definert søk** kjennetegnes av fire ting, som skiller det fra bredt søk: (1) avgrenset scope — ett spørsmål, ikke et tema; (2) navngitt målkilde — en bestemt primærkilde eller aktør, ikke «søk på nettet»; (3) én claim-å-lukke; (4) en kill-test — den eksplisitte betingelsen for å parkere framfor å lete videre.

## 1. Kjøreregel

1. Kjør søket mot den navngitte målkilden; ikke utvid scope underveis.
2. Kjør output gjennom valideringsprompten (`food-tg-deep-research-prompt-pack`) og mottaksprotokollen.
3. Oppdater PCQ/source-shortlist/claim-lock først når mottaksraden viser hva kilden beviser og ikke beviser.
4. Hvis kill-testen slår inn: park caset/claimet aktivt og noter hvorfor. Parkering er et gyldig resultat.
5. Ingen aktørkontakt før DASK/AASK-godkjenning er loggført i operatorloggen.

## 2. Definerte søk per anker

ID-format: `DS-<spor>-NN`. Spor: A=fôr/import, B=marint/restråstoff, C=matsvinn, D=okara/sidestrøm, E=marked/distribusjon, F=kaffe/kakao, G=spillvarme/Valio, W=watchlist.

### Anker 1 — Fôr/import og alternative proteiner

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-A-01 | Er HS `210610`/`23099040` SPC-/prepared-feed-spesifikke, eller skjuler de blandede strømmer? | SSB/Tolletaten varekodedefinisjon + fôraktør | Faktisk SPC-importvolum med definert varekode | Hvis koden ikke kan dekomponeres til SPC, park SPC-spesifikk volumclaim; behold handelsbaseline | PCQ-A-002 |
| DS-A-02 | Artsfordelt/laksespesifikt faktisk fôrbruk og aktørfordeling | Fiskeridir/Sjømat Norge + fôraktør (AASK) | Norsk fôrbruk fordelt på art/aktør | Hvis ingen aktørsvar, hold Skretting/Denofa som benchmark, ikke bransjeproxy | PCQ-A-003, PCQ-A-005 |

### Anker 2 — Marint restråstoff / 100% Fish

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-B-01 | Norsk fraksjon-til-sluttbruk og høyverdiandel (utnyttet vs. høyverdiutnyttet) | SINTEF/FHF 2024-fraksjonsuttrekk; vurder FHF-call (frist 26.06.2026) | «Utnyttet vs. høyverdiutnyttet» kvantifisert for Norge | Hvis fraksjonsdata ikke åpnes, hold 100% Fish som benchmark-only | PCQ-B-005 |
| DS-B-02 | Strand et al. 2024 fulltekst + definisjonstabell (Island–Norge-utnyttelse) | NVA-record/fulltekst (lokal kopi hentet 12.06) | Island–Norge-utnyttelsessammenligning på lik definisjon | P-FISH-2 forblir stoppsignal til artikkelen er lest og definisjonsbroen satt | CAP-1306-003 |
| DS-B-03 | Islandsk nåtids-fraksjons-/volumdata | Statistics Iceland PxWeb | Islandsk benchmark med årstall og enhet | Hvis PxWeb ikke gir fraksjon, bruk kun som strukturell benchmark | SRC-0906-014 |

### Anker 3 — Matsvinnkvalitet og offentlig innkjøp

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-C-01 | Partnerbaseline + kontraktskrav for kvalitetstap *før* varen faller i kaskaden | Matvett/Too Good To Go/kommunalt kjøkken/innkjøp (AASK) | Kvalitetstap-spesifikt matsvinn med baseline og kontrafaktisk | Hvis ingen partnerbaseline, hold som adoption-hypotese; ikke bruk «måltider reddet» som reduksjonsbevis | CL-C-002, CL-C-015 |

### Anker 4 — Okara/BSG og rene sidestrømmer

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-D-01 | Norsk/nordisk volum + food-grade/hygiene + off-taker for **én** valgt strøm | Råvareeier + Mattilsynet/fagekspert + off-taker (DASK/AASK) | At én strøm har volum, lovlig sluttbruk og avtaker | Gul gate: velg bare strømmen som åpner alle tre; ellers hold som benchmark | PCQ-B-001..B-004 |

### Anker 5 — Markedsmakt, distribusjon og adoption

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-E-01 | Månedlig import-/norskandel-vindu for salat, tomat, agurk, vårløk, urter | SSB månedstall | Norskandel per produkt/måned (CEA-relevante varer) | Hvis månedsoppløsning mangler, bruk årsnivå og merk | CAP-1306-002, PCQ-0906-004 |
| DS-E-02 | Onboarding-/volum-/kvalitetskrav i distribusjonskanal | Grossist/leverandør (AASK) | Konkrete kanaltilgangskrav | Ingen BAMA-spesifikk margin-/blokkeringsclaim uten primærkilde | PCQ-0906-004 |

### Anker 6 — Kaffe/Brasil og kakao/Elfenbenskysten

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-F-01 | MOU/avtaletekst, partsliste, dato, scope for Brasil + Elfenbenskysten | Dokumenteier NCH/Natural State/Nordic Innovation (DASK-0906-001/002) | At relasjon/MOU finnes med dokumentert scope | Hvis ingen dokumenteier svarer, park relasjonscasene (Sak 4) | PCQ-0906-001/002/003 |
| DS-F-02 | (Hvis kaffe beholdes som import/EUDR-case) kaffeimport per opprinnelse + EUDR-eksponering | SSB/WITS HS0901 + Landbruksdirektoratet EUDR | Importbaseline og EUDR-relevans uten MOU-claim | Ikke bruk EUDR-kontekst som bevis for MOU/partnerrolle | SRC-0906-001/003 |

### Anker 7 — Spillvarme/drivhus og Valio/Finland

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-G-01 | Hima driftsdata: GWh/år, tur/retur-temp, reservevarme, off-taker, økonomi | Green Mountain/Hima (AASK) | Operativt spillvarme-til-matproduksjon-case med drift | Ingen nasjonalt TWh-claim; ikke kall elektrisk kapasitet nyttiggjort varme | PCQ-0906-005 |
| DS-G-02 | Wiig: operativ status, driftsbevis | Klepp kommune/Enova | Om Wiig er operativt eller plan | Hvis ingen driftsbevis, park Wiig (ikke «operativ») | PCQ-0906-005 |
| DS-G-03 | Valio aggregert fôrkurv 2022–2025 + importandel | Valio + Ruokavirasto/Tulli/Luke (AASK) | «Soyafri governance» kvantifisert vs. importfri | Ikke si importfri/100 % finsk uten fôrkurv; hold som governance-ramme | PCQ-0906-006 |

### Watchlist

| ID | Definert søk | Målkilde (primær) | Claim å lukke | Kill-test | PCQ/SRC |
|---|---|---|---|---|---|
| DS-W-01 | Skottland: ZWS 2025 fulltekst + SBMT data dictionary/lisens | Zero Waste Scotland / IBioIC | Benchmark-kandidat med datadekning | Hold som benchmark-kandidat, ikke ferdig Food TG-case | SRC-0906-007/008 |
| DS-W-02 | Polen kill-test: aktør, lokasjon, volum, output | GUS/PROM/CDR/SIR | Om Polen har et konkret sidestrøm-case | Park Polen som direkte case hvis alle fire mangler | PCQ-0906-007 |

## 3. Prioritering

| Prioritet | Søk | Hvorfor nå | Tidsvindu |
|---:|---|---|---|
| P0 | DS-B-01 (+ FHF-call) | Treffer datagapet i anker 2; FHF-frist 26.06.2026 | denne uka |
| P0 | DS-F-01 | Avgjør om kaffe/kakao overlever (Sak 4) | uke 25 |
| P1 | DS-G-01, DS-G-03 | Løfter de to deckklare 7-ankrene videre | etter minimumsvedtak |
| P1 | DS-B-02 | Lukker P-FISH-2-stoppsignalet (artikkel allerede hentet) | nær sikt |
| P2 | DS-A-01/02, DS-E-01/02 | Modner A- og C-sporet mot aktørvalidering | løpende |
| P2 | DS-W-01/02 | Avklar watchlist før de tar plass | etter P0/P1 |

## 4. Forholdet til de definerte søkenes resultater

Et definert søk har fire mulige utfall, alle gyldige: (a) **lukker claim** → claim-lock-rad + source-shortlist; (b) **delvis** → PCQ skjerpes; (c) **svekker/motbeviser** → claim-lock-stoppspråk oppdateres; (d) **kill-test slår inn** → caset parkeres. Ingen av utfallene åpner ekstern faktastemme uten operator-sekvens.

## 5. Verifikasjon

Hullene og målkildene er hentet fra `primary-check-queue-food-tg-v0.1.md` (PCQ-A/B/C/0906-rader), sprintboardets blokkere (`food-tg-0906-sprintboard-go-no-go-2026-06-10.md`), casekortenes kilde-/databehov (`food-tg-casekort-og-research-mottak-2026-06-10.md`) og case-avsjekkene 12.–13.06 (CAP-1306-*). FHF-fristen 26.06.2026 er verifisert mot fhf.no (jf. `food-tg-funding-opportunity-oversikt-2026-06-14.md`). Dette dokumentet definerer søk; det rapporterer ingen funn og løfter ingen claim. `git diff --check` forutsettes kjørt før commit.
