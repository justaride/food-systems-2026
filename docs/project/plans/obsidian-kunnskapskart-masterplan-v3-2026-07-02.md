---
tittel: Masterplan V3 — Fra komplett vault til lesbart kart (Obsidian)
status: utkast-til-godkjenning
eier: Gabriel
dato: 2026-07-02
erstatter: docs/project/plans/archive/obsidian-kunnskapskart-masterplan-2026-07-02.md (V2-planen; VK-0–VK-4 anses levert via PR #228)
arbeidsflate: Food Systems Obsidian/ (vault i repo-roten)
formål: Analyse-cockpit + visningsflate (besluttet 2026-07-02)
utfører: Codex via goal-prompt; menneskelige gates markert eksplisitt
bruksregel: Internt arbeidskart. Ekstern bruk av tall/claims krever claim-lock/siterbarhets-gate (.claude/source-attribution-policy.md).
---

# Masterplan V3: Fra komplett vault til lesbart kart

## 0. Goal-prompt (lim inn i Codex)

> Løft Obsidian-vaulten `Food Systems Obsidian/` fra "komplett datasett" til "lesbart kart", etter `docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md`. Utgangspunktet er PR #228 (merget baseline). Arbeid fasevis M1 → M4 (M0 og M5 er menneskelige gates), én PR per fase, akseptansekriteriene i planen er definition-of-done. Regler: (1) menneskelig innhold under `## Notater` overlever alltid sync; (2) bygget er DB-fritt — DB-avhengige steg leser committede JSON-er i `data/vault-export/`; (3) CLAUDE.md-disiplin: små sporbare endringer, verifikasjon før fullført, ingen adjacent refactors; (4) alle genererte noter beholder kilde- og siterbarhetsmarkering; (5) nye valideringsregler legges i `vault:check`, ikke i nye separate gate-skript — prosessmaskineriet skal slankes, ikke vokse.

## 1. Kritisk analyse av V2-leveransen (PR #228)

### 1.1 Faktagrunnlag (verifisert mot branchen 2026-07-02)

- PR #228 = 4 commits (`eb9950f` … `31fbd58`). Vault på branchen: **764 md-noter + 30 canvas**.
- Sammensetning: `11 Maktkart` 540 filer (354 selskapsnoter, 182 personnoter), `10 Innsiktskart` 126, `12 Kilder` 46, arkiv-/navigasjonslaget (`0 Kart`, klynge 1–9 og Welcome) 52.
- Canvas: Kunnskapskart 47 noder/17 kanter, Maktkart 31/33, Verdikjedekart 42/57, Oversiktskart, 25 konsern-canvas og 2 temacanvas.
- `.obsidian/graph.json`: 10 fargegrupper per mappe; `search: ""` (ingen default-filter), `showOrphans: true`.
- Infrastruktur: `vault:sync` er idempotent med `## Notater`-merge; `vault:check` dekker wikilenker, frontmatter, canvas-integritet, Dataview-fences, gap→mission, AP-1-bruksregel m.m.; eksport er committede JSON-er i `data/vault-export/` (DB-fri build bevart); 651/651 tester grønne.

### 1.2 Det som er sterkt og skal bevares

1. **Sync-fundamentet (VK-0/VK-1) er solid ingeniørarbeid.** Idempotent sync, byte-for-byte-bevaring av menneskelige notater, committede eksport-artefakter og en omfattende validator. Dette er gjenbrukbar infrastruktur som V3 bygger på, ikke river.
2. **Tre-inngangs-arkitekturen er riktig.** Welcome → HUB (arkiv) / Innsiktskartet (hva vi vet) / Maktkartet (hvem som sitter der) er den riktige mentale modellen for prosjektet.
3. **Bevis-kjeden I01–I26 som lenket kjede** er kartets mest verdifulle analytiske struktur.
4. **Siterbarhetsdisiplinen er gjennomført.** Hver generert note bærer `siterbarhet: intern` og claim-lock-varsler; AP-1-bruksregelen står ordrett på personnoter. Dette er i tråd med source-attribution-policyen og var ikke gitt.

### 1.3 Kritiske funn — hvorfor du ikke får oversiktsbilde

**F1 — Du ser sannsynligvis ikke V2 i det hele tatt.** Vaulten på disk i prosjektmappa er en *eldre generasjon* (214 noter, gammel Welcome uten frontmatter, python-æraens struktur). V2-vaulten (764 noter) ligger kun på PR-branchen. Å vurdere kartet fra lokal disk gir et falskt bilde. Dette er også en prosessvarsling: ugitte vault-kopier på disk kan avvike stille fra repo-sannheten, så tall skal tas fra branchens tracked vault og `vault:check` heller enn fra lokale mapper.

**F2 — Signalet drukner i DB-stubber.** Majoriteten av notene er generert fra DB-eksporten. `0000 NORGE AS` (eventarrangør, verdikjedeledd «ukjent») har samme nodevekt i grafen som NorgesGruppen ASA. Med `search: ""` og `showOrphans: true` åpner global graf som en hårball av 764 noter der de ~120 kuraterte innsikts-/makt-nodene er i mindretall. V2-planens egen VK-5-sjekkliste forutså dette («vurder -path-filtre»), men default-konfigurasjonen skiller ikke kjerne fra periferi. **Kartet er komplett, men ikke lesbart — dette er hovedproblemet V3 løser.**

**F3 — Legacy slash-filnavn ødelegger noter i grafen.** 8 noter fra python-generasjonen med `/` i tittel ligger som *nestede mapper* i vaulten (3 gaps, 5 looper — verifisert på branchen): `Gap – N/P/K fra oppdrett til fjord…` er lagret som mappe `Gap – N` → `P` → notefil `K fra oppdrett….md`; tilsvarende `Gap – Husdyrgjodsel-N tap til luft/vann`, `Gap – N/P/K i matsvinn…`, `Loop – Fiskeavfall til fiskemel/olje`, `Loop – Gasum tverrnordisk biogass (Finland/Sverige/Norge)`, `Loop – Gratis skolemat (Finland/Sverige)`, `Loop – Potetskall og -trim til for/biogass` og `Loop – REKO-ringer direktesalg (Finland/Sverige/Norge)`. I graf og lenker vises kun siste segment («Norge)», «K fra oppdrett…»). Ny kode (`noteFileName`) saniterer korrekt, men de eksisterende filene ble aldri migrert. Auditens «Slash-/nordiske navn handteres — Oppfylt» er sann for koden og usann for innholdet.

