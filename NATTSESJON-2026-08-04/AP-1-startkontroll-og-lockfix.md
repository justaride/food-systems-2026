# AP-1 — Startkontroll og fiks av `package-lock.json` (funn F1)

**Type:** Kode, liten
**Estimat:** 20–40 min
**Avhenger av:** ingenting
**Blokkerer:** AP-2, AP-3, AP-5
**Gren:** `codex/nordic-knowledge-canonical-v1` (det eksisterende worktreet — ikke lag et nytt)

---

## Hvorfor denne pakken finnes

To ting i én:

**Startkontrollen.** Ingenting annet i natt betyr noe hvis grunnlaget har flyttet seg siden pausen. QA-en 3. august beviste at korpuset var byte-eksakt i sync med registeret. Du bekrefter at det fortsatt stemmer, før noen andre agenter rører noe.

**F1.** `npm ci` feiler på grenens committede tilstand. `package-lock.json` mangler den nøstede oppføringen `node_modules/next-intl/node_modules/@swc/helpers@0.5.23`. Årsaken: `next-intl` 4.13.0 trekker inn `@swc/core`, som krever `@swc/helpers >= 0.5.17`. Rotversjonen er 0.5.15, låst via en override fra Next, og tilfredsstiller ikke kravet — så npm trenger en nøstet kopi, men lock-filen beskriver den ikke.

På Gabriels Mac maskeres dette fullstendig, fordi `node_modules` allerede finnes og fungerer. Konsekvensen viser seg først ved en ren klone: **kontrollpakken kan ikke reproduseres fra bunnen av.** Det undergraver hele poenget med en portabel kontrollpakke, og det vil bite når AP-5 lager nye worktrees som skal installere avhengigheter fra scratch.

Dette er en liten, veldefinert fiks med et verifiserbart resultat. Derfor står den først.

---

## Agentprompt (lim inn ordrett)

```
Du arbeider i Food Systems 2026 på grenen codex/nordic-knowledge-canonical-v1.
Les først /Users/gabrielfreeman/Documents/Food Systems 2026/NATTSESJON-2026-08-04/00-BRIEF-NATTSESJON.md
i sin helhet, spesielt §2 (ufravikelige stoppregler).

Arbeidskatalog:
/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1

Oppgaven din er AP-1: startkontroll og fiks av package-lock.json.
Følg arbeidspakken i NATTSESJON-2026-08-04/AP-1-startkontroll-og-lockfix.md steg for steg.

Kritisk: hvis kontrollpakken er rød i steg 2, stopper du HELE nattsesjonen,
skriver rapport og gjør ingenting mer. Ikke feilsøk, ikke fiks, ikke gå videre.

Skriv rapport til NATTSESJON-2026-08-04/RAPPORT-AP-1.md etter malen i briefens §7.
```

---

## Steg for steg

### Steg 1 — Bekreft utgangspunktet

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
git status --short --branch
git log -5 --oneline
git fetch origin
git rev-list --count origin/main..HEAD
git rev-list --count HEAD..origin/main
```

**Forventet:**

- gren `codex/nordic-knowledge-canonical-v1`, arbeidstreet rent
- HEAD = `3fd9849`, forrige implementasjonskontrollpost `63a6f2b`
- 37 foran `origin/main`, 0 bak

**Hvis avviket er «flere enn 0 bak»:** noen har pushet til `main` siden sist fetch. Det er ikke i seg selv farlig — noter det nøyaktige tallet i rapporten og fortsett. Ikke rebase, ikke merge.

**Hvis arbeidstreet ikke er rent:** stopp. Noter nøyaktig hvilke filer som er endret, og hvorfor du tror de er det. Gå ikke videre.

### Steg 2 — Kontrollpakken, før du endrer noe

```bash
npm run knowledge:processing-contracts:check
npm run knowledge:corpus:check
npm run knowledge:pdf-pages:check
npm run knowledge:source-analysis-input:check
npm run knowledge:validate
npx tsc --noEmit
```

**Forventet:**

| Kontroll | Forventet resultat |
|---|---|
| `processing-contracts:check` | `# tests 282  # suites 5  # pass 282  # fail 0` |
| `corpus:check` | grønn — registeret matcher repotreet |
| `pdf-pages:check` | 15 mål, 12 blokkeringer, 0 tekniske feil |
| `source-analysis-input:check` | `passed: 15 source(s), 772 page(s)` |
| `validate` | `passed (0 issues; 6948 coverage cells; 117 assessments)` |
| `tsc --noEmit` | 0 feil |

> Disse tallene er ikke pyntetall — de er kontrakten. Avviker noen av dem, avviker premisset for hele natten.

