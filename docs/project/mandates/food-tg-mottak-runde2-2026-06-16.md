---
tittel: Food TG — Mottak av Deep Research runde 2 (16.06.2026)
status: Mottaks-/valideringsnotat (intern)
eier: Gabriel
dato: 2026-06-16
scope: Validering og importbeslutning for de 12 Deep Research-rapportene i mappa «Food Transition Research 16.06.26» — 6 datasøk + 6 forståelse, kjørt på prompt-packen food-tg-deep-research-prompter-KLARE-2026-06-16.md.
bruksregel: >
  Ingen claim er løftet til ekstern faktastemme av dette notatet. Datasøk-funn merket «deckklart internt» kan brukes i intern deck/notat MED forbehold; alt annet krever den angitte primæruttrekks-/kontrollhandlingen først. Forståelses-rapportene (19–24) er bakgrunn/orientering — ikke kilde, ikke claim-lock, ikke deck-fakta. Kildene i rapportene bærer ekte URL-er (SSB, SINTEF, Mattilsynet, NIBIO, CBS, Danmarks Statistik osv.); «citeturn…»-merkene er ChatGPTs interne søkereferanser og må erstattes med de faktiske URL-ene ved import.
relaterte_filer:
  - docs/project/mandates/food-tg-deep-research-prompter-KLARE-2026-06-16.md
  - docs/project/mandates/food-tg-research-runde2-promptpack-2026-06-16.md
  - docs/project/analysis/food-tg-vurdering-mote11-vs-uke25-2026-06-16.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
---

# Mottak — Deep Research runde 2

## 1. Sammendrag

Mappa inneholder **12 rapporter** = nøyaktig prompt-packen fra 16.06: **6 datasøk** (rapport 13–18) og **6 forståelse** (19–24), ett par per felt.

**Samlet kvalitetsdom: sterk runde.** Verktøyet gjorde det promptene ba om — primærkilde-først, eksplisitte negative funn, riktig selvklassifisering med statusord, og det respekterte guardrailene (Wageningen/Moerman brukes *ikke* som bevis i Nederland-rapporten; «70 % av fôret i fjorden» avvises som etablert faktum; benchmark holdes som benchmark). Rapportene er ærlige på egne hull i stedet for å pynte.

**Den ene gjennomgående begrensningen:** flere datasøk fant den *autoritative kilden* (SSB-tabell, Danmarks Statistik StatBank, PxWeb) men fullførte ikke *uttrekket* i sesjonen — så de leverer et **v0.1-datagrunnlag** der de sterkeste cellene er fylt og resten er presist merket «needs-data / finn primær». Runden konverterer altså feltene fra «udekket» til «vi vet nøyaktig hvilken tabell/API som lukker hullet, og vi har de robuste tallene allerede». Det er høy verdi, men betyr at **citerbar ekstern bruk krever én smal primæruttrekks-runde til** per case.

**Hva som er nær deckklart internt allerede (med forbehold):**

- Aktør- og restråstofflaget i Norge–Brasil (Denofa, Felleskjøpet, SINTEF/FHF-tap).
- Næringstap fra havbruk + det norske gjødsel-regelverket for fiskeslam (Mattilsynet).
- Mineralgjødselforbruk i Norden + energi/gass-intensiteten i Haber-Bosch + gjødselregelverkets >2 mm-grenser.
- Dansk skala + Green Tripartite-styringslogikken (benchmark).
- Københavns innkjøp som **mekanisme**-benchmark.
- Nederlandsk sidestrøm-mekanikk (benchmark).

**Hva som IKKE er klart (gjennomgående):** realiserte årlige tonn (gjenvunnet N/P/K, slambruk, digestat), full tidsserie på handelstallene, og den norske motparten for offentlig innkjøp (Oslo-andel). Disse er presist identifisert, ikke diffuse.

---

## 2. Kvalitetsvurdering av runden

**Styrker:**
1. **Riktig epistemikk.** Hvert datapunkt har år, enhet, geografi, metode, kilde og datakvalitet (observert/estimert/modellert). Skiller fakta/inferens/sekundær/ikke funnet/motbevist konsekvent.
2. **Negative funn rapporteres** i stedet for å fylles med synsing — f.eks. «ingen offentlig primærkilde kobler soya-inn og bacalhau-ut i samme analyse», «ingen nordisk kommersiell blackwater→hydroponi-case», «ingen verifisert Oslo-andel».
3. **Guardrails holdt:** Wageningen/Moerman ikke brukt som bevis (18); «70 % i fjorden» avvist (14); benchmark holdt som benchmark (16, 17, 18); Valio/Arla «soyafri ≠ importfri» respektert (16).
4. **Avviksdisiplin:** rapport 13 fant selv et ~19 % volumavvik mellom reporter- og speiltall (Comtrade) og flagget at SSB-vs-Comtrade-kontrollen må kjøres.

