---
tittel: Food TG — Konsolidering av Deep Research runde 2 (etter primæruttrekk)
status: Konsolideringsnotat (intern) — staged for claim-lock
eier: Gabriel
dato: 2026-06-16
scope: Samler runde 2 etter at 6 primæruttrekk er kjørt 16.06. Oppdaterer status per case, stager klar-til-import claim-lock-rader med ekte primærkilde-URL-er, folder inn tre narrativtråder, og lister gjenstående hull.
bruksregel: >
  Claim-lock-radene i §3 er NÅ IMPORTERT (16.06) som dater delta-seksjon «Runde 2-delta 2026-06-16» i food-tg-claim-lock-table-2026-05.md (3 nye claims + 4 oppdaterte forbehold + hold-tilbake-deltaer). Ingen claim er «Validert eksternt». Forståelseslaget (FORST-R2) er fortsatt bakgrunn, ikke faktastemme.
relaterte_filer:
  - docs/project/mandates/food-tg-mottak-runde2-2026-06-16.md
  - research/external/r2/DRO-R2-INDEX-2026-06-16.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - research/external/r2/SSB-08801-norge-brasil-uttrekk-2026-06-16.md
  - research/external/r2/STATBANK-dk-island-gjodsel-2026-06-16.md
  - research/external/r2/NL-glastuinbouw-energimiks-2026-06-16.md
  - research/external/r2/nutrient-loop-realiserte-tonn-2026-06-16.md
  - research/external/r2/danmark-co2e-avgift-rettsstatus-2026-06-16.md
  - research/external/r2/NO-offentlig-innkjop-okologisk-andel-2026-06-16.md
---

# Konsolidering — Deep Research runde 2

## 1. Sammendrag

Runde 2 er lukket på uttrekksnivå. **12 rapporter** mottatt (6 datasøk + 6 forståelse) og **6 primæruttrekk** kjørt 16.06 mot offentlige API-er/primærkilder. Resultatet: **tre felt løftet til primærkildenivå** (Norge–Brasil-handel, dansk gjødsel-P/K, nederlandsk veksthus-energimiks), **to hull bekreftet og presisert** (realiserte næringstonn; norsk øko-innkjøpsandel), og **ett rettsstatus-spørsmål avklart** (dansk CO2e-avgift). To stragglere gjenstår (Island-gjødselverdier — POST-blokkert; nordiske digestatvolum).

**Netto for prosjektet:** handelslaget i A-sporet er nå SSB-primært (ikke lenger «finn primær»); B-sporets nøkterne hovedbudskap er styrket *og* presisert (realisert gjenvinning er minimal — potensial-vs-realisert-gapet ER historien); og benchmark-casene (DK, NL, København) har fått verifiserte tall med riktige forbehold.

---

## 2. Status etter uttrekk (per case)

| Case | Status i mottak (før) | Etter primæruttrekk 16.06 | Nå | Gjenstår |
|---|---|---|---|---|
| DRO-R2-01 Norge–Brasil | needs-primary-check (handel via WITS/sekundær) | SSB 08801 full serie 2015–2025; matcher Comtrade-rapportør ±0,0001 % | **handel = SSB-primær (klar-m-forbehold)** | HS6-full-sum valgfritt; NOK→USD; 2025 foreløpig |
| DRO-R2-02 Nutrient loops | realisert tonn = needs-data | RecoLab 2024 realisert = 497 kg struvitt + 629 kg amm.sulfat; NO fiskeslam ingen nasjonal aggregat | **hull bekreftet + presisert** | digestat/næringsretur-volum; nasjonal aggregat finnes ikke |
| DRO-R2-03 Mineralgjødsel | DK P/K + Island = needs-data | DST `GOEDSALG` 2023:24 P 16 859 t / K 53 265 t (element-basis); N validerte selektor | **DK = primær (klar)**; Island POST-blokkert | Island-verdier (POST-spørring klar); digestatvolum |
| DRO-R2-04 Danmark animalsk | benchmark-only; CO2e-avgift «re-sjekk» | CO2e-avgift = **ikke vedtatt lov**, fortsatt aftale; sats 300→750 DKK/t, start 2030; ingen buskapsreduksjon | **rettsstatus avklart** | endelig lovtekst når den fremsettes |
| DRO-R2-05 Offentlig innkjøp | norsk motpart = needs-data | Oslo målt 2,5 % (2018), 50 %-mål **fjernet** 2023; nasjonalt 0–30 % | **avklart: målt by-andel finnes ikke; metrikk forlatt** | (ingen — gapet er selve funnet) |
| DRO-R2-06 Nederland | energimiks fragmentert | WUR Energiemonitor 2024: ~95 PJ, gass-WKK-ryggrad, fornybar 15,1 %, geotermi 7,1 PJ | **energimiks = primær (benchmark, klar-m-forbehold)** | sidestrøm-valoriserings-aggregat (finnes ikke) |

