# Food TG R13 Batch 04 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 04.
**Batch:** `R13-WASTE-006`, `R13-WASTE-008`, `R13-PROT-006`, `R13-PROT-007`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-WASTE-006`, `R13-WASTE-008`, `R13-PROT-006`, `R13-PROT-007` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-WASTE-006 | Kaffegrut er avledet massestrøm, ikke målt norsk avfallsfraksjon. | SSB 08801, Miljødirektoratet, Sortere/BIR, NKI | Import, konsum og grut er ulike størrelser; faktisk bruk ikke lukket. | A import/rules; B/C grut | Type A import; Type B/C mass/use | source-shortlist | importer |
| R13-WASTE-008 | Prevention-tiltak krever baseline og målemetode før effektpåstand. | Matvett, JRC, Nordic Council, Matsvinnutvalget | Mål, potensial, anbefaling og målt effekt blandes lett. | A/B methods/programmes; C effects | Type A method; Type B programme; Type C effect | source-shortlist | importer |
| R13-PROT-006 | Kraftfôrproteinråvarer i 2025 var ca. 95 % importert; dette er mix, ikke soya-substitusjon. | Landbruksdirektoratet, Felleskjøpet, Denofa, Skretting | Råvareforbruk er ikke substitusjon; sertifisering er ikke full risikobevis. | A feed stats; B/C substitution/SPC | Type A mix; Type B/C substitution | PCQ | importer |
| R13-PROT-007 | NIBIOs 35 % fôrkorrigert selvforsyning er energibasert, ikke proteinselvforsyning. | NIBIO, Landbruksdirektoratet, Helsedirektoratet | Full proteinmodell krever proteinfaktorer og mat/fôr-scope. | A inputs; C full protein calc | Type A inputs; Type C model | PCQ | importer |

## Per-target outcome

### R13-WASTE-006 - ENRICH

Output: `research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md`

Verified source anchors:

- SSB 08801 download hub: `https://www.ssb.no/en/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- Miljødirektoratet utsorteringskrav: `https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-myndigheter/utsortering-og-materialgjenvinning-av-avfall/avfallstyper-og-krav-til-utsortering/`
- Sortere matavfall: `https://sortere.no/avfallstype/matavfall/75`

Outcome: Source-shortlist. R12-hullet lukkes som metode- og datagapnotat; ikke som eksakt kaffegrutvolum.

### R13-WASTE-008 - ENRICH

Output: `research/external/r13/R13-WASTE-008-prevention-baseline.md`

Verified source anchors:

- Matvett KuttMatsvinn Servering: `https://www.matvett.no/bransje/matvett-in-english/kuttmatsvinn-servering-for-the-food-service-industry`
- JRC `Building evidence on food waste prevention interventions`: `https://publications.jrc.ec.europa.eu/repository/handle/JRC137760`
- Nordic Council `Breaking Barriers`: `https://pub.norden.org/nord2024-034/appendix-1-20.html`

Outcome: Source-shortlist. Tiltakskatalog kan brukes, men hver effekt må PCQ-es mot baseline og metode.

### R13-PROT-006 - ENRICH

Output: `research/external/r13/R13-PROT-006-soya-erstatning-for.md`

Verified source anchors:

- Landbruksdirektoratet kraftfôrstatistikk: `https://www.landbruksdirektoratet.no/nb/statistikk-og-utviklingstrekk/utvikling-i-jordbruket/kraftforstatistikk`
- Felleskjøpet norske råvarer: `https://fka.felleskjopet.no/barekraft/vi-skal-oeke-andelen-norske-raavarer/`
- Denofa åpenhetslovrapport: `https://report.etiskhandel.no/var/pdf/2025/denofa-as-2515-1774876995.pdf?t=1779845789`
- Skretting soya i fiskefôr: `https://www.skretting.com/no/aapenhet-og-tillit/ofte-stilte-spoersmaal/hvorfor-brukes-soya-i-fiskefor/`

Outcome: PCQ. Kraftfôrmiks er lukket bedre; soya/SPC-substitusjon og sertifiseringspåstand må holdes som egne metodefelt.

### R13-PROT-007 - ENRICH

Output: `research/external/r13/R13-PROT-007-proteinselvforsyning.md`

Verified source anchors:

- NIBIO selvforsyningsgrad og engrosforbruk: `https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk`
- NIBIO metodeforskjeller: `https://www.nibio.no/nyheter/2026/ulike-beregningsmetoder-kan-gi-store-forskjeller-i-selvforsyningsgrad`
- Landbruksdirektoratet kraftfôrstatistikk: `https://www.landbruksdirektoratet.no/nb/statistikk-og-utviklingstrekk/utvikling-i-jordbruket/kraftforstatistikk`

Outcome: PCQ. Offisielle inputdata er gode, men full proteinselvforsyning er fortsatt metode-/modellgap.

## Stop-regler som ble brukt

- Avledet kaffegrut-estimat ble ikke gjort til målt norsk avfallsfraksjon.
- Prevention-potensial ble ikke gjort til målt effekt uten baseline.
- Kraftfôrråvare-mix ble ikke gjort til soya-substitusjon uten tidsserie.
- NIBIOs energibaserte selvforsyningsgrad ble ikke omtalt som proteinselvforsyning.

## Må ikke visualiseres ennå

- `R13-WASTE-006`: ingen kaffegrutvolumfigur uten avledet/metodeetikett og våt/tørr-vekt.
- `R13-WASTE-008`: ingen tiltak/effektfigur uten baseline, måleperiode og scope.
- `R13-PROT-006`: ingen soya-erstatningsfigur uten tidsserie og skille landfôr/fiskefôr.
- `R13-PROT-007`: ingen proteinselvforsyningsfigur før proteinfaktorer og mat/fôr-scope er definert.
