---
tittel: Food TG AP-6 — Havbrukskonsentrasjon og restråstoff-tilgang: funn 2026-06-14
status: Internt analysefunn (første kjøring; fan-out-subagent + coordinator-verifikasjon)
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-6 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: Fiskeridirektoratet Akvakulturregister (åpen pub-aqua CSV-dump, pr. 15.06.2026); committet aquaculture_sites.geojson (lokalitets-univers)
bruksregel: Internt analysefunn. «Konsentrasjon» = strukturell markeds-/kapasitetsposisjon, ikke intensjon. Tre nivåer holdes strengt atskilt: lokalitet ≠ biomasse (MTB) ≠ restråstoffvolum. Restråstoff-koblingen er strukturell posisjon, ikke målt strøm. Går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md
  - scripts/import-akvakulturregister.ts
  - public/data/food-systems/no/aquaculture_sites.geojson
  - docs/project/figures/food-tg-2026-06-15/fig-ap6-havbruk-konsentrasjon.svg
---

# AP-6 — Havbrukskonsentrasjon og restråstoff-tilgang

## 1. Kort funn

Konsentrasjonen i norsk laks-/ørretoppdrett er **klart høyere for faktisk sjøbasert produksjon enn et rått totaltall antyder** — og den forskjellen er selve funnet. Fire konsern (Mowi, SalMar, Lerøy, Cermaq) kontrollerer **~57 % av sjøbasert MTB (CR4 57 %, HHI ~929)**, mens samme tall over *alle* kommersielle matfisk-tillatelser (inkl. store land-RAS/offshore-utviklingstillatelser) faller til **HHI ~510**. De nye land-/offshore-tillatelsene med høy nominell MTB men én lokalitet fortynner totaltallet og **maskerer** at den produksjonen som faktisk genererer marint restråstoff i dag er vesentlig mer konsentrert. En analyse på rå total-MTB ville underdrevet konsentrasjonen i nettopp det leddet anker 2 (restråstoff) handler om.

## 2. Tall

**Lokalitetskonsentrasjon** (konsern-nivå, 1020 distinkte laks/ørret-matfisk-lokaliteter):

| Konsern | Lokaliteter | Andel |
|---|---:|---:|
| Mowi | 159 | 15,6 % |
| SalMar | 129 | 12,6 % |
| Lerøy (Austevoll) | 106 | 10,4 % |
| Cermaq (Mitsubishi) | 76 | 7,5 % |
| Nordlaks | 39 | 3,8 % |
| Nova Sea | 31 | 3,0 % |

CR3 38,6 %, CR5 49,9 %, lokalitets-HHI ~712.

**MTB-konsentrasjon (maksimalt tillatt biomasse), sjø/hav-basert** (ekskl. land-RAS; total 931 569 tonn, n=92):

| Konsern | MTB (tonn) | Andel |
|---|---:|---:|
| Mowi | 184 657 | 19,8 % |
| SalMar | 150 150 | 16,1 % |
| Lerøy | 107 288 | 11,5 % |
| Cermaq | 88 753 | 9,5 % |
| Nordlaks | 34 962 | 3,8 % |
| Nova Sea | 27 401 | 2,9 % |

CR3 47,5 %, CR4 57,0 %, CR5 60,7 %, CR10 70,6 %, **HHI ~929**.

**Land-RAS-effekten:** Over *alle* kommersielle matfisk-tillatelser (inkl. land/offshore; total MTB 1 336 016 tonn, n=140) faller HHI til ~510 og CR3 til 33,8 %. Store enkelttillatelser (Ecofisk 40 000, Bue Salmon 33 900, ABP Aqua Mongstad 29 135, Viking Aqua 27 400 m.fl.) — høy nominell MTB, ofte 1 lokalitet, ennå ikke i drift — fortynner de etablerte aktørenes andel i totaltallet.

Metode: dedup på tillatelsesnummer; filter kommersiell + art ∈ {laks, regnbueørret, ørret} + produksjonsform «MATFISK»; MTB = sum tillatelseskapasitet (ikke lokalitetskapasitet, som deles på tvers og ville dobbeltelt); konsern-rollup på innehavernavn. HHI = Σ(andel%)².

Figur: `docs/project/figures/food-tg-2026-06-15/fig-ap6-havbruk-konsentrasjon.svg` (sjøbasert MTB-andeler per konsern + sjøbasert HHI ~929 vs total-MTB HHI ~510 land-RAS-fortynning).

## 3. Restråstoff-implikasjon (anker 2 — strukturell, ikke målt)

