---
tittel: R12-VIZ-004 - Datagap-figur-underlag
status: Batch 12 visualiseringsunderlag - intern datagapflate, ikke claim
id: R12-VIZ-004
priority: P1
theme: visualization
geo: Nordic
gate: internal
accessedAt: 2026-06-24
sourceClass: A/B/C blandet
---

# R12-VIZ-004 - Datagap-figur-underlag

## Kort dom

Datagap kan bli egen figur, men figuren må vise hva som ikke måles, hvem som sannsynligvis eier feltet, og hva som skal til for å lukke hullet. Batch 01-05 viser særlig C-hull for sluttbruk per importkode, nasjonale innsamlede slamvolum, nordisk metodeharmonisering, faktisk beredskapsbeholdning, lokal produsentandel i kontrakter og radvis aktørstatus.

Dette er et internt figurunderlag. Tomme celler skal tegnes som funn med `gapType`, ikke som null, grå pynt eller skjult fravær.

## Sterkeste kilde

- `research/_status/food-tg-r12/decisions/batch-01.jsonl`
- `research/_status/food-tg-r12/decisions/batch-02.jsonl`
- `research/_status/food-tg-r12/decisions/batch-03.jsonl`
- `research/_status/food-tg-r12/decisions/batch-04.jsonl`
- `research/_status/food-tg-r12/decisions/batch-05.jsonl`
- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`

## Svakeste punkt

Datagap-tabellen bygger på batch-output, ikke på en full nordisk systematisk revisjon. Den er god nok til intern figurspesifikasjon og prioritering, men ikke til å hevde at et felt definitivt ikke finnes i alle land eller hos alle aktører.

## Datagap-tabell

| Gap-ID | Hva måles ikke / er ikke åpent | Hvem eier trolig feltet | R12-anker | Kildeklasse | Hulltype | Hva skal til | Figurrolle |
|---|---|---|---|---|---|---|---|
| G01 | Sluttbruk per HS/importkode | SSB/tollstatistikk + importører/aktører | R12-VALUE-001, R12-FEED-001 | A med C | Type C/B | Metodebro eller aktørdata for sluttbruk | Import-ledd C-celle |
| G02 | Importør, lagerhold og omdirigerbarhet | Importører, grossister, beredskapsmyndigheter | R12-VALUE-001, R12-RES-002 | C | Type B/C | Aktør-/beredskapstilgang | Beredskapsgap |
| G03 | Total fôrrasjon/importandel per produksjon | Landbruksdirektoratet/NIBIO/aktører/FHF | R12-FEED-002 | A med B/C | Type A/B/C | Kontrollert metode og arts-/fraksjonstabell | Metodegap |
| G04 | Harmonisert nordisk fôrkorrigert selvforsyning | Nasjonale statistikkmiljøer | R12-RES-001 | A for NO, C Norden | Type C | Felles metodebro | Nordisk sammenligningsgap |
| G05 | Faktisk beredskapsbeholdning/lagersted per land | Statlige beredskapsorganer/kontraktører | R12-RES-002 | A med C | Type C | Åpne beholdningstall eller klassifisert-statusfelt | Klassifisert/ikke åpent |
| G06 | Nasjonal leverandørandel i offentlige matkontrakter | Doffin/anskaffelsesdata/oppdragsgivere | R12-DIST-002 | A med uttrekkshull | Type A/C | Komplett CPV/procedure/value-uttrekk | Uttrekkshull |
| G07 | Per-kg-margin etter kjøperprisavtale | TINE/Nortura/KLF/produsenter | R12-FARM-002 | B/C | Type B | Avregning, kontrakt, kostnadsgrunnlag | Actor-gate |
| G08 | Nasjonal faktisk innsamlet oppdrettsslamserie | Havbruksaktører, myndigheter, prosjekter | R12-WASTE-002 | A med C | Type C | Standardisert massestrøm og rapporteringsserie | Massestrømgap |
| G09 | R-stige for marint restråstoff per kategori | SINTEF/FHF + metodeansvarlig | R12-WASTE-001 | A med Type A | Type A | Rapporttabelluttrekk og R-nivåmapping | Metode-/klassifiseringsgap |
| G10 | Nordisk N/P/K-retur fra digestat | Nasjonale biogass-/avfallsmyndigheter | R12-WASTE-003 | A SE, C Norden | Type C | Land-for-land definisjonsbro | Harmoniseringsgap |
| G11 | Norsk kaffegrut som egen avfallsfraksjon | SSB/kommuner/renovasjon/HORECA | R12-WASTE-004 | A/B/C | Type C/B | Separat fraksjon eller aktørgjennomstrømning | Avfallsfraksjonsgap |
| G12 | Aktiv status per markedshage/andelslandbruk/skoghage | Aktørene selv, nettverk, kartforvaltere | R12-ACTOR-001/003/004/005 | A/B med C | Type B/C | Per-aktør primærlokator og dedup | Actor-gate |
| G13 | Virkemiddel til målt strukturendring | Departement/tilsyn/forskning | R12-GOV-001 | A med C | Type C | Evalueringsserie | Effektgap |
| G14 | Fylkeskommunal matberedskapsrolle | Lov-/policykilder, fylkeskommuner | R12-GOV-002 | B/C | Type A/B/C | Presis hjemmel og praksisdokumentasjon | Ansvarshull |
| G15 | Oppdaterte REKO-tall ringer/produsenter/kunder | REKO Norge/lokale ringer/plattformer | R12-ACTOR-002 | A organisering, C tall | Type A/B/C | Årsmelding eller primæruttrekk | Tellehull |

## Figurkontrakt

```csv
gap_id,theme,field_missing,likely_owner,source_anchor,source_class,gap_type,gate,closure_action,show_as
G01,value-chain,end_use_per_import_code,SSB/importers,R12-VALUE-001,A_with_C,Type_C_or_B,PCQ,method_bridge_or_actor_data,visible_empty_cell
G08,waste-r9,national_collected_fish_sludge_series,actors/authorities,R12-WASTE-002,A_with_C,Type_C,PCQ,standard_mass_flow_series,visible_structural_gap
G12,actor-map,active_actor_status,actor/network,R12-ACTOR-001_003_004_005,A_B_C,Type_B_or_C,actor-gate,primary_locator_per_actor,actor_gate_badge
```

## Tomme celler

- Flere gap kan bare klassifiseres som "ikke funnet i batchen", ikke endelig fravær.
- Figurgrunnlaget mangler fortsatt full land-for-land revisjon for DK, SE, FI og IS.
- Felt som er klassifisert eller sikkerhetssensitivt må vises som `not_public/classified`, ikke som datafeil.
- Actor-gate-felt har ofte kilder for nettverk, men ikke for aktiv status eller produksjon.

## Ikke si

- Ikke si at Type C betyr at funnet er svakt.
- Ikke si at et gap beviser at ingen måler feltet noe sted.
- Ikke gjøre tomme celler om til nullverdier.
- Ikke fargekode C som "dårlig aktør" eller "svikt" uten ansvar-/hjemmelgrunnlag.
- Ikke bland Type A uttrekkshull med Type B aktørgate og Type C strukturelt fravær.
- Ikke gjør datagapfiguren ekstern uten forklaring av metode og scope.

## Anbefalt gate

`internal`. Bruk som intern datagapfigur og prioriteringsflate. Neste steg er å lage maskinlesbar `datagaps.csv` der hver rad har `gap_id`, `theme`, `source_anchor`, `gap_type`, `owner`, `closure_action` og `figure_label`.
