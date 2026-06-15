---
tittel: Uttak 08 — Norsk grunnlinje, proteinfôrimport (parallell til Finland/Valio-caset)
status: Intern arbeidslogg — uvalidert
eier: Gabriel
dato: 2026-06-12
scope: Norsk importramme for proteinfôrråvarer 2022–2024 (Comtrade preview-GET, samme metode som desk-research-loggen kap. 5), som sammenligningsgrunnlag for Finland-tallene i Valio-caset. Supplerer uttak-02 (SINTEF/FHF) som er norsk grunnlinje for Island-/Skottland-benchmarkene.
relaterte_filer:
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - research/external/spor1-uttak-2026-06-12/uttak-02-sintef-fhf-restrastoff.md
  - research/external/spor1-uttak-2026-06-12/uttak-04-valio-offentlig.md
---

# Uttak 08 — Norsk proteinfôrimport som grunnlinje mot Finland

## Metode og locator

UN Comtrade preview-API (GET, åpen), uttrekk 12.06.2026. Reporter 579=Norge, partner 0=verden, flow M, customs C00, mot 0, partner2 0. CIF (primaryValue, USD). URL-mønster: `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=579&period=2022,2023,2024&partnerCode=0&partner2Code=0&cmdCode=...&flowCode=M&customsCode=C00&motCode=0`. Samme forbehold som desk-research-loggen kap. 12: preview-tjeneste; re-trekkes autorisert (SSB 08801/Comtrade med nøkkel) før ekstern faktastemme.

## Norge, import fra verden (netWgt, tonn)

| Råvare (HS) | 2022 | 2023 | 2024 |
|---|---:|---:|---:|
| Soyabønner (1201) | 308 431 | 362 788 | 347 191 |
| Soyamel (2304) | 6 299 | 1 953 | 4 814 |
| Rapsmel, lav erukasyre (230641) | 198 738 | 197 946 | 207 175 |
| Rapsmel, annet (230649) | (ingen rader returnert) | — | — |
| Rapsfrø (1205) | 3 591 | 3 273 | 10 646 |

## Sammenstilling Norge–Finland (internt, regnet)

| | Finland (desk-logg kap. 5) | Norge (dette uttaket) |
|---|---|---|
| Rapsmel-import/år | ~216 000 t (stabil) | ~200 000 t (stabil) |
| Soyamel-import/år | 87 000–144 000 t | 2 000–6 000 t |
| Soyabønner-import/år | (ikke trukket) | 308 000–363 000 t |

**Hovedlesning:** De to landene har nesten identisk rapsmel-avhengighet. Forskjellen er soyaformen: Finland importerer mel, Norge importerer bønner og presser innenlands (Denofa-modellen) — Norges reelle soyaeksponering ligger altså i 1201-strømmen, ikke 2304. «Soyafri ≠ importfri»-poenget fra Valio-caset gjelder begge land og kan nå vises symmetrisk.

## Viktige forbehold (ikke-si)

- HS 1201 til Norge fordeles på fiskefôr, husdyrfôr og matanvendelser (olje/lecitin); fordelingen er IKKE dokumentert i dette uttaket. Ikke si «347 000 tonn soya til norsk husdyrfôr» — splitten krever Landbruksdirektoratets kraftfôrstatistikk/SSB eller Denofa-/fôrbransjekilder.
- Finland-raden for soyabønner (1201) er ikke trukket; full symmetri krever det.
- Nominelle USD, CIF; ingen prisjustering.

## Norsk grunnlinje for Island-/Skottland-benchmarkene (peker)

Dekkes av uttak-02 (SINTEF/FHF 2024): 1,094 mill. t restråstoff, 89 % utnyttet, anvendelse 66 % fôr / 19 % biogass / 15 % humant konsum — mot Islands registrerte biproduktlandinger (uttak-01, IKKE direkte sammenlignbar metode) og Skottlands 2019-survey (ZWS/Enscape). Metodebro: Strand et al. 2024 (identifisert i uttak-02).

## Foreslått konsekvens for PCQ/source-shortlist (ikke utført)

- Valio-/A-spor-sliden kan utvides med Norge-Finland-symmetrien som internt tallgrunnlag.
- Nytt PCQ-kandidatpunkt: norsk 1201-splitt (fiskefôr/husdyrfôr/mat) via Landbruksdirektoratet/SSB før eksterne claims.
