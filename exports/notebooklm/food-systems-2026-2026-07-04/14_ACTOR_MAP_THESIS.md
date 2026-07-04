# Actor Map Thesis - Ecosystem Without False Completeness

Export date: 2026-07-04
Packet type: thesis
Status label: mixed: citable plus gated/internal context
Allowed use: Use for narrative structure, but preserve source labels before making external claims.

## What This Source Is For

Frame actors, registries, networks and stakeholder gaps as a controlled map with open cells.

## Core Claims Or Working Propositions

- The actor registry is useful as a directional ecosystem map, not a complete census.
- Actor-gated rows are questions for validation, not settled claims.
- Network ties need source class and relationship type to avoid implying coordination.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Domain actor coverage | Use to show open front. | Do not imply complete value-chain coverage. |
| CAR registry | Use as seed material. | Seed registry is not full register. |
| Movement network | Use as source-shortlist. | Historical/organizational links are not ideological unity. |

## Known Caveats

- No national database exists for several actor classes.
- Public org pages may be self-reported and unverified.

## Deck Angles

- Slide: "The actor map is most valuable where it shows who must be asked next."
- Slide: "Coverage gaps are operational leads."

## Bad Generic Framing To Avoid

- Avoid saying "the ecosystem consists of..." as if complete.
- Avoid turning associations into coalitions.

## Source Paths Included

- research/_status/mvk-completeness-dashboard.md
- research/_status/domene-dekning-hull-2026-06-27.md
- research/_status/circular-food-actor-registry/CAR-final-report.md
- research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md

## Source Excerpts

### research/_status/mvk-completeness-dashboard.md

````markdown
# MVK completeness-dashboard

