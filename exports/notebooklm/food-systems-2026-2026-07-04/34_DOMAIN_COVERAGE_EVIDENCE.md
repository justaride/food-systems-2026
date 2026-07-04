# Domain Coverage Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: coverage/gap status
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for domain coverage evidence.

## Core Claims Or Working Propositions

- Use the included excerpts as source-grounded context, not as permission to upgrade claims.
- Preserve source labels, method distinctions and explicit gaps.
- If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Included source excerpts | Give NotebookLM retrieval surface. | Excerpted for quality; source file remains canonical. |
| Status label | Controls allowed use. | Do not upgrade without separate verification. |
| Known gaps | Useful for decisions and actor questions. | Missing values must stay visible. |

## Known Caveats

- This packet may combine sources with different evidence levels.
- Do not create external deck claims without checking the strictest status among the supporting sources.

## Deck Angles

- Use as evidence spine for a slide or appendix section.
- Phrase as "what the evidence supports" plus "what remains blocked".

## Bad Generic Framing To Avoid

- Do not remove the source label.
- Do not turn a candidate or shortlist into a completed finding.

## Source Paths Included

- research/_status/mvk-completeness-dashboard.md
- research/_status/domene-dekning-hull-2026-06-27.md
- research/_status/domene-sluttrapport-2026-06-25.md

## Source Excerpts

### research/_status/mvk-completeness-dashboard.md

````markdown
# MVK completeness-dashboard

