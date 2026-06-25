---
tittel: R12-VIZ-005 - Whitepaper og deck uttaksoversikt
status: Batch 12 visualiseringsunderlag - intern uttaksoversikt, ikke ferdig tekst
id: R12-VIZ-005
priority: P2
theme: visualization
geo: Internal
gate: internal
accessedAt: 2026-06-24
sourceClass: A/B/C blandet
---

# R12-VIZ-005 - Whitepaper og deck uttaksoversikt

## Kort dom

R12-batchene har flere kandidater for figur, tabell og casekort, men ingen bør løftes direkte til whitepaper/deck uten gate-status. De sterkeste uttakene nå er kontrollflater: import-/fôr-/beredskapsmatriser med C-felt, datagapfigur, actor-gate-kart og governance-/kausalkart som eksplisitt hypotese.

Oversikten bør brukes som intern kø: hvert uttak får formatforslag, kildeklasse, svakeste punkt, gate og hva som må lukkes før ekstern bruk.

## Sterkeste kilde

- Batch 01-05 beslutningslogger under `research/_status/food-tg-r12/decisions/`
- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`
- `research/forstaelse/R12-VIZ-003-kausalkart-l1-l5.md`
- `docs/project/mandates/R12-VIZ-004-datagap-figur-underlag.md`

## Svakeste punkt

Mange kandidater er kildeankre eller datakontrakter, ikke ferdige claims. Flere har A-kilde for en celle og C-hull for nabocellen; derfor kan de brukes som figurer bare hvis usikkerheten er synlig i selve uttaket.

## Uttaksoversikt

| Uttak-ID | Kandidat | Format | R12-anker | Modenhet | Gate | Svakeste punkt | Neste kontroll |
|---|---|---|---|---|---|---|---|
| U01 | Importledd Norge med synlige C-felt | Matrise/tabell | R12-VALUE-001 | Høy for import, lav for sluttbruk | PCQ | Sluttbruk/aktør/lager mangler | PCQ per celle |
| U02 | Fôrimportavhengighet per produksjon | Metodetabell | R12-FEED-002 | Middels | PCQ | Kraftfôr er ikke totalrasjon | Arts-/fraksjonsmetode |
| U03 | Fiskeoljeimport Mauritania smal kilde | Kildekort | R12-FEED-001 | Høy for HS 1504 import | PCQ/claim-lock kandidat | Art/sluttbruk ikke synlig | Presis claim-lock tekst |
| U04 | Beredskapslager mål vs faktisk beholdning | Gap-matrise | R12-RES-002 | Middels | PCQ | Beholdning/lagring ofte ikke åpent | Skille mål/avtale/kapasitet/beholdning |
| U05 | Forkorrigert selvforsyning Norge vs nordisk metodegap | Metodekort | R12-RES-001 | Høy for NO, lav nordisk | PCQ | Ingen harmonisert nordisk indikator | Ikke-rangerende figur |
| U06 | Marint restråstoff R-stige | R-stige-tabell | R12-WASTE-001 | Middels | PCQ | Utnyttet er ikke høyverdi | Rapporttabell og R-mapping |
| U07 | Oppdrettsslam massestrømgap | Sankey-gap / not-measured card | R12-WASTE-002 | Middels som gap | PCQ | Faktisk innsamlet volum mangler | Standard massestrøm |
| U08 | Digestat N/P/K-retur Sverige + nordisk gap | Matrise | R12-WASTE-003 | Høy SE, lav Norden | PCQ | Definisjonsbro mangler | Land-for-land metode |
| U09 | Kaffegrut som urbant datagap | Casekort/datamine | R12-WASTE-004 | Lav til middels | source-shortlist | Import er ikke konsum; grut ikke egen fraksjon | Metode- og actor-gate |
| U10 | Offentlige matkontrakter regionalt | Ledger/tabell | R12-DIST-002 | Middels | PCQ | Sample ikke nasjonal andel | Full Doffin-uttrekk |
| U11 | Actor-gate kart: markedshage/andelslandbruk/KVANN/nordisk kontekst | Kandidatkart | R12-ACTOR-001/003/004/005 | Middels som kart, lav som register | actor-gate | Aktiv status per aktør mangler | Primærlokator per aktør |
| U12 | REKO organisering og tallgap | Kildekort | R12-ACTOR-002 | Middels | source-shortlist | Oppdaterte tall ikke åpne | Årsmelding/primæruttrekk |
| U13 | Governance-sløyfen | Hypotesekart | R12-GOV-001 | Middels som forståelse | forstaelse | Kausal effekt ikke målt | Hypoteseetikett |
| U14 | Ansvarsmatrise matberedskap | Tabell | R12-GOV-002 | Høy for hjemmel, lav for effekt | PCQ | Effekt ikke målt; fylkesrolle indirekte | Presis hjemmelstekst |
| U15 | Datagapfigur | Figurunderlag | R12-VIZ-004 | Høy internt | internal | Scope er batchbasert | Datagap-CSV |
| U16 | Kausalkart L1-L5 | Hypotesefigur | R12-VIZ-003 | Høy internt | forstaelse | Piler ikke målt kausalitet | Evidensstyrke per pil |

## Formatregler

| Format | Krav før uttak | Ikke tillatt |
|---|---|---|
| Figur | `source_class`, `gap_type`, `gate`, `value_status` per celle | Score/rangering av blandede A/C-felt |
| Tabell | Lokator, periode, enhet og caveat per rad | Tomme celler skjult eller fylt med null |
| Casekort | Primærlokator for aktør/case og gate | Kandidat som verifisert aktør |
| Kildekort | Eksakt kilde, år/periode og svakeste punkt | Sekundærkilde som primær |
| Hypotesekart | Evidensstyrke per pil og forstaelse-gate | Kausalitet uten effektmåling |

## Tomme celler

- Ingen uttak er merket som ferdig ekstern claim.
- Flere kandidater mangler presis claim-lock-tekst.
- Actor-kart mangler radvis aktiv status og produksjonsdata.
- Nordiske sammenligninger mangler metodebro for flere indikatorer.
- Governance- og kausalkart mangler målt effekt per pil.

## Ikke si

- Ikke skriv whitepapertekst direkte fra R12-output.
- Ikke lag deckfigur uten synlig gate/status.
- Ikke gjøre PCQ-kandidat til claim-lock.
- Ikke bruke actor-gate-kandidater som verifiserte aktører.
- Ikke la en figur antyde null der cellen egentlig er ikke målt, ikke åpen eller aktørgate.
- Ikke blande realisert volum, kapasitet, plan, potensial og hypotese i samme visuelt likestilte serie.

## Anbefalt gate

`internal`. Bruk som uttakskø for senere PCQ, claim-lock, source-shortlist og actor-gate. Neste steg er å velge 3-5 uttak og lage egne claim-lock-/PCQ-kort med nøyaktig tekst og caveat.
