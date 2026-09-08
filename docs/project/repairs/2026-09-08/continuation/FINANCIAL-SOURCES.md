# Regnskapsavstemming 8. september 2026

Dette er kildekontrollerte rettingskandidater og avvik i visningen. Ingen beløp, reviewvedtak eller kanoniske kilder er skrevet om. Produksjonsradene ble lest i en skrivebeskyttet transaksjon etter PR #401 ble flettet.

## Austevoll 2023–2024

[Årsrapport 2024](https://www.auss.no/media/1627/auss-annual-report-2024-250430.pdf), fysisk/trykt side 103, konsernregnskap, MNOK:

| År | Omsetning | Driftsresultat EBIT | Årsresultat |
|---|---:|---:|---:|
| 2024 | 35 366 | 5665 | 4890 |
| 2023, sammenligningstall | 33 731 | 3438 | 344 |

2024 har dessuten andre gevinster/tap på 1280 MNOK. Dette er en egen linje, ikke omsetningslinjen. Note 28, side 165, skiller EBIT fra alternative resultatmål: 5328 før verdiendring i biomasse og 4954 før resultat fra tilknyttede selskaper. Disse målene kan ikke byttes om.

De gamle radene har 28 900 MNOK i 2023 og blandede skalaer i 2024 (30 600 og 4,2 milliarder lagret i samme rad). Visningen utelater disse kjente beløpene og marginene med en forklaring. Avgrensningen krever samsvar med organisasjonsnummer, år, kildebeskrivelse og de gamle verdiene. Den sperrer ikke automatisk en fremtidig korrigert rad. Side 103 er både tekstlest og visuelt kontrollert.

## Axfood 2025

[Årsrapport 2025](https://www.axfood.se/globalassets/startsida/investerare/rapporter-och-presentationer/arkiv/2025/axfood-ars--och-hallbarhetsredovisning-2025.pdf), fysisk/trykt side 122: konsernomsetning 89 152 MSEK og ordinært driftsresultat 3572 MSEK. Note 3 på side 131 viser justert resultat 3688 MSEK og særposter -116 MSEK. Den lagrede teksten kaller 3572 «adjusted operating profit»; den kvalifikatoren er feil. Beløpet svarer til ordinært resultat. Valutakonverteringen må fortsatt avstemmes separat fra resultatdefinisjonen.

Sammenligningsåret 2024 på side 122 viser 84 057 MSEK og 3290 MSEK. Den eldre lagrede 2024-raden har avrundet omsetning og margin 4,50 %; margin og historisk FX-grunnlag gjenstår. Ingen av Axfoods kildebeskrivelser eller beløp er oppgradert til kanonisk verifisert status her.

## Øvrige åpne regnskap

Nofimas tidligere dokumenterte 2023-avvik er fortsatt holdt tilbake. Holdbarts åpne API ga 2025-regnskap; det dokumenterer ikke de eldre radene. Disse kontrollene fra forrige pakke finnes i `../followup/SOURCE-WORK.md`. De er ikke nye historiske primærkilder i denne pakken.

## Kontroll og neste steg

Åtte målrettede tester kontrollerer skala, én valutakonvertering, tilbakeholding av avvik og at korrigerte/andre rader ikke sperres. Typekontroll og lint kjøres før publisering. Ingen ny databasemigrasjon kreves.

Neste datasteg er å binde rettingskandidatene til originalfilenes kontrollsummer, nøyaktige tabellrader, regnskapsomfang, valuta og beløpsskala gjennom kandidat-/reviewløpet. PDF-er og ferske databaseuttrekk er bevart privat. Ingen automatisk godkjenning er registrert.
