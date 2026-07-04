---
tittel: Case-avsjekk 05 — Spillvarme / drivhus / akvakultur
status: Intern analyse — følger avsjekk-formatet fra piloten (avsjekk-06)
eier: Gabriel
dato: 2026-06-12
scope: Dypdykk-avsjekk av caset mot eget underlag, målt mot JTs sirkularitetsdimensjoner (RP-seriens tema-tabell). Konklusjon per nøkkelspørsmål: BESVART / DELVIS / ÅPENT / AKTØRGATE, og Deep Research-prompts for det som står åpent. Følger claim-lock; ingenting her er ekstern faktastemme.
relaterte_filer:
  - research/external/dro-0906/drr-0906-006-spillvarme-green-mountain-hima.md
  - research/external/spor1-uttak-2026-06-12/uttak-03-wiig-einnsyn.md
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - src/lib/data/casestatus.ts (korrigert versjon på gren codex/food-tg-arbeidsplan-2026-06-12)
  - docs/project/analysis/food-tg-innsiktssyntese-2026-06-12.md
  - docs/project/mandates/food-tg-koblingsmegler-notat-2026-06-12.md (på gren codex/food-tg-arbeidsplan-2026-06-12)
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
---

# Avsjekk: Spillvarme / drivhus / akvakultur

## 1. Casets plass i JTs sirkularitetsramme

| JT-dimensjon (RP-tema) | Treffer caset? | Hvordan |
|---|---|---|
| Spillvarme/drivhus/akvaponikk som lokal produksjon (RP-08) | Ja, kjernen | Caset ER JT-tema 8 (møte 10); caseledgeren i DRR-006 dekker casesiden (v1 prompt 5), mens RP-08-datapakken — kvantitativ mini-ledger for romlig flytmodell — fortsatt mangler (kap. 4) |
| Suksess/fiasko (RP-06) | Ja | Hima og Frövi fungerer der varmeeier og matprodusent ble koblet kontraktuelt tidlig; Polar (9 MW uten mottaker), Varde (drivhus uten navngitt operatør) og Wiig (tidslinje forskjøvet minst to ganger) stopper på koblingen — empirisk feilmodusfordeling i miniatyr |
| R9 per ledd (RP-03) | Delvis | Energikaskade/industriell symbiose: varmegjenbruk er R9-recover på ENERGISIDEN og skal aldri klassifiseres høyere (JTs regel i RP-03); matproduksjonen den muliggjør er ny lokal primærproduksjon, ikke en matløkke — de to må ikke blandes i R-klassifisering |
| Verdikjedeflyt og kast (RP-01) | Delvis | Lokal veksthus-/RAS-produksjon flytter importflyt (tomat/agurk/ørret), ikke kast; relevant for flytmodellens produksjonsnoder, men ingen volumdata i underlaget utover anleggsnivå |
| Matsvinnkvalitet/kontaminering (RP-04) | Nei | Ikke berørt i underlaget |
| Næringsstoffløkker (RP-05) | Svakt | Akvakultursiden (Hima/RAS) grenser mot oppdrettsslam-delfeltet, men det er ikke undersøkt i dette caset |

Ærlig plassering: dette er et **symbiose-/koblingscase**, ikke en materialløkke. Den sirkulære verdien er at varme som ellers dumpes (R9 recover) muliggjør lokal matproduksjon — og casets systeminnsikt er negativ-funnet: koblingen er flaskehalsen («varme uten mottaker», mønster 4 i innsiktssyntesen). Polar DC med opptil 9 MW ekstern varmeberedskap og ingen aktuell mottaker er det reneste eksemplet. Koblingsmegler-notatet (codex-grenen) bygger partnerflaten på akkurat dette og er casets analytiske forlengelse — hypotese, ikke beslutning.

## 2. Kunnskapsstatus per nøkkelspørsmål

Statusvokabular: **BESVART** = kan presenteres internt med kilde+locator innenfor claim-lock, ingen ny research nødvendig. **DELVIS** = kjernen står, men en navngitt bit mangler. **ÅPENT** = krever ny research (prompt finnes i kap. 4, eller er bevisst stopp markert i kap. 3). **AKTØRGATE** = kan kun besvares av aktør/menneske — utenfor vår loop, ligger i DASK/AASK.

