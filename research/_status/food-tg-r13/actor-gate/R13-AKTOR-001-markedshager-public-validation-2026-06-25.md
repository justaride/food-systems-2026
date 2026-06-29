# R13-AKTOR-001 - actor-gate validation packet

**Dato:** 2026-06-25
**Status:** actor-gate, ikke lukket
**Bruksregel:** Intern kontroll. Ikke publiser totalantall, kart eller nettverksgraf.

## Kort dom

Markedshager har gode offentlige nettverks- og kartlokatorer, men lavfriksjonsvalideringen stopper ved kandidatflate. Aktiv drift, areal, salg og produksjonsvolum krever produsentens egen side, registerspor eller direkte bekreftelse per markedshage.

## Dataeier- og valideringsrad

| Felt | Mulig dataeier | Offentlig lavfriksjon-lokator | Krever kontakt? | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|---|
| aktiv-status | produsent, Markedshager Norge, Småskala Grønt Norge | Markedshager Norge kart og produsentside | ja/nei | datert produsentside/register/bekreftelse | kart/API alene er ikke nok |
| produsentidentitet | produsent, Brreg, Debio der relevant | produsentens egen nettside, Økoguiden | ja/nei | navn, sted, orgnr eller stabil kontaktlocator | nettverkstreff uten identitet |
| areal/volum | produsent | sjelden offentlig | ja | målt areal, omsetning eller produksjonsvolum med periode | egeninnmeldt kartpunkt |
| dedupe | Markedshager Norge, Økoguiden, NLR, regionale lister | åpne kart/API | nei/ja | radvis kobling med kilde og dato | dobbeltelling |

## Kandidat-/dekningstabell

| Kandidat/node | Locator | Kildeklasse | Aktiv-status | Dekningscaveat | Tom celle |
|---|---|---|---|---|---|
| Markedshager Norge kart | `markedshage.no/markedshager-i-fylkene/` | A/B | ukjent per produsent | egeninnmeldt nettverkskart | full CSV |
| Småskala Grønt Norge | Markedshager Norge nyhet 2026 | A/B | organisasjon aktiv | medlemskanal, ikke produsentregister | medlemstall |
| Økoguiden Markedshage | Økoguiden API/kategori | A/B | ukjent | 10 treff i uttak, ikke totalregister | per-aktør status |
| Bøtun, Undeland, Korsviken, Ål, Dokka | Økoguiden-lokatorer | B/C | ukjent | eksempler, ikke komplett liste | 2026 drift |

## Før eventuell DASK/AASK

- Be om eksport eller liste med produsentnavn, sted, aktiv 2025/2026-status og primærlocator.
- Definer dedupe-regel mellom Markedshager Norge, Økoguiden, Småskala Grønt, NLR og regionale lister.
- Ikke estimer nasjonalt antall, areal eller produksjon fra kartflaten.

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke publiser totalantall eller kart fra kandidatflate.
- Ikke gjør medlemskap, karttreff eller selvbeskrivelse til produksjons-/effektbevis.
