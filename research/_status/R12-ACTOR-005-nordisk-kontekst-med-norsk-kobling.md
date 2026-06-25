---
tittel: R12-ACTOR-005 - Nordisk kontekst med norsk kobling
status: Batch 12 research-output - kontekstkart, ikke claim
id: R12-ACTOR-005
priority: P2
theme: actor-map
geo: Nordic
gate: actor-gate
accessedAt: 2026-06-24
sourceClass: A/B med Type B-hull
---

# R12-ACTOR-005 - Nordisk kontekst med norsk kobling

## Kort dom

Det finnes et brukbart nordisk kontekstkart for regenerativt/permakultur/lokalmat med norsk kobling, men kartet bør bare brukes som nettverks- og prosjektunderlag. Sterke noder er KVANN/Norwegian Seed Savers, NordGen/Svalbard Seed Vault, Nordic Seed Alliance, nordiske frøsamlerorganisasjoner og Nordic Permaculture-flaten. Dette er ikke et globalt atlas og ikke en verifisert produsentliste.

Importbeslutningen bør være `enrich` til actor-gate: importer nettverk, prosjekt og arrangement som kontekstnoder etter dedup, men krev primærlokator per norsk aktør, gård, kurssted eller produsent før aktørimport.

## Sterkeste kilde

- KVANN, "Om oss", aksessert 2026-06-24: `https://kvann.no/om-oss/`
- NordGen, "Svalbard Global Seed Vault", aksessert 2026-06-24: `https://www.nordgen.org/our-work/svalbard-global-seed-vault/`
- NordGen Annual Review 2024, "Projects", aksessert 2026-06-24: `https://publication.nordgen.org/NordGen-Annual-Review-2024/projects.html`
- Nordic Seed Alliance, "Events", aksessert 2026-06-24: `https://www.nordicseedalliance.org/events/`
- Nordic Permaculture, aksessert 2026-06-24: `https://nordicpermaculture.org/en`
- Nordic Permaculture Festival, aksessert 2026-06-24: `https://nordicpermaculturefestival.org/`

## Svakeste punkt

De nordiske flatene dokumenterer nettverk, arenaer, prosjekt og institusjoner, men ikke norske aktører rad for rad. Frøsamler-, permakultur- og festivalnettverk har ofte åpne arrangements- eller organisasjonssider, mens medlemslister, gårdslister, aktiv status, produksjonsvolum og faktisk lokalmat-/beredskapseffekt er actor-gate eller ikke målt.

## Nordisk kontekstliste

| Node | Land / nivå | Norsk kobling | Lokator | Kildeklasse | Status | Caveat |
|---|---|---|---|---|---|---|
| KVANN / Norwegian Seed Savers | Norge / Nordic | Norsk organisasjon med nordisk frønettverk og demonstrasjonshage-spor | `https://kvann.no/om-oss/` | A/B | Kildeanker | Organisasjonsnode, ikke komplett medlems- eller gårdsliste. |
| NordGen | Nordic | Drifter Svalbard Global Seed Vault sammen med norsk departement/Crop Trust; nordisk genressursrolle | `https://www.nordgen.org/our-work/svalbard-global-seed-vault/` | A | Institusjonsanker | Genbank-/kunnskapssenter, ikke lokalmataktør. |
| NordGen prosjektflate | Nordic | Nordiske prosjekter for mat- og landbruksgenetiske ressurser | `https://publication.nordgen.org/NordGen-Annual-Review-2024/projects.html` | A | Prosjektanker | Prosjektliste må mappes manuelt mot norske aktører. |
| Nordic Seed Alliance | Nordic | Webinar/program viser KVANN sammen med Frøsamlerne og SESAM | `https://www.nordicseedalliance.org/events/` | A/B | Nettverksanker | Arrangementsprogram, ikke varig aktørregister. |
| Frøsamlerne | Danmark / Nordic | Nordisk frøsamlernettverk og samarbeid med NordGen; kobles til KVANN via nordiske frøflater | `https://www.seeds4all.eu/seed-operators/denmark/fr%C3%B8samlerne/` | B | Kontekstnode | Seeds4All er sekundær/metadata; bruk Frøsamlerne egen side før import. |
| SESAM | Sverige / Nordic | Vises i Nordic Seed Alliance-program sammen med KVANN og Frøsamlerne | `https://www.nordicseedalliance.org/events/` | B | Kontekstnode | Programanker, ikke komplett svensk frøsamlerdata. |
| Nordic Permaculture | Nordic/Baltic | Kartplattform inkluderer Norge og nordiske land | `https://nordicpermaculture.org/en` | A/B | Plattformanker | Selvregistrert kart; per-node verifikasjon kreves. |
| Nordic Permaculture Festival | Nordic | 2023-arrangement i Aremark, Norge; 2026 planlagt i Sverige | `https://nordicpermaculturefestival.org/` | A/B | Arrangementsanker | Festival viser nettverk/arena, ikke aktiv produksjon. |
| Norsk Permakulturforening / 2023 festival | Norge/Nordic | Arrangør for Nordic Permaculture Festival 2023 i Norge | `https://event.checkin.no/57356/nordic-permaculture-festival` | A/B | Norsk koblingsanker | Eventside er historisk; ikke organisasjons-/medlemsregister. |
| Nordic Permaculture Academy | Nordic | Oppgir aktivt nordisk diplom-/mentorarbeid med deltakere fra bl.a. Norge | `https://www.nordicpermacultureacademy.org/` | A/B | Utdannings-/nettverksnode | Ikke produsent- eller caseledger. |
| Root2Fork / Agroecology Partnership | Nordic/EU | Tidligere batch bekreftet KVANN/Norwegian Seed Savers som norsk partner | `research/external/r12/R12-ACTOR-004-kvann-skogshage-og-fronettverk.md` | A/B | Prosjektkandidat | Norske gårdsnoder må ha egen primærlokator. |
| Markedshager Norge / Småskala Grønt Norge | Norge med nordisk relevans | Norsk praksisfelt som kan kobles til nordiske permakultur-/lokalmatnettverk | `research/_status/R12-ACTOR-001-markedshager-og-smaaskala-gront.md` | A/B | Norsk bro-node | Ikke nordisk atlas; produsentrader må verifiseres separat. |

