# Autonom runbook: domene-kartlegging av regenerativt/lokalmat-feltet

> **Til:** en autonom agent (Codex goal-mode, lang session, fulle tillatelser).
> **Mål:** Drive dekningen av feltet (NO primært, Norden som kontekst) opp mot et gulv per celle ved å loope hybrid-pipelinen over hull-cellene i dekningsboka — uten menneskelig før-review, men med maskinhåndhevbare kvalitetsvakter og en review-kø for etterkontroll.
> **Bygger på:** rammeverket i PR #203 (dekningsbok + `audit-domain-coverage.ts` + `import-domain-actors.ts` + `/aktorer`-badge) og importrunden i PR #200.

---

## 0. Slik kjører du (goal-mode)

Sett dette som mål: **«Kjør domene-kartleggings-runbooken: loop hull-cellene i dekningsboka, gather → dedup → verifiser → import → reconcile per celle, til alle prioriterte NO-celler har nådd gulvet eller budsjettet er brukt. Produser review-kø, mottakslogg og PR.»**

Les hele denne fila først. Følg §3-loopen. Stopp kun på §7-betingelsene.

---

## 1. Forutsetninger (sjekk før start)

1. `DATABASE_URL` peker til **lokal** DB (ikke prod). Verifiser: hostname skal være `localhost`. **Importér aldri mot prod** — prod får data via `db:prod-sync` separat.
2. `npm`, `npx tsx` virker; `npm run db:audit` kjører rent på utgangspunktet.
3. Nett-tilgang (WebSearch + fetch) for registre og agent-fanout.
4. Jobb på **egen branch fra `main`** (git worktree anbefalt), aldri direkte på `main` eller en WIP-branch. Bekreft: `git rev-parse --abbrev-ref HEAD`.
5. Les `.claude/source-attribution-policy.md`, `.claude/data-imports.md`, `.claude/database.md` én gang.

---

## 2. Objektiv & «definition of done»

**Univers:** Norge uttømmende; Norden (SE/DK/FI/IS) kun der noden kobler til norske aktører.

**Taksonomi — 4 domener, hvert med underdomener.** `lokale-verdikjeder` er allerede i dekningsboka. Utvid `research/_status/domene-dekningsbok.csv` med cellene for de tre andre (NO-geo) ved start, med univers-anslag (grovt, kildebelagt der mulig; ellers `universe_confidence=lav`):

- **regenerativ-praksis:** `holistic-management-beiting`, `market-gardening`, `biodynamisk`, `jordhelse-karbon`, `raadgivning-nettverk`
- **permakultur-fleraarige:** `permakultur-foreninger`, `skogshage-agroforestry`, `froebevaring`, `planteskoler-froeleverandoerer`, `demonstrasjonssteder`
- **institusjon-finansiering:** `forskningsinstitutt`, `universitet-utdanning`, `virkemiddel-ordning`, `kontroll-sertifisering`, `interesseorg-paraply`

**Gulv per celle (stopp-betingelse, valgt: gulv + budsjett):**
- En celle er «mettet» når `mapped_count ≥ min(20, estimated_universe)` **eller** to påfølgende gather-runder for cellen legger til < 2 nye noder (loop-til-tørr).
- **Cap:** maks **30 nye noder per celle per kjøring** (unngå å dumpe tynne noder). Logg hvis cap treffes.
- **Hard backstop:** maks **250 nye noder totalt per kjøring**. Stopp og rapporter hvis nådd.

**Ferdig når:** alle NO-celler er mettet, ELLER budsjett/backstop trippet (§7).

---

## 3. Hovedloop (per kjøring)