**F4 — Oversikten avhenger av plugins som ikke er satt opp.** Hub-notene lener seg på Dataview-tabeller; uten Dataview installert vises de som rå kodeblokker i hver sentrale note. `0 Kart/Oppsett.md` dokumenterer plugin-oppsettet (bevisst, auto-installasjon er uønsket), men da må førstegangsoppsettet være et eksplisitt menneskelig steg (M0) — ellers møter enhver reviewer et halvt fungerende kart.

**F5 — V2-innsiktene er tynne.** I27 er én setning som omskriver AP-1-konklusjonen uten tallene (32 interlockere, 11 broer, sektorpar-fordelingen står i `Maktkartet.md`, ikke i noten). Verdien ligger i lenkene, ikke i innholdet. Som cockpit-noder er de OK; som visningsflate er de ikke selvbærende.

**F6 — Små generatorfeil svekker inntrykket.** Selskapsnotene dupliserer tomstands-linjen («Ingen registrert i eksporten.» × 2 under både Eierskap og Forsyningskjede). Trivielt, men synlig på 350+ noter.

**F7 — Prosessmaskineriet har vokst forbi kartet.** Review-apparatet (masterplan + completion-audit + VK-5-protokoll + status + kandidatgodkjenning + preflight/samples/closeout-skript) gjentok samme reviewkrav flere steder, og talluoverensstemmelser mellom dokumentene svekket tilliten. Intensjonen (anti-overclaim, i tråd med CLAUDE.md) er riktig; utførelsen må være slankere: protokollen er kanonisk kravliste, vaulttall kommer fra sync/check-output, og DB-universet kommer fra `data/vault-export/manifest.json`.