---

## 3. Claim-lock-rader — IMPORTERT 16.06 (7-kolonneformat)

> ✅ Importert til `food-tg-claim-lock-table-2026-05.md` som seksjon «Runde 2-delta 2026-06-16». Statusnøkkel: `klar` / `klar-med-forbehold` / `krever-bekreftelse`.

### 3a. Nye claims

| Claim | Foreslått publikasjonsformulering | Status | Kildeanker | Må alltid sies | Ikke si | Neste port |
|---|---|---|---|---|---|---|
| `CL-A-022` Norge–Brasil soya/klippfisk-akse | Norge importerer hoveddelen av soyabønnene fra Brasil (ca. 60–80 % av volum 2015–2024) og eksporterer klippfisk/bacalhau tilbake til Brasil — to motstrømmer i samme akse; SSB er autoritativ kilde. | `klar-med-forbehold` | SSB tabell 08801 (`research/external/r2/SSB-08801-norge-brasil-uttrekk-2026-06-16.md`); Denofa; Felleskjøpet 2025 | Oppgi år, HS-kode og at 2025 er foreløpig; «Verden» inkluderer reeksport; verdi i NOK. | «Norge importerer bare brasiliansk soya» (også US/CA/PL); «Brasil-andelen falt i 2025» som faktum (2025 foreløpig; selskapskilder viser ingen Brasil-exit — jf. Runde 3-delta). | HS6-full-sum hvis ønsket; NOK→USD for verdisammenligning. |
| `CL-B-024` Nordisk mineralgjødselforbruk N/P/K | Mineralgjødselforbruket i Norden er stort og dominert av nitrogen; NO 91 646 t N, SE 219 100 t N, DK 238 846 t N, DK P 16 859 t / K 53 265 t (element-basis) — referansegrunnlag for hvor mye gjenvunnet næring måtte erstatte. | `klar` | NIBIO; SCB; DST `GOEDSALG` (`research/external/r2/STATBANK-dk-island-gjodsel-2026-06-16.md`) | Skill salg/forbruk/produksjon; oppgi gjødselår; P/K i element-basis (ikke P2O5/K2O). | «Gjenvunnet næring kan erstatte alt virgin mineral-N»; bland ikke land med ulik definisjon. | Island-verdier (POST); harmonisert nordisk tabell. |
| `CL-C-019` Nederland glastuinbouw energimiks | Nederlandsk veksthusproduksjon er en gass-/WKK-drevet gjennomstrømningsmodell (fornybarandel kun 15,1 % i 2024, under nasjonalt snitt), med voksende geotermi og økende avhengighet av ekstern CO2 — benchmark for *mekanisme*, ikke nordisk mal. | `klar-med-forbehold` | WUR Energiemonitor 2024 (Rapport 2025-150, edepot.wur.nl/702373); CBS (`research/external/r2/NL-glastuinbouw-energimiks-2026-06-16.md`) | Benchmark-kontekst (NL), ikke nordisk bevis; oppgi år og at WKK gjør sektoren til netto strømeksportør. | «Nederlandsk veksthus = sirkulær mal»; «modellen er fossiluavhengig». | Nordisk overføringsverdi-vurdering; WUR/Moerman ikke som effektbevis. |

### 3b. Oppdateringer til eksisterende claims

