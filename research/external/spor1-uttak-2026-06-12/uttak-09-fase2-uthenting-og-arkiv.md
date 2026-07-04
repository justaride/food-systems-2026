---
tittel: "Uttak 09 - Fase 2 uthenting og arkiv, Food TG 12.06"
status: "Intern arbeidslogg - kontrollert uttrekk, ikke ekstern faktastemme"
eier: Gabriel
dato: 2026-06-12
scope: >
  Supplerende Fase 2-uthenting etter kontrolloppdateringen 12.06.2026: SINTEF/FHF-
  fulltekst, Statistics Iceland-tabeller, Eurostat Comext, Finland HS1201, norsk 1201-
  split, Strand et al. 2024 og nettleserarkiv for klientrendrede sider. Repoet har
  metadata/source notes for raw evidence som er bevart i lokalt recovery-arkiv;
  kontrollfiler oppdateres først i senere fase via
  mottaksprotokoll -> PCQ/source-shortlist -> claim-lock.
relaterte_filer:
  - research/external/dro-0906/
  - research/external/dro-0906/downloads/
  - docs/project/figures/food-tg-2026-06-12/fig3-norge-finland-proteinfor.svg
---

# Uttak 09 - Fase 2 uthenting og arkiv

Alle funn er interne per 2026-06-12. Tallgrunnlag som er hentet fra åpne API-er
eller forhåndsvisningstjenester må re-trekkes autorisert før ekstern bruk.

## 1. Status per F2-oppgave

| ID | Status | Artefakt/locator | Konsekvens |
|---|---|---|---|
| F2-1 | Lukket for 2024-årgangen | `research/external/dro-0906/downloads/sintef-analyse-marint-restrastoff-2024-2025-00517.pdf`; FHF prosjekt 901844 `https://www.fhf.no/prosjekter/prosjektbasen/901844/`; NVA `https://nva.sikt.no/registration/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574` | Uttak-02s SINTEF-tall er verifisert med side-/tabell-locators. |
| F2-2 | Lukket, med metadata-forbehold | `research/external/dro-0906/sja09110-processing-all-cod-2018-2024.csv`; `research/external/dro-0906/sja04903-export-categories-all-cod-2018-2024.csv` | Islandsk produksjons-/eksportbro finnes nå som CSV. SJA09110 har uventet metadata-oppdatering `2020-08-04T10:00:00Z` selv om tabellen dekker 1992-2024; noter som kildeanomali. |
| F2-3 | Lukket internt | `research/external/dro-0906/eurostat-comext-cocoa-nl-be-de-to-nordics-hs1801-1806-2022-2024.csv`; dataset `ds-045409`, EU trade since 1988 by HS2-4-6 and CN8 | EU-omveien er kvantifisert for NL/BE/DE eksport til NO/SE/DK/FI, HS1801-1806, 2022-2024. |
| F2-4 | Lukket | `research/external/dro-0906/comtrade-finland-hs1201-soybeans-2022-2024.csv`; `docs/project/figures/food-tg-2026-06-12/fig3-norge-finland-proteinfor.svg` | Fig3 er oppdatert med Finland HS1201 og har ikke lenger "ikke trukket"-boks. |
| F2-5 | Lukket som dokumentert gap | Landbruksdirektoratet kraftforstatistikk `https://www.landbruksdirektoratet.no/nb/statistikk-og-utviklingstrekk/utvikling-i-jordbruket/kraftforstatistikk`; workbook `research/external/dro-0906/downloads/landbruksdirektoratet-arlig-ravareforbruk-kraftfor-2026-05-07.xlsx`; Denofa `https://www.denofa.no/soya/`; Denofa 2024-rapporter i `downloads/` | Det finnes ikke som offentlig samlet split per 12.06.2026: norsk HS1201 soyabonnestrøm fordelt på fiskefor, husdyrfor og mat/industri. Dette bør bli PCQ-rad. |
| F2-6 | Lukket som metodebro, ikke som direkte sammenlikningsnøkkel | `research/external/dro-0906/downloads/strand-etal-2024.md`; NVA `https://nva.sikt.no/registration/0198cc6b867f-2e9d70e0-9019-4bff-9bf4-1988f4578825`; DOI `https://doi.org/10.1016/j.resenv.2024.100157` | Strand et al. gir en forsvarlig metode-/forklaringsbro mellom Norge og Island, men ikke én direkte felles denominator for SJA09114 vs. SINTEF/FHF. |
| F2-7 | Delvis lukket med viktig avvik | Raw browser snapshots er bevart i lokalt recovery-arkiv; repo-locator for Enova current-state er `research/external/dro-0906/downloads/enova-wiig-prosjektside-current-404-2026-06-12.md` | Cocoa Life ble arkivert live i recovery-arbeidet. Enova-URL-en render nå Enovas egen 404-side etter relansering; gammel prosjektside må finnes via Enova/arkiv/innsyn før den kan brukes som direkte primærside. |
| F2-8 | Menneskeoppgave, ikke utført av Codex | Uttak-03 seksjon 3 har innsynstekst | Klepp-innsyn skal sendes av Gabriel. Svar logges senere i operatorloggen og føres inn via mottaksprotokoll. |

