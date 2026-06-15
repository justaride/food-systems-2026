---
tittel: Kjøreordre for case-avsjekk-prompter
status: Aktiv intern arbeidsordre
eier: Gabriel
dato: 2026-06-12
scope: Operativ rekkefølge for å kjøre promptbiblioteket i case-avsjekkene. Bygger på README-indeksen, de syv avsjekkene, masterprompt v1, datamodus og 12.06-arbeidsplanen. Ingen claim åpnes av denne filen.
relaterte_filer:
  - docs/project/analysis/case-avsjekk/README.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md
  - docs/project/status/food-tg-arbeidsplan-videre-2026-06-12.md
---

# Kjøreordre: case-avsjekk-prompter

## 0. Bruksregel

Denne kjøreordren er for neste utførelse av de smale case-avsjekk-promptene. Den erstatter ikke faseplanen i `food-tg-arbeidsplan-videre-2026-06-12.md`: dersom arbeidet skal endre kontrollfiler, casestatus, deck eller ekstern faktastemme, skal Fase 1 i arbeidsplanen kjøres først.

Hvis arbeidet bare er nye Deep Research-kjøringer, kan promptene under kjøres uten å endre kontrollfiler. Output skal da lagres og valideres, men ikke brukes videre før mottaksrad, SRC/PCQ eller claim-lock er oppdatert i riktig rekkefølge.

## 1. Preflight for hver arbeidsøkt

1. Sjekk `git status --short --branch` og noter om case-avsjekkpakken fortsatt er utracket eller allerede landet.
2. Les `docs/project/analysis/case-avsjekk/README.md` kap. 2-4 for oppdatert promptliste, bevisste stopp og funn til kontrollert oppdatering.
3. Kopier alltid promptgrunnlaget i denne rekkefølgen: masterprompt v1, datamodus-tillegg, deretter valgt case-avsjekk-prompt.
4. Lagre output som `deep-research-<case>-<prompt-id>-YYYY-MM-DD.md`.
5. Kjør valideringsprompten fra masterprompt v1 på hele outputen.
6. Registrer bare kontrollerte resultater i mottakslogg. Nye kilder og claims går derfra videre til source-shortlist/PCQ og claim-lock, ikke direkte til deck eller casestatus.

## 2. Første kjørebølge

| Rekkefølge | Kjøring | Hvordan | Hovedoutput | Stoppsignal |
|---:|---|---|---|---|
| 1 | `P-FISH-1` + `P-SKOT-2` | Samme tråd. Masterprompt v1 + datamodus + P-FISH-1 fra avsjekk-06 + P-SKOT-2 fra avsjekk-07. | Norsk fraksjon-til-marked-tabell med prisindikasjoner, tomme prisceller, og norsk-skotsk strukturdel. | Ingen norsk pris per fraksjon finnes, eller strukturdata finnes uten kilde som kobler struktur til verdimiks. Det er gyldig negativt funn, ikke feil. |
| 2 | `P-DIST-1` | Egen tråd. Masterprompt v1 + datamodus + P-DIST-1 fra avsjekk-04. | Importklar RP-06-ledger over norske CEA-/veksthus-/lokalproduksjonsinitiativer og dokumenterte barrierer. | Årsak til utfall er ikke dokumentert i primær-/aktør- eller registerkilde. Da skal raden stå med tom årsakskolonne, ikke spekulasjon. |
| 3 | `P-FISH-2` | Leseoppgave, ikke websøk. Bruk lokal `research/external/dro-0906/downloads/strand-etal-2024.pdf` hvis filen finnes. | Metodebro Island-Norge med definisjonstabell og claim-lock-forslag. | PDF mangler lokalt eller artikkelen bruker inkompatible definisjoner. Da logges gapet, og sammenligningen holdes tilbake. |
| 4 | `P-VALIO-1` | Egen tråd. Rene desk-datasett fra Luke, Ruokavirasto og Tulli/Uljas. | Finsk forbruksside for fôrråvarer, med API/CSV-tilgang og avvik mot Comtrade-preview. | Data finnes bare i rapportform eller dekker import, ikke forbruk. Det skal rapporteres eksplisitt. |

## 3. Andre kjørebølge

| Rekkefølge | Kjøring | Hvorfor | Output |
|---:|---|---|---|
| 5 | `P-SKOT-1` | Oppdaterer eller bekrefter 2019-caveaten i Skottland-benchmarken. | Kildetabell for nyere skotske volum-/strukturdata og liste over hva som fortsatt bare finnes i ZWS/Enscape 2019-surveyen. |
| 6 | `P-KAFFE-2` | Rydder casestatus-formuleringen om kaffe og norsk EUDR-gjennomføring. | Statustabell som skiller EU-rett, EØS-prosess og norsk forskrift, med trygge formuleringer og hold-tilbake-liste. |
| 7 | `P-KAKAO-2` | Lukker primærdokumentgapet for Côte d'Ivoire-sporbarhet. | Dekret-/register-/metodedokumenttabell og claim-lock-forslag for CCC/RPCCV/37,4 %-tallet. |
| 8 | `P-VALIO-2` | Tester om soyafri governance er nordisk bølge eller finsk særtilfelle. | Primærkildebasert tidslinje og SE/DK/FI/NO-importtabell. |
| 9 | `P-DIST-2` | Tester offentlige innkjøp som alternativ kanal til dagligvaregrossistene. | Regelverkstabell, markedstabell, eksempeltabell og barrierer etter RP-06-taksonomien. |

