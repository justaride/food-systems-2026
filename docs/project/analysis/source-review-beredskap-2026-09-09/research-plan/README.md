# Researchplan for beredskap — utdeling og Astra-master

Planen deler alt registrert kartleggingsarbeid i beredskapssporet i **20 oppdrag** som kan gis til forskjellige agenter og sesjoner. Den avsluttes med en egen fullstendig mastervalidering med **gpt-6-astra**.

Omfanget er C1–C5, P1–P5, opprinnelige A1–A5-gap, oppfølgingsgap gjennom runde 006 og disponeringen av hvitbokens 15 kapitler. De 30 historiske FS-punktene avgrenser research fra implementering og menneskelig autoritet. Dette er ikke en ny kartlegging av hele applikasjonen.

**Status: planlagt. Ingen nye researchsesjoner eller Astra-runde er startet av denne planen.** Grunnlag: `4026a90d62edf129d4323f7f0971ace716b03983`, datert 9. september 2026. Historiske statusfelt er ikke oppdaterte verifikasjoner.

## Slik deles arbeidet ut

1. Les [felleskontrakten](FELLES-KONTRAKT.md) og velg en pakke nedenfor. Koordinator oppgir programRunId, unik runId, plan-commit, eget worktree og privat artefaktrot. Kopier hele pakkeprompten til sesjonen.
2. Start uavhengige pakker i bølge 1 etter tilgjengelig kapasitet. En praktisk første gruppe er B01–B03, deretter B04–B06. B07/B08 bør også tas tidlig fordi B09 avhenger av dem. Dette er prioritering, ikke en sperre for de øvrige uavhengige pakkene.
3. Kjør B09 etter terminal retur fra B07/B08. Kjør B20 etter terminal retur fra B01–B19. Dokumenterte kilde-/eierstopp teller som returer, men gir ikke faglig dekning for en syntese.
4. Kontroller returformat og frys et [masterinntak](templates/master-intake.json) med alle 20 leveranser, eksakte hashes og avhengigheter. Råkilder skal være tilgjengelige for master på autorisert måte.
5. Start en egen sesjon med modellen **gpt-6-astra** og [masteroppdraget](MASTER-ASTRA.md). Astra leser originalpassasjer, rekjører beregninger og gir et begrunnet utfall for hver påstand.
6. Eventuelle returer får nye kjørings-ID-er og et nytt frosset inntak. Endrede kilde-/påstandsbindinger krever ny kontroll. Menneskelig vurdering, kanonisk promotering og publisering ligger utenfor programmet.

Bølge 1 har 18 uavhengige pakker. De kan fordeles over mange sesjoner; samtidig kjøring er valgfritt. B19 gjør først en selvstendig gjennomgang av eksisterende proveniens. Inngående leveranser kontrolleres deretter av koordinator og Astra, slik at B19 og B20 ikke venter på hverandre.

## Oppdrag som kan deles ut

