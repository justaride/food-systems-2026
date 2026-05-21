# /sammenligning — datagap-matrise og kilde-tetteplan

Dato: 2026-05-15
Eier: Gabriel
Scope: Konkret kartlegging av hva `/sammenligning` faktisk renderer per land i dag, hvilke datapunkter som mangler, og hvilken primærkilde som bør tette gapet.

Denne rapporten er bygget ved å lese koden for siden (`src/app/sammenligning/SammenligningContent.tsx`), datakontrakten (`src/lib/queries/sammenligning.ts`) og JSON-grunnlaget (`public/data/food-systems/<land>/value-chain.json` + `chart-metrics.json`).

## 1. Hovedfunn

1. Tre kategorier av "manglende data":
   - **Reelle datagap** — verdien er aldri samlet inn for landet (f.eks. dansk EMV-andel, finsk svinn-reduksjon).
   - **Schema-mismatch** — verdien finnes i JSON, men under et annet feltnavn enn det query-laget leser (f.eks. `format_share` vs `retail_format`, `turnover_bn_sek` vs `turnover_bn`). Dette er **ikke datagap**, det er **kontraktbrudd** og bør fikses i kode/normalisering.
   - **Kode-bug** — query-laget peker på et felt som ikke finnes i datakilden. Eksempler: `cm.parentCompany.parentCR3` (eksisterer ikke), `p.share` brukt i stedet for `p.value`. Disse forklarer hvorfor f.eks. CR3-charten er tom for ALLE 5 land selv om HHI vises.
2. Norge er overlegent best dekket. Sverige, Danmark og Finland har god dekning på markedsstruktur og sirkularitet, mangler stort sett alt på verdikjede (volum/turnover/employment). Island mangler nesten alt utenfor markedsstruktur.
3. Av 36 sentrale datapunkter på siden er **53 % tomme** (se §3). Av disse skyldes 8 % kode-bug og 11 % schema-mismatch — disse kan fikses uten ny datainnsamling.

## 2. Sider/bolker som rammes

| Bolk | Tittel | Antall ChartCards | % missing celler |
|---|---|---:|---:|
| 1 | Markedsstruktur & makt | 6 | 27 % |
| 2 | Selvforsyning & beredskap | 5 | 64 % |
| 3 | Verdikjede & verdiskaping | 5 | 86 % |
| 4 | Sirkularitet & matsvinn | 6 | 30 % |
| 5 | Politikk & regulering | 1 (timeline) | 0 % (har minst 2 per land) |

## 3. Full datapunkt-matrise (NO/SE/DK/FI/IS)

Legende: ✅ = finnes, ❌ = mangler, ⚠️ = finnes i annet felt (schema-mismatch), 🐛 = kode-bug (data finnes men leses ikke).

### Bolk 1 — Markedsstruktur & makt

| Datapunkt | NO | SE | DK | FI | IS | Kommentar |
|---|---|---|---|---|---|---|
| HHI (parents) | ✅ 3445 | ✅ 2854 | ✅ 2157 | ✅ 2942 | ✅ 2965 | Alle land dekket |
| CR3 (topp 3 markedsandel) | 🐛 | 🐛 | 🐛 | 🐛 | 🐛 | `chart-metrics.parentCompany.parentCR3` mangler i alle JSON-er; bør beregnes fra `data[].value` i bygget |
| Gini (butikkstørrelse) | ✅ 0.211 | ✅ 0.408 | ✅ 0.116 | ✅ 0.514 | ✅ 0.355 | OK |
| Antall butikker | ✅ 3849 | ✅ 5049 | ✅ 3869 | ✅ 2860 | ✅ 243 | OK |
| EMV-andel foredling (%) | ⚠️ 30-35 (i notes) | ✅ 28 | ⚠️ ~35 (i notes) | ✅ 39 | ❌ | NO og DK har tall i notes/text, ikke i `emv_share_pct` |
| Discount-andel (%) | 🐛 66.3 | ❌ | ⚠️ ">40" (i notes) | ❌ | ❌ | NO har data under `format_share`, men query leser `retail_format` |
| Topp 3 parents (label) | 🐛 | 🐛 | 🐛 | 🐛 | 🐛 | Data finnes (4–6 per land), men query maps `p.share` mens datafelt heter `value` → tabell viser 0% |

**Reelle gap (etter koderetting):** EMV for IS, EMV i felt for NO/DK, discount-andel for SE/DK/FI/IS.

### Bolk 2 — Selvforsyning & beredskap

