# Mottakslogg: primaerproduksjon / villfisk-fiskeri / NO deepening pass 2

Dato: 2026-07-01

## Kilder og metode

- Prioritet: valgt fra live `domene-dekning-hull-2026-07-01.md` etter REKO-passet fordi `primaerproduksjon / villfisk-fiskeri` var største gjenværende gap (40/150, gap 110).
- Kilde: Brreg Enhetsregisteret API, listeoppslag `naeringskode=03.110` (Hav- og kystfiske) og detaljlokator per org.nr.
- Dedupe: filtrert mot eksisterende DB-aktører med `subdomene:villfisk-fiskeri`, eksisterende slugs og eksisterende navn.
- Filter: tillatte organisasjonsformer `AS`, `ASA`, `SA`, `ANS`, `DA`; inaktive/konkurs/avvikling/tvangsavvikling ble droppet; operativt fiskeri-/fangst-/sjømatsignal måtte finnes i navn, aktivitet eller vedtektsfestet formål utover selve NACE-beskrivelsen.
- Dropp før import: 290 Brreg-rader inspisert; 40 allerede kartlagt, 186 feil organisasjonsform, 5 inaktive, 18 uten operativt signal utover NACE, 1 ren holding-/investeringsrad.

## Import

- Kandidatfil: `research/_status/mvk-villfisk-fiskeri-deepening-2-2026-07-01-node-kandidater.csv`
- Dataset: `mvk-villfisk-fiskeri-deepening-2-2026-07-01`
- Kandidater: 20 Brreg-registerrader.
- VerificationStatus: 20 `machine_verified`.
- SourceClass: 20 `registry_snapshot`.
- Flagget for menneske: 20.

## Avgrensing

- Brreg bekrefter juridisk enhet, org.nr., NACE og registertekst per hentetidspunktet.
- Importen dokumenterer ikke fartøy, kvote, landinger, artssammensetning, fangstområde, volum eller aktiv fiskeriaktivitet i inneværende år.
- Flere rader har blandet aktivitet eller mulig investerings-/eiendoms-/tjenesteelement og skal ikke brukes som hard claim-lock før fartøy-/kvote-/driftsreview.

## Neste kontroll

Alle 20 nye noder må kontrolleres mot fartøyregister, kvoteregister/landingsdata eller annen primærkilde før de brukes som sikre aktive fiskeriaktører i eksterne claims.