Regenerert: 2026-07-01 — avledet direkte fra `public/data/coverage/domene-profiles.json` (universtall fra `domene-dekningsbok.csv`; kartlagt-tall fra DB; sist datagrunnlag PR #212). «Mettet celle» = kartlagt ≥ anslått univers.

| Stadium/domene | Kartlagt | Anslatt univers | Dekning | Mettede celler | Maks gap |
|---|---:|---:|---:|---:|---:|
| distribusjon-grossist | 20 | 120 | 17% | 0/3 | 60 |
| finansiering-investering | 0 | 60 | 0% | 0/3 | 20 |
| forbruk | 0 | 30 | 0% | 0/2 | 20 |
| foredling-industri | 0 | 140 | 0% | 0/7 | 20 |
| fou-institusjon | 0 | 44 | 0% | 0/3 | 20 |
| handel-dagligvare | 0 | 40 | 0% | 0/3 | 20 |
| horeca-offentlig | 0 | 60 | 0% | 0/3 | 20 |
| innsatsfaktorer | 76 | 80 | 95% | 3/4 | 8 |
| institusjon-finansiering | 0 | 49 | 0% | 0/5 | 15 |
| interesseorg-paraply | 0 | 60 | 0% | 0/3 | 20 |
| lokale-verdikjeder | 50 | 261 | 19% | 0/6 | 120 |
| matsvinn-sirkulaer | 87 | 120 | 73% | 2/6 | 15 |
| okologi-sertifisering | 0 | 40 | 0% | 0/3 | 20 |
| permakultur-fleraarige | 0 | 77 | 0% | 0/5 | 20 |
| primaerproduksjon | 40 | 350 | 11% | 0/6 | 130 |
| regenerativ-praksis | 9 | 89 | 10% | 0/5 | 21 |
| virkemiddel-policy | 0 | 34 | 0% | 0/3 | 12 |

## Underrepresentert

- regenerativ-praksis / jordhelse-karbon: 0/20, gap 20.
- permakultur-fleraarige / skogshage-agroforestry: 0/20, gap 20.
- permakultur-fleraarige / demonstrasjonssteder: 0/20, gap 20.
- primaerproduksjon / jordbruk-groent: 0/20, gap 20.
- primaerproduksjon / husdyr-beite: 0/20, gap 20.
- primaerproduksjon / ville-ressurser-sanking: 0/20, gap 20.
- primaerproduksjon / urban-dyrking: 0/20, gap 20.
- foredling-industri / meieri: 0/20, gap 20.
- foredling-industri / kjott-egg: 0/20, gap 20.
- foredling-industri / korn-molle-bakeri: 0/20, gap 20.
- foredling-industri / frukt-groent-foredling: 0/20, gap 20.
- foredling-industri / drikke-bryggeri: 0/20, gap 20.

## Denne oktens status

- primaerproduksjon / havbruk-akvakultur: 0 -> 20 kartlagt; 20 nye noder, 3 flagget for etterkontroll.
- primaerproduksjon / villfisk-fiskeri: 0 -> 20 kartlagt; 20 nye noder, 1 flagget for etterkontroll.
- distribusjon-grossist / grossist-distributor: 0 -> 20 kartlagt; 19 nye noder, 1 eksisterende beriket, 3 companyId-lenker, 18 flagget for etterkontroll.
````

### research/_status/domene-dekning-hull-2026-06-27.md

````markdown
# Domene-dekning — hull-rapport 2026-06-27

| Domene | Underdomene | Geo | Univers | Kartlagt | Hull | Konfidens |
|---|---|---|---|---|---|---|
| lokale-verdikjeder | reko | NO | 140 | 20 | 120 | middels |
| lokale-verdikjeder | andelslandbruk | NO | 93 | 20 | 73 | middels |
| regenerativ-praksis | market-gardening | NO | 30 | 9 | 21 | lav |
| regenerativ-praksis | jordhelse-karbon | NO | 20 | 0 | 20 | lav |
| permakultur-fleraarige | skogshage-agroforestry | NO | 20 | 0 | 20 | lav |
| permakultur-fleraarige | demonstrasjonssteder | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | jordbruk-groent | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | husdyr-beite | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | ville-ressurser-sanking | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | urban-dyrking | NO | 20 | 0 | 20 | lav |
| foredling-industri | meieri | NO | 20 | 0 | 20 | lav |
| foredling-industri | kjott-egg | NO | 20 | 0 | 20 | lav |
| foredling-industri | korn-molle-bakeri | NO | 20 | 0 | 20 | lav |
| foredling-industri | frukt-groent-foredling | NO | 20 | 0 | 20 | lav |
| foredling-industri | drikke-bryggeri | NO | 20 | 0 | 20 | lav |
| foredling-industri | sjomat-foredling | NO | 20 | 0 | 20 | lav |
| foredling-industri | naeringsmiddel-ovrig | NO | 20 | 0 | 20 | lav |
| distribusjon-grossist | logistikk-lager | NO | 20 | 0 | 20 | lav |
| distribusjon-grossist | alternativ-distribusjon | NO | 20 | 0 | 20 | lav |
| handel-dagligvare | spesialhandel-delikatesse | NO | 20 | 0 | 20 | lav |
| handel-dagligvare | direktesalg-plattform | NO | 20 | 0 | 20 | lav |
| horeca-offentlig | restaurant-storkjokken | NO | 20 | 0 | 20 | lav |
| horeca-offentlig | offentlig-innkjop-kantine | NO | 20 | 0 | 20 | lav |
| horeca-offentlig | reiseliv-gardsmat | NO | 20 | 0 | 20 | lav |
| forbruk | matfellesskap-innkjopslag | NO | 20 | 0 | 20 | lav |
| okologi-sertifisering | okologisk-produsent | NO | 20 | 0 | 20 | lav |
| fou-institusjon | nettverk-kompetanse | NO | 20 | 0 | 20 | lav |
| interesseorg-paraply | naeringsorganisasjon | NO | 20 | 0 | 20 | lav |
| interesseorg-paraply | faglag-bonde | NO | 20 | 0 | 20 | lav |
| interesseorg-paraply | miljo-forbruker-ngo | NO | 20 | 0 | 20 | lav |
| finansiering-investering | stiftelse-fond | NO | 20 | 0 | 20 | lav |
| finansiering-investering | impact-investor | NO | 20 | 0 | 20 | lav |
| finansiering-investering | kooperativ-eierskap | NO | 20 | 0 | 20 | lav |
| lokale-verdikjeder | bondens-marked | NO | 20 | 4 | 16 | middels |
| regenerativ-praksis | raadgivning-nettverk | NO | 15 | 0 | 15 | lav |
| permakultur-fleraarige | planteskoler-froeleverandoerer | NO | 15 | 0 | 15 | lav |
| institusjon-finansiering | interesseorg-paraply | NO | 15 | 0 | 15 | lav |
| matsvinn-sirkulaer | insekt-alternativ-protein | NO | 20 | 5 | 15 | lav |
| regenerativ-praksis | holistic-management-beiting | NO | 12 | 0 | 12 | lav |
| regenerativ-praksis | biodynamisk | NO | 12 | 0 | 12 | middels |
| permakultur-fleraarige | permakultur-foreninger | NO | 12 | 0 | 12 | middels |
| institusjon-finansiering | virkemiddel-ordning | NO | 12 | 0 | 12 | lav |
| matsvinn-sirkulaer | kompost-jordprodukt | NO | 20 | 8 | 12 | lav |
| fou-institusjon | forskningsinstitutt | NO | 12 | 0 | 12 | lav |
| fou-institusjon | universitet-utdanning | NO | 12 | 0 | 12 | lav |
| virkemiddel-policy | virkemiddelapparat | NO | 12 | 0 | 12 | lav |
| virkemiddel-policy | forvaltning-tilsyn | NO | 12 | 0 | 12 | lav |
| permakultur-fleraarige | froebevaring | NO | 10 | 0 | 10 | middels |
| forbruk | forbrukerorganisasjon | NO | 10 | 0 | 10 | lav |
| matsvinn-sirkulaer | matredistribusjon | NO | 20 | 10 | 10 | lav |
| okologi-sertifisering | kontrollorgan-merkeordning | NO | 10 | 0 | 10 | lav |
| okologi-sertifisering | regenerativ-sertifisering | NO | 10 | 0 | 10 | lav |
| virkemiddel-policy | politisk-program | NO | 10 | 0 | 10 | lav |
| institusjon-finansiering | forskningsinstitutt | NO | 8 | 0 | 8 | middels |
| institusjon-finansiering | universitet-utdanning | NO | 8 | 0 | 8 | middels |
| innsatsfaktorer | froe-genressurser | NO | 20 | 12 | 8 | lav |
| institusjon-finansiering | kontroll-sertifisering | NO | 6 | 0 | 6 | middels |
| lokale-verdikjeder | paraply-nettverk | NO | 8 | 5 | 3 | hoey |
| matsvinn-sirkulaer | biogass-bioraffinering | NO | 20 | 19 | 1 | lav |
| lokale-verdikjeder | gaardsutsalg | NO | 0 | 1 | 0 | lav |
| lokale-verdikjeder | markedshager | NO | 0 | 0 | 0 | lav |
| innsatsfaktorer | for-protein | NO | 20 | 21 | 0 | lav |
| innsatsfaktorer | gjodsel-jordforbedring | NO | 20 | 22 | 0 | lav |
| innsatsfaktorer | biostimulanter-jordliv | NO | 20 | 21 | 0 | lav |
| primaerproduksjon | havbruk-akvakultur | NO | 20 | 20 | 0 | lav |
| primaerproduksjon | villfisk-fiskeri | NO | 20 | 20 | 0 | lav |
| distribusjon-grossist | grossist-distributor | NO | 20 | 20 | 0 | lav |
| handel-dagligvare | dagligvarekjede | NO | 0 | 0 | 0 | hoey |
| matsvinn-sirkulaer | reststrom-sidestrom | NO | 20 | 22 | 0 | lav |
| matsvinn-sirkulaer | emballasje-retur | NO | 20 | 23 | 0 | lav |

Totalt kartlagt (domene-tagga): 282
````

### research/_status/domene-sluttrapport-2026-06-25.md

````markdown
# Domene-kartlegging sluttrapport 2026-06-25

## Stoppstatus

Stopp-aarsak: tids-/tokenbudsjett naer slutt; margin beholdt til rapport, verifikasjon og PR. Hard backstop ble ikke truffet.

- Nye noder importert lokalt: 37 / 250
- Berikede eksisterende noder: 0
- Droppet kildeloese noder: 0
- `machine_verified`: 23
- `unverified`: 14
- Flagget for menneske: 14

## Celleoppsummering

| Celle | Foer | Etter | Nye | Beriket | Status |
|---|---:|---:|---:|---:|---|
| lokale-verdikjeder / reko / NO | 6 / 140 | 20 / 140 | 14 | 0 | Mettet for kjoeringen |
| lokale-verdikjeder / andelslandbruk / NO | 7 / 93 | 20 / 93 | 13 | 0 | Mettet for kjoeringen |
| regenerativ-praksis / market-gardening / NO | 0 / 30 | 10 / 30 | 10 | 0 | Ikke mettet |

## Kilder brukt

- REKO Norge: offisiell kontekst for kart/Facebook-grupper og 130+ ringer.
- Spiselig REKO-liste oppdatert 27.11.2022: konkrete Facebook-lokatorer for 14 REKO-ringer. Alle er importert som `unverified` og flagget for menneske.
- Oekoguiden API categoryId `8467` (Andelslandbruk): 13 registerrader importert som `machine_verified`.
- Oekoguiden API categoryId `9952` (Markedshage): 10 registerrader importert som `machine_verified`.

## Gjenstaaende arbeidsliste

Sortert etter gap i `public/data/coverage/domene-profiles.json` etter denne kjoeringen:

1. `lokale-verdikjeder/reko`: 120 gap, men cellen har naadd kjoeringsgulvet `min(20, estimated_universe)`.
2. `lokale-verdikjeder/andelslandbruk`: 73 gap, men cellen har naadd kjoeringsgulvet.
3. `regenerativ-praksis/market-gardening`: 20 gap, ikke mettet. Neste pass maa hente minst 10 flere rene markedshage-/smaaskala-groentnoder eller dokumentere to torre gather-runder.
4. `regenerativ-praksis/jordhelse-karbon`: 20 gap.
5. `permakultur-fleraarige/skogshage-agroforestry`: 20 gap.
6. `permakultur-fleraarige/demonstrasjonssteder`: 20 gap.
7. `lokale-verdikjeder/bondens-marked`: 16 gap.
8. `regenerativ-praksis/raadgivning-nettverk`: 15 gap.
9. `permakultur-fleraarige/planteskoler-froeleverandoerer`: 15 gap.
10. `institusjon-finansiering/interesseorg-paraply`: 15 gap.
11. Remaining lower-gap cells are visible in `research/_status/domene-dekning-hull-2026-06-25.md`.

## Etterkontroll

- Review-koe: `research/_status/domene-review-koe-2026-06-25.csv`.
- Usikkerhetslogg: `research/_status/domene-usikkerhetslogg-2026-06-25.md`.
- Per-celle mottakslogger:
  - `research/_status/domene-mottakslogg-reko-2026-06-25.md`
  - `research/_status/domene-mottakslogg-andelslandbruk-2026-06-25.md`
  - `research/_status/domene-mottakslogg-market-gardening-2026-06-25.md`

## DB-sikkerhet

- Kjoert mot lokal DB med hostname `localhost`.
- Pre-import backup: `~/foodsystems-domene-backup-20260625-235012.sql`.
- Ingen Prisma-schemaendring og ingen prod-import.
````