### 1.4 Samlet vurdering

Codex har levert **riktig fundament og feil førsteinntrykk**. VK-0/VK-1-infrastrukturen er over forventning; informasjonsarkitekturen for *lesing* er under. Problemet er ikke manglende data — det er at kartet mangler et helikopterlag og default-visninger som skjuler råmaterialet til man ber om det. V3 er derfor primært et kuraterings- og informasjonsarkitektur-prosjekt, ikke et datainnsamlingsprosjekt. Merg PR #228 som baseline; ikke be Codex «gjøre ferdig» V2-planen — den er ferdig nok, og VK-5-review gjennomføres først når M0–M1 har gjort kartet reviewbart.

## 2. Målbilde

Kartet er både analyse-cockpit og visningsflate når:

1. **10-sekunderstesten:** Åpner du vaulten kald, gir Welcome + Oversiktskart et korrekt helikopterbilde av prosjektet på under et minutt.
2. **Grafen åpner lesbar:** Default global graf viser kjerne-laget (~150 noder: ledd, innsikter, kjerneaktører, looper, gaps, Norden, interlockere med brofunksjon) — periferien (300+ DB-stubber, kilderegistre) er ett filter-klikk unna, ikke i ansiktet.
3. **Hver kuratert node er selvbærende:** Innsikts- og kjerneaktørnoter inneholder claim + tall + kilde, ikke bare lenker.
4. **Visningsflaten tåler Cathrine/Thomas:** Canvas og graf kan vises i møte uten forbehold om «dette er egentlig ikke ferdig».
5. **Sync forblir en repo-kommando** og alle V2-invarianter står (se §5).

## 3. Arbeidspakker

### M0 — Se V2 og lås baseline (MENNESKE — Gabriel, ~45 min, gjøres først)

1. Merge PR #228 (eller checkout branchen lokalt hvis du vil se før merge): `git fetch origin pull/228/head:pr-228 && git checkout pr-228`.
2. Slett/flytt den utdaterte vault-kopien på disk før checkout (den er untracked og skygger for branch-innholdet).
3. Åpne `Food Systems Obsidian/` i Obsidian; installer per `0 Kart/Oppsett.md`: Dataview, Breadcrumbs, Minimal Theme Settings (+ Juggl eller 3D Graph); aktiver CSS-snippeten `kunnskapskart.css`.
4. Bruk 20 minutter i kartet med VK-5-protokollens blikk — men *ikke* gjennomfør full VK-5 ennå; noter førsteinntrykk under `## Notater` i Welcome.

**Akseptanse:** PR #228 merget til main; du har sett V2-grafen med plugins aktive; beslutning bekreftet om at M1-M4 kjøres.

### M1 — Oversiktslaget: signal over støy (CODEX — kjernefasen)

1. **Tiering av selskaps- og personlaget.** Nytt frontmatter-felt `tier: kjerne | periferi` på alle noter i `11 Maktkart/`. Kjerne = de 13 konsernrøttene, selskaper i konserntrærne med `valueChainStage` ≠ ukjent og eierskaps-/relasjonskanter, regulatorene, og interlockere med sektorbro. Periferi = resten (stubber uten analytisk kant). Flytt periferi-noter til `11 Maktkart/Selskaper/Register/` og `11 Maktkart/Personer/Register/` (sync-generert, med omdirigerte lenker).
2. **Default graf-filter.** `graph.json` genereres med `search: '-path:"Selskaper/Register" -path:"Personer/Register" -path:"12 Kilder"'` (eksakt syntaks verifiseres i Obsidian under M5) og `showOrphans: false`. Fargegrupper beholdes og utvides til å dekke `0 Kart` og klyngemappene.
3. **Migrér slash-filnavnene.** Flytt de 8 nestede legacy-notene (3 gaps, 5 looper — liste i §1.3 F3) til saniterte filnavn (`/` → `-`, mønster fra `noteFileName`), oppdater alle wikilenker, fjern de tomme mappene. Ny `vault:check`-regel: ingen undermapper i `Looper/`, `Gaps/`, `Innsikter/`, `Selskaper/` (utover `Register/`), `Personer/` (utover `Register/`).
4. **Oversiktskart.canvas — det faktiske helikopterbildet.** Én canvas som viser: de tre lagene (arkiv/innsikt/makt) som grupper, verdikjedens 8 ledd som ryggrad, de 4–6 viktigste innsiktene, de 5 fokusområdene (I34), nøkkeltallene (konsentrasjon, selvforsyning, styredekning) som tekstnoder. Maks ~35 noder. Welcome lenker til denne først.
5. **Fiks generatorfeilene:** dupliserte tomstands-linjer i selskapsnotene; `tags: ""`-tomfelt i frontmatter fjernes eller fylles.
6. **Vern mot rot:** ny `vault:check`-regel som feiler på `Untitled*`-filer og løse dagsnotater i vault-roten (finnes i dag kun i den utdaterte lokale kopien som fjernes i M0, men regelen hindrer at Obsidian-arbeidsfiler sniker seg inn i repoet).