## 4. RP-koblede tillegg, ikke egne case-avsjekk-kjøringer

| Tillegg | Kjøring | Registrering | Regel |
|---|---|---|---|
| `P-FISH-3` | `RP-04` | Logges under `DRO-RP-04` med marint tillegg. | Skal ikke kjøres som egen tråd, fordi kvalitets-/regelverksgaten er en del av matsvinnkvalitet. |
| `P-VALIO-3` | `RP-05` | Logges under `DRO-RP-05` med fôr-løkke-tillegg. | Skal dokumentere sidestrømsandel i fôrkurven, ikke gjenta Valio-caset. |
| `P-VARME-1` | `RP-08` | Logges som `DRO-RP-08`. | Identisk med spillvarme-datapakken; skal ikke dupliseres som caseprompt. |

## 5. Lavere prioritet og kill/validate

Disse kjøres etter første og andre bølge, med mindre en konkret mottaksrad eller JT-beslutning flytter dem opp:

| Kjøring | Status | Kriterium for å stoppe |
|---|---|---|
| `P-VARME-2` | Nyttig for overførbarhet, men ikke første blokk. | Ikke aggreger til nasjonalt potensial; tomme GWh-per-tonn-celler er hovedfunn. |
| `P-VARME-3` | Avgrenset primærsjekk av NVE-krav. | Hvis kravet bare er analyseplikt og ingen realiseringseksempel finnes, behold claim som strukturell ramme. |
| `P-KAKAO-1` | Smal kill/validate for kakaoreststrømmer. | Hvis ingen rad har operatør, lokasjon, volum og output/marked, konkluder `watchlist/benchmark-only - bevisst stopp`. |
| `P-KAFFE-1` | CONAB-datatilgang. | Hvis offentlig API/CSV/eksempelrespons ikke finnes, er det hovedfunn; ikke si at importører bruker plattformen. |
| `P-KAFFE-3` | Norsk kaffegrut-massestrøm. | Ikke gjenåpne pilotclaim eller hente enkeltaktør-throughput; massestrømmen alene er desk-sporet. |

## 6. Skal ikke researches mer nå

- Aktørgater: Brasil-MOU/Fuglen/NKI-roller, LEAD Ivory Coast, produktnivå kakao-sporbarhet, Valios fôrkurv/PFAD, BAMA-/Gartnerhallen-vilkår og marginer, Hima driftstall, IOC claim-metode/norske aktørdata.
- Menneskeoppgaver: Klepp-innsynskravet og eventuell SBMT-avklaringsmail.
- Datostyrt: Varde etter 25.06.2026, presiseringshøringens utfall, SINTEF/FHF 2025-årgang i Q3.
- Sovende oppfølging: Polen full kill-test. Ingen `P-POLEN-1` utstedes før noen faktisk skal kjøre den.

## 7. Mottakskrav for å kalle en kjøring ferdig

En kjøring er ikke ferdig når Deep Research-outputen foreligger. Den er ferdig først når disse punktene er gjort:

1. Outputfil er lagret med avtalt filnavn.
2. Valideringsprompten er kjørt og lagret eller innarbeidet som kontrollnotat.
3. Mottaksrad har kort dom, sterkeste kilde, svakeste punkt, claim-effekt, PCQ-effekt og importbeslutning.
4. Nye kilder er klassifisert som primær, sekundær, bakgrunn eller aktørgate for eventuell source-shortlist.
5. Nye tall har verdi, enhet, år/periode, geografi, metode, kildeeier, URL, locator og datakvalitet.
6. Claim-lock-effekt er eksplisitt: åpner ingen claim, styrker caveat, svekker claim, krever actor validation, eller kan brukes internt med forbehold.
7. Ikke-si-listen er oppdatert dersom outputen svekker eller presiserer en eksisterende formulering.
8. Ingen aktørkontakt er sendt av Codex.

## 8. Anbefalt neste handling

Start med `P-FISH-1` + `P-SKOT-2` som samlet tråd. Den mater verdimiks-fortellingen direkte og gir samtidig strukturbroen Skottland-Norge uten dobbeltarbeid. Neste tråd etter det er `P-DIST-1`, fordi den begynner å fylle RP-06-ledgeren JT etterspurte og tester C-gate-tesen empirisk.