## 2. F2-1 SINTEF/FHF - verifiserte side-locators

PDF: `sintef-analyse-marint-restrastoff-2024-2025-00517.pdf`, 48 sider, NVA open file, rapportnummer 2025:00517.

- Side 2: sammendraget oppgir at omtrent 89 % av restråstoffet er beregnet utnyttet, 976 000 tonn, og at omtrent 118 000 tonn ikke utnyttes.
- Side 5, Tabell 1: tilgjengelig restråstoff i 2024: hvitfisk 245 000 t, pelagisk 285 000 t, havbruk 543 000 t, skalldyr 21 000 t, total 1 094 000 t. Utnyttet: 176 000 / 285 000 / 509 000 / 5 600 / 976 000 t. Utnyttelsesgrad: 72 % / 100 % / 94 % / 27 % / 89 %. Samme side sier at 118 000 t ikke-utnyttet hovedsakelig oppstod i hvitfisksektoren.
- Side 6: anvendelse av utnyttet restråstoff fordeles på humant konsum, for og biogass/energi; humant konsum er ca. 15 %, og rundt 20 % går til biogass over de siste årene.
- Side 13, Tabell 2: sektorfordelingen repeteres.
- Side 21: skalldyr utnyttet ca. 5 600 t / 27 %, havbruk laksefisk restråstoff ca. 543 000 t / 94 %.
- Side 25-26: oppsummerer 72 % hvitfisk, 94 % havbruk, 27 % skalldyr, 89 % samlet og 118 000 t ikke-utnyttet.
- Side 30: største markedsanvendelse er for; rapporten oppgir ca. 312 000 t forprodukter i 2024. Vedleggsside 47 spesifiserer fôrmarkeder: fiskefôr 224 000 t, pet-food 47 000 t, husdyrfôr 37 000 t, pelsdyrfôr 4 000 t, total 312 000 t.

Konklusjon: Uttak-02s norske baseline er styrket. Trygg formulering er "Norge har høy total utnyttelse av restråstoff (89 %), men verdimiks og human-konsumandel er lavere enn totalutnyttelsen kan gi inntrykk av." Ikke bruk dette som bevis for "Norden har løst høyverdiutnyttelse".

## 3. F2-2 Statistics Iceland - CSV-uttrekk

### SJA09110

- API: `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/sjavarutvegur/aflatolur/radsofun_afla_vinnsla/SJA09110.px`
- Tittel: "Catch by species, fishing areas and processing type 1992-2024".
- Fil: `research/external/dro-0906/sja09110-processing-all-cod-2018-2024.csv`.
- Scope: Species = All species + Cod; Type of processing = alle; Fishing area = All; Years = 2018-2024.
- Kontrollpunkter: Cod all processing 2024 = 221 540 t; Cod filleting 2024 = 4 903 t. All species reduction 2024 = 350 059 t.
- Forbehold: tabellmetadata rapporterte `updated: 2020-08-04T10:00:00Z`; behandles som metadatafeil/anomali inntil re-trukket eller bekreftet.

### SJA04903

- API: `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/sjavarutvegur/utf/SJA04903.px`
- Tittel: "Exported marine products by categories and countries 1999-2024".
- Fil: `research/external/dro-0906/sja04903-export-categories-all-cod-2018-2024.csv`.
- Scope: Species = All species + Cod; Country = All countries; Product category = alle; Years = 2018-2024; Units = tonnes + FOB ISK/1000.
- Kontrollpunkter 2024: all species dried = 18 543 t / 8 235 254 ISK 1000; cod dried = 10 817 t / 5 098 334 ISK 1000; all species meal/fish oil = 159 088 t / 62 787 201 ISK 1000.

Konklusjon: SJA09110/SJA04903 kan nå erstatte "identifisert, ikke ekstrahert" i neste kontrollrunde. Direkte sammenlikning mot SINTEF må fortsatt ha metodeforbehold (se F2-6).