```
1. Utvid dekningsboka med cellene i §2 (idempotent — ikke dupliser rader).
2. Kjør:  npm run audit:domain-coverage -- --date=<i-dag>
   → les public/data/coverage/domene-profiles.json
3. Bygg arbeidsliste = NO-celler med gap > 0, sortert synkende på gap.
4. FOR HVER celle i arbeidslista (til §7 stopper):
   a. Hvis cellen alt er mettet (§2) → hopp over.
   b. REGISTRERINGSPASS (§4): hent strukturerte lister for cellen → kandidatrader.
   c. AGENT-FANOUT (§4): finn praktikere/uformelle aktører registrene ikke ser.
   d. Bygg kandidat-CSV (16 kolonner, §5) for cellen.
   e. DEDUP (§5) mot DB → marker nye vs. berik-eksisterende.
   f. VERIFISERINGSVAKTER (§6) — sett/juster verificationStatus, valider org.nr, DROPP kildeløse.
   g. IMPORT:  npx tsx scripts/import-domain-actors.ts --csv=<cellefil> --dataset=domene-<celle>-<dato>
   h. APPEND hver importert node til review-køen (§5).
   i. RECONCILE:  oppdater last_updated i dekningsboka for cellen, kjør audit på nytt.
   j. Skriv/append mottakslogg for cellen.
   k. COMMIT per celle (egen commit, sporbar melding).
5. Når lista er tom eller §7 stopper → §8 sluttrapport + PR.
```

---

## 4. Kilde-playbook (hvor du leter, per domene — NO)

**Registreringspass** (strukturerte lister → `machine_verified`-kandidater når lokator er hentet):
- **lokale-verdikjeder:** rekonorge.no (ringliste), bondensmarked.no/lokallag, andelslandbruk.no (kart), hanen.no, lokalmat.no, okologisknorge.no/oekoguiden.
- **regenerativ-praksis:** regenerativtnorge.no, holisticmanagement.no (rådgivere), markedshage.no (nettverk), biodynamisk.no + Debio Demeter-gårdsliste, NLR målrettet-beiting-prosjekter.
- **permakultur-fleraarige:** permakultur.no (lokallag, diplomholdere, skoghager-kart), kvann.no (Schübeler-hager, planteklubber), solhatt.no, oekoguiden (planteskoler/skogshage), efferus.no-type LAND-sentre.
- **institusjon-finansiering:** NIBIO, NORSØK, NMBU/SLU, Ruralis, Debio, Innovasjon Norge (Utviklingsprogrammet), Forskningsrådet/CORDIS (EU-prosjekter), Brreg (NACE-koder for relevante org).

**Agent-fanout** (fyll praktikerlaget; streng «ikke gjett»-instruks):
- Per celle: kjør målrettede søk for navngitte aktører i underdomenet som registrene ikke fanger. Hver kandidat MÅ ha en hentet lokator-URL, ellers droppes den.

---

## 5. Kandidat-CSV, dedup & review-kø

**Kandidat-CSV (16 kolonner, eksakt header):**
```
node_id,name,node_type,domain,subdomain,country,description,key_people,scale_metric_year,org_nr,locator_url,sourceClass,verificationStatus,confidence,accessedAt,notes
```
- `node_id`: unik kebab-slug, ingen kollisjon med eksisterende `Actor.slug`.
- `node_type`: `organisasjon|person|nettverk|gaard|institusjon|prosjekt|ordning`. (`person` → PersonProfile.)
- `domain`/`subdomain`/`country` per celle.
- Siter felt med komma. Tomme felt der ikke sikkert kildebelagt.

**Dedup (obligatorisk før import):** match `node_id`/navn mot `Actor.slug`/`Actor.name`, `org_nr` mot `Company.orgNr`, person mot `PersonProfile.personKey`. Treff → berik-eksisterende (importeren legger til themeTags additivt; klobb aldri kuraterte felter). Aldri opprett duplikat.

**Review-kø:** append hver importert node til `research/_status/domene-review-koe-<dato>.csv` med:
```
node_id,domain,subdomain,verificationStatus,locator_url,kilde-type,begrunnelse,flagg-for-menneske
```
`flagg-for-menneske = ja` når: status er `machine_verified` via sekundærkilde, org.nr mangler men forventes, eller lokator er ustabil/social-media. Dette er det du etterkontrollerer.

---

## 6. Verifiseringsvakter (erstatter menneskelig før-gate) — BALANSERT posture