**Hvis noe er rødt: stopp nattsesjonen.** Skriv en rapport som gjengir kommandoen, hele feilmeldingen og din vurdering av hva som kan ha endret seg. Ikke fiks. Ikke gå videre. Ikke start de andre pakkene.

Merk: `knowledge:corpus:check` skal være grønn på denne maskinen. QA-en fant at 2 av 1 555 rader ikke lar seg løse på Linux (funn F7), men macOS' normaliserings-insensitive filoppslag gjør at alle løser her. Det er AP-3s tema, ikke ditt.

### Steg 3 — Reproduser F1

```bash
cd "$(mktemp -d)"
cp '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1/package.json' .
cp '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1/package-lock.json' .
npm ci 2>&1 | tail -30
```

**Forventet:** feil som peker på manglende `@swc/helpers`-oppføring under `next-intl`. Fanget output hører hjemme i rapporten — det er beviset for at fiksen faktisk fikset noe.

Rydd opp den midlertidige katalogen etterpå.

### Steg 4 — Fiks

Tilbake i worktreet:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
npm install
git diff --stat package-lock.json
git diff package-lock.json | head -80
```

**Kritisk kontroll av diffen.** Forventet endring er **kun tilføyelse** av den nøstede `@swc/helpers`-blokken. QA-en verifiserte dette ved diff 3. august.

Hvis diffen viser noe annet — versjonshopp på andre pakker, fjernede oppføringer, endret `lockfileVersion`, hundrevis av linjer — da har din `npm`-versjon oppført seg annerledes enn den som lagde lock-filen.

I så fall:

```bash
git checkout -- package-lock.json
node --version
npm --version
```

…og skriv i rapporten hvilke versjoner du har og hva diffen inneholdt. **Ikke commit en lock-fil du ikke forstår.** En skjev lock-fil er et verre problem enn den vi prøver å løse.

### Steg 5 — Verifiser fiksen

```bash
cd "$(mktemp -d)"
cp '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1/package.json' .
cp '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1/package-lock.json' .
npm ci
```

**Forventet:** installerer rent, uten feil.

### Steg 6 — Kjør kontrollpakken på nytt

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
npm run knowledge:processing-contracts:check
npx tsc --noEmit
```

Fortsatt 282/282 og 0 typefeil. Lock-filen skal ikke ha rørt oppførselen — bare beskrivelsen av den.

### Steg 7 — Commit

```bash
git add package-lock.json
git status --short          # SKAL vise nøyaktig én endret fil
git diff --cached --check   # ingen whitespace-feil
git commit -m "fix(deps): add nested @swc/helpers entry so npm ci reproduces from a clean clone

next-intl 4.13.0 pulls @swc/core, which requires @swc/helpers >=0.5.17.
The root version is override-locked at 0.5.15 by Next, so npm needs a nested
copy that the lock file did not describe. Without this, npm ci fails on a
clean clone and the portable verification suite cannot be reproduced.

Refs: QA-VALIDERING-CODEX-PAUSEPUNKT-2026-08-03.md finding F1"
git log -1 --stat
```

> **`git status --short` skal vise nøyaktig én fil.** Ser du `node_modules`, `.next` eller andre filer der, har noe gått galt med gitignore. Stopp og rapporter.

---

## Definisjon av ferdig

- [ ] Startkontrollen i steg 1 bekreftet: rent tre, riktig gren, riktig HEAD, avstand notert
- [ ] Kontrollpakken var grønn **før** endringen (282/282), med tall gjengitt i rapporten
- [ ] F1 er reprodusert og feilmeldingen fanget
- [ ] `npm ci` fungerer på den nye lock-filen i en ren katalog
- [ ] Diffen er kun tilføyelse av den nøstede `@swc/helpers`-blokken — verifisert, ikke antatt
- [ ] Kontrollpakken er fortsatt grønn **etter** endringen
- [ ] Nøyaktig én fil er committet
- [ ] Rapporten finnes og følger malen

---

## Stoppbetingelser

| Situasjon | Handling |
|---|---|
| Kontrollpakken rød i steg 2 | **Stopp hele nattsesjonen.** Rapporter. Ingen andre pakker starter. |
| Arbeidstreet skittent ved oppstart | Stopp AP-1. Rapporter nøyaktig hva som er endret. |
| Lock-diffen inneholder mer enn den ene blokken | `git checkout -- package-lock.json`, rapporter versjoner og diff. Ikke commit. |
| Kontrollpakken rød *etter* fiksen | Angre committen (`git reset --hard HEAD~1`), rapporter. |
| `npm install` vil endre `package.json` | Stopp. Det skal den ikke. Rapporter. |
