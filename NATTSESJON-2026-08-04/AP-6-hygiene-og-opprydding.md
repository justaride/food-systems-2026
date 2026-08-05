# AP-6 — Hygiene og opprydding (funn F3, F4, F5)

**Type:** Drift og dokumentasjon
**Estimat:** 30–60 min
**Avhenger av:** AP-2 fullført
**Gren:** dels ingen (worktree-administrasjon), dels `codex/nattsesjon-ap6-hygiene`

---

## Hvorfor denne pakken finnes

Tre mindre funn fra QA-en som ikke haster hver for seg, men som til sammen utgjør reell forvekslingsrisiko når to Codex-arbeidslinjer løper parallelt i samme repo.

**F5 — overføringsfiler.** QA-en kunne ikke slette filer på Gabriels disk, bare flytte dem. De ligger i `tmp/_TIL-SLETTING-qa-transfer/` inne i worktreet — målt til **420 MB** ved kontroll 4. august (QA-rapporten anslo ~433 MB; bruk den målte verdien). Katalogen er gitignorert, så git-status er upåvirket — men det er en tredjedels gigabyte som ingen trenger.

**F4 — forlatte worktree-oppføringer og skitten hovedutsjekk.** Det finnes **tre** administrative worktree-oppføringer uten levende tre, ikke én som QA-rapporten antydet:

| Oppføring | Tilstand | Kan `prune` fjerne den? |
|---|---|---|
| `food-systems-corpus-phase1.x4ABYO` | peker på `/private/tmp/...`, katalogen er borte | Ja |
| `validate-ftg` | **låst** (`locked`-fil finnes) | Nei — prune hopper over låste trær med vilje |
| `validate-ftg1` | **låst** | Nei |

De to låste er trolig låst av en grunn noen en gang hadde. Du skal **ikke** låse dem opp, og ikke bruke `--expire` for å tvinge dem bort. Rapporter dem, så avgjør Gabriel.

Hovedutsjekken i prosjektroten står i tillegg på `codex/visual-system-atlas-v1` med mange ukommitterte endringer.

**F3 — udokumentert macOS-kobling.** Kontrollpakken forutsetter macOS-filsystemlayout: testen som avviser symlenkede eksterne røtter forutsetter at `/var/db` er en symlenke til `/private/var/db`. På Linux finnes ikke stien, og testen feiler med `ENOENT` i stedet for den forventede avvisningen. Dette er en bevisst beslutning så lenge produksjonsmiljøet er denne maskinen — men den står ikke skrevet noe sted. En udokumentert antakelse er en felle for den neste som prøver å kjøre pakken i CI.

---

## Kritisk avgrensning: den skitne grenen er ikke din

`codex/visual-system-atlas-v1` inneholder ukommittert arbeid som ikke er en del av dette pausepunktet. Du skal **inventere den, ikke rydde den.**

Å committe noens ukommitterte arbeid er å ta en beslutning på deres vegne om hva som hører sammen. Å stashe det er å gjøre det vanskeligere å finne igjen. Å forkaste det er utenkelig.

**Du skal derfor ikke:** committe, stashe, forkaste, bytte gren i hovedutsjekken, eller kjøre noen kommando i prosjektroten som endrer arbeidstreet.

**Du skal:** liste hva som er der, gruppere det logisk, og legge et forslag på Gabriels bord.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026. Les først
NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md, spesielt §2.

Oppgaven din er AP-6: hygiene og opprydding etter funn F3, F4 og F5.

ABSOLUTT FORBUDT:
- å committe, stashe, forkaste eller på annen måte endre ukommitterte endringer
  på grenen codex/visual-system-atlas-v1 i prosjektroten
- å bytte gren i hovedutsjekken
- å slette worktrees som andre nattagenter bruker
- å slette noe utenfor tmp/_TIL-SLETTING-qa-transfer/