| Datapunkt | NO | SE | DK | FI | IS | Kommentar |
|---|---|---|---|---|---|---|
| Selvforsyning (kalori, %) | ✅ 41.3 | ✅ 50 | ✅ 300 | ✅ 80 | ✅ 53 | OK — men ulike definisjoner (DK 300 inkl. eksport-overskudd) |
| Selvforsyningsmål (%) | ✅ 50 | ❌ | ❌ | ❌ | ❌ | SE 2024:8 hadde ingen tallfestet mål, FI har Hvk-mål |
| Mål-år | ✅ 2030 | ❌ | ❌ | ❌ | ❌ | |
| Total import (tonn) | ✅ 517 000 | ❌ | ❌ | ❌ | ❌ | SE/DK/FI har kun verdi i lokal valuta, ikke tonn |
| Total eksport (tonn) | ✅ 2 800 000 | ❌ | ❌ | ❌ | ❌ | Samme — kun NO har tonnesum |
| Fôr-import-andel (%) | ❌ (men 92% i notes for sjømat) | ❌ | ❌ | ❌ | ❌ | Ingen land har strukturert `feed_import_pct` |
| Kornreserve (mnd) | ❌ | ❌ | ❌ | ✅ 9 | ❌ | NO har ikke strategisk lager; SE/DK/IS har heller ikke |

**Reelle gap:** Mål/mål-år for SE/DK/FI/IS, total import/eksport-tonn for SE/DK/FI/IS, fôr-import for alle 5, kornreserve for NO/SE/DK/IS.

### Bolk 3 — Verdikjedevolum & verdiskaping

| Datapunkt | NO | SE | DK | FI | IS | Kommentar |
|---|---|---|---|---|---|---|
| Primærvolum (tonn) | ✅ 3 293 000 | ❌ | ✅ 16 300 000 | ❌ | ❌ | DK aggregert (kjøtt+meieri+korn), NO inkluderer ikke alle kategorier — definisjonsbaseline mangler |
| Sjømat eksportverdi (mrd lok) | ✅ 175.4 NOK | ⚠️ 14 SEK | ⚠️ 32 DKK | ⚠️ 0.3 EUR | ❌ | SE/DK/FI har data, men under `trade.export_value_bn_<currency>` — query leser kun `export_value_bn` |
| Foredlings-omsetning (mrd lok) | ✅ 377.4 NOK | ⚠️ 222 SEK | ⚠️ 203.6 DKK | ⚠️ 10.7 EUR | ❌ | Samme — alle har data under `turnover_bn_<currency>` eller `export_value.total_dkk_bn`. Bør normaliseres til EUR/PPP |
| Sysselsetting NACE 01 (jordbruk) | ✅ 36 327 | ❌ | ❌ | ❌ | ❌ | |
| Sysselsetting NACE 03 (fiske/oppdrett) | ⚠️ 23 035 (i primary, ikke seafood) | ❌ | ❌ | ❌ | ❌ | NO har data men plassert i feil step (`primary.employment` istedenfor `seafood.employment`) |
| Sysselsetting NACE 10 (matforedling) | ⚠️ 47 812 (i primary, ikke processing) | ❌ | ❌ | ❌ | ❌ | Samme schema-bug — NO har det under `primary.employment` |
| Sysselsetting NACE 11 (drikkevarer) | ⚠️ 3 316 (i primary, ikke processing) | ❌ | ❌ | ❌ | ❌ | Samme — i tillegg har FI/SE/DK kun samlet `employees`-felt på processing |
| Verdiskaping primary (mrd) | ✅ 28.0 | ❌ | ❌ | ❌ | ❌ | |
| Verdiskaping sjømat (mrd) | ✅ 63.4 | ❌ | ❌ | ❌ | ❌ | |
| Verdiskaping foredling (mrd) | ✅ 62.2 | ❌ | ❌ | ❌ | ❌ | |
| Verdiskaping distribusjon (mrd) | ❌ | ❌ | ❌ | ❌ | ❌ | Mangler for ALLE land |
| Verdiskaping detaljhandel (mrd) | ❌ | ❌ | ❌ | ❌ | ❌ | Mangler for ALLE land |
| Verdiskaping HoReCa (mrd) | ❌ | ❌ | ❌ | ❌ | ❌ | Mangler for ALLE land |
| CO₂e detaljhandel (mt) | ⚠️ 1.6 (i waste, ikke retail) | ❌ | ❌ | ❌ | ❌ | NO har co2e_mt på flere ledd (primary 4.4, processing 0.9, distribution 0.5, waste 1.6), men ikke retail |

**Reelle gap (etter koderetting):** Primærvolum SE/FI/IS, sjømateksport IS, foredlings-omsetning IS, all verdiskaping for alle land utenfor NO, sysselsetting NACE-fordeling for SE/DK/FI/IS, retail-CO₂e for alle.

### Bolk 4 — Sirkularitet & matsvinn