| Claim | Hva runde 2 endrer | Foreslått ny formulering / forbehold |
|---|---|---|
| `CL-B-016` RecoLab/nutrient-loop benchmark | Realiserte tonn er nå kjent og **minimale**: 2024 = 497 kg struvitt + 629 kg amm.sulfat; resten av slam/gråvann returnert til hovedstrøm. | Behold `klar-med-forbehold`. Legg til «Må alltid sies»: realisert distriktsvis gjenvinning er svært liten i tonn (prosesstall ≠ realisert tonn). «Ikke si»: «RecoLab gjenvinner betydelige årlige N/P/K-tonn». |
| `CL-B-023` nutrient loops som sekundærspor | Bekreftet at NO ikke har nasjonal realisert aggregat for fiskeslam; SINTEF 89 %-restråstoff er **biprodukt, ikke slam**. | Styrk forbehold: ikke bruk restråstoff-utnyttelse (89 %) som bevis for næringsgjenvinning fra slam. |
| `CL-C-002` offentlig innkjøp | Norsk øko-andel: Oslo målt 2,5 % (2018), 50 %-mål fjernet 2023; metrikk forlatt til fordel for kjøttreduksjon/svinn/plantebasert. | Behold `krever-bekreftelse` for effekt. Legg til at NO har **byttet styringsmål** bort fra øko-andel — København-sammenligning må ramme dette, ikke fremstille som norsk «underprestasjon». |
| `CL-C-017` Danmark Green Tripartite | CO2e-avgift verifisert **ikke vedtatt lov** per 16.06.2026 — fortsatt politisk aftale; sats 300→750 DKK/t (60 % bunnfradrag → effektivt 120/300), start 2030; ingen lovpålagt buskapsreduksjon. | Behold `klar-med-forbehold`. Skjerp «Ikke si»: «Danmark *har* en CO2-avgift på landbruk» (den er *avtalt*, virkning 2030); «Danmark har vedtatt buskapsreduksjon». |

---

## 4. Tre narrativtråder for whitepaper/deck

Disse er de strategisk skarpeste resultatene av runden. Hver står på verifiserte data + trygg formulering.

### Tråd 1 — Potensial-vs-realisert-gapet ER næringshistorien
**Data:** RecoLab realiserte 2024 ~1,1 kg produkt/innbygger-ekvivalent (497 kg struvitt + 629 kg amm.sulfat totalt); NO samler ~2 % av ekskret som slam; ingen nasjonal realisert aggregat. Mineral-N-forbruket er samtidig stort (NO 91 646 t).
**Trygg formulering:** «Det tekniske potensialet for næringsgjenvinning er stort, men *realisert* gjenvinning er i dag minimal — gapet mellom potensial og praksis er selve mulighetsrommet.»
**Ikke si:** at nordisk sirkulær næringsgjenvinning «skjer» i skala; at RecoLab gjenvinner store tonn.

### Tråd 2 — Norge har byttet styringsmål for offentlig innkjøp
**Data:** Oslo målt 2,5 % øko (2018) mot 50 %-mål som ble fjernet i matplanen 2023; nye delmål = kjøttreduksjon, plantebasert, matsvinn. København ~90 % øko via menyomlegging/kjøkkenfag, ikke paragrafer.
**Trygg formulering:** «København er en mekanisme-benchmark (kjøkkenfag + menyomlegging), men Norge har bevisst flyttet styringsmålet fra øko-andel til kjøttreduksjon/svinn — så sammenligningen handler om *virkemiddelvalg*, ikke om at Norge ‘ligger bak’.»
**Ikke si:** at Norge «underpresterer» på øko; at øko-andel er det relevante norske målet i dag.
**Konvergens:** dette bekrefter FORST-R2-05 (gevinsten ligger i svinn/utnyttelse/plantebasert, ikke sertifiseringsandel).

### Tråd 3 — Nederlandsk «sirkularitet» hviler på lineær gjennomstrømning
**Data:** glastuinbouw 2024 ~95 PJ, gass-WKK på 60–65 % av areal, netto strømeksportør, fornybar kun 15,1 % (under NL-snitt 19,8 %), ekstern CO2-kjøp +12 %.
**Trygg formulering:** «Nederlandsk veksthus er en høyeffektiv gass-/WKK-gjennomstrømningsmodell som først nå dekarboniserer via geotermi — og som da får en *ny* avhengighet: hvor kommer CO2 til fotosyntesen fra? Lær mekanismen (klyngekobling varme/CO2/reststrøm), ikke kopier modellen.»
**Ikke si:** at NL er en sirkulær idyll/nordisk mal; WUR/Moerman som effektbevis.
**Konvergens:** bekrefter FORST-R2-06.

