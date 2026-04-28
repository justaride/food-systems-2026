# Bærekraftsutfordringer i nordiske matsystemer — råinput 2026-04-28

**Status:** Internt input-korpus. Ikke siterbart som primærkilde.
**Innhentet:** 28. april 2026
**Metode:** Eksplorerende syntese (Claude.ai-samtaler) for å sammenstille publisert forskning, statistikk og policy-dokumenter på tvers av Norge, Sverige, Danmark, Finland og Island.

## Filer

| Fil | Scope |
|---|---|
| `baerekraft-norden-2026-04-28.md` | Nordisk overblikk + komparativ analyse av alle fem land. Dekker matsvinn, fôr/soya, biogass, kostråd, eutrofiering, forskningsinfrastruktur. |
| `baerekraft-norge-2026-04-28.md` | Norge — full verdikjedeanalyse. Lakseoppdrett/soya, matsvinn-bransjeavtalen, matkasteloven, selvforsyning, Bionova. |
| `baerekraft-sverige-2026-04-28.md` | Sverige — Livsmedelsstrategin 2.0, Riksrevisionens kritikk 2025, biogass, kjøttforbruk-nedgang, restaurantsvinn-økning. |
| `baerekraft-danmark-2026-04-28.md` | Danmark — Green Tripartite Agreement, soya-sporbarhet (IFRO 2025), biogass-klyngene, plant-based fund. |
| `baerekraft-finland-2026-04-28.md` | Finland — Valio/Suomen Lantakaasu, torvmyr-paradokset, Luke-rammeverk, Härkis/Beanit. |
| `baerekraft-island-2026-04-28.md` | Island — fiskeri 99,7 % utnyttelse, Kerecis, geotermiske drivhus, importavhengighet. |
| `research-norway-data-landscape-2026-04-28.md` | Datalandskapet i Norge — bransjeavtalens hovedrapport, sektorrapporter, SSB-avfallsregnskap. |

## Hvordan bruke

1. **Som idé- og hypotesegenerator** for Food TG-arbeidet (særlig track A fôr/import og track B sidestrømmer/næringsstoffer).
2. **Som kildekartlegger** — alle eksterne kilder notatene siterer er candidates for `source-shortlist-food-tg.md`. Verifiser alltid mot primærkilden før noe siteres i et leveransedokument.
3. **Ikke som siterbar evidence i seg selv.** Notatene er Claude.ai-syntese og kan inneholde feiltolkninger, gamle tall eller hallusinerte referanser. Bruk dem som rutekart, ikke som karakterprøve.

## Kobling til prosjektet

Notatene har tett overlapp med:
- `track-brief-a-feed-import.md` (Skretting/Denofa-soyaspor, FCR 1,15, EUDR-risiko)
- `track-brief-b-sidestreams-nutrients.md` (Valio/Suomen Lantakaasu, Kerecis, Arla-myse, biogass-flow)
- `dossier-a-feed-import-eudr-triangulation.md` (1,2–1,7 mill. t dansk soya-import med 6 % fysisk sporbarhet — IFRO/KU 2025)
- `dossier-b-marine-nutrient-loops.md` (akvakultur-slam, fosforgjenvinning)
- `claim-register-food-tg.md` (407 000 t matsvinn 2024, 24 % reduksjon, Sverige-stagnasjon som motsigelse mot CL-B-001)

## Gap-analyse (per 2026-04-28)

Sammenligning mot databasen identifiserte:
- **25+ kritiske aktører** mangler i `src/lib/data/actors.ts` (Denofa, Valio, Danish Crown, Suomen Lantakaasu, Kerecis, Matís, Concito m.fl.)
- **15 kilder** mangler i `source-shortlist-food-tg.md` (NIBIO sektorrapporter, IFRO/KU soya 2025, Riksrevisionen 2025, Luke balance sheet, EEA Country Profiles 2025, Concito Q&A om Green Tripartite m.fl.)
- **10 nye fakta** bør inn i `claim-register-food-tg.md`
- **1 motsigelse** — Sverige HORECA-svinn øker (73 → 104 kt 2018-2023), motsier CL-B-001s antagelse om gjennomgående reduksjon

Tiltakene følges opp i samme branch som denne arkiveringen (`food-tg/nordic-baerekraft-notes-2026-04-28`).