**Svakheter / felles begrensning:**
1. **Sekundær vei til primærkilde:** handelstallene i 13 er trukket fra WITS (gjenbruker Comtrade) og er merket «sekundær — finn primær». Riktig merket, men ikke citerbart før SSB 08801 hentes direkte.
2. **Uttrekk ikke fullført i sesjon:** «ikke funnet i denne sesjonen» går igjen (full årsserie 13; DK P/K 2023/24 og Island 15; Oslo-andel 17). Dette er *uttrekksarbeid*, ikke kunnskapshull.
3. **`citeturn…`-merkene** er ChatGPTs interne referanser; de faktiske URL-ene står i kildekolonnene og må kopieres inn ved import.

**Konklusjon:** dette er nøyaktig den kvaliteten kontrollstacken er bygget for å ta imot. Ingen rapport overselger. Runden flytter alle seks feltene fra «udekket» til «v0.1 med kjent lukkings-sti».

---

## 3. Mottaksrad per datasøk-rapport (13–18)

| # | Felt | Kort dom / status | Sterkeste (deckklar) funn | Svakeste / hull | Importbeslutning |
|---|---|---|---|---|---|
| **13** | Norge–Brasil soya/bacalhau | **needs-primary-check** (v0.1) | Denofa importerer ~450 000 t soya/år, hovedlev. AMAGGI Brasil; Felleskjøpet soyaandel 6,3 % (2025), opprinnelse BR/US/CA/PL; SINTEF 54 000 t rygger/avskjær (2020); FHF salt-gjenbruk 40 % / 45–48 MNOK. Brasil-andel soya ~64–80 %. | Handelstall via WITS (sekundær); full 2015–24-serie HS 2304/0305 mangler; SSB-vs-Comtrade ikke fullført (19 % volumavvik 2024). | Aktør- + restråstoff-rader → **deckklart internt**. Handelsrader → **trendindikasjon**; hent SSB 08801 før citerbar bruk. |
| **14** | Nutrient loops (oppdrett/avløp) | **delt: deckklart + needs-data** | SINTEF 66 400 t N / 14 000 t P (2019); HI/TEOTIL oppløst 51,5 kt N / 6,845 kt P (2018); ~2 % av ekskret samles som slam i dag; RecoLab i drift (2 000 pe), 27 % TP / 2,5 % TN realisert gjenvinning; **Mattilsynet-regelverket** (marint slam krever tillatelse, ikke CE-merkbart, ikke økologisk). | Ingen nasjonal realisert slambruk i tonn; ingen nordisk kommersiell blackwater→hydroponi-case. | Regelverk + SINTEF/HI-tall + RecoLab-prosesstall → **deckklart internt**. Realiserte årstonn → **needs-data**. |
| **15** | Mineralgjødsel/Yara/biogass | **deckklart (forbruk/energi/regelverk) + needs-data (digestat)** | NO N 91 646 t, SE 219 100 t, DK 238 846 t; Haber-Bosch 34–39 GJ/t N; SE biogjødsel 1 200 t P / 3 700 t K / 6 200 t NH4-N = 8,5 %/13 % av mineral; NO org. avfall-N ~7 000 t ≈ 7,8 %. EU/NO >2 mm-grenser; ingen <2 mm-mikroplastgrense. | Digestatvolum/realisert næringsretur mangler (DK/FI/NO/IS); DK P/K 2023/24 og Island ikke uttrukket. | Forbruk + Haber-Bosch + regelverk → **deckklart internt**. Digestat/næringsretur → **needs-data**. |
| **16** | Danmark animalsk (benchmark) | **benchmark-only** | 12,3 mill. svin (jan 2026); 548 000 melkekyr (des 2025); Green Tripartite-styringsstabel; Arla fôr/soya-policy; husdyrgjødsel→biogass. | CO2e-avgift må re-sjekkes mot vedtatt lov etter juni 2026; ingen lovpålagt nasjonal buskapsreduksjon. | **benchmark-only**; bruk med overførbarhetsmerknad. Re-sjekk avgift-status før bruk. |
| **17** | Offentlig innkjøp (DK/Kbh) | **benchmark (mekanisme) + needs-data (NO)** | København sterk som *mekanisme*: innkjøpsdesign + kjøkkenomlegging + meny/sesong + svinn + rapportering + ~12 MDKK/år rådgivning — ikke anbudsparagrafer alene. | Ingen verifisert Oslo by-andel (needs-data); eksakte DST-tabell-ID-er (needs-primary-check). | Mekanisme-rader → **deckklart internt (benchmark)**. Norsk motpart → **needs-data**. |
| **18** | Nederland (benchmark) | **benchmark-only** (Wageningen-guardrail holdt) | Kringlooplandbouw (styringsramme), glastuinbouw (infrastruktur), nitrogenregime (endringspress); PeelPioneers 50 000 kg sitrusskall/dag; Revyve; ChainCraft (watchlist). | Ingen nasjonal åpen oversikt over valoriserings-tonn; energimiks i glastuinbouw fragmentert. | **benchmark-only**; lær mekanisme, ikke kopier. WUR/Moerman ikke som bevis. |