| # | Nøkkelspørsmål | Svar fra underlaget | Status |
|---|---|---|---|
| 1 | Finnes et operativt nordisk datasenter→mat-case? | Ja: Green Mountain–Hima (Rjukan) — operativ fase 1 høsten 2025, testet til 1,75 MW, fase 2 vurderes til 8 MW, 800 m lukket vannkrets; Himas 8 000 t ørret/år er MÅL, ikke dagens produksjon. Kilde: DRR-006 (S04–S06) | **BESVART** (deckklart internt) — driftstall GWh/temp/økonomi er aktørgate, se #10 |
| 2 | Hva dokumenterer Frövi-benchmarken? | 35 GWh/år gjenbrukt industrivarme, 100 000 m² drivhus, 8 000 t tomater/år; drivhus 1 ferdigstilt 31.05.2024. Varmen er fra Billeruds papir-/kartongproduksjon — aldri datasenterbevis. Kilde: DRR-006 (S01–S03) | **BESVART** (med claim-lock: industriell benchmark, ikke datasenter-case) |
| 3 | Er Wiig-piloten (Odin/DC1, 4 MW, Vikvegen/Orre, Klepp) i drift? | Nei dokumentert: rammetillatelse nov. 2023 (Holon); Enova-prosjektside bekreftet 4 MW initielt, 50–70 °C, potensial 200 MW (desk-logg kap. 6) - siden er senere blitt 404, og arkiv-/hashnotat ligger i `research/external/dro-0906/downloads/enova-wiig-prosjektside-current-404-2026-06-12.md`. Tidslinjen er forskjøvet minst to ganger (ferdig høst 2024 → operativ jan. 2025 → «Available Q3 2026»); ingen IG/ferdigattest funnet. Kilde: uttak-03 | **DELVIS** — resten er MENNESKEGATE: ferdig innsynskrav til Klepp kommune ligger klart (uttak-03 kap. 3); skal sendes, ikke researches |
| 4 | Gjelder juni 2026-godkjenningen Wiig? | Nei — absolutt skille: Norway 1 (36 MW, Næringsvegen/Varhaug, Hå, byggestart «senere i 2026») er et ANNET anlegg enn Wiig-piloten (4 MW, Orre, Klepp). Norway 1-omtale må aldri siteres som Wiig-status. Kilde: uttak-03 (DCD 2026-06-11 + geokryssjekk) | **BESVART** (som skille/ikke-si; allerede i korrigert casestatus.ts) |
| 5 | Hva er status for Varde/Krageris? | Plan-/høringscase: §25-utkast gir ~500 MW el, 4 × 10 ha drivhus, opptil 46 °C tur / 24–32 °C retur, backup 4 × 10 MW; WA3RM er ute; ingen navngitt drivhusoperatør, ingen GWh/år nyttiggjort varme. Høringsfrist 25.06.2026. Kilde: DRR-006 (S14–S15), desk-logg kap. 9 | **DELVIS** — DATOSTYRT: ingen ny status ventes før 25.06; oppfølging uke 27 er kalenderoppgave, ikke prompt |
| 6 | Skiller underlaget elektrisk kapasitet fra nyttiggjort varme — og hva er systeminnsikten? | Ja, konsekvent: Polar DRA02 57 MW total effekt vs. opptil 9 MW ekstern varmeberedskap (28/18 °C) og ingen aktuell mottaker; Kviamarka 492 GWh/år er forbruk, ikke varmeleveranse. Systeminnsikt: koblingen er flaskehalsen (mønster 4); koblingsmegler-notat finnes som partnerhypotese | **BESVART** (intern syntese — aldri som claim om at navngitte aktører har «feilet») |
| 7 | Finnes RP-08-datapakken (mini-ledger med noder/lokasjon for romlig flytmodell)? | Nei. DRR-006 har caseledger og datauttrekkstabell, men uten node-struktur (varmekilde→mottaker), koordinater/sted per strøm og a/b/c-merking av energimengder (kontraktsfestet/teknisk potensial/medieomtalt) | **ÅPENT** → prompt P-VARME-1 (= RP-08-kjøringen) |
| 8 | Hva kreves for at X MW spillvarme blir Y tonn mat — finnes publiserte nøkkeltall? | Frövi gir ett datapunkt (35 GWh ↔ 100 000 m² ↔ 8 000 t tomater); Polar-scenariene gir MW/GWh uten matvolum; Time-forstudien gir temperaturer. Ingen normalisert energi-/arealtabell (kWh/m²/år, GWh/tonn, temperaturkrav) eller norsk overførbarhetsanalyse i underlaget | **ÅPENT** → prompt P-VARME-2 |
| 9 | Er NVE-kravet (kost-nytteanalyse for datasentre >2 MW) dokumentert som strukturell driver? | Delvis i underlaget: NVE-veileder (plikt fra 01.04.2025, S13 i DRR-006) + Polar DRA02 som konkret analyse distribuert til NVE. Men hjemmel med paragraf og faktisk praksis (hvor mange analyser, hva NVE gjør med dem, utløser de noe?) er ikke dokumentert med locator | **ÅPENT** → prompt P-VARME-3 (avgrenset primærsjekk) |
| 10 | Hva er Himas faktiske driftstall (GWh, temperatur, økonomi, produksjonsvolum), Frövis måledata og Wiigs aktørstatus? | Krever aktørsvar: Hima/Green Mountain-driftsdata ligger som AASK-0906-005; Frövi data request og Wiig/Green Horizon-bekreftelse er aktørhandlinger (DRR-006 kap. 7) | **AKTØRGATE** — utenfor vår loop |