## 4. F2-3 Eurostat Comext - kakao EU-omvei

- API: `https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/ds-045409`
- Dataset: `ds-045409`, "EU trade since 1988 by HS2-4-6 and CN8".
- Query: annual exports (`flow=2`) from NL/BE/DE to NO/SE/DK/FI, HS1801-1806, years 2022-2024, indicators `VALUE_IN_EUROS` and `QUANTITY_IN_100KG`.
- Fil: `research/external/dro-0906/eurostat-comext-cocoa-nl-be-de-to-nordics-hs1801-1806-2022-2024.csv`, 195 rader.

Største 2024-korridorer i uttrekket:

| Korridor | Verdi EUR | Volum t |
|---|---:|---:|
| DE -> SE | 170 970 645 | 22 571.143 |
| DE -> DK | 145 972 709 | 19 511.198 |
| NL -> SE | 141 108 585 | 17 359.737 |
| DE -> FI | 79 468 009 | 8 456.350 |
| NL -> NO | 77 769 589 | 8 846.453 |
| NL -> DK | 71 616 073 | 9 910.417 |

Konklusjon: Uttak-07s kvalitative EU-omvei er nå kvantifisert. Direkte CI-opprinnelse er fortsatt ikke bevist i disse Comext-radene; datasettet viser EU-eksportledd og HS-kapittel, ikke kakaobønnenes gårds-/landopprinnelse bak bearbeidede produkter.

## 5. F2-4 Finland HS1201 og fig3

- API: UN Comtrade preview, reporter 246 Finland, partner 0 world, HS1201, import, 2022-2024.
- Fil: `research/external/dro-0906/comtrade-finland-hs1201-soybeans-2022-2024.csv`.
- Tall: 2022 = 25 351.512 t; 2023 = 20 562.661 t; 2024 = 5 958.473 t.
- Forbehold: 2022 og 2024-radene er `is_net_wgt_estimated=true`; alle rader er `is_reported=false`/`is_aggregate=true` i preview-responsen.
- Figur: `fig3-norge-finland-proteinfor.svg` viser nå Finland HS1201 som 6,0 kt og har kildefotnote "uttak-08 + Finland HS1201 F2-uttak".

Konklusjon: Symmetrien i fig3 er nå fullført for 2024. Finland har liten HS1201-bønnestrøm i preview-dataene sammenliknet med Norge; hovedforskjellen i figuren står fortsatt på soyaform (Norge bønner, Finland mel).

## 6. F2-5 norsk 1201-splitt - dokumentert offentlig hull

Kilder kontrollert:

- Landbruksdirektoratet kraftforstatistikk, oppdatert 07.05.2026. Siden oppgir at råvarestatistikken publiseres årlig og er fordelt på vareslag, ikke på endelig verdikjede etter at råvaren er presset/prosessert.
- Nedlastet workbook: `landbruksdirektoratet-arlig-ravareforbruk-kraftfor-2026-05-07.xlsx`.
- Denofa-side `https://www.denofa.no/soya/` og 2024-aktsomhetsrapporter i `downloads/`.
- Skretting 2024 impact pages: `https://www.skretting.com/no/baerekraft/baerekraftsrapport/impact-report-2024-skretting-norway/use-of-vegetable-raw-materials-2024/` og `.../contents-of-fish-feed-2024/`.

Dokumenterte biter:

- Landbruksdirektoratet, husdyr-kraftfor 2025: soyamel 138 687 t totalt, hvorav 19 000 t importert og 119 687 t norskprosessert; soyaolje 5 691 t importert. 2024-raden i workbook: soyamel 108 366 t totalt, 7 583 t importert, 100 783 t norsk; soyaolje 4 974 t totalt, 4 937 t importert.
- Denofa oppgir på nettside at selskapet importerer om lag 450 000 t soyabønner årlig til Fredrikstad og foredler til mel, olje og lecitin. 2024-rapporten oppgir råvareopprinnelse i 2024: 68 % Brasil, 12 % Romania, 10 % Polen, 10 % Canada.
- Skretting Norway oppgir at soy protein concentrate var 16,6 % av gjennomsnittlig fiskefor i 2024. Dette er aktør-/produsentdata og ikke en nasjonal HS1201-allokering.

Konklusjon: Det finnes ikke som offentlig samlet split per 12.06.2026: norsk HS1201 soyabonnestrøm fordelt på fiskefor, husdyrfor og mat/industri. Trygg intern formulering:

> Norge importerer en stor HS1201-bønnestrøm som presses innenlands. Offentlig statistikk dokumenterer norskprosessert soyamel brukt i husdyr-kraftfor og Denofas prosess-/opprinnelsesmodell, mens fiskeforleddet kan dokumenteres som soyaproteinkonsentratandel hos aktører. En samlet, offentlig norsk 1201-splitt mellom fiskefor, husdyrfor og mat/industri er ikke funnet.

Ikke si: "347 000 tonn soya går til husdyrfor" eller "HS1201 importen er fiskefor" uten separat split. Neste kontrollrunde bør legge inn PCQ-rad for norsk 1201-splitt via Landbruksdirektoratet/SSB/Denofa/forbransjen.

## 7. F2-6 Strand et al. 2024 - metodebro Norge/Island

- Artikkel: Andrea Viken Strand, Shraddha Mehta, Magnus Stoud Myhre, Gudrun Olafsdottir og Nina Maria Saviolidis (2024), "Can higher resource utilization be achieved in demersal fish supply chains? Status and challenges from Iceland and Norway", Resources, Environment and Sustainability 16:100157.
- DOI: `https://doi.org/10.1016/j.resenv.2024.100157`.
- NVA/handle: `https://nva.sikt.no/registration/0198cc6b867f-2e9d70e0-9019-4bff-9bf4-1988f4578825`, `https://hdl.handle.net/11250/3178888`.
- Repo-locator/source note: `research/external/dro-0906/downloads/strand-etal-2024.md`.

Lesning:

- Side 1: artikkelen bruker litteratur og intervjuer, og bygger en konseptuell modell basert på material and information flows modelling technique (MIFMT). Den peker på manglende nasjonale data generert jevnlig for FLW som et viktig kunnskapshull, og på at Island har høyere utnyttelse i demersal sektor enn Norge.
- Side 3: Fig. 3/tekst gir omtrentlige utnyttelsesnivåer for demersal fisk: Norge fra under 40 % til ca. 60 %, Island rundt 80 %. Dette gjelder demersal fisk i artikkelens definisjon, ikke total norsk marint restråstoff 2024.
- Side 8-9: forskjellene forklares med data availability, utilization rate, regulatory/economic incentives, andelen helfiskeksport, tilgang til RRM, profitability, onboard technology og traceability.
- Side 10-11: MIFMT-appendiks viser sammenliknbar modellstruktur på tvers av land.

Konklusjon: Artikkelen er egnet som metodebro for å forklare hvorfor Island og Norge kan sammenliknes kvalitativt og strukturelt. Den er ikke tilstrekkelig til å slå sammen SINTEF/FHF total norsk restråstoffserie og SJA09114 direkte i én like-for-like KPI uten tydelig denominator og avgrensing (demersal vs. total sjømat, RRM vs. biproduktlandinger/eksportprodukter).

Trygg formulering:

> Strand et al. 2024 støtter en metodebro: Norge og Island kan sammenliknes gjennom material-/informasjonsflyt, regulering, insentiver og traceability, men tallene må holdes på hver sin denominator inntil en eksplisitt like-for-like serie er bygget.

## 8. F2-7 arkiv

Raw browser snapshots fra recovery-arbeidet er bevart i lokalt arkiv utenfor repo. Repo-locator for Enova current-state er `research/external/dro-0906/downloads/enova-wiig-prosjektside-current-404-2026-06-12.md`.

Cocoa Life: snapshot viser Freia og Marabou som Cocoa Life-merker, mass-balance-fotnote med 2024-volumer fra bl.a. Brazil, Côte d'Ivoire, Ecuador, Ghana, Indonesia, India og Nigeria, og "This page was updated in June 2025".

Enova: den tidligere Enova-teknologiportefølje-URL-en for Wiig/Green Horizon returnerte 12.06.2026 Enovas nye 404-side ("Beklager, vi finner ikke siden du leter etter"). Dermed er F2-7 lukket som arkiv av current state, ikke som verifikasjon av gammel prosjektside. For Enova som primærkilde må neste steg være Enova-data/arkiv/innsyn eller en gjenfunnet ny URL.

## 9. Operatørpunkt for F2-8

Ikke sendt av Codex. Gabriel sender innsynsteksten i `uttak-03-wiig-einnsyn.md` seksjon 3 til Klepp kommune. Når svar foreligger:

1. lagre svar/dokumenter som nye research-artefakter,
2. før mottak i mottaksfil,
3. oppdater PCQ/source-shortlist,
4. oppdater claim-lock og casestatus først etter kontroll.
