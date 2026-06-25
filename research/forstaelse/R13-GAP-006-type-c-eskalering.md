---
tittel: R13-GAP-006 - Type-C-eskalering og actor-gate-kø
status: Batch 02 research-output - ikke claim
id: R13-GAP-006
priority: P1
theme: gap-closure
geo: NO
gate: forstaelse
accessedAt: 2026-06-25
sourceClass: internal R12 triage synthesis
---

# R13-GAP-006 - Type-C-eskalering og actor-gate-kø

## Kort dom

R12 sine C-hull er ikke én type feil. En stor del er egentlig Type A: desk-researchbare uttrekk fra allerede identifiserte tabeller, PDF-er, lover, SSB-koder eller registre. En annen stor del er Type B: aktør-, kontrakt-, avregnings-, kundedata eller aktiv-status som må stå i actor-gate. Den tredje gruppen er ekte Type C: strukturelt ikke-målt, klassifisert, metodeukompatibelt eller ikke offentlig, og skal behandles som funn i seg selv.

## Sterkeste kilde

`research/_status/food-tg-r12/r12-intake-index-2026-06-24.jsonl` og `research/_status/food-tg-r12/r12-intake-index-2026-06-24.md`, spesielt feltene `weakestPoint`, `gapType`, `gate`, `triageGroups` og `ikkeSi`.

## Svakeste punkt

Dette er en intern triagesyntese, ikke ny primærforskning. Flere rader må reklassifiseres etter faktisk ny kildehenting i R13, slik GAP-001 allerede gjorde med SSB 08801.

## Eskaleringstabell

| R12-rad / hull | Opprinnelig hulltype | Ny vurdert type | Begrunnelse | Neste steg |
|---|---|---|---|---|
| R12-RES-003 importnoder | missing-primary-extract + actor-access | Type A delvis lukket; Type C sluttbruk | SSB 08801 kan lukke HS-serier; sluttbruk/fôrprotein-total ligger ikke direkte i koden. | Bruk R13-GAP-001; behold sluttbruk som C/actor-gate. |
| R12-FEED-003 alternative fôrproteiner | missing-realized-volume | Type B/C | Realisert volum krever aktør-/salgsdata; kapasitet kan desk-verifiseres. | Actor-gate per aktør; hold kapasitet som source-shortlist. |
| R12-RES-005 transport/lager/kaldkjede | empty-cell/ikke offentlig kapasitet | Type C + noe Type A | Kvalitative noder desk-lukkes; dagsdekning/kjølekapasitet er beredskaps-/forretningssensitivt. | Source-shortlist; ingen tallfigur uten dataeier. |
| R12-WASTE-002 oppdrettsslam | nasjonal innsamlet volumserie mangler | Type C med Type A metodekilder | NIBIO/SINTEF/FHF dokumenterer metodeproblem; faktisk innsamlet volum nasjonalt er ikke åpen serie. | PCQ som datagap; actor-gate for operatørvolum. |
| R12-FEED-001 fiskeolje art/sluttbruk | art/sluttbruk mangler | Type C/B | SSB lukker HS/importland, men ikke art eller fôrsluttbruk. | Actor-gate mot importør/fôrprodusent; tolltarifftekst desk-lukkes. |
| R12-ACTOR-001 markedshager | aktiv status per produsent | Type B | Krever primærlocator per produsent eller aktørbekreftelse. | Actor-gate kø. |
| R12-ACTOR-002 REKO tall | produsent/kunde/ring-telling | Type A/B/C blandet | Organisering er A; ringtelling kan desk-hentes; kundededuplisering/produsenter er actor-gate. | R13-AKTOR-003. |
| R12-ACTOR-003 andelslandbruk | aktiv status etter 2023 | Type B | Kart/API er kandidatflate, ikke aktiv drift. | R13-AKTOR-002 actor-gate. |
| R12-ACTOR-004 regenerative praktikere | medlems-/gårdslister | Type B/C | Åpne lister er kandidater; ikke komplett aktiv praksisregister. | R13-AKTOR-004. |
| R12-DIST-001 ASKO/HORECA 70 % | uavhengig markedsandel | Type A hvis rapport finnes; ellers Type B | Krever markedsrapport/tilsynstall eller aktørdata; gammel bransjekilde er B/C. | Parker claim; PCQ ved ny locator. |
| R12-FARM-002 per-kg margin | kjøperpris/avregning | Type B | Ikke desk-researchbar uten aktør-/avtaledata. | Actor-gate/DASK. |
| R12-VIZ-001 leddprofil | harmonisert datakontrakt | Type A/B/C blandet | Flere celler kan desk-lukkes, men aktør/stock/sluttbruk står igjen. | Bruk som intern datakontrakt. |
| R12-WASTE-003 digestat | nordisk N/P/K-serie | Type A for SE; Type C harmonisering | Sverige har SPCR 120; nordisk sammenligning mangler felles metode. | R13-WASTE-005. |
| R12-WASTE-004 kaffegrut | egen avfallsfraksjon | Type A/B/C | Import/forbruk kan desk-estimeres; faktisk disponering krever aktør/avfallsdata. | R13-WASTE-006. |
| R12-WASTE-005 prevention | effekt/baseline | Type A/C | Tiltak finnes; effekt uten baseline er C. | R13-WASTE-008. |
| R12-FEED-005 musling/tang/tare | kommersielt fôrvolum | Type C/B | Prosjekter/potensial desk-lukkes, realisert volum krever aktør/fôrprodusent. | R13-PROT-003. |
| R12-TRUE-004 SOIL-score | lokator mangler | Type C | Ikke funnet i IPBES/Nexus; kan være internt eller annen score. | Parker til locator. |
| R12-GOV-004 Plantagon/Rest | entity/primærstatus | Type A for register; Type C for effektclaim | Register kan desk-lukkes; teknologieffekt kan ikke avledes av konkurs alene. | R13-INNO-004. |
| R12-VIZ-003 kausalkart | målt kausal effekt | Type C | Struktur/pil kan dokumenteres, men målt effekt mangler ofte. | Forståelse, ikke faktastemme. |
| R12-VIZ-004 datagapfigur | scope/metode | Type A for figurunderlag; Type C for full systemrevisjon | Gaplisten er batchbasert, ikke universell. | R13-LAND-004. |