Følg NATTSESJON-2026-08-04/AP-6-hygiene-og-opprydding.md.
Skriv rapport til NATTSESJON-2026-08-04/RAPPORT-AP-6.md.
```

---

## Steg for steg

### Steg 1 — F5: slett overføringsfilene

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'

# Bekreft hva som ligger der FØR du sletter
du -sh tmp/_TIL-SLETTING-qa-transfer/
ls -la tmp/_TIL-SLETTING-qa-transfer/
find tmp/_TIL-SLETTING-qa-transfer/ -type f | head -40
find tmp/_TIL-SLETTING-qa-transfer/ -type f | wc -l
```

**Kontroller før sletting** — og gjengi kontrollen i rapporten:

- katalogen inneholder kun QA-overføringsartefakter (tarballer og utpakket kopi), ~433 MB
- den er gitignorert: `git check-ignore -v tmp/_TIL-SLETTING-qa-transfer/` skal gi treff
- ingenting der er sporet: `git ls-files tmp/_TIL-SLETTING-qa-transfer/` skal være tomt

Merk at `tmp/pdfs/` også finnes i samme katalog. **Den skal ikke slettes** — kun `_TIL-SLETTING-qa-transfer`.

```bash
rm -rf tmp/_TIL-SLETTING-qa-transfer/
ls -la tmp/
git status --short          # skal fortsatt være rent
df -h /                     # noter frigjort plass
```

### Steg 2 — F4: rydd forlatte worktree-oppføringer

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026'
git worktree list
ls .git/worktrees/
```

Du vil se de aktive trærne, nattsesjonens nye trær, og de tre forlatte oppføringene i tabellen over.

**Kontroller først at det prunbare faktisk er dødt:**

```bash
ls -la /private/tmp/food-systems-corpus-phase1.* 2>/dev/null || echo "katalogen finnes ikke — trygt a prune"
```

**Bekreft låsestatusen på de to andre — ikke fjern låsen:**

```bash
ls .git/worktrees/validate-ftg/ .git/worktrees/validate-ftg1/
cat .git/worktrees/validate-ftg/locked 2>/dev/null   # en evt. begrunnelse ligger her
```

`git worktree prune` fjerner kun administrative oppføringer for trær som ikke lenger finnes på disk, og hopper over låste. Den rører ikke eksisterende trær. Vær eksplisitt likevel:

```bash
git worktree prune --dry-run -v   # se nøyaktig hva som fjernes
git worktree prune -v
git worktree list                 # bekreft at nattsesjonens trær står igjen
ls .git/worktrees/                # validate-ftg og validate-ftg1 skal fortsatt være der
```

**Kritisk:** verifiser i outputen at `nordic-knowledge-canonical-v1`, `nordic-knowledge-foundation-v1` og alle nattsesjonens nye trær fortsatt står i listen — og at de to låste oppføringene er urørt.

**Ikke** bruk `git worktree unlock`, `git worktree remove --force` eller `git worktree prune --expire`. Rapporter de to låste med det du fant i `locked`-fila, og la Gabriel avgjøre.

### Steg 3 — F4: inventer den skitne grenen (kun lesing)

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026'
git status --short --branch > /tmp/ap6-dirty-inventory.txt
git status --short | wc -l
git status --short | awk '{print $1}' | sort | uniq -c   # fordeling: M, ??, D osv.
git stash list
git log -3 --oneline
```

Grupper endringene tematisk — workflows, Obsidian-filer, Dockerfile, og så videre — og skriv opp:

- hvor mange filer i hver gruppe
- om gruppen ser ut som pågående arbeid eller som tilfeldig avfall (byggeartefakter, `.DS_Store`, redigeringsrester)
- om noe er slettet (`D`) — det er alltid verdt egen oppmerksomhet
- om noe usporet (`??`) burde vært i `.gitignore`

**Ikke endre noe.** Leveransen er en tabell i rapporten, med et forslag til hvordan Gabriel kan parkere linjen ryddig.

### Steg 4 — F3: dokumenter macOS-antakelsen

