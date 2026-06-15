---
tittel: Food TG — Maktkart §8 steg 3–4: ekte dagligvare-HHI + AP-3 2024 lukket (funn 2026-06-14)
status: Internt analysefunn — §8 steg 3 delvis lukket, steg 4 lukket
eier: Gabriel
dato: 2026-06-14
arbeidspakke: Maktkart-syntese §8 steg 3 (AP-2 markeds-HHI) + steg 4 (AP-3 2024-tilskudd)
metode: Parallell subagent-fan-out (to spesialister samtidig) + coordinator-verifikasjon
bruksregel: Internt analysefunn. «Konsentrasjon» = markeds-/fordelingsstruktur, ikke intensjon. Dagligvare-HHI er kildebelagt (KT) og citable-kvalifisert MED forbehold; AP-3 2024 er verifisert mot publisert primærtotal. Ingen rad er ekstern faktastemme før full operator-sekvens.
relaterte_filer:
  - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md
  - scripts/analyze-subsidy-concentration.ts
  - research/analyse/ap3-tilskuddskonsentrasjon.json
  - research/data/nordic/market-share/no-grocery-market-share-2020-2024.csv
---

# Maktkart §8 steg 3–4 — ekte dagligvare-HHI + AP-3 2024 lukket

## 1. Kort funn

To av de gjenstående §8-stegene mot citable er nå adressert, kjørt som parallelle spesialist-subagenter og verifisert av coordinator:

- **Steg 4 (AP-3 2024-tilskudd) er lukket.** «2024-datafella» var ikke manglende data — det var en **kolonnematch-bug**: Landbruksdirektoratet bruker maskin-slugger for beløpskolonnene t.o.m. 2023, men lesbare prosa-etiketter i 2024-fila. Skriptet matchet eksakt på slug, så bare 3 av 15 ordninger traff, og 2024-totalen ble lest som 10,94 mrd. Etter fiks (alias-resolver, enhetstestet) er reell 2024 = **18,61 mrd (brutto, 37 016 mottakere)**, i tråd med publisert netto-total **18,39 mrd / «over 18,3 mrd»** (Landbruksdirektoratet + LMD, 12.02.2025). 2024-konsentrasjonen (Gini 0,5415, topp-10 % 33,8 %) er **på linje med 2023** — 2024 var aldri en uteligger.
- **Steg 3 (AP-2 markeds-HHI) er delvis lukket.** Det finnes nå et **ekte markeds-HHI for dagligvare** (ikke det n-følsomme inntekts-HHI-et): ~**3 327 i 2024**, CR3 ~**96,6 %**, stabilt 2020–2024 — beregnet fra committet markedsandelsdata (Konkurransetilsynets Dagligvarerapport 2024-25). Kun retail-leddet har markedsandelsdata i dag; øvrige noder (sjømat, fôr, meieri, kjøtt, logistikk, foodservice) er fortsatt `needs-data`.

## 2. Steg 4 — AP-3 2024-tilskudd (lukket)

Korrigerte tall (`research/analyse/ap3-tilskuddskonsentrasjon.json`, kjørt mot Landbruksdirektoratets åpne data etter fiks):

| År | Total (mrd NOK) | Mottakere | Gini | Topp 1 % | Topp 10 % |
|---|---:|---:|---:|---:|---:|
| 2022 | 15,21 | 37 748 | 0,5208 | 5,3 % | 32,2 % |
| 2023 | 17,25 | 37 390 | 0,5407 | 5,5 % | 33,8 % |
| **2024** | **18,61** | **37 016** | **0,5415** | **5,5 %** | **33,8 %** |

- 2022/2023 er **byte-identiske** med forrige committede kjøring (fiksen rører dem ikke — de bruker slug-headere). Kun 2024 endret seg (10,94 → 18,61 mrd) fordi de 11 manglende ordningene nå fanges.
- **Brutto vs netto:** 18,61 mrd er sum av ordningskolonnene (samme metode som 2022/2023); publisert 18,39 mrd er netto etter avkortning/trekk. Differansen (~0,22 mrd) er forventet og ikke et avvik.
- **Bugfix:** `scripts/analyze-subsidy-concentration.ts` fikk en `SCHEME_ALIASES`-tabell (prosa-etikett → kanonisk slug) + `resolveSchemeHeaders`, enhetstestet i `tests/scripts/analyze-subsidy-concentration.test.ts` (slug→slug uendret; prosa→alias; summer alle ordninger).

## 3. Steg 3 — AP-2 ekte dagligvare-HHI (delvis lukket)

Beregnet fra `research/data/nordic/market-share/no-grocery-market-share-2020-2024.csv` (de fire kjedene ≈ 100 % av markedet → ekte markeds-HHI, ikke kartleggings-HHI):

| År | CR3 | Markeds-HHI |
|---|---:|---:|
| 2022 | 96,5 % | 3 320 |
| 2023 | 96,7 % | 3 339 |
| **2024** | **96,6 %** | **3 327** |

2024-aktørandeler: NorgesGruppen 43,5 %, Coop 29,2 %, Reitan/Rema 23,9 %, Bunnpris 3,3 %. HHI > 2 500 = «høyt konsentrert» (US DOJ/FTC-terskel); nivået er stabilt gjennom hele perioden. Kilde: Konkurransetilsynets Dagligvarerapport 2024-25, Fig. 2.

