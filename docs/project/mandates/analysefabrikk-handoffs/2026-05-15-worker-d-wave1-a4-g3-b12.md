# Worker handoff — Bølge 1 acceptance gate (A4, G3, B12)

Dato: 2026-05-15  
Dispatch: DQ-004  
Worker: Codex worker D (Claude)  
Output type: analyse av gap cards og lås av akseptansegate

## Status etter viderefoering 2026-05-15

Dette handoffet var akseptansegate foer videre arbeid. Gjeldende status etter viderefoering:

- B12: gapkort patchet, Eurostat PLI valgt som hovedserie, SSB 14682 brukt som kontrollpunkt, `promotion_status=promoted_analysis`, `ki_usage_rule=warn_user`.
- A4: primære produksjonsankre og derived comparison panel er opprettet for NO/DK/SE/FI; status er `staged_analysis`, ikke KI-promotert.
- G3: NIBIO Engrosforbruk `Nøkkeltall` celler `AB5=41.3` og `AB6=34.9` er laast; seafood-adjusted scenarioformel er laast som energi-/kaloribasert 0/25/50 prosent retensjon av sjømateksport. Et foreloepig top-species eksportenergi-input og en engros-denominator-kandidat er opprettet, men G3 er fortsatt `exclude` og skal ikke brukes som endelig selvforsyningsresultat.
- Videre arbeid boer starte med G3 full produktmiks/yield eller A4 reviewer-aksept av DK gas-system scope.

## Scope

- Tildelt batch: A4 biogass, G3 selvforsyning sjømatjustert, B12 PPP/prisnivå
- Filer lest:
  - research/evidence-pack/gap-cards/A4-biogass-anlegg-virkemidler-2026-04.md
  - research/evidence-pack/gap-cards/G3-selvforsyning-sjomatjustert-2026-04.md
  - research/evidence-pack/gap-cards/B12-ppp-prisnivaa-norden-2026-04.md
  - research/_plans/gap-master-routing-2026-04-29.csv (radene for A4, G3, B12)
- Arbeidstype: definere akseptansegate per gap. Lukker ikke gap selv.

## Kort konklusjon

1. A4 og G3 er metode-primært gap. B12 er kildevalg-primært gap.
2. Alle tre kan lukkes innen samme uke hvis kilder bekreftes og én tabell/formel velges.
3. B12 har høyest definisjonsrisiko (PPP vs PLI vs CPI). G3 har høyest scope-risiko (hvilke fôrimport telles, hvilken bakerske brukes). A4 har lavest definisjonsrisiko, men flest enkeltdatapunkter å samle.
4. ACT-002 og ACT-011 (B12) viser i activation queue at andre workers allerede har laget metodenotat og 50-rads Eurostat PLI annual panel. Dette må lenkes til B12 gap-card og evidence-pack.
5. ACT-009 (A4) er loeftet til `staged_analysis`; ACT-010 (G3) er `denominator_candidate_created` og krever full produktmiks + yield før resultatpromotering.

## Akseptansegate per gap

### A4 — Biogass: anlegg, potensial og virkemidler

`Done means…` Gapet anses lukket når evidence card har minst tre konkrete artefakter levert:

| Artefakt | Krav | Status |
|---|---|---|
| Anleggsregister Norge | Tabell med navn, eier, substrat, kapasitet, faktisk produksjon 2023-2024, biorest-disponering, drift-igangsatt-år | mangler |
| Produksjon og målflate for DK og SE | Per-land tabell med faktisk produksjon, teknisk potensial og politiske mål — minst én primær- eller bransjekilde per land | mangler |
| Virkemiddelhistorikk 2020-2026 | Enova, Innovation Norge, avfall/fôrregelverk, transportincentiver med absolutte datoer | mangler |
| Klimakort/metodenote | Scenarier for naturgass vs diesel-substitusjon; biorest-bruk per anlegg | mangler |

Akseptansegate i én setning: Kortet løftes fra `initial-card` til `staged_analysis` når minst én primær- eller bransjekilde per land foreligger og en tabell skiller faktisk produksjon, teknisk potensial og politiske mål.

Metoderisiko å varsle eksplisitt:
- Klimagevinst varierer kraftig med hvilken gass som faktisk fortrenges
- Biorest-bruk (kompost/jordforbedring/energi) er ikke uniform
- Ikke bland kommunalt avfall og husdyrgjødsel uten substrat-kolonne

### G3 — Selvforsyning sjømatjustert

`Done means…` Gapet anses lukket når evidence card har:

| Artefakt | Krav | Status |
|---|---|---|
| Valgt primærindikator | Én låst formel (energi vs vekt, fôrkorrigert vs ikke) | levert som energi/kcal-scenario |
| Sjømateksport-scenario | CSV med minst to scenarioer (f.eks. behold 50 pct sjømateksport, fortrenge X kalorier innenlands) | proxy_input_levert; resultat mangler full produktmiks/yield |
| Metodenote | Forklaring av forskjellen mellom 34.9 pct, 41.3 pct, 47 pct og nær 100 pct med fisk | levert |
| NIBIO Engrosforbruk | Last ned tidsserie 1999-2024 lokalt | delvis via locked `Nøkkeltall` celler AB5/AB6 |
| Evidence-cards | NIBIO 2024-metodikk; NIBIO fôrimportkorreksjon; Helsedirektoratet konsumbaseline | delvis |
| Eksportenergi-input | Produkt-/artsfordelt energiinput for norsk sjømateksport | foreloepig top-species proxy; `exclude` |
| Innenlands denominator | Matenergi-/konsumgrunnlag for prosentberegning | denominator-kandidat levert; engros matforsyning ikke faktisk inntak |

Akseptansegate i én setning: Kortet løftes når én valgt primærindikator, ett sjømateksport-scenario, full/akseptert eksportenergi-input, denominator og en metodenote som forklarer hvorfor de fire selvforsyningstallene ikke er samme måltall, alle er levert.

Metoderisiko å varsle eksplisitt:
- Blande fôrkorrigert og ufôrkorrigert tall
- Behandle sjømateksport som matsikkerhetsrisiko når majoriteten er premium-/eksportdrevet
- Scope creep i hvilke fôrimporter som telles

### B12 — PPP og prisnivå Norden

`Done means…` Gapet anses lukket når evidence card har:

| Artefakt | Krav | Status |
|---|---|---|
| Låst prisnivåserie | Én valgt CSV: enten 2024-snapshot (SSB tabell 14682) eller normalisert 2015-2024 (Eurostat PLI) | delvis (panel finnes) |
| Kontroll-avstemming | SSB vs Eurostat sammenligning med metodenote om hvorfor de avviker | delvis (method note finnes) |
| Metodenote | PPP vs CPI/HICP-skille eksplisitt | levert (ACT-002) |
| Patch til gap-card | Lenke til panel og method-note i evidence-pack | mangler |

Status: ACT-011 viser at en 50-rads Eurostat PLI annual panel allerede er opprettet (`research/data/nordic/prices/ppp-price-panel-2026-05-15.csv`). ACT-002 viser at metodenote er laget (`research/_plans/nordic-price-level-method-note-2026-05-15.md`). Det som mangler er patch til B12-evidence-card slik at det kan løftes til `promoted_analysis`.

Akseptansegate i én setning: Kortet løftes når én av prisnivåseriene er valgt som hovedserie, SSB 2024 er inkludert som kontrollpunkt, og evidence-cardet patches med peker til panel + method-note.

Metoderisiko å varsle eksplisitt:
- PPP måler relativt nivå på tvers, CPI/HICP måler inflasjon over tid — kan ikke blandes
- Lokale 660 prisrader er transaksjonsdata, ikke PPP-indekser
- 2024 SSB tabell bruker annen mat/drikke-kategori-label enn 2015-2024 historisk serie

## Valideringsspørsmål til QA

1. A4: Hva er minste akseptable kildegrad for anleggsregister — bransjekilde alene eller krever vi offentlig statistikk?
2. G3: Skal fôrkorreksjonen inkludere fôr til oppdrettsfisk? NIBIO sin operasjonelle definisjon må låses før scenario kan bygges.
3. B12: Skal SSB 2024-snapshot eller normalisert 2015-2024 Eurostat-serie være primær? Begge har metodebegrensninger.

## Anbefalt promoteringsstatus

| Gap | Anbefalt status etter dette handoffet |
|---|---|
| A4 | `staged_analysis`; ikke KI-promotert før reviewer har akseptert scope og eventuelle anleggs-/virkemiddelutvidelser |
| G3 | forbli `exclude`/ikke resultatpromotert til full produktmiks/yield er levert; ACT-010 er `denominator_candidate_created` |
| B12 | `panel_created` → `staged_analysis` så snart gap-card patches med pekere til ACT-002 og ACT-011 outputs |

## Neste handling

For Wave 1-eier (Codex wave1 worker):

1. B12 vedlikehold: behold `warn_user` til full Eurostat-response/checksum og QA-avstemming er låst.
2. G3 neste: erstatt foreloepig top-species proxy med full produktmiks eller dokumentert dekningsregel, og lås spiselig yield/energifaktor før prosentresultat beregnes.
3. A4 sist i Wave 1: data-tung men metoderiskoen er lavere.

For QA (DQ-010):

1. Spot-sjekk at ingen av artefaktene fra Wave 1 blir promotert til `promoted_analysis` uten de fire akseptansegate-radene levert.
2. Verifiser at PPP- og CPI-merking i UI/rapport følger metodenote-skillet.
3. Påse at G3-sjømatjustert ikke fremstilles som "ekte" selvforsyning uten metodeforbehold.
