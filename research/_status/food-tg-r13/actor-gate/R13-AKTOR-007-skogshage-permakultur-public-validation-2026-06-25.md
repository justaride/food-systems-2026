# R13-AKTOR-007 - actor-gate validation packet

**Dato:** 2026-06-25
**Status:** actor-gate, ikke lukket
**Bruksregel:** Intern kontroll. Ikke publiser totalantall, kart eller nettverksgraf.

## Kort dom

Skogshage- og permakulturfeltet har kart-, kurs-, nettverks- og faglokatorer, men ikke et verifisert site-inventory. Lavfriksjonsvalidering kan identifisere kandidater og metodekilder; aktiv drift, eier, site-type og produksjonsomfang må bekreftes per sted.

## Dataeier- og valideringsrad

| Felt | Mulig dataeier | Offentlig lavfriksjon-lokator | Krever kontakt? | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|---|
| aktiv-status | site-eier, Norsk Permakulturforening, KVANN | kart, site-side, kurs-/prosjektside | ja/nei | datert site-side eller eierbekreftelse | kartinnmelding er ikke nok |
| site-type | site-eier/nettverk | skogshagekart, Agropub, KVANN | ja/nei | skogshage, permakultur-site, planteskole, kurssted eller privat hage | blandet kategori |
| eier/kontakt | site-eier/nettverk | offentlig kontaktpunkt | ja | kontakt eller organisasjonsfelt med publiserbarhet | anonym/privat hage |
| produksjon/matbidrag | site-eier | sjelden åpent | ja | målt produksjon, salg eller bruksform | kurslokator alene |

## Kandidat-/dekningstabell

| Kandidat/node | Locator | Kildeklasse | Aktiv-status | Dekningscaveat | Tom celle |
|---|---|---|---|---|---|
| Norsk Permakulturforening skogshagekart | `permakultur.no/nettverk/skoghager/` | A/B | ukjent per site | innmeldt kart, ikke verifisert drift | site-status |
| KVANN flerårige/skoghage | `kvann.no` | B | nettverk aktiv | ikke site-register | node/site-kobling |
| Stephen Barstow/KVANN | KVANN-arrangement | B | person-/arrangementslokator | ikke produksjonssite | sitefelt |
| Agropub/NORSØK skogshage | Agropub fagartikkel | A/B | metodekilde | ikke aktørregister | sites |
| NØF/Lavt og sakte kurs | kurslokatorer | B | ukjent | kurs er ikke permanent matskog | aktiv drift |

## Før eventuell DASK/AASK

- Be Norsk Permakulturforening/KVANN om site-liste med eier, sted, type og aktiv-status der publiserbart.
- Skill karttreff, KVANN-noder, kurs, private hager, planteskoler og matproduserende sites.
- Ikke lag nasjonalt antall eller kart før dekning og verifikasjonsdato er synlig.

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke publiser totalantall eller kart fra kandidatflate.
- Ikke gjør medlemskap, karttreff eller selvbeskrivelse til produksjons-/effektbevis.
