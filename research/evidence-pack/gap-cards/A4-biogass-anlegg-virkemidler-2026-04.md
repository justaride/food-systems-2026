# A4 - Biogass: anlegg, potensial og virkemidler

Status: staged analysis card, produksjonsankre og primær-locators delvis låst
Gap-ID: A4
Lane: hurtig-plukk
Dato: 2026-04-29

## Hva kan brukes nå

- NORSUS/biogassmiljøet gir et brukbart første tallanker for Norge: produksjon rundt 0,8 TWh i 2024, teknisk potensial rundt 5,5 TWh med dagens teknologi og råstoffbase, og opptil 22 TWh med videre teknologiutvikling og mer tilgjengelig råstoff.
- Norwaste/Biogasstatistikk 2024 gir norsk produksjonsanker: 828 GWh i 2024 og 66 biogassanlegg. Brukes som bransjestatistikk med kildeforbehold.
- Energinet gir dansk gassystem-anker: knapt 8,1 TWh realisert biogassproduksjon i siste gasår, 59 tilkoblede biogassanlegg og litt over 38 prosent biogasandel av gasforbruket. Brukes som dansk gassystemproduksjon, ikke full kalenderårstotal for alle anvendelser.
- Energigas Sverige gir svensk 2024-anker: 2 395 GWh produksjon, 330 anlegg og 92 prosent av 3,7 mill. tonn røtrest brukt som gjødsel.
- Statistics Finland gir finsk 2024-anker: 3 359 TJ biogassproduksjon. Behold originalenhet i kildetabell og konverter bare i avledet sammenligningspanel.
- Avledet sammenligningspanel er opprettet: `research/data/nordic/biogas/biogas-production-comparison-panel-2026-05-15.csv`. Panelet konverterer til TWh, men markerer DK som `scope_mismatch` fordi Energinet-raden gjelder gassystem/gasår.
- NORSUS beskriver biogass som et sirkulært tiltak fordi det kobler avfallshåndtering, fornybar energi og næringsstoffgjenvinning via biorest.
- Klimanytten må holdes scenariobasert. NORSUS-siden viser til anslag på ca. 200 000 tonn CO2e spart per 1 TWh når biogass fortrenger naturgass, og ca. 250 000 tonn CO2e når den erstatter diesel.

## Kilder

- NORSUS: biogass-temaside, inkludert politikk- og utslippsanslag: https://norsus.no/biogass/
- NORSUS: nyhet om 2025 biogasskonferanse, 0,8 TWh produksjon og 5,5/22 TWh potensial: https://norsus.no/begivenhetsrik-uke-for-biogass-task-37-i-norge-biogasskonferansen-2025-og-anleggsbesok-pa-veas/
- NORSUS rapportgrunnlag: Mulighetsrommet for produksjon av biogass i Norge: https://norsus.no/wp-content/uploads/OR-06.23-Mulighetsrommet-for-produksjon-av-biogass-i-Norge-1.pdf
- Norwaste/Biogasstatistikk 2024: https://norwaste.no/en/biogasstatistikk-2024/
- Energinet: Redegørelse for gasforsyningssikkerhed 2024: https://energinet.dk/media/r2rfwdto/redegorelse-for-gasforsyningssikkerhed-2024.pdf
- Energigas Sverige: Produktion av biogas och rötrester och dess användning år 2024: https://energigas.se/Media/mvwmqi3h/biogasstatistik-rapport_2024.pdf
- Statistics Finland: Production of electricity and heat 2024 / biogas: https://stat.fi/en/publication/cm1kpvyg5cwuk07vwljv0s760

## Må fortsatt tettes

- Anlegg-for-anlegg-tabell for Norge: navn, eier, råstoff, kapasitet, faktisk produksjon, biorest-disponering og år.
- Rapportklar beslutning om DK gassystem-raden er akseptabel som kontrast til NO/SE/FI eller om en separat total nasjonal DK-serie må hentes.
- Virkemiddelhistorikk: Enova/Innovasjon Norge, avfallsregelverk, gjødsel/biorest, transportdrivstoff og eventuelle nye 2025-2026 politiske vedtak.

## Akseptansegate

Kortet kan oppgraderes til integrerbart når en reviewer har akseptert scope-regelen: DK gassystemproduksjon kan brukes som kontrast bare med eksplisitt note, mens teknisk potensial og politiske scenarioer holdes utenfor produksjonspanelet.
