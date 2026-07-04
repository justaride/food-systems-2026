# MVK andelslandbruk Brreg-deepening - mottakslogg 2026-07-02

- Kandidatfil: `research/_status/mvk-andelslandbruk-brreg-deepening-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-andelslandbruk-brreg-deepening-2026-07-02`.
- Celle: `lokale-verdikjeder / andelslandbruk`.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-andelslandbruk-brreg-deepening-2026-07-02`.
- Kildepass: Brreg Enhetsregisteret navnesøk på `andelslandbruk`, `andelsgård`, `andelsgard`, `andelshage`, `andelsbruk`, `samdyrkelag`, `andelsjordbruk` og `lutlandbruk`, med detaljoppslag per org.nr., hentet 2026-07-02.
- Kandidatutvalg: 9 Brreg-aktive enheter med eksplisitt CSA-/andelslandbruk-/andelshage-signal i navn, aktivitet eller formål, deduplisert mot 74 live `subdomene:andelslandbruk`-registreringer og tidligere Økoguiden-kandidatfiler. `BODØ ANDELSLANDBRUK SA` og `LINDERUD ANDELSGÅRD SA` finnes allerede som `forbruk/matfellesskap-innkjopslag`-aktører og skal gjenbrukes/berikes med andelslandbruk-registrering.
- Droppet/ikke importert: ikke-CSA samvirkelag/andelslag, bolig/barnehage/vann/avløp/fly/idrett/handel-rader, og Brreg-rader som allerede er representert i `andelslandbruk` via Økoguiden eller tidligere importer (`Moland`, `Spiren`, `Øverland`, `Lønning`, `Anda`, m.fl.). `Kaupang Andelslandbruk` er holdt tilbake fordi Brreg aktivitet/næringskode peker mot snekkerarbeid og ikke aktiv CSA-drift.
- Importresultat: 7 nye aktører og 2 eksisterende aktører beriket (`bodo-andelslandbruk-sa`, `linderud-andelsgard-sa`).
- Dekningsdelta etter import/audit: `andelslandbruk` 74 -> 83 og gap 16 -> 7; `lokale-verdikjeder` er nå 246/258, maks gap er 7, og total domene-tagget dekning er 1,577/1,651. DB Actor-count er 1,521.
- Kilde-/claim-status: Brreg bekrefter juridisk enhet, aktiv registerstatus, NACE og registertekst. Brreg bekrefter ikke aktiv 2026-sesong, andelstilbud, medlemstall, produksjonsvolum, Debio-status, areal eller komplett nasjonal aktivliste. Batchen er actor-gate/kartleggingsdekning, ikke hard claim-lock.
- Resterende gap: kildebegrenset. Økoguiden-kategorien er brukt opp etter tre deepeningpass, og Brreg-navne-/formåls-/aktivitetsøk fanger bare juridiske enheter med eksplisitt CSA-signal. De siste 7 av Økologisk Norge-universet på 90 må enten komme fra ny/komplett aktivliste, direkte aktørkilde eller human-gated verifisering.
- Prod-wiring: `db:import:mvk-andelslandbruk-brreg-deepening-2026-07-02` ligger i `db:prod-sync` før `db:verify`.