Holdt strengt atskilt fra tallnivåene over: volum av marint restråstoff fra oppdrett (slakteavskjær, dødfisk/ensilasje, slam) skaleres med **biomasse**, ikke med antall lokaliteter. Derfor er MTB-konsentrasjonen (sjøbasert CR4 57 %, HHI ~929) det rette utgangspunktet for «hvem genererer restråstoff-strømmene». De fire store er også vertikalt integrert nedstrøms (egne slakterier/bearbeiding), noe som **strukturelt posisjonerer dem til å internalisere eller styre tilgangen til eget restråstoff** før det når et åpent annenhåndsmarked. Dette er en posisjons-/mulighetspåstand — vi har **ikke** data på faktiske restråstoff-volumer per aktør eller fordeling intern oppgradering vs. eksternt salg. Koblingen «MTB-konsentrasjon → restråstoff-kontroll» krever RUBIN/SINTEF/Fiskeridirektoratet-restråstoffstatistikk for å tallfestes → `needs-data`.

## 4. Tolkning — består lakmustesten?

Ja. Det opplagte er «tre–fire store dominerer». Det ikke-opplagte er **nivå-divergensen og land-RAS-effekten**: lokalitets-HHI (712) > total-MTB-HHI (510) betyr at de største har færre, men større tillatelser per lokalitet enn snittet; samtidig er sjøbasert MTB (HHI 929) langt mer konsentrert enn total-MTB (510), fordi nye land-/offshore-tillatelser fortynner totaltallet. Den som rapporterer «havbruks-HHI» uten å skille sjø fra land vil systematisk **underdrive** konsentrasjonen i den produksjonen som faktisk finnes og genererer restråstoff i dag.

## 5. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP6-001 (utkast) |
| Påstand | I norsk laks-/ørretoppdrett kontrollerer fire konsern (Mowi, SalMar, Lerøy, Cermaq) ca. 57 % av sjøbasert MTB (HHI ~930; Akvakulturregisteret 15.06.2026). Konsentrasjonen er klart høyere for sjøbasert produksjon enn for total tildelt MTB (HHI ~510), fordi store land-/offshore-utviklingstillatelser fortynner totaltallet. Siden restråstoffvolum skalerer med biomasse, posisjonerer dette de fire strukturelt mht. tilgang til marine restråstoff-strømmer. |
| Evidens | Fiskeridirektoratet Akvakulturregister (åpen pub-aqua CSV, 15.06.2026); 92 sjøbaserte innehavere, MTB = sum tillatelseskapasitet; HHI/CR enhetsregnet i scratch. Samme kanoniske kilde som `scripts/import-akvakulturregister.ts`. |
| Dekning | Sjøbasert matfisk laks/ørret, n=92 innehavere (konsern-rollup). Total-MTB-brakett n=140. |
| Risiko | MTB ≠ faktisk slaktevolum (kapasitetstak); konsern-rollup på navn må stikkprøves; HHI på tildelt MTB, ikke markedsandel av slaktet volum. |
| Stoppspråk | Ikke konflater lokalitet/MTB/restråstoffvolum. Ikke sammenlign denne HHI direkte mot AP-2s node-HHI (ulike størrelser). Restråstoff-kontroll er strukturell posisjon, ikke målt strøm eller intensjon. |
| Status | `intern baseline` — ikke ekstern faktastemme før konsern-rollup stikkprøves mot Brønnøysund/Aksjonærregister og restråstoffvolum hentes (RUBIN/SINTEF). |

## 6. Forbehold og needs-data

- **Committet geojson mangler operatørfelt** — den gir lokalitets-univers men ikke operatørkonsentrasjon; MTB/operatør-mapping krever Akvakulturregisteret.
- **MTB ≠ faktisk produksjon** (kapasitetstak, ikke realisert/slaktet biomasse). Faktisk slaktevolum kan endre rangeringen marginalt.
- **Konsern-rollup** på innehavernavn (SalMar inkl. tidl. NTS/SalmoNor, konsolidert under SALMAR OPPDRETT AS) bør stikkprøves mot Brønnøysund ved ekstern bruk.
- **Restråstoffvolum per aktør = `needs-data`** (RUBIN/SINTEF/Fiskeridirektoratet restråstoffstatistikk).

## 6b. Restråstoff — kvantifisert (åpen-data-oppdatering 2026-06-15, Strøm E)

Restråstoff-koblingen (§3) sto som ren `needs-data`. Åpen-data-research mot navngitte primærkilder lar den nå **delvis tallfestes** — den nasjonale/akvakultur-volummengden er publisert, men ikke en per-aktør-split. Status hevet fra `needs-data` til **citable m/forbehold (delvis)**.

