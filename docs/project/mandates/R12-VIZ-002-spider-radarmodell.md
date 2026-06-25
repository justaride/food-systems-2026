---
tittel: R12-VIZ-002 - Spider/radarmodell
status: Batch 11 internal - visualiseringsspesifikasjon, ikke score
id: R12-VIZ-002
priority: P1
theme: visualization
geo: Internal
gate: internal
accessedAt: 2026-06-24
sourceClass: internal with explicit C cells
---

# R12-VIZ-002 - Spider/radarmodell

## Kort dom

En spider/radarmodell kan bare brukes som intern eksplorasjonsflate, ikke som ekstern rangering. Aksene økonomi, miljø, beredskap og implementeringstid er meningsfulle, men hver akse må ha kildebelagt celle, `value_status`, `source_class`, `gap_type` og `gate`. Score uten kilde skal være tom/null som missing evidence, ikke 0 som prestasjon.

## Sterkeste kilde

- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`
- `research/forstaelse/R12-GOV-001-governance-impotens-sloyfen.md`
- `research/external/r12/R12-GOV-002-ansvarsmatrise-matberedskap.md`
- Batch 01-05 beslutningslogger i `research/_status/food-tg-r12/decisions/`

## Svakeste punkt

R12-outputene er ikke et harmonisert scoregrunnlag. Mange celler er A-kildeankre med C-hull, og flere indikatorer beskriver metode, plan, kapasitet eller potensial heller enn realisert effekt. En radarfigur vil derfor lett skjule tomme celler hvis den tegnes som glatt polygon.

## Modellkontrakt

```csv
field,required,type,allowed_values,meaning,empty_cell_rule
model_item_id,yes,string,,Tiltak/case/ledd som vurderes,Ingen rad uten stabil ID
axis,yes,string,economy|environment|preparedness|implementation_time,Radarakse,Ingen annen akse uten ny kontrakt
indicator,yes,string,,Målt eller vurdert indikator,Ingen score uten indikator
period,yes,string,,År/periode for kilden,Vis missing period
unit,yes,string,NOK|tonn|percent|count|months|qualitative|unknown,Enhet,unknown må tegnes som usikkerhet
value,conditional,number|string,,Verdi eller kvalitativ status,Tom verdi er lov hvis gap_type finnes
score,conditional,number,0-5,Intern normalisert score,Skal være null/tomt hvis source_class C eller gate ikke er internal/PCQ
score_basis,yes,string,measured|derived|expert_judgement|not_scored,Hvordan score er laget,not_scored tegnes ikke som polygonpunkt
value_status,yes,string,realized_volume|capacity|plan|potential|hypothesis|method_anchor|not_measured|not_public,Skiller realitet fra hypotese,Tomme felt vises som gap
source_locator,yes,string,,URL/lokal kilde,Ingen kilde = ingen score
source_class,yes,string,A|B|C|mixed,Kildeklasse per celle,C/mixed markeres visuelt
gap_type,yes,string,Type A|Type B|Type C|none,Hulltype per celle,Type B/C skal vises som hatch/ikon
gate,yes,string,PCQ|source-shortlist|claim-lock|actor-gate|forstaelse|internal|parkert,Neste kontrollgate,Ingen ekstern figur uten gate
ikke_si_ref,yes,string,,Overclaim-vakt per rad,Må finnes
```

## Aksedefinisjon

| Akse | Spørsmål | Tillatt datastatus | Eksempelindikator | Caveat |
|---|---|---|---|---|
| Økonomi | Hva sier åpne kilder om kostnad, margin, marked eller finansierbarhet? | A/B for kilder; C synlig for aktørdata | BFJ/NIBIO marginanker, funding-fit, CAPEX/OPEX hvis aktørkilde | Ikke bruk støtte/finansiering som bevis på lønnsomhet. |
| Miljø | Hva er dokumentert miljø-/ressursmekanisme? | A for offisiell statistikk/fagrapport; B for LCA/review; C for lokal effekt | restråstoff, digestat, slam, bioøkonomi, sidestrøm | Ikke bland potensial og realisert volum. |
| Beredskap | Hva styrker forsyningssikkerhet, lager, diversitet eller lokal robusthet? | A for policy/statistikk; C for faktisk robusthet der ikke målt | fôrkorrigert selvforsyning, beredskapslager, importnoder | Beredskap er ikke selvforsyningsprosent alene. |
| Implementeringstid | Hvor raskt kan tiltaket bevege seg fra kunnskap til praksis? | B/C ofte; A bare når plan/frist/vedtak er kildebelagt | reguleringsterskel, funding readiness, actor-gate behov | Implementeringstid er modellfelt, ikke faktaclaim, før aktørplan finnes. |

## Visual rule

- Ikke tegn én sammenhengende polygon når en akse har `not_scored`, `source_class=C`, `gap_type=Type B/C` eller `gate=parkert`.
- Tegn i stedet radaren som fire uavhengige aksepunkter med missing markers.
- Bruk egen visuell kanal for `value_status`: realisert, kapasitet, plan, potensial, hypotese.
- Vis `gap_type` som ikon/hatch, ikke som lav score.
- Intern score kan brukes til prioritering, men må aldri eksporteres uten PCQ/claim-lock.

## Funn-tabell

| Modellbruk | Kildegrunnlag | Kildeklasse | Hulltype | Anbefalt status |
|---|---|---|---|---|
| Sammenligne tiltak for intern prioritering | Batch 01-05 + GOV-003/004/005 | mixed | Type A/B/C | Tillatt hvis missing cells vises. |
| Ekstern figur i deck | Ikke modent | C for flere akser | Type B/C | Ikke tillatt nå. |
| Casekort for ett tiltak | Mulig hvis per-celle kilde finnes | A/B/C per celle | Avhenger av case | Kun som datakort med ikke-si. |
| Finansieringsfit-radar | R12-GOV-005 | A/B med C-felt | Type A/B | Intern go/no-go, ikke markedsføring. |
| Implementeringsbarriere-radar | R12-GOV-004 | B med A/C | Type A/B/C | Source-shortlist, ikke generell teknologidom. |

## Tomme celler

- Ingen harmonisert metode for å normalisere økonomi, miljø, beredskap og implementeringstid til 0-5.
- Ingen aktørdata for faktisk CAPEX/OPEX, margin eller implementeringstid for mange tiltak.
- Ingen ekstern beslutning om vekting mellom aksene.
- Ingen claim-lock på radarens språk eller legende.

## Ikke-si

- Ikke si at en radar-score er Food TGs fasit.
- Ikke gjøre tomme celler til nullprestasjon.
- Ikke sammenligne tiltak med ulike kildetyper uten synlig kildeklasse.
- Ikke la "implementeringstid" late som tidsplan når det bare er vurdering.
- Ikke la glatt polygon skjule at en akse er parkert eller actor-gate.

## Anbefalt gate

`internal`. Importer som modellspesifikasjon. Neste steg er en liten test-CSV med 3-5 tiltak der minst én akse bevisst er tom, for å verifisere at visualiseringen viser gap i stedet for å fylle dem.
