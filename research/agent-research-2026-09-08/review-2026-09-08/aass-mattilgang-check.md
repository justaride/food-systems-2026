# Bounded review: A2/A3 og A6-konklusjoner

Kontrolldato: 2026-09-08. Ingen A2/A3/A6-filer er endret. Originalkilder er åpnet direkte i denne kontrollen; vurderingen under er en uavhengig kildekontroll, ikke `human_verified`.

## Funn

| Observasjon | Prioritet | Kontroll og lokator | Vurdering |
|---|---|---|---|
| A2-O004 | P1 | A2-S004, Aass *Bærekraftsrapport 2025*, PDF trykt s. 6, avsnittet «Råvareutnyttelse og svinn»: «I 2025 ble 7,7 millioner liter mask fra ølbryggingen hentet av lokale bønder» og «I 2025 ble 100% av masken mat for dyr». Direkte original: <https://www.aass.no/media/x42aij04/baerekraftrapport-2025.pdf> | Ingen feil. Påstanden er korrekt og presist avgrenset til rapportert liter og oppgitt bruk. A2/A6 gjør riktig når kg, tørrstoff, mottakere og substitusjon ikke utledes. |
| A2-O011 | P1 | A2-S010, Hatungimana mfl. 2020, original artikkel/abstract: 30 åringskviger, 0/10/20 % WBG på tørrstoffbasis, 12 uker; rasjonene var limit-fed og formulert til 15 % protein. Original: <https://pmc.ncbi.nlm.nih.gov/articles/PMC7438615/> (samme studie som DOI 10.1093/tas/txaa079). | Ingen feil i avgrensningen. «Opptil 20 %» gjelder denne forsøksrasjonen og kan brukes som designinnspill. Det er ikke Aass-data eller en generell substitusjonsfaktor. |
| A2-O012–O013 | P1 | A2-S011, Hatungimana mfl. 2020, original artikkel: lagrings-/saltforsøk med åtte Holstein-kviger; kontrollen gjelder forsøksoppsett, temperatur og lagringsforløp, ikke Aass. Primærkilde: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8631071/>. | Ingen feil funnet. A6 R012 klassifiserer korrekt som metode-/designinnspill. Salt-/muggresultater og rask forringelse må ikke løftes til Aass-holdbarhetsgaranti. |
| A3-O001–O004 | P1 | A3-S001, SIFO-rapport 7-2025, trykt s. 12–14 og 23–24: Tabell 2-1 viser bølgeutvalg 2 938, 4 200, 3 446, 3 530 og 4 169; rapporten sier gjentatte tverrsnitt, 18+ fra Norsk Gallups aksesspanel; s. 23 beskriver USDA Adult Food Security Survey Module og fire uker; s. 14/40 sier at ingen datasett hadde barnefamilier som representativ målgruppe. Direkte original: <https://www.parat.com/files/2025/08/21/SIFO-rapport%207-2025%20Familiefattigdom.pdf> | Ingen feil. A3/A6 er metodisk presise om tverrsnitt, instrument og representativitetsgrense. |
| A3-O005–O009 | P1 | A3-S001, trykt s. 23–25, Figur 4-3–4-5: rapporten oppgir signifikante forskjeller mellom hushold med/uten barn og par/enslige med barn, men figurene er prosentfordelinger uten delutvalgs-N; regresjonene er assosiasjonsanalyser. | Ingen feil funnet. A6 R016 beholder et beskrivende funn og krever N/vekter/usikkerhet. Det bør fortsatt unngås å kalle figurtall «nasjonal prevalens». |
| A3-O013–O020 | P1 | A3-S003/S004, FAO FIES-metodeside og Norway-katalog: åtte spørsmål, individnivå, siste 12 måneder, nasjonal survey, design effect 1,95; katalogen sier selv at subnasjonal disaggregering ikke anbefales. FAO: <https://www.fao.org/measuring-hunger/access-to-food/about-the-food-insecurity-experience-scale-(fies)/> og <https://microdata.fao.org/index.php/catalog/2480>. | Ingen feil i hovedkonklusjonen. FIES er prinsipielt sammenlignbar etter FAO-kalibrering, men katalogmetadata alene gir ikke punktestimat eller full nevner. A6s «delvis kontrollert/uavklart» er riktig. |
| A3-O010–O012 / A6 R017–R019 | P2 | A3-arbeidsmaterialets Finland 2019 (ett måltidshopp-spørsmål), Statistics Finland-proxy og FAOSTAT treårsgjennomsnitt holdt opp mot primærmetode. | Ingen rettelse nødvendig. A6 gjør riktig når Finland-funnet og økonomisk proxy holdes separat fra SIFO/FIES. «Avkreftet/omklassifisert» i A6 gjelder den sterke sammenligningslesningen, ikke at underliggende observasjon er falsk; dette er eksplisitt forklart i rettelsesloggens innledning. |

## Samlet vurdering

