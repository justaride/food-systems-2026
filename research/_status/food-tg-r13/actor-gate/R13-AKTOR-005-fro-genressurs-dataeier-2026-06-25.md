# R13-AKTOR-005 - actor-gate validation packet

**Dato:** 2026-06-25
**Status:** actor-gate, ikke lukket
**Bruksregel:** Intern kontroll. Ikke publiser totalantall, kart eller nettverksgraf.

## Kort dom

Frø- og genressursfeltet har tydelige institusjons- og nettverksnoder, men ikke et lukket atlas over sorter, volum, accession-status eller tilgangsregler. Lavfriksjonsvalidering kan plassere dataeiere og roller; sort-/nodefelt må bekreftes av KVANN, NIBIO, NordGen, Solhatt eller relevante nettverk.

## Dataeier- og valideringsrad

| Felt | Mulig dataeier | Offentlig lavfriksjon-lokator | Krever kontakt? | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|---|
| sort/accession | NIBIO, NordGen, KVANN | institusjons-/organisasjonssider | ja | accession-/sort-ID med norsk kobling og dato | katalogtekst alene |
| aktiv bevaringsstatus | dataeier per node | KVANN/NIBIO/NordGen | ja | status for bevart, dyrket, delt eller arkivert | Seed Vault som forsyningsbevis |
| tilgangsregel | dataeier, Solhatt, KVANN, NordGen | åpne policy-/katalogsider | ja/nei | lisens, uttaksregel, medlems-/salgsvilkår | ukjent rettighet |
| volum | node/dataeier | sjelden åpent | ja | frøvolum, accessiontall eller produksjonsfelt | medlemskap er ikke volum |

## Kandidat-/dekningstabell

| Kandidat/node | Locator | Kildeklasse | Aktiv-status | Dekningscaveat | Tom celle |
|---|---|---|---|---|---|
| KVANN | `kvann.no` | A/B | aktiv organisasjon | sort-/medlemsdata må trekkes separat | sortliste |
| NIBIO Norsk genressurssenter | NIBIO | A | aktiv institusjon | koordineringsrolle, ikke frødistributør alene | nodefelt |
| NordGen/Svalbard Seed Vault | NordGen/Seed Vault | A/B | aktiv infrastruktur | backup/genbank, ikke norsk forsyningsatlas | tilgang |
| Solhatt | `solhatt.no` | B | aktiv leverandør | katalog er ikke bevaringsstatus | norsk sortstatus |
| Frøsamlerne | dansk organisasjon | B | aktiv organisasjon | norsk kobling må dokumenteres per aktivitet | norsk node |

## Før eventuell DASK/AASK

- Avklar hvilke sort-, accession-, volum- og tilgangsfelt som er åpne, lukkede eller ikke målt.
- Dedupliser KVANN, NordGen, NIBIO, Solhatt og nordiske nettverk før atlasarbeid.
- Ikke gjør Seed Vault, katalog eller medlemskap til aktiv norsk forsyning.

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke publiser totalantall eller kart fra kandidatflate.
- Ikke gjør medlemskap, karttreff eller selvbeskrivelse til produksjons-/effektbevis.