## Actor-gate-kø

| Kø | Hvorfor actor-gate | Første eier-/datakrav |
|---|---|---|
| Alternative fôrproteiner | Realisert solgt fôr-grade volum er ikke offentlig per aktør. | Årsvolum, produktform, kunder/fôrbruk, godkjenning. |
| REKO | Aktive produsenter/kunder/omsetning krever nettverks-/ringdata. | Årsmelding, ringliste, produsenttelling, deduplisert kundemål. |
| Andelslandbruk | Aktiv drift etter 2023 må bekreftes per gård. | Primærlocator/egen side, sesongstatus, andelshavere. |
| Markedshager/regenerative praktikere | Kart og organisasjonslister er kandidater, ikke verifisert drift. | Produsentlokator, aktiv status, produksjons-/praksisfelt. |
| Oppdrettsslam | Faktisk innsamlet/behandlet volum per anlegg/region er ikke åpen nasjonal serie. | Operatørdata, avfalls-/behandlingsrapport, tørrstoff/N/P. |
| Per-kg bondemargin | Avregning, kontrakter og kjøperpris er aktørdata. | Avtaledata, produksjonstype, periode, prisgrunnlag. |
| Kaldkjede/lager | Dagsdekning, kjølekapasitet og lagringssted er forretnings-/beredskapssensitivt. | Dataeier, aggregeringsnivå, sikkerhetsvurdering. |

## Ekte Type C som skal bevares

- Sluttbruk der varekode eller rapport bare viser import/produksjon.
- Kausal effekt der kilden bare viser struktur, tiltak eller kapasitet.
- Harmoniserte nordiske serier der landene måler ulikt.
- Beredskaps-/lagerdata som er klassifisert eller ikke offentlig.
- Ikke-målte prevention-/sufficiency-effekter uten baseline.

## Ikke si

- Ikke gjør Type C til "mangler bare litt research" uten ny locator.
- Ikke gjør actor-gate-data til desk-claim.
- Ikke fyll tomme celler med estimat fordi en figur trenger tall.
- Ikke behandle intern syntese som primærkilde.

## Anbefalt gate

Forståelse med actor-gate-kø. Bruk denne fila til å prioritere R13, ikke som ekstern kilde.
