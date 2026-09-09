# B05 findings — Svensk forsyningsalternativ: Malmö og disponibel allokering

- programRunId: `20260909-beredskap-wave1`
- packageId: `B05`
- runId: `B05-20260909T102531Z-5341273b`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- terminalStatus: `waiting_owner`
- human_verified: false
- asOf: 2026-09-09T10:30:00Z

## Scope

Malmö mill alternative to the same Furuset case (`R5-C1-FURUSET-Q1-T72`) only. **Not** Sweden’s total annual surplus. Stop rule: no inference from corporate affiliation to access, and no inference from national harvest/beredskapslager to Furuset allocation. Unconfirmed right and quantity remain unknown (`null`, never zero).

## Question 1 — Kvalitetsbundne korn-/melpartier, eierskap, lager og frigivelsesvilkår?

**Answer (precise stop): Ukjent / ikke dokumentert i autoriserte offentlige og frosne kanaler.**

Kjent:
- R5-S03 (hash-verifisert) og live Malmö-sider: møllen produserer mel/miks; stor andel leveres i bulk til bakerikunder; besøksadresse Bassängkajen 14, 21118 Malmö.
- R5-S16/HT2026: kandidatprodukt **Bagarns Manitoba bulk 160585** er knyttet til **Malmö**; lagerlegend nevner Malmö, Eskilstuna og Järna; bulk default Malmö & Strängnäs.
- R6-G08-inntak er **ubesvart** (`sent: false`, feltene R6-G08-01..07 er `null`).

Ukjent / stopp:
- Parti-ID (korn vs mel), COA, netto tonn, fuktbasis, eierskap/uttaksrett, frigivelsesvilkår og kvalitetsgodkjent lager per lokasjon for Furuset-caset.

Neste steg: autorisert dataeierinntak til Cerealia Sverige Malmö lager-/allokerings-/kvalitetsansvarlige. Ingen e-post fra denne pakken.

## Question 2 — Hva binder kapasitet til svenske kunder eller andre land ved samme sjokk?

**Answer (precise stop): Ikke kvantifiserbart fra inspiserte kanaler.**

Kjent:
- Operatørsider beskriver samtidige kundesegmenter (konsument, bakeri, storkjøkken) og bulk til bakerikunder — dette er **kundegrupper**, ikke avstemt ordrebok.
- Jordbruksverket beskriver nasjonale beredskapslager via ramavtal i de fire nordligste län — **ikke** en Malmö→Furuset-allokering.
- Offentlig historikktekst nevner «775 ton per dygn» som anleggskapasitet; per stoppregel er dette **ikke** disponibel allokering.

Ukjent:
- Bindende ordre, innenlandske prioriteringer, sikkerhetsbeholdning, eksportavtaler og ikke-overlappende allokerings-ID-er i tonn per frist ved case-t0.

## Question 3 — Faktisk foredling/lasting og earliest dokumentert parti-tidslinje?

**Answer (precise stop): Ingen dokumentert parti-tidslinje funnet.**

Kjent:
- Måleprotokollen krever tidsstempler for uttak/frigivelse, maling, lasting m.m. per parti.
- Offentlige kanaler og ubesvart G08 gir ingen slike tider.

Ukjent:
- Earliest frigitt/klart parti, faktisk malbar mengde i scenarioets driftstimer, lastingstidspunkt og avgang mot Furuset.

Grenseflate: samordne senere med B06 (transport) og B17 via koordinator; ingen gjensidig venting i denne leveransen. B02 eier kvalitets-spesifikasjon for 160585 (ikke allokering).

## Owned gap disposition

| gapId | disposition | semanticGapClosed |
|---|---|---|
| R5-G04 | remains_open_waiting_owner | false |
| R6-G08 | remains_open_waiting_owner | false |
| B05-20260909T102531Z-5341273b-G01 | new_subgap_open_waiting_owner | false |
| B05-20260909T102531Z-5341273b-G02 | new_subgap_open_waiting_owner | false |
| B05-20260909T102531Z-5341273b-G03 | new_subgap_open_waiting_owner_and_coordination | false |

No automatic gap closure. No `candidate_resolution_proposed` (exact released-batch / allocation evidence absent).

## Limitations and contradictions

- Public negative finding ≠ proof that private warehouse/COA/allocation books do not exist.
- Live EN Malmö text hash differs from frozen R5-S03; both retained as distinct versions.
- Facility capacity text vs allocatable stock: capacity marketing must not be treated as released quantity.
- National beredskapslager ≠ Malmö case allocation (stop rule).
- No contacts, emails, publishing, plan/round mutation, or human_verified authority claims.

## Coordination notes

- B02: quality specification for 160585 is separate; no SE allocation inferred there or here.
- B06: transport corridor Malmö→Furuset needs batch release times before lead-time claims.
- B17: coordinator-owned interface after owner documents exist.
