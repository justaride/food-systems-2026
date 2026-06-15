---
tittel: Desk-research-logg DRO-0906 — gjennomføring av kø-punkt 1–9
status: Intern arbeidslogg
eier: Gabriel
dato: 2026-06-12
scope: Resultater fra desk-research-køen i drr-0906-innholdsanalyse-2026-06-12.md kap. 4, utført 12.06 uten aktørkontakt. Alle uttrekk er fra offentlige API-er/dokumenter med locator.
bruksregel: Tallene her er kontrollerte uttrekk fra navngitte offentlige kilder, men er IKKE løftet inn i PCQ, source-shortlist eller claim-lock ennå. Statusendringer foreslått i kap. 11 gjennomføres som kontrollert oppdatering per mottaksprotokollen før tallene brukes i deck/faktastemme.
relaterte_filer:
  - docs/project/analysis/drr-0906-innholdsanalyse-2026-06-12.md
  - docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md
  - docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md
  - research/external/dro-0906/README.md
---

# Desk-research-logg DRO-0906, 12.06.2026

## 1. DR-1 Statistics Iceland (100% Fish) — delvis, blokkert på POST

**Sikret:** Full tabellstruktur for SJA09114 via API-metadata (GET): 33 arter (inkl. torsk) × 20 biproduktkategorier (heads, liver, roe, fish oil, fish-meal, tongues, cheeks, swim bladders m.fl.) × år 1992–2024 × enhet tonn/1000 ISK. Locator: `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/sjavarutvegur/aflatolur/radsofun_afla_vinnsla/SJA09114.px`.

**Blokkert:** Selve datauttrekket krever HTTP POST (PxWeb API v1); Hagstofa har ikke v2-GET-API, og fetch-verktøyet i denne sesjonen kan kun GET. **Manuell vei (5 min):** åpne tabellsiden i nettleser, velg All species/Cod × alle biprodukter × 2018–2024 × begge enheter, eksporter til Excel/CSV og legg filen i `research/external/dro-0906/`. Alternativt POST-query mot API-URL-en over med `{"query":[{"code":"Fiskitegund","selection":{"filter":"item","values":["0","1"]}},{"code":"Ár","selection":{"filter":"item","values":["2018","2019","2020","2021","2022","2023","2024"]}}],"response":{"format":"csv"}}`.

## 2. DR-2 ZWS-fulltekst Skottland — ferdig, med viktig dateringskorreksjon

Fullteksten av «Characterising fish processing by-products» er hentet og lest (PDF via `https://cdn.zerowastescotland.org.uk/managed-downloads/mf-byblsg3s-1740053312d`).

**Dateringskorreksjon:** Rapporten er utarbeidet av **Enscape Consulting Ltd, datert 31. mars 2020** (survey-data fra 2019). ZWS-nettsiden publiserte den 20.02.2025 — DRR-008 daterte kilden til 2025. All bruk må merkes «2019-survey, publisert 2025».

**Nøkkeltall (survey + estimat):**

| Størrelse | Tonn/år | Merknad |
|---|---:|---|
| Akvakultur-biprodukter prosessert i Skottland (estimat) | 41 188 | Survey fanget 35 011 (85 %) |
| Villfisk-biprodukter (estimat) | 94 697 | Survey fanget 32 946 (35 %); antakelse 50 % HOG-eksport |
| Input til added value-prosessorer (survey) | 179 640 | 166 000 til mel/olje + 13 640 til tørking/frys (hoder/rygger) |
| Output fra added value | 56 528 | 49 800 mel/olje + 6 728 høyverdi tørket |
| Uforklart avvik estimat vs. added value-input | 43 755 | Eksport-/rUK-strømmer ukjente |
| Laksemortalitet (2017, utenfor scope, kategori 2) | 25 737 | Fra ZWS 2018-rapport |

**Prisfunn (2019):** blandede biprodukter **£62–173/tonn**, segregerte **£250–520/tonn** — 3–7× premie for segregering. Strukturfunn: nesten alle biprodukter prosesseres ved **bare to anlegg** på fastlandet; 60 % av bedriftene interessert i høyverdiutvikling (skinn, pharma-ingredienser, hoder/rygger).

**Konsekvens:** Skottland står som `benchmark-kandidat` — styrket på struktur- og prislogikk, men svekket på aktualitet (2019-data). SBMT-datatilgang (IBioIC) fortsatt åpen.

## 3. DR-3 Kaffeimportserie — ferdig, slideklar kvantifisering

Kilde: UN Comtrade preview-API (GET, åpen): `https://comtradeapi.un.org/public/v1/preview/C/A/HS?...` (reporter 579=Norge, partner 76=Brasil/0=verden, flow M, partner2=0, customs C00, mot 0). CIF-verdier i USD.

**Norge ← Brasil:**

