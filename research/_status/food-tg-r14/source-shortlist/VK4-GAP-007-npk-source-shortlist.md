---
tittel: VK4-GAP-007 N/P/K source-shortlist
dato: 2026-07-03
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# VK4-GAP-007 N/P/K source-shortlist

## Formål

Dette er P2.2 follow-up etter Obsidian-briefing-piloten 2026-07-04. Målet er å gjøre VK4-GAP-007 mer claim-lockbar ved å sortere primærkildekøen per strøm og næringsstoff. Notatet åpner ingen ekstern claim og erstatter ikke claim-lock-tabellen.

## Bruksregel

- Hver celle må merkes som `realisert`, `modellert`, `potensial/plan` eller `mangler`.
- N, P og K skal ikke summeres til én prosent eller én KPI.
- Biogassvolum kan bare brukes som aktivitetskontekst, ikke som bevis på næringsretur.
- Svakeste celle styrer gate for hele figuren eller formuleringen.

## Kildekø per strøm

| Prioritet | Strøm | Nåstatus | Primærkildekø | Avklaringsspørsmål | Stopplinje | Neste gate |
|---:|---|---|---|---|---|---|
| 1 | Mineralgjødsel-referanse | Referansegrunnlag for N/P/K, ikke importerstattbar prosent alene. | CL-B-024 / DRO-R4-23 og primær statistikk for mineralgjødsel-N/P/K. | Hvilket år, geografi og enhet skal brukes som denominator? | Ikke kall dette "gjenvinningspotensial". | claim-lock for denominator-tekst |
| 2 | Norsk biorest/digestat | P delvis; samlet realisert N/K-retur mangler. | Landbruksdirektoratet biogasstatistikk 2022, Biogass Norge, anleggs-/bransjerapporter, gjødselvare-/produktdata. | Finnes tonn produkt, N/P/K-innhold og faktisk spredt/solgt mengde i samme systemgrense? | Ikke bruk biogassvolum som næringsretur. | source-shortlist -> PCQ |
| 3 | Oppdrettsslam/fiskeslam | Modellert tap/potensial finnes; nasjonalt realisert aggregat mangler. | NIBIO fiskeslam-notat, Bioretur, HØST/Grønn Vekst/Terramarine/IVAR, Norske utslipp, anleggsrapporter. | Finnes nasjonal serie for samlet innsamlet slam, sluttbruk og N/P/K? | Ikke presenter potensial eller TRL som realisert innsamling. | actor-gate/source-shortlist |
| 4 | Svartvann/avløp/Recolab | Små case-tall for N/P; K ikke produkt. | NSVA/Recolab 2024, SSB kommunalt avløp, NIBIO avløpsslam, VEAS, HIAS. | Er tallene produktmengde, næringsinnhold eller avledet beregning? | Ikke skalere case direkte til Norge. | case-PCQ |
| 5 | Husdyrgjødsel | Stor masse, men plantetilgjengelighet, tap og regionalitet styrer. | NIBIO/Miljødirektoratet gjødsel- og utslippsgrunnlag, jordbruksstatistikk, regionale balanser. | Hvilken andel er faktisk tilgjengelig som substitutt i relevant region og sesong? | Ikke gjør total masse til sirkulær tilgjengelighet. | research mission |
| 6 | Matavfall/forbrenning | Modellnode; K mangler. | SSB avfall, Miljødirektoratet, behandlingsanlegg, forbrennings-/biogassanlegg. | Skill matavfall til biogass, kompost, forbrenning og restfraksjoner. | Ikke bland behandlet volum med N/P/K-retur. | source-shortlist |
| 7 | Svensk digestat/SPCR 120 | Sterk realisert benchmark, ikke norsk nivå. | R12 digestat-notat, SPCR 120 / Avfall Sverige-kilder. | Hvilke metodefelt kan kopieres som måleregime for Norge? | Ikke importer svensk nivå som norsk claim. | benchmark/metode |

## Minimum felt per celle

| Felt | Krav |
|---|---|
| strøm | Mineralgjødsel, norsk biorest/digestat, oppdrettsslam, svartvann/avløp, husdyrgjødsel, matavfall/forbrenning eller benchmark. |
| næringsstoff | N, P eller K. |
| mengde og enhet | Tonn, kg eller konsentrasjon med tydelig omregning. |
| år og geografi | Må være eksplisitt; manglende år/geografi gjør cellen Type C. |
| kildeeier og lokator | Primærkilde foretrekkes; repo-notat kan bare være peker. |
| datastatus | `realisert`, `modellert`, `potensial/plan` eller `mangler`. |
| systemgrense | Produktmengde, innsamlet mengde, behandlet mengde, utslipp/tap eller solgt/spredt mengde. |
| agronomisk caveat | Plantetilgjengelighet, forurensning, regelverk og regional matching der relevant. |
| ikke-si | Konkret stopplinje for cellen. |

## Arbeidsrekkefølge

1. Lås mineralgjødsel-referansen som denominator-språk, uten importerstattbar prosent.
2. Finn om norsk biorest/digestat har primær N/K-retur, eller lås cellene som `mangler`.
3. Avklar om oppdrettsslam har nasjonalt realisert aggregat; hvis ikke, behold aktør-/anleggsrader internt.
4. Behandle Recolab/avløp som case og metode, ikke skaleringsclaim.
5. Før husdyrgjødsel og matavfall som research missions til regionalitet, plantetilgjengelighet og systemgrense er dokumentert.

## Ikke si

- Ikke si at 25-30 % næringsstoffgap er dokumentert norsk realisert gjenvinningspotensial.
- Ikke summer N, P og K til én prosent eller én KPI.
- Ikke bruk biogassvolum som bevis på næringsretur uten dokumentert digestat-/produktretur.
- Ikke skjul `mangler`-celler i figur eller briefing.
