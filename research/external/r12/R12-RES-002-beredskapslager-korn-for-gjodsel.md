# R12-RES-002 - Beredskapslager korn for gjodsel

**Dato:** 2026-06-24  
**Status:** Batch 03 output - underlag, ikke claim  
**Gate:** PCQ  
**Beslutning:** enrich

## Kort dom

Nordiske beredskapslager er ikke ett sammenlignbart tallfelt. Norge har et politisk maltall for matkornlager mot 2029 og tidlige realiserte avtaler; Finland har en etablert NESA-modell med offentlig mal i maneders forbruk, men ikke apen detaljert tonnasje; Sverige er i oppbygging med forste nordlige kornlager og planlagte innsatsvarelager; Danmark viser apne forbruker-/mattrygghetsberedskapssider, men ikke tilsvarende statlig korn/for/gjodsel-lager i kildene her. Tonnasje og plassering ma i flere land sta som C eller klassifisert/ikke apent.

## Sterkeste kilde

Jordbruksverket, `Beredskapslager av spannmål och insatsvaror`, og Huoltovarmuuskeskus/NESA, `National Emergency Supply Agency boosting Finland's emergency grain stockpiles`. Lokatorer:

- `https://jordbruksverket.se/beredskap/sveriges-livsmedelsberedskap/beredskapslager-av-spannmal-och-insatsvaror`
- `https://www.huoltovarmuuskeskus.fi/en/a/national-emergency-supply-agency-boosting-finlands-emergency-grain-stockpiles`

## Funn-tabell

| Felt | Land | Ar/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---:|---|---|---|---|
| Matkornlager, mal | Norge | mot 2029 | Regjeringen Prop. 1 S 2025-2026 / LMD omtale | A | Plan/mal | 82 500 tonn er mal, ikke ferdig realisert lager. |
| Matkornlager, tidlig avtale | Norge | 2024-2025 | Regjeringen/AP-omtale via sekundare treff, ma PCQ-es | B | Realisert avtaleindikasjon | Bruk ikke uten primar lokator til kontrakt/kunngjoring. |
| Kornlager, minimum | Finland | 2022-dekretmal | NESA | A | Plan/beredskapsmal | Minst seks maneder human konsum; detaljert innhold/lokasjon er ikke apent. |
| Kornlager, etter ekstra anskaffelse | Finland | 2022 | NESA | A | Plan/kapasitet | Ca. 8,5 maneder etter anskaffelse; ikke tonnserie per lager. |
| Kornlager | Sverige | 2025-2028 | Jordbruksverket | A | Oppbygging/realisering starter | Forste lager i nord er pa plass/rammeavtaler; total nasjonal tonnasje ikke komplett. |
| Innsatsvarer: mineralgjodsel, plantevern, utsad, proteinfor | Sverige | 2026-2028 | Jordbruksverket | A | Planlagt oppbygging | Behov beregnes ut fra ett vekstodlingsar; faktiske mengder kan bli C. |
| Statlig korn/for/gjodsel-lager | Danmark | 2026 sok | Styrelsen for Fodevarer, Landbrug og Fiskeri | C | Ikke funnet | Apne sider dekker mattrygghet/kriserad, ikke statlig lagerstatus. |
| Lagerplassering og detaljert beholdning | Norden | lopende | myndigheter/beredskap | C | Tom/klassifisert celle | Ma ikke fylles med estimat. |

## Tomme celler

- Apne, sammenlignbare tonnserier for faktisk beholdning per land.
- Apne lagringssteder og kapasiteter, som ofte er sikkerhets- eller beredskapssensitivt.
- Separat offentlig status for forlager og gjodsellager i Norge/Danmark/Finland pa samme detaljeringsniva som Sveriges nye oppbyggingsside.

## Ikke si

- Ikke si at mal, budsjett, anskaffelse, rammeavtale og faktisk beholdning er samme ting.
- Ikke si at 82 500 tonn i Norge er ferdig realisert lager.
- Ikke si at Finlands manedsdekning kan oversettes til tonn uten kilde.
- Ikke si at fravaer av apen dansk lagerkilde betyr at Danmark mangler all beredskap.
- Ikke oppgi lagersted eller tonnasje hvis kilden ikke selv apner det.

## Anbefalt gate

PCQ. Importer som beredskapsmatrise med egne kolonner for `mal`, `realisert avtale`, `faktisk beholdning`, `kapasitet`, `klassifisert/ikke apent` og `kildeklasse`.

