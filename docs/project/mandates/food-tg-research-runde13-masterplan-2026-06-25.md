---
tittel: Food TG — Research OS / Runde 13 masterplan
status: Intern arbeidsplan — åpner ingen claims
eier: Gabriel
dato: 2026-06-25
scope: Videreføre R12-kartleggingen i dybden på aktørkartlegging, food waste, proteinalternativer, innovasjon og økologi — hele landskapet — med Norge-først og nordisk kontekst.
bruksregel: Ingen output fra denne planen blir ekstern faktastemme uten mottak, source-shortlist, PCQ, claim-lock og overclaim-vurdering. Bruker samme mottaksprotokoll som R12.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md
  - research/_status/food-tg-research-backlog-2026-06-25.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
  - docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md
  - research/_status/food-tg-r12/r12-intake-index-2026-06-24.md
---

# Food TG — Research OS / Runde 13 masterplan

## 1. Hvorfor denne runden finnes

R12 etablerte Research OS-et og kjørte 46 av 50 prompts til mottaksindeks. R13 viderefører det samme maskineriet, men flytter tyngdepunktet fra bred ledd-profil til **dybdekartlegging av fem felt vi allerede har sett på**: aktørkartlegging, food waste, proteinalternativer, innovasjon og økologi — og hvordan de henger sammen til ett landskap.

Runden gjør to ting i rekkefølge:

1. **Lukker R12-hull først.** De fire ufullførte promptene (batch-07: RES-003, RES-004, RES-005, FEED-003), de syv parkerte tallclaimene og type-C-hullene tas før ny bredde.
2. **Går så i dybden** i de fem domenene, fra Norge-først med nordisk kontekst der den gir mening.

R13 erstatter ikke R12. Den bruker samme prinsipper, samme A/B/C-disiplin, samme gates og samme mottaksprotokoll.

## 2. Prinsipper

Uendret fra R12. Riktig arbeidsenhet er én smal prompt om gangen.

1. Primærkilde først, sekundærkilde bare med merking `B`.
2. Tomme celler og dokumenterte fravær er gyldige funn.
3. Realisert volum, kapasitet, plan, potensial og hypotese holdes adskilt.
4. Ingen rå prompt-output blir whitepapertekst direkte.
5. Hver output ender i en gate: source-shortlist, PCQ, claim-lock, actor-gate, forstaelse, internal eller parkering.
6. Ingen temaer holdes igjen fordi JT-dataunderlag ikke foreligger.

## 3. Temaunivers

R13 er organisert i syv arbeidsområder:

| Tema | Slug | Formål |
|---|---|---|
| Lukke R12-hull | `gap-closure` | Fullføre batch-07, verifisere/nedgradere de 7 parkerte claimene og eskalere type-C-hull. |
| Aktørkartlegging | `actor-map` | Løfte markedshager, andelslandbruk, REKO, regenerative praktikere, frønettverk og eierskap fra kandidat til verifisert. |
| Food waste | `food-waste` | Massebalanse for marint restråstoff, slam, digestat, industri-sidestrømmer, redistribusjon og prevention med baseline. |
| Proteinalternativer | `protein-alt` | Skille realisert/kapasitet/pilot for insekt, single-cell, musling/tang, plantebasert, presisjonsfermentering og soya-erstatning. |
| Innovasjon | `innovation` | CEA, agritech-økosystem, finansiering, failure/survival-ledger, FoU-aktører og offentlig innovasjonsetterspørsel. |
| Økologi | `ecology` | Økologisk areal, agroøkologisk metrikk, jordhelse/karbon, biodiversitet, sertifisering og policy-mål. |
| Hele landskapet | `landscape` | Makt-/eierkonsentrasjon, vertikal integrasjon, helsystem-kart, datagap-atlas, bevegelseskart og figurkandidater. |

## 4. Prioriteringslogikk

Uendret skala fra R12:

- `P0`: kjent overclaim/freshness-risiko, besluttet blindsone eller claim-lock-kandidat. (R13: GAP-001, GAP-005, WASTE-001.)
- `P1`: viktig whitepaper/deck-underlag eller høyverdi type-C-funn.
- `P2`: bredde, atlas eller senere modellberikelse.