Regenerert: 2026-07-01 — avledet direkte fra `public/data/coverage/domene-profiles.json` (universtall fra `domene-dekningsbok.csv`; kartlagt-tall fra DB; sist datagrunnlag PR #212). «Mettet celle» = kartlagt ≥ anslått univers.

| Stadium/domene | Kartlagt | Anslatt univers | Dekning | Mettede celler | Maks gap |
|---|---:|---:|---:|---:|---:|
| distribusjon-grossist | 20 | 120 | 17% | 0/3 | 60 |
| finansiering-investering | 0 | 60 | 0% | 0/3 | 20 |
| forbruk | 0 | 30 | 0% | 0/2 | 20 |
| foredling-industri | 0 | 140 | 0% | 0/7 | 20 |
| fou-institusjon | 0 | 44 | 0% | 0/3 | 20 |
| handel-dagligvare | 0 | 40 | 0% | 0/3 | 20 |
| horeca-offentlig | 0 | 60 | 0% | 0/3 | 20 |
| innsatsfaktorer | 76 | 80 | 95% | 3/4 | 8 |
| institusjon-finansiering | 0 | 49 | 0% | 0/5 | 15 |
| interesseorg-paraply | 0 | 60 | 0% | 0/3 | 20 |
| lokale-verdikjeder | 50 | 261 | 19% | 0/6 | 120 |
| matsvinn-sirkulaer | 87 | 120 | 73% | 2/6 | 15 |
| okologi-sertifisering | 0 | 40 | 0% | 0/3 | 20 |
| permakultur-fleraarige | 0 | 77 | 0% | 0/5 | 20 |
| primaerproduksjon | 40 | 350 | 11% | 0/6 | 130 |
| regenerativ-praksis | 9 | 89 | 10% | 0/5 | 21 |
| virkemiddel-policy | 0 | 34 | 0% | 0/3 | 12 |

## Underrepresentert

- regenerativ-praksis / jordhelse-karbon: 0/20, gap 20.
- permakultur-fleraarige / skogshage-agroforestry: 0/20, gap 20.
- permakultur-fleraarige / demonstrasjonssteder: 0/20, gap 20.
- primaerproduksjon / jordbruk-groent: 0/20, gap 20.
- primaerproduksjon / husdyr-beite: 0/20, gap 20.
- primaerproduksjon / ville-ressurser-sanking: 0/20, gap 20.
- primaerproduksjon / urban-dyrking: 0/20, gap 20.
- foredling-industri / meieri: 0/20, gap 20.
- foredling-industri / kjott-egg: 0/20, gap 20.
- foredling-industri / korn-molle-bakeri: 0/20, gap 20.
- foredling-industri / frukt-groent-foredling: 0/20, gap 20.
- foredling-industri / drikke-bryggeri: 0/20, gap 20.

## Denne oktens status

- primaerproduksjon / havbruk-akvakultur: 0 -> 20 kartlagt; 20 nye noder, 3 flagget for etterkontroll.
- primaerproduksjon / villfisk-fiskeri: 0 -> 20 kartlagt; 20 nye noder, 1 flagget for etterkontroll.
- distribusjon-grossist / grossist-distributor: 0 -> 20 kartlagt; 19 nye noder, 1 eksisterende beriket, 3 companyId-lenker, 18 flagget for etterkontroll.
````

### research/_status/domene-dekning-hull-2026-06-27.md

````markdown
# Domene-dekning — hull-rapport 2026-06-27

| Domene | Underdomene | Geo | Univers | Kartlagt | Hull | Konfidens |
|---|---|---|---|---|---|---|
| lokale-verdikjeder | reko | NO | 140 | 20 | 120 | middels |
| lokale-verdikjeder | andelslandbruk | NO | 93 | 20 | 73 | middels |
| regenerativ-praksis | market-gardening | NO | 30 | 9 | 21 | lav |
| regenerativ-praksis | jordhelse-karbon | NO | 20 | 0 | 20 | lav |
| permakultur-fleraarige | skogshage-agroforestry | NO | 20 | 0 | 20 | lav |
| permakultur-fleraarige | demonstrasjonssteder | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | jordbruk-groent | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | husdyr-beite | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | ville-ressurser-sanking | NO | 20 | 0 | 20 | lav |
| primaerproduksjon | urban-dyrking | NO | 20 | 0 | 20 | lav |
| foredling-industri | meieri | NO | 20 | 0 | 20 | lav |
| foredling-industri | kjott-egg | NO | 20 | 0 | 20 | lav |
| foredling-industri | korn-molle-bakeri | NO | 20 | 0 | 20 | lav |
| foredling-industri | frukt-groent-foredling | NO | 20 | 0 | 20 | lav |
| foredling-industri | drikke-bryggeri | NO | 20 | 0 | 20 | lav |
| foredling-industri | sjomat-foredling | NO | 20 | 0 | 20 | lav |
| foredling-industri | naeringsmiddel-ovrig | NO | 20 | 0 | 20 | lav |
| distribusjon-grossist | logistikk-lager | NO | 20 | 0 | 20 | lav |
| distribusjon-grossist | alternativ-distribusjon | NO | 20 | 0 | 20 | lav |
| handel-dagligvare | spesialhandel-delikatesse | NO | 20 | 0 | 20 | lav |
| handel-dagligvare | direktesalg-plattform | NO | 20 | 0 | 20 | lav |
| horeca-offentlig | restaurant-storkjokken | NO | 20 | 0 | 20 | lav |
| horeca-offentlig | offentlig-innkjop-kantine | NO | 20 | 0 | 20 | lav |
| horeca-offentlig | reiseliv-gardsmat | NO | 20 | 0 | 20 | lav |
| forbruk | matfellesskap-innkjopslag | NO | 20 | 0 | 20 | lav |
| okologi-sertifisering | okologisk-produsent | NO | 20 | 0 | 20 | lav |
| fou-institusjon | nettverk-kompetanse | NO | 20 | 0 | 20 | lav |
| interesseorg-paraply | naeringsorganisasjon | NO | 20 | 0 | 20 | lav |
| interesseorg-paraply | faglag-bonde | NO | 20 | 0 | 20 | lav |
| interesseorg-paraply | miljo-forbruker-ngo | NO | 20 | 0 | 20 | lav |
| finansiering-investering | stiftelse-fond | NO | 20 | 0 | 20 | lav |
| finansiering-investering | impact-investor | NO | 20 | 0 | 20 | lav |
| finansiering-investering | kooperativ-eierskap | NO | 20 | 0 | 20 | lav |
| lokale-verdikjeder | bondens-marked | NO | 20 | 4 | 16 | middels |
| regenerativ-praksis | raadgivning-nettverk | NO | 15 | 0 | 15 | lav |
| permakultur-fleraarige | planteskoler-froeleverandoerer | NO | 15 | 0 | 15 | lav |
| institusjon-finansiering | interesseorg-paraply | NO | 15 | 0 | 15 | lav |
| matsvinn-sirkulaer | insekt-alternativ-protein | NO | 20 | 5 | 15 | lav |
| regenerativ-praksis | holistic-management-beiting | NO | 12 | 0 | 12 | lav |
| regenerativ-praksis | biodynamisk | NO | 12 | 0 | 12 | middels |
| permakultur-fleraarige | permakultur-foreninger | NO | 12 | 0 | 12 | middels |
| institusjon-finansiering | virkemiddel-ordning | NO | 12 | 0 | 12 | lav |
| matsvinn-sirkulaer | kompost-jordprodukt | NO | 20 | 8 | 12 | lav |
| fou-institusjon | forskningsinstitutt | NO | 12 | 0 | 12 | lav |
| fou-institusjon | universitet-utdanning | NO | 12 | 0 | 12 | lav |
| virkemiddel-policy | virkemiddelapparat | NO | 12 | 0 | 12 | lav |
| virkemiddel-policy | forvaltning-tilsyn | NO | 12 | 0 | 12 | lav |
| permakultur-fleraarige | froebevaring | NO | 10 | 0 | 10 | middels |
| forbruk | forbrukerorganisasjon | NO | 10 | 0 | 10 | lav |
| matsvinn-sirkulaer | matredistribusjon | NO | 20 | 10 | 10 | lav |
| okologi-sertifisering | kontrollorgan-merkeordning | NO | 10 | 0 | 10 | lav |
| okologi-sertifisering | regenerativ-sertifisering | NO | 10 | 0 | 10 | lav |
| virkemiddel-policy | politisk-program | NO | 10 | 0 | 10 | lav |
| institusjon-finansiering | forskningsinstitutt | NO | 8 | 0 | 8 | middels |
| institusjon-finansiering | universitet-utdanning | NO | 8 | 0 | 8 | middels |
| innsatsfaktorer | froe-genressurser | NO | 20 | 12 | 8 | lav |
| institusjon-finansiering | kontroll-sertifisering | NO | 6 | 0 | 6 | middels |
| lokale-verdikjeder | paraply-nettverk | NO | 8 | 5 | 3 | hoey |
| matsvinn-sirkulaer | biogass-bioraffinering | NO | 20 | 19 | 1 | lav |
| lokale-verdikjeder | gaardsutsalg | NO | 0 | 1 | 0 | lav |
| lokale-verdikjeder | markedshager | NO | 0 | 0 | 0 | lav |
| innsatsfaktorer | for-protein | NO | 20 | 21 | 0 | lav |
| innsatsfaktorer | gjodsel-jordforbedring | NO | 20 | 22 | 0 | lav |
| innsatsfaktorer | biostimulanter-jordliv | NO | 20 | 21 | 0 | lav |
| primaerproduksjon | havbruk-akvakultur | NO | 20 | 20 | 0 | lav |
| primaerproduksjon | villfisk-fiskeri | NO | 20 | 20 | 0 | lav |
| distribusjon-grossist | grossist-distributor | NO | 20 | 20 | 0 | lav |
| handel-dagligvare | dagligvarekjede | NO | 0 | 0 | 0 | hoey |
| matsvinn-sirkulaer | reststrom-sidestrom | NO | 20 | 22 | 0 | lav |
| matsvinn-sirkulaer | emballasje-retur | NO | 20 | 23 | 0 | lav |

Totalt kartlagt (domene-tagga): 282
````

### research/_status/circular-food-actor-registry/CAR-final-report.md

````markdown
# CAR Final Report

Date: 2026-06-24
Status: CAR-012 final QC/export complete for current workspace pass

## What Was Completed

- CAR-004 through CAR-011 were written as source-backed batch artifacts under `research/_status/circular-food-actor-registry/`.
- `CAR-registry-verified.csv` was regenerated from existing verified rows plus source-backed ready-for-import deltas, with CAR-010 person/ownership overlays applied where source basis was strong enough.
- `CAR-coverage-map.md` was created with verified export counts, candidate/context coverage and dedupe notes.
- Secondary-source or actor-gated rows were kept as candidate/context rather than promoted to verified.

## Final Export State

Verified export rows: 31

The export is strongest for:

- matsvinn/prevention and redistribution anchor actors
- side-stream/upcycling and alternative-protein actors with actor-primary plus registry sources
- biogas/digestate/compost facility and support actors with official facility/company pages
- research/support actors where the row is explicitly support/research, not output

## What Still Cannot Be Called Complete

- A complete Norwegian market registry.
- A complete active-farm or market-garden register.
- A Norway-wide quantified food-waste impact map.
- A complete biogas/nutrient-return capacity and realized-volume database.
- A complete founder/ownership database.
- Nordic/global failure-case coverage beyond selected context rows.

## Claim Discipline

Use CAR as an intake/export control surface, not as a public claim-lock. Every row keeps an `ikke_si` warning because row identity and mechanism evidence are not the same as verified impact, scale, profitability or market coverage.

## Recommended Next Gates

- PCQ for top verified rows before using any volume, revenue, capacity or impact figures.
- Actor-gate for small-scale producers, CSA/direct-sale farms and directory-only rows.
- Legal/source follow-up for failure rows before using bankruptcy language externally.
- Separate claim-lock work if any CAR row becomes public-facing narrative evidence.
````

### research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md

````markdown
# R13-LAND-005 — Bevegelse- og nettverkskart (regenerativ/lokalmat/øko-bevegelsen i Norge)

**ID:** R13-LAND-005
**Tema:** Aktør-/nettverkskartlegging
**Geo:** NO (med nordiske koblingsnoder)
**Output-type:** network map memo (internal underlag)
**Dato:** 2026-06-28
**Anbefalt gate:** source-shortlist

---

## Kort dom

Den norske regenerativ-/lokalmat-/øko-bevegelsen er ikke én organisasjon, men et felt av separate, egne-registrerte foreninger og stiftelser som er bundet sammen gjennom konkrete, dokumenterbare strukturer: felles prosjektadministrasjon (Økologisk Norge drifter andelslandbruk.no/Andelslandbruk Norge), felles paraply/plattform (GMO-nettverket samler 18 medlemsorganisasjoner pluss 3 støttemedlemmer), delte stiftere (Bondens marked Norge er stiftet av bl.a. Oikos/Økologisk Norge, Norges Bondelag og Norsk Bonde- og Småbrukarlag), og overlappende styreverv (samme personer sitter i styrene/ledelsen til flere noder). Sentrale enkeltfakta er bekreftet via primærkilder: Oikos byttet navn til Økologisk Norge på Landsmøtet på Røros i 2018; KVANN ble stiftet 1.10.2016 ut av Planteklubbene som NIBIO/Norsk Genressurssenter og Hageselskapet etablerte i 2005; Regenerativt Norges kompetanseplattform drives sammen med Norges Vel og Norsk Landbruksrådgivning. Koblingene er strukturelle (administrasjon, medlemskap, stifterskap, styreoverlapp) — de dokumenterer ikke felles agenda eller ideologisk enhet mellom aktørene.

## Sterkeste kilde

GMO-nettverket, «Hvem er vi» (medlemsliste + styre med organisasjonstilhørighet), https://www.gmonettverket.no/ , 2026 (siden sist endret 2026-05-28). Gir en fullstendig, aktørpublisert oversikt over hvilke organisasjoner som er bundet sammen i samme paraply, og navngir styremedlemmer med organisasjonstilhørighet — altså både medlemskaps- og styreoverlapp i én primærkilde. Sterk støttekilde: Økologisk Norges egne sider (okologisknorge.no) som bekrefter både Oikos-navnehistorikken og at de drifter andelslandbruk-arbeidet.

## Svakeste punkt

Flere plausible koblinger er ikke verifiserbare fra primærkilder uten arkiv-/registerarbeid: (1) Slow Food Norges *nåværende* organisatoriske status og eventuelle formelle koblinger — en eldre kilde antyder Slow Food «mobiliserer via» GMO-nettverket, men Slow Food står ikke på GMO-nettverkets gjeldende medlemsliste (2026), så koblingen er enten historisk, uformell eller opphørt. (2) KVANNs eksakte organisasjonsnummer og koblinger til permakulturmiljøet/Skoghagefeltet er ikke direkte dokumentert på kvann.no utover frønettverk og Schübelers hager-nettverket. (3) «Nettverk for regenerativt landbruk» finnes i flere regionale/parallelle varianter (Nordnorsk nettverk, nordisk nettverk via eviggronneenger.no, Rogaland), og det er uklart hvilken som er den prompten sikter til — disse behandles som distinkte noder.

## Nettverkskoblinger (funn-tabell)

| Aktør | Relasjon | Motpart/node | Kilde (klasse) | År | Caveat |
|---|---|---|---|---|---|
| Økologisk Norge | drifter/administrerer/koordinerer (prosjekt «Andelslandbruk») | andelslandbruk.no / Andelslandbruk Norge | okologisknorge.no/vaart-arbeid/andelslandbruk (A) | 2026 | «Vi i Økologisk Norge jobber både praktisk og politisk for å etablere flere andelslandbruk.» Prosjektet er finansiert av Landbruksdirektoratet (per WebSearch-utdrag, B). Andelslandbruk er en bevegelse av selvstendige andelslag — Økologisk Norge koordinerer/informerer, eier ikke gårdene. |
| Økologisk Norge | tidligere navn (rename) | Oikos – Økologisk Landslag / Oikos – Økologisk Norge | okologisknorge.no/om-oss/oekologisk-norge (A) | 2018 | Navneendring vedtatt på Landsmøtet på Røros 2018. Oikos ble selv stiftet sept. 2000 ved sammenslåing av NØLL, NØU og ØkoProdusentane. Org.nr uendret: 982 512 069. |
| Økologisk Norge | bygger på / er del av (prinsippgrunnlag, internasjonal bevegelse) | IFOAM – Organics International | okologisknorge.no/om-oss/oekologisk-norge (A) | 2026 | Selvrapportert tilknytning til IFOAMs fire prinsipper; ikke nødvendigvis formelt medlemskap dokumentert på siden. |
| KVANN (Norwegian Seed Savers) | spunnet ut av / etterfølger til | Planteklubbene (etablert av Norsk Genressurssenter/NIBIO + Hageselskapet, 2005) | kvann.no/om-oss (A) | 2016 | KVANN stiftet 1.10.2016 ut av Planteklubbene. Åsmund Asdal (prosjektleder for Planteklubbene) er i dag leder av Frøhvelvet på Svalbard. Strukturell arv, ikke nåværende styringskobling. |
| KVANN | driver/administrerer (eget nettverk) | Schübelers hager (nettverk av demonstrasjons-/forsøkshager) | kvann.no/om-oss ; kvann.no/schubeler (A) | 2026 | KVANNs eget nettverk; ikke samme som permakultur-/skoghagemiljøet, selv om KVANN tester «skogshageplanter». |
| KVANN | samarbeider med (nordisk frøprosjekt «Fra Frø til Fat») | Frøsamlerne (DK), Sesam (SE) | kvann.no/om-oss (A) | 2019– | Nordisk frøsamler-samarbeid. DK/SE er ikke norske aktører; se R13-AKTOR-005 for full frønettverk-kartlegging. |
| KVANN | deltar i (europeisk nettverk) | Let's Liberate Diversity (liberatediversity.org) | kvann.no/om-oss (A) | 2026 | Europeisk bruksgenbank-nettverk. |
| Regenerativt Norge | samarbeider med (felles kompetanseplattform / introkurs) | Norges Vel + Norsk Landbruksrådgivning (NLR) | regenerativtnorge.no/om-organisasjonen (A) | 2025–2026 | «Sammen med våre Norges Vel og Norsk Landbruksrådgivning har vi utviklet et gratis nettbasert introduksjonskurs.» Også oppgitt som samarbeidspartnere: Kolonihagen, Savory Institute, EARA. |
| Regenerativt Norge | er kontaktpunkt for (i Norge) | Savory Institute (Holistic Management / EOV) | regenerativtnorge.no/om-organisasjonen (A) | 2026 | «Vi bruker Holistic Management som rammeverk … og er kontaktpunkt for Savory Institute i Norge.» Org.nr Regenerativt Norge: 926 330 381. |
| Regenerativt Norge | bidrar med (fagleder/foredrag) til | Nordnorsk nettverk for regenerativt landbruk (NBS Troms / Balsfjord BS) | smabrukarlaget.no/troms (B) | 2024–2025 | Anders Lerberg Kopstad (styreleder/nestleder Regenerativt Norge) holdt fagforedrag ved oppstart. Personkobling, ikke organisatorisk sammenslåing. NBS er prosjekteier. |
| GMO-nettverket | er paraply for (medlemskap) | Økologisk Norge, Spire, Utviklingsfondet, Norsk Bonde- og Småbrukarlag, Norges Bondelag, Bondens marked Norge, Norges Vel, Coop Norge SA, Biologisk-dynamisk forening, Norsk Landbrukssamvirke, Norges Birøkterlag, Norges Bygdekvinnelag, Norges Bygdeungdomslag, Natur og Ungdom, Greenpeace, Fremtiden i Våre Hender, Naturvernforbundet, Norges Skogeierforbund | gmonettverket.no «Hvem er vi» (A) | 2026 | 18 fullverdige medlemmer. Støttemedlemmer: Debio, Denofa, Rema 1000. Medlemmene «har ulike posisjoner» — felles plattform betyr ikke felles syn (selv aktørens egen presisering). |
| GMO-nettverket | har styremedlem fra (styreoverlapp) | Økologisk Norge (Jostein Hertwig), Coop (Knut Lutnæs), Natur og Ungdom (Helene Sofie Smit), Utviklingsfondet (Elin Cecilie Ranum), Norges Bondelag (Simen Solbakken, vara), NBS (Lise Saga, vara), Bondens marked Norge (Randi Ledaal Gjertsen, vara) | gmonettverket.no «Hvem er vi» / styre (A) | 2026 | Styreleder: Anne Irene Myhr (Norges Bygdekvinnelag). Daglig leder: Marte von Krogh. Verv i GMO-nettverket = representasjon, ikke at hjemorganisasjonene styres derfra. |
| Bondens marked Norge (Stiftelsen) | er stiftet av (stiftere) | Norsk Landbrukssamvirke, HANEN, Oikos – Økologisk Norge, Norges Bondelag, Norsk Bonde- og Småbrukarlag | snl.no/Bondens_marked ; no.wikipedia (B) | 2010 (stiftelse); pilot 2003 | Stiftelsen formelt opprettet 27.04.2010 (tidligere eid av Norsk Landbrukssamvirke). Pilot 2003 initiert av Norsk Landbrukssamvirke, NBS, Norges Bondelag, Norsk Gardsmat og OIKOS. Primærkilde (vedtekter/Brreg) ikke hentet — B-klasse. |
| Bondens marked Norge | deler daglig leder med vara-verv i (personkobling) | GMO-nettverket (Randi Ledaal Gjertsen) | gmonettverket.no (A) ; snl.no/Bondens_marked (B) | 2026 | Gjertsen er daglig leder i Bondens marked Norge og vara i GMO-nettverkets styre. Tidligere daglig leder Aina Bartmann var også daglig leder i GMO-nettverket — historisk personkobling. |
| Spire | er ungdomsorganisasjon til / spunnet ut av | Utviklingsfondet | spireorg.no/om-spire ; utviklingsfondet.no (B) | 2004 | Spire er Utviklingsfondets ungdomsorganisasjon (stiftet 2004). Begge er separate medlemmer i GMO-nettverket. |
| Stiftelsen Norsk Mat (tidl. Matmerk) | er opprettet av / statstilknyttet stiftelse under | Landbruks- og matdepartementet (LMD) | regjeringen.no/…/matmerk ; no.wikipedia (A/B) | 1994/2007; rename 2021 | Selvstendig, statstilknyttet stiftelse opprettet av LMD. Drifter Nyt Norge, Spesialitet, KSL, Lokalmat.no (se R13-AKTOR-008). Forvaltnings-/sertifiseringsinfrastruktur, ikke en bevegelsesaktør. |
| Debio | er støttemedlem i | GMO-nettverket | gmonettverket.no «Hvem er vi» (A) | 2026 | Debio (org.nr 971 475 471, stiftet 31.05.1986) er kontroll-/sertifiseringsorgan (Ø-merket) på vegne av Mattilsynet — ikke en medlemsbevegelse. Støttemedlem, ikke fullverdig medlem. |
| Debio | har Biologisk-dynamisk forening som (medstifter/pådriver) | Biologisk-dynamisk forening | biodynamisk.no/foreningen ; WebSearch-utdrag (B) | 1986 | BDF oppgir å ha vært pådriver ved etablering av Debio, NORSØK og Økologisk Norge. Navnet «DEBIO» = Demeter + biologisk. Historisk stifterkobling. |
| Norsk Bonde- og Småbrukarlag (NBS) | er prosjekteier for / vert for | Nordnorsk nettverk for regenerativt landbruk (via Troms / Balsfjord BS) | smabrukarlaget.no/troms (B) | 2024– | Regionalt nettverk; NBS sentralt + lokallag. Distinkt fra Regenerativt Norge og fra «Nordisk nettverk for regenerativt landbruk» (eviggronneenger.no). |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