| Datapunkt | NO | SE | DK | FI | IS | Kommentar |
|---|---|---|---|---|---|---|
| Total svinn (kg/cap) | ✅ 73.4 | ✅ 84 | ✅ 139 | ✅ 68 | ❌ | DK høy pga eksportbasert foredling |
| Husholdningssvinn (kg/cap) | ✅ 42 | ✅ 35 | ✅ 41 | ✅ 22 | ❌ | |
| Svinn-reduksjon siden 2015 (%) | ✅ -24 | ❌ | ❌ | ❌ | ❌ | Kun NO har målt baselinje 2015 → 2024 |
| Biogass (GWh) | ✅ 470 | ✅ 2 000 | ✅ 8 100 | ✅ 930 | ❌ (notes: ingen) | DK 17× NO per capita — tydelig dataforskjell |
| Biogass-anlegg | ✅ 40 | ✅ 280 | ✅ 175 | ✅ 120 | ❌ | |
| Pant-returrate (%) | ✅ 92.3 | ✅ 87 | ❌ | ❌ | ❌ | DK har Dansk Retursystem (~93%), FI/IS mangler i JSON |
| Matsvinn per kategori (Mt) | ✅ 5 kategorier (kjøtt, meieri, frukt/grønt, sjømat, korn) | ❌ | ❌ | ❌ | ❌ | Tabell vises kun fordi NO seedet `food_waste_by_category`-objektet med nordiske estimater |

**Reelle gap:** All Island, svinn-reduksjon for SE/DK/FI, pant for DK/FI/IS, kategori-fordeling per land (i dag bare NO-derivert nordisk estimat).

### Bolk 5 — Politikk & regulering

| Datapunkt | NO | SE | DK | FI | IS |
|---|---|---|---|---|---|
| Antall politikk-tiltak | ✅ 4 | ✅ 4 | ✅ 5 | ✅ 4 | ✅ 2 |

Bolk 5 er strukturelt komplett, men IS har bare 2 tiltak — sannsynlig undermapping. Politikk-timeline trenger flere IS-tiltak (f.eks. Matvælastefnu 2024, fiskeriforvaltningslovgivning).

## 4. Aggregert tellestatistikk

| Bolk | Datapunkter (per land) | Land | Celler totalt | Mangler reelt | Kode-bug | Schema-mismatch | Dekning |
|---|---:|---:|---:|---:|---:|---:|---:|
| B1 Marked | 7 | 5 | 35 | 4 | 13 | 4 | 40 % |
| B2 Beredskap | 7 | 5 | 35 | 25 | 0 | 0 | 29 % |
| B3 Verdikjede | 14 | 5 | 70 | 47 | 0 | 13 | 14 % |
| B4 Sirkularitet | 7 | 5 | 35 | 14 | 0 | 0 | 60 % |
| B5 Politikk | 1 | 5 | 5 | 0 | 0 | 0 | 100 % |
| **Totalt** | | | **180** | **90** | **13** | **17** | **44 %** |

## 5. Anbefalte tiltak — prioritert

### A. Quick wins (kun kode, ingen ny datainnsamling) — 1–2 dager

A1. **Fiks CR3-bug:** Beregn `parentCR3` fra `data[].value` (sortert desc, sum av topp 3) i `compute-chart-metrics`-skriptet. Gir 5 nye celler.

A2. **Fiks parents-mapping:** I `src/lib/queries/sammenligning.ts` linje 216, endre `p.share` → `p.value`. Gir tabellen «Topp 3 parents per land» 5 nye celler.

A3. **Normaliser retail format-felt:** I NO-data, omdøp `format_share` → `retail_format` (eller la query lese begge). Gir NO discount-andel.

A4. **Normaliser turnover/sjømat-eksport på currency-suffix:** Utvid query til å lese `turnover_bn_sek/dkk_eur` og `export_value_bn_sek/dkk_eur`, konverter til EUR med PPP. Gir 8 nye celler i Bolk 3.

A5. **Flytt NO sysselsetting:** I `no/value-chain.json`, flytt `nace03` til `seafood.employment` og `nace10/nace11` til `processing.employment`. Gir 3 nye celler for NO og fungerer som template for andre land.

A6. **Hent EMV fra notes til strukturert felt:** NO (~30-35 → bruk 32) og DK (~35) — flytt fra notes til `emv_share_pct`. Gir 2 nye celler.

**Sum quick wins:** ~24 av 30 kode/schema-celler kan fikses → dekningen går fra 44 % til 56 %.

### B. Maskinlesbar tetting via offentlige API — 3–7 dager

B1. **Eurostat NACE-sysselsetting** (`sbs_na_ind_r2`, `lfsa_egan22d`): SE/DK/FI/IS for jordbruk (01), fiske/oppdrett (03), matforedling (10), drikkevarer (11). Endpoint via SDMX 2.1.

B2. **Eurostat foredlings-omsetning** (`sbs_na_ind_r2` value-added/turnover for NACE 10+11): SE/DK/FI/IS, normalisert til EUR.