| Pakke | Oppdrag/prompt | Bølge | Krever retur fra | Eide gap-ID-er |
|---|---|---:|---|---:|
| B01 | [Regal bulk 160105: gjeldende kvalitetskrav](prompts/B01.md) | 1 | — | 1 |
| B02 | [Manitoba bulk 160585: gjeldende kvalitetskrav](prompts/B02.md) | 1 | — | 1 |
| B03 | [Furuset: dagens produksjon, behov og bulkmottak](prompts/B03.md) | 1 | — | 9 |
| B04 | [Norsk kornkjede: fysisk lager, uttaksrett og foredling](prompts/B04.md) | 1 | — | 10 |
| B05 | [Svensk forsyningsalternativ: Malmö og disponibel allokering](prompts/B05.md) | 1 | — | 2 |
| B06 | [Felles avhengigheter: energi, vann, transport og lossing](prompts/B06.md) | 1 | — | 6 |
| B07 | [Finland: eksakt korn-, fukt- og revisjonsbro](prompts/B07.md) | 1 | — | 3 |
| B08 | [Norge, Sverige og Danmark: avlingsvarsler og definisjoner](prompts/B08.md) | 1 | — | 6 |
| B09 | [Klimasamtidighet, mathvetekvalitet og importavhengighet](prompts/B09.md) | 2 | B07, B08 | 9 |
| B10 | [Aass og sidestrøm til fôr: funksjonell substitusjon](prompts/B10.md) | 1 | — | 6 |
| B11 | [Gjenvunnet fosfor: kvalitet, anvendelse og tilleggseffekt](prompts/B11.md) | 1 | — | 7 |
| B12 | [Institusjonsmåltider: kontinuitet, ernæring og spiselig svinn](prompts/B12.md) | 1 | — | 5 |
| B13 | [Norsk økonomisk mattilgang: SIFO og matutdeling](prompts/B13.md) | 1 | — | 4 |
| B14 | [Nordisk mattilgang: FIES, FAOSTAT, Sverige og Finland](prompts/B14.md) | 1 | — | 7 |
| B15 | [Island: vedtak, lagerordning og implementering](prompts/B15.md) | 1 | — | 2 |
| B16 | [Island: foredlingsaktører og leverbar matkjede](prompts/B16.md) | 1 | — | 5 |
| B17 | [Nordisk bistand: avtale, aktivering og prioritering](prompts/B17.md) | 1 | — | 6 |
| B18 | [Marked, kjøperrelasjoner og kostnader som relevant bakgrunn](prompts/B18.md) | 1 | — | 0 |
| B19 | [Proveniens, kildeidentitet, rettigheter og forskningsdekning](prompts/B19.md) | 1 | — | 0 |
| B20 | [Sammenstilling av C1–C5 og betingede anbefalinger](prompts/B20.md) | 3 | B01, B02, B03, B04, B05, B06, B07, B08, B09, B10, B11, B12, B13, B14, B15, B16, B17, B18, B19 | 3 |

## Dekning og avgrensning

[Gap- og kapittelkartet](GAP-KART.md) viser eier for alle **92 historiske gapreferanser**. Foreldre og senere presiseringer overlapper; dette er ikke 92 uavhengige kunnskapshull eller en ferdigprosent. Planen hevder ikke at gapene er lukket.

B18 dekker relevant markeds- og kostnadsbakgrunn. B19 dekker kildeidentitet, rettigheter og proveniens. De har ikke egne arvede gap-ID-er. B20 dekker syntese og betingede anbefalinger. Kapittel 15 er en eksplisitt menneskelig beslutning; research gir eventuelt underlag, ingen KI-godkjenning.

## Filer og kontroll

- [Arbeidskontrakt](FELLES-KONTRAKT.md): kilder, lagring, returkrav, stopp og autoritet.
- [Astra-master](MASTER-ASTRA.md): inngangskontroll, full påstandsvurdering og returrunde.
- [Returmal](templates/handoff.json), [kildemal](templates/source.json), [påstandsmal](templates/observation.json), [gapmal](templates/gap.json), [mastervurdering](templates/master-review.json).
- [Pakkeregister](work-packages.json), [dekningsregister](coverage.json) og [frosset inputmanifest](input-manifest.json) er maskinlesbare.

Fra repository-roten:

```sh
python3 docs/project/analysis/source-review-beredskap-2026-09-09/research-plan/generate.py --check
python3 docs/project/analysis/source-review-beredskap-2026-09-09/research-plan/verify.py
```

`build-registers.py` kontrollerer at registrene kan gjenskapes fra det frosne grunnlaget; eksplisitt `--write` regenererer dem. `generate.py` regenererer README, GAP-KART og pakkeprompter fra registrene. `verify.py` kontrollerer planstruktur, eierskap, kildepekere, avhengigheter og frosne historiske filer. Kontrollen validerer planens integritet, ikke forskningsfunn eller en utført Astra-runde. Private historiske baselines kontrolleres lokalt når de er tilgjengelige, og rapporteres ellers som ikke verifisert.
