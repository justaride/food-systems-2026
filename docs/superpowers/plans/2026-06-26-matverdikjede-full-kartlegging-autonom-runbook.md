# Autonom runbook v2: fullstendig kartlegging av matverdikjeden

> **Til:** en autonom agent (Codex goal-mode), over MANGE lange økter.
> **Mål:** Drive systematisk, konvergerende kartlegging av **hele den norske matverdikjeden** — vektet mot økologi, sirkulær og SME-/praktikerlaget der dagens dekning er tynnest — til taksonomi-metning, med ærlige hull der universet er ukjennbart.
> **Bygger på:** v1-runbooken (`2026-06-25-domene-kartlegging-autonom-runbook.md`) + rammeverket (dekningsbok, `audit-domain-coverage.ts`, `import-domain-actors.ts`, `/aktorer`-badge). Les v1 først; denne utvider scope, taksonomi og dedup/lenking.

---

## 0. Slik kjører du (goal-mode, flerøkt)

Mål per økt: **«Kjør matverdikjede-runbooken: velg topp-gap-celler i dekningsboka, gather → dedup+lenk mot eksisterende KB → import → reconcile per celle, til cellene er mettet eller budsjettet er brukt. Oppdater sesjonslogg + completeness-dashboard, og åpne PR.»**

Dette er en **flerøkt-prosess**. Dekningsboka + sesjonsloggen er den varige fronten — hver økt fortsetter der forrige slapp. «Ferdig» er ikke én økt, men når alle celler er mettet (§2).

---

## 1. Forutsetninger

1. `DATABASE_URL` = **lokal** Postgres (`localhost`). Aldri prod.
2. Egen branch fra `main` (worktree). Aldri direkte på `main`.
3. `npm`, `npx tsx`, nett-tilgang.
4. **Importer-kapabilitet (første-økt-oppgave hvis ikke gjort):** utvid `scripts/import-domain-actors.ts` slik at den ved `org_nr` i kandidatraden resolver `Company` via `prisma.company.findUnique({ where: { orgNr } })` og setter `Actor.companyId` (lenking mot selskapslaget). Eksisterende Actor med samme `companyId`/slug → berik, aldri dupliser. Verifiser idempotens som i v1 før bruk.
5. Les `.claude/source-attribution-policy.md`, `.claude/database.md`, `.claude/company-registry.md`.

---

## 2. Objektiv & konvergens (taksonomi-metning)

**Univers:** Norge uttømmende; Norden (SE/DK/FI/IS) kun der noden kobler til norske aktører.

**«Komplett» = alle celler i taksonomien (§3) mettet**, der mettet betyr `mapped_count ≥ min(N, estimated_universe)` (default N=20) **eller** to påfølgende gather-runder for cellen gir < 2 nye noder (loop-til-tørr). Celler med ukjent univers merkes `universe_confidence=lav` og regnes mettet ved loop-til-tørr. Dette er en **konvergerende, målbar** tilstand — ikke påstått omniscience.

**Vekting:** prioriter celler etter `gap` synkende, men i de tverrgående/SME-/økologi-/sirkulær-cellene (der eksisterende dekning er tynnest). Selskaps-/dagligvare-/konsern-laget regnes som **allerede dekket** — der lenker vi (§4), ikke re-kartlegger.

**Cap:** maks 30 nye noder per celle per økt. **Hard backstop:** maks 250 nye noder per økt.

---

## 3. Taksonomi-spine = hele verdikjeden

Utvid `research/_status/domene-dekningsbok.csv` (idempotent — ikke dupliser eksisterende rader) med cellene under (geo NO), med univers-anslag (grovt/kildebelagt; ellers `universe_confidence=lav`). Behold v1-cellene (`lokale-verdikjeder`, `regenerativ-praksis`, `permakultur-fleraarige`, `institusjon-finansiering`) — disse er en del av denne taksonomien.

**Verdikjedestadier (domener) × subdomener:**

- **innsatsfaktorer:** `froe-genressurser`, `for-protein`, `gjodsel-jordforbedring`, `biostimulanter-jordliv`
- **primaerproduksjon:** `jordbruk-groent`, `husdyr-beite`, `havbruk-akvakultur`, `villfisk-fiskeri`, `ville-ressurser-sanking`, `urban-dyrking`
- **foredling-industri:** `meieri`, `kjott-egg`, `korn-molle-bakeri`, `frukt-groent-foredling`, `drikke-bryggeri`, `sjomat-foredling`, `naeringsmiddel-ovrig`
- **distribusjon-grossist:** `grossist-distributor`, `logistikk-lager`, `alternativ-distribusjon`
- **handel-dagligvare:** `dagligvarekjede`, `spesialhandel-delikatesse`, `direktesalg-plattform`
- **horeca-offentlig:** `restaurant-storkjokken`, `offentlig-innkjop-kantine`, `reiseliv-gardsmat`
- **forbruk:** `forbrukerorganisasjon`, `matfellesskap-innkjopslag`
- **matsvinn-sirkulaer:** `matredistribusjon`, `biogass-bioraffinering`, `kompost-jordprodukt`, `reststrom-sidestrom`, `emballasje-retur`, `insekt-alternativ-protein`
- **okologi-sertifisering** (tverrgaaende): `kontrollorgan-merkeordning`, `okologisk-produsent`, `regenerativ-sertifisering`
- **fou-institusjon** (tverrgaaende): `forskningsinstitutt`, `universitet-utdanning`, `nettverk-kompetanse`
- **virkemiddel-policy** (tverrgaaende): `virkemiddelapparat`, `forvaltning-tilsyn`, `politisk-program`
- **interesseorg-paraply** (tverrgaaende): `naeringsorganisasjon`, `faglag-bonde`, `miljo-forbruker-ngo`
- **finansiering-investering** (tverrgaaende): `stiftelse-fond`, `impact-investor`, `kooperativ-eierskap`

