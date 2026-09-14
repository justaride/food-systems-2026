# B15 findings — Island: vedtak, lagerordning og implementering

- programRunId: `20260909-beredskap-wave1`
- packageId: `B15`
- runId: `B15-20260909T103514Z-9d38b3c0`
- planCommit: `5c3d735712f3b5fe929ba8043ee57a74cb318e1a`
- researchBaselineCommit: `4026a90d62edf129d4323f7f0971ace716b03983`
- terminalStatus: `waiting_owner`
- human_verified: false
- asOf: 2026-09-09T10:45:00Z

## Scope

A4 institutional and dated status for Icelandic emergency/minimum food-stock arrangements after Alþingi case 57 and the 2024/2025 reports. **Not** a catalogue of general strategies. Stop rule: scenario, proposal, financing, contract and physical stock are distinct stages — no holdings or operations inferred from a political plan.

Coordination noted with B16/B17 (processing actors / deliverable chain); no mutual wait in this return.

## Question 1 — Finnes konkret etterfølgende vedtak/gjennomføring etter Alþingi-sak 57?

**Answer (precise stop): Ikke dokumentert som endelig vedtak eller gjennomført ordning i tilgjengelige, lesbare kanaler i denne kjøringen.**

Kjent:
- Þingskjal 57 (156. þing) er en **þingsályktunartillaga** som ber ministeren om å **utforme** en ordning for neyðarbirgðir av innenlandske landbruksprodukter i forbindelse med revisjon av búvörusamningar 2026 (B15-C01 / B15-S003).
- Svar 1505: rapportkontraktene hadde ikke egen oppfølgingsklausul; videre oppfølging ligger hos Atvinnuvegaráðuneytið; oppgitte beløp gjelder rapporter/mælaborð (B15-C02).
- Svar 1348: minimums-/nødlagre inngår i pågående tverrdepartementalt arbeid som fortsatt trenger avklarte mengder, ansvar, myndighet og prosedyrer (B15-C03).
- island-check.md (2026-09-08) beholdt A4-G002 åpen (B15-S006).

Ukjent / stopp:
- Endelig votering/samþykkt þingsályktun, komitéuttalelse fulltekst og implementerende avtale-/budsjettvedtak etter sak 57.
- Ferill-/komitésider blokkert (Cloudflare/403) i denne kjøringen (B15-C07 / B15-S008).
- Primær Stjórnarráðið-tekst for búvörusamningar-framlenging 2026-06-04 ikke tekstuttrekkbar (Blazor). Sekundær BBL-artikkel 11.06.2026 beskriver ettårs forlengelse til ut 2027 uten dokumentert nødlagre-klausul i den leste artikkelteksten (B15-C08) — dette er **ikke** fullstendig negativt bevis for avtalevedlegg.

Neste steg: usendt eierinntak B15-OWN-01/02 (Alþingi-sekretariat + departement). Ingen e-post fra denne pakken.

## Question 2 — Hvilke varevise lagre er fysisk dokumentert med dato/eier/rullering, og hva er bare scenario?

**Answer: Ingen vare-for-vare fysisk lagerregister med dato/eier/lokasjon/holdbarhet/rullering funnet i scoped kanaler. Scenario/anbefaling/kvalitativ status er dokumentert.**

Bare scenario / forslag / kvalitativ status (ikke register):
- HI juni 2025 Tafla 4: **lagt til** mengder for ~450 000 personer over 3 uker / 3 måneder / 6 måneder (B15-C04).
- LBHI 2024: importørlager fôrkorn typisk 1–2 måneder; gårdslager dager–uker; anbefalinger i sammendrag — uten datert registerrad (B15-C05).
- Svar 1348: prosess om lágmarksbirgðir, ikke beholdningstabell (B15-C03).

Fysisk dokumentert register: **ikke funnet** (B15-C06). A4-G001 forblir åpen.

## Question 3 — Hva er gjeldende uttaks-/finansieringsgrunnlag for reserveordningen?

**Answer (precise stop): Ikke dokumentert for en operativ reserveordning.**

Kjent som **ikke** operativt uttaks-/finansieringsgrunnlag:
- Sak 57-greinargerð foreslår mulig **geymslugjald**-modell — forslagstekst (B15-C01).
- Svar 1505 beløp: rapport 8 000 000 kr (HI) og mælaborð 3 480 000 kr — **rapport-/dashboardfinansiering** (B15-C02).
- Svar 1348: krever fortsatt skýrar heimildir/verkferlar for utnyttelse av minimumslagre — beskriver behov, ikke et gjeldende uttaksgrunnlag (B15-C03).

Ukjent: rettslig uttakshjemmel, aktiveringsmyndighet, prosedyre-ID, budsjettlinje/kontrakt for operativ reserve (subgap `B15-20260909T103514Z-9d38b3c0-G02`).

## Owned gap disposition

| gapId | disposition | semanticGapClosed |
|---|---|---|
| A4-G001 | remains_open_waiting_owner | false |
| A4-G002 | remains_open_waiting_owner | false |
| B15-20260909T103514Z-9d38b3c0-G01 | new_subgap_open_waiting_source_and_owner | false |
| B15-20260909T103514Z-9d38b3c0-G02 | new_subgap_open_waiting_owner | false |
| B15-20260909T103514Z-9d38b3c0-G03 | new_subgap_open_waiting_owner | false |
| B15-20260909T103514Z-9d38b3c0-G04 | new_subgap_open_waiting_source | false |

## Limitations / contradictions

- Ingen human_verified; ingen kanonisk lukking.
- Motsetning unngått ved streng klassifisering: forslag ≠ vedtak ≠ anskaffelse ≠ drift.
- Sekundær BBL vs ulest primær departementsside er eksplisitt tilgangsbegrensning, ikke «bevist fravær».
- A4-S001 hash anomaly note in island-check is out of B15 ownership except as inherited control context; B15 used LBHI/HI hashes that matched A4-S002/S003.

## Next step

Coordinator: route unsent owner intakes; optional new run if ferill access or agreement PDF becomes available. Do not edit research-plan/ or prior rounds from this package.