P0 betyr at usikkerheten må håndteres først, ikke at funnet er viktigst politisk.

## 5. Rundeformat

Samme batch-modell som R12:

1. Velg 3-7 prompts fra backloggen.
2. Kjør én prompt av gangen.
3. Lagre rå output i `next_artifact` (default `research/external/r13/`).
4. Skriv mottaksrad med kildeklasse, hulltype, gate og importbeslutning i en R13 intake-indeks.
5. Løft bare modne funn til source-shortlist, PCQ eller claim-lock.
6. Parker funn som ikke tåler neste gate ennå.

## 6. Output-typer

Uendret: `datasok`, `forstaelse`, `kartlegging`, `datagap`, `visualiseringsunderlag`.

## 7. Tema-for-tema arbeidskart

| Tema | Første spørsmål | Typisk output | Første gate |
|---|---|---|---|
| Lukke R12-hull | Hvilke R12-hull kan lukkes med desk-research, og hvilke må bli actor-gate? | gap-/verifiseringsledger | PCQ / forstaelse |
| Aktørkartlegging | Hvilke aktører har primærlocator, og hvilke er fortsatt kandidatstubber? | verifisert actor CSV | actor-gate |
| Food waste | Hva er faktisk innsamlet/omfordelt, og hva er bare modellert? | massebalanse-/R-stige-tabell | PCQ |
| Proteinalternativer | Hva er realisert volum vs kapasitet vs pilot? | technology readiness-ledger | source-shortlist |
| Innovasjon | Hvilke aktører lever, hvilke har feilet, og hva er kapital vs resultat? | økosystem-/failure-ledger | source-shortlist |
| Økologi | Hva måles av jordhelse/karbon/biodiversitet, og hvor er datagap? | metrikk-/areal-profil | PCQ / forstaelse |
| Hele landskapet | Hvordan henger feltene sammen som struktur uten intensjonspåstander? | system-/datagap-kart | forstaelse / internal |

## 8. Første kjørerekkefølge

1. `gap-closure` P0/P1: batch-07-fullføring (GAP-001 til GAP-004), parkert-verifisering (GAP-005), type-C-eskalering (GAP-006).
2. `food-waste` P0/P1: marint restråstoff, slam, redistribusjon, husholdning, digestat.
3. `protein-alt` P1: soya-erstatning, proteinselvforsyning, insekt, single-cell, plantebasert.
4. `actor-map` P1: markedshager, andelslandbruk, REKO, regenerative praktikere, eierskap.
5. `innovation` + `ecology` P1: CEA, agritech-økosystem, FoU; økologisk areal, jordhelse, policy-mål.
6. `landscape` P1: makt-/eierkonsentrasjon, helsystem-kart, datagap-atlas, figurkandidater.

Rekkefølgen revideres når P0-risikoer er lukket, eller når nye type-C-hull viser at en gren må bli actor-gate i stedet for desk research.

## 9. Stop-regler

Uendret fra R12. Stopp eller parker output når:

- sterkeste kilde bare er sekundær og funnet er claim-nært
- data blander volum, kapasitet og potensial uten å kunne skilles
- output gjør aktørintensjon av en strukturindikator
- funnet krever lukket aktørdata eller beslutningstilgang
- en figur ville skjule tomme celler
- prompten åpner et nytt claim før source-shortlist eller PCQ

## 10. Ferdigkriterier

Runde 13 er ferdig nok til første bruk når:

- alle 50 prompts finnes i promptpack og backlogg med samme ID-rekkefølge
- alle syv temaer har sine prompts med prioritet, output-type, gate, caveat og lagringsmål
- de fire R12 batch-07-hullene og de syv parkerte claimene har egne R13-rader
- mottaksprotokollen (delt med R12) kan klassifisere A/B/C kildeklasse og Type A/B/C hull
- ingen output fra prosessen kan bli whitepaper- eller deck-stemme uten mottak og gate