Subdomenelista er den eneste «åpne» og kan justeres ved oppstart hvis et stadium åpenbart mangler en bøtte. Hold deg ellers til denne så dekningsboka er stabil på tvers av økter.

---

## 4. Dedup + lenking mot eksisterende KB (kritisk)

Det eksisterende selskaps-/konsern-laget skal **forenes**, ikke dupliseres.

**Dedup-rekkefølge før import, per kandidatnode:**
1. Har `org_nr`? → `Company.findUnique({ orgNr })`. Treff: importeren setter `Actor.companyId` og berik/lenk; **opprett ikke** en parallell node. Sjekk også om en Actor allerede har den `companyId`.
2. Match navn mot `Company.name` (normalisert) og `Actor.name`/`slug`. Sannsynlig treff uten org.nr → flagg for menneske i review-køen, importer som `unverified` til bekreftet.
3. Person → `PersonProfile.personKey` (canonical). Treff → berik roller/affiliations, ikke dupliser.

**Lenking (slik «hele kjeden» blir sammenhengende):**
- Når en ny SME-/praktiker-/økologi-node har en kjent relasjon til en eksisterende aktør/konsern (leverandør til, medlem av, datter av, sertifisert av, finansiert av), opprett `ActorRelationship` (`supplier_to`/`member_of`/`subsidiary_of`/`certified_by`/`funded_by`) — bruk `--rel`-JSON i importen. Lenk oppover mot verdikjedestadiet og mot eksisterende konsernnoder der det er kjent.
- Aktør som ér et selskap: `companyId` er lenken (ingen relasjon nødvendig).

**Cross-session dedup-audit (obligatorisk hver økt, §8):** kjør en sjekk som fanger utilsiktede duplikater på tvers av økter (samme navn/orgNr, ulik slug). Slå sammen/flagg før commit.

---

## 5. Per-økt-loop

```
1. Utvid/verifiser taksonomien i dekningsboka (§3, idempotent).
2. npm run audit:domain-coverage -- --date=<i-dag>  → les domene-profiles.json
3. Arbeidsliste = NO-celler med gap > 0, sortert synkende på gap, vektet mot tynt-dekkede lag (§2).
4. FOR HVER celle (til §7 stopper):
   a. Mettet (§2)? → hopp over.
   b. REGISTRERINGSPASS (§6): strukturerte lister/registre → kandidatrader.
   c. AGENT-FANOUT (§6): praktikere/uformelle aktører registrene ikke ser; «ikke gjett».
   d. Bygg kandidat-CSV (16 kolonner, v1 §5; bruk `org_nr` der det finnes — viktig for lenking).
   e. DEDUP + LENK (§4): mot Company/Actor/PersonProfile; bygg ev. --rel-JSON for relasjoner.
   f. VERIFISERINGSVAKTER (v1 §6, balansert): lokator påkrevd (ellers dropp); machine_verified kun ved register/egen-side; org.nr Brreg-validert; agent-web → unverified.
   g. IMPORT: npx tsx scripts/import-domain-actors.ts --csv=<cellefil> --dataset=mvk-<celle>-<dato> [--rel=<rel.json>]
   h. APPEND importerte noder til review-køen.
   i. RECONCILE: oppdater last_updated, kjør audit på nytt.
   j. Mottakslogg for cellen.
   j2. PROD-WIRING (obligatorisk): registrer npm-alias db:import:mvk-<celle>-<dato> + legg inn i db:prod-sync (før db:verify).
   k. COMMIT per celle.
5. CROSS-SESSION DEDUP-AUDIT (§4) + COMPLETENESS-CRITIC (§8).
6. Oppdater sesjonslogg + completeness-dashboard (§8).
7. Stopp (§7) → PR.
```

---

## 6. Kilde-playbook per stadium (NO)

