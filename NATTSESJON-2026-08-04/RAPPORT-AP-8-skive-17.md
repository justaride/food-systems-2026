# Rapport AP-8 – skive 17

**Status:** FULLFØRT MED SYNLIGE PARTIELLE LESERESULTATER  
**Skive:** 17 av 20  
**Manifestenheter:** 26  
**Triage-poster:** 26  
**Produksjonsmerking:** `provisional: true`, `producedBy: nattsesjon-2026-08-04`  
**Skriveflate:** kun egen triagefil og denne rapporten

## 1. Gjennomført arbeid

Alle 26 manifestkilder for skive 17 er åpnet og lest på filnivå før posten ble skrevet. Det er skrevet én JSON-post per enhet i [triage-skive-17.jsonl](./triage/triage-skive-17.jsonl). Postene refererer til hva kildene eller arbeidsnotene sier; de bekrefter ikke at påstandene er sanne.

Lesestatus:

- 23 `read_fully`
- 3 `read_partially`: NIBIO-rapporten, NOU 2013:6 og SIFO-lokatoren
- 0 `unreadable`

De to lange PDF-ene med `read_partially` har fått gjennomgått sammendrag, metode, sentrale resultat- og konklusjonskapitler, men ikke alle vedlegg/mellomkapitler linje for linje. SIFO-enheten er en locator uten selve publikasjonsteksten.

## 2. Triagebilde

- 16 `prioriter`
- 9 `standard`
- 1 `ut_av_omfang`
- 16 poster avviker fra maskinrollen `primary_evidence`, hovedsakelig fordi enheten er intern syntese, locator, snapshot eller sekundærmedie.
- 16 poster er merket DATAGAP-relevans `core`.

Hyppigste DATAGAP-spor i skiven er `kausalitet`, `nordisk_dybde`, `aktordybde` og `materialstrommer`. Dette viser et mønster av god kartleggings- og aktørdekning, men åpne gap i årsaksbevis, harmoniserte nordiske tall og realiserte materialstrømmer.

## 3. Viktigste eierkøer

1. `document:cmp8xyohw00kcvvvmwv13yt5y` – EMV-rapporten er den sterkeste deskriptive primærkilden i skiven for EMV, vertikal integrasjon, eksklusivitetsavtaler og markedsstruktur. Den er likevel hovedsakelig basert på 2017/2022-data og etablerer ikke alene kausale effekter på pris, innovasjon eller makt.

2. `document:cmp8xyops00kkvvvmnhgrwt2t` – NIBIO-rapporten gir en viktig metodegrense: FAO FBS/SUA kan ikke uten videre brukes som direkte sammenlignbar nordisk selvforsyningsmåling fordi mat, fôr, prosessering og annen anvendelse ikke skilles tilstrekkelig. De oppgitte nivåene må derfor holdes atskilt fra nasjonal norsk statistikk.

3. `document:cmql058ry00pu76vm0af7xr0y` og `document:cmql058sq00q176vmnslhq7rz` – de to næringskretsløpsnotene peker samlet på at energiutnyttelse ikke kan likestilles med dokumentert N/P/K-retur. Manglende nasjonale, realiserte returdata fremstår som et eksplisitt C-gap, ikke som bevis på at aktivitet ikke finnes.

4. `document:cmp8xyo...`-enhetene for Dagligvaretilsynet, NOU 2013:6 og AgriAnalyse-transkriptet gir et verdifullt kvalitativt lag om aktører, makt, kontrakter og implementering. Alle tre har klare avgrensninger: survey/intervju er ikke representativt eller sannhetsbevis, NOU-en er historisk, og AgriAnalyse-transkriptet må ikke brukes som vannkvalitets- eller kausalitetsbevis.

## 4. Kilder som krever særskilt oppfølging

- København-strategien, SRC/Nordisk ministerråd-snapshoten, svensk økologirapport og Cheffelo-utdraget er lokale snapshots/utdrag. De er lesbare som lokale filer, men originalkilden må hentes og kontrolleres før tall eller aktuell status brukes.
- Hooked Foods-artikkelen er sekundærmedie. Konkursårsaker, finansiering, omsetning og produktpåstander må kontrolleres mot regnskap, konkursdokumenter eller selskaps-/støttegiverkilder.
- SEC-MAT-, R12- og R13-enhetene er interne synteser eller arbeidsnoter. De er registrert som kontroll- og verifikasjonsspor, ikke som primær evidens.
- Danmark-noten er uttrykkelig datert til 16. juni 2026. CO2e-avgiftens status, satser og Grøn Trepart-mål må livekontrolleres før juridiske eller politiske påstander gjentas.
- Island-noten har en intern motsetning mellom oppgitte PxWeb-tall og merknaden om at cellene ikke ble hentet. Tallene er derfor ikke promotert.
- SIFO-posten er locator-only og er satt til `ut_av_omfang` inntil publikasjonsteksten faktisk foreligger.

## 5. Verifikasjon utført

Følgende ble kontrollert mot manifestet og skjemaet:

- 26 gyldige JSONL-linjer og 26 manifestenheter for `slice == 17`.
- Ingen manglende eller ekstra identitetsnøkler.
- Ingen duplikate `identityKey`-verdier.
- Alle obligatoriske AP-8-felter er til stede.
- Alle poster har `slice: 17`, `provisional: true` og riktig `producedBy`.
- `readState`, roller, dokumenttyper, verdicts, gap-typer og DATAGAP-slugs følger skjemaets tillatte verdier.
- Egen triagefil inneholder ingen hemmeligheter eller absolutte private kildekorpusstier.

## 6. Stoppregler og grenseflater

Det er ikke skrevet til `knowledge/corpus/`, registeret eller køer. Det er ikke brukt database, ikke lest `.env`, ikke kjørt `--apply`, og ingenting under `research/evidence-pack/` er endret, flyttet eller omdøpt. Ingen identiteter er flettet.

Dette er en foreløpig triageleveranse. `prioriter` betyr at enheten fortjener eierens neste kontrollsteg; det betyr ikke at kilden er sann, komplett, aktuell eller publiseringsklar.

## 7. Anbefalt neste steg for eier

Prioriter primærkontroll av EMV-rapportens nøkkeltall, NIBIOs metode-/vedleggstabeller, SSB-uttrekket for fiskeolje, de norske/nordiske digestat-tallene og den juridiske statusen i Danmark. Hent deretter originalene bak snapshots og interne synteser før eventuelle claims promoteres til corpus eller register.