---

## 4. Forståelse-rapportene (19–24) — bakgrunn, ikke faktastemme

Disse er **orientering**. De skal lagres som bakgrunn, merkes `forståelse — ikke faktastemme`, og **ikke** importeres til claim-lock/casestatus/deck som fakta. De er gode (strukturerte, ærlige, med [etablert]/[omstridt]/[anekdotisk]). De mest verdifulle provokasjonene — verdt å ta med i strategi/whitepaper-tenkning, ikke som claims:

- **(19) Norge–Brasil:** problemet heter kanskje «importert protein- og næringsstoffarkitektur» mer enn «soya»; «avskogingsfri» er ikke det samme som endret landskapseffekt; sjømat-som-beredskap krever regional foredling + faktisk adopsjon i kostholdet, ikke bare eksportvolum.
- **(20) Nutrient loops:** for Norden kan **avkoblede systemer** (fangst/foredling på én side, bruk i modne veksthus på den andre) være mer realistisk skaleringsvei enn akvaponikk; **urin/tidlig kildeseparasjon** ser mer lovende ut enn «smart sluttbehandling».
- **(21) Mineralgjødsel:** vi overvurderer trolig hvor langt lavt-prosesserte produkter kan erstatte mineral-N (NPK-ubalanse er mer grunnleggende enn debatten antar); havbruksslam kan endre det norske **fosfor**-bildet hvis oppsamling/tillatelser strammes; «rent nok vs. umulig» er feil binær — risiko varierer med råvare/prosess/bruk.
- **(22) Danmark:** «nedskalering» blir trolig mer geografisk/driftsmessig sortering enn redusert nasjonal produksjon; biogass-sporet er ikke så klimamessig «løst» som fortellingen vil ha det; nitrogenmålet kan fortsatt flytte seg under gjennomføring.
- **(23) Offentlig innkjøp:** «lokalmat» bærer mindre juridisk enn antatt — sesong/sortiment/delkontrakter/logistikk gjør jobben; effekten ligger i **kjøkkenfag og arbeidsorganisering**, ikke i anbudsparagrafene; de store sirkulær-gevinstene er svinn/utnyttelse/holdbarhet/plantebasert, ikke profilprodukter.
- **(24) Nederland:** mye nederlandsk «sirkularitet» bæres fortsatt av lineær, importtung throughput; nitrogenkrisen er også en tetthets-/areal-/naturrettskrise (ikke bare teknologi); **CO2-forsyning** til veksthus blir kritisk når fossil forbrenning fases ut.

---

## 5. Klar-til-import-rader (forslag — ikke utført)

Disse kan stages inn i kontrollstacken **når du vil** (jeg har ikke endret kontrollfiler). Hver bør få ekte URL (erstatte `citeturn…`) og DRO-R2-ID i mottaksloggen.

**Til claim-lock som `deckklart internt` (med forbehold):**
- Denofa ~450 000 t soya/år, hovedleverandør AMAGGI Brasil. (kilde: Denofa bærekraftside)
- Felleskjøpet soyaandel i ordinært kraftfôr 6,3 % (2025); opprinnelse BR/US/CA/PL. (Felleskjøpet årsrapport 2025)
- SINTEF: ~54 000 t rygger/avskjær fra saltfisk/klippfisk/filet (2020, modellert).
- Havbruk næringstap: 66 400 t N / 14 000 t P (SINTEF 2019, estimert) — **egen rad, ikke bland med** TEOTIL oppløst 51,5 kt N / 6,845 kt P (2018, modellert).
- Mattilsynet-regelverket for fiskeslam (marint krever tillatelse; ikke CE-merkbart; ikke i økologisk).
- Mineralgjødsel-N: NO 91 646 t (2023/24), SE 219 100 t (2024/25), DK 238 846 t (2021/22).
- Haber-Bosch energiintensitet 34–39 GJ/t N (IEA/JRC).
- EU/NO gjødselgrense >2 mm urenheter (3/5 g/kg TS; plast 2,5 g/kg fra 2026); **ingen <2 mm-mikroplastgrense** (motbevist vanlig antagelse).
- Danmark: 12,3 mill. svin (jan 2026), 548 000 melkekyr (des 2025) — benchmark.

