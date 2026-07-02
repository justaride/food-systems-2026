---
status: codex-utkast-krever-menneskelig-godkjenning
dato: 2026-07-02
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md
base: codex/obsidian-kunnskapskart-m1-2026-07-02
---

# Obsidian kunnskapskart M2-utkast

Dette notatet beskriver Codex-utkastet for M2: innholdsløft der teksten foreslås av Codex, men må godkjennes av menneske før den regnes som kuratert eller eksternbrukbar.

## Hva sync legger inn

`npm run vault:sync` legger nå inn godkjenningsmerkede, styrte M2-seksjoner i:

- 6 innsiktsnoter: I27, I31, I34, I36, I37 og I38. Hver får både `Tallgrunnlag og forbehold` og `M2 selvbærende utkast`.
- 31 selskapsnoter under `Food Systems Obsidian/11 Maktkart/Selskaper/`.

Seksjonene legges over `## Notater` med `applyManagedSection`, slik at menneskelige notater fortsatt bevares byte-for-byte ved sync.

## Menneskeporter som fortsatt er åpne

- I27-I38 må leses i reviewprotokollen før de kan flyttes fra utkast til godkjent posisjon.
- I28-I35 er fortsatt parkerte kandidater og skal ikke avgjøres automatisk av Codex.
- Selskapsseksjonene er posisjonstekst-utkast, ikke ferdig ekstern claim language.
- Stakeholder-feltene `ask`, `prioritet` og `relasjon` er fortsatt menneskeoppgave.

## Review-sjekkliste

- Sjekk at tall i I27, I31, I34, I36, I37 og I38 stemmer med lenket kilde.
- Godkjenn, juster eller dropp hver posisjonstekst for kjerneaktørene.
- Flytt bare godkjente formuleringer videre til ekstern rapport, hvitbok eller presentasjon etter claim-lock.
- La `vault:review-closeout` forbli rød inntil VK-5 faktisk er lukket av menneske + Claude.