Håndhev maskinelt, per node:
1. **Lokator påkrevd:** ingen hentet `locator_url` → **dropp noden** (aldri gjett, aldri import uten kilde).
2. **`machine_verified` KUN når** lokator er aktørens egen side ELLER et anerkjent register (Brreg, Debio/økoguiden, offisiell paraply-subside, CORDIS/Erasmus+ for EU-prosjekt) **og** siden ble hentet og bekrefter eksistens. REKO-ringer: deres Facebook-gruppe er kanonisk → `machine_verified` tillatt.
3. **Rene agent-web-funn** (blogg, presse, omtale uten register/egen-side) → `verificationStatus=unverified`, `confidence` ≤ middels.
4. **Org.nr:** hvis oppgitt, valider mot Brreg (`https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>`); navn skal matche og enheten ikke være slettet. Mismatch → fjern org.nr og sett `unverified`.
5. **Aldri** sett `disputed`/`human_verified` autonomt. `disputed` reserveres for eksplisitt motstrid (da: importer som `disputed`, flagg i review-kø, hold ute av whitepaper).
6. **Norden-noder:** kun hvis de kobler til en norsk aktør; sett `country` korrekt (de teller ikke i NO-cellene, kun som kontekst).

---

## 7. Stopp- og sikkerhetsvakter

Stopp å starte nye celler når **noen** av disse inntreffer:
- Alle NO-celler er mettet (§2).
- Token-/tidsbudsjett nær slutt (la marg til §8-rapport + commit + PR).
- Hard backstop: 250 nye noder importert denne kjøringen.
- 2 påfølgende celler gir 0 nye noder etter både registreringspass og fanout (feltet er tynt → rapporter og stopp).

**Sikkerhet:** lokal DB only; ingen Prisma-schema-endring (alt via themeTags/metadata); ingen rå PDF/filer ≥50 MB committet; ingen prod-import. Ved import-feil (unik-constraint, manglende felt): STOPP cellen, logg feilen, gå videre til neste celle — improviser aldri schema/datafiks.

---

## 8. Output & avslutning

Per kjøring skal disse finnes (committet):
- Oppdatert `research/_status/domene-dekningsbok.csv` + `public/data/coverage/domene-profiles.json` + hull-rapport.
- Per-celle kandidat-CSV-er + mottakslogger i `research/_status/`.
- `research/_status/domene-review-koe-<dato>.csv` (din etterkontroll-liste).
- `research/_status/domene-usikkerhetslogg-<dato>.md`: noder droppet (kildeløse), `disputed`-funn, celler som traff cap/backstop, tynne celler.

**Sluttrapport (skriv til mottakslogg + PR-beskrivelse):**
- Noder per celle (nye vs. berik-eksisterende), dekningsdelta per celle (før→etter, gap-reduksjon).
- Hvor mange `machine_verified` vs. `unverified`, og hvor mange flagget for menneske.
- Celler som nådde gulv vs. som gjenstår (neste kjørings arbeidsliste).
- Stopp-årsak.

**Verifiseringsbatteri før PR** (alle skal være rene):
```
npm run db:audit
npm run db:audit:strict-sources        # kjør fra full checkout
npm run audit:research-artifacts -- --base=origin/main
npm run gate:overclaim
npx tsc --noEmit -p tsconfig.json
```
Åpne PR mot `main`. **Bekreft full `npm run build` i CI** (kjør ikke i /tmp-worktree — Turbopack følger ikke node_modules-symlink). Deploy via Coolify/`justaride` — aldri Vercel.

---

## 9. Definition of Done (sjekkliste)

- [ ] Dekningsboka utvidet med alle 4 domeners NO-celler m/ univers-anslag.
- [ ] Hver bearbeidet celle: kandidat-CSV + import + mottakslogg + dekningsdelta + commit.
- [ ] Alle nye noder har hentet lokator; kildeløse droppet og logget.
- [ ] `machine_verified` kun der §6 tillater; org.nr Brreg-validert; resten `unverified`.
- [ ] Review-kø + usikkerhetslogg skrevet.
- [ ] Alle NO-celler mettet ELLER stopp-årsak (§7) dokumentert med gjenstående arbeidsliste.
- [ ] Verifiseringsbatteriet rent; PR åpnet; ingen rå binær/prod-import i diff.

---

## 10. Faste forbehold (carry-over)

SUM ≠ NMBU (UiO). «Maad seeds» finnes ikke (= KVANN). REKO Danmark = negativt funn (ikke aktiv node). Multistrata Agroforestry = `disputed` til KVANN bekrefter EU-prosjekt-ID. REKO Sverige = 2021-tall siste primær. Demeter Norge i krise (12 gårder 2025, fryst) — forsiktig formulering. Eksisterende kuraterte maktkart-aktører berikes additivt, aldri klobbes.
