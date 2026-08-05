# Grenstrategi — anbefaling 2026-08-05

**Status ved skriving:**
- `codex/visual-system-atlas-v1` (arbeidsgren, pushet t.o.m. `9938c59`): 43 commits foran `origin/main`, 9 bak.
- `codex/nordic-knowledge-canonical-v1` (kunnskapskanonisk linje, pushet som backup): 41 commits foran `origin/main`, 16 bak.
- De to grenene deler merge-base `f7148da`. Per 2026-08-05 er alt det delte arbeidet (citations-reparasjoner, db-ops, biblioteksanalyse, research-innhold) committet på *begge* grener med likt innhold men ulike SHA. Grenene divergerer likevel: canonical har 69 commits visual-atlas mangler (knowledge/corpus, trusted events, runtime m.m.), og visual-atlas har 10 commits canonical mangler (visual system atlas, Innsiktsspor R2, nattsesjon-dokumentasjon, denne oppryddingen).

## Alternativer

### A. Merge canonical → visual-atlas (anbefalt første steg)
`git merge codex/nordic-knowledge-canonical-v1` i visual-atlas.

- **Fordeler:** Bevarer begge historikkene, ingen omskriving av pushet historikk, én integrasjonsgren å jobbe videre på. Det delte innholdet (samme blobs) merges rent; reelle konflikter begrenser seg til filer som faktisk divergerer (vault-notater, `package.json`, `scripts/obsidian-vault/*`, `content/hvitbok/03-fokusomraader.md` — ca. 40 filer).
- **Ulemper:** Merge-commit og «rotete» historikk; konfliktløsningen i vault-filene krever faglig vurdering (Innsiktsspor-R2-strøk vs. canonicals eldre vault-tilstand).

### B. Rebase visual-atlas på canonical
- **Fordeler:** Lineær, ren historikk.
- **Ulemper:** Omskriver `9938c59` som allerede er pushet → krever force-push. De 10 commitene må replayes over 69 fremmede commits med samme konfliktflate som A, men fordelt per commit. Høyere risiko, ingen reell gevinst før main-integrasjon er avklart.

### C. PR begge grener til main uavhengig
- **Fordeler:** Enkel mental modell per gren.
- **Ulemper:** Garanterte konflikter i PR nr. 2 over hele det delte citations/db-området, fordi samme innhold nå finnes med ulike SHA på begge grener. Frarådes.

### D. Gjør canonical til eneste integrasjonsgren, cherry-pick visual-arbeid dit
- **Fordeler:** Canonical er den mest komplette linjen (kunnskapsbase + runtime); cherry-pick av de 10 visual-commitene er overkommelig.
- **Ulemper:** Motsatt vei av dagens arbeidsflyt (visual-atlas er aktiv arbeidsgren med app/visualisering); cherry-pick gir nye SHA og samme konflikter.

## Anbefalt rekkefølge

1. **Ikke rør `main` ennå.** Begge grener er bak `origin/main` (9/16 commits) — det er uavklart om main har beveget seg i en retning som påvirker begge.
2. **Alternativ A først:** merge `codex/nordic-knowledge-canonical-v1` inn i `codex/visual-system-atlas-v1`. Løs konflikter i vault og `package.json` med Innsiktsspor-R2 som strengeste faktagrunnlag (strøkne tall skal ikke gjeninnføres).
3. **Kjør full kontrollpakke** (`npm run verify:platform-stack-main`) på den merged grenen.
4. **Deretter:** merge `origin/main` inn i visual-atlas (eller PR visual-atlas → main) når eier har avklart M17/M18-status og de ~1 555 ventende eierbeslutningene fra nattsesjonen ikke lenger blokkerer.
5. **Etter vellykket integrasjon:** arkiver canonical-grenen (tagg den, slett ikke) slik at én linje bærer videre arbeid.

**Åpent spørsmål til eier:** skal `main` være målet i det hele tatt før kontraktsstatus (M17/M18) er avklart? Hvis prosjektet fortsetter på egen hånd, kan visual-atlas like gjerne være den varige hovedgrenen.
