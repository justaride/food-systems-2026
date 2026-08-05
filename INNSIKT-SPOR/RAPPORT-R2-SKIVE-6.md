# Rapport — Innsiktssporet runde 2, kjerne-skive 6 av 8

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Leser:** kjerne-skive-6-agent
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-6.jsonl` (15 poster, 58 findings)

## Lesetall

| | Antall |
|---|---:|
| Kilder i skiven | 15 |
| Lest fullt (`read_fully`) | 11 |
| Lest delvis (`read_partially`) | 4 |
| Ulest | 0 |
| Findings totalt | 58 |

**Lest fullt:** beredskap-island-melmolle (md), ravareloeftet (md), is-mast-arsskyrsla (md), ynsect/enorm-biofactory (md), oslo-economics-forsvar (pdf), dagligvaretilsynet 2021/2023/2024 (3 pdf), duong-2025 (pdf), salling-group-2024 (pdf), mirza-2016 (md/pdf-tekst).

**Lest delvis (store dokumenter — abstract + metode + funn/relevante kapitler):**
- `ulsaker-phd-thesis` — introduksjon + kap. 1 (empirisk eggfusjon) fullt; kap. 2–4 er rene teorimodeller, skummet.
- `tanderup-rasmussen-hansen-2023` — 139-siders HD-regnskapsprosjekt; lest abstract, konklusjon, markeds- og benchmarkavsnitt (ikke hele regnskapsgjennomgangen).
- `lehtokunnas-phd-2023` — abstract, introduksjon, metode; de fire artiklene ikke lest i sin helhet.
- `external-ellen-macarthur-denmark-circular-2015` — executive summary + Food & Beverage-kapittel fullt; øvrige sektorkapitler skummet.

Ingen kilder lot seg ikke lese. Alle 15 ga minst tre findings.

## Feltdekning

Findings er tagget mot disse DATAGAP-feltene (en finding kan treffe flere):

| Felt | Kilder som bidrar |
|---|---|
| `makt_eierskap` | oslo-economics, dvt-2021/2023/2024, ulsaker, mirza, tanderup, salling, duong |
| `aktordybde` | oslo-economics, dvt-alle, duong, salling, tanderup, mirza, ulsaker |
| `nordisk_dybde` | is-mast, duong (FI), tanderup (DK), mirza (SE), salling (DK/DE/PL), lehtokunnas (FI), dvt-2024 (nordisk sammenligning) |
| `beredskap_import` | beredskap-island, is-mast, ravareloeftet, ulsaker (eggimportvern) |
| `alternativt_protein` | ynsect, ravareloeftet |
| `materialstrommer` | salling (matsvinn/scope 3), lehtokunnas, EMF-Denmark, mirza, ravareloeftet, ynsect |
| `okologi_jordhelse` | EMF-Denmark, lehtokunnas, salling, mirza, is-mast |
| `kvalitativt_lag` | dvt-2021/2023 (opplevd frykt), duong, lehtokunnas |
| `lokale_verdikjeder` | dvt-2021/2024 (lokalmat, innvandrerbutikker) |

Tyngdepunktet i skive 6 er **nordisk detaljhandels-makt/struktur** (NO/DK/SE/FI markedsandeler og konkurransedynamikk) og **matsvinn/sirkulærøkonomi** (DK/FI). Skiven har lite på `kausalitet` og `offentlig_innkjop`.

## Sentrale funn verdt å løfte

**Nordisk markedskonsentrasjon er nå dokumentert land for land med primærtall:**
- Danmark: Salling 32 %, Coop 26,8 %, Rema 13,6 % → tre konsern 72,4 % (tanderup, 2021).
- Finland: S Group 48,8 % + K Group 33,7 % = 82,5 % (duong, 2024); total omsetning 23,5 mrd. EUR.
- Sverige: ICA 36 % (mirza, 2016).
- Norge: NG/Coop/Rema som dominerende triopol (dvt-alle) — tallfestet i andre skiver.

**Basis-varsler (viktigst for framtidig sitering):**
- Salling scope 3 (6,03 mill. tCO2e; «95 % utenfor egen drift») er **modellert**, ikke målt — mens matsvinn (38 474 tonn) er målt etter vekt. Ikke bland.
- EMF-Denmark sine verdiskapingstall (matsvinn EUR 150–250 mill./år, bio-raffineri EUR 300–500 mill./år innen 2035) er **modellerte scenarier** fra en likevektsmodell i en UTKAST/CONFIDENTIAL-rapport fra en advocacy-stiftelse. Avvikelighetsandelene 56 %/79 % er EPA-**estimat**.
- Ravareloeftet-målet «0,4 % → 25 % nye fôrråvarer innen 2030» er en **aktør-/målsetting**, ikke realisert volum.

**Motsigelser fylt inn (`contradicts`):**
- Oslo Economics (bestilt av NorgesGruppen) ↔ Dagligvaretilsynet: samme norske marked, motsatt ramme — «hard konkurranse/lave marginer» mot «leverandørers alvorlige frykt forklart av kjedenes markedsmakt».
- Ravareloeftet (insekt-optimisme) ↔ Sifted/Ÿnsect (bransjekollaps, kostnader faller ikke, «sirkulær» fôring på matavfall skjer stort sett ikke).

**Type C / det ingen måler (fra `notMeasured`):** faktisk importvolum og kornreservestørrelse på Island; realiserte lokale materialstrømmer/N-P-K i alle kildene; faktisk (vs. modellert) sirkularitet i DK/FI; realisert andel nye fôrråvarer i norsk laksefôr.

## Usikkerhet
- Flere md-kilder er DB-snapshots/URL-ekstrakter (ravareloeftet, EMF, mirza, is-mast) der tabeller/figurer ikke gjengis rent; enkelte tallverdier er lest fra løpende tekst, ikke fra kildens tabell.
- is-mast er islandsk (regex-fallback) — lest, men uten islandsk-kyndig verifikasjon av nyanser.
- De delvis leste PhD-/HD-arbeidene kan inneholde flere tall i kapitler jeg skummet; prioriterte metode, abstract og resultat.
