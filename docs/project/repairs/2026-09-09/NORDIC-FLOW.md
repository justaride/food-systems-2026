# FS-18: norsk C3-strøm, avgrenset primærkildekontroll

## Valgt målcelle

Kontrollen tok én produksjonsrad: `cmtn54277000l8m4xb6fvj6ve`, C3 Norge 2024, `collection → biogas_ad`, masse i tonn. C3-systemgrensen er husholdnings- og kommunalt innsamlet matavfall til biogass/anaerob behandling, videre til biorest og landbruk. Industrielt matavfall kan bare inngå dersom det merkes særskilt. Målcellen krever en mengde for inputkanten med samme land, år og avgrensning, originaltabell/rad, metode og usikkerhet. `FlowCell` krever masse, mengde, enhet, kvalitet og systemgrense. Den krever ikke TS for en massestrøm i tonn; TS blir nødvendig dersom strømmen skal omregnes til tørrstoff eller N/P/K.

Denne cellen ble valgt fordi SSBs offisielle tabell 13136 kombinerer nasjonalt nivå, materialkategori, behandling og kalenderår i samme originaltabell. Den har bedre sjanse for avstemming enn C2, der eksisterende kilder gjelder modellert slamdannelse eller kapasitet.

## Åpnet primærkilde

SSBs API-tabell 13136 ble åpnet 2026-09-09 med disse kodene:

- `EAK` — Landet
- `2.06` — Matavfall
- `1_sum` og `5_biogassprod` — totalt og biogassproduksjon
- `0_t` — alle nedstrømsløsninger
- `KOSmengdeavf0000` — mengde i tonn
- `2024`

Originalresponsen gir 227 070 tonn totalt i materialkategorien og 183 690 tonn sendt til biogassproduksjon. SSB beskriver statistikken som husholdningsavfall samlet inn av kommunene. Alle kommuner rapporterer gjennom KOSTRA, og data fra interkommunale selskaper fordeles på medlemskommunene. SSB presiserer samtidig at behandlingstallene er mengde **sendt til** ulike behandlinger, ikke mengde som faktisk er behandlet.

Primærkilde: [SSB tabell 13136](https://www.ssb.no/en/statbank1/table/13136/) og [SSBs metodebeskrivelse](https://www.ssb.no/en/natur-og-miljo/avfall/statistikk/avfall-fra-hushalda).

## Avgjørelse

Resultatet er `candidate_exact_input_edge_match`. 183 690 tonn matcher retningen `collection → biogas_ad`: en nasjonal, rapportert 2024-mengde husholdningsmatavfall sendt fra kommunal innsamling til biogassproduksjon. «Sendt» er riktig målepunkt for denne inputkanten. Det skal ikke oppgraderes til mottatt eller faktisk behandlet masse.

- `substance=mass` og `unit=t` krever ikke TS i den faktiske cellekontrakten. Ingen tørrstoff- eller N/P/K-omregning er gjort.
- Kilden dokumenterer sendt mengde, ikke faktisk mottatt eller behandlet mengde ved biogassanlegg.
- API-et kaller kode 2.06 «Matavfall», mens SSBs engelske presentasjon bruker «food and other wet organic». Kandidaten bevarer kode og begge etiketter.
- Ingen produsert biogass, biorest eller sluttbruk følger av tallet.

Den private kandidatfilen foreslår derfor `quantity=183690`, `unit=t`, `quality=measured` for denne ene inputkanten. Dette er fortsatt en kandidat uten databaseinnsetting, promotering eller menneskelig review. Den er ikke et potensial- eller kapasitetstall og kan ikke brukes på `biogas_ad → digestate` eller `digestate → land_application`.

Beste neste kilde for de påfølgende kantene er nasjonal anleggsstatistikk som dokumenterer faktisk behandlet input, produsert biorest og sluttbruk med relevant vektbasis/TS.

## Bevart bevis

Original request, API-respons, metadata, HTTP-headere, metode-HTML og strukturert vurdering ligger privat under `project-completion-2026-09-09/nordic-flow/`. Viktigste SHA-256:

- request: `79b3fa3112c3cdd435e97ff5421d9a64b7c5af3a535199790939a555fbe60280`
- respons: `e82e6031e6527cfac907c7480cd00736d1ec07bcc01a922024d9080f08c56f0f`
- metadata: `d033cfc9481552ce2754de0298eda3ef6cd51976e36133004040783db16c7de2`
- metodeside: `799c9a8d2a1121b3efa3c0dde5428629579b48c32b5a9b5f5edef7844225ce04`

Ingen database, kanonisk kilde, promotering eller menneskelig reviewstatus er endret.
