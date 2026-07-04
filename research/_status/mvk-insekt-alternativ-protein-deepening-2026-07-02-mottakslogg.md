# MVK insekt-alternativ-protein deepening - mottakslogg 2026-07-02

- Kandidatfil: `research/_status/mvk-insekt-alternativ-protein-deepening-2026-07-02-node-kandidater.csv`.
- Dataset: `mvk-insekt-alternativ-protein-deepening-2026-07-02`.
- Celle: `matsvinn-sirkulaer / insekt-alternativ-protein`.
- Importkommando: `DATABASE_URL='postgresql://localhost:5432/foodsystems?schema=public' npm run db:import:mvk-insekt-alternativ-protein-deepening-2026-07-02`.
- Kildepass: Brreg Enhetsregisteret navnesøk på `insekt`, `insekter`, `insect`, `larve`, `larver`, `melorm`, `mealworm`, `soldatflue`, `soldier fly`, `black soldier`, `bsf`, `protein`, `biokonvertering`, `bioconversion`, `tunikat`, `tunicate`, `ciona`, `alternative protein` og `alternativ protein`, med detaljoppslag per org.nr., hentet 2026-07-02.
- Kandidatutvalg: 2 Brreg-aktive enheter med eksplisitt norsk protein-/feed-/larve-/organisk-avfall-signal etter dedupe mot 5 live `subdomene:insekt-alternativ-protein`-registreringer og tidligere MVK-kandidatfiler. `ARCTIC PROTEIN INDUSTRIES AS` finnes allerede som `foredling-industri / naeringsmiddel-ovrig`-aktør og skal gjenbrukes/berikes.
- Droppet/ikke importert: skadedyrbekjempelse, insektvern/naturkartlegging uten mat-/fôrproduksjon, student-/nettverksorganisasjoner, restauranter, klubber/foreninger, Bygdefolkets Studieforbund-false positives (`BSF`) og `Larvik`-navnetreff. Studentorganisasjonene `THE NMBU ALT PROTEIN PROJECT` og `THE NTNU ALT PROTEIN PROJECT` er ikke produsent-/leverandørnoder og passer bedre som FoU/nettverkskontekst enn som actor-gate fyll i denne cellen.
- Importresultat: 1 ny aktør (`proteios-as`) og 1 eksisterende aktør beriket (`arctic-protein-industries-as`).
- Dekningsdelta etter import/audit: `insekt-alternativ-protein` 5 -> 7 og gap 15 -> 13; `matsvinn-sirkulaer` er nå 83/120, maks gap er 13, og total domene-tagget dekning er 1,579/1,651. DB Actor-count er 1,522.
- Kilde-/claim-status: Brreg bekrefter juridisk enhet, aktiv registerstatus, NACE og registertekst. Brreg bekrefter ikke realisert volum, substratgrunnlag, faktisk leveranse, salg til fiskefôrprodusenter, godkjenningsstatus, sirkulær substratbruk eller kommersiell driftsskala. Batchen er actor-gate/kartleggingsdekning, ikke hard claim-lock.
- Resterende gap: kildebegrenset. Etter Brreg-pass og tidligere MultiFuelLarve-/aktørpass finnes få trygge norske produsent-/leverandørnoder uten å fylle med rådgivning, FoU, nettverk, petfood/importcase eller navnetreffstøy.
- Prod-wiring: `db:import:mvk-insekt-alternativ-protein-deepening-2026-07-02` ligger i `db:prod-sync` rett etter `db:import:mvk-insekt-alternativ-protein-2026-06-26`.
