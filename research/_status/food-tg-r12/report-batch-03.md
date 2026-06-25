# Food TG R12 Batch 03 report

**Dato:** 2026-06-24  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch after batch 02.  
**Batch:** `R12-RES-001`, `R12-RES-002`, `R12-DIST-002`, `R12-TRUE-001`, `R12-GOV-001`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-RES-001`, `R12-RES-002`, `R12-DIST-002`, `R12-GOV-001` |
| park | 1 | `R12-TRUE-001` |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-RES-001 | Norge har A-kilde for forkorrigert selvforsyning; harmonisert nordisk metode ble ikke funnet. | Helsedirektoratet/NIBIO kostholdsstatistikk 2025 | Andre nordiske land mangler trygg parallell indikator i denne runden. | A for Norge, C for nordisk metodegap | Type C for harmonisert serie | PCQ | Importer Norge som A-anker og nordiske C-felt; ingen rangering. |
| R12-RES-002 | Beredskapslager ma skilles i mal, avtale, faktisk beholdning, kapasitet og klassifisert fravaer. | Jordbruksverket + Finnish NESA | Tonnasje, lokasjon og innsatsvarestatus er delvis ikke apent. | A med C-hull | Type C for detaljerte beholdninger | PCQ | Importer som lager-/beredskapsmatrise med synlige C-felt. |
| R12-DIST-002 | Doffin kan gi regional kontrakt-ledger, men ikke nasjonal markedsandel uten komplett uttrekk. | Doffin public webclient notices API | Delkontrakt, verdi, avrop og nasjonal andel krever videre strukturert uttrekk. | A med uttrekkshull | Type A/C | PCQ | Importer som regional procurement candidate; ikke nasjonal-share claim. |
| R12-TRUE-001 | Eksakt Edinburgh/NMBU-person ikke trygt identifisert; kandidatspor bevart. | Edinburgh Research Explorer + FSCI | Ingen kilde kobler entydig samme person til Edinburgh/NMBU og indikatorsporet. | A/B kandidater, C for exact identity | Type A/C | parkert | Parker navneclaim; shortlist kandidatkilder. |
| R12-GOV-001 | Governance-sloyfen er en analysehypotese om gap mellom virkemiddel og malt strukturendring. | Meld. St. 9, KT Dagligvarerapporten 2024, regjeringen.no dagligvare | Kausalpil fra virkemiddel til strukturendring er ikke bevist. | A med C-effekthull | Type C for malt kausal effekt | forstaelse | Importer som forstaelse, ikke claim-lock. |

## Per-target outcome

### R12-RES-001 - ENRICH

Output: `research/external/r12/R12-RES-001-forkorrigert-selvforsyning-norden.md`

Verified source anchors:

- Helsedirektoratet 2025 selvforsyningsgrad: `https://www.helsedirektoratet.no/rapporter/utviklingen-i-norsk-kosthold-2025/matvarer/selvforsyningsgrad`
- NIBIO selvforsyningsgrad/engrosforbruk: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`

Outcome: Norge kan brukes som A-anker for forkorrigert indikator. Nordisk sammenligning krever metodebro og skal forelopig ha C-felt.

### R12-RES-002 - ENRICH

Output: `research/external/r12/R12-RES-002-beredskapslager-korn-for-gjodsel.md`

Verified source anchors:

- Jordbruksverket beredskapslager: `https://jordbruksverket.se/beredskap/sveriges-livsmedelsberedskap/beredskapslager-av-spannmal-och-insatsvaror`
- Finnish NESA grain stockpiles: `https://www.huoltovarmuuskeskus.fi/en/a/national-emergency-supply-agency-boosting-finlands-emergency-grain-stockpiles`
- Regjeringen Prop. 1 S 2025-2026: `https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123353/`
- Danmark fodvareberedskap: `https://foedevarestyrelsen.dk/kost-og-foedevarer/foedevaresikkerhed/foedevareberedskab`

Outcome: Good PCQ candidate if matrix separates mal, realisert avtale, faktisk beholdning, kapasitet and C/classified fields.

### R12-DIST-002 - ENRICH

Output: `research/external/r12/R12-DIST-002-offentlige-matkontrakter-regionalt.md`

Verified source anchors:

- Doffin `2025-102264`: `https://api.doffin.no/webclient/api/v2/notices-api/notices/2025-102264`
- Doffin `2025-119895`: `https://api.doffin.no/webclient/api/v2/notices-api/notices/2025-119895`
- Doffin `2026-108326`: `https://api.doffin.no/webclient/api/v2/notices-api/notices/2026-108326`
- Doffin `2024-102276`: `https://api.doffin.no/webclient/api/v2/notices-api/notices/2024-102276`
- Doffin `2026-108997`: `https://api.doffin.no/webclient/api/v2/notices-api/notices/2026-108997`

Outcome: Regional kontraktledger is feasible. National share, local producer channel and values remain extraction gaps.

### R12-TRUE-001 - PARK

Output: `research/external/r12/R12-TRUE-001-edinburgh-nmbu-indikatorforsker.md`

Verified source anchors:

- Edinburgh Research Explorer, Merkle et al. 2021: `https://www.research.ed.ac.uk/en/publications/how-does-market-power-affect-the-resilience-of-food-supply/`
- Food Systems Countdown Initiative: `https://www.foodcountdown.org/`
- PubMed record for FSCI Nature Food article: `https://pubmed.ncbi.nlm.nih.gov/38114693/`
- Edinburgh profile, Kirsteen Shields: `https://edwebprofiles.ed.ac.uk/profile/kirsteen-shields`
- Edinburgh Land and Food Systems Lab: `https://blogs.ed.ac.uk/land_and_food_lab/`

Outcome: Exact person claim parked. Candidate source shortlist retained for follow-up.

### R12-GOV-001 - ENRICH

Output: `research/forstaelse/R12-GOV-001-governance-impotens-sloyfen.md`

Verified source anchors:

- Totalberedskapsmeldingen: `https://www.regjeringen.no/no/dokumenter/meld.-st.-9-20242025/id3082364/?ch=2`
- Konkurransetilsynet Dagligvarerapporten 2024: `https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf`
- Regjeringen dagligvaremarkedet: `https://www.regjeringen.no/no/dokument/dep/nfd/sak/dagligvare/id2924715/`
- Utredning funksjonelt/regnskapsmessig skille: `https://www.regjeringen.no/contentassets/06b381ba03a74b4e9c58822890f7cc2f/utredning-av-funksjonelt-og-regnskapsmessig-skille-i-verdikjeden-for-mat-og-dagligvarer.pdf`

Outcome: Good forstaelse candidate, but not claim-lock. Kausalpil from virkemiddel to structure change remains C.

## Stop-regler som ble brukt

- Nordisk forkorrigert selvforsyning ble ikke gjort til rangering uten harmonisert metode.
- Beredskapslager ble ikke tallfestet som faktisk beholdning der kildene bare viser mal, rammeavtale eller klassifisert/ikke apent felt.
- Doffin-sample ble ikke gjort til nasjonal leverandorandel.
- Edinburgh/NMBU-personen ble ikke gjettet; exact identity claim ble parkert.
- Governance-sloyfen ble holdt som forstaelse/analysehypotese, ikke ekstern faktastemme.

