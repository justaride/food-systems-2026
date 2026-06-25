---
tittel: R12-VIZ-001 - Datakrav for ledd-profil-visualisering
status: Batch 04 visualiseringsunderlag - intern datakontrakt, ikke claim
id: R12-VIZ-001
priority: P0
theme: visualization
geo: Nordic
gate: internal
accessedAt: 2026-06-24
sourceClass: A med C-felt
---

# R12-VIZ-001 - Datakrav for ledd-profil-visualisering

## Kort dom

En ledd-profil-visualisering kan bygges, men bare som en datakontrakt som synliggjør kildeklasse og tomme celler. Batch 01-03 viser at import, fôr, slam, marint restråstoff, selvforsyning, lager og kontraktdata ofte har sterke A-ankre for enkelte celler, men C-hull for sluttbruk, aktørledd, lager, faktisk beholdning, nasjonal andel og harmonisert nordisk metode.

Visualiseringen bør derfor være en evidensmatrise per land og ledd, ikke en scorefigur. Tomme felt skal tegnes som egne markører med `gapType`, ikke glattes ut.

## Sterkeste kilde

- `research/external/r12/R12-VALUE-001-ledd-profil-import-norge.md`
- `research/external/r12/R12-FEED-002-forimportavhengighet-per-produksjon.md`
- `research/external/r12/R12-WASTE-001-marint-restrastoff-rstige.md`
- `research/external/r12/R12-WASTE-002-oppdrettsslam-massestrom.md`
- `research/external/r12/R12-RES-001-forkorrigert-selvforsyning-norden.md`
- `research/external/r12/R12-RES-002-beredskapslager-korn-for-gjodsel.md`
- `research/external/r12/R12-DIST-002-offentlige-matkontrakter-regionalt.md`

## Svakeste punkt

Datagrunnlaget er ikke likt per land eller ledd. Norge har flere A-ankre enn en harmonisert nordisk figur tåler; nordiske C-felt må vises som metodegap, ikke bli null, rangering eller fargekodet svikt.

## Datakontrakt

```csv
field,required,type,allowed_values,meaning,empty_cell_rule
profile_id,yes,string,,Stabil ID for figur-rad,Ingen rad uten ID
country,yes,string,NO|SE|DK|FI|IS|Nordic,Land eller nordisk aggregat,Ingen aggregat hvis metode ikke harmonisert
chain_stage,yes,string,input|import|primary|processing|distribution|consumption|waste_r9|preparedness,Verdikjedeledd,Ikke bland ledd
indicator,yes,string,,Navn på indikator,Ingen score uten indikator
period,yes,string,,År/sesong/periode,Tomt felt vises som missing period
unit,yes,string,tonn|kg|N|P|K|NOK|percent|count|text|unknown,Enhet,unknown vises eksplisitt
value,conditional,number|string,,Målt verdi eller kvalitativ status,Tom verdi er gyldig hvis gap_type finnes
value_status,yes,string,realized_volume|capacity|plan|potential|hypothesis|method_anchor|not_measured|not_public,Skiller statusnivå,Vis som egen kanal/ikon
source_locator,yes,string,,URL/lokal kilde,Ingen kilde = ikke figurrad
source_class,yes,string,A|B|C|mixed,Kildeklasse per celle,C må tegnes synlig
gap_type,yes,string,Type A|Type B|Type C|none,Hulltype per celle,Type C vises som funn
gate,yes,string,PCQ|source-shortlist|claim-lock|actor-gate|forstaelse|internal|parkert,Neste kontrollgate,Ingen ekstern figur uten gate
visual_role,yes,string,bar|matrix_cell|badge|annotation|disabled,Hvordan cellen kan tegnes,disabled for claim-nære usikre felt
ikke_si_ref,yes,string,,Lenke/tekst til overclaim-vakt,Må finnes for alle rader
```

## Funn-tabell

| Indikator/ledd | Land/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---|---|---|---|
| Importverdi/-mengde per varekode | NO, 1988-2025 | R12-VALUE-001 / SSB 08801 | A | Realisert import | Sluttbruk, importør, lager og sårbarhet er C-felt. |
| Fôrimportavhengighet per produksjon | NO, 2025-kilder | R12-FEED-002 | A med B/C | Metodeanker | Kraftfôr er ikke totalrasjon; akvakulturressursregnskap 2025 var pågående i batch 02. |
| Marint restråstoff utnyttet/ikke utnyttet | NO, 2024 | R12-WASTE-001 | A med metodecaveat | Realisert/rapportert | Utnyttet er ikke høyverdi; R-stige krever mapping. |
| Oppdrettsslam massestrøm | NO, 2025-kilder | R12-WASTE-002 | A med Type C | Datagap/metode | Modellert utslipp er ikke faktisk innsamlet volum. |
| Fôrkorrigert selvforsyning | NO + Nordic gap, 2024 | R12-RES-001 | A for NO, C for harmonisert Norden | Metodeanker | Ikke nordisk rangering uten metodebro. |
| Beredskapslager | Nordic, 2024-2026 kilder | R12-RES-002 | A med C | Mål/avtale/beholdning | Mål, avtale, kapasitet og faktisk beholdning må skilles. |
| Offentlige matkontrakter | NO regionalt, 2024-2026 sample | R12-DIST-002 | A med uttrekkshull | Ledger-kandidat | Sample er ikke nasjonal markedsandel. |

## Tomme celler

- Harmonisert nordisk ledd-profil finnes ikke som ett datasett.
- Sluttbruk per importkode er ikke direkte målt i SSB 08801.
- Lager, kontrakt, importør og omdirigerbarhet er ofte aktør-/beredskapsgate.
- Oppdrettsslam mangler realisert nasjonal innsamlet-volumserie.
- Nordic fôrkorrigert selvforsyning mangler metodebro.
- Doffin-ledger mangler komplett CPV/procedure/value-uttrekk før nasjonale andeler.

## Ikke-si

- Ikke lag en radar/spider-score av blandede A/C-celler.
- Ikke gjør tomme celler til nullverdier.
- Ikke vis plan, kapasitet, potensial og realisert volum med samme visuelle encoding.
- Ikke sammenlign nordiske land når metodegrunnlaget ikke er harmonisert.
- Ikke la fargevalg antyde modenhet eller svikt uten `source_class` og `gap_type`.

## Anbefalt gate

Internal. Importer som datakontrakt for senere visualisering. Neste steg er å lage en liten maskinlesbar `profiles.csv` der hver celle bærer `source_class`, `gap_type`, `value_status` og `gate`.