**Node-dekningskart (markedsandelsdata):**

| Node | Status | Kilde som trengs |
|---|---|---|
| retail/dagligvare | **dekket** (ekte HHI) | — (KT Dagligvarerapport) |
| seafood | `needs-data` | Fiskeridirektoratet (MTB/konsesjon) + Kontali; børstall Mowi/Lerøy/SalMar/Austevoll |
| inputs/fôr | `needs-data` | BioMar/Skretting/Cargill/Mowi Feed-volum (Kontali/årsrapport); Felleskjøpet bransjeandel |
| processing — meieri | `needs-data` | TINE markedsandel (markedsregulator/årsrapport) |
| processing — kjøtt | `needs-data` | Nortura markedsandel (markedsregulator/KLF) |
| logistikk/grossist | `needs-data` | ASKO/BAMA/REMA Distribusjon (selskapsregnskap/KT) |
| foodservice | `needs-data` | storkjøkken/servicehandel-andeler (bransjeestimat) |

## 4. Metode — fan-out + coordinator-verifikasjon

Begge stegene ble kjørt som **parallelle subagenter** (research-spesialist + analyse-spesialist samtidig), deretter verifisert av coordinator. Verifikasjonen var ikke seremoniell: subagenten beskrev 2024-bug-mekanismen upresist (antok ren prosa-rename), mens den faktiske fila har `pXXX`-produksjonskoder kol. 13–180 **og** prosa-etiketter for beløpskolonnene kol. 181–194. Coordinator bekreftet (a) at 2023 fortsatt bruker slug-headere (så fiksen ikke rører 2022/2023), (b) de eksakte prosa-etikettene for alias-tabellen, og (c) at 2022/2023 forble byte-stabile etter fiksen. Det er fan-out-gevinsten med coordinator-kontroll: to uavhengige fremskritt, men med ett sted som håndhever korrekthet.

## 5. Claim-status

| Claim | Status | Begrunnelse |
|---|---|---|
| CL-AP3-001 (tilskuddskonsentrasjon) | → **klar-med-forbehold** | 2024 lukket: total verifisert mot publisert primærtotal; konsentrasjon (Gini ~0,52–0,54) konsistent 2022–2024. Fjern «ikke bruk 2024-total»-stoppspråk. |
| **CL-DAGLIGVARE-HHI-001 (ny)** | **citable-kvalifisert MED forbehold** | Dagligvare-markeds-HHI ~3 327 (2024), CR3 ~96,6 %; kilde KT Dagligvarerapport 2024-25. Forbehold: gjelder KUN retail-leddet; 2020–21 er NielsenIQ, 2022–24 KT (metodeskifte → trend kun indikativ). |
| CL-AP2-001 (node-HHI) | uendret `intern baseline` | Kjernen (makt er governance-/styrebåren, ikke aksjekonsentrert) står; ekte kryss-node-HHI forblir `needs-data`. Ikke bland ekte dagligvare-HHI med AP-2s inntekts-HHI. |

**Stoppspråk (nytt/justert):** Ikke bruk dagligvare-HHI som kryss-node-mål. Ikke fremstill 2024-tilskudd-totalen som nedgang (den tidligere 10,94 mrd var skript-artefakt). Ikke løft noe til ekstern faktastemme før operator-sekvensen er grønn.

## 6. Hva som gjenstår av §8

Steg 1 (Brønnøysund-stikkprøve) gjort; steg 2 (dekningsutvidelse) klar; **steg 4 lukket**; **steg 3 delvis** (retail ekte HHI; kryss-node `needs-data`). Igjen: eierandel-% (AP-5, Aksjonærregister), kryss-node markeds-HHI (sjømat/fôr/meieri/kjøtt), og full operator-sekvens før CL-MAKTKART-001 kan løftes til citable.

## 7. Verifikasjon

AP-3-tallene er regnet av `analyze-subsidy-concentration.ts` (alias-resolver enhetstestet; 2022/2023 byte-stabile mot forrige kjøring; 2024 mot Landbruksdirektoratets åpne data) og verifisert mot publisert total (Landbruksdirektoratet + LMD 12.02.2025). Dagligvare-HHI er regnet fra committet KT-markedsandels-CSV og samsvarer med CSV-ens forhåndsberegnede felt. Full testsuite grønn (515/515) inkl. de nye AP-3-testene; `eslint`, `tsc` (egne filer) og `git diff --check` rene. Ingen påstand er løftet til ekstern bruk i dette notatet.

## 8. Kilder

- Landbruksdirektoratet, «Betaler ut over 18,3 milliarder kroner til norske bønder», 12.02.2025 — <https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/betaler-ut-over-18-3-milliarder-kroner-til-norske-bonder>
- LMD/regjeringen.no, «Betalar ut over 18 milliardar kroner til norske bønder», 12.02.2025 — <https://www.regjeringen.no/no/aktuelt/betalar-ut-over-18-milliardar-kroner-til-norske-bonder/id3087115/>
- Landbruksdirektoratet åpne data (produksjon- og avløsertilskudd 2022–2024) — <https://github.com/LandbruksdirektoratetGIT/opendata>
- Konkurransetilsynet, Dagligvarerapport 2024-25, Fig. 2 — <https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25-1.pdf>