- **innsatsfaktorer:** KVANN/NordGen/Norsk genressurssenter (frø); Felleskjøpet/Fiskå/Norgesfôr (fôr); Yara/Grønn Gjødsel/biogass-rest (gjødsel).
- **primaerproduksjon:** Brreg NACE 01/03; Landbruksregister; produksjonstilskudd; Debio/Økoguiden (økologisk); Akvakulturregister (havbruk); Fiskeridir (villfisk).
- **foredling-industri:** Brreg NACE 10/11; TINE/Q/Røros (meieri); Nortura/lokale slakteri; Lantmännen/møller; bryggeri-/cideryregistre; NHO Mat og Drikke-medlemmer.
- **distribusjon-grossist:** ASKO/Bama/Servicegrossistene; alternativ: Dagleg/Reko/andelslag.
- **handel-dagligvare:** allerede dekket (NorgesGruppen/Coop/Reitan-trærne) → **lenk**; spesialhandel/delikatesse som nye noder.
- **horeca-offentlig:** offentlige innkjøpsavtaler; HANEN (gardsmat/reiseliv); storkjøkken-kjeder.
- **forbruk:** Forbrukerrådet, Framtiden i våre hender, matfellesskap/innkjøpslag.
- **matsvinn-sirkulaer:** Matsentralen/Matvett; biogass (Greve/Den Magiske Fabrikken/Biokraft); kompost; Grønt Punkt/emballasjeretur; insektoppdrett (Invertapro o.l.).
- **tverrgaaende:** NIBIO/NORSØK/Ruralis/Nofima/SINTEF; NMBU/SLU/UiO-SUM; Innovasjon Norge/Forskningsrådet/Landbruksdir; Debio/Stiftelsen Norsk Mat; Økologisk Norge/NBS/Bondelaget/Sjømat Norge; Axfoundation/stiftelser/impact-fond.

**Agent-fanout:** per celle, målrettede søk for navngitte aktører registrene ikke fanger. Hver kandidat MÅ ha hentet lokator.

---

## 7. Stopp- og sikkerhetsvakter (per økt)

Stopp å starte nye celler når: alle NO-celler mettet (§2); token-/tidsbudsjett nær slutt (behold margin til §8 + PR); 250 nye noder importert; eller 2 påfølgende celler gir 0 nye noder etter både registre og fanout.

**Sikkerhet:** lokal DB only; ingen Prisma-schema-endring (alt via themeTags/metadata/companyId-lenk); ingen rå binær/filer ≥50 MB; ingen prod-import. Import-feil → STOPP cellen, logg, gå videre; improviser aldri schema/datafiks.

---

## 8. Output, dashboard & avslutning (per økt)

Committet hver økt:
- Oppdatert dekningsbok + `domene-profiles.json` + hull-rapport.
- Per-celle kandidat-CSV-er, --rel-JSON (hvis brukt) og mottakslogger.
- `research/_status/mvk-review-koe-<dato>.csv` + `mvk-usikkerhetslogg-<dato>.md`.
- **`research/_status/mvk-sesjonslogg.md`** (append-only, varig front): per økt — dato, celler bearbeidet, nye/lenkede/flaggede noder, dekningsdelta, stopp-årsak, neste arbeidsliste.
- **`research/_status/mvk-completeness-dashboard.md`** (regenerert): per stadium — sum kartlagt vs. anslått univers, antall mettede celler / totalt, dekning-%, eldste sist-berørt-dato.

**Completeness-critic (per økt):** en avsluttende vurdering — hvilket stadium/celle er underrepresentert relativt til sitt univers? Hva ble droppet (kildeløst)? Skriv funnene som neste økts toppliste i sesjonsloggen.

**Verifiseringsbatteri før PR** (alle rene): `db:audit`, `db:audit:strict-sources` (full checkout), `audit:research-artifacts -- --base=origin/main`, `gate:overclaim`, `npx tsc --noEmit`, `npm test`. Åpne PR mot `main`; bekreft full `npm run build` i CI. Deploy via Coolify/`justaride`.

---

## 9. Definition of Done

**Per økt:**
- [ ] Taksonomien i dekningsboka komplett/utvidet; bearbeidede celler har kandidat-CSV + import + mottakslogg + dekningsdelta + prod-sync-alias + commit.
- [ ] Alle nye noder har hentet lokator; kildeløse droppet+logget; org.nr Brreg-validert; selskaps-entiteter lenket via `companyId` (ikke duplisert).
- [ ] Review-kø + usikkerhetslogg + sesjonslogg + completeness-dashboard oppdatert.
- [ ] Cross-session dedup-audit kjørt; ingen utilsiktede duplikater.
- [ ] Verifiseringsbatteriet rent; PR åpnet.

**Overordnet (prosessen ferdig):**
- [ ] Alle NO-celler i §3-taksonomien mettet (eller dokumentert som ukjennbart univers via loop-til-tørr).
- [ ] Completeness-dashboard viser ≥ målgulv per stadium; gjenstående hull eksplisitt dokumentert.

---

## 10. Faste forbehold (carry-over)

«Fullstendig» = taksonomi-metning med dokumenterte hull, ikke omniscience. Selskapslaget lenkes, re-kartlegges ikke. SUM = UiO (ikke NMBU). REKO Danmark = negativt funn. Multistrata Agroforestry = `disputed` til KVANN bekrefter EU-ID. Eksisterende kuraterte aktører/konsernnoder berikes/lenkes additivt, aldri klobbes. `disputed`/`unverified` holdes ute av whitepaper-gates. Agent-web-funn aldri auto-`machine_verified`.