**Akseptanse:** `vault:sync && vault:check` grønn; kjerne-graf ≤ ~180 noder med filter aktivt; ingen note-titler avkuttet av slash-mapper; Oversiktskart.canvas finnes og Welcome peker dit; diff viser kun M1-endringer.

### M2 — Innholdsløft der det betyr noe (CODEX foreslår → MENNESKE godkjenner)

1. **Selvbærende innsiktsnoter.** I27–I38-notene (de 6 genererte) utvides med tallgrunnlaget fra kildedokumentene (AP-1/AP-5-tall, fokusområdene, objective-function-kriteriene) etter samme mal som I01–I26. Codex genererer utkast; endringer i claim-språk går via godkjenningsarket.
2. **Kuratert sammendrag på kjerneaktørene.** De ~30 kjerneselskaps-/aktørnotene (konsernrøtter + regulatorer + eierfamilier) får en generert «Posisjon i systemet»-seksjon: 3–5 setninger fra research-syntesen (narrativ-struktur, konsern-coverage, AP-funn) med kildelenke — over `## Notater`, styrt seksjon.
3. **Avklar de parkerte I28–I35.** Egen claim-lock/datareview-økt (menneske + Claude): godkjenn, omformuler eller forkast endelig. Parkert-status skal ikke bli permanent limbo.
4. **Stakeholder-laget fylles** (menneskelig oppgave med skjelett fra VK-4): `ask`, `prioritet`, `relasjon` på de 15 stakeholder-notene.

**Akseptanse:** hver generert innsiktsnote består «selvbærende»-testen (claim + tall + kilde uten å klikke videre); kjerneaktørnoter har Posisjon-seksjon med kilde; I28–I35 har endelig beslutning i godkjenningsarket.

### M3 — Visningsflaten (CODEX + menneskelig QA)

1. **Canvas-kvalitet:** gjennomgå Kunnskapskart/Verdikjedekart/Maktkart/temacanvas for overlapp, kantkryss og lesbarhet på projektor; konsern-canvasene stikkprøves (NorgesGruppen-treet med 49 selskaper er stresstesten).
2. **Presentasjonsvisninger:** dokumentert oppsett for Juggl/3D Graph-visning av (a) beviskjeden, (b) styrenettverket (kjerne), (c) sirkularitetsloopene per R-nivå.
3. **Eksport til leveranser:** definert rutine (manuell er OK) for å ta graf-/canvas-utsnitt til hvitbok-figurer og Miro (`docs/miro-kart-kunnskapsgrunnlag-blueprint.md` er mottaker-spec). Vurder lav-prioritet: delt JSON-format med appens `/graf`.

**Akseptanse:** skjermbilde-gjennomgang med Gabriel (og gjerne Cathrine) — «tåler møtevisning» er porten; eksportrutinen er dokumentert i `0 Kart/Oppsett.md`.

### M4 — Slank prosessmaskineriet (CODEX)

