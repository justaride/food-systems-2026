# Kontroll av rettelse i kornanalysen

9. september 2026. Datert tillegg til [første kontroll](ANALYSE-KONTROLL.md), som er bevart uendret. Ingen nye kilder eller endringer i analysescriptet fra reviewer.

**P2-funnet er rettet for den kontrollerte koden.** Hvert mål i en kontrast har nå `comparison_eligibility`. Numeriske råverdier bevares, mens baseline og prosentkontrast holdes tilbake når nødvendige baseline-/hendelsesverdier mangler eller har statusflagg. Beregnet P/A avhenger av både produksjons- og arealflagg. Sammenligning mot 2017 holdes tilbake når enten 2017 eller sammenligningsåret er flagget.

## Faktisk kontroll

- Alle 14 tester passerer. Nye `analyze`-tester dekker panel/baseline og norsk kode, bruddflagg, manglende baseline og ukjent fuktbasis. Den tidligere P3-merknaden om helt manglende analysegrentester er dermed håndtert.
- Alle **96 prosentfelt** i de 24 faktiske kontrastene er eksakt uendret fra `analysis-run-001` til `analysis-run-002`. Alle andre tidligere kontrastfelt er også uendret. Tillegget er kvalifiseringsstatusen.
- De 48 grunnpostene, ni warnings og tolv bevarte manglende opprinnelige norske C1100-celler er uendret. Alle faktiske kontrastmål har status `eligible_unflagged_complete`.
- Ny `analyze`-kjøring i minne på de frosne kildeobjektene er identisk med `analysis-run-002/analysis.json` bortsett fra CLI-ens kildebindingsfelt.
- Fire ekstra adversarielle tilfeller ble kontrollert i minnekopier: produksjonsflagg i 2015, 2017 og 2018 samt arealflagg i 2016. Produksjonsflagg holder produksjons- og P/A-kontraster tilbake; arealflagg holder areal og P/A tilbake, men lar uflagget produksjonskontrast bestå. 2017-/2018-flagg holder også sammenligning mot 2017 tilbake; et rent 2015-flagg gjør ikke det.

Påstanden fra første kontroll står derfor uendret: Alle åtte valgte produksjonsserier hadde lavere 2018-produksjon enn eget gjennomsnitt 2015–2017, med C1110 for norsk hvete, C1100 for svensk/dansk/finsk hvete og C1300 for bygg. Dette sier fortsatt ikke noe om årsaksandel, felles framtidig sannsynlighet, mathvetekvalitet eller disponibel nordisk bistand.

## Avgrensning

Den valgte flaggregelen er konservativ: ethvert ikke-tomt statusflagg på nødvendige input holder kontrasten tilbake. Det er akseptabelt for dette begrensede scriptet. Den skiller foreløpig ikke mellom eksempelvis estimater og tidsseriebrudd. Mer tillatende framtidig bruk trenger en eksplisitt flaggpolicy. Dette er ikke et nytt hinder for de faktiske uflaggede seriene.

Avvik mellom rapportert avling og beregnet P/A består som dokumenterte warnings; rettelsen forsøker ikke å forklare eller skjule dem. Første kontrolls øvrige metodeforbehold består. Ingen åpne P0/P1/P2-funn fra denne rettelseskontrollen.

## Kontrollerte versjoner

| Artefakt | SHA-256 |
|---|---|
| scripts/analyze-beredskap-cereals.py | `b3e54da553555918cdfbcdd63e4c9f6b924fe951f6f9df9c3c0dc83f0a0c3236` |
| scripts/test-analyze-beredskap-cereals.py | `c3f54380c8f3d809bdee07971a27c37260715ffa652bb1c9ad042903051c61dc` |
| privat analysis-run-002/analysis.json | `bddcc4c08cbd443af488d31a29c34c02027f7a7a9a99bed829c3f859930250d8` |

Privat resultat ligger under `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a084fe-a36c-7fb1-86c2-4387109e3c36/round-004/analysis-run-002/analysis.json`. Kontrollen gjelder eksakt disse versjonene. Dette er separat lokal agentkontroll, ikke menneskelig review, uavhengig modellattestasjon, CI eller publisering.
