# Food TG R13 risk closeout

**Dato:** 2026-06-25
**Scope:** Oppfølging av gjenværende risiko fra R13 QC-closeout.
**Regel:** Intern kontroll. Ingen DB-skriving, ingen claim-åpning, ingen commit.

## Kort dom

De gjenværende risikoene er gjennomgått og flyttet fra løse risikopunkter til kontrollerte arbeidsflater:

1. PCQ-risikoen er redusert med `r13-pcq-first-pass-2026-06-25.md`.
2. Actor-gate-risikoen er redusert med `r13-actor-gate-action-packet-2026-06-25.md`.
3. Commit-/lekkasjerisikoen er fortsatt styrt av `r13-commit-gate-2026-06-25.md`; ingen staging eller commit er gjort.
4. Neste session er forberedt i `docs/project/mandates/food-tg-r13-next-session-commit-pcq-actor-prompt-2026-06-25.md`.

Det som fortsatt står igjen, er ikke desk-completable i denne runden uten å bryte gate-reglene: claim-lock krever radvis uttrekk/metodearbeid etter PCQ, og actor-gate krever aktør-/registerdata eller menneskelig oppfølging.

## Risiko etter oppfølging

| Risiko fra QC | Tiltak gjort | Status etter tiltak | Neste ansvar |
|---|---|---|---|
| PCQ-rader har sterke A-kilder, men mangler primærkontroll | Top 8 fikk live locator-sjekk, kontrollkort, tillatt intern formulering og claim-lock-stopp | Redusert; ikke claim-locket | neste PCQ-arbeidspakke |
| Actor-gate-rader mangler aktiv-status, volum, register/nodeinfo eller avtaledata | Seks actor-gate-rader fikk ask-matrise, dataminimum og stoppsignal | Redusert; fortsatt actor-gate | menneske/aktør/register |
| Forståelse/internal kan forveksles med kilde | Closeout markerer at disse styrer arbeid, men ikke siteres eksternt | Kontrollert | behold i intake/QC |
| ASCII-normalisert tekst i enkelte output-filer | Ikke rettet i denne runden fordi det ikke påvirker schema/QC og ville være kosmetisk | Lav, akseptert | eventuell senere språkvask |
| Hovedcheckout har unrelated dirty state | Ikke rørt; arbeidet holdt i `.worktrees/food-tg-research-r13` | Kontrollert | ikke stage/commit fra hovedcheckout |
| Neste session kan starte fra utdatert QC-handoff | Ny continuation prompt er laget, og gammel QC-prompt er markert superseded | Kontrollert | bruk ny prompt |

## Stopppunkt

Ikke gå videre til claim-lock, figurer, deck, whitepaper eller DB uten ny eksplisitt beskjed og en egen kontrollrunde. R13 er nå sterkere som intern research- og gatepakke, men ikke som ekstern faktapakke.