Dette er den eneste delen av AP-6 som gir en commit. Gjør den på egen gren:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git worktree add ../nattsesjon-ap6-hygiene -b codex/nattsesjon-ap6-hygiene
cd ../nattsesjon-ap6-hygiene
```

Legg til en seksjon i `knowledge/corpus/README.md` (eventuelt et eget dokument hvis README-en ikke egner seg — vurder selv) som dokumenterer:

- kontrollpakken forutsetter macOS-filsystemlayout
- konkret: testen `rejects user-owned and symlinked external roots …` forutsetter at `/var/db` er en symlenke til `/private/var/db`
- den eksterne ankerstien `/private/var/db/...` er macOS-spesifikk
- på Linux feiler testen med `ENOENT` framfor forventet symlenke-avvisning; QA-en 3. august bekreftet at den går 10/10 grønn så snart layouten replikeres
- konsekvens: «portabel kontrollpakke» betyr i praksis «portabel på macOS»
- dette er en bevisst beslutning så lenge produksjonsmiljøet er arbeidsstasjonen, men må adresseres før CI eller Linux-drift
- kryssreferanse til funn F7 (Unicode-normalisering), som er den andre plattformbindingen

Hold det saklig og kort. Dette er en advarsel til framtidige lesere, ikke et essay.

Vurder også, og *foreslå* i rapporten uten å implementere: en layoutsjekk tidlig i testfilen som gir en tydelig feilmelding («denne testen forutsetter macOS-layout: /var/db → /private/var/db») framfor et bart `ENOENT`. Det ville spare den neste personen for en times feilsøking. Grunnen til at du bare foreslår: testfilene inngår i `codeBindings`-konvolutten, og endringer der krever ny gjennomgang.

```bash
npm install
npm run knowledge:processing-contracts:check   # 282/282, uendret
git add knowledge/corpus/README.md
git status --short                              # nøyaktig én fil
git commit -m "docs(corpus): document the macOS filesystem assumption in the verification suite

The contract suite assumes macOS layout: the external-root rejection test
requires /var/db to be a symlink to /private/var/db, and the anchor path
/private/var/db/... is macOS-specific. On Linux the test fails with ENOENT
instead of the expected symlink rejection. 'Portable verification suite'
therefore means 'portable on macOS' until this is addressed.

Refs: QA-VALIDERING-CODEX-PAUSEPUNKT-2026-08-03.md finding F3"
```

---

## Definisjon av ferdig

- [ ] `tmp/_TIL-SLETTING-qa-transfer/` (420 MB) er slettet, med forkontroll dokumentert; `tmp/pdfs/` (4,4 MB) står igjen
- [ ] Frigjort diskplass er notert
- [ ] `git worktree prune` er kjørt med `--dry-run` først; alle aktive trær står igjen — verifisert i output
- [ ] De to låste oppføringene `validate-ftg` og `validate-ftg1` er rapportert, ikke låst opp
- [ ] Den skitne grenen er inventert og gruppert, **uten** at noe er endret
- [ ] macOS-antakelsen er dokumentert og committet på egen gren
- [ ] Kontrollpakken er fortsatt 282/282
- [ ] `git status` er rent i den kanoniske grenen
- [ ] Rapporten finnes, med inventartabellen og forslaget om layoutsjekk

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| `tmp/_TIL-SLETTING-qa-transfer/` inneholder noe som ikke ser ut som QA-overføring | Ikke slett. Rapporter innholdet. |
| Noe der er sporet av git | Ikke slett. Rapporter. |
| `worktree prune --dry-run` vil fjerne et tre som finnes på disk | Ikke kjør prune. Rapporter. |
| Du fristes til å låse opp `validate-ftg` / `validate-ftg1` | Nei. Låsen er noens beslutning. Rapporter innholdet i `locked`-fila. |
| Du fristes til å committe den skitne grenen | Nei. Det er Gabriels arbeid. |
| README-endringen gjør kontrollpakken rød | Umulig i teorien. Skjer det, angre og rapporter — da er noe annet galt. |