B3. **Eurostat trade flows** (`DS-575188` ekstra-EU/intra-EU import-eksport): import-/eksport-tonn for HS01-23 for SE/DK/FI/IS. Replikerer NO-tilnærming.

B4. **Statistics Iceland (Hagstofa Íslands)** for husholdningssvinn (`UMH06000`) og total avfall (`UMH02101`). Lukker IS-gap i Bolk 4.

B5. **DST + Naturvårdsverket + Luke** for `waste_reduction_since_2015_pct` SE/DK/FI. Krever rapport-ekstraksjon (har ikke maskin-API), men eksisterer.

### C. Kuratert primærdata (PDF-/rapport-ekstraksjon) — 5–10 dager

C1. **Selvforsyningsmål per land:** Sverige har ingen tallfestet (SOU 2024:8 anbefaler 80%, ikke vedtatt), DK har klimaaftale 2024 men ikke kalori-mål, FI har HVK-mål (9 mnd korn — allerede i data), IS Matvælastefnu 2024 har mål om økt grad av selvforsyning. Krever policy-research, ikke ren statistikk.

C2. **Strategiske kornreserver:** NO har ikke (avviklet 2003), SE er under reetablering (Beredskapslagring för livsmedel-utredning 2024), DK har ikke, IS har ikke. Krever kuratert sammenstilling.

C3. **Fôr-import-andel:** NO 92% sjømatfôr (etablert), husdyr-fôr (NIBIO ~70%). SE/DK/FI/IS — krever eget research-spor (LMI for SE, Landbrug & Fødevarer for DK).

C4. **CO₂e per ledd:** Bare NO har dette i dag fra NORSUS LCA. SE har Naturvårdsverket scope 1+2+3 for matsystem (men ikke per ledd). DK har DCE-rapporter. Krever LCA-syntese, ikke et enkelt API-uttrekk.

C5. **Pant-returrate DK/FI/IS:** Dansk Retursystem (DK ~93%, ekstraheres fra årsrapport), Palpa (FI ~94%), Endurvinnslan (IS ~85%). Tre PDFer.

C6. **Matsvinn-kategorier per land:** I dag har vi nordiske estimater plassert under NO. Bør splittes per land basert på Naturvårdsverket 2024 (SE), DTU Fødevareinstituttet (DK), Luke (FI), Umhverfisstofnun (IS).

### D. Definisjonsbaseline (felles forutsetning, før alle tall blir sammenlignbare)

D1. **Kalori-selvforsyning** — DK 300 % er ikke direkte sammenlignbar med NO 41 %; må enes om hva som inkluderes (eksportoverskudd, importert fôr, sjømat). Bør dokumenteres i `/metodikk` med en eksplisitt formel per land.

D2. **Foredlings-omsetning** — NACE 10 vs 10+11, lokale valutaer vs EUR-PPP, brutto vs netto. Velg én definisjon og beregn alle om.

D3. **Total svinn** — DK 139 kg/cap er omtrent 2× NO fordi DK inkluderer industriavfall fra kjøttforedling. Trenger scope-flagg per land slik biogass-paneletet (STC-030) gjør.

## 6. Anbefalt rekkefølge for utførelse

1. **Uke 1 (kode):** A1–A6 quick wins. Resultat: dekningen går 44 % → 56 %, og tabellen «Topp 3 parents» og CR3-charten begynner å vise data.
2. **Uke 2 (Eurostat):** B1+B2+B3 — NACE-sysselsetting, foredling, handel for SE/DK/FI/IS. Resultat: dekningen går 56 % → ~75 %.
3. **Uke 3 (IS + svinn):** B4+B5 — IS sirkularitet, svinnreduksjon SE/DK/FI. Resultat: ~85 %.
4. **Uke 4–5 (kuratert):** C1–C6 + D1–D3. Resultat: 100 % strukturell dekning + dokumentert definisjonsbaseline.

## 7. Kode-referanser

- Side: `src/app/sammenligning/SammenligningContent.tsx`
- Datakontrakt: `src/lib/queries/sammenligning.ts`
- Kilde-JSON: `public/data/food-systems/<land>/value-chain.json` + `chart-metrics.json`
- DataGap-badge (vises når missing > 0): `src/components/sammenligning/DataGapBadge.tsx`

## 8. Spørsmål til avklaring

1. Skal foredlings-omsetning vises i lokal valuta eller normaliseres til EUR? PPP eller markedskurs?
2. Skal CO₂e per ledd for SE/DK/FI/IS dekkes kun via NORSUS-modell (estimert, dokumentert proxy) eller vente på lokale LCA-data?
3. Skal IS-politikk (Matvælastefnu) komplett mappes nå (3-5 nye tiltak), eller venter vi på Eyrún Pétursdóttir-research?