| År | HS 090111 urøstet (kg) | Verdi (USD) | HS 090121 brent (kg) | Verdi (USD) |
|---|---:|---:|---:|---:|
| 2022 | 13 825 721 | 64 664 163 | 1 472 635 | 14 167 843 |
| 2023 | 13 772 960 | 58 289 567 | 1 485 715 | 16 042 560 |
| 2024 | 12 358 484 | 58 836 710 | 1 488 047 | 15 765 733 |
| 2025 | 15 616 997 | 122 931 871 | 846 600 | 9 296 428 |

**Norge ← verden, HS 090111:** 2022: 31 019 103 kg / 177,5 mUSD; 2023: 29 117 068 / 149,3; 2024: 25 853 511 / 139,0; 2025: 32 918 478 / 277,6.

**Avledede funn (internt, regnet fra tabellene over):**
- Brasil-andel av norsk råkaffeimport: **44,6 % (2022) → 47,3 % → 47,8 % → 47,4 % (2025)** — stabil høy konsentrasjon.
- Enhetspris Brasil-råkaffe: 4,68 → 4,23 → 4,76 → **7,87 USD/kg** (+65 % 2024→2025); total importverdi fra verden ~doblet 2024→2025. Prissjokket forsterker EUDR-/sårbarhetsnarrativet.
- **Kryssverifikasjon NKI:** Comtrade 2024-aggregatet (12 358 484 kg) er *identisk* med NKI-tabellens Brasil-tall; 2022/2023 avviker <0,05 %. NKI-serien («råkaffeekvivalent») er altså i praksis HS090111-nettovekt — kildestyrken til NKI-tallet i DRR-001 er oppgradert.

## 4. DR-4 Kakao nordisk direkteimport fra Côte d'Ivoire — ferdig, kill bekreftet

Samme API, partner 384=CI, år 2024, HS 1801/1803/1804/1805/1806, alle fire nordiske rapportører:

| Rapportør | HS | Kg | Verdi (USD) |
|---|---|---:|---:|
| Norge | 1804 kakaosmør | 36 450 | 247 030 |
| Norge | 1805 kakaopulver | 27 450 | 119 874 |
| Finland | 1805 | 2 250 | 13 754 |
| Danmark | 1806 sjokolade | 1 | 6 |
| Sverige | alle | 0 | 0 |
| Alle | **1801 råbønner** | **0** | **0** |

**Konsekvens:** DRR-002s svekking av direkteimport-sporet er nå bekreftet og utvidet fra råbønner til *alle* kakaokapitler. Trygg formulering skjerpes: «Nordisk CI-kakaoeksponering er indirekte — via EU-prosessering (Nederland/Tyskland/Belgia) og merkevarekjeder (Fazer-sporet) — ikke via direkteimport.» Neste datasteg er EU-aggregatet (Eurostat Comext), ikke mer nordisk tolldata.

## 5. DR-5 Finsk fôrimport — ferdig, tallfester «soyafri ≠ importfri»

Samme API, reporter 246=Finland, partner 0=verden, import:

| Råvare (HS) | 2022 kg | 2023 kg | 2024 kg |
|---|---:|---:|---:|
| Soyamel (2304) | 143 763 833 | 87 269 515 | 124 421 830 |
| Rapsmel, lav erukasyre (230641) | 214 112 482 | 217 552 730 | 216 302 600 |
| Rapsmel, annet (230649) | 20 590 309 | 25 209 370 | 32 324 406 |
| Rapsfrø (1205) | (vekt mangler; 73,0 mUSD) | (62,6 mUSD) | 137 108 592 |
| Erter (071310) | 2 205 572 | 2 099 827 | 782 117 |

**Konsekvens:** Finland importerer ~**216 000 tonn rapsmel/år** (stabilt) — selve soyaerstatningen i Valio-fortellingen er en importvare, nøyaktig som Valios egen 2020-artikkel sier. Soyamel-importen (87–144 000 t/år nasjonalt) viser at det finske systemet utenfor melkekjeden fortsatt er soyaavhengig. Dette gir Valio-sliden en kvantitativ systemramme uten å trenge Valio-interne data (fôrkurven er fortsatt DASK/AASK).

## 6. DR-6 Wiig (Klepp/Enova) — Enova-gapet lukket, driftsstatus fortsatt åpen

**Funnet:** Enovas teknologiportefølje har prosjektsiden «Energioverføring fra datasenter til gartneri for avlastning i energisystemet» (`https://www.enova.no/om-enova/om-organisasjonen/teknologiportefoljen/energioverforing-fra-datasenter-til-gartneri-for-avlastning-i-energisystemet/`): Green Horizon piloterer med Wiig Gartneri, ny kjøleteknologi gir overskuddsvarme **50–70 °C** som skal erstatte naturgass; initial installasjon **4 MW**, potensial **200 MW** i separate prosjekter. (Siden er klientrendret; tekst verifisert via søkeindeks — åpne siden manuelt for skjermkopi/arkivering.)