## 3. Konklusjon for caset

**Kjernen er besvart.** Spørsmål 1, 2, 4 og 6 — Hima som operativt internt case, Frövi som industriell benchmark, Wiig/Norway 1-skillet og el-vs-varme-disiplinen med koblingsmangel-innsikten — står på primærnære kilder med locator og tåler intern presentasjon i dag. Det matcher korrigert casestatus.ts (codex-grenen): go for Hima med datagap, Frövi som benchmark, resten radar; no-go for nasjonalt TWh-claim.

**Tre ting står åpent og har hver sin prompt (kap. 4):** RP-08-datapakken for romlig flytmodell (P-VARME-1), energi-/arealregnestykket med norsk overførbarhet (P-VARME-2), og NVE-kravets hjemmel og praksis (P-VARME-3).

**To ting er bevisst IKKE research-prompts:** (a) Wiig-driftsstatus er en **menneskeoppgave** — innsynskravet til Klepp kommune er ferdig formulert i uttak-03 kap. 3 og skal sendes (pluss manuell matrikkelsjekk 39/59 og arkivering); mer websøk løser det ikke. (b) Varde er **datostyrt** — høringsfristen 25.06.2026 må passere før det finnes noe nytt å hente (oppfølging uke 27).

**Én ting skal vi bevisst ikke researche mer på:** Hima-/Frövi-driftstall og Wiig-aktørbekreftelse — det er aktørgate (AASK-0906-005 m.fl.), samme konklusjon som DRR-006 kap. 7.

## 4. Research-prompts (Deep Research-format)

Kjøreregel: hver prompt kjøres i egen tråd, ETTER masterprompten fra `food-tg-deep-research-prompt-pack-2026-06-10.md` + datamodus-tillegget fra `food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md` kap. 2. Output lagres som `deep-research-varme-<id>-YYYY-MM-DD.md` og går gjennom kontrollstacken (mottak → SRC/PCQ → claim-lock) før bruk. P-VARME-1 er identisk med RP-08-kjøringen i mandatet — den skal IKKE kjøres dobbelt; logges som `DRO-RP-08`.

### P-VARME-1: RP-08-datapakken (mini-ledger for romlig flytmodell)