1. Konsolider `vault:review-preflight`/`review-samples`/`review-closeout`-logikken: behold funksjonaliteten, men flytt kravlistene til **ett** kanonisk dokument (review-protokollen); status- og audit-dokumentene refererer med lenke i stedet for å gjenta. Skriptene består, prosaen dedupliseres.
2. Rett talluoverensstemmelsene: én kanonisk kilde for notetall (sync-loggen/`vault:check`-output), én for DB-universet (`data/vault-export/manifest.json`); dokumentene siterer, ikke gjentar.
3. Arkiver V2-planen og completion-auditen under `docs/project/plans/archive/` med pekere hit. De aktive status-/auditnotatene skal være korte indeksnotater, ikke nye kopier av reviewkravlisten.

**Akseptanse:** ingen kravliste finnes i mer enn ett dokument; alle antall i styringsdokumentene kan spores til kanonisk kilde; gates fortsatt grønne/røde som før (closeout feiler fortsatt før M5).

### M5 — VK-5 menneskelig review og closeout (MENNESKE — Gabriel + evt. Cathrine)

Gjennomføres *etter* M1 (minimum) — å reviewe før kartet er lesbart gir støy-funn. Bruk eksisterende VK-5-protokoll: diff-stikkprøver, graf-lesbarhet, canvas-kvalitet, Dataview i Obsidian, siterbarhetsstikkprøver mot `audit:citable`, beslutning om app/whitepaper-visninger. Deretter: lukk protokollen, `npm run vault:review-closeout` grønn.

**Akseptanse:** closeout grønn; kartet kan kalles ferdig internt arbeidskart + godkjent visningsflate.

### M6 — Levende drift (løpende)

- `vault:sync` kjøres ved hver DB-refresh (`compute-metrics:full`-rutinen utvides med `vault:export-db` + `vault:sync`).
- Gaps→missions-looping: når en mission i `research/RESEARCH-MISSIONS.md` lukkes, oppdateres gap-noten (data inn, mission-referanse består).
- Nye innsikter (I39+) følger godkjenningsark-mønsteret; nye kilder får kildenote når en innsikt siterer dem.
- Kvartalsvis: 15-minutters graf-gjennomgang — er kjerne-laget fortsatt ≤ ~200 noder? Hvis ikke, re-tier.

## 4. Rekkefølge og avhengigheter

**M0 → M1 → (M2 ∥ M3 ∥ M4) → M5 → M6.** M0 er blokkerende menneskelig gate (merge + plugin-oppsett). M1 er den eneste fasen som må skje før review gir mening. M2–M4 er uavhengige og kan gå som parallelle Codex-PR-er. Ingen fase krever live DB (alt leser `data/vault-export/`); en eventuell ny DB-eksport i M6 følger tunnel-rutinen.

## 5. Vernede invarianter (uendret fra V2, gjelder alle faser)

1. Menneskelig innhold under `## Notater` overlever alltid sync — også gjennom M1-flyttingene (flytt = git mv + lenkeoppdatering, aldri regenerering av notedelen).
2. Vault-endringer rører aldri app-kode, DB eller committede dataartefakter (enveis repo → vault; unntak `data/vault-export/` som sync-input).
3. Alle datagenererte noter bærer kilde-referanse og siterbarhetsmarkering; AP-1-bruksregelen står ordrett på personnoter.
4. `vault:check` grønn før hver fase merges; bygget avhenger aldri av vaulten.
5. Ingen nye claims eksternt uten claim-lock/siterbarhets-gate — kartets lesbarhet endrer ikke publiserbarhet.

## 6. Suksesskriterier for hele V3

- Gabriel åpner vaulten kald og svarer ja på: «Får jeg oversiktsbildet?» (10-sekunderstesten, §2.1–2.2)
- VK-5 gjennomført og closeout grønn (M5)
- Minst én graf-/canvas-visning er brukt i et reelt møte eller leveranse (M3-beviset)
- Prosessdokumentasjonen er kortere enn ved V2, med null talluoverensstemmelser (M4)