**Til PCQ (primary-check queue) / needs-data:**
- SSB 08801 full HS 1201/2304/0305-serie 2015–2025, Brasil + verden (lukker 13).
- SSB-vs-Comtrade-kontroll på samme kode/år (13).
- Realisert nasjonal slambruk i tonn etter sluttbruk (14).
- RecoLab realiserte årstonn N/P/K (14).
- DK GOEDSALG P/K 2023/24; Island N/P/K siste år; nordisk digestatvolum/næringsretur (15).
- Oslo by-andel økologisk i offentlige måltider 2022–2025 (17).

**Til «ikke si»-listen (på tvers av runden):**
- «Norge importerer bare brasiliansk soya» (også US/CA/PL).
- «70 % av fôret går i fjorden» som etablert faktum.
- «Biogass = næringssirkularitet» (uten dokumentert næringsretur er det energiutnyttelse).
- «Gjenvunnet næring kan erstatte all virgin mineralgjødsel i Norden.»
- «København bevist at innkjøpsparagrafer alene gir 90 % økologisk.»
- «EU/EØS lar norske innkjøpere kreve lokalmat.»
- «Danmark har lovpålagt nasjonal buskapsreduksjon» / «CO2e-avgiften er i kraft nå» (re-sjekk).
- «WUR/Moerman beviser effekt/pilotmodenhet.»

---

## 6. Anbefalte neste handlinger

| # | Handling | Hvorfor | Status etter |
|---|---|---|---|
| 1 | **Arkivér de 12 rapportene** i repoet som `research/external/r2/deep-research-r2-<felt>-2026-06-16.md` og gi DRO-R2-ID-er i mottaksloggen. | Får dem ut av Downloads og inn i kontroll-sporet. | sporbart |
| 2 | **Erstatt `citeturn…`** med de faktiske kilde-URL-ene (de står i kildekolonnene) for radene du vil bruke. | Gjør radene revisjonsbare. | citerbart-klart |
| 3 | **Kjør de 6 smale primæruttrekkene** (SSB 08801; DK GOEDSALG; Oslo UKE; realiserte digestat-/slam-/RecoLab-tonn). | Lukker de gjennomgående «needs-data»-hullene; løfter v0.1 → deckklart. | deckklart internt |
| 4 | **Importer deckklar-radene** (§5) til claim-lock med forbehold; hold benchmark som benchmark. | Gir deck/whitepaper trygt materiale. | intern bruk |
| 5 | **Behold forståelse (19–24) som bakgrunn**; trekk provokasjonene inn i strategi-/whitepaper-tenkning, ikke som claims. | Hindrer at orientering lekker inn som faktastemme. | bakgrunn |
| 6 | **Gate fortsatt på uke25-minimumsvedtaket** før dette utvider scope eksternt. | Runde 2 var bevisst en utvidelse — den skal være et vedtak, ikke drift. | forankret |

---

## 7. Hva runden betyr for prosjektet (kort)

To strategiske signaler, utover selve dataene:

For det første **styrker runden B-sporet (sidestrøm/næring) med et nøkternt, forsvarlig hovedbudskap:** virgin mineral-**N** er vanskeligst å erstatte; **P/K** er mer lovende; de bindende skrankene er **kvalitet (mikroplast), datastandarder, logistikk og regelverk** — ikke fravær av næringsstoffer. Det er et skarpere, mer troverdig narrativ enn «sirkulær mat løser gjødsel».

For det andre **bekrefter benchmark-casene (DK, NL, København) verdien av «lær mekanismen, ikke kopier modellen»** — og de tre forståelse-provokasjonene (avkoblede nutrient-systemer > akvaponikk; innkjøp = kjøkkenfag > paragrafer; nederlandsk «sirkularitet» hviler på throughput) er de mest verdifulle styringsinnsiktene i hele runden. De hører hjemme i hvordan vi *rammer* casene, ikke i tallene.

---

*Ingen kontrollfiler er endret i denne mottaken. Neste steg er §6 #1–#3: arkivér, erstatt cite-merker, kjør de seks smale primæruttrekkene.*