**Fortsatt åpent:** Ingen offentlig kilde bekrefter at anlegget er *i drift* (ferdigattest/driftsmelding ikke funnet). Klepp kommunes byggesak (gnr/bnr 39/59) må hentes via eInnsyn/kommunens postliste.

**Konsekvens:** DRR-006-blokkeren «direkte Enova-side ikke funnet» er lukket; Wiig forblir `needs-primary-check` for operativ status. Ikke si «operativt».

## 7. DR-7 Polen kill-test — watchlist bekreftet (hurtigtest)

Åpne søk (polsk + engelsk) ga ingen sidestrømvaloriseringspilot med aktør + lokasjon + volum + output. Nye kildespor for full kill-test: MIR Gdynia «Tom III – Produkty i przetwórstwo rybne» (`mir.gdynia.pl`), gov.pl EMFAF-programdokument (attachment c9f5a4b5), PSPR fondssider (`pspr.pl`). **Konsekvens:** Polen forblir `watchlist`; full kill krever GUS XLS-uttrekk og EMFAF-prosjektdatabase (manuelt/nettleser).

## 8. DR-8 Konkurransetilsynet etter 01.05.2026 — regulatorisk vindu dokumentert

Funn: (1) KT overtok god handelsskikk-håndhevingen 01.05.2026 og **NFD har sendt eget tildelingsbrev med føringer** for håndhevingen (regjeringen.no: «Føringer til Konkurransetilsynet om håndhevingen av lov om god handelsskikk»). (2) Pågående/nylige høringer: **forbud mot konkurranseskadelige forskjeller i innkjøpsbetingelser i verdikjeden for mat og dagligvarer** og **presiseringer i god handelsskikk-standarden** (bl.a. strengere krav til skriftlige avtaler). (3) Ingen BAMA-/grossistspesifikk sak funnet — konsistent med ikke-si-listen.

**Konsekvens:** C-gate-caset (distribusjon/adoption) har et aktivt politikkvindu i 2026 — relevant for både deck (policy-kontekst) og whitepaper-timing. Claims om enkeltaktører er fortsatt udokumenterte.

## 9. DR-9 Varde — venter på høringsfrist

§25-høringen løper til **25.06.2026**; ingen ny status ventes før det. Oppfølgingspunkt: hent endelig tillatelse/lokalplan + ev. navngitt drivhusoperatør etter fristen (uke 27).

## 10. DR-10 Ikke-si-konsolidering — forberedt, ikke utført

De ~70 ikke-si-punktene på tvers av de 8 DRR-rapportene skal inn i claim-lock-tabellen som kontrollert oppdatering (protokollens rekkefølge: mottaksfil → PCQ/SRC → claim-lock → sprintboard). Ikke gjort i denne loggen; gjøres som eget, reviewbart steg.

## 11. Foreslåtte statusendringer (til kontrollert oppdatering)

| Rad | Fra | Til | Begrunnelse |
|---|---|---|---|
| Kaffe import-/EUDR-spor (DRO-0906-001, importdelen) | intern hypotese | `deckklart internt` med tallgrunnlag | Komplett Comtrade-serie 2022–2025 + NKI-kryssverifikasjon (kap. 3) |
| Kakao direkteimport-claim (DRO-0906-002) | svekket (kun HS180100) | motbevist for alle kakaokapitler, direkteimport | Kap. 4; relasjonsclaim uendret (DASK) |
| Valio systemramme (DRO-0906-003) | needs-data (nasjonalt) | nasjonal importramme `deckklart internt`; Valio-spesifikk fôrkurv fortsatt `needs-data` | Kap. 5 |
| Skottland ZWS-kilde (DRO-0906-008) | needs-primary-check | fulltekst kontrollert; **datering korrigert til 2020/2019-survey**; benchmark-kandidat med aktualitetscaveat | Kap. 2 |
| Wiig Enova-blokker (DRO-0906-005/DASK-0906-006) | Enova-side ikke funnet | Enova-prosjektside bekreftet; driftsstatus fortsatt `needs-primary-check` | Kap. 6 |
| Polen (DRO-0906-007) | watchlist | watchlist (bekreftet) | Kap. 7 |
| Distribusjon/C-gate (DRO-0906-004) | uendret | uendret + policy-vindu-notat | Kap. 8 |

## 12. Verifikasjon

Alle tall i kap. 3–5 er lest direkte fra UN Comtrade preview-API-responser i denne sesjonen (GET-URL-er gjengitt; customs C00, mot 0, partner2 0, CIF primaryValue). ZWS-tall er lest fra hentet PDF-fulltekst. Enova-/KT-/Polen-funn bygger på søketreff med navngitte kilder; Enova-sidens innhold er ikke åpnet i nettleser (klientrendret) og bør arkiveres manuelt. Comtrade preview er en åpen forhåndsvisningstjeneste — før ekstern faktastemme bør serien re-trekkes som autorisert uttrekk (SSB tabell 08801 manuelt, eller Comtrade med nøkkel) og legges i source-shortlist med fil-locator. `git diff --check` kjørt rent.