---

## 5. Oppdatert «ikke si»-liste (post-uttrekk)

- «Norge importerer bare brasiliansk soya» → også US/CA/PL (SSB/Felleskjøpet).
- «Brasil-andelen falt i 2025» som faktum → 2025 er foreløpig (revisjonsstøy til mai 2027); selskapskilder (Denofa, Felleskjøpet) viser ingen Brasil-exit (jf. R3-04 / Runde 3-delta).
- «RecoLab/nordisk næringsgjenvinning skjer i skala» → realisert er minimalt (kg, ikke tonn).
- «SINTEF 89 % viser næringsgjenvinning fra slam» → det er restråstoff/biprodukt, ikke slam.
- «Danmark har en CO2-avgift på landbruk (nå)» → avtalt, ikke vedtatt lov; virkning 2030.
- «Danmark har vedtatt nasjonal buskapsreduksjon» → nei.
- «Norge ligger bak på øko-innkjøp» → Norge har forlatt øko-andel som styringsmål.
- «Nederlandsk veksthus er en sirkulær mal» / «WUR-score beviser effekt» → benchmark/mekanisme, ikke bevis.
- «70 % av fôret går i fjorden» / «biogass = næringssirkularitet» / «gjenvunnet næring kan erstatte all virgin mineral-N» (uendret fra mottak).

---

## 6. Gjenstår (staged) + kildeankre

**Gjenstår (lav-yield):**
- **Island-gjødsel N/P/K 2024** — POST-blokkert (PxWeb GET-only). Ferdig POST-spørring + tabell `LAN10001.px` ligger i `STATBANK-dk-island-gjodsel-2026-06-16.md`. Krever POST-kapabel kjøring.
- **Nordiske digestat-/næringsretur-volum** — kun Sverige har god dekning (Avfall Sverige); DK/FI/NO/IS har energitall, ikke næringsretur. Bør hentes per land-statistikkbyrå.
- **HS6-full-sum / NOK→USD** for Norge–Brasil (valgfri presisjon).

**Kildeankre (ekte URL-er for §3-radene):**
- SSB tabell 08801 — `https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801`
- Denofa bærekraft — `https://www.denofa.no/en/sustainability/`
- Felleskjøpet Agri årsrapport 2025 — `https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2025-2.pdf`
- SINTEF marint restråstoff 2020 — `https://www.sintef.no/contentassets/6b30fa1babed4d6eba0e243e08192d08/rapport_-analyse-marint-restrastoff-2020.pdf`
- Danmarks Statistik `GOEDSALG` — `https://api.statbank.dk/v1/` (tabell GOEDSALG)
- WUR Energiemonitor glastuinbouw 2024 (Rapport 2025-150) — `https://edepot.wur.nl/702373`
- Mattilsynet fiskeslam — `https://www.mattilsynet.no/planter-og-dyrking/gjodsel-jord-og-dyrkingsmedier/bruk-av-fiskeslam-i-gjodselvarer`
- DK CO2e-avgift / Green Tripartite, Oslo øko-innkjøp, NSVA Miljörapport 2024: eksakte URL-er i de respektive uttrekksfilene.

---

## 7. Anbefalt rekkefølge videre

1. **Godkjenn §3-radene** du vil ha inn → importer til `food-tg-claim-lock-table-2026-05.md` (jeg kan gjøre redigeringen på din kommando).
2. **Bruk §4-trådene** som ramme i deck/whitepaper — de er det skarpeste utbyttet av runden.
3. **La §6-stragglerne ligge** til noen faktisk trenger Island-verdiene eller digestatvolum (lav prioritet).
4. **Gate fortsatt ekstern utvidelse** på uke25-minimumsvedtaket (uendret).

---

*Ingen kontrollfiler er mutert i denne konsolideringen. §3 er staged forslag. Råuttrekkene og indeksen ligger i `research/external/r2/`.*