**Volumer (SINTEF Ocean + Kontali, «Analyse marint restråstoff» — serien som overtok RUBINs varestrømanalyse etter at RUBIN ble avviklet 2012, FHF-finansiert):**

- Nasjonalt totalt marint restråstoff: **~1,13 mill. tonn (2022)**, ~87 % utnyttet; ~1,1 mill. tonn (2024), ~89 % utnyttet.
- **Akvakultur (laks/ørret) 2022: ~546 000 tonn restråstoff, 94 % utnyttet — ~48 % av nasjonalt totalt** (SINTEF 2022, Tabell 5-4; kilder Fiskeridir./SSB/Sjømatrådet/Kontali). Oppstår 43 % på slakteri, 33 % i videreforedling, **25 % som dødfisk på matfiskanlegg** → skalerer mekanisk med slaktet biomasse.

**Internalisering (strukturell, kildebelagt — Konkurransetilsynet, fusjonssak Pelagia/Hordafor 2021_0221):** SINTEF (§5.10) sier eksplisitt at i oppdrett er «restråstoffprosessering ofte en del av samme selskapsstruktur». Konkrete eksempler: **NutriMar** (Kverva/SalMar-sfæren) prosesserer SalMars avskjær ved siden av InnovaMar på Frøya; **Hordafor** (største ensilasje-prosessor) var deleid 50 % av Pelagia (= Austevoll/Lerøy + Kverva/SalMar). Et reelt, men **konsentrert** annenhåndsmarked finnes ved siden av (Scanbio, Biomega, Hofseth BioMarine).

**Inferens (flagget som inferens, ikke kildebelagt tall):** siden restråstoff skalerer med biomasse, genererer de fire største MTB-aktørene (CR4 ~57 % sjøbasert MTB) etter konstruksjon en tilsvarende majoritet av lakse-restråstoffet; og prosesseringen er tungt internalisert/eid av de samme aktørene. **Forblir needs-data:** restråstoff-tonnasje *per selskap* (SINTEF avstår eksplisitt; ikke i åpen kilde).

**Stoppspråk:** Ikke konverter CR4 (MTB) til en kildebelagt restråstoff-CR4 — «etter konstruksjon … majoritet» er en flagget inferens. Hold lokalitet ≠ MTB ≠ restråstoffvolum atskilt. Torskeoppdrett (~1100 t) er neglisjerbart — ikke bland inn.

**Kilder (§6b):** SINTEF Ocean/Kontali «Analyse marint restråstoff 2022» (rapport 2023:01209, Tabell 5-4 + §5.10) — <https://www.sintef.no/contentassets/f87ee6b4a78846888459395cc020262e/analyse-marint-restrastoff-2022.pdf>; SINTEF «…2024» (nasjonalt ~1,1 Mt, 89 %); Konkurransetilsynet fusjonssak Pelagia/Hordafor 2021_0221 — <https://konkurransetilsynet.no/wp-content/uploads/2021/04/2021_0221-1-OFF-Pelagia-AS-Hordafor-AS.pdf>; RUBIN-lineage bekreftet (avviklet 2012 → FHF/SINTEF).

## 7. Verifikasjon

Tall er regnet fra Fiskeridirektoratets åpne Akvakulturregister-dump (15.06.2026) — prosjektets kanoniske akvakulturkilde (`scripts/import-akvakulturregister.ts` henter fra samme pub-aqua-API). CR/HHI-aritmetikken er internt konsistent (Mowi 19,8 + SalMar 16,1 + Lerøy 11,5 + Cermaq 9,5 = 56,9 ≈ CR4 57 %). Restråstoff-volumene (§6b) er fra SINTEF/Kontali-serien (åpen, primær); per-aktør-split forblir `needs-data`. Ingen committet datafil endret under analysen; ingen påstand løftet til ekstern bruk uten forbehold.

## 8. Kilder

- Fiskeridirektoratet, Akvakulturregisteret — <https://www.fiskeridir.no/registre/akvakulturregisteret> (registerbeskrivelse + API/dump).
- Åpen dump (CSV): `https://api.fiskeridir.no/pub-aqua/api/v1/dump/new-legacy-csv-file` (innehaver-orgnr/navn, art, tillatelseskapasitet, lokalitet; pr. 15.06.2026).
- `scripts/import-akvakulturregister.ts` — bekrefter kanonisk kilde (`openLegalEntityNr`).
- `public/data/food-systems/no/aquaculture_sites.geojson` — lokalitets-univers (uten operatørfelt).
- `needs-data`: RUBIN/SINTEF restråstoffstatistikk for faktiske volumer per aktør.