```text
Oppgave: Kjør RP-08 (spillvarme-datapakke) slik den er definert i food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md kap. 4, på anleggene i DRR-0906-006-caseledgeren: Green Mountain–Hima (Rjukan), Regenergy Frövi/Billerud, Wiig-piloten/Odin (Vikvegen, Orre, Klepp), Kviamarka inkl. Miljøgartneriet–Tine (Hå), Varde/Krageris (Danmark), Polar DC DRA02 (Drangedal).

Tilleggskravet fra RP-08 gjelder uavkortet: per anlegg lever lokasjon (sted, kommune, land), varmekilde-node og mottaker-node slik at strømmen kan tegnes på kart, og merk hver energimengde eksplisitt som (a) kontraktsfestet levert varme, (b) teknisk potensial, eller (c) medieomtalt tall uten kildeunderlag. Kun (a) kvalifiserer som observert strøm i flytmodellen.

Harde regler for denne kjøringen:
- Skill alltid elektrisk kapasitet fra nyttiggjort varme (Polar: 57 MW vs. opptil 9 MW; Kviamarka: 492 GWh/år er forbruk, ikke varme).
- Wiig-piloten (4 MW, Orre/Klepp) og Norway 1 (36 MW, Varhaug/Hå) er to ulike anlegg — to ulike rader, aldri samme node.
- Respekter de 12 ikke-si-punktene i DRR-0906-006 kap. 6; ingen rad får status (a) uten kontrakts- eller leveransedokument med locator.
- Mottaker-node «ingen» er gyldig og viktig output (koblingsmangel-funnet).

Leveranseformat: anlegg | land/kommune/sted | varmekilde-node | mottaker-node | energimengde | enhet | a/b/c | temperatur | år/status | kilde | URL | locator | datakvalitet. Tomme celler rapporteres eksplisitt.
```

### P-VARME-2: Energi-/arealregnestykket og norsk overførbarhet

```text
Oppgave: Finn publiserte nøkkeltall som kobler spillvarmemengde til matproduksjon i nordisk klima, og vurder norsk overførbarhet — uten å konstruere egne potensialestimater.

1. Veksthus: publisert varmebehov (kWh/m²/år) for tomat/agurk i nordisk klima (NIBIO, SINTEF, svenske/danske forskningskilder, Frövi-dokumentasjon inkl. WA3RM LCA/LCC, Time-forstudien 27.05.2025). Oppgi temperaturkrav og om lavtemperaturkilder (<40 °C, jf. Polar 28/18 °C) krever varmepumpe.
2. Avledede forholdstall KUN der kilden selv oppgir dem: GWh per tonn produkt, m² per tonn/år. Frövi-punktet (35 GWh ↔ 100 000 m² ↔ 8 000 t tomater/år) brukes som referanse, merket som aktørtall, ikke målt drift.
3. Akvakultur/RAS: finnes publiserte tall for varmebehov per tonn landbasert ørret/laks (kWh/kg, temperaturkrav)? Hima-caset har ingen offentlige driftstall — si det eksplisitt hvis gapet består.
4. Norsk overførbarhet: hva sier forstudiene (Time, Polar/Sweco) om avstand, temperaturløft og kostnad som begrensning? Rapporter deres forutsetninger, ikke egne beregninger.

Leveranseformat: nøkkeltall | verdi | enhet | klima/geografi | kilde | URL | locator | datakvalitet (observert/estimert/modellert/illustrativ). Ikke aggreger til nasjonalt potensial (TWh-claims er no-go i casestatus). Tomme celler — særlig målt GWh→tonn fra drift — er hovedfunn.
```

### P-VARME-3: NVE-kravet — hjemmel og praksis (avgrenset primærsjekk)

```text
Oppgave: Dokumenter hjemmel og praksis for kravet om kost-nytteanalyse av overskuddsvarme for datasentre over 2 MW (i kraft 01.04.2025), som i dag kun står på NVEs veiledningsside (S13 i DRR-0906-006).

1. Hjemmel: hvilken lov/forskrift med paragraf pålegger analysen (energieffektiviseringsdirektivets norske gjennomføring? energilovforskriften? annen forskrift)? Oppgi eksakt paragraf og ikrafttredelse.
2. Innhold: hva krever plikten konkret (hvem utarbeider, hva skal vurderes, hvem mottar), og hva er konsekvensen av negativ kost-nytte — plikt til utnyttelse eller kun dokumentasjon?
3. Praksis: finnes oversikt over innsendte/vurderte analyser hos NVE? Polar DRA02 (sendt NVE, jf. Sweco-rapporten) brukes som sjekkpunkt: er den behandlet, og med hvilket utfall?
4. Driver-testen: finnes dokumenterte eksempler på at kravet har utløst faktisk varmeutnyttelse — eller er det foreløpig kun analyseplikt? Begge utfall rapporteres.

Leveranseformat: regelverkstabell (krav | hjemmel m/paragraf | ikrafttredelse | pliktsubjekt | konsekvens | kilde | locator) + praksistabell (case | analysestatus | utfall | kilde). Ikke omtal kravet som «driver for realisering» uten dokumentert eksempel — i claim-lock er det inntil videre en strukturell RAMME, ikke en dokumentert effekt.
```