## Funn-tabell

| Indikator / aktør | År/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---:|---|---|---|---|
| Norsk frø- og nytteplanteanker | 2026 | KVANN om oss | A/B | Kildeanker | Dokumenterer organisasjon og formål, ikke komplett medlemsliste. |
| Nordisk genressursinstitusjon | 2024-2026 | NordGen / Seed Vault / Annual Review | A | Kildeanker | Institusjonell genressursrolle, ikke lokalmatfelt direkte. |
| Nordisk frøsamlernettverk | 2025/2026 | Nordic Seed Alliance events | A/B | Nettverksanker | Programdeltakelse viser kobling, ikke varig register. |
| Nordisk permakulturkart | 2026-sjekk | Nordic Permaculture | A/B | Kandidatflate | Selvregistrert plattform; hver node må aktørverifiseres. |
| Nordisk permakulturfestival | 2021-2026 arkiv | Nordic Permaculture Festival | A/B | Arrangementsflate | Festivalarena, ikke produsentstatus. |
| Norske bro-noder til nordisk kontekst | Batch 04-05 | R12-ACTOR-001/003/004 | A/B | Lokalt koblingsgrunnlag | Kan gi norsk kobling, men ikke nordisk kompletthet. |

## Tomme celler

- Ingen åpen, samlet nordisk aktørliste for regenerative gårder, permakultursteder, markedshager, lokalmatnettverk og frøbevarere med norsk kobling ble funnet.
- Ingen primærkilde gir komplett medlemsliste for KVANN, Frøsamlerne, SESAM eller Nordic Permaculture.
- Selvregistrerte kartflater har ikke standardisert aktiv-status, produksjonsvolum, metodepraksis eller norsk tilknytning per node.
- Festival- og webinarprogrammer dokumenterer arena/kobling, men ikke effekt, varighet eller faktisk lokalmatkapasitet.
- Regenerativt/permakultur/lokalmat er overlappende praksisfelt, ikke en felles sertifisert kategori i kildene.

## Ikke si

- Ikke si at dette er et komplett nordisk atlas.
- Ikke si at alle Nordic Permaculture-kartnoder er aktive eller norske relevante aktører.
- Ikke si at frøsamlernettverk beviser matvolum, produksjonskapasitet eller beredskapseffekt.
- Ikke bland genbank/institusjon, festival, utdanning, nettverk og produsent som samme aktørtype.
- Ikke si at regenerativt, permakultur og lokalmat er samme metode eller sertifisering.
- Ikke løft enkeltgårder fra festival-, kart- eller webinarflater uten egen primærlokator.

## Anbefalt gate

`actor-gate`. Importer som nordisk kontekst- og nettverksflate med `source-shortlist` for NordGen, KVANN, Nordic Seed Alliance og Nordic Permaculture. Produsent-, gårds- og prosjektaktører må ha egen radverifikasjon før import.