Kontrollomfanget dekker fem høyverdipåstander direkte: Aass 2025-volum/bruk, WBG-dose og lagringsgrense, SIFO-instrument/utvalg/representativitet, SIFO-gruppeforskjeller og FAO/FIES-metode. Det ble ikke funnet en substansiell kildefeil. A6-konklusjonene om A2/A3 er gjennomgående strengere enn agentpåstandene og beholder riktige avgrensninger. A6s bruk av `avkreftet/omklassifisert` er tilstrekkelig forklart som avkrefting av en sterk tolkning; ingen endring anbefales.

## Ikke kontrollert i denne runden

Fulltekst/primærkontroll av West, Dhiman, Murdock og Crickenberger ble ikke utvidet utover A2s registrerte tilgangsnivå. Finland ISSP-tallet og Statistics Finland-tabellen ble ikke gjenåpnet i denne kontrollen; de er derfor ikke oppgradert i status. Ingen av disse begrensningene endrer hovedkonklusjonen over.

## Oppfølgende struktur- og A6-kontroll

| Kontrollpunkt | Prioritet | Kontroll og lokator | Vurdering |
|---|---|---|---|
| A3-S001 arkivhash | P1 | Registrert `A3/data.json`-hash er `3c319ff322e379204db0b90ad4467b11bc6beb729b5ecd11093bcb5ef6762d6b`; kontrollert faktisk hash er `3c319ff322e379204cb0b90ad4467b11bc6beb729b5ecd11093bcb5ef6762d6b`. | **Reelt strukturavvik.** Hashene avviker med `db0` vs `cb0` etter `...204`. Dette kan ikke klassifiseres som samme fil uten ny kontroll av arkivfil/registrering; originalkilden er ikke endret. |
| A6 R012 / A2 | P2 | A2 `data.json`: A2-O011 `scopeLimits` sier «Mulig funksjon i ett kvigeforsøk, ikke faktisk Aass-substitusjon» og at 20 % ikke er lokal grense; A2-O012 sier lagring er kontrollvariabler/risikohypotese, A2-O013 sier ikke grunnlag for salting hos Aass-mottakere. | **Ingen reell ny avgrensningsrettelse på A2-nivå.** R012s «avkreftet/omklassifisert» beskriver riktig en sterk mulig lesning som A2 allerede eksplisitt har avgrenset. Vurder å kalle dette «bekreftet avgrensning/omklassifisering» i A6 dersom rettelsesloggen skal skille nye rettelser fra kontrollert videreføring. |
| A6 R022 / A4 | P2 | A4 `data.json`: A4-O004/O006 er eksplisitt `scenario`/`anbefaling` med `scopeLimits` «ikke faktisk lager»; A4-O013 er «rapportert_observasjon» og begrenser 1 %-utsagnet til rapportens egen påstand, ikke ny beregning/2026-andel; A4-O014/O015 skiller teller, import og nevner. | **Ingen reell ny avgrensningsrettelse på A4-nivå.** R022s omklassifisering er likevel faglig korrekt som samordningsetikett, men bør beskrives som kontrollert presisering av allerede innskrevet scope, ikke som at A4 opprinnelig hevdet faktisk reserve eller reproducerbar 2026-ratio. |

Hashkontrollen er reproducerbar mot den registrerte `archivePath`; ingen filendring er nødvendig. A6 R012/R022 bør eventuelt justeres redaksjonelt ved en senere samordningsrunde for å markere forskjellen mellom ny korrigering og bekreftet/videreført avgrensning.

## Tillegg: A3-O020 FAOSTAT-bulkserie

| Observasjon | Prioritet | Kontroll og lokator | Vurdering |
|---|---|---|---|
| A3-O020 / A6 R018–R019 | P1 | A3-S009 er et lokalt arkivert, hashregistrert FAOSTAT-bulkarkiv (`1ccced40d8e228693c6fcc5d172de9bcaa3a1c6a1581ebde345d71c1dfa9b692`). CSV-en inneholder item `210091`, `Value`/`Lower bound`/`Upper bound`, fem nordiske land og periodene 2019–2021 til 2023–2025: 5 × 5 × 3 = 75 celler. Eksempel: Danmark 2019–2021 Value 5,5 og 2023–2025 Value 6,2. | **A6-status/gap er for streng og bør korrigeres.** A3-O020 har faktisk en komplett åpen bulkserie med punktestimater og intervaller. Fravær av punktestimat i mikrodatasettkatalogene gjelder katalogsporet og kan ikke brukes til å si at fullmatrise ikke er tilgjengelig eller at den må hentes. Behold metodisk forbehold om treårsgjennomsnitt og intervaller, men omklassifiser observasjonen til kontrollert/arkivert FAOSTAT-serie. |

Hashkontrollen viser avvik mellom registrert og faktisk A3-S001-fil; ingen filendring er gjort. A3-O020 bør oppgraderes i A6s status/gap. A6 R012/R022 bør eventuelt justeres redaksjonelt ved en senere samordningsrunde for å markere forskjellen mellom ny korrigering og bekreftet/videreført avgrensning.


Hovedagentens sluttkontroll: Hashavviket er reprodusert med hashlib, shasum og OpenSSL. Se archive-receipt.json for hele strengene. FAO-matrisens 75 celler er alle avstemt mot en ny primærnedlasting; se fao-reproduction.json. Ingen originalleveranser er endret.
